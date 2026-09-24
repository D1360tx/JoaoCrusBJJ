#!/usr/bin/env python3
"""Independent on-disk acceptance checks; no network."""
import json, hashlib
from pathlib import Path
from itertools import combinations
from collections import Counter
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def inside(a,b):return a[0]>=b[0] and a[1]>=b[1] and a[2]<=b[2] and a[3]<=b[3]
def overlap(a,b):return max(a[0],b[0])<min(a[2],b[2]) and max(a[1],b[1])<min(a[3],b[3])
def main():
 m=json.loads((HERE/'manifest.json').read_text());checks=[]
 def check(ok,label):
  checks.append(dict(check=label,pass_=bool(ok)))
 check(len(m['concepts'])==6 and len(m['assets'])==12,'6 concepts / 12 exports')
 check(Counter(c['market'] for c in m['concepts'])=={'DS':3,'AUS':3},'3 concepts per market')
 check(len({a['sha256'] for a in m['assets']})==12,'12 unique outputs')
 check({p.name for p in HERE.glob('*.png')}=={a['path'] for a in m['assets']},'No missing or extra ad PNGs')
 allowed={'site/assets/joao-crus-bjj-logo.png','site/assets/campaign-images/kids-training.webp','site/assets/campaign-images/kids-gathering.webp','site/assets/castle-hill-youth-group-20260907.webp','site/assets/castle-hill-multisport-room-20260907.webp'}
 check({s['path'] for s in m['source_assets']}==allowed,'Exact local source allowlist')
 for s in m['source_assets']:
  check(sha(ROOT/s['path'])==s['sha256'],'Source hash '+s['path'])
 for s in m['fonts']:check(sha(Path(s['path']))==s['sha256'],'Font hash '+s['path'])
 counts={}
 for c in m['concepts']:
  counts[c['id']]={k:len(c[k]) for k in m['copy_recommendations']}
  check(all(len(c[k])<=n for k,n in m['copy_recommendations'].items()),'Copy recommendations '+c['id'])
  public=[c[k] for k in ('primary_text','headline','description','art_cta','eyebrow')]+c['hook']+c['detail']+c['caption']
  check(all('\u2014' not in s for s in public),'No public em dash '+c['id'])
  check(c['cta']=='LEARN_MORE' and c['destination']==('https://joaocrusbjj.com/kids-first-class/' if c['market']=='DS' else 'https://joaocrusbjj.com/castle-hill-grand-opening/'),'CTA and destination '+c['id'])
  check(len([a for a in m['assets'] if a['concept_id']==c['id']])==2,'Placement pair '+c['id'])
 for a in m['assets']:
  p=HERE/a['path'];im=Image.open(p);im.load()
  check(list(im.size)==a['dimensions'] and im.size in ((1080,1080),(1080,1920)) and im.mode=='RGB','Dimensions RGB '+p.name)
  check(sha(p)==a['sha256'] and p.stat().st_size<30_000_000,'Output hash / under 30 MB '+p.name)
  check(all(inside(e['bounds'],a['safe_bounds']) for e in a['elements']),'Safe bounds / no clipping '+p.name)
  es=[e for e in a['elements'] if not e.get('container')]
  check(not any(overlap(x['bounds'],y['bounds']) for x,y in combinations(es,2)),'No text/photo/logo overlap '+p.name)
  check(min(e['size'] for e in es if e['kind']=='text')>=25,'Minimum text 25px '+p.name)
 for s in m['contact_sheets']:check(sha(HERE/s['path'])==s['sha256'],'Contact sheet hash '+s['path'])
 result=dict(status='PASS' if all(c['pass_'] for c in checks) else 'FAIL',checks_count=len(checks),checks=checks,character_counts=counts,limitations=['Local geometry and source checks are not native Meta preview approval.','Copy, releases, venue, current destination/attribution and upload/activation remain gated.'])
 (HERE/'validation.json').write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps({k:v for k,v in result.items() if k!='checks'}))
 for c in checks:
  if not c['pass_']:print('FAIL',c['check'])
 raise SystemExit(0 if result['status']=='PASS' else 1)
if __name__=='__main__':main()
