function yen(n){ return "¥" + Number(n).toLocaleString(); }
function twd(n){ return "NT$" + Math.round(Number(n) * RATE).toLocaleString(); }
function isTopup(e){ return e.category === "交通儲值"; }

function groupBy(arr, key){
  return arr.reduce((m, x) => ((m[x[key]] ||= []).push(x), m), {});
}
function sum(arr, fn){ return arr.reduce((s, x) => s + fn(x), 0); }

function renderStats(){
  const actual = sum(EXPENSES.filter(e => !isTopup(e)), e => e.jpy);
  const topup = sum(EXPENSES.filter(isTopup), e => e.jpy);
  const total = actual + topup;
  document.getElementById("stats").innerHTML = `
    <div class="stat"><div class="label">實際消費</div><div class="big">${yen(actual)}</div><div class="label">約 ${twd(actual)}</div></div>
    <div class="stat"><div class="label">含儲值總額</div><div class="big">${yen(total)}</div><div class="label">約 ${twd(total)}</div></div>
    <div class="stat"><div class="label">Suica/ICOCA 儲值</div><div class="big">${yen(topup)}</div><div class="label">不列入實際消費</div></div>
    <div class="stat"><div class="label">明細筆數</div><div class="big">${EXPENSES.length}</div><div class="label">目前版本</div></div>
  `;
}

function renderCategoryStats(){
  const map = {};
  EXPENSES.filter(e => !isTopup(e)).forEach(e => map[e.category] = (map[e.category] || 0) + e.jpy);
  document.getElementById("categoryStats").innerHTML = Object.entries(map)
    .sort((a,b) => b[1]-a[1])
    .map(([k,v]) => `<div class="chip"><b>${k}</b><span>${yen(v)} / ${twd(v)}</span></div>`).join("");
}

function renderStoreStats(){
  const map = {};
  EXPENSES.filter(e => !isTopup(e)).forEach(e => map[e.store] = (map[e.store] || 0) + e.jpy);
  document.getElementById("storeStats").innerHTML = Object.entries(map)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 12)
    .map(([k,v]) => `<div class="rank"><span>${k}</span><b>${yen(v)}</b></div>`).join("");
}

function renderList(){
  const byDay = groupBy(EXPENSES, "day");
  document.getElementById("expenseList").innerHTML = Object.entries(byDay).map(([day, rows]) => {
    const dayActual = sum(rows.filter(e => !isTopup(e)), e => e.jpy);
    const body = rows.map((e, i) => `
      <tr class="data-row" data-search="${[e.date,e.day,e.store,e.category,e.name,e.qty,e.payment,e.note].join(" ").toLowerCase()}">
        <td>${i+1}</td><td>${e.date}</td><td>${e.store}</td><td>${e.category}</td>
        <td class="name">${e.name}</td><td>${e.qty ?? ""}</td>
        <td class="num">${yen(e.jpy)}</td><td class="num">${twd(e.jpy)}</td>
        <td>${e.payment}</td><td>${e.note || ""}</td>
      </tr>`).join("");
    return `
      <section class="day-section">
        <h2>${day}｜實際消費 ${yen(dayActual)} / 約 ${twd(dayActual)}</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>日期</th><th>店家</th><th>類別</th><th>商品名稱</th><th>數量</th><th>日幣</th><th>台幣約</th><th>付款</th><th>備註</th></tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      </section>`;
  }).join("");
}

function filterRows(){
  const q = document.getElementById("search").value.trim().toLowerCase();
  document.querySelectorAll(".data-row").forEach(row => {
    row.classList.toggle("hidden", q && !row.dataset.search.includes(q));
  });
}

document.getElementById("search").addEventListener("input", filterRows);
renderStats();
renderCategoryStats();
renderStoreStats();
renderList();
