const grupos = {
 A:['México','África do Sul','Coreia do Sul','Tchéquia'],
 B:['Canadá','Bósnia e Herzegovina','Qatar','Suíça'],
 C:['Brasil','Marrocos','Escócia','Haiti'],
 D:['Estados Unidos','Paraguai','Austrália','Turquia'],
 E:['Alemanha','Curaçao','Costa do Marfim','Equador'],
 F:['Holanda','Japão','Suécia','Tunísia'],
 G:['Bélgica','Egito','Irã','Nova Zelândia'],
 H:['Espanha','Cabo Verde','Arábia Saudita','Uruguai'],
 I:['França','Senegal','Iraque','Noruega'],
 J:['Argentina','Argélia','Áustria','Jordânia'],
 K:['Portugal','RD Congo','Uzbequistão','Colômbia'],
 L:['Inglaterra','Croácia','Gana','Panamá']
};
const ordem = [[0,1],[2,3],[0,2],[3,1],[3,0],[1,2]];
const jogos = Object.entries(grupos).flatMap(([g,t])=>ordem.map((p,i)=>({id:`${g}${i+1}`,grupo:g,casa:t[p[0]],fora:t[p[1]]})));
const fases = ['32 avos','Oitavas','Quartas','Semifinais','3º lugar','Final'];
let estado={palpites:[],resultados:{},mataMata:[]};
let usuario='';
const $=id=>document.getElementById(id);
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2300)}
async function carregar(){try{estado=await fetch('/api/data').then(r=>r.json())}catch(e){estado=JSON.parse(localStorage.getItem('bolao')||'{"palpites":[],"resultados":{},"mataMata":[]}')}}
function placarInputs(prefix,j,vals={}){return `<div class="match"><span class="team">${j.casa}</span><input type="number" min="0" data-k="${prefix}_${j.id}_c" value="${vals.c??''}"><b>x</b><input type="number" min="0" data-k="${prefix}_${j.id}_f" value="${vals.f??''}"><span class="team">${j.fora}</span></div>`}
function renderPalpites(){ $('jogos').innerHTML='<div class="grid">'+Object.keys(grupos).map(g=>`<div class="group"><h3>Grupo ${g}</h3>${jogos.filter(j=>j.grupo===g).map(j=>placarInputs('p',j,{})).join('')}</div>`).join('')+'</div>' }
function lerInputs(prefix){let obj={};jogos.forEach(j=>{let c=document.querySelector(`[data-k="${prefix}_${j.id}_c"]`)?.value;let f=document.querySelector(`[data-k="${prefix}_${j.id}_f"]`)?.value;if(c!==''&&f!=='')obj[j.id]={c:Number(c),f:Number(f)}});return obj}
function show(sec){['login','app','admin'].forEach(id=>$(id).classList.toggle('hidden',id!==sec))}
$('entrar').onclick=()=>{usuario=$('nome').value.trim(); if(!usuario)return toast('Digite um nome para entrar.'); $('saudacao').textContent=`Palpites de ${usuario}`; show('app'); renderPalpites()}
$('salvar').onclick=async()=>{let palpites=lerInputs('p');let body={nome:usuario,palpites};try{await fetch('/api/palpites',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}catch(e){estado.palpites=estado.palpites.filter(p=>p.nome.toLowerCase()!==usuario.toLowerCase());estado.palpites.push({...body,id:Date.now()+''});localStorage.setItem('bolao',JSON.stringify(estado))}toast('Palpites salvos!')}
$('adminBtn').onclick=async()=>{await carregar();show('admin');renderAdmin('resultados')}; $('voltar').onclick=()=>show('login');
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderAdmin(b.dataset.tab)});
function renderAdmin(tab){let el=$('adminContent'); if(tab==='resultados'){el.innerHTML='<div class="grid">'+Object.keys(grupos).map(g=>`<div class="group"><h3>Grupo ${g}</h3>${jogos.filter(j=>j.grupo===g).map(j=>placarInputs('r',j,estado.resultados[j.id]||{})).join('')}</div>`).join('')+'</div>'}
 if(tab==='mata'){el.innerHTML=fases.map(f=>`<h3 class="stageTitle">${f}</h3><div class="grid">${[...Array(f==='32 avos'?16:f==='Oitavas'?8:f==='Quartas'?4:f==='Semifinais'?2:1)].map((_,i)=>{let m=estado.mataMata.find(x=>x.fase===f&&x.n===i+1)||{};return `<div class="group"><b>${f} - Jogo ${i+1}</b><div class="match"><input placeholder="Time A" data-m="${f}_${i}_a" value="${m.a||''}"><input type="number" min="0" data-m="${f}_${i}_ga" value="${m.ga??''}"><b>x</b><input type="number" min="0" data-m="${f}_${i}_gb" value="${m.gb??''}"><input placeholder="Time B" data-m="${f}_${i}_b" value="${m.b||''}"></div></div>`}).join('')}</div>`).join('')}
 if(tab==='palpiteiros'){el.innerHTML=`<table class="table"><tr><th>Nome</th><th>Palpites preenchidos</th><th>Data</th></tr>${estado.palpites.map(p=>`<tr><td>${p.nome}</td><td>${Object.keys(p.palpites||{}).length}/72</td><td>${new Date(p.criadoEm).toLocaleString('pt-BR')}</td></tr>`).join('')}</table>`}}
$('salvarAdmin').onclick=async()=>{estado.resultados=lerInputs('r');estado.mataMata=[];fases.forEach(f=>{let total=f==='32 avos'?16:f==='Oitavas'?8:f==='Quartas'?4:f==='Semifinais'?2:1;for(let i=0;i<total;i++){let get=s=>document.querySelector(`[data-m="${f}_${i}_${s}"]`)?.value||''; if(get('a')||get('b'))estado.mataMata.push({fase:f,n:i+1,a:get('a'),b:get('b'),ga:get('ga'),gb:get('gb')})}});try{await fetch('/api/resultados',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resultados:estado.resultados,mataMata:estado.mataMata})})}catch(e){localStorage.setItem('bolao',JSON.stringify(estado))}toast('Resultados atualizados!')}
carregar();
