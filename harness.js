(function(){
  const p=new URLSearchParams(location.hash.slice(1)); const v=p.get("v")||"home";
  if(p.get("theme")) document.documentElement.setAttribute("data-theme",p.get("theme"));
  const err=m=>document.body.insertAdjacentHTML("afterbegin",'<pre style="background:#c00;color:#fff;position:fixed;z-index:999;top:0;left:0;right:0;font-size:12px;white-space:pre-wrap;margin:0">'+m+'</pre>');
  window.addEventListener("error",e=>err("ERR "+e.message+" @"+e.lineno));
  try{
  state.doneDays=Array.from({length:51},(_,i)=>i+1).concat([52,53,54]);
  WORDS.filter(w=>w[3]<=54).forEach((w,i)=>{state.words[w[0]]={lv:1+i%3,wrong:i%7===0?2:0};});
  state.streak={count:5,last:todayStr()}; state.examDate=addDaysStr(53); state.level=+(p.get("lv")||2);
  renderHeader();
  const tab=n=>{currentView=n; syncTabs(n); render();};
  const G={
    home:()=>tab("home"), plan:()=>tab("plan"), write:()=>tab("write"), games:()=>tab("games"), quiz:()=>tab("quiz"), vocab:()=>tab("vocab"),
    map:()=>tab("map"), stats:()=>tab("stats"), basics:()=>tab("basics"),
    fam:()=>openFam(p.get("c")||"学"), fam2:()=>{openFam(p.get("c")||"电"); famSel=WORDS.find(w=>w[0].includes(famC)&&w[3]>51)[0]; render();},
    cards:()=>{startCards(WORDS.filter(w=>w[3]===60),60,"lesson"); fc.flipped=true; render();},
    sent3:()=>{ const upto=+(p.get("upto")||166); state.doneDays=Array.from({length:upto},(_,i)=>i+1);
      const set=learnedSet(), ok=STMT_ITEMS.filter(x=>sReady(x.c,set)), unk=STMT_ITEMS.flatMap(x=>x.c.filter(t=>!GLOSS[t]&&!/^[，。？！]$/.test(t)));
      startSentGame("mix"); document.body.insertAdjacentHTML("afterbegin",`<pre style="position:fixed;bottom:80px;left:0;right:0;z-index:999;background:#ffc;color:#000;font-size:11px;margin:0">upto=${upto} total=${STMT_ITEMS.length} ready=${ok.length} hsk23ready=${ok.filter(x=>x.day>=52).length} unk=${unk.join(",")}</pre>`); },
    dlg3:()=>{ const upto=+(p.get("upto")||166); state.doneDays=Array.from({length:upto},(_,i)=>i+1);
      const set=learnedSet(), ok=DLG_ITEMS.filter(x=>sReady(x.a,set)&&sReady(x.b,set)), unk=DLG_ITEMS.flatMap(x=>x.a.concat(x.b).filter(t=>!GLOSS[t]&&!/^[，。？！]$/.test(t)));
      sentSit="all"; startSentGame(p.get("k")||"dlg"); document.body.insertAdjacentHTML("afterbegin",`<pre style="position:fixed;bottom:80px;left:0;right:0;z-index:999;background:#ffc;color:#000;font-size:11px;margin:0">upto=${upto} dlg=${DLG_ITEMS.length} ready=${ok.length} hsk23=${ok.filter(x=>x.day>=52).length} unk=${unk.join(",")}</pre>`); },
    fm3:()=>{ state.level=+(p.get("lv")||3); canSpeak=()=>true; speak=()=>{}; speakSeq=()=>{}; startFullMock();
      const at=p.get("at")||"0", L=[];
      if(at==="hear"){ lg.i=+(p.get("i")||0); render(); return; }
      let g=0; while(currentView==="hearRun"&&g++<40){ hearAnswer(lg.qs[lg.i].k==="tf"?(lg.qs[lg.i].ans?1:0):lg.qs[lg.i].opts.indexOf(lg.qs[lg.i].k==="ld"?lg.qs[lg.i].d:lg.qs[lg.i].it)); hearNext(); }
      L.push("hear done view="+currentView+" ls="+fm.ls+" n="+sg.qs.length+" types="+sg.qs.map(q=>(q.fk||q.type).slice(0,2)).join(" "));
      if(at==="done"){ g=0; while(currentView==="sentRun"&&g++<60){ const q=sg.qs[sg.i];
          if(q.type==="ord"){ q.built=q.words.map((w,i)=>i); ordCheck(); } else if(q.type==="wch"||q.type==="wcomp") sentAnswer(q.opts.indexOf(q.ans)); else sentAnswer(sg.i%3?0:1); sentNext(); }
        L.push("done view="+currentView+" rs="+fm.rs+" ws="+fm.ws+" last="+JSON.stringify(state.quizzes.slice(-1)[0]));
        document.body.insertAdjacentHTML("afterbegin",'<pre style="position:fixed;bottom:80px;left:0;right:0;z-index:999;background:#ffc;color:#000;font-size:11px;margin:0;white-space:pre-wrap">'+L.join("\n")+'</pre>'); return; }
      sg.i=+at; const q=sg.qs[sg.i]; if(p.get("pre")==="1"&&q.type==="ord"){ q.built=[q.tiles[0],q.tiles[1]]; } render();
      if(p.get("ans")==="1"){ if(q.type==="ord"){ q.built=q.tiles.slice(); ordCheck(); } else sentAnswer(0); } },
    q1:()=>{state.level=3; startQuiz("meaning");},
    check:()=>{ const L=[]; const chars=[...new Set(WORDS.flatMap(w=>[...w[0]]))];
      L.push("NW="+NW+" N_DAYS="+N_DAYS+" chars="+chars.length+" strokes="+NCH()+" LEVELS="+JSON.stringify(LEVELS));
      L.push("noStroke="+chars.filter(c=>!STROKES[c]).join("")+" noInfo="+chars.filter(c=>!CHARINFO[c]).join("")+" noRad="+chars.filter(c=>CHARINFO[c]&&!RADTH[CHARINFO[c].r]).join(""));
      L.push("dupes="+WORDS.map(w=>w[0]).filter((h,i,a)=>a.indexOf(h)!==i).join(","));
      L.push("noTheme="+Array.from({length:N_DAYS},(_,i)=>i+1).filter(d=>!DAY_THEMES[d]).join(","));
      L.push("badPinyin="+WORDS.filter(w=>/[^a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü'\- ]/.test(w[1])).map(w=>w[0]+":"+w[1]).join(","));
      L.push("sameTh(ช่วย,ช่วย (ทำธุระให้))="+sameTh("ช่วย","ช่วย (ทำธุระให้)")+" sameTh(แต่,แต่ (ว่า))="+sameTh("แต่","แต่ (ว่า)")+" sameTh(ใหญ่,เล็ก)="+sameTh("ใหญ่","เล็ก"));
      try{
        for(const lv of [1,2,3]){ state.level=lv; const nd=nextLessonDay(); currentView="home"; render(); currentView="plan"; render(); currentView="map"; render(); const tiles=document.querySelectorAll("[data-map]").length; currentView="vocab"; render(); const rows=document.querySelectorAll(".vrow").length; currentView="basics"; render(); currentView="write"; render(); L.push("lv"+lv+" next="+nd+" mapTiles="+tiles+" vocabRows="+rows); }
        state.level=3; for(const d of [85,120,166]){ bxStart("set",d); let g=0; while(currentView==="bxRun"&&g++<40){ const q=bx.qs[bx.i]; if(!q.done){ if(q.opts){const o=q.opts.find(o=>o.k===q.ans); q.picked=o.k; bxSettle(q,true);} else bxSettle(q,true);} bxNext(); } L.push("set"+d+":"+currentView+" "+bx.score+"/"+bx.total); }
        startLessonExercise(166); L.push("ex166 qs="+quiz.qs.length); let amb=0;
        for(let k=0;k<200;k++){ startQuiz("meaning"); quiz.qs.forEach(q=>{ q.opts.forEach(o=>{ if(o!==q.w&&sameTh(o[2],q.w[2])) amb++; }); }); } L.push("ambiguous distractors in 2000 qs="+amb);
        startWriting(WORDS.filter(w=>w[3]===100)); L.push("write100 chars="+wp.chars.join("")); startCopybook(WORDS.filter(w=>w[3]===100)); L.push("cb ok");
        startFullMock(); L.push("fullmock n="+lg.qs.length); fmCancel(); startSentGame("mix"); L.push("sent ok"); bxStart("look"); bxStart("build"); bxStart("sound"); L.push("bx games ok");
        for(const c of ["学","电","好","人","子","大","国"]){ openFam(c); L.push("fam "+c+"="+famIndex()[c].length); }
        currentView="stats"; render(); L.push("stats ok");
      }catch(e){ L.push("EXC "+e.message+" "+(e.stack||"").slice(0,400)); }
      document.body.innerHTML='<pre style="font-size:13px;white-space:pre-wrap;padding:10px;background:#fff;color:#000">'+L.join("\n")+'</pre>'; },
  };
  (G[v]||G.home)();
  if(p.get("y")) setTimeout(()=>window.scrollTo(0,+p.get("y")),300);
  }catch(e){ err("EX "+e.message+"\n"+(e.stack||"").slice(0,500)); }
})();
