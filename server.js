const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, 'db.json');
const SECRET = process.env.JWT_SECRET || 'troque-essa-chave-em-producao';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function defaultDB(){
  return { users: [], palpites: [], resultados: {}, mataMata: [] };
}
function readDB(){
  if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify(defaultDB(), null, 2));
  const db = JSON.parse(fs.readFileSync(DB, 'utf8'));
  return { ...defaultDB(), ...db };
}
function writeDB(data){ fs.writeFileSync(DB, JSON.stringify(data, null, 2)); }
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')){
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}
function checkPassword(password, stored){
  const [salt, hash] = String(stored || '').split(':');
  if(!salt || !hash) return false;
  const test = hashPassword(password, salt).split(':')[1];
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(test));
}
function sign(payload){
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function verify(token){
  if(!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if(sig !== expected) return null;
  return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
}
function auth(req, res, next){
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const payload = verify(token);
  if(!payload) return res.status(401).json({ erro: 'Login necessário' });
  req.user = payload;
  next();
}
function adminAuth(req, res, next){
  auth(req, res, () => {
    if(req.user.role !== 'admin') return res.status(403).json({ erro: 'Acesso admin necessário' });
    next();
  });
}
function outcome(score){
  if(!score || score.c === undefined || score.f === undefined) return null;
  const c = Number(score.c), f = Number(score.f);
  if(c > f) return 'casa';
  if(f > c) return 'fora';
  return 'empate';
}
function pontosDoJogo(palpite, resultado){
  if(!palpite || !resultado) return 0;
  if(palpite.c === undefined || palpite.f === undefined || resultado.c === undefined || resultado.f === undefined) return 0;
  if(Number(palpite.c) === Number(resultado.c) && Number(palpite.f) === Number(resultado.f)) return 10;
  return outcome(palpite) === outcome(resultado) ? 5 : 0;
}
function ranking(db){
  return db.palpites.map(p => {
    let pontos = 0, exatos = 0, vencedores = 0;
    Object.entries(p.palpites || {}).forEach(([jogoId, palpite]) => {
      const pts = pontosDoJogo(palpite, db.resultados[jogoId]);
      pontos += pts;
      if(pts === 10) exatos++;
      if(pts === 5) vencedores++;
    });
    return { nome: p.nome, pontos, exatos, vencedores, palpites: Object.keys(p.palpites || {}).length, atualizadoEm: p.criadoEm };
  }).sort((a,b) => b.pontos - a.pontos || b.exatos - a.exatos || b.vencedores - a.vencedores || a.nome.localeCompare(b.nome));
}

app.get('/api/data', (req,res) => {
  const db = readDB();
  res.json({ resultados: db.resultados, mataMata: db.mataMata, ranking: ranking(db) });
});

app.post('/api/register', (req,res) => {
  const db = readDB();
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  if(username.length < 3) return res.status(400).json({ erro: 'Use um usuário com pelo menos 3 caracteres' });
  if(password.length < 4) return res.status(400).json({ erro: 'Use uma senha com pelo menos 4 caracteres' });
  if(username.toLowerCase() === ADMIN_USER.toLowerCase()) return res.status(400).json({ erro: 'Esse usuário é reservado' });
  if(db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) return res.status(409).json({ erro: 'Usuário já existe' });
  const user = { id: Date.now().toString(), username, passwordHash: hashPassword(password), criadoEm: new Date().toISOString() };
  db.users.push(user); writeDB(db);
  const token = sign({ id: user.id, username, role: 'user' });
  res.json({ ok: true, token, user: { username } });
});

app.post('/api/login', (req,res) => {
  const db = readDB();
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if(!user || !checkPassword(password, user.passwordHash)) return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
  res.json({ ok: true, token: sign({ id: user.id, username: user.username, role: 'user' }), user: { username: user.username } });
});

app.post('/api/admin/login', (req,res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  if(username !== ADMIN_USER || password !== ADMIN_PASS) return res.status(401).json({ erro: 'Admin ou senha inválidos' });
  res.json({ ok: true, token: sign({ id: 'admin', username: ADMIN_USER, role: 'admin' }) });
});

app.get('/api/me/palpites', auth, (req,res) => {
  if(req.user.role !== 'user') return res.json({ palpites: {} });
  const db = readDB();
  const p = db.palpites.find(x => x.userId === req.user.id || x.nome.toLowerCase() === req.user.username.toLowerCase());
  res.json({ palpites: p?.palpites || {} });
});

app.post('/api/palpites', auth, (req,res) => {
  if(req.user.role !== 'user') return res.status(403).json({ erro: 'Login de usuário necessário' });
  const db = readDB();
  const { palpites } = req.body;
  if(!palpites) return res.status(400).json({ erro: 'Palpites são obrigatórios' });
  const registro = { id: req.user.id, userId: req.user.id, nome: req.user.username, palpites, criadoEm: new Date().toISOString() };
  db.palpites = db.palpites.filter(p => p.userId !== req.user.id && p.nome.toLowerCase() !== req.user.username.toLowerCase());
  db.palpites.push(registro); writeDB(db);
  res.json({ ok:true, registro, ranking: ranking(db) });
});

app.post('/api/resultados', adminAuth, (req,res) => {
  const db = readDB();
  db.resultados = req.body.resultados || {};
  db.mataMata = req.body.mataMata || [];
  writeDB(db); res.json({ ok:true, ranking: ranking(db) });
});

app.get('/api/admin/palpiteiros', adminAuth, (req,res) => {
  const db = readDB();
  res.json({ palpites: db.palpites, users: db.users.map(u => ({ username: u.username, criadoEm: u.criadoEm })), ranking: ranking(db) });
});

app.listen(PORT, () => console.log(`Bolão da Copa rodando na porta ${PORT}`));
