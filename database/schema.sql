-- PostgreSQL 14+ / Supabase. Para novas instalações, executar antes do seed.sql.
create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    description varchar(255),
    icon varchar(10),
    display_order integer not null check (display_order >= 0),
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references categories(id),
    title varchar(150) not null,
    description varchar(500),
    price numeric(10,2) not null check (price >= 0),
    image varchar(255),
    available boolean not null default true,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_categories_display_order on categories(display_order);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;
drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at before update on categories
for each row execute function set_updated_at();
drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at before update on products
for each row execute function set_updated_at();
