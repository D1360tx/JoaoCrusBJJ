"""Fail closed on provenance, exact approved copy, count, size and overlaps."""
from pathlib import Path
import json, hashlib
from PIL import Image
R=Path(__file__).resolve().parents[1]; P=R/'assets/meta/castle-hill/safe-wave-1'
m=json.loads((P/'manifest.json').read_text()); copy={a['ad_name']:a for a in json.loads((P/'approved-copy.json').read_text())}
assert len(copy)==6 and len(m['assets'])==12
allowed={s['path'] for s in m['source_allowlist']}
assert allowed=={'site/assets/castle-hill-multisport-room-20260907.webp','site/assets/joao-crus-bjj-logo.png'}
for s in m['source_allowlist']: assert hashlib.sha256((R/s['path']).read_bytes()).hexdigest()==s['sha256']
assert len({a['sha256'] for a in m['assets']})==12
for name in copy:
    assert {a['aspect_ratio'] for a in m['assets'] if a['ad_name']==name}=={'1x1','9x16'}
for a in m['assets']:
    p=R/a['filename']; assert p.stat().st_size<30000000
    assert Image.open(p).size==(1080,1080 if a['aspect_ratio']=='1x1' else 1920)
    assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256']
    assert set(a['source_images'])==allowed
    for k,v in copy[a['ad_name']].items(): assert a[k]==v
    assert 'September 14' not in json.dumps(a)
    boxes=[b['bounds'] for b in a['text_boxes']]
    for i,b in enumerate(boxes):
        safe=a['safe_zone']; assert b[0]>=safe[0] and b[1]>=safe[1] and b[2]<=safe[2] and b[3]<=safe[3]
        for c in boxes[i+1:]: assert b[2]<=c[0] or c[2]<=b[0] or b[3]<=c[1] or c[3]<=b[1],(b,c)
print('PASS: 6 concepts / 12 unique PNGs; dimensions, checksums, two-source allowlist, exact copy, safe zones, zero text overlaps, no unconfirmed date.')
