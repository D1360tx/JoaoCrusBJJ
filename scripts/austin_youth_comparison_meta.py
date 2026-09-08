"""Explicitly scoped paused-only comparison mutations with durable redacted response journals.
Default: read-only preflight. --apply-static swaps AY07 in place and creates AY09B.
--apply-video uploads the two verified renders and creates AY09A. --verify reads all targets.
Never writes campaign, ad set, budget, targeting, destination or activation.
"""
from pathlib import Path
import argparse, copy, datetime, json, subprocess, time, re
import requests
from build_austin_youth_comparisons import ROOT,PACK,sha,write
C='120251246135250072'; S='120251246144560072'; ACCOUNT='act_456685748412595'; AY07='120251261010900072'; ORIGINAL='120251261045730072'
AD_FIELDS='id,name,account_id,adset_id,campaign_id,status,effective_status,creative,tracking_specs,issues_info'
CR_FIELDS='id,name,object_story_spec,asset_feed_spec,degrees_of_freedom_spec,url_tags'
A_PATH=PACK/'meta-audit.json'
PRIVATE=Path('/home/d1360/.cache/joao-ay-comparisons'); PRIVATE.mkdir(parents=True,exist_ok=True,mode=0o700)
A=json.loads(A_PATH.read_text()) if A_PATH.exists() else {'records':{},'responses':[]}
COPIES=json.loads((PACK/'approved-copy.json').read_text())
M=json.loads((PACK/'manifest.json').read_text())
def save(): write(A_PATH,A)
def redact(v):
 if isinstance(v,dict): return {k:('[REDACTED signed media URL]' if k in {'uri','url','thumbnail_url','picture','source'} and isinstance(x,str) and x.startswith('http') else redact(x)) for k,x in v.items()}
 if isinstance(v,list): return [redact(x) for x in v]
 if isinstance(v,str) and ('access_token=' in v or 'fbcdn.net' in v or 'fbsbx.com' in v): return '[REDACTED signed media URL]'
 return v

def persist(tool,args,value):
 stamp=datetime.datetime.now(datetime.timezone.utc).isoformat(); p=PRIVATE/(stamp.replace(':','')+'-'+tool+'.json'); write(p,value); p.chmod(0o600)
 A['responses'].append({'at_utc':stamp,'operation':tool,'args':redact(args),'response':redact(value)}); save()
 assert 'error' not in value,redact(value)
 return value

def call(tool,args):
 assert tool in {'get_campaign','get_adset','get_ad','get_creative','upload_image','create_creative','create_ad','update_ad'}
 if tool=='update_ad':
  allowed={AY07:'AY07_BEGINNER-BELONGING_STATIC','120251263139970072':'AY09A_BEGINNERS-WELCOME_LONG-VIDEO','120251263002380072':'AY09B_BEGINNERS-WELCOME_STATIC'}
  assert args['ad_id'] in allowed and args['name']==allowed[args['ad_id']] and args['status']=='PAUSED' and set(args)=={'ad_id','creative_id','status','name'}
 if tool=='create_ad': assert args['adset_id']==S and args['status']=='PAUSED'
 result=subprocess.run(['npx','--yes','mcporter','call','--stdio','/home/d1360/.hermes/mcp/meta-ads-mcp/run-hermes.sh',tool,'--args',json.dumps(args),'--output','json'],capture_output=True,text=True,check=True,timeout=120)
 return persist(tool,args,json.loads(result.stdout))

def graph(path,fields=None,upload=None):
 # Existing scoped connector credentials are read in memory only and never logged.
 env=dict(line.split('=',1) for line in (Path.home()/'.hermes/.env').read_text().splitlines() if '=' in line and not line.startswith('#'))
 version=env['META_GRAPH_VERSION']; token=env['META_ADS_SYSTEM_USER_TOKEN']; base=f'https://graph.facebook.com/{version}/{path}'
 headers={'Authorization':'Bearer '+token}
 if upload:
  assert path==ACCOUNT+'/advideos'
  with upload.open('rb') as f: r=requests.post(base,headers=headers,data={'title':upload.stem},files={'source':(upload.name,f,'video/mp4')},timeout=180)
 else:
  assert re.fullmatch(r'\d+(/thumbnails)?',path)
  r=requests.get(base,headers=headers,params={'fields':fields} if fields else {},timeout=90)
 value=r.json(); persist('graph_upload_video' if upload else 'graph_read_video',{'path':path,'fields':fields,'upload_sha256':sha(upload) if upload else None},value)
 r.raise_for_status(); return value

def parents():
 p={'campaign':call('get_campaign',{'campaign_id':C}),'adset':call('get_adset',{'adset_id':S,'fields':'id,name,campaign_id,status,effective_status,targeting,destination_type,promoted_object,optimization_goal,daily_budget,lifetime_budget'})}
 for v in p.values(): assert v['status']==v['effective_status']=='PAUSED'
 assert p['campaign']['objective']=='OUTCOME_LEADS'
 assert p['adset']['destination_type']=='WEBSITE'
 assert p['adset']['promoted_object']=={'pixel_id':'592714768141415','custom_event_type':'LEAD','smart_pse_enabled':False}
 return p

def preflight():
 p=parents()
 if 'before' not in A:
  A['before']=p
  A['original_ad_before']=call('get_ad',{'ad_id':ORIGINAL,'fields':AD_FIELDS})
  A['ay07_before']=call('get_ad',{'ad_id':AY07,'fields':AD_FIELDS})
  assert A['ay07_before']['status']==A['ay07_before']['effective_status']=='PAUSED'
  A['original_creative']=call('get_creative',{'creative_id':'1107882611663240','fields':CR_FIELDS})
  A['original_creative']=redact(A['original_creative']); save()
 else: unchanged(p)
 assert A['original_ad_before']['status']==A['original_ad_before']['effective_status']=='PAUSED'
 for key,field in [('primary_text','bodies'),('headline','titles'),('description','descriptions')]:
  assert A['original_creative']['asset_feed_spec'][field][0]['text']==COPIES[1][key]
 assert A['original_creative']['asset_feed_spec']['link_urls'][0]['website_url'].replace('utm_content=AY09_BEGINNERS-WELCOME_VIDEO','utm_content={{ad.name}}')==COPIES[1]['destination_url']
 return p

def unchanged(p):
 for k in ['id','status','effective_status','objective','daily_budget','lifetime_budget','bid_strategy']: assert p['campaign'].get(k)==A['before']['campaign'].get(k),(k,'campaign changed')
 assert p['adset']==A['before']['adset'],'Ad set fields changed'

def features(): return copy.deepcopy(A['original_creative']['degrees_of_freedom_spec'])

def validate_creative(c,x,r):
 assert c['object_story_spec']=={'page_id':'977808342257807','instagram_user_id':'17841402345785819'}
 fs=c['degrees_of_freedom_spec']['creative_features_spec']; expected=features()['creative_features_spec']
 assert set(fs)==set(expected) and all(v['enroll_status']=='OPT_OUT' for v in fs.values())
 f=c['asset_feed_spec']; assert f['optimization_type']=='PLACEMENT' and f['call_to_action_types']==['LEARN_MORE']
 for field,key in [('bodies','primary_text'),('titles','headline'),('descriptions','description')]: assert f[field]==[{'text':x[key]}]
 assert f['link_urls']==[{'website_url':x['destination_url']}]
 assert not re.search(r'lead_gen_form_id|instant_form_id|form_id',json.dumps(c))
 video='LONG-VIDEO' in x['ad_name']; kind='video' if video else 'image'; media='videos' if video else 'images'
 assert f['ad_formats']==['SINGLE_VIDEO' if video else 'SINGLE_IMAGE'] and len(f[media])==2
 routing={z['adlabels'][0]['name']:z['video_id' if video else 'hash'] for z in f[media]}
 assert routing==r.get('creative_media',r['media'])
 if video and routing!=r['media']:
  assert set(r.get('video_copy_equivalence',{}))=={'vertical','feed'}
  for label,vid in routing.items():
   proof=r['video_copy_equivalence'][label]
   assert proof['creative_video_id']==vid and proof['upload_id']==r['media'][label] and proof['thumbnail_mean_absolute_difference_0_255']<3
 rules=f['asset_customization_rules']; assert len(rules)==2
 assert rules[0]['priority']==1 and rules[0][kind+'_label']['name']=='vertical'
 assert rules[0]['customization_spec']['publisher_platforms']==['facebook','instagram']
 assert rules[0]['customization_spec']['facebook_positions']==['story','facebook_reels']
 assert rules[0]['customization_spec']['instagram_positions']==['story','reels']
 assert rules[1]['priority']==2 and rules[1][kind+'_label']['name']=='feed'
 assert set(rules[1]['customization_spec']) <= {'age_min','age_max'}

def create(x,video=False):
 name=x['ad_name']; r=A['records'].setdefault(name,{'media':{}}); save()
 assets=[z for z in M['videos' if video else 'assets'] if z['ad_name']==name]
 assert len(assets)==2
 thumbs={}
 for asset in assets:
  label='vertical' if asset['ratio']=='9x16' else 'feed'; path=ROOT/asset['path']; assert sha(path)==asset['sha256']
  if label not in r['media']:
   value=graph(ACCOUNT+'/advideos',upload=path) if video else call('upload_image',{'account_id':ACCOUNT,'image_path':str(path)})
   r['media'][label]=value['id' if video else 'hash']; save()
  if video:
   state={}
   for n in range(8):
    state=graph(r['media'][label],fields='id,status,length'); r.setdefault('upload_readbacks',{})[label]=state; save()
    if state['status']['video_status']=='ready': break
    if n<7: time.sleep(20)
   assert state['status']['video_status']=='ready'
   th=graph(r['media'][label]+'/thumbnails',fields='uri,is_preferred'); thumbs[label]=next((z['uri'] for z in th['data'] if z.get('is_preferred')),th['data'][0]['uri'])
 if not r.get('creative_id'):
  kind='video' if video else 'image'
  f={'bodies':[{'text':x['primary_text']}],'titles':[{'text':x['headline']}],'descriptions':[{'text':x['description']}],'link_urls':[{'website_url':x['destination_url']}],'call_to_action_types':['LEARN_MORE'],'ad_formats':['SINGLE_VIDEO' if video else 'SINGLE_IMAGE'],'optimization_type':'PLACEMENT','asset_customization_rules':[{'customization_spec':{'publisher_platforms':['facebook','instagram'],'facebook_positions':['story','facebook_reels'],'instagram_positions':['story','reels']},kind+'_label':{'name':'vertical'},'priority':1},{'customization_spec':{},kind+'_label':{'name':'feed'},'priority':2}]}
  f['videos' if video else 'images']=[({'video_id':v,'thumbnail_url':thumbs[label]} if video else {'hash':v})|{'adlabels':[{'name':label}]} for label,v in r['media'].items()]
  value=call('create_creative',{'account_id':ACCOUNT,'name':name+' | PLACEMENT PAIR | PAID MEDIA HOLD','object_story_spec':{'page_id':'977808342257807','instagram_user_id':'17841402345785819'},'asset_feed_spec':f,'degrees_of_freedom_spec':features()}); r['creative_id']=value['id']; save()
 c=call('get_creative',{'creative_id':r['creative_id'],'fields':CR_FIELDS}); r['creative_readback']=redact(c); save(); validate_creative(c,x,r)
 if not r.get('ad_id'):
  if name.startswith('AY07_'):
   value=call('update_ad',{'ad_id':AY07,'creative_id':r['creative_id'],'status':'PAUSED','name':name}); r['ad_id']=AY07
  else:
   value=call('create_ad',{'account_id':ACCOUNT,'adset_id':S,'creative_id':r['creative_id'],'status':'PAUSED','name':name}); r['ad_id']=value['id']
  save()
 verify_ad(r,x,8)

def verify_ad(r,x,attempts):
 assert 1 <= attempts <= 8
 ad={}
 for n in range(attempts):
  ad=call('get_ad',{'ad_id':r['ad_id'],'fields':AD_FIELDS}); r['ad_readback']=ad; save()
  assert ad['status']=='PAUSED' and ad['adset_id']==S and ad['campaign_id']==C and ad['creative']['id']==r['creative_id'] and ad['name']==x['ad_name']
  assert any('592714768141415' in z.get('fb_pixel',[]) for z in ad['tracking_specs'])
  if ad['effective_status']=='PAUSED': break
  if n<attempts-1: time.sleep(30)
 assert ad['effective_status']=='PAUSED',f"Processing remains: {ad['id']} {ad['effective_status']}"
 print(x['ad_name'],ad['id'],r['creative_id'],'PAUSED / PAUSED',flush=True)

def verify():
 for x in COPIES:
  if x['ad_name'] not in A['records']: continue
  r=A['records'][x['ad_name']]; c=call('get_creative',{'creative_id':r['creative_id'],'fields':CR_FIELDS}); r['creative_readback']=redact(c); save(); validate_creative(c,x,r); verify_ad(r,x,8)
 original=call('get_ad',{'ad_id':ORIGINAL,'fields':AD_FIELDS}); A['original_ad_after']=original; save()
 assert original==A['original_ad_before'],'Original AY09 changed'
 p=parents(); A['after']=p; save(); unchanged(p)
 A['verified_at_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat(); A['all_three_verified']=len(A['records'])==3; save()
 print('Parents unchanged; original AY09 unchanged; comparison count:',len(A['records']))
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__); parser.add_argument('--apply-static',action='store_true'); parser.add_argument('--apply-video',action='store_true'); parser.add_argument('--verify',action='store_true'); args=parser.parse_args()
 preflight()
 if args.apply_static:
  for x in [COPIES[0],COPIES[2]]: create(x)
 if args.apply_video: create(COPIES[1],True)
 if args.verify or args.apply_static or args.apply_video: verify()
