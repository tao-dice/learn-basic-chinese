# ---------- Supabase (sb.js): ใช้เมื่อไม่มี window.claude (เปิดนอก claude.ai) ----------
sub1('/* ---------- เริ่มต้น ---------- */', open('sb.js', encoding='utf8').read() + '\n/* ---------- เริ่มต้น ---------- */', label='sb-insert')
sub1('    const db=await claude.use("db");\n    if(!db) return;\n    dbDocRef=db.doc("progress/main");',
     '    if(typeof claude==="undefined"){ dbDocRef=await sbDoc(); if(!dbDocRef) return; }\n    else { const db=await claude.use("db"); if(!db) return; dbDocRef=db.doc("progress/main"); }')
sub1('    ${missedRows}\n  </section>`:""}`;\n}\nfunction bindStats(){\n', '    ${missedRows}\n  </section>`:""}\n  ${backupCardHTML()}`;\n}\nfunction bindStats(){\n  bindBackup();\n')
sub1('.fam-svg{width:100%; height:auto; display:block}', '''.fam-svg{width:100%; height:auto; display:block}
.sb-login{position:fixed; left:12px; right:12px; bottom:calc(var(--nav-h,64px) + 12px); z-index:70; display:flex; flex-wrap:wrap; gap:8px; align-items:center; padding:12px; background:var(--surface); border:1px solid var(--line-strong); border-radius:16px; box-shadow:var(--card-shadow)}
.sb-login span{flex:1 1 100%; font-size:14px}
.sb-login input{flex:1; min-width:0; padding:10px 12px; border-radius:10px; border:1px solid var(--line-strong); background:var(--paper); color:var(--ink); font:inherit}
@media (min-width:1000px){.sb-login{left:auto; width:420px; bottom:16px}}''')
