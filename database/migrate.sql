-- Aplicar apenas se já existirem as tabelas da versão de agosto.
-- Faça backup antes de executar em um banco que possua dados importantes.
alter table categories alter column id set default gen_random_uuid();
alter table products alter column id set default gen_random_uuid();
do $$
begin
 if not exists (select 1 from pg_constraint where conname = 'chk_categories_display_order') then
    alter table categories add constraint chk_categories_display_order check (display_order >= 0);
 end if;
 if not exists (select 1 from pg_constraint where conname = 'chk_products_price') then
    alter table products add constraint chk_products_price check (price >= 0);
 end if;
end $$;
-- Execute database/schema.sql depois para instalar os índices e triggers de updated_at.
