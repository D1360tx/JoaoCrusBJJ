#!/usr/bin/env python3
"""Offline deterministic review exports. Pillow + local licensed Impact/Arial fonts.
No downloads, generative services, Meta calls or publication. Run validate.py after.
"""
from pathlib import Path
import hashlib, json, os, csv
import PIL
from typing import Any
from PIL import Image, ImageDraw, ImageFont
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
DISPLAY=Path(os.getenv('DISPLAY_FONT','/mnt/c/Windows/Fonts/impact.ttf'))
BODY=Path(os.getenv('BODY_FONT','/mnt/c/Windows/Fonts/arial.ttf'))
LOGO='site/assets/joao-crus-bjj-logo.png'
CREAM='#FFFDF8'; BLACK='#101010'; BLUE='#194FC3'; YELLOW='#F5C400'
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def font(size,display=False): return ImageFont.truetype(str(DISPLAY if display else BODY),size)
DS='https://joaocrusbjj.com/kids-first-class/'
AUS='https://joaocrusbjj.com/castle-hill-grand-opening/'
def concept(id,market,program,pattern,source,eyebrow,hook,detail,caption,body,headline,description,hypothesis,boundary,ids) -> dict[str, Any]:
 return dict(id=id,market=market,program=program,pattern=pattern,source=source,eyebrow=eyebrow,hook=hook,detail=detail,caption=caption,primary_text=body,headline=headline,description=description,cta='LEARN_MORE',art_cta='EXPLORE A FREE VISIT',destination=DS if market=='DS' else AUS,hypothesis=hypothesis,evidence_boundary=boundary,source_ad_ids=ids,permissions=['Exact copy approval by Diego/Joao','Current destination, offer and tracking QA','Separate upload and activation authorization']+(['Paid-media guardian releases for every identifiable minor'] if program=='Youth 8-12' else [])+(['Castle Hill venue/name/image permission for this new use'] if market=='AUS' else []))
CONCEPTS=[
 concept('DS_A_LOCAL','DS','Youth 8-12','A','site/assets/campaign-images/kids-training.webp','DRIPPING SPRINGS | YOUTH 8-12',['JIU-JITSU IN','DRIPPING SPRINGS'],['Youth BJJ for ages 8-12.'],['Real partner practice at Joao Crus BJJ.'],'Dripping Springs Youth BJJ, ages 8-12. Explore a free studio visit. Joao calls to discuss fit.','Youth BJJ in Dripping Springs','Explore a free studio visit','Location-first specificity may help nearby parents recognize a relevant program.','Partner practice only, not a visible tap, release or reset sequence.',['305919000079182','2283285645285480']),
 concept('DS_B_TOGETHER','DS','Youth 8-12','B','site/assets/campaign-images/kids-gathering.webp','DRIPPING SPRINGS | YOUTH 8-12',['MORE THAN','A SOLO ACTIVITY.'],['Explore Youth BJJ together.'],['A real Joao Crus BJJ group moment.'],'A shared activity in Dripping Springs. Explore Youth BJJ for ages 8-12 and a free studio visit. Joao calls to discuss fit.','An activity to share','Youth BJJ, ages 8-12','A real group moment may make the program easier to picture than an abstract benefit claim.','A gathering demonstrates people together, not instant friendship or guaranteed belonging.',['2283285645285480','663335501713298','470294208469143']),
 concept('DS_C_FIRST_VISIT','DS','Youth 8-12','C','site/assets/campaign-images/kids-gathering.webp','DRIPPING SPRINGS | YOUTH 8-12',['START WITH','A FREE VISIT.'],['1  Complete the finder.','2  Joao calls to discuss fit.'],['A real group moment, not a first-visit scene.'],'New to Youth BJJ? Explore a free studio visit in Dripping Springs for ages 8-12. Joao calls to discuss fit.','Start with a free studio visit','Explore Youth BJJ','A concrete free-visit invitation and callback explanation may reduce uncertainty about the first step.','This is a group moment, not evidence of a first class; the form does not reserve a place.',['740996063152127','1465295947228702','2789452561186206']),
 concept('AUS_A_LOCAL','AUS','Adults','A','site/assets/castle-hill-multisport-room-20260907.webp','AUSTIN | ADULT BJJ',['JIU-JITSU AT','CASTLE HILL FITNESS'],['1112 N Lamar Blvd, Austin.'],['Castle Hill facility. Illustrative space,','not a class or assigned-room photo.'],'Adult BJJ inside Castle Hill Fitness in Austin. Explore a free studio visit. Joao calls to discuss fit.','Adult BJJ at Castle Hill','Explore a free studio visit','Venue and street-level relevance may help Austin adults identify a practical local starting point.','Empty facility photo is illustrative, not proof of the assigned room or a class in progress.',['305919000079182','2283285645285480']),
 concept('AUS_B_TOGETHER','AUS','Youth 8-12','B','site/assets/castle-hill-youth-group-20260907.webp','AUSTIN | YOUTH 8-12',['A SHARED','STARTING POINT.'],['Youth BJJ at Castle Hill Fitness.'],['Joao partnership photo: a group moment,','not proof of a Castle Hill class.'],'Explore Youth BJJ, ages 8-12, at Castle Hill Fitness in Austin. Start with a free studio visit. Joao calls to discuss fit.','Explore Youth BJJ in Austin','A free visit to get started','Real group warmth may make the youth invitation more approachable without promising friendship.','Published Joao partnership photo shows group warmth; neither instant friendship nor Castle Hill class location is established.',['2283285645285480','663335501713298','470294208469143']),
 concept('AUS_C_FIRST_VISIT','AUS','Adults','C','site/assets/castle-hill-multisport-room-20260907.webp','AUSTIN | ADULT BJJ',['NEW TO JIU-JITSU?','START WITH A VISIT.'],['1  Complete the finder.','2  Joao calls to discuss fit.'],['Castle Hill facility. Illustrative space,','not a class or assigned-room photo.'],'New to adult BJJ? Explore a free studio visit at Castle Hill Fitness in Austin. Joao calls to discuss fit.','New to BJJ? Explore a free visit','Adult BJJ in Austin','Beginner-directed invitation plus an explicit next step may reduce first-visit uncertainty.','Facility only, not beginner coaching proof. No instant booking, readiness or fitness outcome promised.',['740996063152127','1465295947228702','2789452561186206'])]
def render(c,vertical):
 h=1920 if vertical else 1080; safe=[65,270,900,1510] if vertical else [48,48,1032,1032]
 l,t,r,b=safe; w=r-l
 bg=BLUE if c['pattern']=='B' else CREAM
 fg=CREAM if c['pattern']=='B' else BLACK
 im=Image.new('RGB',(1080,h),bg);d=ImageDraw.Draw(im);elements=[]
 d.rectangle((0,0,1079,18),fill=YELLOW if c['pattern']=='B' else BLUE)
 d.rectangle((0,h-19,1079,h-1),fill=YELLOW)
 def text(s,x,y,size,color=fg,display=False):
  f=font(size,display)
  # Compensate glyph overhang rather than weakening the safe-zone check.
  x+=max(0,-d.textbbox((0,0),s,font=f,anchor='lt')[0])
  box=list(d.textbbox((x,y),s,font=f,anchor='lt'));d.text((x,y),s,font=f,fill=color,anchor='lt');elements.append(dict(kind='text',text=s,bounds=box,size=size));return box[3]
 logo=Image.open(ROOT/LOGO).convert('RGBA');logo.thumbnail((74,74),Image.Resampling.LANCZOS);im.paste(logo,(l,t),logo);elements.append(dict(kind='logo',bounds=[l,t,l+74,t+74]))
 text('JOAO CRUS BJJ',l+94,t+2,31,display=True)
 text(c['eyebrow'],l+94,t+45,25)
 y=t+102
 # B gives visual evidence first; A puts place first; C puts invitation first.
 def photo(y,maxheight):
  source=Image.open(ROOT/c['source']).convert('RGB');source.thumbnail((w,maxheight),Image.Resampling.LANCZOS)
  x=l+(w-source.width)//2;im.paste(source,(x,y));elements.append(dict(kind='photo',bounds=[x,y,x+source.width,y+source.height]));return y+source.height
 def lines(strings,y,size,display=False,gap=12):
  for s in strings: y=text(s,l,y,size,display=display)+gap
  return y
 maxphoto=520 if vertical else (315 if len(c['caption'])==2 else 345)
 if c['pattern']=='B':
  y=photo(y,maxphoto)+18;y=lines(c['caption'],y,26,gap=7)+24
 size=76 if vertical else 82
 while max(d.textlength(s,font=font(size,True)) for s in c['hook'])>w: size-=1
 y=lines(c['hook'],y,size,True,12)+14
 if c['pattern']!='B':
  y=photo(y,maxphoto)+18;y=lines(c['caption'],y,26,gap=7)+18
 y=lines(c['detail'],y,34,gap=12)+18
 cta=[l,y,l+470,y+62];d.rectangle(cta,fill=YELLOW);text(c['art_cta'],l+18,y+15,31,BLACK,True)
 # CTA background is a container, not a separate collision candidate.
 elements.append(dict(kind='cta_container',bounds=cta,container=True))
 y+=82
 text('Free studio visit. Observe or participate.' if c['pattern']=='C' else 'Joao calls to discuss fit.',l,y,28)
 name=c['id']+('_9x16.png' if vertical else '_1x1.png');im.save(HERE/name,compress_level=9)
 return dict(path=name,concept_id=c['id'],dimensions=[1080,h],sha256=sha(HERE/name),bytes=(HERE/name).stat().st_size,safe_bounds=safe,elements=elements,photo_crop='none; complete source aspect ratio retained')
def sheets(assets):
 out=[]
 for vertical in (False,True):
  tilew=540;tileh=1110 if vertical else 670
  im=Image.new('RGB',(1660,tileh*2+100),CREAM);d=ImageDraw.Draw(im)
  d.text((25,20),'JOAO / ORIGINAL PATTERN STUDIES / REVIEW ONLY',font=font(30,True),fill=BLACK)
  d.text((25,60),'DS top row / Austin bottom row / A: local / B: together / C: first visit',font=font(22),fill=BLACK)
  selected=[a for a in assets if a['dimensions'][1]==(1920 if vertical else 1080)]
  for i,a in enumerate(selected):
   x=20+(i%3)*550;y=110+(i//3)*tileh
   d.text((x,y),a['concept_id'],font=font(25,True),fill=BLACK)
   pic=Image.open(HERE/a['path']);pic.thumbnail((520,960),Image.Resampling.LANCZOS);im.paste(pic,(x,y+40))
   d.text((x,y+pic.height+52),'RELEASES / COPY / DESTINATION GATED',font=font(18),fill=BLACK)
  name='contact-sheet-'+('9x16' if vertical else '1x1')+'.jpg';im.save(HERE/name,quality=94,subsampling=0);out.append(dict(path=name,sha256=sha(HERE/name),upload=False))
 return out
def main():
 assets=[render(c,v) for c in CONCEPTS for v in (False,True)]
 sources=sorted({LOGO,*[c['source'] for c in CONCEPTS]})
 manifest=dict(status='LOCAL REVIEW ONLY; NOT UPLOAD READY',concepts=CONCEPTS,assets=assets,source_assets=[dict(path=p,sha256=sha(ROOT/p),dimensions=list(Image.open(ROOT/p).size)) for p in sources],fonts=[dict(path=str(p),sha256=sha(p)) for p in (DISPLAY,BODY)],pillow_version=PIL.__version__,safe_zone_policy='Local conservative bounds only. Vertical reserves 270 top, 410 bottom, 180 right. Native Feed/Stories/Reels previews still required.',copy_recommendations=dict(primary_text=125,headline=40,description=30),contact_sheets=sheets(assets))
 (HERE/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
 with (HERE/'comparison-sheet.csv').open('w',newline='') as f:
  fields=['id','market','program','pattern','headline','primary_text','description','hypothesis','evidence_boundary','destination','square','vertical','clarity_1_5','local_1_5','proof_1_5','mobile_1_5','safety_1_5','landing_match_1_5','distinctness_1_5','revision']
  writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader()
  for c in CONCEPTS: writer.writerow({**{k:c[k] for k in fields if k in c},'square':c['id']+'_1x1.png','vertical':c['id']+'_9x16.png'})
 print(json.dumps(dict(concepts=len(CONCEPTS),assets=len(assets),sheets=len(manifest['contact_sheets']))))
if __name__=='__main__': main()
