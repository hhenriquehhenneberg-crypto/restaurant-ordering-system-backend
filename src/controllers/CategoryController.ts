import { randomUUID } from "node:crypto";
import { Request, Response } from "express";
import { database } from "../database/connection";

export class CategoryController {
  async list(_req: Request, res: Response) {
    try {
      const result = await database.query(
        `select id, name, description, icon, display_order, active, created_at, updated_at
         from categories
         where active = true
         order by display_order, name`
      );

      return res.json(result.rows);
    } catch (error) {
      console.error("Erro ao listar categorias:", error);
      return res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  }

  async create(req: Request, res: Response) {
    const { name, description = null, icon = null, display_order } = req.body;

    const categoryName = typeof name === "string" ? name.trim() : "";
    const categoryDescription =
      typeof description === "string" ? description.trim() : description;
    const categoryIcon = typeof icon === "string" ? icon.trim() : icon;
    const displayOrder = Number(display_order);

    if (!categoryName) {
      return res.status(400).json({ message: "O nome da categoria é obrigatório" });
    }

    if (categoryName.length > 100) {
      return res.status(400).json({ message: "O nome pode ter no máximo 100 caracteres" });
    }

    if (categoryDescription !== null && typeof categoryDescription !== "string") {
      return res.status(400).json({ message: "A descrição deve ser um texto" });
    }

    if (categoryDescription && categoryDescription.length > 255) {
      return res.status(400).json({ message: "A descrição pode ter no máximo 255 caracteres" });
    }

    if (categoryIcon !== null && typeof categoryIcon !== "string") {
      return res.status(400).json({ message: "O ícone deve ser um texto" });
    }

    if (categoryIcon && categoryIcon.length > 10) {
      return res.status(400).json({ message: "O ícone pode ter no máximo 10 caracteres" });
    }

    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      return res.status(400).json({
        message: "display_order deve ser um número inteiro maior ou igual a zero",
      });
    }

    try {
      const id = randomUUID();

      const result = await database.query(
        `insert into categories (id, name, description, icon, display_order)
         values ($1, $2, $3, $4, $5)
         returning *`,
        [id, categoryName, categoryDescription, categoryIcon, displayOrder]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      return res.status(500).json({ message: "Erro ao criar categoria" });
    }
  }
}
