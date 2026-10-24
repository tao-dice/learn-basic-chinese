# ตรวจ s23.py: ทุกคำต้องอยู่ในคลัง, ครอบคลุมคำใหม่ HSK2–3, ไม่ซ้ำประโยคเดิม
import re, json, sys
src=open('main.js',encoding='utf8').read()
words={}
for m in re.finditer(r'\["([^"]+)","[^"]*","[^"]*",(\d+)\]', src): words[m.group(1)]=int(m.group(2))
for k in re.findall(r'"([^"]+)":\["[^"]*","[^"]*"\]', src[src.index('const EXTRA_W'):src.index('const GLOSS')]): words[k]=0
old=set(re.findall(r'\["\w+","([^"]+)","', src[src.index('const STMTS=['):src.index('function sTok')]))
exec(open('s23.py',encoding='utf8').read())
P=set('，。？！'); bad=[]; used=set(); rows=[]; seen=set(); days=[]
for ln in S23.strip().splitlines():
    sit,toks,th=ln.split('|'); t=toks.split()
    if t[-1] not in P: bad.append(('noend',ln))
    unk=[x for x in t if x not in P and x not in words]
    if unk: bad.append(('unk',' '.join(unk),ln))
    j='|'.join(t)
    if j in old or j in seen: bad.append(('dup',ln))
    seen.add(j); used.update(t); rows.append([sit,j,th]); days.append(max([words.get(x,0) for x in t]))
new=[h for h,d in words.items() if d>=52]
miss=[h for h in new if h not in used]
print('rows',len(rows),'bad',len(bad)); [print(*b) for b in bad[:80]]
print('missing',len(miss),' '.join(miss))
print('lv2 sents',sum(52<=d<=84 for d in days),'lv3',sum(d>=85 for d in days),'<52',sum(d<52 for d in days))
if '--emit' in sys.argv:
    json.dump(rows,open('s23.json','w',encoding='utf8'),ensure_ascii=False)
