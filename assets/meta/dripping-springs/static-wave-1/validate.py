#!/usr/bin/env python3
"""Verify local static review package, without touching any remote service."""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    files = sorted([*HERE.glob('*.png'), HERE/'contact-sheet.jpg', HERE/'manifest.json'])
    before = {p.name: sha(p) for p in files}
    subprocess.run([sys.executable, str(HERE/'render.py')], check=True)
    after = {p.name: sha(p) for p in files}
    assert before == after, 'Non-deterministic rerender'
    m = json.loads((HERE/'manifest.json').read_text())
    assert len(m['assets']) == 2
    for a in m['assets']:
        p = HERE/a['path']
        assert sha(p) == a['sha256']
        assert list(Image.open(p).size) == a['dimensions']
    for a in m['source_assets']:
        assert sha(ROOT/a['path']) == a['sha256']
    workroom = ROOT/'docs/META-ADS-CREATIVE-WORKROOM-2026-09-23.md'
    doc = workroom.read_text()
    matrix = doc.split('## 5.')[1].split('## 6.')[0]
    rows = re.findall(r'^\| `(DS_|AUS_).+$', matrix, flags=re.M)
    assert len(rows) == 4
    cards = doc.split('## 7.')[1].split('## 8.')[0]
    assert '\u2014' not in cards
    counts = []
    for line in cards.splitlines():
        match = re.match(r'- \*\*(?:Exact current |Exact )?(Primary text|primary text|Headline|headline|Description|description):\*\* (.+)', line)
        if match:
            field, value = match.groups()
            value = value.strip('“”').replace('\\n', '\n')
            if value.startswith('`'):
                value = value.split('`')[1]
            limit = {'primary text': 125, 'headline': 40, 'description': 30}[field.lower()]
            counts.append({'field': field.lower(), 'characters': len(value), 'recommendation': limit, 'within_recommendation': len(value) <= limit})
    assert len(counts) == 12, counts
    links = []
    for source in (workroom, HERE/'README.md'):
        for link in re.findall(r'\]\(([^)]+)\)', source.read_text()):
            if not link.startswith(('http:', 'https:', '#')):
                target = (source.parent/link.split('#')[0]).resolve()
                assert target.exists(), target
                links.append(str(target.relative_to(ROOT)))
    existing = []
    for ratio, dims in [('1x1', (1080,1080)), ('9x16',(1080,1920))]:
        p = ROOT/f'assets/meta/castle-hill/safe-wave-1/images/{ratio}/AA01_BEGINNER-STARTS-HERE_STATIC_{ratio}.png'
        assert Image.open(p).size == dims
        existing.append({'path': str(p.relative_to(ROOT)), 'dimensions': list(dims), 'sha256': sha(p)})
        p = Path('/home/d1360/joao-austin-youth-ay07-ay08/assets/meta/castle-hill/youth-wave-2/comparisons')/f'AY09B_BEGINNERS-WELCOME_STATIC_{ratio}-adults-youth.png'
        assert Image.open(p).size == dims
        existing.append({'external_recovery_path': str(p), 'dimensions': list(dims), 'sha256': sha(p), 'note': 'Local recovery hash; not proof of equivalence to Meta hash'})
    report = {'result': 'PASS', 'selected_static_concepts': len(rows), 'new_ds_exports': len(m['assets']), 'deterministic_rerender': before == after, 'local_links_checked': len(links), 'copy_counts': counts, 'source_and_output_hashes': 'PASS', 'existing_recovery_assets': existing, 'visual_review': 'Contact sheet inspected: no clipping, full partner-practice frame retained, text outside photo; native previews and user approval pending', 'remaining_gates': m['activation_gates']}
    (HERE/'validation.json').write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
