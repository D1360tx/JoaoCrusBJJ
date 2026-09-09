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
 from austin_youth_combined_copy import PRIMARY_TEXT, HEADLINE
 old['primary_text']=PRIMARY_TEXT
 old['headline']=HEADLINE
 old['description']='Adults + Youth Ages 8–12 in Austin.'
 # Preserve other copy and landing page; distinguish variants in CRM attribution.
 old['destination_url']=old['destination_url'].replace('utm_content=AY09_BEGINNERS-WELCOME_VIDEO','utm_content={{ad.name}}')
 a7={'ad_name':'AY07_BEGINNER-BELONGING_STATIC','primary_text':'At 8–12, joining a new group can feel like the hardest part. Youth BJJ gives complete beginners a clear way in: meet the coach, learn one movement, practice with a partner, and build from there.\n\nOn the first visit, your child can watch or participate while your family sees how the class feels.\n\nClasses meet Tuesday and Thursday, 5:00–5:45 p.m. inside Castle Hill Fitness. Complete the class finder and Joao will personally call to help plan a free visit.','headline':'A Place to Start and Learn Together','description':'Youth BJJ, ages 8–12 in Austin.','destination_url':json.loads((PACK.parent/'approved-copy.json').read_text())[0]['destination_url'],'cta':'LEARN_MORE'}
 copies=[a7]+[{k:v for k,v in old.items() if k!='meta_ad_name'}|{'ad_name':n} for n in ['AY09A_BEGINNERS-WELCOME_LONG-VIDEO','AY09B_BEGINNERS-WELCOME_STATIC']]
 write(PACK/'approved-copy.json',copies)
 frame=PACK/'source-joao-frame-29s.png'
 run(['ffmpeg','-v','error','-y','-ss','29','-i',str(SOURCE),'-frames:v','1',str(frame)])
 manifest={'status':'PAUSED_ONLY','source_video':{'path':str(SOURCE.relative_to(ROOT)),'sha256':sha(SOURCE),'ffprobe':probe(SOURCE),'provenance':'Existing Drive-derived Joao-only source, retained unchanged. Not evidence of a Castle Hill class.'},'activation_gates':['Identifiable-student paid-media releases for AY07; website publication is not a release','Joao/source-video paid-media rights','Explicit activation and exact budget authorization','Opening date and website Lead acceptance'],'assets':[]}
 for ad in [copies[0],copies[2]]:
  group=ad==copies[0]; src=ROOT/'site/assets/castle-hill-youth-group-20260907.webp' if group else PACK/'source/IMG_6449-adults-group-source-2026-09-08.jpg'
  for ratio,h in [('1x1',1080),('9x16',1920)]:
   tall=h==1920; im=Image.new('RGB',(1080,h),BLACK); d=ImageDraw.Draw(im); boxes=[]; top=285 if tall else 60
   d.rectangle((72,top-22,240,top-12),fill=YELLOW)
   lines=["THERE'S ROOM",'TO BE A BEGINNER.'] if group else ['COMPLETE BEGINNERS','ARE WELCOME.']
   for j,s in enumerate(lines): text(im,boxes,s,top+j*(120 if tall else 98),108 if tall else 90,YELLOW if j else WHITE)
   if group:
    text(im,boxes,'A coach to learn from. Partners to practice with.',top+(270 if tall else 215),34,font=BODY)
    ph=Image.open(src).convert('RGB'); ph.thumbnail((936 if tall else 752,730 if tall else 590),Image.Resampling.LANCZOS); px=(1080-ph.width)//2; py=770 if tall else 370
   else:
    # Exact selected adult academy group. Full source retained, no location claim.
    assert sha(src)=='0e25957e88c7b59ed9a55fa3ef0811950293621db34319a41e0f1bf141f1ea59'
    ph=Image.open(src).convert('RGB'); assert ph.size==(1572,1179)
    ph.thumbnail((936 if tall else 880,730 if tall else 660),Image.Resampling.LANCZOS); px=(1080-ph.width)//2; py=690 if tall else 285
   d.rectangle((px-4,py-4,px+ph.width+4,py+ph.height+4),fill=BLUE); im.paste(ph,(px,py))
   footer='YOUTH BJJ | AGES 8–12 | CASTLE HILL FITNESS' if group else 'ADULTS + YOUTH AGES 8–12 · CASTLE HILL FITNESS'
   text(im,boxes,footer,1540 if tall else 995,29,font=BODY)
   out=PACK/f"{ad['ad_name']}_{ratio}{'' if group else '-adults-youth'}.png"; im.save(out,optimize=True)
   manifest['assets'].append({'ad_name':ad['ad_name'],'ratio':ratio,'path':str(out.relative_to(ROOT)),'sha256':sha(out),'width':1080,'height':h,'source':str(src.relative_to(ROOT)),'source_sha256':sha(src),'text_boxes':boxes,'photo_frame':[px-4,py-4,px+ph.width+4,py+ph.height+4],'safe_zone':[64,250 if tall else 40,1016,1600 if tall else 1040],'crop':'none; entire group retained' if group else 'none; full selected adult academy group retained; not a youth or Castle Hill scene claim'})
 for ratio,h in [('1x1',540),('9x16',960)]:
  sheet=Image.new('RGB',(1080,h))
  for i,a in enumerate(x for x in manifest['assets'] if x['ratio']==ratio): sheet.paste(Image.open(ROOT/a['path']).resize((540,h)),(540*i,0))
  sheet.save(PACK/f'contact-sheet-{ratio}.jpg',quality=94)
 prior=json.loads((PACK/'manifest.json').read_text())
 for key in ['combined_copy_revision','artwork_revision']:
  if key in prior: manifest[key]=prior[key]
 manifest['activation_gates'].append('All identifiable AY09B adult group participants paid-media permission before activation')
 write(PACK/'manifest.json',manifest)
 print('Built four static assets, source frame, two contact sheets and exact-copy manifest.')
if __name__=='__main__': main()
