-- Estrutura da chave de administração da demonstração online.
-- Nunca envie a chave em texto puro ou seu hash para o repositório.
create table if not exists public.catalog_admin_config (
  singleton boolean primary key default true check (singleton),
  key_hash char(64) not null check (key_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  rotated_at timestamptz not null default now()
);
alter table public.catalog_admin_config enable row level security;
revoke all on public.catalog_admin_config from anon, authenticated;
-- O hash inicial foi aplicado diretamente à instância e não é versionado.
