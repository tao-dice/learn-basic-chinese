"""จัดคำ HSK 2–3 เป็นบทเรียน (บทละ 6 คำ เรียงตามหมวด) → lessons23.json"""
import json
from th2 import TH2
from th3 import TH3
TOPICS = [("fam","ครอบครัว & ผู้คน"),("body","ร่างกาย & สุขภาพ"),("food","อาหาร & เครื่องดื่ม"),("home","บ้าน & ของใช้"),
  ("city","เมือง & สถานที่"),("trav","เดินทาง & ทิศทาง"),("dir","ไป–มา ขึ้น–ลง"),("time","เวลา & เทศกาล"),("natr","ธรรมชาติ & ฤดูกาล"),
  ("schl","โรงเรียน & การเรียน"),("work","งาน & ออฟฟิศ"),("fun","กีฬา งานอดิเรก & สื่อ"),("shop","เงิน & ซื้อของ"),("feel","ความรู้สึก & นิสัย"),
  ("desc","คำบรรยายลักษณะ"),("act","คำกริยาท่าทาง"),("mind","คิด รู้ & สื่อสาร"),("meas","ตัวเลข & ลักษณนาม"),("gram","คำเชื่อม & คำช่วย")]
TN = dict(TOPICS); ORDER = {k: i for i, (k, _) in enumerate(TOPICS)}
src = json.load(open('l23.json', encoding='utf8'))
def parse(txt):
    out = []
    for ln in txt.strip().split('\n'):
        h, t, k = ln.split('|'); assert k in TN, (ln, k); out.append((h, t, k))
    return out
lessons, day = [], 52
words = []
for lv, txt in ((2, TH2), (3, TH3)):
    rows = parse(txt)
    py = {}
    for x in src[str(lv)]:
        h = x[0].rstrip('0123456789')
        py.setdefault(h, x[1].replace(' ', '').replace('’', "'"))
    hs = [r[0] for r in rows]
    assert len(hs) == len(set(hs)), [h for h in hs if hs.count(h) > 1]
    miss = [h for h in py if h not in hs]; extra = [h for h in hs if h not in py]
    assert not miss and not extra, (lv, miss, extra)
    rows.sort(key=lambda r: ORDER[r[2]])  # sort คงลำดับเดิมในหมวดเดียวกัน
    start = day
    for i in range(0, len(rows), 6):
        chunk = rows[i:i+6]
        ks = []
        for r in chunk:
            if r[2] not in ks: ks.append(r[2])
        lessons.append({"day": day, "level": lv, "theme": " · ".join(TN[k] for k in ks)})
        for h, t, k in chunk: words.append([h, py[h], t, day])
        day += 1
    print(f'HSK{lv}: words {len(rows)} lessons {start}-{day-1}')
json.dump({"lessons": lessons, "words": words}, open('lessons23.json', 'w', encoding='utf8'), ensure_ascii=False)
