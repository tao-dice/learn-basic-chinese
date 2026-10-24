# พิชิต HSK 1–3

เว็บเตรียมสอบภาษาจีน HSK 1–3 (ระบบใหม่ HSK 3.0) ไฟล์เดียว: คำศัพท์ 988 คำ ลำดับขีด รากศัพท์ เครือข่ายตัวอักษร เกมประโยค/บทสนทนา และข้อสอบเต็ม HSK 1/2/3

- `hsk.html` — ตัวเว็บ (เปิดในเบราว์เซอร์ได้เลย)
- `base.html` — ต้นฉบับ HSK 1 ที่ `build3.py` ใช้เป็นฐาน
- สร้างใหม่: `python3 build3.py && node --check main.js`
- ประโยค/บทสนทนา: แก้ `s23.py` / `d23.py` แล้วรัน `python3 val23.py --emit` / `python3 vald23.py --emit` ก่อน build
- ตรวจหน้าจอ: `./shots.sh <ชื่อ> <กว้าง> <สูง> "<view ...>"` (ต้องมี Google Chrome)

ข้อมูลลำดับขีดจาก [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) และรากศัพท์จาก [Make Me a Hanzi](https://github.com/skishore/makemeahanzi)
