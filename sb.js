/* ---------- ซิงก์ข้อมูลผ่าน Supabase (ตอนเปิดนอก claude.ai เช่น Vercel) ----------
   ตาราง progress: 1 แถวต่อผู้ใช้ (user_id = auth.uid() บังคับด้วย RLS) · ล็อกอินด้วยลิงก์ทางอีเมล
   คืนอ็อบเจกต์หน้าตาเดียวกับ db.doc() ของ artifact (get/set) เพื่อให้ initDb ใช้ตรรกะรวมข้อมูลเดิมได้
   key นี้เป็น publishable key — เปิดเผยได้ ความปลอดภัยอยู่ที่ RLS (ห้ามใส่ secret/service_role key ที่นี่) */
const SB_URL="https://iksubrkkkcapruanacbc.supabase.co";
const SB_KEY="sb_publishable_wPlewjikCwvuAwX1ymcvHA_TsTSwX9k";
const SB_JS="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js";
let sbClient=null;
function sbLoad(){
  return window.supabase?Promise.resolve():new Promise((ok,no)=>{ const s=document.createElement("script"); s.src=SB_JS; s.onload=ok; s.onerror=no; document.head.appendChild(s); });
}
async function sbDoc(){
  await sbLoad();
  sbClient=sbClient||supabase.createClient(SB_URL,SB_KEY);
  const {data:{session}}=await sbClient.auth.getSession(); // อ่าน token จากลิงก์ในอีเมลให้เองตอนกลับมาที่เว็บ
  if(!session){ sbLoginBar(); return null; }
  const uid=session.user.id;
  return {
    get:async()=>{
      const {data,error}=await sbClient.from("progress").select("data").eq("user_id",uid).maybeSingle();
      if(error) throw error;
      return {exists:!!data, data:()=>data&&data.data};
    },
    set:async s=>{
      const {error}=await sbClient.from("progress").upsert({user_id:uid,data:s,updated_at:new Date().toISOString()});
      if(error){ toast("บันทึกขึ้นคลาวด์ไม่สำเร็จ — ข้อมูลยังอยู่ในเครื่องนี้"); throw error; }
    }
  };
}
function sbLoginBar(){
  if(document.getElementById("sb-login")) return;
  const el=document.createElement("form");
  el.id="sb-login"; el.className="sb-login";
  el.innerHTML=`<span>เข้าสู่ระบบเพื่อซิงก์ความคืบหน้าข้ามเครื่อง</span>
    <input type="email" required placeholder="อีเมล" aria-label="อีเมล" autocomplete="email">
    <button class="btn small" type="submit">ส่งลิงก์</button>
    <button class="btn ghost small" type="button" aria-label="ปิด">✕</button>`;
  el.querySelector('[type="button"]').addEventListener("click",()=>el.remove());
  el.addEventListener("submit",async e=>{
    e.preventDefault();
    const email=el.querySelector("input").value.trim(), b=el.querySelector('[type="submit"]');
    b.disabled=true;
    const {error}=await sbClient.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});
    b.disabled=false;
    if(error) toast("ส่งลิงก์ไม่สำเร็จ: "+error.message);
    else { el.querySelector("span").textContent="ส่งลิงก์ไปที่ "+email+" แล้ว — เปิดอีเมลแล้วกดลิงก์บนเครื่องนี้"; }
  });
  document.body.appendChild(el);
}
/* สำรอง / นำเข้าความคืบหน้าเป็นไฟล์ JSON (ใช้ย้ายข้อมูลจาก claude.ai) */
function exportProgress(){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(state)],{type:"application/json"}));
  a.download="hsk-progress-"+todayStr()+".json"; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importProgress(file){
  const r=new FileReader();
  r.onload=()=>{
    let s; try{ s=JSON.parse(r.result); }catch(e){ s=null; }
    if(!s||typeof s!=="object"||typeof s.words!=="object"||!Array.isArray(s.doneDays)){ toast("ไฟล์นี้ไม่ใช่ข้อมูลความคืบหน้าของเว็บนี้"); return; }
    if(!confirm("แทนที่ความคืบหน้าในเครื่องนี้ด้วยข้อมูลจากไฟล์? (เรียนแล้ว "+s.doneDays.length+" บท)")) return;
    state={...state,...s}; save(); renderHeader(); render(); toast("นำเข้าข้อมูลแล้ว");
  };
  r.readAsText(file);
}
function backupCardHTML(){
  return `<section class="card">
    <h2>สำรองข้อมูล<span class="tag">${sbClient?"ซิงก์กับ Supabase":"เก็บในเครื่องนี้"}</span></h2>
    <p class="small muted" style="margin:0 0 10px">ดาวน์โหลดความคืบหน้าเป็นไฟล์ หรือนำเข้าไฟล์ที่สำรองไว้ (จะแทนที่ข้อมูลปัจจุบัน)</p>
    <div class="btn-row">
      <button class="btn ghost" id="bk-export">ดาวน์โหลดไฟล์สำรอง</button>
      <label class="btn ghost">นำเข้าไฟล์<input type="file" accept="application/json,.json" id="bk-import" hidden></label>
    </div>
  </section>`;
}
function bindBackup(){
  const ex=$("#bk-export"); if(ex) ex.addEventListener("click",exportProgress);
  const im=$("#bk-import"); if(im) im.addEventListener("change",()=>{ if(im.files[0]) importProgress(im.files[0]); im.value=""; });
}
