const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, 'db.json');
app.use(cors()); app.use(express.json({limit:'2mb'})); app.use(express.static(path.join(__dirname,'public')));
function readDB(){ if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({palpites:[], resultados:{}, mataMata:[]},null,2)); return JSON.parse(fs.readFileSync(DB,'utf8')); }
function writeDB(data){ fs.writeFileSync(DB, JSON.stringify(data,null,2)); }
app.get('/api/data',(req,res)=>res.json(readDB()));
app.post('/api/palpites',(req,res)=>{ const db=readDB(); const {nome,palpites}=req.body; if(!nome || !palpites) return res.status(400).json({erro:'Nome e palpites são obrigatórios'}); const registro={id:Date.now().toString(),nome,palpites,criadoEm:new Date().toISOString()}; db.palpites = db.palpites.filter(p=>p.nome.toLowerCase()!==nome.toLowerCase()); db.palpites.push(registro); writeDB(db); res.json({ok:true,registro}); });
app.post('/api/resultados',(req,res)=>{ const db=readDB(); db.resultados = req.body.resultados || {}; db.mataMata = req.body.mataMata || []; writeDB(db); res.json({ok:true}); });
app.listen(PORT,()=>console.log(`Bolão da Copa rodando na porta ${PORT}`));
