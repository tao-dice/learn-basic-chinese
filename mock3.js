/* ===================== ข้อสอบเต็ม HSK 2 / HSK 3 (ระบบใหม่ 3.0) =====================
   โครงจากตัวอย่างทางการ 汉考国际 ธ.ค. 2025 · พาร์ทละ 100 คะแนน รวม 300
   HSK 2: ฟัง 25 (5+10+10) อ่าน 25 (5+5+10+5 มีพินอินทุกประโยค) เขียน 10 (5+5) · ~52 นาที
   HSK 3: ฟัง 30 (10×3) อ่าน 30 (10×3) เขียน 10 (5+5) · 73 นาที
   ใช้เอนจินเดิม: ฟัง = lg (hearRun), อ่าน+เขียน = sg (sentRun, kind "fullread3")
   shortcut: ไม่มีรูปภาพ → ตอนที่ใช้รูปแทนด้วยคำถามใกล้เคียง, เขียนด้วยมือ → เลือก/เรียงแทน (ตรวจลายมือไม่ได้) */
const FMSPEC={
  2:{min:52, from:52, to:84, pin:true,
     hear:[["ls",5],["tf",10],["ld",10]],               // ตอน 1 ประโยค→รูป · ตอน 2 บทสนทนา→รูป · ตอน 3 บทสนทนา+คำถาม
     read:[["trans",5],["fill",5],["dlg",10],["th2zh",5]], // ตอน 1 ประโยค→รูป · ตอน 2 เติมคำ · ตอน 3 จับคู่ประโยค · ตอน 4 อ่านแล้วตอบ
     write:[["wcomp",5],["wch",5]]},                    // ตอน 1 เติมส่วนประกอบของตัวอักษร · ตอน 2 เขียนตัวที่หายไปจากพินอิน
  3:{min:73, from:52, to:166, pin:false,
     hear:[["ls",10],["ld",10],["tf",10]],              // ตอน 1 บทสนทนา→รูป · ตอน 2 บทสนทนา+คำถาม · ตอน 3 เรื่องสั้น+คำถาม
     read:[["dlg",10],["fill",10],["trans",10]],         // ตอน 1 จับคู่คำตอบ · ตอน 2 เติมคำ · ตอน 3 บทอ่านสั้น
     write:[["wch",5],["ord",5]]}                       // ตอน 1 ตัวที่หายไปจากพินอิน · ตอน 2 แต่งประโยคจากคำ+รูป
};
const FM_KIND_TH={trans:"อ่านแล้วเลือกความหมาย",th2zh:"อ่านแล้วเลือกประโยคที่ตรง",fill:"เติมคำในช่องว่าง",dlg:"จับคู่ประโยค",
  wch:"เติมตัวอักษรจากพินอิน",wcomp:"เติมส่วนประกอบของตัวอักษร",ord:"สร้างประโยคจากคำที่กำหนด"};
const FM3_PUNC=/^[，。？！]$/;
function fmSpec(){ return FMSPEC[fm&&fm.lv]||FMSPEC[3]; }
const fmN=a=>a.reduce((s,x)=>s+x[1],0);
function fmPartOf(parts,i){ let n=0; for(let k=0;k<parts.length;k++){ n+=parts[k][1]; if(i<n) return k+1; } return parts.length; }
function fmHearPart(i){ return fmPartOf(fmSpec().hear,i); }
function fm3Pools(){
  const S=fmSpec(), inLv=x=>x.day>=S.from&&x.day<=S.to;
  const st=STMT_ITEMS.filter(inLv), dl=DLG_ITEMS.filter(inLv);
  return {st:st.length>=30?st:STMT_ITEMS, dl:dl.length>=10?dl:DLG_ITEMS, to:S.to};
}
function startHear3(){
  const S=fmSpec(), P=fm3Pools(), qs=[];
  S.hear.forEach(([k,n])=>{ for(let i=0;i<n;i++) qs.push(k==="ld"?hqDlg(deckPick("h3d",P.dl),P.dl):k==="tf"?hqTF(deckPick("h3s",P.st),P.st):hqSent(deckPick("h3s",P.st),P.st,k)); });
  lg={qs:qs,i:0,score:0,mode:"mock3",twice:true,full:true};
  tokReset(); currentView="hearRun"; syncTabs("hearRun"); render();
}
function stripTone(p){return String(p).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();}
/* เขียน: ประโยคเว้นตัวอักษร 1 ตัว มีพินอินบอก → เลือกตัวที่ถูก (ตัวลวงเสียงเดียวกันก่อน) */
function sgWch(item,maxDay){
  const idx=item.c.map((t,i)=>i).filter(i=>{const t=item.c[i], g=GLOSS[t]; return [...t].length===1&&g&&g[2]>0&&item.c.join("").split(t).length===2;}); // ตัวที่โผล่ซ้ำในประโยคจะเฉลยตัวเอง
  if(!idx.length) return null;
  const bi=idx[Math.floor(Math.random()*idx.length)], ans=item.c[bi], py=GLOSS[ans][0];
  const singles=WORDS.filter(w=>[...w[W.h]].length===1&&w[W.d]<=(maxDay||N_DAYS)&&w[W.h]!==ans&&!item.c.includes(w[W.h]));
  const homo=shuffle(singles.filter(w=>stripTone(w[W.p])===stripTone(py)));
  const rest=shuffle(singles.filter(w=>stripTone(w[W.p])!==stripTone(py)));
  const opts=shuffle([ans].concat(homo.concat(rest).slice(0,3).map(w=>w[W.h])));
  return {type:"wch",item:item,bi:bi,ans:ans,py:py,opts:opts,answered:false,picked:-1};
}
/* เขียน HSK 2 ตอน 1: คำที่ตัวหนึ่งเหลือแค่ราก + พินอิน → เลือกตัวเต็ม (ตัวลวงรากเดียวกัน ต้องรู้ส่วนที่เหลือ) */
function sgComp(w,maxDay){
  const chars=[...w[W.h]], idx=famIndex();
  const peers=c=>{ const ci=CHARINFO[c]; return ci&&ci.r!==c?Object.keys(idx).filter(x=>x!==c&&x!==ci.r&&CHARINFO[x]&&CHARINFO[x].r===ci.r&&idx[x].some(v=>v[W.d]<=maxDay)):[]; };
  const ok=chars.map((c,i)=>i).filter(i=>peers(chars[i]).length>=3&&chars.indexOf(chars[i])===chars.lastIndexOf(chars[i]));
  if(!ok.length) return null;
  const bi=ok[Math.floor(Math.random()*ok.length)], c=chars[bi];
  return {type:"wcomp",w:w,bi:bi,ans:c,r:CHARINFO[c].r,opts:shuffle([c].concat(shuffle(peers(c)).slice(0,3))),answered:false,picked:-1};
}
/* เขียน HSK 3 ตอน 2: ให้คำ HSK 3 หนึ่งคำ → เรียงคำเป็นประโยค (ตรวจเทียบประโยคต้นฉบับแบบต่อสตริง) */
function sgOrd(item){
  const words=item.c.filter(t=>!FM3_PUNC.test(t));
  const target=words.slice().sort((a,b)=>(GLOSS[b]?GLOSS[b][2]:0)-(GLOSS[a]?GLOSS[a][2]:0))[0];
  let tiles, g=0;
  do{ tiles=shuffle(words.map((t,i)=>i)); }while(g++<20&&tiles.map(i=>words[i]).join("")===words.join(""));
  return {type:"ord",item:item,words:words,end:item.c[item.c.length-1],target:target,tiles:tiles,built:[],answered:false};
}
function startRead3(){
  const S=fmSpec(), P=fm3Pools(), qs=[];
  const retry=f=>{ let q=null,g=0; while(!q&&g++<80) q=f(); return q; };
  const ordPool=P.st.filter(x=>!x.c.includes("，")&&x.c.length>=6&&x.c.length<=9&&x.c.some(t=>GLOSS[t]&&GLOSS[t][2]>=85));
  const compPool=WORDS.filter(w=>w[W.d]<=P.to);
  S.read.concat(S.write).forEach(([k,n])=>{ for(let i=0;i<n;i++){
    let q;
    if(k==="dlg") q=sgDlg(deckPick("r3d",P.dl),P.dl);
    else if(k==="fill") q=sgFill(deckPick("r3s",P.st));
    else if(k==="trans"||k==="th2zh") q=sgTrans(deckPick("r3s",P.st),P.st,k==="th2zh"?"th2zh":"zh2th");
    else if(k==="wch") q=retry(()=>sgWch(deckPick("r3s",P.st),P.to));
    else if(k==="wcomp") q=retry(()=>sgComp(deckPick("r3c",compPool),P.to));
    else q=sgOrd(deckPick("r3o",ordPool.length?ordPool:P.st));
    if(q){ q.fk=k; qs.push(q); }
  }});
  sg={qs:qs,i:0,score:0,kind:"fullread3",sit:"all",full:true,pinAll:S.pin}; tokReset();
  currentView="sentRun"; syncTabs("sentRun"); render();
}
function fm3Label(i){
  const S=fmSpec(), nr=fmN(S.read), k=(sg.qs[i]||{}).fk;
  const part=i<nr?"阅读 ตอนที่ "+fmPartOf(S.read,i):"书写 ตอนที่ "+fmPartOf(S.write,i-nr);
  return part+(FM_KIND_TH[k]?" · "+FM_KIND_TH[k]:"");
}
function fm3Split(){
  const on=sg&&sg.full&&sg.kind==="fullread3", nr=fmN(fmSpec().read);
  fm.rs=on?sg.qs.slice(0,nr).filter(q=>q.ok).length:0;
  fm.ws=on?sg.qs.slice(nr).filter(q=>q.ok).length:0;
}
function fm3Pts(){
  const S=fmSpec(), hasL=fm.ls>=0, nh=fmN(S.hear), nr=fmN(S.read);
  const nw=Math.max(1,(sg&&sg.kind==="fullread3")?sg.qs.length-nr:fmN(S.write));
  const lp=hasL?Math.round(fm.ls/nh*100):0, rp=Math.round(Math.max(0,fm.rs)/nr*100), wp=Math.round(Math.max(0,fm.ws)/nw*100);
  return {hasL:hasL,lp:lp,rp:rp,wp:wp,nh:nh,nr:nr,nw:nw,total:lp+rp+wp,max:hasL?300:200};
}
function fmOptsHanzi(q,size){
  const a=q.answered;
  return q.opts.map((o,i)=>{
    let cls=""; if(a){ if(o===q.ans) cls="right"; else if(i===q.picked) cls="wrongpick"; }
    const g=GLOSS[o]||["",""];
    return `<div class="opt-s ${cls}" data-opt="${i}" role="button" tabindex="0">
      <span class="hanzi" style="font-size:${size}px;font-weight:700">${esc(o)}</span>
      ${a&&g[0]?`<div class="small muted" style="margin-top:2px">${esc(g[0])} · ${esc(g[1])}</div>`:""}</div>`;
  }).join("");
}
function wchView(q){
  const a=q.answered;
  const stim=`<p class="pin" style="text-align:center;margin:0 0 6px">ช่องว่างอ่านว่า <b style="font-size:20px">${esc(q.py)}</b></p>`+
    sentHTML(q.item.c,"s",{blank:q.bi,filled:a})+(a?`<p class="sent-th">${esc(q.item.t)}</p>`:"");
  return {stim:stim,prompt:a?"":"เลือกตัวอักษรที่ถูกต้องเติมในช่องว่าง (ข้อสอบจริงต้องเขียนเอง)",opts:fmOptsHanzi(q,26)};
}
function compView(q){
  const a=q.answered, chars=[...q.w[W.h]];
  const word=chars.map((c,i)=>i!==q.bi?`<span>${esc(c)}</span>`:a?`<span style="color:var(--accent)">${esc(c)}</span>`
    :`<span class="comp-blank">${esc(q.r)}<i>＋?</i></span>`).join("");
  const stim=`<p class="pin" style="text-align:center;margin:0 0 6px;font-size:20px">${esc(q.w[W.p])}</p>
    <div class="q-word hanzi comp-word">${word}</div>
    <p class="small muted" style="text-align:center;margin:6px 0 0">ตัวที่ขาดมีราก <b class="hanzi">${esc(q.r)}</b>${window.RADTH&&RADTH[q.r]?" ("+esc(RADTH[q.r])+")":""}</p>
    ${a?`<p class="sent-th">${esc(q.w[W.t])}</p>`:""}`;
  return {stim:stim,prompt:a?"":"เลือกตัวอักษรที่ถูกต้อง (ข้อสอบจริงต้องเขียนส่วนที่ขาดเอง)",opts:fmOptsHanzi(q,28)};
}
function ordView(q){
  const a=q.answered, g=GLOSS[q.target]||["",""];
  const built=q.built.map((ti,k)=>`<button class="chip-btn ord-tile" data-ordrm="${k}" ${a?"disabled":""}><span class="hanzi">${esc(q.words[ti])}</span></button>`).join("");
  const left=q.tiles.filter(ti=>!q.built.includes(ti)).map(ti=>`<button class="chip-btn ord-tile" data-ordadd="${ti}"><span class="hanzi">${esc(q.words[ti])}</span></button>`).join("");
  const stim=`<div class="hear-claim">คำที่กำหนด <b class="hanzi" style="font-size:24px">${esc(q.target)}</b> <span class="small muted">${esc(g[0])} · ${esc(g[1])}</span></div>
    <div class="ord-built ${a?(q.ok?"right":"wrongpick"):""}">${built||`<span class="small muted">แตะคำด้านล่างเรียงเป็นประโยค</span>`}<span class="hanzi">${esc(q.end)}</span></div>
    ${a?`<div class="hear-script">${sentHTML(q.item.c,"t",{pin:true})}<p class="sent-th">${esc(q.item.t)}</p></div>`:""}`;
  const opts=a?"":`<div class="ord-left">${left}</div>
    <div class="btn-row" style="justify-content:center;margin-top:10px">
      <button class="btn ghost small" id="ord-clear" ${q.built.length?"":"disabled"}>ล้าง</button>
      <button class="btn small" id="ord-check" ${q.built.length===q.words.length?"":"disabled"}>ตรวจคำตอบ</button></div>`;
  return {stim:stim,prompt:a?"":"เรียงคำให้เป็นประโยคที่ถูกต้อง (ข้อสอบจริงให้แต่งประโยคเองจากคำ + รูป)",opts:opts};
}
function ordCheck(){
  const q=sg.qs[sg.i]; if(q.answered) return;
  q.answered=true; q.ok=q.built.map(i=>q.words[i]).join("")===q.words.join("");
  if(q.ok) sg.score++;
  save(); render();
}
function bindOrd(){
  const q=sg.qs[sg.i]; if(q.type!=="ord"||q.answered) return;
  const v=$("#view");
  v.querySelectorAll("[data-ordadd]").forEach(b=>b.addEventListener("click",()=>{ q.built.push(+b.dataset.ordadd); render(); }));
  v.querySelectorAll("[data-ordrm]").forEach(b=>b.addEventListener("click",()=>{ q.built.splice(+b.dataset.ordrm,1); render(); }));
  $("#ord-clear").addEventListener("click",()=>{ q.built=[]; render(); });
  $("#ord-check").addEventListener("click",ordCheck);
}
function fullDone3HTML(){
  const P=fm3Pts(), S=fmSpec(), d=fm.done||{}, pass=P.total>=P.max*0.6;
  const msg=d.timeup?"หมดเวลา "+S.min+" นาที — นับคะแนนเท่าที่ทำได้"
    :(pass?"ผ่านเกณฑ์อ้างอิง! ระดับ HSK "+fm.lv+" มาถูกทางแล้ว 🎉":"ยังไม่ถึงเกณฑ์ — ดูพาร์ทที่อ่อนกว่าแล้วเก็บเพิ่ม");
  return `
  <section class="card" style="text-align:center;padding:32px 20px">
    <p class="small muted" style="margin:0">ข้อสอบเต็ม HSK ${fm.lv} ระบบใหม่ · เกณฑ์อ้างอิง ${P.max*0.6}/${P.max} (60%)</p>
    <div class="score-big" style="color:var(--${pass?"jade":"wrong"})">${P.total}/${P.max}</div>
    <p class="score-note">${msg}</p>
    <div class="exam-info" style="max-width:380px;margin:16px auto 0">
      <div><b>การฟัง 听力</b><span>${P.hasL?P.lp+"/100 · ถูก "+fm.ls+"/"+P.nh+" ข้อ":"ข้าม (ไม่มีเสียงอ่าน)"}</span></div>
      <div><b>การอ่าน 阅读</b><span>${P.rp}/100 · ถูก ${Math.max(0,fm.rs)}/${P.nr} ข้อ</span></div>
      <div><b>การเขียน 书写</b><span>${P.wp}/100 · ถูก ${Math.max(0,fm.ws)}/${P.nw} ข้อ</span></div>
    </div>
    <div class="btn-row" style="justify-content:center;margin-top:18px">
      <button class="btn" id="fm-retry">ทำอีกครั้ง</button>
      <button class="btn ghost" id="fm-stats">ดูสถิติ</button>
      <button class="btn ghost" id="fm-menu">กลับเมนูทดสอบ</button>
    </div>
  </section>`;
}
const FM_INFO={
  2:{q:60,t:"~60 นาที (รวมกรอกข้อมูล)",rows:[["การฟัง 听力","25 ข้อ · ~17 นาที"],["การอ่าน 阅读","25 ข้อ · 25 นาที"],["การเขียน 书写","10 ข้อ · 10 นาที"]],
     tips:["พาร์ทอ่าน<b>มีพินอินกำกับทุกประโยค</b> แต่ฝึกอ่านตัวจีนไว้จะเร็วกว่ามาก","พาร์ทเขียนต้อง<b>เขียนตัวจีนด้วยมือ</b> (ตัวอักษรที่ต้องเขียนได้ราว 100 ตัวของ HSK 1–2) — ฝึกในแท็บฝึกเขียนวันละ 10–15 นาที","ส่วนการฟังเปิดเสียง 2 รอบ ไม่ต้องรีบตอบรอบแรก","ทำข้อสอบเต็มในเว็บนี้ให้ได้ <b>80% ขึ้นไป</b> หลายครั้งติดกันก่อนสอบจริง"]},
  3:{q:70,t:"ราว 83 นาที (รวมกรอกข้อมูล)",rows:[["การฟัง 听力","30 ข้อ · ~23 นาที"],["การอ่าน 阅读","30 ข้อ · 30 นาที"],["การเขียน 书写","10 ข้อ · 20 นาที"]],
     tips:["ข้อสอบ HSK 3 <b>ไม่มีพินอินกำกับ</b> ต้องอ่านตัวจีนเองทั้งหมด (มีพินอินแค่ช่องว่างในพาร์ทเขียนตอนที่ 1)","พาร์ทเขียนต้อง<b>เขียนตัวจีนด้วยมือ</b> ทั้งเติมตัวอักษรและแต่งประโยคเอง — ฝึกในแท็บฝึกเขียนวันละนิด","ฝึกแต่งประโยคสั้น ๆ จากคำใหม่วันละ 1 ประโยค เพราะแอปตรวจได้แค่แบบเรียงคำ","ทำข้อสอบเต็มในเว็บนี้ให้ได้ <b>80% ขึ้นไป</b> หลายครั้งติดกันก่อนสอบจริง"]}
};
function fmInfoCard(){
  const I=FM_INFO[curLv().n]; if(!I) return "";
  return `<section class="card">
    <h2>รู้จักข้อสอบ HSK ${curLv().n} ระบบใหม่<span class="tag">HSK 3.0</span></h2>
    <p class="small muted" style="margin:0 0 10px">${I.q} ข้อ 3 พาร์ท พาร์ทละ 100 คะแนน ใช้เวลา${I.t} · ข้อสอบจำลองในแอปใช้เกณฑ์อ้างอิง 180/300</p>
    <div class="exam-info">${I.rows.map(r=>`<div><b>${r[0]}</b><span>${r[1]}</span></div>`).join("")}</div>
  </section>`;
}
function fmTipsHTML(){
  const I=FM_INFO[curLv().n]; if(!I) return "";
  return `<h2>เคล็ดลับสอบ HSK ${curLv().n}</h2>
    <ul class="small" style="margin:0;padding-left:20px;display:grid;gap:6px">${I.tips.map(t=>`<li>${t}</li>`).join("")}</ul>`;
}
function fmMenuBtn(){
  const n=curLv().n, S=FMSPEC[n];
  if(!S) return `<b>ข้อสอบเต็มรูปแบบ 40 ข้อ</b><span>ฟัง 20 + อ่าน 20 เรียงพาร์ทเหมือนสนามจริง HSK 1 · จับเวลา 35 นาที · คะแนนแยกพาร์ทเต็ม 200</span>`;
  return `<b>ข้อสอบเต็ม HSK ${n} ระบบใหม่ · ${fmN(S.hear)+fmN(S.read)+fmN(S.write)} ข้อ</b><span>ฟัง ${fmN(S.hear)} + อ่าน ${fmN(S.read)} + เขียน ${fmN(S.write)} เรียงพาร์ทตามรูปแบบ HSK 3.0 · จับเวลา ${S.min} นาที · เต็ม 300</span>`;
}
