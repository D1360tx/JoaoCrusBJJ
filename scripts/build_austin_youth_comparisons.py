"""Reproducible approved AY07 revision and AY09 format comparisons; no Meta writes."""
from pathlib import Path
import hashlib, json, subprocess
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
PACK=ROOT/'assets/meta/castle-hill/youth-wave-2/comparisons'
SOURCE=ROOT/'site/assets/campaign-videos/practice-under-pressure-welcome-2026-08-v2.mp4'
DISPLAY='/mnt/c/Windows/Fonts/impact.ttf'
BODY='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
BLACK='#101010'; WHITE='#FFFDF8'; YELLOW='#F5C400'; BLUE='#194FC3'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def run(args): subprocess.run(args,check=True)
def probe(p): return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,codec_type,width,height,r_frame_rate','-of','json',str(p)]))
def write(p,v): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def text(im,boxes,s,y,size=70,color=WHITE,font=DISPLAY,x=72,maxw=936):
 d=ImageDraw.Draw(im); f=ImageFont.truetype(font,size)
 while d.textlength(s,font=f)>maxw: size-=1; f=ImageFont.truetype(font,size)
 b=list(d.textbbox((x,y),s,font=f,anchor='lt')); d.text((x,y),s,font=f,fill=color,anchor='lt'); boxes.append({'text':s,'bounds':b,'font_px':size})
def main():
 PACK.mkdir(parents=True,exist_ok=True)
 old=json.loads((PACK.parent/'video/approved-copy.json').read_text())
 # Match current AY09 media test copy and destination exactly, including its existing content UTM.
 a7={'ad_name':'AY07_BEGINNER-BELONGING_STATIC','primary_text':'At 8–12, joining a new group can feel like the hardest part. Youth BJJ gives complete beginners a clear way in: meet the coach, learn one movement, practice with a partner, and build from there.\n\nOn the first visit, your child can watch or participate while your family sees how the class feels.\n\nClasses meet Tuesday and Thursday, 5:00–5:45 p.m. inside Castle Hill Fitness. Complete the class finder and Joao will personally call to help plan a free visit.','headline':'A Place to Start and Learn Together','description':'Youth BJJ, ages 8–12 in Austin.','destination_url':json.loads((PACK.parent/'approved-copy.json').read_text())[0]['destination_url'],'cta':'LEARN_MORE'}
 copies=[a7]+[{k:v for k,v in old.items() if k!='meta_ad_name'}|{'ad_name':n} for n in ['AY09A_BEGINNERS-WELCOME_LONG-VIDEO','AY09B_BEGINNERS-WELCOME_STATIC']]
 write(PACK/'approved-copy.json',copies)
 frame=PACK/'source-joao-frame-29s.png'
 run(['ffmpeg','-v','error','-y','-ss','29','-i',str(SOURCE),'-frames:v','1',str(frame)])
 manifest={'status':'PAUSED_ONLY','source_video':{'path':str(SOURCE.relative_to(ROOT)),'sha256':sha(SOURCE),'ffprobe':probe(SOURCE),'provenance':'Existing Drive-derived Joao-only source, retained unchanged. Not evidence of a Castle Hill class.'},'activation_gates':['Identifiable-student paid-media releases for AY07; website publication is not a release','Joao/source-video paid-media rights','Explicit activation and exact budget authorization','Opening date and website Lead acceptance'],'assets':[]}
 for ad in [copies[0],copies[2]]:
  group=ad==copies[0]; src=ROOT/'site/assets/castle-hill-youth-group-20260907.webp' if group else frame
  for ratio,h in [('1x1',1080),('9x16',1920)]:
   tall=h==1920; im=Image.new('RGB',(1080,h),BLACK); d=ImageDraw.Draw(im); boxes=[]; top=285 if tall else 60
   d.rectangle((72,top-22,240,top-12),fill=YELLOW)
   lines=["THERE'S ROOM",'TO BE A BEGINNER.'] if group else ['COMPLETE BEGINNERS','ARE WELCOME.']
   for j,s in enumerate(lines): text(im,boxes,s,top+j*(120 if tall else 98),108 if tall else 90,YELLOW if j else WHITE)
   if group:
    text(im,boxes,'A coach to learn from. Partners to practice with.',top+(270 if tall else 215),34,font=BODY)
    ph=Image.open(src).convert('RGB'); ph.thumbnail((936 if tall else 752,730 if tall else 590),Image.Resampling.LANCZOS); px=(1080-ph.width)//2; py=770 if tall else 370
   else:
    # Full head and shoulders: intentional real-source crop, never generate identity.
    ph=Image.open(src).convert('RGB').crop((70,105,650,980)); ph.thumbnail((680,850 if tall else 600),Image.Resampling.LANCZOS); px=(1080-ph.width)//2; py=605 if tall else 285
   d.rectangle((px-4,py-4,px+ph.width+4,py+ph.height+4),fill=BLUE); im.paste(ph,(px,py))
   footer='YOUTH BJJ | AGES 8–12 | CASTLE HILL FITNESS'
   text(im,boxes,footer,1540 if tall else 995,29,font=BODY)
   out=PACK/f"{ad['ad_name']}_{ratio}.png"; im.save(out,optimize=True)
   manifest['assets'].append({'ad_name':ad['ad_name'],'ratio':ratio,'path':str(out.relative_to(ROOT)),'sha256':sha(out),'width':1080,'height':h,'source':str(src.relative_to(ROOT)),'source_sha256':sha(src),'text_boxes':boxes,'photo_frame':[px-4,py-4,px+ph.width+4,py+ph.height+4],'safe_zone':[64,250 if tall else 40,1016,1600 if tall else 1040],'crop':'none; entire group retained' if group else 'source frame 29s, crop [70,105,650,980]; full face preserved'})
 for ratio,h in [('1x1',540),('9x16',960)]:
  sheet=Image.new('RGB',(1080,h))
  for i,a in enumerate(x for x in manifest['assets'] if x['ratio']==ratio): sheet.paste(Image.open(ROOT/a['path']).resize((540,h)),(540*i,0))
  sheet.save(PACK/f'contact-sheet-{ratio}.jpg',quality=94)
 write(PACK/'manifest.json',manifest)
 print('Built four static assets, source frame, two contact sheets and exact-copy manifest.')
if __name__=='__main__': main()
