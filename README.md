# Restaurant Ordering System - Back-End

Projeto desenvolvido de forma incremental para a disciplina de Back-End Development.

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Git/GitHub
- Postman

## Recursos atuais

### Categories

- `GET /categories`
- `POST /categories`

Exemplo de criação:

```json
{
  "name": "Pizzas",
  "description": "Pizzas do cardápio",
  "icon": "🍕",
  "display_order": 1
}
```

### Products

- `GET /products`
- `POST /products`

Exemplo de criação:

```json
{
  "category_id": "UUID-DA-CATEGORIA",
  "title": "Pizza Calabresa",
  "description": "Pizza de calabresa com cebola",
  "price": 49.90,
  "image": "calabresa.jpg",
  "available": true
}
```

## Banco de dados

O script de criação das tabelas está em `database/schema.sql`.

Crie um banco PostgreSQL e execute esse arquivo antes de iniciar a API.

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Copie `.env.example` para `.env` e ajuste a conexão do PostgreSQL.

3. Execute em desenvolvimento:

```bash
npm run dev
```

A API será iniciada em `http://localhost:3000` por padrão.
