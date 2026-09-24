# Cardápio online
Este diretório publica o HTML no GitHub Pages. O Supabase Edge Functions **não** permite servir HTML visualmente: a plataforma o reescreve como text/plain por segurança. O back-end online continua no endpoint Supabase e o back-end Express/TypeScript da disciplina permanece em src/.

Site esperado depois de ativar Pages em Settings > Pages > Build and deployment > Source: GitHub Actions:
https://hhenriquehhenneberg-crypto.github.io/restaurant-ordering-system-backend/

API: https://uxrixrkhrvzgitsjfgml.supabase.co/functions/v1/restaurant-catalog/api/health

Não coloque sua senha PostgreSQL nem ADMIN_API_KEY no HTML. A página recebe a chave de administração apenas durante a sessão e envia-a diretamente ao endpoint HTTPS hospedado.
