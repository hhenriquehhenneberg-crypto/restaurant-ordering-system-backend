export type Validation<T> = { ok: true; value: T } | { ok: false; error: string };
export type CategoryFields = {
  name: string; description: string | null; icon: string | null;
  display_order: number; active: boolean;
};
export type ProductFields = {
  category_id: string; title: string; description: string | null;
  price: number; image: string | null; available: boolean; active: boolean;
};
export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

function validate<T extends object>(
  input: unknown, partial: boolean, allowed: readonly string[],
  required: readonly string[], rules: Record<string, (v: unknown) => unknown>
): Validation<Partial<T>> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Envie um objeto JSON." };
  }
  const body = input as Record<string, unknown>;
  const keys = Object.keys(body);
  if (!keys.length) return { ok: false, error: "Informe ao menos um campo." };
  for (const field of keys) {
    if (!allowed.includes(field)) return { ok: false, error: "Campo não permitido: " + field };
  }
  if (!partial) {
    for (const field of required) {
      if (!(field in body)) return { ok: false, error: "Campo obrigatório: " + field };
    }
  }
  const value: Record<string, unknown> = {};
  for (const field of keys) {
    try { value[field] = rules[field](body[field]); }
    catch (err) { return { ok: false, error: (err as Error).message }; }
  }
  return { ok: true, value: value as Partial<T> };
}
function stringField(label: string, max: number, nullable = false) {
  return (raw: unknown): string | null => {
    if (raw === null && nullable) return null;
    if (typeof raw !== "string") throw new Error(label + " deve ser texto.");
    const value = raw.trim();
    if (Array.from(value).length > max) throw new Error(label + " ultrapassa " + max + " caracteres.");
    return value;
  };
}
function requiredText(label: string, max: number) {
  const text = stringField(label, max);
  return (raw: unknown): string => {
    const value = text(raw);
    if (!value) throw new Error(label + " é obrigatório.");
    return value as string;
  };
}
function bool(label: string) {
  return (value: unknown): boolean => {
    if (typeof value !== "boolean") throw new Error(label + " deve ser true ou false.");
    return value;
  };
}
const categoryRules: Record<string, (v: unknown) => unknown> = {
  name: requiredText("name", 100),
  description: stringField("description", 255, true),
  icon: stringField("icon", 10, true),
  display_order: (v) => {
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 2147483647)
      throw new Error("display_order deve ser inteiro de 0 a 2147483647.");
    return v;
  },
  active: bool("active"),
};
const productRules: Record<string, (v: unknown) => unknown> = {
  category_id: (v) => {
    if (!isUuid(v)) throw new Error("category_id deve ser um UUID válido.");
    return v;
  },
  title: requiredText("title", 150),
  description: stringField("description", 500, true),
  price: (v) => {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 99999999.99 ||
        Math.abs(v * 100 - Math.round(v * 100)) > 0.000001)
      throw new Error("price deve ser numérico, não negativo e ter no máximo duas casas decimais.");
    return v;
  },
  image: stringField("image", 255, true),
  available: bool("available"),
  active: bool("active"),
};
export function parseCategory(input: unknown, partial = false): Validation<Partial<CategoryFields>> {
  return validate<CategoryFields>(input, partial, Object.keys(categoryRules),
    ["name", "display_order"], categoryRules);
}
export function parseProduct(input: unknown, partial = false): Validation<Partial<ProductFields>> {
  return validate<ProductFields>(input, partial, Object.keys(productRules),
    ["category_id", "title", "price"], productRules);
}
