"""Deterministic AY07/AY08 real-photo pack. No generation or photo cropping."""
from pathlib import Path
import json, hashlib
from PIL import Image, ImageDraw, ImageFont
R=Path(__file__).resolve().parents[1]; P=R/'assets/meta/castle-hill/youth-wave-2'; P.mkdir(parents=True,exist_ok=True)
DISPLAY='/mnt/c/Windows/Fonts/impact.ttf'; BODY='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
URL='https://joaocrusbjj.com/castle-hill-grand-opening/?utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}'
ADS=[dict(ad_name='AY07_YOUTH-8-12-ON-PURPOSE_STATIC',primary_text='Ages 8–12 need instruction built for their stage, not a toddler class or an adult class made smaller. At Joao Crus BJJ, age-matched coaching combines movement, clear directions and partner practice. Austin Youth meets Tuesday and Thursday, 5:00–5:45 p.m., inside Castle Hill Fitness. Complete the class finder and Joao personally calls to arrange a free visit. Your child may watch or participate.',headline='Youth BJJ Built for Ages 8–12',description='Tue/Thu at Castle Hill Fitness.',source='site/assets/castle-hill-youth-group-20260907.webp',lines=['STARTING AT','AGES 8–12.','ON PURPOSE.'],sub='AGE-MATCHED COACHING. REAL PRACTICE.',footer='YOUTH BJJ • CASTLE HILL FITNESS'),dict(ad_name='AY08_REAL-PRACTICE_STATIC',primary_text='Confidence grows through practice: a coached attempt, a clear boundary, responsibility for a partner, then a reset and another try. Austin Youth BJJ welcomes ages 8–12, including complete beginners, inside Castle Hill Fitness. Classes meet Tuesday and Thursday, 5:00–5:45 p.m. Complete the class finder and Joao personally calls to arrange a free visit. Your child may watch or participate.',headline='Confidence Grows Through Practice',description='Youth BJJ in Central Austin.',source='site/assets/youth-junior-warriors-group.webp',lines=['REAL PRACTICE.','EARNED CONFIDENCE.'],sub='AGES 8–12 • COMPLETE BEGINNERS WELCOME.',footer='JOAO CRUS BJJ • CENTRAL AUSTIN')]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
copy=[{k:a[k] for k in ['ad_name','primary_text','headline','description']}|{'destination_url':URL,'cta':'LEARN_MORE'} for a in ADS]
(P/'approved-copy.json').write_text(json.dumps(copy,ensure_ascii=False,indent=2)+'\n')
m={'status':'PAUSED_ONLY_MEDIA_RELEASE_GATE','ai_imagery':False,'activation_gates':['Identifiable-student media approval for both photos','Explicit traffic/activation authorization','Opening date and website Lead tracking acceptance'],'reference':'AD03_START-AT-3_STATIC: condensed three-line rationale hook, accent, real group photo; adapted age-specific teaching, not toddler claims.','source_allowlist':[{'path':a['source'],'sha256':sha(R/a['source']),'provenance':'Castle Hill public co-marketing article; see docs/CASTLE-HILL-PHOTO-REVISIONS.md. Location of photo not asserted.' if i==0 else 'Owned/supplied real academy photograph approved on Youth page. Location of photo not asserted.','paid_media_release':'Before-activation gate; website publication is not a participant release.'} for i,a in enumerate(ADS)],'assets':[]}
for i,a in enumerate(ADS):
 for ratio,h in [('1x1',1080),('9x16',1920)]:
  tall=h==1920; top=280 if tall else 60
  im=Image.new('RGB',(1080,h),'#101010'); d=ImageDraw.Draw(im); boxes=[]
  def text(s,y,size=80,color='#FFFDF8',font=DISPLAY):
   f=ImageFont.truetype(font,size)
   while d.textlength(s,font=f)>936: size-=1; f=ImageFont.truetype(font,size)
   b=d.textbbox((72,y),s,font=f,anchor='lt'); d.text((72,y),s,font=f,fill=color,anchor='lt'); boxes.append({'text':s,'bounds':b,'font_px':size})
  d.rectangle((72,top-20,240,top-10),fill='#F5C400' if i==0 else '#194FC3')
  y=top
  for j,line in enumerate(a['lines']):
   text(line,y,112 if tall else 90,'#F5C400' if i==0 and j==1 else '#FFFDF8'); y+=125 if tall else 100
  text(a['sub'],y+12,31,font=BODY)
  photo=Image.open(R/a['source']).convert('RGB'); maxw=936 if tall or i==1 else 720
  photo.thumbnail((maxw,710 if tall else 525),Image.Resampling.LANCZOS)
  px=(1080-photo.width)//2; py=760 if tall else 430 if i==0 else 420
  d.rectangle((px-4,py-4,px+photo.width+4,py+photo.height+4),fill='#F5C400' if i==0 else '#194FC3'); im.paste(photo,(px,py))
  text(a['footer'],1540 if tall else 1005,29,font=BODY)
  out=P/'images'/ratio/(a['ad_name']+'_'+ratio+'.png'); out.parent.mkdir(parents=True,exist_ok=True); im.save(out,optimize=True)
  m['assets'].append(copy[i]|{'filename':str(out.relative_to(R)),'source_images':[a['source']],'aspect_ratio':ratio,'width':1080,'height':h,'sha256':sha(out),'text_boxes':boxes,'safe_zone':[64,top,1016,1590 if tall else 1040],'photo_frame':[px,py,px+photo.width,py+photo.height],'crop':'none; full original aspect ratio retained'})
(P/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
for ratio,h in [('1x1',540),('9x16',960)]:
 sheet=Image.new('RGB',(1080,h))
 for i,a in enumerate(x for x in m['assets'] if x['aspect_ratio']==ratio): sheet.paste(Image.open(R/a['filename']).resize((540,h)),(540*i,0))
 sheet.save(P/f'contact-sheet-{ratio}.jpg',quality=94)
print('Built four PNGs and two contact sheets; full source images retained.')
