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
let estado={resultados:{},mataMata:[],ranking:[],horarios:{},bloqueados:{}};
let token=localStorage.getItem('bolao_token')||'';
let adminToken=localStorage.getItem('bolao_admin_token')||'';
let user=JSON.parse(localStorage.getItem('bolao_user')||'null');
let meusPalpites={};
const $=id=>document.getElementById(id);
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2600)}
async function api(url,opts={}){const headers={'Content-Type':'application/json',...(opts.headers||{})};if(opts.token)headers.Authorization='Bearer '+opts.token;const r=await fetch(url,{...opts,headers});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.erro||'Erro na requisição');return data}
async function carregar(){estado=await api('/api/data')}
function show(sec){['login','app','ranking','adminLogin','admin'].forEach(id=>$(id).classList.toggle('hidden',id!==sec));$('sairBtn').classList.toggle('hidden',!user&&!adminToken)}
function formatHorario(iso){return iso?new Date(iso).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'Horário não definido'}
function toLocalInputValue(iso){if(!iso)return '';const d=new Date(iso);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)}
function fromLocalInputValue(v){return v?new Date(v).toISOString():''}
function placarInputs(prefix,j,vals={}){const locked=prefix==='p'&&estado.bloqueados?.[j.id];return `<div class="match ${locked?'locked':''}"><span class="team">${j.casa}</span><input type="number" min="0" ${locked?'disabled':''} data-k="${prefix}_${j.id}_c" value="${vals.c??''}"><b>x</b><input type="number" min="0" ${locked?'disabled':''} data-k="${prefix}_${j.id}_f" value="${vals.f??''}"><span class="team">${j.fora}</span>${prefix==='p'?`<small>${locked?'🔒 Palpite bloqueado':'⏰ '+formatHorario(estado.horarios?.[j.id])}</small>`:''}${prefix==='r'?`<label class="timeLabel">Início <input type="datetime-local" data-h="${j.id}" value="${toLocalInputValue(estado.horarios?.[j.id])}"></label>`:''}</div>`}
function renderPalpites(){ $('jogos').innerHTML='<div class="grid">'+Object.keys(grupos).map(g=>`<div class="group"><h3>Grupo ${g}</h3>${jogos.filter(j=>j.grupo===g).map(j=>placarInputs('p',j,meusPalpites[j.id]||{})).join('')}</div>`).join('')+'</div>' }
function lerInputs(prefix){let obj={};jogos.forEach(j=>{let c=document.querySelector(`[data-k="${prefix}_${j.id}_c"]`)?.value;let f=document.querySelector(`[data-k="${prefix}_${j.id}_f"]`)?.value;if(c!==''&&f!=='')obj[j.id]={c:Number(c),f:Number(f)}});return obj}
function renderRanking(target='rankingContent'){const rows=(estado.ranking||[]).map((r,i)=>`<tr><td class="${i===0?'rank1':''}">${i+1}º</td><td>${r.nome}</td><td><b>${r.pontos}</b></td><td>${r.exatos}</td><td>${r.vencedores}</td><td>${r.palpites}/72</td></tr>`).join('');$(target).innerHTML=`<table class="table"><tr><th>Pos.</th><th>Participante</th><th>Pontos</th><th>Exatos</th><th>Vencedor/empate</th><th>Palpites</th></tr>${rows||'<tr><td colspan="6">Ainda não há participantes no ranking.</td></tr>'}</table><p class="meta">Critério: 10 pontos por placar exato e 5 pontos por vencedor ou empate correto. Desempate: mais exatos, depois mais vencedores.</p>`}
async function abrirApp(){await carregar();const data=await api('/api/me/palpites',{token});meusPalpites=data.palpites||{};$('saudacao').textContent=`Palpites de ${user.username}`;show('app');renderPalpites()}
async function loginOuCadastro(cadastro=false){try{const username=$('user').value.trim();const password=$('pass').value;const data=await api(cadastro?'/api/register':'/api/login',{method:'POST',body:JSON.stringify({username,password})});token=data.token;user=data.user;localStorage.setItem('bolao_token',token);localStorage.setItem('bolao_user',JSON.stringify(user));toast(cadastro?'Conta criada!':'Login feito!');abrirApp()}catch(e){toast(e.message)}}
$('loginBtn').onclick=()=>loginOuCadastro(false);$('registerBtn').onclick=()=>loginOuCadastro(true);
$('salvar').onclick=async()=>{try{const palpites=lerInputs('p');const data=await api('/api/palpites',{method:'POST',token,body:JSON.stringify({palpites})});estado.ranking=data.ranking;toast(data.bloqueadosIgnorados?.length?'Palpites salvos. Jogos bloqueados não foram alterados.':'Palpites salvos!');await carregar();renderPalpites()}catch(e){toast(e.message)}}
$('rankingBtn').onclick=async()=>{await carregar();show('ranking');renderRanking()};$('verRanking').onclick=$('rankingBtn').onclick;$('voltarLogin').onclick=()=>user?abrirApp():show('login');
$('sairBtn').onclick=()=>{token='';adminToken='';user=null;localStorage.clear();show('login')};
$('adminBtn').onclick=()=>{show(adminToken?'admin':'adminLogin'); if(adminToken){carregar().then(()=>renderAdmin('resultados'))}};
$('adminLoginBtn').onclick=async()=>{try{const data=await api('/api/admin/login',{method:'POST',body:JSON.stringify({username:$('adminUser').value.trim(),password:$('adminPass').value})});adminToken=data.token;localStorage.setItem('bolao_admin_token',adminToken);await carregar();show('admin');renderAdmin('resultados');toast('Admin conectado!')}catch(e){toast(e.message)}};
$('voltar').onclick=()=>show('login');
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderAdmin(b.dataset.tab)});
function renderAdmin(tab){let el=$('adminContent'); if(tab==='resultados'){el.innerHTML='<div class="grid">'+Object.keys(grupos).map(g=>`<div class="group"><h3>Grupo ${g}</h3>${jogos.filter(j=>j.grupo===g).map(j=>placarInputs('r',j,estado.resultados[j.id]||{})).join('')}</div>`).join('')+'</div>'}
 if(tab==='mata'){el.innerHTML=fases.map(f=>`<h3 class="stageTitle">${f}</h3><div class="grid">${[...Array(f==='32 avos'?16:f==='Oitavas'?8:f==='Quartas'?4:f==='Semifinais'?2:1)].map((_,i)=>{let m=estado.mataMata.find(x=>x.fase===f&&x.n===i+1)||{};return `<div class="group"><b>${f} - Jogo ${i+1}</b><div class="match"><input placeholder="Time A" data-m="${f}_${i}_a" value="${m.a||''}"><input type="number" min="0" data-m="${f}_${i}_ga" value="${m.ga??''}"><b>x</b><input type="number" min="0" data-m="${f}_${i}_gb" value="${m.gb??''}"><input placeholder="Time B" data-m="${f}_${i}_b" value="${m.b||''}"></div></div>`}).join('')}</div>`).join('')}
 if(tab==='rankingAdmin'){renderRanking('adminContent')}
 if(tab==='palpiteiros'){api('/api/admin/palpiteiros',{token:adminToken}).then(data=>{el.innerHTML=`<table class="table"><tr><th>Nome</th><th>Palpites</th><th>Pontos</th><th>Data</th></tr>${(data.ranking||[]).map(r=>`<tr><td>${r.nome}</td><td>${r.palpites}/72</td><td>${r.pontos}</td><td>${r.atualizadoEm?new Date(r.atualizadoEm).toLocaleString('pt-BR'):''}</td></tr>`).join('')}</table>`}).catch(e=>toast(e.message))}}
$('salvarAdmin').onclick=async()=>{try{estado.resultados=lerInputs('r');estado.horarios={};document.querySelectorAll('[data-h]').forEach(inp=>{if(inp.value)estado.horarios[inp.dataset.h]=fromLocalInputValue(inp.value)});estado.mataMata=[];fases.forEach(f=>{let total=f==='32 avos'?16:f==='Oitavas'?8:f==='Quartas'?4:f==='Semifinais'?2:1;for(let i=0;i<total;i++){let get=s=>document.querySelector(`[data-m="${f}_${i}_${s}"]`)?.value||''; if(get('a')||get('b'))estado.mataMata.push({fase:f,n:i+1,a:get('a'),b:get('b'),ga:get('ga'),gb:get('gb')})}});const data=await api('/api/resultados',{method:'POST',token:adminToken,body:JSON.stringify({resultados:estado.resultados,mataMata:estado.mataMata,horarios:estado.horarios})});estado.ranking=data.ranking;toast('Resultados atualizados e ranking recalculado!')}catch(e){toast(e.message)}};
if(user&&token)abrirApp().catch(()=>show('login'));else carregar().catch(()=>{});
