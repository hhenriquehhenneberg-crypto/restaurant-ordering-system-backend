# Restaurant Ordering System - Back-End

Projeto da disciplina de Back-End Development.

A proposta é construir aos poucos um sistema de autoatendimento para restaurante. Nesta etapa estou trabalhando somente com o catálogo: categorias e produtos. A parte de pedidos, cozinha e outras funcionalidades fica para as próximas etapas do curso.

## O que já foi feito

- projeto Node.js com TypeScript;
- servidor com Express;
- conexão com PostgreSQL;
- tabela de categorias;
- tabela de produtos;
- relacionamento de produto com categoria;
- listagem e cadastro de categorias;
- listagem e cadastro de produtos;
- validações básicas dos dados recebidos;
- testes das rotas usando Postman.

## Estrutura

```text
restaurant-ordering-system-backend/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── postman/
│   └── Restaurant Ordering System API.postman_collection.json
├── src/
│   ├── controllers/
│   │   ├── CategoryController.ts
│   │   └── ProductController.ts
│   ├── database/
│   │   └── connection.ts
│   ├── models/
│   │   ├── Category.ts
│   │   └── Product.ts
│   ├── routes/
│   │   ├── categoryRoutes.ts
│   │   └── productRoutes.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## Relação atual do banco

Uma categoria pode ter vários produtos, mas cada produto pertence a uma categoria.

```text
categories
    1
    |
    |---- N
           products
```

O campo `products.category_id` aponta para `categories.id`.

## Banco de dados

O PostgreSQL é usado para armazenar os dados.

Primeiro execute:

```text
database/schema.sql
```

Se quiser colocar alguns dados de teste, execute depois:

```text
database/seed.sql
```

O `seed.sql` cria algumas categorias e produtos simples para facilitar os testes.

## Configuração do projeto

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restaurant_ordering
```

Depois execute:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

## Rotas desenvolvidas até agora

### Categorias

Listar categorias:

```http
GET /categories
```

Criar categoria:

```http
POST /categories
```

Exemplo:

```json
{
  "name": "Pizzas",
  "description": "Pizzas do cardápio",
  "icon": "🍕",
  "display_order": 1
}
```

### Produtos

Listar produtos:

```http
GET /products
```

A listagem também mostra o nome da categoria do produto, usando o relacionamento entre as duas tabelas.

Criar produto:

```http
POST /products
```

Exemplo:

```json
{
  "category_id": "11111111-1111-4111-8111-111111111111",
  "title": "Pizza Margherita",
  "description": "Mussarela, tomate e manjericão",
  "price": 45.90,
  "image": null,
  "available": true
}
```

O produto só é cadastrado se a categoria informada existir e estiver ativa.

## Postman

A Collection está na pasta `postman`.

Ela possui as quatro requisições trabalhadas nesta etapa:

```text
Categories
├── GET - List Categories
└── POST - Create Category

Products
├── GET - List Products
└── POST - Create Product
```

## Observação

Por enquanto mantive o projeto simples de propósito. A ideia é ir evoluindo a mesma aplicação conforme novos conteúdos forem vistos nas aulas, sem tentar colocar todas as partes do sistema de uma vez.
