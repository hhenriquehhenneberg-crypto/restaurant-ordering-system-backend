# Restaurant Ordering System – Back-End

> **[ABRIR CARDÁPIO ONLINE (prévia pública, somente leitura)](https://raw.githack.com/hhenriquehhenneberg-crypto/restaurant-ordering-system-backend/main/docs/preview.html)**. O GitHub Pages ainda exige habilitação inicial pelo proprietário do repositório. Até lá, este endereço de terceiros serve o HTML do GitHub; não insira chaves ou senhas nessa prévia.


Projeto incremental da disciplina Desenvolvimento Back-End (Engenharia de Software, 4º período). Esta versão implementa o **catálogo** de um sistema de autoatendimento para restaurantes. Pedidos e Cozinha são possíveis módulos posteriores, não fazem parte deste CRUD.

## Tecnologias e arquitetura

- Node.js (20+), TypeScript, Express 5;
- PostgreSQL 14+ (local ou hospedado no **Supabase**, via conexão PostgreSQL com a biblioteca pg);
- arquitetura MVC: Routes → Controllers → Models → Banco;
- Git/GitHub, Collection do Postman e testes com node:test.

O banco é acessado diretamente com a URI PostgreSQL: **não** é necessário usar a API JavaScript do Supabase para executar este projeto.

## Estrutura

```text
src/
  app.ts                 # Middleware JSON, montagem das rotas e erros globais
  server.ts              # Inicialização e verificação do banco
  controllers/           # Requisições HTTP e respostas
  models/                # SQL parametrizado e modelos de domínio
  routes/                # Endpoints e proteção de escrita
  middleware/admin.ts    # Autorização por chave administrativa
  utils/validation.ts    # Validações de entradas
  database/              # Pool PostgreSQL e helper de atualização
database/
  schema.sql             # Criação das tabelas, índices e triggers
  migrate.sql            # Atualização opcional do esquema antigo
  seed.sql               # Categorias e produtos de exemplo
postman/                 # Collection para importar no Postman
tests/                   # Testes unitários e teste HTTP com PostgreSQL
.github/workflows/ci.yml # Build e testes automáticos
```

## Entidades e relacionamento

Uma **Categoria (1)** possui **vários Produtos (N)**; cada produto possui `category_id` apontando para `categories.id`. Os identificadores são UUIDs.

| Entidade | Campos |
| --- | --- |
| categories | id, name, description, icon, display_order, active, created_at, updated_at |
| products | id, category_id, title, description, price, image, available, active, created_at, updated_at |

A API pública lista apenas categorias e produtos ativos. Ao apagar uma categoria com produtos, a API responde HTTP 409, preservando a integridade do banco. `price` é NUMERIC(10,2); o driver pg o devolve como string no JSON para evitar perda de precisão. As operações DELETE removem fisicamente registros; a opção `active:false` serve para ocultá-los sem excluir.

## Supabase do projeto (São Paulo)

O projeto Supabase **restaurant-ordering-system**, criado na região **sa-east-1 (São Paulo)**, já possui as tabelas e o relacionamento, a proteção RLS e dados de exemplo (3 categorias, 2 produtos).

- [Abrir o projeto no Supabase](https://supabase.com/dashboard/project/uxrixrkhrvzgitsjfgml)
- A conexão **não é uma chave pública nem a URL da API REST**: o back-end Node usa uma URI PostgreSQL privada, fornecida no painel do Supabase.
- No painel, use **Connect → Connection string → Session pooler** (adequado quando a máquina não possui IPv6). Copie a URI para `DATABASE_URL` **no arquivo .env local**, substitua a senha e use TLS conforme indicado no painel, por exemplo `?sslmode=require` quando necessário.
- Defina também `ADMIN_API_KEY` como segredo longo, com no mínimo 24 caracteres. Nunca publique esse segredo ou a senha do banco no GitHub.
- Execute `npm install && npm run dev`; verifique `GET http://localhost:3000/categories` e `GET http://localhost:3000/products`.
- **A API Node não foi implantada em um servidor público:** o provisionamento do banco não equivale a hospedar o Express. Apenas o esquema e os dados de teste estão ativos no Supabase.

A política RLS deste projeto não concede acesso direto às chaves públicas do Supabase, pois o fluxo previsto é tablet → back-end Express → PostgreSQL. Caso uma disciplina futura passe a usar consultas diretas do front-end, será necessário planejar políticas apropriadas sem expor credenciais de servidor.

## Configurar a conexão real no Windows (assistente)
O projeto de aula e o banco Supabase já estão criados. Para **ligar esta API ao seu banco**, basta configurar a URI PostgreSQL privada **no computador onde o Node.js será executado**. O conector do ChatGPT não instala arquivos nem executa processos no seu computador.

1. Entre no [Supabase, projeto restaurant-ordering-system](https://supabase.com/dashboard/project/uxrixrkhrvzgitsjfgml). No botão **Connect**, escolha **Connection string → Session pooler**, ideal para computadores sem IPv6. Copie **a URI completa**. Se você não souber a senha criada durante o provisionamento, redefina a senha do banco em **Project Settings → Database** antes de continuar.
2. No PowerShell, na pasta do repositório, instale as dependências e execute o assistente abaixo. Ele pede a URI sem mostrá-la na tela e, caso exista o marcador `[YOUR-PASSWORD]`, solicita também a senha ocultamente e a codifica para URI.

```powershell
npm install
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1
npm run doctor
npm run dev
```

3. Verifique `http://localhost:3000/health`: a resposta deve ser `{"status":"ok","database":"connected"}`. Depois acesse `/categories` e `/products`; o banco inicial possui três categorias e dois produtos.
4. O script gera uma chave `ADMIN_API_KEY` aleatória e a mantém **somente no .env local**. Para usar POST/PUT/DELETE, copie seu valor do arquivo local para o cabeçalho `x-admin-key` do Postman. **Não cole as senhas ou chaves no chat nem as envie ao GitHub.**

Se o `.env` já existir, o assistente o preservará. Para configuração manual, copie `.env.example` para `.env`, substitua `DATABASE_URL` e gere `ADMIN_API_KEY` de forma segura. O script `doctor` apenas lê o banco, não modifica dados. O `GET /health` verifica em tempo real se a API consegue consultar o PostgreSQL.


## Demonstração hospedada na nuvem (Supabase Edge Function)

**[Abrir o cardápio funcionando](https://uxrixrkhrvzgitsjfgml.supabase.co/functions/v1/restaurant-catalog)**

Esta é uma **demonstração online alternativa**, hospedada como função Deno no Supabase e conectada às mesmas tabelas PostgreSQL. O código exigido na disciplina continua no Express/TypeScript, em `src/`, e a execução local dele permanece separada.

A página permite consultar categorias e produtos sem instalação local. A opção **Administração do catálogo** oferece cadastro, alteração de preço e exclusão mediante chave administrativa, gerada em particular na implantação, **não incluída no repositório**.

API online: `/functions/v1/restaurant-catalog/api/categories`, `/functions/v1/restaurant-catalog/api/products` e `/functions/v1/restaurant-catalog/api/health`. A API hospedada aceita GET público e exige o cabeçalho `x-admin-key` válido para POST/PUT/DELETE. No banco, `public.catalog_admin_config` guarda **somente o hash SHA-256** da chave. As tabelas de catálogo permanecem com RLS bloqueando acesso direto por chaves públicas.

> Atenção: o código da função hospedada não substitui o back-end Express da disciplina. É uma vitrine funcional do mesmo catálogo e banco de dados. Os recursos gratuitos da plataforma estão sujeitos a limites de uso.

## Instalação

1. Clone o repositório, instale Node.js 20+ e execute `npm install`.
2. Crie um banco PostgreSQL local ou um projeto Supabase. Execute `database/schema.sql` no editor SQL (ou via `psql`); execute `database/seed.sql` se quiser dados de exemplo. **Se já utiliza o banco criado em agosto**, faça backup e aplique `database/migrate.sql`, depois `database/schema.sql`; não recrie nem apague dados existentes.
3. Copie `.env.example` para `.env`; configure `DATABASE_URL` e uma `ADMIN_API_KEY` privada de pelo menos 24 caracteres.
4. Execute `npm run dev` e abra `http://localhost:3000`. Para produção, `npm run build` e `npm start`.

Exemplo de variáveis (substitua os valores):

```dotenv
PORT=3000
DATABASE_URL=postgresql://postgres:senha@localhost:5432/restaurant_ordering
ADMIN_API_KEY=gere-uma-chave-privada-longa-e-aleatoria
```

No Supabase, use **Connect → Connection string** e uma URI PostgreSQL apropriada, preferencialmente o pooler quando necessário; para conexão hospedada habilite SSL conforme as instruções da plataforma. Não exponha a string de conexão nem a chave administrativa no front-end, no Postman compartilhado ou no GitHub. O `.gitignore` protege `.env` e suas variações.

## Endpoints

| Método | Rota | Ação | Autenticação |
| --- | --- | --- | --- |
| GET | / | Informações do serviço | Pública |
| GET | /categories | Lista categorias ativas | Pública |
| GET | /categories/search?keyword=pizza | Pesquisa nome e descrição | Pública |
| GET | /categories/:id | Consulta categoria ativa | Pública |
| POST | /categories | Cadastra categoria | x-admin-key |
| PUT | /categories/:id | Atualiza campos informados | x-admin-key |
| DELETE | /categories/:id | Apaga categoria sem produtos | x-admin-key |
| GET | /products | Lista produtos ativos | Pública |
| GET | /products?category_id=UUID | Filtra por categoria | Pública |
| GET | /products/:id | Consulta produto ativo | Pública |
| POST | /products | Cadastra produto | x-admin-key |
| PUT | /products/:id | Atualiza campos informados | x-admin-key |
| DELETE | /products/:id | Apaga produto | x-admin-key |

Corpos JSON de exemplo:

```json
{
  "name": "Pizzas", "description": "Pizzas especiais",
  "icon": "🍕", "display_order": 1, "active": true
}
```

```json
{
  "category_id": "11111111-1111-4111-8111-111111111111",
  "title": "Pizza Margherita", "description": "Mussarela e manjericão",
  "price": 39.90, "image": null, "available": true, "active": true
}
```

Para UPDATE, envie apenas os campos que deseja modificar, por exemplo `{"price": 44.90}`. Use `Content-Type: application/json` e `x-admin-key: SUA_CHAVE` nas operações de escrita.

### Respostas HTTP

- **200** consulta ou atualização; **201** criação; **204** exclusão (sem corpo);
- **400** JSON/campos/UUID inválidos ou categoria de produto inexistente/inativa;
- **401/403** chave administrativa ausente/inválida;
- **404** rota ou registro público não encontrado;
- **409** tentativa de apagar categoria que possui produtos;
- **413** JSON excede o limite de 64 KB; **500** erro interno.

## Testes e Postman

- `npm run build` verifica a compilação TypeScript.
- `npm test` roda os testes de validação. Os testes de integração HTTP + PostgreSQL são habilitados ao definir **TEST_DATABASE_URL** apontando para um **banco exclusivo de testes**, nunca de produção.
- A CI do GitHub sobe um PostgreSQL temporário, compila e testa automaticamente a branch e os Pull Requests.
- Importe `postman/Restaurant Ordering System API.postman_collection.json`. Defina a variável `admin_key` com sua chave privada local. Faça primeiro o cadastro da categoria e depois do produto. As requisições POST salvam os UUIDs retornados nas variáveis da Collection.

## Organização do projeto da disciplina

O catálogo é o **exercício realizado em sala**, não necessariamente a entrega independente da APS. Os materiais da disciplina divergem quanto à quantidade mínima de entidades e à distribuição da nota da APS; confirme a orientação atual do professor antes de reaproveitar este projeto como entrega. É importante conseguir explicar o fluxo Routes → Controllers → Models → PostgreSQL e demonstrar as validações e a relação entre as entidades.

## Segurança e limites

As consultas são públicas e alterações requerem uma chave privada via cabeçalho. Esta autenticação simples é adequada para demonstrar o princípio de proteção de rotas; antes de uso comercial, considere usuários, permissões, rotação de chaves, limites de requisição e política de acesso ao banco. **Nunca publique o arquivo .env.**
