# ตรวจ d23.py: ทุกคำอยู่ในคลัง, ไม่ซ้ำบทเดิม, คำตอบ B ไม่ซ้ำกัน (เกมใช้ B ของบทอื่นเป็นตัวลวง); --emit → d23.json
import re, json, sys
src=open('main.js',encoding='utf8').read()
words={}
for m in re.finditer(r'\["([^"]+)","[^"]*","[^"]*",(\d+)\]', src): words[m.group(1)]=int(m.group(2))
for k in re.findall(r'"([^"]+)":\["[^"]*","[^"]*"\]', src[src.index('const EXTRA_W'):src.index('const GLOSS')]): words[k]=0
dl=src[src.index('const DLGS=['):src.index('function sTok')]
old=set(re.findall(r'\["\w+","([^"]+)","', dl)) if '/* --- HSK 2–3 dlg --- */' not in dl else set(re.findall(r'\["\w+","([^"]+)","', dl.split('/* --- HSK 2–3 dlg --- */')[0]))
exec(open('d23.py',encoding='utf8').read())
P=set('，。？！'); bad=[]; rows=[]; seenA=set(); seenB={}; days=[]; unk={}
for ln in D23.strip().splitlines():
    f=ln.split('|')
    if len(f)!=5: bad.append(('fields',ln)); continue
    sit,a,at,b,bt=f; A=a.split(); B=b.split()
    for t in (A,B):
        if t[-1] not in P: bad.append(('noend',ln))
        for x in t:
            if x not in P and x not in words: unk.setdefault(x,[]).append(a)
    ja,jb='|'.join(A),'|'.join(B)
    if ja in old or ja in seenA: bad.append(('dupA',ln))
    if jb in seenB: bad.append(('dupB',ln))
    seenA.add(ja); seenB[jb]=1; rows.append([sit,ja,at,jb,bt]); days.append(max(words.get(x,0) for x in A+B))
print('rows',len(rows),'bad',len(bad)); [print(*x) for x in bad]
print('unk',{k:len(v) for k,v in unk.items()})
print('<52',sum(d<52 for d in days),'lv2',sum(52<=d<=84 for d in days),'lv3',sum(d>=85 for d in days))
if '--emit' in sys.argv and not bad and not unk: json.dump(rows,open('d23.json','w',encoding='utf8'),ensure_ascii=False); print('emitted')
