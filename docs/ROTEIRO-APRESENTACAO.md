# Roteiro de demonstração para o professor (Tech Challenge)

**Este roteiro é para o projeto de restaurante desenvolvido em sala, não para a APS independente.** O professor pede a implementação do catálogo em MVC, CRUD de Categoria e Produto, apresentação gravada e README. O banco Supabase em São Paulo já possui os registros iniciais.

## Antes de gravar (no Windows)

1. Abra o projeto baixado/clonado no computador com Node.js 20+.
2. No PowerShell dentro da pasta, execute `powershell -ExecutionPolicy Bypass -File .\scripts\apresentar.ps1`.
3. Se o assistente pedir a URI PostgreSQL, abra o [projeto Supabase](https://supabase.com/dashboard/project/uxrixrkhrvzgitsjfgml), escolha **Connect → Connection string → Session pooler**, copie a URI para o prompt oculto. Se a senha original não estiver disponível, redefina-a no painel. **Não envie a URI ao chat.**
4. Confira a saída de `npm run doctor`: deve indicar **3 categorias** e **2 produtos** antes de executar o Runner, caso não tenha feito outras modificações.
5. Importe a [Collection de demonstração](../postman/DEMO%20Professor.postman_collection.json) no Postman. Defina `admin_key` **somente localmente** com a variável `ADMIN_API_KEY` do arquivo `.env`. **Nunca publique seu segredo na Collection ou em prints.**
6. Abra o Runner e execute as **15 requisições na ordem**, sem desligar o servidor. A Collection cria IDs novos, testa as validações, confirma que a categoria não pode ser apagada com produtos relacionados e remove os registros temporários no final. Não pule as operações de limpeza.

## Vídeo sugerido (2 a 4 minutos)

**0:00 a 0:30.** Mostre o repositório GitHub e diga: “Construímos uma API REST de catálogo de restaurante em Node.js, TypeScript e Express, com PostgreSQL no Supabase.”

**0:30 a 1:00.** Mostre `src/routes`, `src/controllers`, `src/models`. Explique a ordem: **rota** recebe o pedido HTTP, **controller** valida e envia a resposta, **model** consulta o PostgreSQL. Mostre `category_id` em `products` apontando para `categories.id`.

**1:00 a 2:30.** No Postman, mostre GET, POST, PUT e DELETE em ambas as entidades. Destaque HTTP **201**, **200**, **204**, **400**, **401** e **409**. Se quiser mostrar tudo em um clique, rode a Collection no Runner e abra os resultados das requisições principais.

**2:30 a 3:00.** Mostre `database/schema.sql`, a configuração por `.env.example` (sem a senha real), o `README.md` e os testes do GitHub Actions.

## O que foi validado e o que exige sua máquina

- Na CI, o código Express é compilado e executa o teste HTTP de CRUD contra PostgreSQL **temporário**, não o banco Supabase de produção.
- No Supabase real, foi confirmada a existência das tabelas, do relacionamento e dos dados iniciais. A execução de **Express diretamente conectado ao Supabase real** só estará confirmada quando `npm run doctor`, `/health` e o Runner funcionarem no computador da apresentação.
- O site visual online é opcional; ele usa uma função Deno separada, não é o código Express exigido para esta apresentação.
