# Bolão da Copa 2026

Projeto Node/Express com interface web para bolão da Copa.

## Funcionalidades
- Login e criação de conta com usuário e senha.
- Palpites dos 72 jogos da fase de grupos.
- Tabela de classificação automática.
- Pontuação: placar exato = 10 pontos; vencedor ou empate correto = 5 pontos.
- Login admin para atualizar resultados da fase de grupos.
- Admin também cadastra/edita confrontos do mata-mata a partir dos 32 avos.
- Dados salvos em `db.json`.

## Admin padrão
Usuário: `admin`
Senha: `admin123`

No Render, você pode trocar usando variáveis de ambiente:
- `ADMIN_USER`
- `ADMIN_PASS`
- `JWT_SECRET`

## Rodar localmente
```bash
npm install
npm start
```
Acesse: http://localhost:3000

## Deploy no Render
- Runtime: Node
- Root Directory: `bolao-copa` se os arquivos estiverem dentro dessa pasta no GitHub
- Build Command: `npm install`
- Start Command: `npm start`

## Observação
O `db.json` é suficiente para teste/MVP. Para um bolão grande e definitivo, o ideal é trocar por banco online como PostgreSQL, Supabase ou Firebase.
