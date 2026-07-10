const RATE=.21;
const client=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let parsedRows=[];

const $=s=>document.querySelector(s);
const yen=n=>'¥'+Number(n||0).toLocaleString();
const nt=n=>'NT$'+Number(n||0).toLocaleString();

function excelSerialToDate(serial){
  const p=XLSX.SSF.parse_date_code(Number(serial));
  if(!p)return null;
  return new Date(Date.UTC(p.y,p.m-1,p.d,p.H||0,p.M||0,Math.floor(p.S||0)));
}
function toDateOnly(value){
  if(value===null||value===undefined||value==='')return '';
  if(value instanceof Date&&!isNaN(value))return value.toISOString().slice(0,10);
  const s=String(value).trim();
  if(/^\d+(\.\d+)?$/.test(s)&&Number(s)>20000){
    const d=excelSerialToDate(Number(s));
    return d?d.toISOString().slice(0,10):'';
  }
  const d=new Date(s.replace(/\//g,'-'));
  return !isNaN(d)?d.toISOString().slice(0,10):s.slice(0,10);
}
function toTimestamp(value){
  if(value===null||value===undefined||value==='')return new Date().toISOString();
  if(value instanceof Date&&!isNaN(value))return value.toISOString();
  const s=String(value).trim();
  if(/^\d+(\.\d+)?$/.test(s)&&Number(s)>20000){
    const d=excelSerialToDate(Number(s));
    return d?d.toISOString():new Date().toISOString();
  }
  const d=new Date(s);
  return !isNaN(d)?d.toISOString():new Date().toISOString();
}
function normalizeRow(row){
  const jpy=Number(row['日幣']??row['jpy']??0);
  return {
    date:toDateOnly(row['日期']??row['date']??''),
    day:row['Day']||row['day']||'',
    store:row['店家']||row['store']||'',
    category:row['類別']||row['category']||'',
    name:row['商品名稱']||row['name']||'',
    qty:(row['數量']===''||row['數量']==null)?null:Number(row['數量']),
    jpy,
    twd:(row['台幣']===''||row['台幣']==null)?Math.round(jpy*RATE):Number(row['台幣']),
    payment:row['付款方式']||row['payment']||'',
    note:row['備註']||row['note']||'',
    created_at:toTimestamp(row['建立時間']??row['created_at']??'')
  };
}
async function previewExcel(){
  const file=$('#excelFile').files[0];
  if(!file){$('#importStatus').textContent='請先選擇檔案。';return;}
  const buf=await file.arrayBuffer();
  const wb=XLSX.read(buf,{type:'array',cellDates:true});
  const ws=wb.Sheets[wb.SheetNames[0]];
  const json=XLSX.utils.sheet_to_json(ws,{defval:'',raw:true});
  parsedRows=json.map(normalizeRow).filter(r=>r.date&&r.store&&r.name&&Number.isFinite(r.jpy));
  $('#importStatus').textContent=`已讀取 ${parsedRows.length} 筆，Excel 日期已轉換。`;
  $('#importBtn').disabled=!parsedRows.length;
  $('#previewArea').innerHTML=`<table class="preview"><thead><tr><th>日期</th><th>店家</th><th>商品</th><th>日幣</th><th>台幣</th><th>建立時間</th></tr></thead><tbody>${
    parsedRows.slice(0,10).map(r=>`<tr><td>${r.date}</td><td>${r.store}</td><td>${r.name}</td><td>${yen(r.jpy)}</td><td>${nt(r.twd)}</td><td>${new Date(r.created_at).toLocaleString('zh-TW')}</td></tr>`).join('')
  }</tbody></table>`;
}
async function importExcel(){
  if(!parsedRows.length)return;
  $('#importStatus').textContent=`正在寫入 ${parsedRows.length} 筆…`;
  for(let i=0;i<parsedRows.length;i+=200){
    const {error}=await client.from('expenses').insert(parsedRows.slice(i,i+200));
    if(error){$('#importStatus').textContent='寫入失敗：'+error.message;return;}
  }
  $('#importStatus').textContent=`匯入完成，共 ${parsedRows.length} 筆。`;
  await load();
}
async function load(){
  const {data,error}=await client.from('expenses').select('*').order('date',{ascending:true});
  if(error){$('#status').textContent='讀取失敗：'+error.message;return;}
  $('#status').textContent=`已連線，共 ${data.length} 筆。`;
  $('#stats').textContent=`總額：${yen(data.reduce((s,x)=>s+Number(x.jpy||0),0))}`;
  $('#detailList').innerHTML=data.map(x=>`<div class="item"><b>${x.name}</b><span>${x.date}｜${x.store}｜數量 ${x.qty??''}</span><div class="money">${yen(x.jpy)}／${nt(x.twd??Math.round(Number(x.jpy||0)*RATE))}</div></div>`).join('');
}
$('#previewBtn').onclick=previewExcel;
$('#importBtn').onclick=importExcel;
load();
