import { randomUUID } from "node:crypto";
import { Request, Response } from "express";
import { database } from "../database/connection";

export class ProductController {
  async list(_req: Request, res: Response) {
    try {
      const result = await database.query(
        `select
           p.id,
           p.category_id,
           c.name as category_name,
           p.title,
           p.description,
           p.price,
           p.image,
           p.available,
           p.active,
           p.created_at,
           p.updated_at
         from products p
         inner join categories c on c.id = p.category_id
         where p.active = true and c.active = true
         order by c.display_order, p.title`
      );

      return res.json(result.rows);
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      return res.status(500).json({ message: "Erro ao buscar produtos" });
    }
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

    const productTitle = typeof title === "string" ? title.trim() : "";
    const productDescription =
      typeof description === "string" ? description.trim() : description;
    const productImage = typeof image === "string" ? image.trim() : image;
    const productPrice = Number(price);

    if (typeof category_id !== "string" || !category_id.trim()) {
      return res.status(400).json({ message: "category_id é obrigatório" });
    }

    if (!productTitle) {
      return res.status(400).json({ message: "O título do produto é obrigatório" });
    }

    if (productTitle.length > 150) {
      return res.status(400).json({ message: "O título pode ter no máximo 150 caracteres" });
    }

    if (productDescription !== null && typeof productDescription !== "string") {
      return res.status(400).json({ message: "A descrição deve ser um texto" });
    }

    if (productDescription && productDescription.length > 500) {
      return res.status(400).json({ message: "A descrição pode ter no máximo 500 caracteres" });
    }

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return res.status(400).json({ message: "O preço deve ser um número maior ou igual a zero" });
    }

    if (productImage !== null && typeof productImage !== "string") {
      return res.status(400).json({ message: "A imagem deve ser um texto com o caminho ou URL" });
    }

    if (productImage && productImage.length > 255) {
      return res.status(400).json({ message: "A imagem pode ter no máximo 255 caracteres" });
    }

    if (typeof available !== "boolean") {
      return res.status(400).json({ message: "available deve ser true ou false" });
    }

    try {
      const category = await database.query(
        `select id from categories where id = $1 and active = true`,
        [category_id]
      );

      if (category.rowCount === 0) {
        return res.status(400).json({ message: "Categoria não encontrada ou inativa" });
      }

      const id = randomUUID();

      const result = await database.query(
        `insert into products
         (id, category_id, title, description, price, image, available)
         values ($1, $2, $3, $4, $5, $6, $7)
         returning *`,
        [
          id,
          category_id,
          productTitle,
          productDescription,
          productPrice,
          productImage,
          available,
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      return res.status(500).json({ message: "Erro ao criar produto" });
    }
  }
}
