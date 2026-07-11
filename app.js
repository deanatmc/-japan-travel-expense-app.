const RATE=0.21;
const SUPABASE_URL="https://tnebopdwcrawgbjdernw.supabase.co";
const SUPABASE_KEY="sb_publishable_c_vHmC5AiKfNJ1Qqr9eUbg_T8WzOLd3";
let client=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let expenses=[];

const $=s=>document.querySelector(s);
const yen=n=>'¥'+Number(n||0).toLocaleString();
const nt=n=>'NT$'+Number(n||0).toLocaleString();
const calc=n=>Math.round(Number(n||0)*RATE);
const topup=e=>e.category==='交通儲值';
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
function group(a,k){return a.reduce((m,x)=>((m[x[k]]||=[]).push(x),m),{})}

function setPill(state){
  const p=$('#connectionPill');
  p.className='pill'+(state==='ok'?' connected':state==='error'?' error':'');
  p.textContent=state==='ok'?'已連線':state==='error'?'連線失敗':'連線中';
}

async function load(){
  $('#status').textContent='正在讀取完整明細…';
  setPill('loading');
  const {data,error}=await client.from('expenses').select('*').order('date',{ascending:true}).order('created_at',{ascending:true});
  if(error){
    $('#status').textContent='讀取失敗：'+error.message;
    setPill('error');
    return;
  }
  expenses=data||[];
  $('#status').textContent=`同步完成，共 ${expenses.length} 筆明細。`;
  setPill('ok');
  render();
}

function renderStats(){
  const actual=sum(expenses.filter(e=>!topup(e)),e=>+e.jpy);
  const t=sum(expenses.filter(topup),e=>+e.jpy);
  $('#stats').innerHTML=[
    ['實際消費',yen(actual),'約 '+nt(calc(actual))],
    ['含儲值總額',yen(actual+t),'約 '+nt(calc(actual+t))],
    ['交通儲值',yen(t),'不列入實際消費'],
    ['明細筆數',expenses.length,'一項商品一筆']
  ].map(x=>`<div class="stat"><div class="label">${x[0]}</div><div class="value">${x[1]}</div><div class="caption">${x[2]}</div></div>`).join('');
}

function filters(){
  const d=$('#dayFilter').value,s=$('#storeFilter').value;
  const days=[...new Set(expenses.map(e=>e.day).filter(Boolean))];
  const stores=[...new Set(expenses.map(e=>e.store).filter(Boolean))].sort();
  $('#dayFilter').innerHTML='<option value="">全部 Day</option>'+days.map(x=>`<option>${x}</option>`).join('');
  $('#storeFilter').innerHTML='<option value="">全部店家</option>'+stores.map(x=>`<option>${x}</option>`).join('');
  $('#dayFilter').value=days.includes(d)?d:'';
  $('#storeFilter').value=stores.includes(s)?s:'';
}

function details(){
  const q=$('#search').value.toLowerCase(),df=$('#dayFilter').value,sf=$('#storeFilter').value;
  const data=expenses.filter(e=>{
    const text=[e.date,e.day,e.store,e.category,e.name,e.qty,e.jpy,e.twd,e.payment,e.note,e.created_at].join(' ').toLowerCase();
    return(!q||text.includes(q))&&(!df||e.day===df)&&(!sf||e.store===sf)
  });
  const html=Object.entries(group(data,'day')).map(([day,rows])=>{
    const total=sum(rows.filter(e=>!topup(e)),e=>+e.jpy);
    const stores=Object.entries(group(rows,'store')).map(([store,items])=>`<section class="store">
      <div class="store-head"><h4>${store}</h4><small>${items.length} 筆｜小計 ${yen(sum(items,e=>+e.jpy))}</small></div>
      ${items.map(e=>`<div class="item"><div><div class="name">${e.name||'(未命名商品)'}</div><div class="meta">日期：${e.date||''}｜類別：${e.category||''}｜數量：${e.qty??''}｜付款：${e.payment||''}<br>建立時間：${e.created_at?new Date(e.created_at).toLocaleString('zh-TW'):''}</div>${e.note?`<div class="note">${e.note}</div>`:''}</div><div class="money">${yen(e.jpy)}<small>${nt(e.twd??calc(e.jpy))}</small></div></div>`).join('')}
    </section>`).join('');
    return`<section class="day"><div class="day-head"><h3>${day||'未分類 Day'}</h3><div class="day-total">${yen(total)} / ${nt(calc(total))}</div></div>${stores}</section>`
  }).join('');
  $('#detailList').innerHTML=html||'<div class="empty">目前沒有符合條件的明細。</div>';
}

function render(){renderStats();filters();details()}
$('#refreshBtn').onclick=load;
$('#search').oninput=details;
$('#dayFilter').onchange=details;
$('#storeFilter').onchange=details;
load();
