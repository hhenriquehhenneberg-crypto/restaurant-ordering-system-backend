import { randomUUID } from "node:crypto";
import { Request, Response } from "express";
import { database } from "../database/connection";

export class CategoryController {
  async list(_req: Request, res: Response) {
    const result = await database.query(
      `select * from categories where active = true order by display_order, name`
    );

    return res.json(result.rows);
  }

  async create(req: Request, res: Response) {
    const { name, description = null, icon = null, display_order } = req.body;

    if (!name || display_order === undefined) {
      return res.status(400).json({
        message: "name e display_order são obrigatórios",
      });
    }

    const id = randomUUID();

    const result = await database.query(
      `insert into categories (id, name, description, icon, display_order)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [id, name, description, icon, display_order]
    );

    return res.status(201).json(result.rows[0]);
  }
}
