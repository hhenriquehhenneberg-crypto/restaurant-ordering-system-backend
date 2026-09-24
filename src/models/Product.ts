import { randomUUID } from "node:crypto";
import { database } from "../database/connection";
import { updateRow } from "../database/update";
import type { ProductFields } from "../utils/validation";

export interface Product extends Omit<ProductFields, "price"> {
  id: string; price: string; created_at: Date; updated_at: Date;
}
const fullProduct = String.raw`select p.*, c.name as category_name from products p
 join categories c on c.id = p.category_id`;
export class ProductModel {
  static async list(categoryId?: string) {
    const where = " where p.active = true and c.active = true" +
      (categoryId ? " and p.category_id = $1" : "");
    const result = await database.query(
      fullProduct + where + " order by c.display_order, p.title",
      categoryId ? [categoryId] : []
    );
    return result.rows as (Product & { category_name: string })[];
  }
  static async get(id: string) {
    const result = await database.query(
      fullProduct + " where p.id = $1 and p.active = true and c.active = true",
      [id]
    );
    return (result.rows[0] ?? null) as (Product & { category_name: string }) | null;
  }
  static async create(fields: Partial<ProductFields>) {
    const result = await database.query(
      "insert into products (id,category_id,title,description,price,image,available,active) values ($1,$2,$3,$4,$5,$6,$7,$8) returning *",
      [randomUUID(), fields.category_id, fields.title, fields.description ?? null,
        fields.price, fields.image ?? null, fields.available ?? true, fields.active ?? true]
    );
    return result.rows[0] as Product;
  }
  static async update(id: string, fields: Partial<ProductFields>) {
    return (await updateRow("products", id, fields)) as Product | null;
  }
  static async remove(id: string) {
    const result = await database.query("delete from products where id = $1 returning id", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
