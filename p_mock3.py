# ---------- ข้อสอบเต็ม HSK 2 / HSK 3 ระบบใหม่ (mock3.js) — fm.lv 1 = รูปแบบ HSK1 เดิม ----------
sub1('/* ---------- เริ่มต้น ---------- */', open('mock3.js', encoding='utf8').read() + '\n/* ---------- เริ่มต้น ---------- */', label='mock3-insert')
sub1('fm={ls:-1,rs:-1,deadline:Date.now()+35*60*1000,timer:null,done:null};',
     'fm={lv:FMSPEC[curLv().n]?curLv().n:1,ls:-1,rs:-1,ws:-1,deadline:0,timer:null,done:null};\n  fm.deadline=Date.now()+(fm.lv>1?fmSpec().min:35)*60*1000;')
sub1('if(canSpeak()){ startHearGame("mock"); lg.full=true; }', 'if(canSpeak()){ if(fm.lv>1) startHear3(); else { startHearGame("mock"); lg.full=true; } }')
sub1('ทำเฉพาะพาร์ทอ่าน"); startFullRead(); }', 'ทำเฉพาะพาร์ทอ่าน"); (fm.lv>1?startRead3:startFullRead)(); }')
sub1('  if(fm.rs===-1) fm.rs=(sg&&sg.full)?sg.score:0;', '  if(fm.rs===-1){ if(fm.lv>1) fm3Split(); else fm.rs=(sg&&sg.full)?sg.score:0; }')
sub1('"/20) — ต่อพาร์ทอ่าน 阅读");\n      startFullRead(); return;', '"/"+lg.qs.length+") — ต่อพาร์ทอ่าน 阅读");\n      (fm.lv>1?startRead3:startFullRead)(); return;')
sub1('  state.quizzes.push({d:todayStr(),mode:"fullmock",score:(ls>0?ls:0)+rs,total:40,ls:ls,rs:rs});',
     '  if(fm.lv>1){ const P=fm3Pts(); state.quizzes.push({d:todayStr(),mode:"fullmock"+fm.lv,score:P.total,total:P.max,ls:ls,rs:rs,ws:fm.ws}); }\n  else state.quizzes.push({d:todayStr(),mode:"fullmock",score:(ls>0?ls:0)+rs,total:40,ls:ls,rs:rs});')
sub1('function fullDoneHTML(){\n', 'function fullDoneHTML(){\n  if(fm.lv>1) return fullDone3HTML();\n')
sub1('x.mode==="hearmock"||x.mode==="fullmock");', 'x.mode==="hearmock"||/^fullmock\\d?$/.test(x.mode));')
sub1('fullmock:{name:"ข้อสอบเต็มรูปแบบ"}', 'fullmock:{name:"ข้อสอบเต็มรูปแบบ"},\n  fullmock2:{name:"ข้อสอบเต็ม HSK 2"},\n  fullmock3:{name:"ข้อสอบเต็ม HSK 3"}')
sub1('<button class="mode wide" data-mode="full"><b>ข้อสอบเต็มรูปแบบ 40 ข้อ</b><span>ฟัง 20 + อ่าน 20 เรียงพาร์ทเหมือนสนามจริง · จับเวลา 35 นาที · คะแนนแยกพาร์ทเต็ม 200</span></button>',
     '<button class="mode wide" data-mode="full">${fmMenuBtn()}</button>')
sub1('<div><b>การอ่าน 阅读</b><span>20 ข้อ · 17 นาที</span></div>\n    </div>\n  </section>',
     '<div><b>การอ่าน 阅读</b><span>20 ข้อ · 17 นาที</span></div>\n    </div>\n  </section>\n  ${fmInfoCard()}')
sub1('    <h2>เคล็ดลับสอบ HSK1</h2>', '    ${FM_INFO[curLv().n]?fmTipsHTML()+`</section><section class="card" style="display:none">`:""}\n    <h2>เคล็ดลับสอบ HSK1</h2>')
# อ่าน+เขียน: คำถามแบบใหม่ในเอนจินประโยค
sub1('  } else if(q.type==="trans"&&q.dir==="zh2th"){\n    stim=sentHTML(q.item.c,"s",{pin:a});',
     '  } else if(q.type==="wch"||q.type==="ord"||q.type==="wcomp"){\n    ({stim,prompt,opts}=(q.type==="wch"?wchView:q.type==="ord"?ordView:compView)(q));\n  } else if(q.type==="trans"&&q.dir==="zh2th"){\n    stim=sentHTML(q.item.c,"s",{pin:a});')
sub1('  if(sg.kind==="fullread"){', '  if(sg.kind==="fullread3") label=fm3Label(sg.i);\n  else if(sg.kind==="fullread"){')
sub1('fullread:"ข้อสอบเต็ม · พาร์ทอ่าน 阅读"}', 'fullread:"ข้อสอบเต็ม · พาร์ทอ่าน 阅读",fullread3:"ข้อสอบเต็ม HSK"}')
sub1('<h2 style="margin:0">${esc(SG_NAME[sg.kind]||"เกมประโยค")}', '<h2 style="margin:0">${esc(SG_NAME[sg.kind]||"เกมประโยค")}${sg.kind==="fullread3"&&fm?" "+fm.lv:""}')
sub1('  else if(q.type==="trans"&&q.dir==="zh2th") ok=q.opts[i]===q.item.t;', '  else if(q.type==="wch"||q.type==="wcomp") ok=q.opts[i]===q.ans;\n  else if(q.type==="trans"&&q.dir==="zh2th") ok=q.opts[i]===q.item.t;')
sub1('  if(ok) sg.score++;\n  if(q.type==="fill")', '  q.ok=ok; if(ok) sg.score++;\n  if(q.type==="fill")')
sub1('    if(sg.full&&fm){ fm.rs=sg.score; sg.full=false; fmFinish(false); return; }', '    if(sg.full&&fm){ if(sg.kind==="fullread3") fm3Split(); else fm.rs=sg.score; sg.full=false; fmFinish(false); return; }')
sub1('  bindTokens();\n  const sy=$("#sg-say");', '  bindTokens(); bindOrd();\n  const sy=$("#sg-say");')
# HSK 2 พาร์ทอ่านมีพินอินทุกประโยค
sub1('    let mode=o.pin?"pin":"";', '    let mode=(o.pin||(sg&&sg.pinAll&&currentView==="sentRun"))?"pin":"";')
# ฟัง: บอกตอนที่
sub1('${lg.mode==="mock"||lg.mode==="mix"?`<span class="tag">${esc(info.n)}</span>`:""}', '${lg.mode==="mock"||lg.mode==="mix"||lg.mode==="mock3"?`<span class="tag">${lg.mode==="mock3"?"ตอนที่ "+fmHearPart(lg.i)+" · ":""}${esc(info.n)}</span>`:""}')
sub1('.fam-svg{width:100%; height:auto; display:block}', '''.fam-svg{width:100%; height:auto; display:block}
.ord-built{display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:center; min-height:58px; padding:10px; margin-top:12px; border:2px dashed var(--line-strong); border-radius:14px}
.ord-built.right{border-style:solid; border-color:var(--jade)} .ord-built.wrongpick{border-style:solid; border-color:var(--wrong)}
.ord-left{display:flex; flex-wrap:wrap; gap:8px; justify-content:center}
.ord-tile{font-size:22px; padding:8px 14px; min-height:44px}
.comp-word{display:flex; justify-content:center; gap:4px}
.comp-blank{display:inline-flex; align-items:center; border:2px dashed var(--accent); border-radius:10px; padding:0 6px; color:var(--accent)}
.comp-blank i{font-style:normal; font-size:.55em; margin-left:2px}''')
sub1('  const c=(q.type==="dlg")?q.item.b:(q.type==="fill"?q.item.c:q.item.c);', '  if(q.type==="wcomp") return;\n  const c=(q.type==="dlg")?q.item.b:(q.type==="fill"?q.item.c:q.item.c);')
