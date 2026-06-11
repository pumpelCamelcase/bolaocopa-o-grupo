# Bolão da Copa 2026

Versão atualizada com:

- Login de usuário e senha.
- Admin para resultados, horários e confrontos.
- Classificação automática.
- Reset de senha pelo admin para `senha123`.
- Jogos em ordem cronológica.
- Datas e horários oficiais da Copa 2026 preenchidos no sistema.
- Bloqueio automático de palpite no horário de início de cada jogo.

## Rodar localmente

```bash
npm install
npm start
```

Depois acesse `http://localhost:3000`.

## Admin padrão

Usuário: `admin`  
Senha: `admin123`

No Render, você pode trocar usando variáveis de ambiente:

- `ADMIN_USER`
- `ADMIN_PASS`
- `JWT_SECRET`

## Importante para atualizar sem perder dados

Não apague nem sobrescreva o arquivo `db.json` do servidor. Ele guarda usuários, palpites, resultados e alterações feitas no admin.
