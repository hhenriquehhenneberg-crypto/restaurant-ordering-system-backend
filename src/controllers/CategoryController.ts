import type { Request, Response } from "express";
import { CategoryModel } from "../models/Category";
import { isUuid, parseCategory } from "../utils/validation";

export class CategoryController {
  async list(_req: Request, res: Response) {
    try {
      return res.status(200).json(await CategoryModel.list());
    } catch (error) {
      console.error("Erro ao listar categorias:", error);
      return res.status(500).json({ message: "Erro interno ao listar categorias." });
    }
  }
  async search(req: Request, res: Response) {
    const keyword = req.query.keyword;
    if (typeof keyword !== "string" || !keyword.trim() || keyword.length > 80) {
      return res.status(400).json({ message: "keyword deve ter de 1 a 80 caracteres." });
    }
    try {
      return res.status(200).json(await CategoryModel.search(keyword.trim()));
    } catch (error) {
      console.error("Erro na pesquisa de categorias:", error);
      return res.status(500).json({ message: "Erro interno ao pesquisar categorias." });
    }
  }
  async get(req: Request, res: Response) {
    const id = req.params.id;
    if (!isUuid(id)) return res.status(400).json({ message: "UUID de categoria inválido." });
    try {
      const category = await CategoryModel.get(id);
      return category ? res.json(category) : res.status(404).json({ message: "Categoria não encontrada." });
    } catch (error) {
      console.error("Erro ao consultar categoria:", error);
      return res.status(500).json({ message: "Erro interno ao consultar categoria." });
    }
  }
  async create(req: Request, res: Response) {
    const parsed = parseCategory(req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.error });
    try {
      return res.status(201).json(await CategoryModel.create(parsed.value));
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      return res.status(500).json({ message: "Erro interno ao criar categoria." });
    }
  }
  async update(req: Request, res: Response) {
    const id = req.params.id;
    if (!isUuid(id)) return res.status(400).json({ message: "UUID de categoria inválido." });
    const parsed = parseCategory(req.body, true);
    if (!parsed.ok) return res.status(400).json({ message: parsed.error });
    try {
      const category = await CategoryModel.update(id, parsed.value);
      return category ? res.json(category) : res.status(404).json({ message: "Categoria não encontrada." });
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      return res.status(500).json({ message: "Erro interno ao atualizar categoria." });
    }
  }
  async remove(req: Request, res: Response) {
    const id = req.params.id;
    if (!isUuid(id)) return res.status(400).json({ message: "UUID de categoria inválido." });
    try {
      const removed = await CategoryModel.remove(id);
      return removed ? res.status(204).end() : res.status(404).json({ message: "Categoria não encontrada." });
    } catch (error) {
      if ((error as { code?: string }).code === "23503") {
        return res.status(409).json({
          message: "Esta categoria ainda possui produtos. Remova ou transfira os produtos antes."
        });
      }
      console.error("Erro ao remover categoria:", error);
      return res.status(500).json({ message: "Erro interno ao remover categoria." });
    }
  }
}
