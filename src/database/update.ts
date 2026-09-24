import { database } from "./connection";

// Nomes de tabelas e colunas vêm exclusivamente dos Models e de campos validados.
export async function updateRow(
  table: "categories" | "products", id: string, patch: Record<string, unknown>
) {
  const keys = Object.keys(patch);
  const assignments = keys.map((key, index) => '"' + key + '" = $' + (index + 1));
  const query = 'update ' + table + ' set ' + assignments.join(", ") +
    ', updated_at = now() where id = $' + (keys.length + 1) + ' returning *';
  const result = await database.query(query, [...keys.map(key => patch[key]), id]);
  return result.rows[0] ?? null;
}
