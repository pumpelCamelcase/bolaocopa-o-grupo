# Bolão da Copa 2026

Protótipo web com:
- tela inicial para o usuário informar o nome;
- palpites dos 72 jogos da fase de grupos;
- área admin para atualizar resultados;
- cadastro/edição dos confrontos do mata-mata a partir dos 32 avos;
- armazenamento em `db.json` no servidor Node/Express.

## Rodar localmente
```bash
npm install
npm start
```
Acesse: http://localhost:3000

## Hospedar online
Funciona em Render, Railway, VPS ou qualquer hospedagem Node. Para produção real, o ideal é trocar o `db.json` por Supabase/Firebase/PostgreSQL.

## Observação
A Copa 2026 usa 48 seleções em 12 grupos de 4. Os dois primeiros e os 8 melhores terceiros avançam para o mata-mata de 32 equipes.
