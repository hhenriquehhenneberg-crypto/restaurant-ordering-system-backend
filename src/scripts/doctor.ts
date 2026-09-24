import "dotenv/config";
import { database } from "../database/connection";

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente. Configure seu .env local.");
  let host: string;
  try {
    const parsed = new URL(url);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
      throw new Error("Protocolo inválido.");
    }
    host = parsed.hostname; // Host é público; nunca exiba usuário, senha ou URI.
  } catch {
    throw new Error("DATABASE_URL inválida: use a Connection string PostgreSQL do Supabase.");
  }
  const res = await database.query<{
    database_name: string;
    categories: string;
    products: string;
  }>(
    "select current_database() as database_name, " +
    "(select count(*)::text from public.categories) as categories, " +
    "(select count(*)::text from public.products) as products"
  );
  console.log("Conexão PostgreSQL: OK");
  console.log("Servidor:", host);
  console.log("Banco:", res.rows[0].database_name);
  console.log("Categorias:", res.rows[0].categories);
  console.log("Produtos:", res.rows[0].products);
  console.log("Sem inserções ou alterações. Pronto para npm run dev.");
}
main().catch((error: unknown) => {
  const e = error as { code?: string; message?: string };
  console.error("Falha ao verificar a conexão. Código:", e.code ?? "desconhecido");
  console.error("Verifique a senha, a URI Session pooler, o SSL e as tabelas do banco.");
  process.exitCode = 1;
}).finally(() => database.end());
