import test from "node:test";
import assert from "node:assert/strict";
import { isUuid, parseCategory, parseProduct } from "../src/utils/validation";

const validCategory = { name: "Pizzas", display_order: 1, icon: "🍕" };
const validProduct = {
  category_id: "11111111-1111-4111-8111-111111111111",
  title: "Margherita", price: 39.9
};
test("UUID aceita identificadores formatados e rejeita entradas incorretas", () => {
  assert.equal(isUuid(validProduct.category_id), true);
  assert.equal(isUuid("1"), false);
  assert.equal(isUuid(null), false);
});
test("categoria aceita dados mínimos e ícone Unicode", () => {
  const parsed = parseCategory(validCategory);
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(parsed.value.icon, "🍕");
});
test("categoria rejeita campos desconhecidos, strings longas e ordem decimal", () => {
  assert.equal(parseCategory({ ...validCategory, id: "arbitrario" }).ok, false);
  assert.equal(parseCategory({ ...validCategory, name: "a".repeat(101) }).ok, false);
  assert.equal(parseCategory({ ...validCategory, display_order: 1.5 }).ok, false);
});
test("produto valida UUID, preço, disponibilidade e título", () => {
  assert.equal(parseProduct(validProduct).ok, true);
  assert.equal(parseProduct({ ...validProduct, category_id: 12 }).ok, false);
  assert.equal(parseProduct({ ...validProduct, price: -1 }).ok, false);
  assert.equal(parseProduct({ ...validProduct, price: 1.111 }).ok, false);
  assert.equal(parseProduct({ ...validProduct, available: "true" }).ok, false);
  assert.equal(parseProduct({ ...validProduct, title: "" }).ok, false);
});
test("atualização parcial aceita campos permitidos, mas rejeita objeto vazio", () => {
  assert.equal(parseCategory({ active: false }, true).ok, true);
  assert.equal(parseProduct({ price: 2.5, available: false }, true).ok, true);
  assert.equal(parseCategory({}, true).ok, false);
  assert.equal(parseProduct({ id: "123" }, true).ok, false);
});
