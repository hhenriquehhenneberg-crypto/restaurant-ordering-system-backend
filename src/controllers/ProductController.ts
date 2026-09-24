import type { Request, Response } from "express";
import { CategoryModel } from "../models/Category";
import { ProductModel } from "../models/Product";
import { isUuid, parseProduct } from "../utils/validation";

export class ProductController {
  async list(req: Request, res: Response) {
    const filter = req.query.category_id;
    if (filter !== undefined && !isUuid(filter)) {
      return res.status(400).json({ message: "category_id deve ser um UUID válido." });
    }
    try {
      return res.status(200).json(await ProductModel.list(filter as string | undefined));
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      return res.status(500).json({ message: "Erro interno ao listar produtos." });
    }
  }
  async get(req: Request, res: Response) {
    const id = req.params.id;
    if (!isUuid(id)) return res.status(400).json({ message: "UUID de produto inválido." });
    try {
      const product = await ProductModel.get(id);
      return product ? res.json(product) : res.status(404).json({ message: "Produto não encontrado." });
    } catch (error) {
      console.error("Erro ao consultar produto:", error);
      return res.status(500).json({ message: "Erro interno ao consultar produto." });
    }
  }
  async create(req: Request, res: Response) {
    const parsed = parseProduct(req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.error });
    try {
      if (!(await CategoryModel.existsActive(parsed.value.category_id!))) {
        return res.status(400).json({ message: "Categoria inexistente ou inativa." });
      }
      return res.status(201).json(await ProductModel.create(parsed.value));
    } catch (error) {
      if ((error as { code?: string }).code === "23503") {
        return res.status(409).json({ message: "Categoria não existe mais." });
      }
      console.error("Erro ao criar produto:", error);
      return res.status(500).json({ message: "Erro interno ao criar produto." });
    }
  }
  async update(req: Request, res: Response) {
    const id = req.params.id;
    if (!isUuid(id)) return res.status(400).json({ message: "UUID de produto inválido." });
    const parsed = parseProduct(req.body, true);
    if (!parsed.ok) return res.status(400).json({ message: parsed.error });
    try {
      if (parsed.value.category_id &&
          !(await CategoryModel.existsActive(parsed.value.category_id))) {
        return res.status(400).json({ message: "Categoria inexistente ou inativa." });
      }
      const product = await ProductModel.update(id, parsed.value);
      return product ? res.json(product) : res.status(404).json({ message: "Produto não encontrado." });
    } catch (error) {
      if ((error as { code?: string }).code === "23503") {
        return res.status(409).json({ message: "Categoria não existe mais." });
      }
      console.error("Erro ao atualizar produto:", error);
      return res.status(500).json({ message: "Erro interno ao atualizar produto." });
    }
  }
  async remove(req: Request, res: Response) {
    const id = req.params.id;
    if (!isUuid(id)) return res.status(400).json({ message: "UUID de produto inválido." });
    try {
      const removed = await ProductModel.remove(id);
      return removed ? res.status(204).end() : res.status(404).json({ message: "Produto não encontrado." });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      return res.status(500).json({ message: "Erro interno ao excluir produto." });
    }
  }
}
