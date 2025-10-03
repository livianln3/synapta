// js/index.js
/* ---------- FUNÇÕES GERAIS ---------- */
function goTo(screen){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  if(screen==='datepicker') document.getElementById('screen-datepicker').classList.add('active');
  else document.getElementById('screen-info').classList.add('active');

  // atualiza estado visual da navbar
  document.querySelectorAll('.nav-button').forEach(b=>{
    b.classList.remove('active');
    b.setAttribute('aria-current','false');
  });
  const btnId = screen==='datepicker' ? 'nav-calendar' : 'nav-info';
  const navBtn = document.getElementById(btnId);
  if(navBtn){
    navBtn.classList.add('active');
    navBtn.setAttribute('aria-current','true');
  }

  // se for pra info, garante que os inputs sejam renderizados com o estado atual
  if(screen==='info') renderInfo();
}

function showToast(msg,duration=2000){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg;
  t.style.opacity='1';
  t.style.pointerEvents = 'auto';
  if(window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(()=>{
    t.style.opacity='0';
    t.style.pointerEvents = 'none';
  }, duration);
}

/* ---------- STORAGE ---------- */
const STORAGE_KEY = 'app_saude_v2';
const now = new Date();
const defaults = {
  nome: '',
  peso: '',
  altura: '',
  sangue: '',
  remedios: [],
  condicoes: '',
  alergias: [],
  laudos: [],
  receitas: [],
  calendar: { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }
};
function load(){
  try{
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : JSON.parse(JSON.stringify(defaults));
  }catch(e){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return JSON.parse(JSON.stringify(defaults));
  }
}
function save(state){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch(e){ console.error('Erro ao salvar', e); }
}
let state = load();

/* ---------- INPUTS ---------- */
const inputNome=document.getElementById('input-nome');
const inputPeso=document.getElementById('input-peso');
const inputAltura=document.getElementById('input-altura');
const inputSangue=document.getElementById('input-sangue');
const inputRemedios=document.getElementById('input-remedios');
const inputCondicoes=document.getElementById('input-condicoes');
const inputAlergias=document.getElementById('input-alergias');
const laudosBox=document.getElementById('laudos');
const receitasBox=document.getElementById('receitas');

/* ---------- RENDER INFO (com mensagens separadas) ---------- */
function renderInfo(){
  inputNome.value = state.nome||'';
  inputPeso.value = state.peso||'';
  inputAltura.value = state.altura||'';
  inputSangue.value = state.sangue||'';
  inputRemedios.value = (state.remedios||[]).join(', ');
  inputCondicoes.value = state.condicoes||'';
  inputAlergias.value = (state.alergias||[]).join(', ');

  function renderList(arr,container,emptyMessage){
    container.innerHTML='';
    if(!arr || !arr.length){ container.textContent=emptyMessage; return; }
    arr.forEach((item,i)=>{
      const div=document.createElement('div'); div.className='list-item';
      const content=document.createElement('div'); content.className='list-item-content';
      content.innerHTML = `<div style="font-size:12px;color:var(--muted)">${item.date} • ${item.type}</div><div style="margin-top:6px">${item.text}</div>`;
      const delBtn=document.createElement('button'); delBtn.textContent='Remover';
      delBtn.addEventListener('click',()=>{
        arr.splice(i,1);
        save(state);
        renderInfo();
        showToast('Item removido');
      });
      div.appendChild(content); div.appendChild(delBtn);
      container.appendChild(div);
    });
  }
  renderList(state.laudos,laudosBox,'Nenhum laudo adicionado.');
  renderList(state.receitas,receitasBox,'Nenhuma receita adicionada.');
}

/* ---------- NORMALIZAÇÃO ---------- */
function normalizePeso(val){
  if(!val) return null;
  let v=val.replace(',', '.').replace(/\s*kg/i,'').trim();
  const n=parseFloat(v); if(isNaN(n)||n<=0||n>500) return null;
  return (Math.round(n*100)/100).toString().replace('.',',')+'kg';
}
function normalizeAltura(val){
  if(!val) return null;
  let v=val.replace(',', '.').trim();
  if(v.endsWith('cm')){ const cm=parseFloat(v); if(isNaN(cm)) return null; v=(cm/100).toString(); }
  const n=parseFloat(v); if(isNaN(n)||n<0.4||n>2.5) return null;
  return n.toString().replace('.',',');
}
function normalizeSangue(val){
  if(!val) return null;
  const v=val.trim().toUpperCase().replace(/\s+/g,'');
  return ['A+','A-','B+','B-','AB+','AB-','O+','O-'].includes(v)?v:null;
}

/* ---------- EVENTOS SALVAR/RESET ---------- */
document.getElementById('save-info').addEventListener('click',()=>{
  const nomeVal=inputNome.value.trim();
  const pesoVal=normalizePeso(inputPeso.value);
  const alturaVal=normalizeAltura(inputAltura.value);
  const sangueVal=normalizeSangue(inputSangue.value);
  const remediosArr=inputRemedios.value.split(',').map(s=>s.trim()).filter(Boolean);
  const condicoesVal=inputCondicoes.value.trim();
  const alergiasArr=inputAlergias.value.split(',').map(s=>s.trim()).filter(Boolean);

  const erros=[];
  if(!nomeVal||nomeVal.length<2) erros.push('Nome inválido (mínimo 2 caracteres).');
  if(!pesoVal) erros.push('Peso inválido.');
  if(!alturaVal) erros.push('Altura inválida.');
  if(!sangueVal) erros.push('Tipo sanguíneo inválido.');

  if(erros.length){ alert(erros.join('\n')); return; }

  state.nome=nomeVal;
  state.peso=pesoVal;
  state.altura=alturaVal;
  state.sangue=sangueVal;
  state.remedios=remediosArr;
  state.condicoes=condicoesVal;
  state.alergias=alergiasArr;
  save(state);
  renderInfo();
  showToast('Informações salvas');

  // mostrar conquista (som + vibração)
  showAchievement({ title: 'Informações salvas', text: 'Seus dados foram atualizados.' });
});

document.getElementById('reset-info').addEventListener('click',()=>{
  if(confirm('Resetar informações médicas para valores padrão? (O calendário NÃO será alterado)')){
    // resetar APENAS as informações médicas — manter state.calendar intacto
    state.nome = defaults.nome;
    state.peso = defaults.peso;
    state.altura = defaults.altura;
    state.sangue = defaults.sangue;
    state.remedios = Array.isArray(defaults.remedios) ? [...defaults.remedios] : [];
    state.condicoes = defaults.condicoes;
    state.alergias = Array.isArray(defaults.alergias) ? [...defaults.alergias] : [];
    state.laudos = Array.isArray(defaults.laudos) ? [...defaults.laudos] : [];
    state.receitas = Array.isArray(defaults.receitas) ? [...defaults.receitas] : [];
    save(state);
    renderInfo();
    showToast('Informações médicas resetadas');
  }
});

/* ---------- MODAL ---------- */
const modal=document.getElementById('modal');
let previousActive=null;
document.getElementById('open-add').addEventListener('click',()=>{
  document.getElementById('modal-date').valueAsDate=new Date();
  previousActive=document.activeElement;
  modal.style.display='flex'; modal.setAttribute('aria-hidden','false');
  document.getElementById('modal-text').focus();
});
document.getElementById('modal-close').addEventListener('click',()=>{ modal.style.display='none'; modal.setAttribute('aria-hidden','true'); if(previousActive) previousActive.focus(); });

document.getElementById('modal-add').addEventListener('click',()=>{
  const type=document.getElementById('modal-type').value;
  const date=document.getElementById('modal-date').value||new Date().toISOString().slice(0,10);
  const text=document.getElementById('modal-text').value.trim();
  if(!text){
    showToast('Preencha a descrição');
    document.getElementById('modal-text').focus();
    return;
  }
  if(type==='laudo') {
    state.laudos.unshift({type,date,text});
  } else {
    state.receitas.unshift({type,date,text});
  }
  save(state); renderInfo(); document.getElementById('modal-text').value=''; modal.style.display='none'; modal.setAttribute('aria-hidden','true');

  // notificação sonora + vibração + pop
  showAchievement({ title: type === 'laudo' ? 'Laudo adicionado' : 'Receita adicionada', text: (type === 'laudo' ? 'Laudo salvo com sucesso.' : 'Receita salva com sucesso.') });
});

/* ---------- EXPORTAÇÃO PARA JS, SEM BOTÃO VISUAL ---------- */
function exportData(){
  const dataStr=JSON.stringify(state,null,2);
  const blob=new Blob([dataStr],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='dados_medicos.json'; a.click();
  URL.revokeObjectURL(url);
  showToast('Dados exportados');
}

/* ---------- POP DE CONQUISTA (SOM + VIBRAÇÃO) ---------- */
function showAchievement({ title='Conquista!' , text='Você completou uma ação.', sound=true, vibrate=true } = {}){
  // Se em Cordova e quiser usar diálogo nativo (mantemos som/vibração)
  if(window.cordova && navigator.notification){
    try{
      navigator.notification.alert(text, null, title, 'OK');
    }catch(e){
      alert(title + '\n\n' + text);
    }
    if(vibrate && navigator.vibrate) try{ navigator.vibrate(200); }catch(e){}
    if(sound){ playAchievementSound(); }
    return;
  }

  // Web popup
  const popup = document.getElementById('achievement');
  const tEl = document.getElementById('ach-title');
  const dEl = document.getElementById('ach-desc');
  tEl.textContent = title;
  dEl.textContent = text;

  popup.style.display = 'flex';
  setTimeout(()=> popup.classList.add('show'), 10);

  if(vibrate && navigator.vibrate) try{ navigator.vibrate(200); }catch(e){}
  if(sound) playAchievementSound();

  if(window._achTimeout) clearTimeout(window._achTimeout);
  window._achTimeout = setTimeout(()=>{
    popup.classList.remove('show');
    popup.classList.add('hide');
    setTimeout(()=>{ popup.classList.remove('hide'); popup.style.display='none'; }, 500);
  }, 4000);
}

document.getElementById('ach-close').addEventListener('click', ()=>{
  const popup = document.getElementById('achievement');
  popup.classList.remove('show');
  popup.classList.add('hide');
  setTimeout(()=>{ popup.classList.remove('hide'); popup.style.display='none'; }, 350);
});

function playAchievementSound(){
  const audio = document.getElementById('ach-audio');
  if(!audio) return;
  try{
    audio.currentTime = 0;
    const p = audio.play();
    if(p && typeof p.catch === 'function') p.catch(()=>{/* autoplay blocked; ignore */});
  }catch(e){}
}

/* ---------- CALENDÁRIO ---------- */
(function(){
  const monthNames=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const shortMonth=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const weekNames=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

  const today = new Date();
  const init = (state.calendar && typeof state.calendar.year === 'number') ? state.calendar : { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };

  let selectedDate=new Date(init.year,init.month,init.day);
  let viewMonth=selectedDate.getMonth(), viewYear=selectedDate.getFullYear();
  const calendarEl=document.getElementById('calendar');
  const monthLabelEl=document.getElementById('month-label');
  const headerYearEl=document.getElementById('header-year');
  const headerWeekdayEl=document.getElementById('header-weekday');
  const headerMonthdayEl=document.getElementById('header-monthday');

  function updateHeader(){
    headerYearEl.textContent=selectedDate.getFullYear();
    headerWeekdayEl.textContent=weekNames[selectedDate.getDay()]+',';
    headerMonthdayEl.textContent=shortMonth[selectedDate.getMonth()]+' '+selectedDate.getDate();
  }

  function renderCalendar(month,year){
    calendarEl.innerHTML='';
    const first=new Date(year,month,1);
    const firstWeekDay=first.getDay();
    const daysInMonth=new Date(year,month+1,0).getDate();
    const todayLocal=new Date();

    for(let i=0;i<firstWeekDay;i++){ const e=document.createElement('div'); e.className='day empty'; e.setAttribute('role','gridcell'); e.setAttribute('aria-hidden','true'); calendarEl.appendChild(e); }
    for(let d=1;d<=daysInMonth;d++){
      const btn=document.createElement('button'); btn.type='button'; btn.className='day'; btn.textContent=d;
      const thisDate=new Date(year,month,d);
      if(selectedDate.getFullYear()===thisDate.getFullYear() && selectedDate.getMonth()===thisDate.getMonth() && selectedDate.getDate()===thisDate.getDate()) btn.classList.add('selected');
      if(todayLocal.getFullYear()===thisDate.getFullYear() && todayLocal.getMonth()===thisDate.getMonth() && todayLocal.getDate()===thisDate.getDate()) btn.classList.add('today');
      btn.setAttribute('role','gridcell'); btn.setAttribute('tabindex','0'); btn.setAttribute('aria-label',`${d} de ${monthNames[month]} de ${year}`);
      btn.setAttribute('aria-selected',btn.classList.contains('selected')?'true':'false');
      btn.addEventListener('click',()=>{
        selectedDate=new Date(year,month,d);
        state.calendar={year,month,day:d}; save(state); updateHeader(); renderCalendar(viewMonth,viewYear);
      });
      calendarEl.appendChild(btn);
    }
    const totalCells=firstWeekDay+daysInMonth;
    const remainder=(7-(totalCells%7))%7;
    for(let k=0;k<remainder;k++){ const e=document.createElement('div'); e.className='day empty'; e.setAttribute('role','gridcell'); e.setAttribute('aria-hidden','true'); calendarEl.appendChild(e); }
    monthLabelEl.textContent=monthNames[month]+' '+year;
  }

  document.getElementById('prev').addEventListener('click',()=>{ viewMonth--; if(viewMonth<0){viewMonth=11; viewYear--;} renderCalendar(viewMonth,viewYear); });
  document.getElementById('next').addEventListener('click',()=>{ viewMonth++; if(viewMonth>11){viewMonth=0; viewYear++;} renderCalendar(viewMonth,viewYear); });

  document.getElementById('cancel').addEventListener('click',()=>{
    const init = (state.calendar && typeof state.calendar.year === 'number') ? state.calendar : { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
    selectedDate=new Date(init.year,init.month,init.day);
    viewMonth=selectedDate.getMonth(); viewYear=selectedDate.getFullYear();
    updateHeader(); renderCalendar(viewMonth,viewYear); showToast('Operação cancelada');
  });
  document.getElementById('ok').addEventListener('click',()=>{ showToast('Data selecionada: '+selectedDate.toLocaleDateString('pt-BR')); });

  updateHeader(); renderCalendar(viewMonth,viewYear);
})();

/* ---------- ROLLBACK / VOLTAR PARA CALENDAR ---------- */
document.getElementById('back-to-cal').addEventListener('click',()=>{ goTo('datepicker'); });

/* ---------- NAVBAR HANDLERS (inicialização) ---------- */
const navCalendar = document.getElementById('nav-calendar');
const navInfo = document.getElementById('nav-info');
if(navCalendar && navInfo){
  navCalendar.addEventListener('click', ()=>goTo('datepicker'));
  navInfo.addEventListener('click', ()=>goTo('info'));
  // marcar a aba inicial (Calendário) no carregamento
  navCalendar.classList.add('active');
  navCalendar.setAttribute('aria-current','true');
}

/* ---------- RENDER INICIAL ---------- */
renderInfo();

/* ---------- Cordova deviceready (opcional) ---------- */
document.addEventListener('deviceready', function() {
  console.log('Cordova pronto');
  const audio = document.getElementById('ach-audio');
  if(audio) audio.load();
}, false);