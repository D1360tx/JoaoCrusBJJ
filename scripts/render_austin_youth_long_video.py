"""Render a continuous completed Joao thought; no freezes, synthetic speech or empty outro."""
from build_austin_youth_comparisons import ROOT, PACK, SOURCE, run, probe, sha, write
from PIL import Image,ImageDraw,ImageFont
import json, textwrap
START=28.04
END=54.88
# Source-audio word timestamps from local Whisper small.en; clause breaks retain exact speech.
CAPTIONS=[(28.18,30.50,'We welcome complete beginners,'),(31.06,33.65,'so you do not need to be in shape,'),(33.86,35.50,'know anything about jiu-jitsu,'),(35.54,37.65,'or feel ready before you visit.'),(38.14,40.60,'I would love to meet you at the academy,'),(40.70,41.85,'show you around,'),(42.04,44.55,'explain how our programs work,'),(44.74,46.20,'and let you see a class.'),(46.58,48.55,'There is no pressure and no obligation.'),(48.92,50.60,'Just come in, meet us,'),(50.68,52.45,'and see whether it feels like'),(52.45,54.88,'the right place for you or your child.')]
def stamp(t):
 cs=round(t*100); return f'{cs//360000}:{cs//6000%60:02d}:{cs//100%60:02d}.{cs%100:02d}'
def render():
 transcript={'source_in':START,'source_out':END,'duration':round(END-START,2),'method':'Local Whisper small.en word timestamps, cross-checked against source VTT; capitalization/punctuation normalized only. Final rendered audio independently retranscribed.','original_defect':'Original source-out 39.00 interrupts I would love to meet you at the academy after meet. Original captions paraphrased audio and omitted this partial sentence.','ending':'Just come in, meet us, and see whether it feels like the right place for you or your child.','next_sentence_starts':55.18,'captions':[{'source_start':s,'source_end':e,'start':round(s-START,2),'end':round(e-START,2),'text':t} for s,e,t in CAPTIONS]}
 write(PACK/'caption-timing.json',transcript)
 manifest=json.loads((PACK/'manifest.json').read_text()); manifest['video_edit']=transcript; manifest['videos']=[]
 for ratio,h in [('9x16',1280),('4x5',900)]:
  tall=h==1280; top=165 if tall else 38; width=540 if tall else 430; ph=750 if tall else 598; py=260 if tall else 165; cap_y=950 if tall else 708; footer=1035 if tall else 805
  # ASS fixed positioning makes every title, caption and footer independently reproducible.
  ass='[Script Info]\nScriptType: v4.00+\nPlayResX: 720\nPlayResY: '+str(h)+'\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Main,DejaVu Sans,28,&H00F8FDFF,&H00F8FDFF,&H00101010,&H00101010,-1,0,0,0,100,100,0,0,3,2,0,5,48,48,0,1\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n'
  def event(s,e,t,y,size=28,color='&HF8FDFF&'):
   return f'Dialogue: 0,{stamp(s)},{stamp(e)},Main,,0,0,0,,{{\\pos(360,{y})\\fs{size}\\c{color}}}{t}\n'
  ass+=event(0,END-START,'COMPLETE BEGINNERS',top,32)
  ass+=event(0,END-START,'ARE WELCOME.',top+42,36,'&H00C4F5&')
  ass+=event(0,END-START,'ADULTS + YOUTH AGES 8–12 · CASTLE HILL FITNESS',footer,18)
  for s,e,t in CAPTIONS: ass+=event(s-START,e-START,'\\N'.join(textwrap.wrap(t,34)),cap_y)
  ap=PACK/f'AY09A-captions-{ratio}-adults-youth.ass'; ap.write_text(ass)
  out=PACK/f'AY09A_BEGINNERS-WELCOME_LONG-VIDEO_{ratio}-adults-youth.mp4'
  vf=f'crop=720:1000:0:100,scale={width}:{ph},pad=720:{h}:(ow-iw)/2:{py}:color=0x101010,setsar=1,ass={ap}'
  run(['ffmpeg','-v','error','-y','-ss',str(START),'-i',str(SOURCE),'-t',str(round(END-START,2)),'-vf',vf,'-c:v','libx264','-preset','medium','-crf','20','-threads','4','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','160k','-af','afade=t=out:st=26.76:d=0.08','-movflags','+faststart',str(out)])
  frames=[]
  for i,t in enumerate([0.35,8.4,14.4,21.6,26.5]):
   p=PACK/f'AY09A-{ratio}-adults-youth-frame-{i}.jpg'; run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(out),'-frames:v','1',str(p)]); frames.append(p)
  sheet=Image.new('RGB',(360*5,h//2))
  for i,p in enumerate(frames): sheet.paste(Image.open(p).resize((360,h//2)),(i*360,0))
  sheet.save(PACK/f'AY09A-contact-sheet-{ratio}-adults-youth.jpg',quality=94)
  manifest['videos'].append({'ad_name':'AY09A_BEGINNERS-WELCOME_LONG-VIDEO','ratio':ratio,'path':str(out.relative_to(ROOT)),'sha256':sha(out),'ffprobe':probe(out),'caption_file':str(ap.relative_to(ROOT)),'caption_sha256':sha(ap),'thumbnail_path':str(frames[0].relative_to(ROOT)),'caption_center_y':cap_y,'footer_bottom':footer+40,'safe_zone':[40,145 if tall else 20,680,1080 if tall else 865]})
 write(PACK/'manifest.json',manifest)
 print('Rendered both continuous 26.84-second placement cuts, complete thought and five-frame sheets.')
if __name__=='__main__': render()
