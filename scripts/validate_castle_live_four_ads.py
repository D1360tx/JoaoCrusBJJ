"""Current live four-ad acceptance; historical snapshots remain immutable."""
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit, parse_qsl
E=Path(__file__).resolve().parents[1]/'assets/meta/castle-hill/youth-wave-2/comparisons/reconciliation-2026-09-08'
URL='https://joaocrusbjj.com/castle-hill-grand-opening/'
TAGS='utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}'
EXPECTED={'120251261010900072':'1387970049521888','120251261015960072':'1051476211136471','120251263139970072':'1571675311324124','120251263002380072':'1567708678432946'}
def canonical(v: Any) -> Any:
 if isinstance(v,dict):return {k:canonical(x) for k,x in v.items()}
 if isinstance(v,list):return sorted([canonical(x) for x in v],key=lambda x:json.dumps(x,sort_keys=True))
 return v
def tracking(a):return canonical([{k:v for k,v in t.items() if k!='post'} for t in a['tracking_specs']])
def validate(e):
 b=e['before'];f=e['final'];assert b['campaign']==f['campaign'] and b['adset']==f['adset']
 for p in ['campaign','adset']:assert f[p]['status']==f[p]['effective_status']=='ACTIVE'
 assert f['campaign']['id']=='120251246135250072' and f['campaign']['daily_budget']=='1000'
 assert f['adset']['id']=='120251246144560072' and f['adset']['destination_type']=='WEBSITE'
 ads=f['ads'];assert len(ads)==len({a['id'] for a in ads})==11
 for a in ads:
  old=next(x for x in b['ads'] if x['id']==a['id'])
  assert not a.get('issues_info')
  if a['id'] not in EXPECTED:
   assert a==old and a['status']==a['effective_status']=='PAUSED';continue
  assert a['status']==a['effective_status']=='ACTIVE' and a['creative']['id']==EXPECTED[a['id']]
  assert a['name']==old['name'] and tracking(a)==tracking(old)
  assert a['campaign_id']==f['campaign']['id'] and a['adset_id']==f['adset']['id']
  c=f['creatives'][a['creative']['id']];prior=b['creatives'][old['creative']['id']]
  assert c['url_tags']==TAGS
  occurrences=[]
  def walk(v):
   if isinstance(v,dict):
    for k,x in v.items():
     assert 'form_id' not in k
     if k=='website_url':assert x==URL and not urlsplit(x).query
     if k=='url_tags':assert x==TAGS;occurrences.extend(parse_qsl(x))
     walk(x)
   elif isinstance(v,list):
    for x in v:walk(x)
   elif isinstance(v,str):
    assert 'fbclid' not in v.lower()
    if v.startswith('http') and '?' in v:assert not any(k.startswith('utm_') for k,_ in parse_qsl(urlsplit(v).query))
  walk(c);assert occurrences==parse_qsl(TAGS) and len({k for k,_ in occurrences})==6
  for k,_ in occurrences:assert json.dumps(c).count(k)==1
  aa=canonical(prior['asset_feed_spec']);bb=canonical(c['asset_feed_spec'])
  assert len(aa['link_urls'])==len(bb['link_urls'])==1
  aa['link_urls'][0]['website_url']=URL;assert aa==bb
  assert prior['object_story_spec']==c['object_story_spec']
  pf=prior['degrees_of_freedom_spec']['creative_features_spec'];cf=c['degrees_of_freedom_spec']['creative_features_spec']
  assert all(cf.get(k)==v for k,v in pf.items()) and all(v=={'enroll_status':'OPT_OUT'} for v in cf.values())
 assert sum(a['status']=='ACTIVE' for a in ads)==4
 return True
if __name__=='__main__':
 validate(json.loads((E/'live-four-ad-normalization.json').read_text()))
 print('PASS: exact four ACTIVE/ACTIVE; seven unchanged PAUSED/PAUSED; parents ACTIVE/ACTIVE; $10/day unchanged; six unique dedicated UTMs; media/copy/routing/identity/tracking preserved.')
