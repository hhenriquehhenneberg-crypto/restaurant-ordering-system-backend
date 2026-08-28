import { randomUUID } from "node:crypto";
import { Request, Response } from "express";
import { database } from "../database/connection";

export class ProductController {
  async list(_req: Request, res: Response) {
    const result = await database.query(
      `select * from products where active = true order by title`
    );

    return res.json(result.rows);
  }

  async create(req: Request, res: Response) {
    const {
      category_id,
      title,
      description = null,
      price,
      image = null,
      available = true,
    } = req.body;

    if (!category_id || !title || price === undefined) {
      return res.status(400).json({
        message: "category_id, title e price são obrigatórios",
      });
    }

    const category = await database.query(
      `select id from categories where id = $1 and active = true`,
      [category_id]
    );

    if (category.rowCount === 0) {
      return res.status(400).json({ message: "Categoria não encontrada" });
    }

    const id = randomUUID();

    const result = await database.query(
      `insert into products
       (id, category_id, title, description, price, image, available)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning *`,
      [id, category_id, title, description, price, image, available]
    );

    return res.status(201).json(result.rows[0]);
  }
}
