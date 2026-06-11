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
const SENHA_RESET_PADRAO = 'senha123';
const JOGOS_OFICIAIS = [{"id": "M1", "numero": 1, "etapa": "Fase de grupos", "grupo": "A", "casa": "México", "fora": "África do Sul", "inicio": "2026-06-11T19:00:00Z"}, {"id": "M2", "numero": 2, "etapa": "Fase de grupos", "grupo": "A", "casa": "Coreia do Sul", "fora": "Tchéquia", "inicio": "2026-06-12T02:00:00Z"}, {"id": "M3", "numero": 3, "etapa": "Fase de grupos", "grupo": "B", "casa": "Canadá", "fora": "Bósnia e Herzegovina", "inicio": "2026-06-12T19:00:00Z"}, {"id": "M4", "numero": 4, "etapa": "Fase de grupos", "grupo": "D", "casa": "Estados Unidos", "fora": "Paraguai", "inicio": "2026-06-13T01:00:00Z"}, {"id": "M8", "numero": 8, "etapa": "Fase de grupos", "grupo": "B", "casa": "Qatar", "fora": "Suíça", "inicio": "2026-06-13T19:00:00Z"}, {"id": "M7", "numero": 7, "etapa": "Fase de grupos", "grupo": "C", "casa": "Brasil", "fora": "Marrocos", "inicio": "2026-06-13T22:00:00Z"}, {"id": "M5", "numero": 5, "etapa": "Fase de grupos", "grupo": "C", "casa": "Haiti", "fora": "Escócia", "inicio": "2026-06-14T01:00:00Z"}, {"id": "M6", "numero": 6, "etapa": "Fase de grupos", "grupo": "D", "casa": "Austrália", "fora": "Turquia", "inicio": "2026-06-14T04:00:00Z"}, {"id": "M10", "numero": 10, "etapa": "Fase de grupos", "grupo": "E", "casa": "Alemanha", "fora": "Curaçao", "inicio": "2026-06-14T17:00:00Z"}, {"id": "M11", "numero": 11, "etapa": "Fase de grupos", "grupo": "F", "casa": "Holanda", "fora": "Japão", "inicio": "2026-06-14T20:00:00Z"}, {"id": "M9", "numero": 9, "etapa": "Fase de grupos", "grupo": "E", "casa": "Costa do Marfim", "fora": "Equador", "inicio": "2026-06-14T23:00:00Z"}, {"id": "M12", "numero": 12, "etapa": "Fase de grupos", "grupo": "F", "casa": "Suécia", "fora": "Tunísia", "inicio": "2026-06-15T02:00:00Z"}, {"id": "M14", "numero": 14, "etapa": "Fase de grupos", "grupo": "H", "casa": "Espanha", "fora": "Cabo Verde", "inicio": "2026-06-15T16:00:00Z"}, {"id": "M16", "numero": 16, "etapa": "Fase de grupos", "grupo": "G", "casa": "Bélgica", "fora": "Egito", "inicio": "2026-06-15T19:00:00Z"}, {"id": "M13", "numero": 13, "etapa": "Fase de grupos", "grupo": "H", "casa": "Arábia Saudita", "fora": "Uruguai", "inicio": "2026-06-15T22:00:00Z"}, {"id": "M15", "numero": 15, "etapa": "Fase de grupos", "grupo": "G", "casa": "Irã", "fora": "Nova Zelândia", "inicio": "2026-06-16T01:00:00Z"}, {"id": "M17", "numero": 17, "etapa": "Fase de grupos", "grupo": "I", "casa": "França", "fora": "Senegal", "inicio": "2026-06-16T19:00:00Z"}, {"id": "M18", "numero": 18, "etapa": "Fase de grupos", "grupo": "I", "casa": "Iraque", "fora": "Noruega", "inicio": "2026-06-16T22:00:00Z"}, {"id": "M19", "numero": 19, "etapa": "Fase de grupos", "grupo": "J", "casa": "Argentina", "fora": "Argélia", "inicio": "2026-06-17T01:00:00Z"}, {"id": "M20", "numero": 20, "etapa": "Fase de grupos", "grupo": "J", "casa": "Áustria", "fora": "Jordânia", "inicio": "2026-06-17T04:00:00Z"}, {"id": "M23", "numero": 23, "etapa": "Fase de grupos", "grupo": "K", "casa": "Portugal", "fora": "RD Congo", "inicio": "2026-06-17T17:00:00Z"}, {"id": "M22", "numero": 22, "etapa": "Fase de grupos", "grupo": "L", "casa": "Inglaterra", "fora": "Croácia", "inicio": "2026-06-17T20:00:00Z"}, {"id": "M21", "numero": 21, "etapa": "Fase de grupos", "grupo": "L", "casa": "Gana", "fora": "Panamá", "inicio": "2026-06-17T23:00:00Z"}, {"id": "M24", "numero": 24, "etapa": "Fase de grupos", "grupo": "K", "casa": "Uzbequistão", "fora": "Colômbia", "inicio": "2026-06-18T02:00:00Z"}, {"id": "M25", "numero": 25, "etapa": "Fase de grupos", "grupo": "A", "casa": "Tchéquia", "fora": "África do Sul", "inicio": "2026-06-18T16:00:00Z"}, {"id": "M26", "numero": 26, "etapa": "Fase de grupos", "grupo": "B", "casa": "Suíça", "fora": "Bósnia e Herzegovina", "inicio": "2026-06-18T19:00:00Z"}, {"id": "M27", "numero": 27, "etapa": "Fase de grupos", "grupo": "B", "casa": "Canadá", "fora": "Qatar", "inicio": "2026-06-18T22:00:00Z"}, {"id": "M28", "numero": 28, "etapa": "Fase de grupos", "grupo": "A", "casa": "México", "fora": "Coreia do Sul", "inicio": "2026-06-19T01:00:00Z"}, {"id": "M32", "numero": 32, "etapa": "Fase de grupos", "grupo": "D", "casa": "Estados Unidos", "fora": "Austrália", "inicio": "2026-06-19T19:00:00Z"}, {"id": "M30", "numero": 30, "etapa": "Fase de grupos", "grupo": "C", "casa": "Escócia", "fora": "Marrocos", "inicio": "2026-06-19T22:00:00Z"}, {"id": "M29", "numero": 29, "etapa": "Fase de grupos", "grupo": "C", "casa": "Brasil", "fora": "Haiti", "inicio": "2026-06-20T00:30:00Z"}, {"id": "M31", "numero": 31, "etapa": "Fase de grupos", "grupo": "D", "casa": "Turquia", "fora": "Paraguai", "inicio": "2026-06-20T03:00:00Z"}, {"id": "M35", "numero": 35, "etapa": "Fase de grupos", "grupo": "F", "casa": "Holanda", "fora": "Suécia", "inicio": "2026-06-20T17:00:00Z"}, {"id": "M33", "numero": 33, "etapa": "Fase de grupos", "grupo": "E", "casa": "Alemanha", "fora": "Costa do Marfim", "inicio": "2026-06-20T20:00:00Z"}, {"id": "M34", "numero": 34, "etapa": "Fase de grupos", "grupo": "E", "casa": "Equador", "fora": "Curaçao", "inicio": "2026-06-21T00:00:00Z"}, {"id": "M36", "numero": 36, "etapa": "Fase de grupos", "grupo": "F", "casa": "Tunísia", "fora": "Japão", "inicio": "2026-06-21T04:00:00Z"}, {"id": "M38", "numero": 38, "etapa": "Fase de grupos", "grupo": "H", "casa": "Espanha", "fora": "Arábia Saudita", "inicio": "2026-06-21T16:00:00Z"}, {"id": "M39", "numero": 39, "etapa": "Fase de grupos", "grupo": "G", "casa": "Bélgica", "fora": "Irã", "inicio": "2026-06-21T19:00:00Z"}, {"id": "M37", "numero": 37, "etapa": "Fase de grupos", "grupo": "H", "casa": "Uruguai", "fora": "Cabo Verde", "inicio": "2026-06-21T22:00:00Z"}, {"id": "M40", "numero": 40, "etapa": "Fase de grupos", "grupo": "G", "casa": "Nova Zelândia", "fora": "Egito", "inicio": "2026-06-22T01:00:00Z"}, {"id": "M43", "numero": 43, "etapa": "Fase de grupos", "grupo": "J", "casa": "Argentina", "fora": "Áustria", "inicio": "2026-06-22T17:00:00Z"}, {"id": "M42", "numero": 42, "etapa": "Fase de grupos", "grupo": "I", "casa": "França", "fora": "Iraque", "inicio": "2026-06-22T21:00:00Z"}, {"id": "M41", "numero": 41, "etapa": "Fase de grupos", "grupo": "I", "casa": "Noruega", "fora": "Senegal", "inicio": "2026-06-23T00:00:00Z"}, {"id": "M44", "numero": 44, "etapa": "Fase de grupos", "grupo": "J", "casa": "Jordânia", "fora": "Argélia", "inicio": "2026-06-23T03:00:00Z"}, {"id": "M47", "numero": 47, "etapa": "Fase de grupos", "grupo": "K", "casa": "Portugal", "fora": "Uzbequistão", "inicio": "2026-06-23T17:00:00Z"}, {"id": "M45", "numero": 45, "etapa": "Fase de grupos", "grupo": "L", "casa": "Inglaterra", "fora": "Gana", "inicio": "2026-06-23T20:00:00Z"}, {"id": "M46", "numero": 46, "etapa": "Fase de grupos", "grupo": "L", "casa": "Panamá", "fora": "Croácia", "inicio": "2026-06-23T23:00:00Z"}, {"id": "M48", "numero": 48, "etapa": "Fase de grupos", "grupo": "K", "casa": "Colômbia", "fora": "RD Congo", "inicio": "2026-06-24T02:00:00Z"}, {"id": "M51", "numero": 51, "etapa": "Fase de grupos", "grupo": "B", "casa": "Suíça", "fora": "Canadá", "inicio": "2026-06-24T19:00:00Z"}, {"id": "M52", "numero": 52, "etapa": "Fase de grupos", "grupo": "B", "casa": "Bósnia e Herzegovina", "fora": "Qatar", "inicio": "2026-06-24T19:00:00Z"}, {"id": "M50", "numero": 50, "etapa": "Fase de grupos", "grupo": "C", "casa": "Marrocos", "fora": "Haiti", "inicio": "2026-06-24T22:00:00Z"}, {"id": "M49", "numero": 49, "etapa": "Fase de grupos", "grupo": "C", "casa": "Escócia", "fora": "Brasil", "inicio": "2026-06-24T22:00:00Z"}, {"id": "M54", "numero": 54, "etapa": "Fase de grupos", "grupo": "A", "casa": "África do Sul", "fora": "Coreia do Sul", "inicio": "2026-06-25T01:00:00Z"}, {"id": "M53", "numero": 53, "etapa": "Fase de grupos", "grupo": "A", "casa": "Tchéquia", "fora": "México", "inicio": "2026-06-25T01:00:00Z"}, {"id": "M55", "numero": 55, "etapa": "Fase de grupos", "grupo": "E", "casa": "Curaçao", "fora": "Costa do Marfim", "inicio": "2026-06-25T20:00:00Z"}, {"id": "M56", "numero": 56, "etapa": "Fase de grupos", "grupo": "E", "casa": "Equador", "fora": "Alemanha", "inicio": "2026-06-25T20:00:00Z"}, {"id": "M58", "numero": 58, "etapa": "Fase de grupos", "grupo": "F", "casa": "Tunísia", "fora": "Holanda", "inicio": "2026-06-25T23:00:00Z"}, {"id": "M57", "numero": 57, "etapa": "Fase de grupos", "grupo": "F", "casa": "Japão", "fora": "Suécia", "inicio": "2026-06-25T23:00:00Z"}, {"id": "M59", "numero": 59, "etapa": "Fase de grupos", "grupo": "D", "casa": "Turquia", "fora": "Estados Unidos", "inicio": "2026-06-26T02:00:00Z"}, {"id": "M60", "numero": 60, "etapa": "Fase de grupos", "grupo": "D", "casa": "Paraguai", "fora": "Austrália", "inicio": "2026-06-26T02:00:00Z"}, {"id": "M61", "numero": 61, "etapa": "Fase de grupos", "grupo": "I", "casa": "Noruega", "fora": "França", "inicio": "2026-06-26T19:00:00Z"}, {"id": "M62", "numero": 62, "etapa": "Fase de grupos", "grupo": "I", "casa": "Senegal", "fora": "Iraque", "inicio": "2026-06-26T19:00:00Z"}, {"id": "M65", "numero": 65, "etapa": "Fase de grupos", "grupo": "H", "casa": "Cabo Verde", "fora": "Arábia Saudita", "inicio": "2026-06-27T00:00:00Z"}, {"id": "M66", "numero": 66, "etapa": "Fase de grupos", "grupo": "H", "casa": "Uruguai", "fora": "Espanha", "inicio": "2026-06-27T00:00:00Z"}, {"id": "M64", "numero": 64, "etapa": "Fase de grupos", "grupo": "G", "casa": "Nova Zelândia", "fora": "Bélgica", "inicio": "2026-06-27T03:00:00Z"}, {"id": "M63", "numero": 63, "etapa": "Fase de grupos", "grupo": "G", "casa": "Egito", "fora": "Irã", "inicio": "2026-06-27T03:00:00Z"}, {"id": "M67", "numero": 67, "etapa": "Fase de grupos", "grupo": "L", "casa": "Panamá", "fora": "Inglaterra", "inicio": "2026-06-27T21:00:00Z"}, {"id": "M68", "numero": 68, "etapa": "Fase de grupos", "grupo": "L", "casa": "Croácia", "fora": "Gana", "inicio": "2026-06-27T21:00:00Z"}, {"id": "M71", "numero": 71, "etapa": "Fase de grupos", "grupo": "K", "casa": "Colômbia", "fora": "Portugal", "inicio": "2026-06-27T23:30:00Z"}, {"id": "M72", "numero": 72, "etapa": "Fase de grupos", "grupo": "K", "casa": "RD Congo", "fora": "Uzbequistão", "inicio": "2026-06-27T23:30:00Z"}, {"id": "M69", "numero": 69, "etapa": "Fase de grupos", "grupo": "J", "casa": "Argélia", "fora": "Áustria", "inicio": "2026-06-28T02:00:00Z"}, {"id": "M70", "numero": 70, "etapa": "Fase de grupos", "grupo": "J", "casa": "Jordânia", "fora": "Argentina", "inicio": "2026-06-28T02:00:00Z"}, {"id": "M73", "numero": 73, "etapa": "32 avos", "grupo": "", "casa": "2º Grupo A", "fora": "2º Grupo B", "inicio": "2026-06-28T19:00:00Z"}, {"id": "M76", "numero": 76, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo C", "fora": "2º Grupo F", "inicio": "2026-06-29T17:00:00Z"}, {"id": "M74", "numero": 74, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo E", "fora": "3º A/B/C/D/F", "inicio": "2026-06-29T20:30:00Z"}, {"id": "M75", "numero": 75, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo F", "fora": "2º Grupo C", "inicio": "2026-06-30T01:00:00Z"}, {"id": "M78", "numero": 78, "etapa": "32 avos", "grupo": "", "casa": "2º Grupo E", "fora": "2º Grupo I", "inicio": "2026-06-30T17:00:00Z"}, {"id": "M77", "numero": 77, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo I", "fora": "3º C/D/F/G/H", "inicio": "2026-06-30T21:00:00Z"}, {"id": "M79", "numero": 79, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo A", "fora": "3º C/E/F/H/I", "inicio": "2026-07-01T01:00:00Z"}, {"id": "M80", "numero": 80, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo L", "fora": "3º E/H/I/J/K", "inicio": "2026-07-01T16:00:00Z"}, {"id": "M82", "numero": 82, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo G", "fora": "3º A/E/H/I/J", "inicio": "2026-07-01T20:00:00Z"}, {"id": "M81", "numero": 81, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo D", "fora": "3º B/E/F/I/J", "inicio": "2026-07-02T00:00:00Z"}, {"id": "M84", "numero": 84, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo H", "fora": "2º Grupo J", "inicio": "2026-07-02T19:00:00Z"}, {"id": "M83", "numero": 83, "etapa": "32 avos", "grupo": "", "casa": "2º Grupo K", "fora": "2º Grupo L", "inicio": "2026-07-02T23:00:00Z"}, {"id": "M85", "numero": 85, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo B", "fora": "3º E/F/G/I/J", "inicio": "2026-07-03T03:00:00Z"}, {"id": "M88", "numero": 88, "etapa": "32 avos", "grupo": "", "casa": "2º Grupo D", "fora": "2º Grupo G", "inicio": "2026-07-03T18:00:00Z"}, {"id": "M86", "numero": 86, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo J", "fora": "2º Grupo H", "inicio": "2026-07-03T22:00:00Z"}, {"id": "M87", "numero": 87, "etapa": "32 avos", "grupo": "", "casa": "1º Grupo K", "fora": "3º D/E/I/J/L", "inicio": "2026-07-04T01:30:00Z"}, {"id": "M90", "numero": 90, "etapa": "Oitavas", "grupo": "", "casa": "Vencedor M73", "fora": "Vencedor M75", "inicio": "2026-07-04T17:00:00Z"}, {"id": "M89", "numero": 89, "etapa": "Oitavas", "grupo": "", "casa": "Vencedor M74", "fora": "Vencedor M77", "inicio": "2026-07-04T21:00:00Z"}, {"id": "M91", "numero": 91, "etapa": "Oitavas", "grupo": "", "casa": "Vencedor M76", "fora": "Vencedor M78", "inicio": "2026-07-05T20:00:00Z"}, {"id": "M92", "numero": 92, "etapa": "Oitavas", "grupo": "", "casa": "Vencedor M79", "fora": "Vencedor M80", "inicio": "2026-07-06T00:00:00Z"}, {"id": "M93", "numero": 93, "etapa": "Oitavas", "grupo": "", "casa": "Vencedor M83", "fora": "Vencedor M84", "inicio": "2026-07-06T19:00:00Z"}, {"id": "M94", "numero": 94, "etapa": "Oitavas", "grupo": "", "casa": "Vencedor M81", "fora": "Vencedor M82", "inicio": "2026-07-07T00:00:00Z"}, {"id": "M95", "numero": 95, "etapa": "Oitavas", "grupo": "", "casa": "Vencedor M86", "fora": "Vencedor M88", "inicio": "2026-07-07T16:00:00Z"}, {"id": "M96", "numero": 96, "etapa": "Oitavas", "grupo": "", "casa": "Vencedor M85", "fora": "Vencedor M87", "inicio": "2026-07-07T20:00:00Z"}, {"id": "M97", "numero": 97, "etapa": "Quartas", "grupo": "", "casa": "Vencedor M89", "fora": "Vencedor M90", "inicio": "2026-07-09T20:00:00Z"}, {"id": "M98", "numero": 98, "etapa": "Quartas", "grupo": "", "casa": "Vencedor M93", "fora": "Vencedor M94", "inicio": "2026-07-10T19:00:00Z"}, {"id": "M99", "numero": 99, "etapa": "Quartas", "grupo": "", "casa": "Vencedor M91", "fora": "Vencedor M92", "inicio": "2026-07-11T21:00:00Z"}, {"id": "M100", "numero": 100, "etapa": "Quartas", "grupo": "", "casa": "Vencedor M95", "fora": "Vencedor M96", "inicio": "2026-07-12T01:00:00Z"}, {"id": "M101", "numero": 101, "etapa": "Semifinais", "grupo": "", "casa": "Vencedor M97", "fora": "Vencedor M98", "inicio": "2026-07-14T19:00:00Z"}, {"id": "M102", "numero": 102, "etapa": "Semifinais", "grupo": "", "casa": "Vencedor M99", "fora": "Vencedor M100", "inicio": "2026-07-15T19:00:00Z"}, {"id": "M103", "numero": 103, "etapa": "3º lugar", "grupo": "", "casa": "Perdedor M101", "fora": "Perdedor M102", "inicio": "2026-07-18T21:00:00Z"}, {"id": "M104", "numero": 104, "etapa": "Final", "grupo": "", "casa": "Vencedor M101", "fora": "Vencedor M102", "inicio": "2026-07-19T19:00:00Z"}];
const DEFAULT_HORARIOS = Object.fromEntries(JOGOS_OFICIAIS.map(j => [j.id, j.inicio]));

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function defaultDB(){
  return { users: [], palpites: [], resultados: {}, mataMata: [], horarios: DEFAULT_HORARIOS, jogosCustom: {} };
}
function readDB(){
  if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify(defaultDB(), null, 2));
  const db = JSON.parse(fs.readFileSync(DB, 'utf8'));
  const merged = { ...defaultDB(), ...db };
  merged.horarios = { ...DEFAULT_HORARIOS, ...(db.horarios || {}) };
  merged.jogosCustom = db.jogosCustom || {};
  return merged;
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
  try { return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(test)); } catch { return false; }
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
  try { return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return null; }
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
function jogoBloqueado(db, jogoId){
  const iso = db.horarios?.[jogoId] || DEFAULT_HORARIOS[jogoId];
  if(!iso) return false;
  const inicio = new Date(iso).getTime();
  if(Number.isNaN(inicio)) return false;
  return Date.now() >= inicio;
}
function jogosBloqueados(db){
  return Object.fromEntries(JOGOS_OFICIAIS.map(j => [j.id, jogoBloqueado(db, j.id)]));
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
    return { nome: p.nome, pontos, exatos, vencedores, palpites: Object.keys(p.palpites || {}).length, atualizadoEm: p.atualizadoEm || p.criadoEm };
  }).sort((a,b) => b.pontos - a.pontos || b.exatos - a.exatos || b.vencedores - a.vencedores || a.nome.localeCompare(b.nome));
}

app.get('/api/data', (req,res) => {
  const db = readDB();
  res.json({ jogos: JOGOS_OFICIAIS, jogosCustom: db.jogosCustom || {}, resultados: db.resultados, mataMata: db.mataMata, horarios: db.horarios || {}, bloqueados: jogosBloqueados(db), ranking: ranking(db), agora: new Date().toISOString() });
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
  const anterior = db.palpites.find(p => p.userId === req.user.id || p.nome.toLowerCase() === req.user.username.toLowerCase());
  const finais = { ...(anterior?.palpites || {}) };
  Object.entries(palpites || {}).forEach(([jogoId, valor]) => {
    if(!jogoBloqueado(db, jogoId)) finais[jogoId] = valor;
  });
  const tentativasBloqueadas = Object.keys(palpites || {}).filter(jogoId => jogoBloqueado(db, jogoId));
  const registro = { id: req.user.id, userId: req.user.id, nome: req.user.username, palpites: finais, criadoEm: anterior?.criadoEm || new Date().toISOString(), atualizadoEm: new Date().toISOString() };
  db.palpites = db.palpites.filter(p => p.userId !== req.user.id && p.nome.toLowerCase() !== req.user.username.toLowerCase());
  db.palpites.push(registro); writeDB(db);
  res.json({ ok:true, registro, bloqueadosIgnorados: tentativasBloqueadas, ranking: ranking(db) });
});

app.post('/api/resultados', adminAuth, (req,res) => {
  const db = readDB();
  db.resultados = req.body.resultados || {};
  db.mataMata = req.body.mataMata || [];
  db.horarios = { ...DEFAULT_HORARIOS, ...(req.body.horarios || {}) };
  db.jogosCustom = req.body.jogosCustom || db.jogosCustom || {};
  writeDB(db); res.json({ ok:true, ranking: ranking(db) });
});

app.get('/api/admin/palpiteiros', adminAuth, (req,res) => {
  const db = readDB();
  res.json({ palpites: db.palpites, users: db.users.map(u => ({ id: u.id, username: u.username, criadoEm: u.criadoEm })), ranking: ranking(db) });
});

app.post('/api/admin/reset-password', adminAuth, (req,res) => {
  const username = String(req.body.username || '').trim();
  const db = readDB();
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if(!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
  user.passwordHash = hashPassword(SENHA_RESET_PADRAO);
  user.senhaResetadaEm = new Date().toISOString();
  writeDB(db);
  res.json({ ok: true, username: user.username, novaSenha: SENHA_RESET_PADRAO });
});

app.listen(PORT, () => console.log(`Bolão da Copa rodando na porta ${PORT}`));
