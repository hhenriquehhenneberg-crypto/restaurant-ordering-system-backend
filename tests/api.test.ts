import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AddressInfo } from "node:net";

test("CRUD HTTP real com banco PostgreSQL isolado", {
  skip: !process.env.TEST_DATABASE_URL && "Defina TEST_DATABASE_URL para testes de integração."
}, async (t) => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL!;
  process.env.ADMIN_API_KEY = "chave-exclusiva-de-testes-com-mais-de-24-caracteres";
  const { database } = await import("../src/database/connection");
  const { default: app } = await import("../src/app");
  await database.query(readFileSync(resolve("database/schema.sql"), "utf8"));
  const server = app.listen(0);
  t.after(async () => {
    await new Promise<void>((resolveClose, reject) =>
      server.close(err => err ? reject(err) : resolveClose()));
    await database.end();
  });
  const base = "http://127.0.0.1:" + (server.address() as AddressInfo).port;
  const admin = { "content-type": "application/json", "x-admin-key": process.env.ADMIN_API_KEY };
  const call = (path: string, method = "GET", body?: unknown, useAdmin = true) =>
    fetch(base + path, {
      method,
      headers: useAdmin ? admin : { "content-type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  const categoryBody = { name: "Teste API " + Date.now(), display_order: 9, icon: "🍕" };
  assert.equal((await call("/")).status, 200);
  assert.deepEqual(await (await call("/health")).json(), { status: "ok", database: "connected" });
  assert.equal((await call("/categories", "POST", categoryBody, false)).status, 401);
  assert.equal((await call("/categories", "POST", { name: "", display_order: 1 })).status, 400);
  assert.equal((await call("/products/nao-uuid")).status, 400);

  const categoryRes = await call("/categories", "POST", categoryBody);
  assert.equal(categoryRes.status, 201);
  const category = await categoryRes.json() as { id: string };
  assert.equal((await call("/categories/" + category.id)).status, 200);
  assert.equal((await call("/categories/search?keyword=Teste%20API")).status, 200);
  const categoryUpdate = await call("/categories/" + category.id, "PUT", { display_order: 10 });
  assert.equal(categoryUpdate.status, 200);
  assert.equal((await categoryUpdate.json() as { display_order: number }).display_order, 10);

  const productBody = { category_id: category.id, title: "Pizza teste", price: 39.9 };
  const productRes = await call("/products", "POST", productBody);
  assert.equal(productRes.status, 201);
  const product = await productRes.json() as { id: string; price: string };
  assert.equal(Number(product.price), 39.9);
  const productGet = await call("/products/" + product.id);
  assert.equal(productGet.status, 200);
  assert.equal((await productGet.json() as { category_name: string }).category_name, categoryBody.name);
  assert.equal((await call("/products?category_id=" + category.id)).status, 200);
  const update = await call("/products/" + product.id, "PUT", { price: 42.5, available: false });
  assert.equal(update.status, 200);
  assert.equal((await update.json() as { available: boolean }).available, false);
  assert.equal((await call("/categories/" + category.id, "DELETE")).status, 409);
  assert.equal((await call("/products/" + product.id, "DELETE")).status, 204);
  assert.equal((await call("/categories/" + category.id, "DELETE")).status, 204);
  assert.equal((await call("/categories/" + category.id)).status, 404);
});
