"""Deterministic people-free Castle Hill ads. No network/generative sources."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont, ImageOps
ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / 'assets/meta/castle-hill/safe-wave-1'
PHOTO = 'site/assets/castle-hill-multisport-room-20260907.webp'
LOGO = 'site/assets/joao-crus-bjj-logo.png'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
BODY = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BLACK, WHITE, BLUE, YELLOW = '#101010', '#FFFDF8', '#194FC3', '#F5C400'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
copy = json.loads((PACK/'approved-copy.json').read_text())
headings = [['TAP MEANS','STOP.'], ['CONFIDENCE','IS PRACTICED.'], ['CASTLE HILL','YOUTH BJJ.'], ['BEGINNER','STARTS HERE.'], ['CALM UNDER','PRESSURE.'], ['GROUP OR','PRIVATE?']]
subheads = ['Communicate. Stop. Reset.', 'Try. Listen. Try again.', 'Ages 8–12 | Tue/Thu 5:00–5:45 p.m.', 'Adult BJJ | Tue/Thu 6:00–7:00 p.m.', 'Position. Timing. Breathing.', 'Group classes. Private appointments.']
manifest = {'schema_version':1, 'status':'permission_safe_paused_build', 'approval':'User: Use only Joao/facility-safe creative and keep every ad paused.', 'copy_source':{'pr':114,'commit':'4b3059495579ac2796ec4308b05a860224557b54','changes':[]}, 'source_allowlist':[{'path':PHOTO,'sha256':sha(ROOT/PHOTO),'origin':'https://www.castlehillfitness.com/wp-content/uploads/photo-gallery/imported_from_media_libray/Multisport-Room.jpg?bwg=1769443583','evidence':'docs/CASTLE-HILL-PHOTO-REVISIONS.md','visual_review':'Empty real facility, including mirrors. No people or portraits. Illustrative location photo, not assigned classroom proof.'},{'path':LOGO,'sha256':sha(ROOT/LOGO),'evidence':'Official academy logo, existing brand asset; explicit user safe-creative authorization.'}], 'assets':[]}
for i, ad in enumerate(copy):
    for ratio,h in [('1x1',1080),('9x16',1920)]:
        tall=h==1920; top=280 if tall else 64
        bg=[WHITE,BLUE,YELLOW,BLACK,WHITE,BLUE][i]; fg=BLACK if bg in (WHITE,YELLOW) else WHITE
        im=Image.new('RGB',(1080,h),bg); d=ImageDraw.Draw(im); boxes=[]
        def text(s,x,y,size,color=fg,bold=False):
            font=ImageFont.truetype(FONT if bold else BODY,size)
            b=d.textbbox((x,y),s,font=font,anchor='lt'); assert b[2]<=1016,(s,b)
            assert b[0]>=64 and b[1]>=top and b[3]<= (1570 if tall else 1024),(s,b)
            d.text((x,y),s,font=font,fill=color,anchor='lt'); boxes.append({'text':s,'bounds':b,'font_px':size})
        logo=Image.open(ROOT/LOGO).convert('RGBA'); logo.thumbnail((100,100)); im.paste(logo,(72,top),logo)
        text('JOAO CRUS BJJ',194,top+8,34,bold=True)
        text('INSIDE CASTLE HILL FITNESS',194,top+58,25)
        y=top+145
        for line in headings[i]: text(line,72,y,86,bold=True); y+=100
        text(subheads[i],72,y+10,30)
        # Six compositions: two wide, offset-left/right, inset, split treatment.
        photo_y=y+75
        ph=600 if tall else 345
        widths=[936,840,936,840,888,936]; pw=widths[i]
        px=[72,72,72,168,96,72][i]
        frame=ImageOps.fit(Image.open(ROOT/PHOTO).convert('RGB'),(pw,ph),centering=([.5,.25,.5,.75,.4,.65][i],.55))
        d.rectangle((px+10,photo_y+10,px+pw+10,photo_y+ph+10),fill=BLACK if bg!=BLACK else YELLOW)
        im.paste(frame,(px,photo_y)); d.rectangle((px,photo_y,px+pw,photo_y+ph),outline=fg,width=3)
        cap_y=photo_y+ph+25
        text('Castle Hill facility photo. Program described in copy.',72,cap_y,23)
        text('Illustrative space, not a class or assigned-room photo.',72,cap_y+31,23)
        cta_y=1470 if tall else 945
        d.rectangle((72,cta_y,490,cta_y+66),fill=YELLOW if bg!=YELLOW else BLACK)
        text('LEARN MORE  →',96,cta_y+19,29,BLACK if bg!=YELLOW else WHITE,True)
        if tall: text('1112 N LAMAR BLVD · AUSTIN',72,1410,29,bold=True)
        out=PACK/'images'/ratio/(ad['ad_name']+'_'+ratio+'.png'); out.parent.mkdir(parents=True,exist_ok=True); im.save(out,optimize=True)
        manifest['assets'].append({**ad,'filename':str(out.relative_to(ROOT)),'width':1080,'height':h,'aspect_ratio':ratio,'sha256':sha(out),'source_images':[PHOTO,LOGO],'text_boxes':boxes,'safe_zone':[64,top,1016,1570 if tall else 1024],'photo_frame':[px,photo_y,px+pw,photo_y+ph]})
(PACK/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for ratio,h in [('1x1',1080),('9x16',1920)]:
    thumb_h=360 if h==1080 else 640
    sheet=Image.new('RGB',(1080,thumb_h*2),WHITE)
    for i,a in enumerate([a for a in manifest['assets'] if a['aspect_ratio']==ratio]):
        tile=Image.open(ROOT/a['filename']).resize((360,thumb_h)); sheet.paste(tile,((i%3)*360,(i//3)*thumb_h))
    sheet.save(PACK/('contact-sheet-'+ratio+'.jpg'),quality=93)
assert len(manifest['assets'])==12
print('Built 12 unique assets, 6 concepts, 2 contact sheets; text bounds asserted.')
