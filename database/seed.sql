-- Dados simples para testar a API durante o desenvolvimento.
-- Os UUIDs são fixos para facilitar os testes no Postman.

insert into categories (id, name, description, icon, display_order)
values
    ('11111111-1111-4111-8111-111111111111', 'Pizzas', 'Pizzas tradicionais e especiais', '🍕', 1),
    ('22222222-2222-4222-8222-222222222222', 'Bebidas', 'Bebidas disponíveis no cardápio', '🥤', 2),
    ('33333333-3333-4333-8333-333333333333', 'Sobremesas', 'Opções doces do cardápio', '🍰', 3)
on conflict (id) do nothing;

insert into products (id, category_id, title, description, price, image, available)
values
    (
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        '11111111-1111-4111-8111-111111111111',
        'Pizza Calabresa',
        'Calabresa, cebola e mussarela',
        49.90,
        null,
        true
    ),
    (
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        '22222222-2222-4222-8222-222222222222',
        'Refrigerante Lata',
        'Refrigerante 350 ml',
        7.00,
        null,
        true
    )
on conflict (id) do nothing;
