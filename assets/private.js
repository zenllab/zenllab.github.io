
// Password-protected private page with localStorage persistence.
// ⚠️ Client-side password gate is not secure; use for light privacy only.
// Change PASSWORD below.
const PASSWORD = "zenlab";  // TODO: change this

function qs(s,root=document){ return root.querySelector(s); }
function qsa(s,root=document){ return [...root.querySelectorAll(s)]; }

function todayStr(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

// --- Password gate ---
document.addEventListener('DOMContentLoaded', () => {
  const gate = qs('#gate');
  const app  = qs('#app');
  const pw   = qs('#pw');
  const enter= qs('#enterBtn');

  function unlock(){
    if (pw.value === PASSWORD){
      gate.style.display='none'; app.style.display='block';
      initApp();
    }else{
      pw.value=''; pw.placeholder='Wrong password'; pw.focus();
    }
  }
  enter?.addEventListener('click', unlock);
  pw?.addEventListener('keydown', e => { if(e.key==='Enter') unlock(); });
});

// --- Persistence helpers ---
function keyReport(date){ return `zenlab.report.${date}`; }
const TODO_KEY = 'zenlab.todo';

function saveReport(date, text){
  localStorage.setItem(keyReport(date), text);
}
function loadReport(date){
  return localStorage.getItem(keyReport(date)) || '';
}
function loadTodos(){
  try{ return JSON.parse(localStorage.getItem(TODO_KEY) || '[]'); }catch{ return []; }
}
function saveTodos(items){
  localStorage.setItem(TODO_KEY, JSON.stringify(items));
}

// --- Calendar ---
function buildCalendar(mount, year, month){ // month 0-11
  const first = new Date(year, month, 1);
  const last  = new Date(year, month+1, 0);
  const start = new Date(first); start.setDate(first.getDate() - ((first.getDay()+6)%7)); // Monday-first
  const end   = new Date(last);  end.setDate(last.getDate() + (7-((last.getDay()+6)%7)-1));

  const today = todayStr();

  let html = `<header>
    <button class="small" id="prevMonth">◀</button>
    <div><b>${year}</b> / ${String(month+1).padStart(2,'0')}</div>
    <button class="small" id="nextMonth">▶</button>
  </header>
  <table aria-label="Calendar">
    <thead><tr>${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<th>${d}</th>`).join('')}</tr></thead>
    <tbody>`;

  const d = new Date(start);
  while (d <= end){
    html += '<tr>';
    for (let i=0;i<7;i++){
      const ds = d.toISOString().slice(0,10);
      const inMonth = d.getMonth()===month;
      const hasNote = !!localStorage.getItem(keyReport(ds));
      html += `<td class="${ds===today?'today':''}" style="${inMonth?'':'opacity:.5'}">` +
              `<a href="#" data-date="${ds}">${ds.slice(8,10)}${hasNote?' •':''}</a></td>`;
      d.setDate(d.getDate()+1);
    }
    html += '</tr>';
  }
  html += '</tbody></table>';

  mount.innerHTML = html;
  qs('#prevMonth', mount).addEventListener('click', () => {
    const prev = new Date(year, month-1, 1); buildCalendar(mount, prev.getFullYear(), prev.getMonth());
  });
  qs('#nextMonth', mount).addEventListener('click', () => {
    const next = new Date(year, month+1, 1); buildCalendar(mount, next.getFullYear(), next.getMonth());
  });
  qsa('a[data-date]', mount).forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const ds = a.getAttribute('data-date');
      const dateInput = qs('#reportDate'); const ta = qs('#reportText');
      dateInput.value = ds;
      ta.value = loadReport(ds);
      ta.focus();
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });
}

// --- App init ---
function initApp(){
  // Date + editor
  const dateInput = qs('#reportDate'); const ta = qs('#reportText');
  const saveBtn = qs('#saveReport'); const status = qs('#saveStatus');
  dateInput.value = todayStr();
  ta.value = loadReport(dateInput.value);
  saveBtn.addEventListener('click', ()=>{
    saveReport(dateInput.value, ta.value);
    status.textContent = 'Saved ✓';
    setTimeout(()=> status.textContent = '', 1500);
    // Rebuild calendar markers
    const now = new Date(); buildCalendar(qs('#calendarWrap'), now.getFullYear(), now.getMonth());
  });
  dateInput.addEventListener('change', ()=>{
    ta.value = loadReport(dateInput.value);
  });

  // Todo
  const input = qs('#todoInput'); const list = qs('#todoList');
  function renderTodos(){
    const items = loadTodos();
    list.innerHTML = items.map((t,i)=>`
      <li class="${t.done?'done':''}">
        <input type="checkbox" data-i="${i}" ${t.done?'checked':''}>
        <span class="t">${t.text}</span>
        <span style="margin-left:auto"></span>
        <button class="small" data-del="${i}">Delete</button>
      </li>`).join('');
    qsa('input[type="checkbox"][data-i]', list).forEach(cb=>{
      cb.addEventListener('change', ()=>{
        const idx = +cb.getAttribute('data-i'); const items = loadTodos();
        if(items[idx]){ items[idx].done = cb.checked; saveTodos(items); renderTodos(); }
      });
    });
    qsa('button[data-del]', list).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = +btn.getAttribute('data-del'); const items = loadTodos();
        items.splice(idx,1); saveTodos(items); renderTodos();
      });
    });
  }
  renderTodos();
  input.addEventListener('keydown', e=>{
    if(e.key==='Enter' && input.value.trim()){
      const items = loadTodos(); items.unshift({text:input.value.trim(), done:false});
      saveTodos(items); input.value=''; renderTodos();
    }
  });
  qs('#clearDone').addEventListener('click', ()=>{
    const items = loadTodos().filter(t=>!t.done); saveTodos(items); renderTodos();
  });

  // Export/Import
  qs('#exportData').addEventListener('click', ()=>{
    const data = {
      todos: loadTodos(),
      reports: Object.entries(localStorage).filter(([k,v])=>k.startsWith('zenlab.report.')).reduce((acc,[k,v])=>{acc[k]=v;return acc;},{})
    };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'zenlab-private-backup.json'; a.click();
    URL.revokeObjectURL(url);
  });
  qs('#importData').addEventListener('change', (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const data = JSON.parse(reader.result);
        if (data.todos) localStorage.setItem('zenlab.todo', JSON.stringify(data.todos));
        if (data.reports){
          Object.entries(data.reports).forEach(([k,v])=> localStorage.setItem(k,v));
        }
        renderTodos();
        const now = new Date(); buildCalendar(qs('#calendarWrap'), now.getFullYear(), now.getMonth());
        alert('Import done.');
      }catch{ alert('Invalid JSON.'); }
    };
    reader.readAsText(file);
  });

  // Calendar init
  const now = new Date(); buildCalendar(qs('#calendarWrap'), now.getFullYear(), now.getMonth());
}
