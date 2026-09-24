import { createHash, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

// As leituras do cardápio são públicas; todas as operações de escrita exigem chave privada.
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    res.status(503).json({ message: "ADMIN_API_KEY não configurada no servidor." });
    return;
  }
  const received = req.header("x-admin-key");
  if (!received) {
    res.status(401).json({ message: "Chave administrativa obrigatória." });
    return;
  }
  const digest = (key: string) => createHash("sha256").update(key).digest();
  if (!timingSafeEqual(digest(received), digest(expected))) {
    res.status(403).json({ message: "Chave administrativa inválida." });
    return;
  }
  next();
}
