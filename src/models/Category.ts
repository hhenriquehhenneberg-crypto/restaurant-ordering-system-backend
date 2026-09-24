import { randomUUID } from "node:crypto";
import { database } from "../database/connection";
import { updateRow } from "../database/update";
import type { CategoryFields } from "../utils/validation";

export interface Category extends CategoryFields {
  id: string; created_at: Date; updated_at: Date;
}
export class CategoryModel {
  static async list() {
    const result = await database.query(
      "select * from categories where active = true order by display_order, name"
    );
    return result.rows as Category[];
  }
  static async search(keyword: string) {
    const result = await database.query(
      "select * from categories where active = true and (name ilike $1 or description ilike $1) order by display_order, name",
      ["%" + keyword + "%"]
    );
    return result.rows as Category[];
  }
  static async get(id: string) {
    const result = await database.query(
      "select * from categories where id = $1 and active = true", [id]
    );
    return (result.rows[0] ?? null) as Category | null;
  }
  static async existsActive(id: string) {
    const result = await database.query(
      "select id from categories where id = $1 and active = true", [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
  static async create(fields: Partial<CategoryFields>) {
    const result = await database.query(
      "insert into categories (id,name,description,icon,display_order,active) values ($1,$2,$3,$4,$5,$6) returning *",
      [randomUUID(), fields.name, fields.description ?? null, fields.icon ?? null,
        fields.display_order, fields.active ?? true]
    );
    return result.rows[0] as Category;
  }
  static async update(id: string, fields: Partial<CategoryFields>) {
    return (await updateRow("categories", id, fields)) as Category | null;
  }
  static async remove(id: string) {
    const result = await database.query("delete from categories where id = $1 returning id", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
