#!/usr/bin/env python3
"""Deterministic, local-only review pack. Never uploads or activates ads."""
from pathlib import Path
import hashlib
import json
import re
from PIL import Image, ImageDraw, ImageFont, ImageOps

BASE = Path(__file__).resolve().parents[1]
ROOT = BASE.parents[3]
BLACK, CREAM, YELLOW, BLUE = '#101010', '#FFFDF8', '#F5C400', '#194FC3'
LOGO = 'site/assets/joao-crus-bjj-logo.png'
BRIEF = 'assets/ads-podcast/03-austin-castle-hill-launch.md'
SOURCES = {
    'practice': {'path': 'site/assets/youth-junior-warriors-training.webp', 'origin': 'https://i0.wp.com/joaocrusbjj.com/wp-content/uploads/2026/03/KIDS-BJJ.jpg', 'note': 'Existing first-party website photograph. One child practicing with an adult whose face is outside the original frame. Not a two-student coached tap scene. No claim that this was photographed at Castle Hill.'},
    'youth': {'path': 'site/assets/castle-hill-youth-group-20260907.webp', 'origin': 'https://www.castlehillfitness.com/wp-content/uploads/2026/08/Childrens-Jiu-Jitsu-Lesson-Austin-Tx.jpg', 'note': 'Documented partnership photograph in docs/CASTLE-HILL-PHOTO-REVISIONS.md. Do not assert capture at Castle Hill. Website-use approval is not proof of paid-media rights.'},
    'joao': {'path': 'site/assets/joao-crus-coach-headshot.webp', 'origin': 'https://i0.wp.com/joaocrusbjj.com/wp-content/uploads/2026/01/JOAO-CRUS-HEAD-SHOT.jpg', 'note': 'Existing official Joao portrait, not an instruction or drilling scene. Temporary review substitution only.'},
    'group': {'path': 'site/assets/campaign-images/home-academy-group-2026-07.webp', 'origin': 'assets/source-images/joao-academy-group-original-2026-07-31.jpg', 'note': 'Existing real academy group source. Not the five-black-belt lineup, not the Castle Hill cohort. Group includes children and adults; adult-only instruction photo still needed.'},
}
CONFIG = [
    ('AY01_TAP-MEANS-STOP_STATIC', ['TAP MEANS', 'STOP.'], ['practice'], 'AGES 8–12 · CENTRAL AUSTIN', 'Needs two Youth partners and visible coach in the same permission-cleared photograph; current source shows one child and cropped adult.'),
    ('AY03_CONFIDENCE-IS-PRACTICED_STATIC', ['CONFIDENCE', 'IS PRACTICED.'], ['practice'], 'AGES 8–12 · CENTRAL AUSTIN', 'Coached-practice source is real but coach face is outside original frame. Confirm subject age and paid-media permission.'),
    ('AY05_CASTLE-HILL-YOUTH_STATIC', ['YOUTH BJJ', 'AGES 8–12'], ['youth'], 'CENTRAL AUSTIN', 'Confirm guardian releases and Castle Hill paid co-marketing permission.'),
    ('AA01_BEGINNER-STARTS-HERE_STATIC', ['YOU DO NOT HAVE', 'TO GET READY', 'FIRST.'], ['joao'], 'ADULT JIU-JITSU · AUSTIN', 'Portrait substitution does not satisfy instruction-still requirement. Replace with a real beginner instruction photo.'),
    ('AA03_CALM-UNDER-PRESSURE_STATIC', ['CALM IS', 'A PRACTICE.'], ['joao'], 'ADULT JIU-JITSU · AUSTIN', 'Portrait substitution does not satisfy partner drill with Joao coaching. Real cleared photograph required.'),
    ('AA05_GROUP-OR-PRIVATE_STATIC', ['GROUP OR', 'PRIVATE.'], ['group', 'joao'], 'ADULT JIU-JITSU · AUSTIN', 'Split frame is present but portrait is not private coaching and group includes minors. Replace with adult group instruction and private-coaching photos.'),
]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def font(size, display=False):
    return ImageFont.truetype(str(BASE / 'tools/fonts' / ('Anton.ttf' if display else 'SpaceGrotesk.ttf')), size)

def build():
    brief = (ROOT / BRIEF).read_text()
    rows = []
    for name, lines, source_keys, audience, blocker in CONFIG:
        section = brief.split('### ' + name + '\n')[1].split('\n### ')[0].split('\n## ')[0]
        copy = {}
        for key, label in [('primary_text', 'Primary text'), ('headline', 'Headline'), ('description', 'Description')]:
            match = re.search(r'\*\*' + label + r':\*\* (.*)', section)
            if match is None:
                raise ValueError(f'Missing {label} in {name}')
            copy[key] = match.group(1)
        # Retain approved source copy; flag recommended-length overruns rather than silently rewriting.
        for ratio, height in [('1x1', 1080), ('9x16', 1920)]:
            story = height == 1920
            im = Image.new('RGB', (1080, height), CREAM)
            d = ImageDraw.Draw(im)
            boxes = []
            safe = [64, 270, 940, 1536] if story else [56, 56, 1024, 1024]
            x = 72
            top = 284 if story else 64
            def text(value, px, py, size, color=BLACK, display=False):
                f = font(size, display)
                box = list(d.textbbox((px, py), value, font=f, anchor='lt'))
                assert safe[0] <= box[0] and box[2] <= safe[2] and safe[1] <= box[1] and box[3] <= safe[3], (name, value, box)
                d.text((px, py), value, font=f, fill=color, anchor='lt')
                boxes.append({'text': value, 'bounds': box, 'font_px': size, 'color': color})
            # Decorative edge fields are intentionally outside placement-safe content.
            d.rectangle((0, 0, 1080, 20), fill=BLUE)
            d.rectangle((0, height-22, 1080, height), fill=BLUE)
            logo = Image.open(ROOT / LOGO).convert('RGBA').resize((108, 108), Image.Resampling.LANCZOS)
            im.paste(logo, (x, top), logo)
            text('JOAO CRUS BJJ', 200, top+12, 32)
            text('CASTLE HILL FITNESS', 200, top+56, 28, BLUE)
            title_y = top+148
            title_size = 94 if len(lines) < 3 else 74
            for n, line in enumerate(lines):
                text(line, x, title_y+n*(title_size+12), title_size, display=True)
            audience_y = title_y+len(lines)*(title_size+12)+10
            text(audience, x, audience_y, 26, BLUE)
            photo_top = 800 if story else 510
            photo_bottom = 1358 if story else 918
            right = 940 if story else 1008
            d.rectangle((x, photo_top, right, photo_bottom), fill=BLACK)
            frames=[]
            for i, key in enumerate(source_keys):
                src = Image.open(ROOT / SOURCES[key]['path']).convert('RGB')
                gap = 8
                width = (right-x-gap*(len(source_keys)-1)) // len(source_keys)
                left = x+i*(width+gap)
                # Contain every original frame; never crop a person or alter their appearance.
                fitted = ImageOps.contain(src, (width-8, photo_bottom-photo_top-8), Image.Resampling.LANCZOS)
                pos = (left+(width-fitted.width)//2, photo_top+(photo_bottom-photo_top-fitted.height)//2)
                im.paste(fitted, pos)
                frames.append({'source_key': key, 'bounds': [*pos, pos[0]+fitted.width, pos[1]+fitted.height], 'fit': 'contain', 'crop': None})
            cta_y = 1430 if story else 950
            d.rectangle((x, cta_y, x+398, cta_y+66), fill=YELLOW)
            text('FIND YOUR FIT', x+24, cta_y+19, 32)
            out = BASE / 'images' / ratio / (name+'_'+ratio+'.png')
            out.parent.mkdir(parents=True, exist_ok=True)
            im.save(out, optimize=True)
            provenance=[]
            for key in source_keys:
                s = dict(SOURCES[key]); s['sha256'] = sha(ROOT/s['path']);s['permission_status']='paid_media_release_not_documented';provenance.append(s)
            url = 'https://joaocrusbjj.com/castle-hill-grand-opening/?utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content='+name+'&utm_term={{adset.name}}&utm_id={{campaign.id}}'
            rows.append({'filename': str(out.relative_to(ROOT)), 'width':1080, 'height':height,'aspect_ratio':ratio,'ad_name':name,**copy,'destination_url':url,'utm_content':name,'sha256':sha(out),'source_images':provenance,'logo':{'path':LOGO,'sha256':sha(ROOT/LOGO),'bounds':[x,top,x+108,top+108],'treatment':'unaltered aspect-preserving RGBA resize'},'safe_zone':safe,'text_boxes':boxes,'photo_frames':frames,'on_image_copy':[b['text'] for b in boxes],'copy_lengths':{k:len(v) for k,v in copy.items()},'status':'review_only_not_upload_ready','blocking_notes':[blocker,'Paid-media participant releases and Castle Hill naming/co-marketing permission require confirmation.']})
    manifest={'schema_version':1,'status':'review_only_blocked','meta_mutations':False,'base_commit':'78ae3731e11b7545130f33729c4df4b76acb31a8','brief':BRIEF,'assets':rows}
    (BASE/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
    (BASE/'contact-sheets').mkdir(exist_ok=True)
    for ratio in ['1x1','9x16']:
        selected=[row for row in rows if row['aspect_ratio']==ratio]
        w=360;h=360 if ratio=='1x1' else 640
        sheet=Image.new('RGB',(w*3,(h+58)*2),CREAM); sd=ImageDraw.Draw(sheet)
        for i,row in enumerate(selected):
            image=Image.open(ROOT/row['filename']).resize((w,h),Image.Resampling.LANCZOS)
            px=i%3*w;py=i//3*(h+58);sheet.paste(image,(px,py))
            sd.text((px+10,py+h+8),row['ad_name'].split('_')[0]+' | '+ratio+' | REVIEW ONLY',font=font(17),fill=BLACK)
            sd.text((px+10,py+h+31),'Permission / scene gates unresolved',font=font(14),fill=BLUE)
        sheet.save(BASE/'contact-sheets'/('contact-sheet-'+ratio+'.jpg'),quality=94)
    print(json.dumps({'assets':len(rows),'concepts':len(CONFIG),'status':manifest['status']}))

if __name__ == '__main__':
    build()
