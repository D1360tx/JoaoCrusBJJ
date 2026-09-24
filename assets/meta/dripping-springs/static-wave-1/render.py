#!/usr/bin/env python3
"""Local review only. Run with Pillow 12.3.0; no network or Meta writes.
Impact/Arial are licensed host fonts, not redistributed. Override via env.
"""
import hashlib
import json
import os
from pathlib import Path
from itertools import combinations
import PIL
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PHOTO = ROOT / 'site/assets/campaign-images/kids-training.webp'
LOGO = ROOT / 'site/assets/joao-crus-bjj-logo.png'
DISPLAY = Path(os.environ.get('DISPLAY_FONT', '/mnt/c/Windows/Fonts/impact.ttf'))
BODY = Path(os.environ.get('BODY_FONT', '/mnt/c/Windows/Fonts/arial.ttf'))
BLACK, CREAM, YELLOW, BLUE = '#101010', '#FFFDF8', '#F5C400', '#194FC3'
COPY = {
    'primary_text': 'Dripping Springs Youth BJJ, ages 8-12. Practice tapping, stopping and resetting with a partner. Explore a free visit.',
    'headline': 'Tap. Stop. Reset.',
    'description': 'Youth BJJ in Dripping Springs',
    'cta': 'LEARN_MORE',
    'destination': 'https://joaocrusbjj.com/kids-first-class/',
}

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def inside(a, b):
    return a[0] >= b[0] and a[1] >= b[1] and a[2] <= b[2] and a[3] <= b[3]

def overlaps(a, b):
    return max(a[0], b[0]) < min(a[2], b[2]) and max(a[1], b[1]) < min(a[3], b[3])

def render(vertical):
    h = 1920 if vertical else 1080
    image = Image.new('RGB', (1080, h), CREAM)
    draw = ImageDraw.Draw(image)
    safe = [65, 270, 900, 1510] if vertical else [48, 48, 1032, 1032]
    left, top, right, bottom = safe
    boxes = []
    def text(label, x, y, size, color=BLACK, display=False):
        font = ImageFont.truetype(str(DISPLAY if display else BODY), size)
        draw.text((x, y), label, font=font, fill=color, anchor='lt')
        box = list(draw.textbbox((x, y), label, font=font, anchor='lt'))
        assert inside(box, safe), (label, box, safe)
        assert '\u2014' not in label
        boxes.append({'kind': 'text', 'text': label, 'bounds': box})
    draw.rectangle((0, 0, 1079, 18), fill=BLUE)
    draw.rectangle((0, h-19, 1079, h-1), fill=YELLOW)
    logo_size = 96 if vertical else 86
    logo = Image.open(LOGO).convert('RGBA')
    logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
    image.paste(logo, (left, top), logo)
    boxes.append({'kind': 'logo', 'bounds': [left, top, left+logo.width, top+logo.height]})
    text('JOAO CRUS BJJ', left+logo_size+22, top+12, 35, display=True)
    text('DRIPPING SPRINGS | YOUTH 8-12', left+logo_size+22, top+58, 26, BLUE)
    y = top+132 if vertical else top+112
    text('TAP. STOP. RESET.', left, y, 104 if vertical else 110, display=True)
    sub_y = y+130 if vertical else y+123
    text('WHAT STUDENTS PRACTICE', left, sub_y, 30, BLUE)
    photo_y = sub_y+65 if vertical else sub_y+50
    width = right-left if vertical else 760
    source = Image.open(PHOTO).convert('RGB')
    ph = round(source.height*width/source.width)
    photo = source.resize((width, ph), Image.Resampling.LANCZOS)
    px = left if vertical else (1080-width)//2
    image.paste(photo, (px, photo_y))
    draw.rectangle((px, photo_y, px+width-1, photo_y+ph-1), outline=BLACK, width=4)
    boxes.append({'kind': 'photo', 'bounds': [px, photo_y, px+width, photo_y+ph]})
    by = photo_y+ph+28
    text('Practice the stop signal.', left, by, 38 if vertical else 32)
    text('Respond to a partner. Try again.', left, by+50 if vertical else by+42, 38 if vertical else 32)
    cta_y = by+130 if vertical else by+94
    draw.rectangle((left, cta_y-12, left+452, cta_y+51), fill=YELLOW)
    text('EXPLORE YOUTH BJJ', left+20, cta_y, 34, display=True)
    for a, b in combinations(boxes, 2):
        assert not overlaps(a['bounds'], b['bounds']), (a, b)
    assert all(inside(x['bounds'], safe) for x in boxes)
    name = f'DS_YOUTH_CH01_TAP-STOP-RESET_STATIC_{"9x16" if vertical else "1x1"}.png'
    path = HERE/name
    image.save(path, compress_level=9)
    assert Image.open(path).size == (1080, h)
    return {'path': name, 'dimensions': [1080, h], 'sha256': sha(path), 'safe_bounds': safe, 'elements': boxes, 'photo_crop': 'none; entire original frame proportionally resized', 'bytes': path.stat().st_size}

def main():
    for path in (PHOTO, LOGO, DISPLAY, BODY):
        assert path.is_file(), path
    counts = {key: len(COPY[key]) for key in ('primary_text', 'headline', 'description')}
    assert counts['primary_text'] <= 125 and counts['headline'] <= 40 and counts['description'] <= 30
    assert all('\u2014' not in value for value in COPY.values())
    assets = [render(False), render(True)]
    sheet = Image.new('RGB', (900, 900), '#dddddd')
    d = ImageDraw.Draw(sheet)
    font = ImageFont.truetype(str(BODY), 22)
    d.text((24, 16), 'REVIEW ONLY | paid-media guardian releases pending', fill=BLACK, font=font)
    for x, asset in zip((24, 470), assets):
        thumb = Image.open(HERE/asset['path'])
        thumb.thumbnail((406, 790), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x, 60))
    sheet.save(HERE/'contact-sheet.jpg', quality=92, subsampling=0)
    manifest = {
        'concept_id': 'DS_YOUTH_CH01_TAP-STOP-RESET_STATIC',
        'status': 'LOCAL-REVIEW; NOT UPLOAD-READY',
        'public_copy': COPY, 'character_counts': counts,
        'copy_limits': {'primary_text': 125, 'headline': 40, 'description': 30},
        'photo_evidence': 'Youth partner practice only. This frame does not prove a tap, immediate release or reset. Copy describes curriculum practice, not a depicted sequence.',
        'activation_gates': ['Specific paid-media guardian release for every identifiable minor', 'Joao/Diego exact copy and curriculum approval', 'Destination and attribution QA', 'Separate paused-upload and activation authorization'],
        'source_assets': [{'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'dimensions': list(Image.open(p).size)} for p in (PHOTO, LOGO)],
        'fonts': [{'path': str(p), 'sha256': sha(p)} for p in (DISPLAY, BODY)],
        'pillow_version': PIL.__version__,
        'safe_zone_policy': 'Conservative local review bounds, not native placement-preview approval. Vertical reserves top 270, bottom 410 and right 180 pixels.',
        'assets': assets,
        'contact_sheet': {'path': 'contact-sheet.jpg', 'sha256': sha(HERE/'contact-sheet.jpg'), 'upload': False},
        'validation': {'dimensions': 'PASS', 'safe_bounds': 'PASS', 'pairwise_overlap': 'PASS', 'copy_limits': 'PASS', 'no_em_dash': 'PASS'},
    }
    (HERE/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    print(json.dumps({'assets': len(assets), 'character_counts': counts, 'validation': manifest['validation']}))

if __name__ == '__main__':
    main()
