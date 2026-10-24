/* ===================== เครือข่ายตัวอักษร =====================
   ตัวอักษร 1 ตัวเป็นศูนย์กลาง → ทุกคำในคลังที่มีตัวนั้น (สีบอกระดับ HSK)
   + ตัวอื่นที่ใช้รากเดียวกัน + ตัวที่มีส่วนบอกเสียงเดียวกัน · แตะเพื่อไล่ต่อ */
let famC=null, famSel=null, famIdx=null;
function famIndex(){
  if(famIdx) return famIdx;
  famIdx={};
  WORDS.forEach(w=>[...new Set([...w[W.h]])].forEach(c=>{ (famIdx[c]=famIdx[c]||[]).push(w); }));
  return famIdx;
}
function openFam(c){ famC=[...c].find(x=>famIndex()[x])||[...c][0]; famSel=null; currentView="fam"; syncTabs("fam"); render(); window.scrollTo(0,0); }
function famRad(c){
  const ci=window.CHARINFO&&CHARINFO[c]; if(!ci) return null;
  const idx=famIndex();
  const same=Object.keys(idx).filter(x=>x!==c&&CHARINFO[x]&&CHARINFO[x].r===ci.r);
  const snd=Object.keys(idx).filter(x=>x!==c&&CHARINFO[x]&&(CHARINFO[x].p===c||(ci.p&&(CHARINFO[x].p===ci.p||x===ci.p))));
  return {r:ci.r, name:(window.RADTH&&RADTH[ci.r])||"", p:ci.p||null, same:same, snd:snd};
}
function famGraph(c,ws,ex){
  ex=ex||[];
  const W0=600,H0=440,cx=300,cy=220, n=ws.length+ex.length;
  const two=n>10;
  const pos=[...ws,...ex].map((w,i)=>{
    const a=-Math.PI/2+i*2*Math.PI/n, r=two?(i%2?178:118):150;
    return [cx+r*Math.cos(a)*1.25, cy+r*Math.sin(a)];
  });
  const lines=ws.map((w,i)=>`<line x1="${cx}" y1="${cy}" x2="${pos[i][0].toFixed(1)}" y2="${pos[i][1].toFixed(1)}" stroke="var(--lv${lvOfDay(w[W.d])})" stroke-width="${famSel===w[W.h]?3:1.6}" opacity="${famSel&&famSel!==w[W.h]?.35:.85}"/>`).join("");
  const nodes=ws.map((w,i)=>{
    const [x,y]=pos[i], up=y<cy, sel=famSel===w[W.h], L=lvOfDay(w[W.d]);
    return `<g class="fam-node" data-famw="${esc(w[W.h])}" role="button" tabindex="0" aria-label="${esc(w[W.h])} ${esc(w[W.p])} ${esc(w[W.t])} HSK ${L}">
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sel?10:7.5}" fill="var(--lv${L})" stroke="var(--surface)" stroke-width="2"/>
      <text x="${x.toFixed(1)}" y="${(up?y-14:y+30).toFixed(1)}" text-anchor="middle" class="hanzi" font-size="${w[W.h].length>2?20:24}" font-weight="700" fill="var(--ink)">${esc(w[W.h])}</text>
      <circle cx="${x.toFixed(1)}" cy="${(up?y-20:y+18).toFixed(1)}" r="26" fill="transparent"/></g>`;
  }).join("");
  // ตัวที่ใช้รากเดียวกัน/เสียงเดียวกัน — เส้นประ แตะเพื่อไล่ต่อ
  const exl=ex.map((x,j)=>{ const [px,py]=pos[ws.length+j], up=py<cy;
    return `<line x1="${cx}" y1="${cy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="4 4" opacity=".6"/>
    <g class="fam-node" data-famc="${esc(x)}" role="button" tabindex="0" aria-label="ไปที่ ${esc(x)} (รากเดียวกัน)">
      <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7" fill="var(--surface)" stroke="var(--muted)" stroke-width="2"/>
      <text x="${px.toFixed(1)}" y="${(up?py-14:py+30).toFixed(1)}" text-anchor="middle" class="hanzi" font-size="22" fill="var(--muted)">${esc(x)}</text>
      <circle cx="${px.toFixed(1)}" cy="${(up?py-20:py+18).toFixed(1)}" r="26" fill="transparent"/></g>`; }).join("");
  return `<svg class="fam-svg" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="คำที่มี ${esc(c)} ทั้งหมด ${ws.length} คำ">${lines}${exl}
    <circle cx="${cx}" cy="${cy}" r="38" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5"/>
    <text x="${cx}" y="${cy+14}" text-anchor="middle" class="hanzi" font-size="40" font-weight="700" fill="var(--accent)">${esc(c)}</text>
    ${nodes}</svg>`;
}
function famHTML(){
  const idx=famIndex();
  if(!famC||!idx[famC]) famC="学";
  const c=famC, ws=idx[c].slice().sort((a,b)=>a[W.d]-b[W.d]);
  const g=GLOSS[c], self=WORDS.find(w=>w[W.h]===c);
  const rad=famRad(c);
  // คำน้อย → เติมตัวรากเดียวกัน/เสียงเดียวกันให้ภาพไม่โล่ง (รวมไม่เกิน 12 จุด)
  const ex=ws.length<8&&rad?[...new Set([...rad.snd,...rad.same])].slice(0,12-ws.length):[];
  const chip=x=>`<button class="chip-btn fam-chip" data-famc="${esc(x)}"><span class="hanzi">${esc(x)}</span></button>`;
  const rows=ws.map(w=>{
    const L=lvOfDay(w[W.d]);
    const others=[...new Set([...w[W.h]])].filter(x=>x!==c&&idx[x]);
    return `<div class="vrow fam-row ${famSel===w[W.h]?"on":""}" data-famrow="${esc(w[W.h])}">
      <span class="fam-dot" style="background:var(--lv${L})"></span>
      <div class="h hanzi">${esc(w[W.h])}</div>
      <div class="m"><div class="p">${esc(w[W.p])}</div><div class="t">${esc(w[W.t])}</div>
        ${others.length?`<div class="fam-jump">ไปต่อที่ ${others.map(chip).join("")}</div>`:""}</div>
      <span class="chip" style="background:color-mix(in srgb,var(--lv${L}) 16%,transparent);color:var(--ink)">HSK ${L}</span>
      ${canSpeak()?`<button class="speak" data-say="${esc(w[W.h])}" aria-label="ฟังเสียง ${esc(w[W.h])}">${IC.spk}</button>`:""}
    </div>`;
  }).join("");
  const byLv=[1,2,3].map(n=>ws.filter(w=>lvOfDay(w[W.d])===n).length);
  return `
  <section class="card">
    <div class="bx-top">
      <h2>เครือข่ายตัวอักษร<span class="tag">จำทีละตัว แล้วเดาคำใหม่ได้เอง</span></h2>
      <button class="btn ghost small" id="fam-back">← คำศัพท์</button>
    </div>
    <form id="fam-form" class="fam-form" autocomplete="off">
      <input class="search" id="fam-q" placeholder="พิมพ์ตัวจีน เช่น 学 หรือ 电" maxlength="8" aria-label="ค้นหาตัวอักษร">
      <button class="btn" type="submit">ดู</button>
    </form>
    <div class="fam-head">
      <span class="hanzi fam-big">${esc(c)}</span>
      <div class="fam-meta">
        ${g?`<b class="pin">${esc(g[0])}</b><span>${esc(self?self[W.t]:"(ใช้ประกอบคำ)")}</span>`:""}
        <span class="small muted">อยู่ใน ${ws.length} คำ · HSK 1: ${byLv[0]} · HSK 2: ${byLv[1]} · HSK 3: ${byLv[2]}</span>
      </div>
      <div class="fam-tools">
        ${canSpeak()?`<button class="speak" data-say="${esc(c)}" aria-label="ฟังเสียง ${esc(c)}">${IC.spk}</button>`:""}
        <button class="speak" id="fam-strokes" aria-label="ดูลำดับขีด ${esc(c)}">${IC.pen}</button>
      </div>
    </div>
    ${famGraph(c,ws,ex)}
    <div class="fam-legend"><span><i style="background:var(--lv1)"></i>HSK 1</span><span><i style="background:var(--lv2)"></i>HSK 2</span><span><i style="background:var(--lv3)"></i>HSK 3</span>${ex.length?`<span><i style="border:2px dashed var(--muted)"></i>ตัวรากเดียวกัน/เสียงคล้าย</span>`:""}<span class="muted">แตะจุดหรือแถวเพื่อเลือกคำ · แตะตัวจีนในแถวเพื่อไล่ต่อ</span></div>
  </section>
  <section class="card">
    <h2>คำที่มี ${esc(c)}<span class="tag">${ws.length} คำ เรียงตามบทเรียน</span></h2>
    ${rows}
  </section>
  ${rad?`<section class="card">
    <h2>จำด้วยรากศัพท์<span class="tag">部首 · ส่วนประกอบที่บอกหมวดความหมาย</span></h2>
    <p class="fam-rad"><span class="hanzi fam-radch">${esc(rad.r)}</span><span><b>ราก ${esc(rad.r)} · ${esc(rad.name)}</b><br><span class="small muted">ตัวอักษรที่มีรากนี้มักเกี่ยวกับ “${esc(rad.name)}”</span></span></p>
    ${rad.same.length?`<div class="chips">${rad.same.slice(0,40).map(chip).join("")}</div>`:`<p class="small muted" style="margin:0">ในคลังคำตอนนี้ยังไม่มีตัวอื่นที่ใช้รากนี้</p>`}
    ${rad.snd.length||rad.p?`<h3 class="bx-h3">ส่วนบอกเสียง${rad.p?` · <span class="hanzi">${esc(rad.p)}</span>`:""}</h3>
      <p class="small muted" style="margin:0 0 8px">ตัวอักษรที่มีส่วนบอกเสียงเดียวกันมักออกเสียงคล้ายกัน</p>
      <div class="chips">${rad.snd.slice(0,30).map(x=>`<button class="chip-btn fam-chip" data-famc="${esc(x)}"><span class="hanzi">${esc(x)}</span> <span class="pin small">${esc((GLOSS[x]||[""])[0]||"")}</span></button>`).join("")}</div>`:""}
  </section>`:""}`;
}
function bindFam(){
  const v=$("#view");
  $("#fam-back").addEventListener("click",()=>{ currentView="vocab"; syncTabs("vocab"); render(); });
  $("#fam-form").addEventListener("submit",e=>{ e.preventDefault(); const q=$("#fam-q").value.trim(); if(!q) return;
    const c=[...q].find(x=>famIndex()[x]); if(c) openFam(c); else toast("ยังไม่มี “"+q+"” ในคลังคำ HSK 1–3"); });
  $("#fam-strokes").addEventListener("click",()=>openStrokes(famC));
  v.querySelectorAll("[data-famc]").forEach(b=>{ b.addEventListener("click",e=>{ e.stopPropagation(); openFam(b.dataset.famc); });
    if(b.tagName==="g") b.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openFam(b.dataset.famc);} }); });
  v.querySelectorAll("[data-say]").forEach(b=>b.addEventListener("click",e=>{ e.stopPropagation(); speak(b.dataset.say); }));
  const pick=h=>{ famSel=famSel===h?null:h; render(); if(famSel&&audioOK()) speak(h); const r=v.querySelector(`[data-famrow="${CSS.escape(h)}"]`); if(r) r.scrollIntoView({block:"nearest",behavior:"smooth"}); };
  v.querySelectorAll("[data-famw]").forEach(n=>{ n.addEventListener("click",()=>pick(n.dataset.famw)); n.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); pick(n.dataset.famw);} }); });
  v.querySelectorAll("[data-famrow]").forEach(r=>r.addEventListener("click",()=>pick(r.dataset.famrow)));
}
