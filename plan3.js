function planHTML(){
  const nd=nextLessonDay(), L=curLv();
  const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
  const doneIn=(a,b)=>state.doneDays.filter(d=>d>=a&&d<=b).length;
  const cell=d=>{
    const done=state.doneDays.includes(d), n=WORDS.filter(w=>w[W.d]===d).length;
    const cls=done?"done":(d===nd?"today":"");
    return `<div class="day ${cls}" data-day="${d}" role="button" tabindex="0" aria-label="บทที่ ${d} ${esc(DAY_THEMES[d])}">
      <div class="n">${d}</div><div class="t">${done?"✓":n+" คำ"}</div></div>`;
  };
  const rows=(a,b)=>range(a,b).map(d=>`
      <div class="hrow"><span>บทที่ ${d} · ${esc(DAY_THEMES[d])}</span>
      <span>${state.doneDays.includes(d)?'<span class="chip jade">เรียนแล้ว</span>':""}</span></div>`).join("");
  const nw=(a,b)=>WORDS.filter(w=>w[W.d]>=a&&w[W.d]<=b).length;
  const sec=(t,a,b,p)=>`
  <section class="card">
    <h2>${t}<span class="tag">เรียนแล้ว ${doneIn(a,b)}/${b-a+1} บท · ${nw(a,b)} คำ</span></h2>
    <p class="small muted" style="margin:0 0 14px">${p}</p>
    <div class="days">${range(a,b).map(cell).join("")}</div>
  </section>`;
  const seg=`<div class="lv-seg plan-seg" role="tablist" aria-label="เลือกระดับ">${LEVELS.map(l=>`<button class="${l.n===L.n?"on":""}" data-lv="${l.n}"><b>HSK ${l.n}</b><span>${doneIn(l.a,l.b)}/${l.b-l.a+1} บท</span></button>`).join("")}</div>`;
  const body=L.n===1
    ? sec(`HSK 1 · ชุดหลัก บทที่ 1–${N_CORE}`,1,N_CORE,"คำที่ใช้บ่อยที่สุด เรียนวันละบท: การ์ดคำ + แบบฝึกหัดท้ายบท บทจะปิดเมื่อทำแบบฝึกหัดจบ · แตะบทเพื่อเริ่ม เรียนซ้ำบทเดิมได้")
      +sec(`HSK 1 · คำเพิ่ม บทที่ ${N_CORE+1}–${L.b}`,N_CORE+1,L.b,"ส่วนที่เหลือของคำศัพท์ HSK 1 ระบบใหม่ (300 คำ)")
    : sec(`HSK ${L.n} · บทที่ ${L.a}–${L.b}`,L.a,L.b,`คำศัพท์ที่ HSK ${L.n} ระบบใหม่เพิ่มเข้ามา จัดเป็นหมวดบทละ 6 คำ · เรียนข้ามระดับได้ ความคืบหน้าทุกระดับเก็บแยกกันไว้ครบ`);
  return seg+body+`
  <section class="card">
    <h2>หัวข้อแต่ละบท · HSK ${L.n}</h2>
    ${rows(L.a,L.b)}
  </section>`;
}
