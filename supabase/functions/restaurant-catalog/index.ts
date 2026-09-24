import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-admin-key",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST, PUT, DELETE",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
};
const HTML = "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Restaurant Ordering System | Cardápio</title>\n<style>\n:root{font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:#e8f6ed;background:#09130f}\n*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 80% 0%,#254835 0,transparent 35%),#09130f}\nmain{width:min(1050px,calc(100% - 36px));margin:0 auto;padding:46px 0 70px}\nh1{font-size:clamp(30px,5vw,55px);margin:12px 0 10px;letter-spacing:-.04em}h2{font-size:23px;margin:0 0 20px}\n.tag{font-size:12px;font-weight:800;letter-spacing:.15em;color:#8ee0a8;text-transform:uppercase}\np{color:#b9cec2;line-height:1.5}.hero{padding:40px 0 22px}.hero p{max-width:650px}\n.panel{border:1px solid #345745;background:#112019d9;border-radius:17px;padding:22px;margin-top:24px}\n.chips{display:flex;flex-wrap:wrap;gap:9px}.chip{border:1px solid #3a6250;border-radius:99px;background:#1a3124;color:#d2f7dc;padding:9px 16px;cursor:pointer}\n.chip[aria-pressed=true]{background:#a3eabe;color:#092417;border-color:#a3eabe}\n.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:16px}\n.card{border:1px solid #345745;background:linear-gradient(145deg,#1c3728,#12231b);border-radius:15px;padding:20px;min-height:176px;display:flex;flex-direction:column}\n.card small{color:#9edfb5}.card h3{font-size:22px;margin:13px 0 6px}.card p{margin:0 0 20px;flex:1}.price{font-weight:850;font-size:22px;color:#c3f5d5}\nbutton{font:inherit;cursor:pointer}button.primary{background:#a3eabe;color:#092417;border:0;border-radius:10px;padding:12px 18px;font-weight:700}\nlabel{display:block;font-weight:650;color:#cde8d5;font-size:14px;margin:12px 0 6px}\ninput,select{background:#0d1b14;color:#fff;border:1px solid #436e56;padding:12px;border-radius:10px;width:100%;font:inherit}\ninput:focus,select:focus,button:focus-visible{outline:2px solid #a3eabe;outline-offset:2px}\n.flex{display:flex;gap:16px;flex-wrap:wrap}.flex>div{flex:1;min-width:190px}\n.muted{color:#8dad9a}summary{cursor:pointer;font-weight:700;font-size:18px}\nhr{border:0;border-top:1px solid #345745;margin:25px 0}\n.toast{color:#d5f9e0;border-radius:10px;padding:12px;display:none;background:#23432e;margin:14px 0}\nfooter{margin-top:40px;color:#82a08f;font-size:13px}\nfooter a{color:#a3eabe}.danger{border:1px solid #975251;background:#382122;color:#ffd2c9;border-radius:8px;padding:6px 9px;font-size:12px;align-self:flex-end}\n.warn{color:#ffdfb0}\n</style>\n</head>\n<body>\n<main>\n<section class=\"hero\"><span class=\"tag\">Projeto de Desenvolvimento Back-End · Demonstração online</span>\n<h1>Restaurant Ordering System</h1>\n<p>Cardápio demonstrativo conectado ao PostgreSQL no Supabase em São Paulo. Consulte as categorias e os produtos cadastrados. A administração exige uma chave privada.</p>\n<div id=\"health\" class=\"tag\" role=\"status\">Consultando banco de dados...</div></section>\n<section class=\"panel\"><h2>Categorias</h2><div id=\"categories\" class=\"chips\"></div></section>\n<section class=\"panel\"><h2>Cardápio</h2><div id=\"products\" class=\"grid\"></div></section>\n<section class=\"panel\"><details><summary>Administração do catálogo</summary>\n<p>Cadastre, altere e exclua itens usando sua chave administrativa. Não compartilhe essa chave.</p>\n<label for=\"admin-key\">Chave administrativa</label><input id=\"admin-key\" type=\"password\" placeholder=\"Chave privada\" autocomplete=\"off\">\n<div id=\"message\" class=\"toast\" role=\"status\"></div>\n<hr><h2>Nova categoria</h2><form id=\"category-form\">\n<div class=\"flex\"><div><label for=\"cat-name\">Nome</label><input id=\"cat-name\" required maxlength=\"100\"></div>\n<div><label for=\"cat-order\">Ordem</label><input id=\"cat-order\" type=\"number\" min=\"0\" step=\"1\" value=\"10\" required></div></div>\n<label for=\"cat-description\">Descrição</label><input id=\"cat-description\" maxlength=\"255\">\n<button class=\"primary\" type=\"submit\" style=\"margin-top:16px\">Cadastrar categoria</button>\n</form>\n<hr><h2>Novo produto</h2><form id=\"product-form\">\n<div class=\"flex\"><div><label for=\"prod-title\">Nome do produto</label><input id=\"prod-title\" required maxlength=\"150\"></div>\n<div><label for=\"prod-price\">Preço (R$)</label><input id=\"prod-price\" type=\"number\" min=\"0\" max=\"99999999.99\" step=\".01\" required></div></div>\n<label for=\"prod-category\">Categoria</label><select id=\"prod-category\" required></select>\n<label for=\"prod-description\">Descrição</label><input id=\"prod-description\" maxlength=\"500\">\n<button class=\"primary\" type=\"submit\" style=\"margin-top:16px\">Cadastrar produto</button>\n</form>\n<p class=\"muted\">Para alterar o preço ou excluir um produto, use os botões no respectivo cartão após informar a chave.</p>\n</details></section>\n<footer>Projeto de aula · <a href=\"https://github.com/hhenriquehhenneberg-crypto/restaurant-ordering-system-backend\" target=\"_blank\" rel=\"noopener\">Código Express/TypeScript no GitHub</a> · Demonstração hospedada em Supabase Edge Functions.</footer>\n</main>\n<script>\n(function(){\n  \"use strict\";\n  var base=location.pathname.replace(/\\/$/,\"\");\n  var categories=[],products=[],filter=\"\";\n  var $=function(id){return document.getElementById(id)};\n  function item(tag,text,cls){var el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}\n  function show(message,isError){var el=$(\"message\");el.style.display=\"block\";el.style.background=isError?\"#63302b\":\"#23432e\";el.textContent=message;}\n  function money(v){return new Intl.NumberFormat(\"pt-BR\",{style:\"currency\",currency:\"BRL\"}).format(Number(v));}\n  async function api(path,opts){\n    var res=await fetch(base+\"/api\"+path,opts||{});\n    var out=res.status===204?{}:await res.json().catch(function(){return {};});\n    if(!res.ok)throw new Error(out.message||\"Erro \"+res.status);\n    return out;\n  }\n  function getKey(){var key=$(\"admin-key\").value.trim();if(!key)throw new Error(\"Informe sua chave administrativa primeiro.\");return key;}\n  function authHeaders(){return {\"Content-Type\":\"application/json\",\"x-admin-key\":getKey()};}\n  async function write(path,method,body){\n    return api(path,{method:method,headers:authHeaders(),body:body===undefined?undefined:JSON.stringify(body)});\n  }\n  function render(){\n    var chips=$(\"categories\");chips.replaceChildren();\n    [{id:\"\",name:\"Todas\"}].concat(categories).forEach(function(cat){\n      var b=item(\"button\",cat.name,\"chip\");b.type=\"button\";b.setAttribute(\"aria-pressed\",String(filter===cat.id));\n      b.onclick=function(){filter=cat.id;render();};chips.appendChild(b);\n    });\n    var grid=$(\"products\");grid.replaceChildren();\n    var visible=products.filter(function(p){return !filter||p.category_id===filter});\n    if(!visible.length){grid.appendChild(item(\"p\",\"Não há produtos nesta categoria.\",\"muted\"));}\n    visible.forEach(function(p){\n      var card=item(\"article\",undefined,\"card\");\n      card.appendChild(item(\"small\",p.category_name));\n      card.appendChild(item(\"h3\",p.title));\n      card.appendChild(item(\"p\",p.description||\"Produto do cardápio.\"));\n      card.appendChild(item(\"span\",money(p.price),\"price\"));\n      if(!p.available)card.appendChild(item(\"small\",\" · Temporariamente indisponível\",\"warn\"));\n      var edit=item(\"button\",\"Editar preço\",\"danger\");edit.style.marginTop=\"14px\";\n      edit.onclick=async function(){\n        try{getKey();var raw=prompt(\"Novo preço em R$ para \"+p.title+\":\",String(p.price));\n          if(raw===null)return;var val=Number(raw.replace(\",\",\".\"));\n          if(!Number.isFinite(val)||val<0)throw new Error(\"Preço inválido.\");\n          await write(\"/products/\"+p.id,\"PUT\",{price:val});show(\"Produto atualizado.\");await load();\n        }catch(e){show(e.message,true);}\n      };\n      var del=item(\"button\",\"Excluir\",\"danger\");del.style.marginTop=\"8px\";\n      del.onclick=async function(){\n        try{getKey();if(!confirm(\"Excluir o produto \"+p.title+\"?\"))return;\n          await write(\"/products/\"+p.id,\"DELETE\");show(\"Produto excluído.\");await load();\n        }catch(e){show(e.message,true);}\n      };\n      card.appendChild(edit);card.appendChild(del);grid.appendChild(card);\n    });\n    var select=$(\"prod-category\"),chosen=select.value;select.replaceChildren();\n    categories.forEach(function(c){var opt=item(\"option\",c.name);opt.value=c.id;select.appendChild(opt)});\n    if(categories.some(function(c){return c.id===chosen}))select.value=chosen;\n  }\n  async function load(){\n    try{\n      var data=await Promise.all([api(\"/categories\"),api(\"/products\"),api(\"/health\")]);\n      categories=data[0];products=data[1];$(\"health\").textContent=data[2].status===\"ok\"?\"● Banco conectado · Cardápio disponível\":\"Banco indisponível\";\n      render();\n    }catch(e){$(\"health\").textContent=\"Erro de conexão: \"+e.message;}\n  }\n  $(\"category-form\").onsubmit=async function(ev){\n    ev.preventDefault();\n    try{await write(\"/categories\",\"POST\",{name:$(\"cat-name\").value,description:$(\"cat-description\").value||null,display_order:Number($(\"cat-order\").value)});\n      this.reset();show(\"Categoria cadastrada.\");await load();\n    }catch(e){show(e.message,true);}\n  };\n  $(\"product-form\").onsubmit=async function(ev){\n    ev.preventDefault();\n    try{await write(\"/products\",\"POST\",{category_id:$(\"prod-category\").value,title:$(\"prod-title\").value,\n      description:$(\"prod-description\").value||null,price:Number($(\"prod-price\").value)});\n      this.reset();show(\"Produto cadastrado.\");await load();\n    }catch(e){show(e.message,true);}\n  };\n  load();\n}());\n</script>\n</body></html>";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const categoryFields = ["name", "description", "icon", "display_order", "active"];
const productFields = ["category_id", "title", "description", "price", "image", "available", "active"];

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}
function httpError(status: number, message: string) {
  return json({ message }, status);
}
async function input(req: Request, allowed: string[], required: string[], partial: boolean) {
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 65536) throw new Error("413:O corpo excedeu 64 KB.");
  const raw = await req.text();
  if (raw.length > 65536) throw new Error("413:O corpo excedeu 64 KB.");
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { throw new Error("400:JSON inválido."); }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("400:Envie um objeto JSON.");
  }
  const data = value as Record<string, unknown>;
  const keys = Object.keys(data);
  if (!keys.length) throw new Error("400:Informe pelo menos um campo.");
  for (const key of keys) {
    if (!allowed.includes(key)) throw new Error("400:Campo desconhecido: " + key);
  }
  if (!partial) for (const key of required) {
    if (!(key in data)) throw new Error("400:Campo obrigatório: " + key);
  }
  const text = (key: string, max: number, nullable = false, mandatory = false) => {
    if (!(key in data)) return;
    if (nullable && data[key] === null) return;
    if (typeof data[key] !== "string") throw new Error("400:" + key + " deve ser texto.");
    const trimmed = (data[key] as string).trim();
    if (Array.from(trimmed).length > max || (mandatory && !trimmed)) {
      throw new Error("400:" + key + " inválido (até " + max + " caracteres).");
    }
    data[key] = trimmed;
  };
  const flag = (key: string) => {
    if (key in data && typeof data[key] !== "boolean")
      throw new Error("400:" + key + " deve ser true ou false.");
  };
  if (allowed === categoryFields) {
    text("name", 100, false, true);
    text("description", 255, true);
    text("icon", 10, true);
    if ("display_order" in data &&
      (typeof data.display_order !== "number" || !Number.isInteger(data.display_order) ||
       data.display_order < 0 || data.display_order > 2147483647))
      throw new Error("400:display_order deve ser um inteiro não negativo.");
    flag("active");
  } else {
    if ("category_id" in data && (typeof data.category_id !== "string" || !uuid.test(data.category_id)))
      throw new Error("400:category_id deve ser UUID válido.");
    text("title", 150, false, true);
    text("description", 500, true);
    text("image", 255, true);
    if ("price" in data && (typeof data.price !== "number" || !Number.isFinite(data.price) ||
      data.price < 0 || data.price > 99999999.99 ||
      Math.abs(data.price * 100 - Math.round(data.price * 100)) > 0.000001))
      throw new Error("400:Preço inválido: máximo de duas casas decimais.");
    flag("available"); flag("active");
  }
  return data;
}
async function isAdmin(req: Request, client: ReturnType<typeof createClient>): Promise<boolean> {
  const key = req.headers.get("x-admin-key");
  if (!key || key.length < 24 || key.length > 256) return false;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  const actual = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  const { data, error } = await client.from("catalog_admin_config").select("key_hash").eq("singleton", true).single();
  if (error || !data?.key_hash) return false;
  const expected = String(data.key_hash).trim();
  if (expected.length !== actual.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  return diff === 0;
}
function getClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let newer = "";
  try { newer = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default || ""; }
  catch { /* Use legacy key. */ }
  const secret = newer || legacy;
  if (!url || !secret) throw new Error("SUPABASE_URL / chave interna não disponível.");
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
async function categoryActive(client: ReturnType<typeof createClient>, id: string) {
  const { data, error } = await client.from("categories").select("id").eq("id", id).eq("active", true).maybeSingle();
  if (error) throw error;
  return !!data;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const pathUrl = new URL(req.url);
  const idx = pathUrl.pathname.indexOf("/restaurant-catalog");
  const tail = idx < 0 ? "/" : pathUrl.pathname.slice(idx + "/restaurant-catalog".length) || "/";
  if ((tail === "/" || tail === "") && req.method === "GET") {
    return new Response(HTML, {
      headers: { ...CORS, "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'" }
    });
  }
  const path = tail.replace(/^\/api\/?/, "/");
  const bits = path.split("/").filter(Boolean);
  const collection = bits[0];
  const identifier = bits[1];
  const method = req.method.toUpperCase();
  try {
    const client = getClient();
    if (collection === "health" && method === "GET") {
      const { count, error } = await client.from("categories").select("id", { count: "exact", head: true });
      if (error) throw error;
      return json({ status: "ok", database: "connected", categories: count });
    }
    if (!["categories", "products"].includes(collection) || bits.length > 2) {
      return httpError(404, "Rota não encontrada.");
    }
    if (identifier && identifier !== "search" && !uuid.test(identifier)) {
      return httpError(400, "Identificador UUID inválido.");
    }
    const table = collection;
    if (method !== "GET" && method !== "HEAD") {
      if (!(await isAdmin(req, client))) return httpError(401, "Chave administrativa ausente ou inválida.");
    }
    if (method === "GET" || method === "HEAD") {
      let query;
      if (table === "categories") {
        if (identifier === "search") {
          const keyword = (pathUrl.searchParams.get("keyword") || "").trim();
          if (keyword.length < 1 || keyword.length > 80) return httpError(400, "keyword deve ter de 1 a 80 caracteres.");
          // Busca em nomes e descrições por ILIKE; caracteres especiais PostgREST são escapados.
          const needle = keyword.replace(/[%_,()\\]/g, " ");
          query = client.from(table).select("*").eq("active", true)
            .or("name.ilike.%" + needle + "%,description.ilike.%" + needle + "%")
            .order("display_order", { ascending: true }).order("name", { ascending: true });
        } else {
          query = client.from(table).select("*").eq("active", true)
            .order("display_order", { ascending: true }).order("name", { ascending: true });
          if (identifier) query = query.eq("id", identifier);
        }
      } else {
        query = client.from(table)
          .select("*,categories!inner(name,active,display_order)")
          .eq("active", true).eq("categories.active", true)
          .order("title", { ascending: true });
        if (identifier) query = query.eq("id", identifier);
        const categoryId = pathUrl.searchParams.get("category_id");
        if (categoryId) {
          if (!uuid.test(categoryId)) return httpError(400, "category_id inválido.");
          query = query.eq("category_id", categoryId);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      const out = (data || []).map((row: Record<string, unknown>) => {
        if (table === "products") {
          const nested = row.categories as { name: string } | null;
          const { categories: _unused, ...rest } = row;
          return { ...rest, category_name: nested?.name || "" };
        }
        return row;
      });
      if (identifier && identifier !== "search") {
        return out.length ? json(out[0]) : httpError(404, "Registro não encontrado.");
      }
      return json(out);
    }
    if (identifier === "search") return httpError(405, "Método não permitido.");
    if (method === "POST") {
      if (identifier) return httpError(404, "Rota não encontrada.");
      const fields = await input(req, table === "categories" ? categoryFields : productFields,
        table === "categories" ? ["name", "display_order"] : ["category_id", "title", "price"], false);
      if (table === "products" && !(await categoryActive(client, String(fields.category_id))))
        return httpError(400, "Categoria não encontrada ou inativa.");
      const { data, error } = await client.from(table).insert(fields).select("*").single();
      if (error) {
        if (error.code === "23503") return httpError(409, "Categoria não encontrada.");
        throw error;
      }
      return json(data, 201);
    }
    if (method === "PUT") {
      if (!identifier) return httpError(404, "Rota não encontrada.");
      const fields = await input(req, table === "categories" ? categoryFields : productFields, [], true);
      if (table === "products" && fields.category_id &&
          !(await categoryActive(client, String(fields.category_id))))
        return httpError(400, "Categoria não encontrada ou inativa.");
      const { data, error } = await client.from(table).update(fields).eq("id", identifier).select("*").maybeSingle();
      if (error) {
        if (error.code === "23503") return httpError(409, "Categoria não encontrada.");
        throw error;
      }
      return data ? json(data) : httpError(404, "Registro não encontrado.");
    }
    if (method === "DELETE") {
      if (!identifier) return httpError(404, "Rota não encontrada.");
      const { data, error } = await client.from(table).delete().eq("id", identifier).select("id");
      if (error) {
        if (error.code === "23503") return httpError(409, "Categoria possui produtos vinculados.");
        throw error;
      }
      return data?.length ? new Response(null, { status: 204, headers: CORS }) : httpError(404, "Registro não encontrado.");
    }
    return httpError(405, "Método não permitido.");
  } catch (error) {
    const e = error as Error;
    const match = /^(400|413):(.+)$/.exec(e.message || "");
    if (match) return httpError(Number(match[1]), match[2]);
    console.error("Falha no catálogo hospedado:", e.message);
    return httpError(500, "Erro interno. Confira os logs do Supabase.");
  }
});
