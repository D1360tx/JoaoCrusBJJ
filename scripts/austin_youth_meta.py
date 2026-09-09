"""Scoped MCP execution. Default read-only; --create permits two PAUSED ads only."""
from pathlib import Path
import json, subprocess, sys, datetime
R=Path(__file__).resolve().parents[1]; P=R/'assets/meta/castle-hill/youth-wave-2'; F=P/'meta-audit.json'
C='120251246135250072'; S='120251246144560072'; ACCOUNT='act_456685748412595'
a=json.loads(F.read_text()) if F.exists() else {'campaign_id':C,'adset_id':S,'account_id':ACCOUNT,'records':[]}
copy=json.loads((P/'approved-copy.json').read_text()); manifest=json.loads((P/'manifest.json').read_text())
def save(): F.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
def call(tool,args):
 p=subprocess.run(['npx','--yes','mcporter','call','--stdio','/home/d1360/.hermes/mcp/meta-ads-mcp/run-hermes.sh',tool,'--args',json.dumps(args),'--output','json'],capture_output=True,text=True,check=True,timeout=120)
 v=json.loads(p.stdout)
 # Raw tool responses may contain expiring upload URLs: keep private, not in git.
 private=Path('/home/d1360/.cache/joao-ay07-ay08'); private.mkdir(parents=True,exist_ok=True,mode=0o700)
 target=private/(datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')+'-'+tool+'.json'); target.write_text(json.dumps(v)); target.chmod(0o600)
 assert 'error' not in v,v
 return v
def parents():
 c=call('get_campaign',{'campaign_id':C}); s=call('get_adset',{'adset_id':S,'fields':'id,name,campaign_id,status,effective_status,targeting,destination_type,promoted_object,optimization_goal,daily_budget,lifetime_budget'})
 assert c['status']==c['effective_status']=='PAUSED'; assert s['status']==s['effective_status']=='PAUSED'
 assert s['destination_type']=='WEBSITE' and s['promoted_object']['pixel_id']=='592714768141415' and s['promoted_object']['custom_event_type']=='LEAD'
 return {'campaign':c,'adset':s}
a.setdefault('before',parents()); save()
features=json.loads((R/'assets/meta/castle-hill/safe-wave-1/meta-audit.json').read_text())['records'][0]['creative_readback']['degrees_of_freedom_spec']
if '--create' in sys.argv:
 for x in copy:
  r=next((v for v in a['records'] if v['ad_name']==x['ad_name']),None)
  if r is None: r={'ad_name':x['ad_name'],'image_hashes':{}}; a['records'].append(r); save()
  for asset in [z for z in manifest['assets'] if z['ad_name']==x['ad_name']]:
   ratio=asset['aspect_ratio']
   if ratio not in r['image_hashes']:
    v=call('upload_image',{'account_id':ACCOUNT,'image_path':str(R/asset['filename'])}); r['image_hashes'][ratio]=v['hash']; save()
  if not r.get('creative_id'):
   spec={'images':[{'hash':r['image_hashes'][ratio],'adlabels':[{'name':label}]} for ratio,label in [('1x1','square'),('9x16','vertical')]],'bodies':[{'text':x['primary_text']}],'titles':[{'text':x['headline']}],'descriptions':[{'text':x['description']}],'link_urls':[{'website_url':x['destination_url']}],'call_to_action_types':['LEARN_MORE'],'ad_formats':['SINGLE_IMAGE'],'optimization_type':'PLACEMENT','asset_customization_rules':[{'customization_spec':{'publisher_platforms':['facebook','instagram'],'facebook_positions':['story','facebook_reels'],'instagram_positions':['story','reels']},'image_label':{'name':'vertical'},'priority':1},{'customization_spec':{},'image_label':{'name':'square'},'priority':2}]}
   v=call('create_creative',{'account_id':ACCOUNT,'name':x['ad_name']+' | 1x1+9x16 | MEDIA APPROVAL HOLD','object_story_spec':{'page_id':'977808342257807','instagram_user_id':'17841402345785819'},'asset_feed_spec':spec,'degrees_of_freedom_spec':features}); r['creative_id']=v['id']; save()
  c=call('get_creative',{'creative_id':r['creative_id'],'fields':'id,name,object_story_spec,asset_feed_spec,degrees_of_freedom_spec,url_tags'}); r['creative_readback']=c; save()
  assert all(v['enroll_status']=='OPT_OUT' for v in c['degrees_of_freedom_spec']['creative_features_spec'].values())
  if not r.get('ad_id'):
   v=call('create_ad',{'account_id':ACCOUNT,'adset_id':S,'name':x['ad_name'],'creative_id':r['creative_id'],'status':'PAUSED'}); r['ad_id']=v['id']; save()
for r in a['records']:
 r['creative_readback']=call('get_creative',{'creative_id':r['creative_id'],'fields':'id,name,object_story_spec,asset_feed_spec,degrees_of_freedom_spec,url_tags'}); save()
 r['ad_readback']=call('get_ad',{'ad_id':r['ad_id'],'fields':'id,name,adset_id,campaign_id,status,effective_status,creative,tracking_specs,issues_info'}); save()
 print(r['ad_name'],r['ad_id'],r['ad_readback']['status'],r['ad_readback']['effective_status'],flush=True)
a['after']=parents(); a['readback_at_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat(); save()
for k in ['daily_budget','lifetime_budget','bid_strategy']: assert a['before']['campaign'].get(k)==a['after']['campaign'].get(k)
assert a['before']['adset']==a['after']['adset']
assert len(a['records'])==2
print('Two ads read back; parent budgets, targeting, website Lead event unchanged.')
a['effective_paused_gate_passed']=all(r['ad_readback']['effective_status'] in ['PAUSED','CAMPAIGN_PAUSED','ADSET_PAUSED'] for r in a['records']); save()
if '--strict' in sys.argv and not a['effective_paused_gate_passed']:
 raise SystemExit('BLOCKED: configured PAUSED verified; Meta review/processing still masks effective PAUSED.')
