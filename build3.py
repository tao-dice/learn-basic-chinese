#!/usr/bin/env python3
"""base.html (เวอร์ชัน 25 บนเว็บ) → hsk.html: เพิ่ม HSK 2–3 (ระบบใหม่), ระบบระดับ, เครือข่ายตัวอักษร"""
import json, os, re, sys
src = open('base.html', encoding='utf8').read()
def sub1(old, new, count=1, label=None):
    global src
    n = src.count(old)
    if n != count: sys.exit(f'PATCH FAIL [{label or old[:60]!r}]: expected {count}, found {n}')
    src = src.replace(old, new)
L = json.load(open('lessons23.json', encoding='utf8'))
lv2 = [x['day'] for x in L['lessons'] if x['level'] == 2]; lv3 = [x['day'] for x in L['lessons'] if x['level'] == 3]
dj = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))

# ---------- ข้อมูลคำ + ธีมบท ----------
i = src.index('const WORDS=['); j = src.index('\n];', i)
rows = {}
for w in L['words']: rows.setdefault(w[3], []).append(dj(w))
add = '\n/* --- HSK 2 ระบบใหม่ (บทที่ %d–%d) และ HSK 3 (บทที่ %d–%d) --- */\n' % (lv2[0], lv2[-1], lv3[0], lv3[-1])
add += '\n'.join(','.join(rows[d]) + ',' for d in sorted(rows))
src = src[:i] + src[i:j].rstrip().rstrip(',') + ',' + add + src[j:]

# ---------- บทสนทนา HSK 2–3 (d23.json จาก vald23.py --emit) ----------
i = src.index('const DLGS=['); j = src.index('\n];', i)
src = src[:i] + src[i:j].rstrip().rstrip(',') + ',\n/* --- HSK 2–3 dlg --- */\n' + ',\n'.join(dj(r) for r in json.load(open('d23.json', encoding='utf8'))) + src[j:]

# ---------- ประโยคตัวอย่าง HSK 2–3 (s23.json จาก val23.py --emit; ตรวจกับ base ก่อนแทรก) ----------
i = src.index('const STMTS=['); j = src.index('\n];', i)
src = src[:i] + src[i:j].rstrip().rstrip(',') + ',\n/* --- HSK 2–3 --- */\n' + ',\n'.join(dj(r) for r in json.load(open('s23.json', encoding='utf8'))) + src[j:]
themes = ','.join('%d:%s' % (x['day'], json.dumps(x['theme'], ensure_ascii=False)) for x in L['lessons'])
sub1('26:"พี่น้อง & คนในบ้าน"', themes + ',26:"พี่น้อง & คนในบ้าน"', label='themes')
sub1('function NCH(){', 'const LEVELS=[{n:1,a:1,b:%d},{n:2,a:%d,b:%d},{n:3,a:%d,b:%d}];\n' % (lv2[0]-1, lv2[0], lv2[-1], lv3[0], lv3[-1])
     + 'function curLv(){return LEVELS.find(l=>l.n===state.level)||LEVELS[0];}\n'
     + 'function lvOfDay(d){return (LEVELS.find(l=>d>=l.a&&d<=l.b)||LEVELS[0]).n;}\n'
     + 'function lvDays(){const L=curLv(); return Array.from({length:L.b-L.a+1},(_,i)=>L.a+i);}\n'
     + 'function lvW(){const L=curLv(); return WORDS.filter(w=>w[3]>=L.a&&w[3]<=L.b);}\n'
     + '/* คำแปลที่มี "แก่น" ร่วมกัน (เช่น ช่วย / ช่วย (ทำธุระให้)) ถือว่าความหมายเดียวกัน จะไม่ถูกใช้เป็นตัวเลือกลวงของกัน */\n'
     + 'function thCore(t){return String(t).split(" / ").map(s=>s.replace(/\\s*\\([^)]*\\)\\s*/g," ").trim()).filter(Boolean);}\n'
     + 'function sameTh(a,b){if(a===b) return true; const B=thCore(b); return thCore(a).some(x=>B.includes(x));}\n'
     + 'function NCH(){', label='levels')
sub1('x[W.t]!==w[W.t]', '!sameTh(x[W.t],w[W.t])', count=5, label='sameTh')

# ---------- ระดับ: บทถัดไป / หน้าหลัก / แผน / คัด / ฝึกพื้นฐาน / แผนที่ / คำศัพท์ ----------
sub1('function nextLessonDay(){for(let d=1;d<=N_DAYS;d++) if(!state.doneDays.includes(d)) return d; return null;}',
     'function nextLessonDay(){for(const d of lvDays()) if(!state.doneDays.includes(d)) return d; return null;}')
sub1('const learned=learnedCount(), mastered=masteredCount(), q=reviewQueue();\n  const pct=Math.round(learned/NW*100);',
     'const LW=lvW(), NL=LW.length, learned=LW.filter(w=>wordState(w[W.h]).lv>=1).length, mastered=LW.filter(w=>wordState(w[W.h]).lv>=3).length, q=reviewQueue();\n  const pct=Math.round(learned/NL*100);', label='home-counts')
sub1('${C*(1-learned/NW)}', '${C*(1-learned/NL)}')
sub1('<span>/${NW} คำ</span>', '<span>/${NL} คำ</span>')
sub1('${markedCount()}/${NW} คำ', '${LW.filter(w=>isMarked(w[W.h])).length}/${NL} คำ')
sub1('<i>HSK ระดับ 1</i>', '<i>HSK ระดับ ${curLv().n}</i>')
sub1('nd>N_CORE?" · คำเพิ่มของระบบใหม่":""', 'nd>N_CORE&&nd<=LEVELS[0].b?" · คำเพิ่มของระบบใหม่":" · HSK "+curLv().n')
sub1('  <section class="ticket">', '''  <div class="lv-seg" role="tablist" aria-label="เลือกระดับ">${LEVELS.map(l=>{const ws=WORDS.filter(w=>w[W.d]>=l.a&&w[W.d]<=l.b); return `<button class="${l.n===curLv().n?"on":""}" data-lv="${l.n}"><b>HSK ${l.n}</b><span>${ws.filter(w=>wordState(w[W.h]).lv>=1).length}/${ws.length} คำ</span></button>`;}).join("")}</div>
  <section class="ticket">''', label='home-seg')
sub1('<section class="card">\n    <h2>รู้จักข้อสอบ HSK1</h2>', '<section class="card exam-card lv${curLv().n}">\n    <h2>รู้จักข้อสอบ HSK1</h2>')
sub1('const gst=$("#go-stats"); if(gst) gst.addEventListener("click",()=>{currentView="stats"; syncTabs("stats"); render();});',
     'const gst=$("#go-stats"); if(gst) gst.addEventListener("click",()=>{currentView="stats"; syncTabs("stats"); render();});')
# ปุ่มเลือกระดับ (ใช้ได้ทั้งหน้าหลักและหน้าแผน) — ผูกจาก bindView ทุกครั้ง
sub1('function bindView(){\n  const v=$("#view");', 'function bindView(){\n  const v=$("#view");\n  v.querySelectorAll("[data-lv]").forEach(b=>b.addEventListener("click",()=>{state.level=+b.dataset.lv; save(); render();}));', label='bind-lv')
a0 = src.index('function planHTML(){'); a1 = src.index('/* ---------- แฟลชการ์ด ---------- */', a0)
src = src[:a0] + open('plan3.js', encoding='utf8').read() + '\n' + src[a1:]
sub1('Array.from({length:N_DAYS},(_,i)=>i+1)', 'lvDays()', count=3, label='lvDays-chips')
sub1('for(let d=1;d<=N_DAYS;d++){ if(sets[d]==null)', 'for(const d of lvDays()){ if(sets[d]==null)')
sub1('ชุดละ 6 คำ ตรงกับบทเรียน · ชุด 26 ขึ้นไปคือคำของระบบใหม่', 'ชุดละ 6 คำ ตรงกับบทเรียน HSK ${curLv().n}')
sub1('const m=markedCount(), left=NW-m;\n  const sorted=WORDS.slice()', 'const LW=lvW(), NL=LW.length, m=LW.filter(w=>isMarked(w[W.h])).length, left=NL-m;\n  const sorted=LW.slice()', label='map')
sub1('${m/NW*100}%', '${m/NL*100}%')
sub1('    const m=markedCount();\n    $("#map-c1").textContent=m; $("#map-c2").textContent=NW-m;\n    $("#map-bar").style.width=(m/NW*100)+"%";',
     '    const LW=lvW(), NL=LW.length, m=LW.filter(w=>isMarked(w[W.h])).length;\n    $("#map-c1").textContent=m; $("#map-c2").textContent=NL-m;\n    $("#map-bar").style.width=(m/NL*100)+"%";', label='map-bind')
sub1('const list=WORDS.filter(w=>!f||', 'const list=(f?WORDS:lvW()).filter(w=>!f||', label='vocab-level')
sub1('<h2>คำศัพท์ HSK1 ทั้งหมด<span class="tag">${list.length} คำ</span></h2>',
     '<h2>${f?"ค้นหาทุกระดับ":"คำศัพท์ HSK "+curLv().n}<span class="tag">${list.length} คำ</span></h2>\n    <button class="mode wide" id="go-fam" style="width:100%;margin-bottom:12px"><b>เครือข่ายตัวอักษร</b><span>ดูว่าตัวอักษรหนึ่งตัวอยู่ในคำไหนบ้าง จำด้วยรากศัพท์ · แตะตัวจีนในรายการด้านล่างก็ได้</span></button>', label='vocab-h2')
sub1('<div class="h hanzi">${esc(w[W.h])}</div>\n      <div class="m"><div class="p">${esc(w[W.p])}</div><div class="t">${esc(w[W.t])} <span class="muted small">· บทที่ ${w[W.d]}</span></div></div>',
     '<button class="h hanzi vh-btn" data-fam="${esc(w[W.h])}" aria-label="เครือข่ายของ ${esc(w[W.h])}">${esc(w[W.h])}</button>\n      <div class="m"><div class="p">${esc(w[W.p])}</div><div class="t">${esc(w[W.t])} <span class="muted small">· HSK ${lvOfDay(w[W.d])} บทที่ ${w[W.d]}</span></div></div>', label='vocab-row')
sub1('    v.querySelectorAll("[data-strokes]").forEach(b=>b.addEventListener("click",()=>openStrokes(b.dataset.strokes)));',
     '    v.querySelectorAll("[data-strokes]").forEach(b=>b.addEventListener("click",()=>openStrokes(b.dataset.strokes)));\n    v.querySelectorAll("[data-fam]").forEach(b=>b.addEventListener("click",()=>openFam(b.dataset.fam)));\n    const gf=$("#go-fam"); if(gf) gf.addEventListener("click",()=>openFam(famC||"学"));', label='vocab-bind')
sub1('<button class="btn ghost" id="s-write">ฝึกเขียนคำนี้</button>', '<button class="btn ghost" id="s-write">ฝึกเขียนคำนี้</button>\n      <button class="btn ghost" id="s-fam">เครือข่ายตัวอักษร</button>')
sub1('  ov.querySelector("#s-replay").addEventListener("click",playStrokeAnims);', '  ov.querySelector("#s-replay").addEventListener("click",playStrokeAnims);\n  ov.querySelector("#s-fam").addEventListener("click",()=>{ closeStrokes(); openFam(word); });')
sub1('chartFrame(210,NW,[0,100,200,300])', 'chartFrame(210,NW,[0,Math.round(NW/4),Math.round(NW/2),Math.round(NW*3/4)])')
# มุมมองเครือข่าย + แท็บ
sub1('let tab=/^(bx|basics)/.test(name)?"basics":', 'let tab=name==="fam"?"vocab":/^(bx|basics)/.test(name)?"basics":')
sub1('  if(bxView(v)) return;', '  if(bxView(v)) return;\n  if(currentView==="fam"){ v.innerHTML=famHTML(); bindFam(); return; }')
sub1('/* ---------- เริ่มต้น ---------- */', open('fam.js', encoding='utf8').read() + '\n/* ---------- เริ่มต้น ---------- */')
sub1('30 วันกับภาษาจีน เริ่มไปด้วยกันนะ','ภาษาจีนวันละนิด ไปถึง HSK 3 ด้วยกันนะ')
# ชื่อเว็บ
sub1('<title>30 วันพิชิต HSK1</title>', '<title>พิชิต HSK 1–3</title>')
sub1('<h1>30 วันพิชิต HSK1</h1>', '<h1>พิชิต HSK 1–3</h1>')
sub1('HSK 1 ระบบใหม่ 300 คำ · ฟัง พูด อ่าน เขียน', 'HSK 3.0 ระดับ 1–3 · %d คำ · ฟัง พูด อ่าน เขียน' % (304 + len(L['words'])), label='sub')

# ---------- CSS ----------
css = '''
/* ===================== ระดับ HSK + เครือข่ายตัวอักษร ===================== */
:root{--lv1:#436951; --lv2:#B9822C; --lv3:#4A72A8}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--lv1:#9FD093; --lv2:#E5BA70; --lv3:#97B9EA}}
:root[data-theme="dark"]{--lv1:#9FD093; --lv2:#E5BA70; --lv3:#97B9EA}
#view:has(> .welcome) > .welcome{order:-3}
#view:has(> .welcome) > .lv-seg{order:-2}
.lv-seg{display:grid; grid-template-columns:repeat(3,1fr); gap:6px; padding:5px; background:var(--sunken); border-radius:14px; margin-bottom:14px}
.lv-seg button{border:0; background:transparent; border-radius:10px; padding:8px 4px; line-height:1.3; display:flex; flex-direction:column; align-items:center}
.lv-seg button b{font-size:15px}
.lv-seg button span{font-size:11.5px; color:var(--muted)}
.lv-seg button.on{background:var(--surface); box-shadow:var(--card-shadow); color:var(--accent)}
.exam-card:not(.lv1){display:none}
.vh-btn{border:0; background:transparent; padding:0; text-align:left; color:inherit; cursor:pointer; text-decoration:underline dotted var(--line-strong); text-underline-offset:6px}
.fam-form{display:flex; gap:8px}
.fam-form .search{margin:0; flex:1}
.fam-head{display:flex; align-items:center; gap:14px; margin:14px 0 4px}
.fam-big{font-size:56px; font-weight:700; line-height:1}
.fam-meta{flex:1; min-width:0; display:flex; flex-direction:column; line-height:1.45}
.fam-meta b{color:var(--accent); font-size:18px}
.fam-tools{display:flex; gap:6px}
.fam-svg{width:100%; height:auto; display:block}
.fam-node{cursor:pointer}
.fam-node:focus-visible circle:first-child{stroke:var(--accent); stroke-width:3}
.fam-legend{display:flex; flex-wrap:wrap; gap:6px 14px; font-size:12.5px; align-items:center}
.fam-legend i{display:inline-block; width:10px; height:10px; border-radius:99px; margin-right:5px; vertical-align:-1px}
.fam-row{cursor:pointer; border-radius:10px}
.fam-row.on{background:var(--accent-soft)}
.fam-dot{width:10px; height:10px; border-radius:99px; flex:none}
.fam-jump{display:flex; flex-wrap:wrap; gap:4px; align-items:center; font-size:12px; color:var(--muted); margin-top:4px}
.fam-chip{min-height:30px; padding:2px 10px}
.fam-chip .hanzi{font-size:18px}
.fam-rad{display:flex; align-items:center; gap:12px; margin:0 0 12px}
.fam-radch{font-size:40px; font-weight:700; width:60px; height:60px; display:grid; place-items:center; background:var(--sunken); border-radius:14px; flex:none}
'''
src = src.replace('</style>', css + '</style>', 1)

exec(open('p_mock3.py', encoding='utf8').read())
exec(open('p_sb.py', encoding='utf8').read())

# ---------- ลำดับขีด + รากของตัวอักษรใหม่ ----------
from rad3 import RAD3
st = {}
for f in sorted(os.listdir('strokes3')):
    d = json.load(open('strokes3/' + f, encoding='utf8'))
    st[f[:-5]] = {'s': d['strokes'], 'm': [[[round(x), round(y)] for x, y in md] for md in d['medians']]}
ci = json.load(open('charinfo3.json', encoding='utf8'))
assert len(st) == len(ci) == 406, (len(st), len(ci))
data = '<script id="stroke-data-3">Object.assign(window.STROKES,' + dj(st) + ');Object.assign(window.CHARINFO,' + dj(ci) + ');Object.assign(window.RADTH,' + dj(RAD3) + ');</script>'
src = src.rstrip() + '\n' + data + '\n'
open('hsk.html', 'w', encoding='utf8').write(src)
m = re.findall(r'<script>\s*"use strict";(.*?)</script>', src, re.S)
open('main.js', 'w', encoding='utf8').write('"use strict";' + m[0])
print('built', len(src.encode()) // 1024, 'KB')
