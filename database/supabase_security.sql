-- Execute APENAS no Supabase depois de database/schema.sql.
-- A API Express usa a conexão PostgreSQL no servidor.
-- A API pública de tabelas do Supabase permanece fechada: sem policies para anon/authenticated.
alter table public.categories enable row level security;
alter table public.products enable row level security;
revoke all on public.categories, public.products from anon, authenticated;
