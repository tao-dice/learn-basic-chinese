#!/bin/bash
# shots.sh name W H "view1 view2..." [theme] [cellw]   (view may include &key=val)
cd "$(dirname "$0")"
python3 -c "
s=open('hsk.html',encoding='utf8').read()
open('test.html','w',encoding='utf8').write('<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body>'+s+'<script>'+open('harness.js',encoding='utf8').read()+'</scr'+'ipt></body></html>')"
name=$1; W=$2; H=$3; views=$4; theme=$5; cw=${6:-390}
{ echo '<!doctype html><meta charset="utf-8"><body style="margin:0;display:flex;gap:10px;background:#888">'
  for v in $views; do echo "<iframe src=\"test.html#v=${v}${theme:+&theme=$theme}\" style=\"width:${cw}px;height:${H}px;border:0;flex:none\"></iframe>"; done; echo '</body>'; } > sheet-$name.html
rm -f "shot-$name.png"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$PWD/chrome-prof" --allow-file-access-from-files --window-size=$W,$H --virtual-time-budget=8000 --screenshot="$PWD/shot-$name.png" "file://$PWD/sheet-$name.html" >/dev/null 2>&1 &
cpid=$!; for i in $(seq 1 60); do [ -s "shot-$name.png" ] && break; sleep 0.5; done; sleep 1; kill $cpid 2>/dev/null; pkill -f "user-data-dir=$PWD/chrome-prof" 2>/dev/null; sleep 0.5
ls -la "shot-$name.png" 2>/dev/null | awk '{print $5, $9}'
