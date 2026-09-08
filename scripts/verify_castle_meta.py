"""Read-only live Meta audit using existing MCP server. Never mutates Meta."""
from pathlib import Path
import json, subprocess, datetime
R=Path(__file__).resolve().parents[1]; P=R/'assets/meta/castle-hill/safe-wave-1'; FILE=P/'meta-audit.json'
a=json.loads(FILE.read_text()); approved={x['ad_name']:x for x in json.loads((P/'approved-copy.json').read_text())}
def call(tool,args):
    p=subprocess.run(['npx','--yes','mcporter','call','--stdio','/home/d1360/.hermes/mcp/meta-ads-mcp/run-hermes.sh',tool,'--args',json.dumps(args),'--output','json'],capture_output=True,text=True,timeout=120,check=True)
    result=json.loads(p.stdout); assert 'error' not in result,result
    return result
def save(): FILE.write_text(json.dumps(a,indent=2,ensure_ascii=False)+'\n')
for r in a['records']:
    c=call('get_creative',{'creative_id':r['creative_id'],'fields':'id,name,object_story_spec,asset_feed_spec,degrees_of_freedom_spec,object_type,url_tags'})
    r['creative_readback']=c; save()
    assert c['id']==r['creative_id']
    assert c['object_story_spec']=={'page_id':'977808342257807','instagram_user_id':'17841402345785819'}
    s=c['asset_feed_spec']; x=approved[r['ad_name']]
    for k,ck in [('bodies','primary_text'),('titles','headline'),('descriptions','description')]: assert s[k]==[{'text':x[ck]}]
    assert s['link_urls']==[{'website_url':x['destination_url']}]
    assert s['call_to_action_types']==['LEARN_MORE'] and s['ad_formats']==['SINGLE_IMAGE'] and s['optimization_type']=='PLACEMENT'
    assert not s['additional_data']['is_click_to_message']
    assert len(s['images'])==2
    expected={'square':r['image_hashes']['1x1'],'vertical':r['image_hashes']['9x16']}
    assert {im['adlabels'][0]['name']:im['hash'] for im in s['images']}==expected
    rules=sorted(s['asset_customization_rules'],key=lambda v:v['priority']); assert len(rules)==2
    assert rules[0]['image_label']['name']=='vertical' and rules[1]['image_label']['name']=='square'
    spec=rules[0]['customization_spec']; assert set(spec['publisher_platforms'])=={'facebook','instagram'}
    assert set(spec['facebook_positions'])=={'story','facebook_reels'} and set(spec['instagram_positions'])=={'story','reels'}
    assert not set(rules[1]['customization_spec'])-{'age_min','age_max'}
    f=c['degrees_of_freedom_spec']['creative_features_spec']; assert len(f)>15
    assert all(v['enroll_status']=='OPT_OUT' for v in f.values())
    for feature in ['advantage_plus_creative','adapt_to_placement','image_text_translation','text_translation','text_optimizations','site_extensions','image_background_gen','image_uncrop']: assert f[feature]['enroll_status']=='OPT_OUT'
    assert 'lead_gen_form_id' not in json.dumps(c) and not c.get('url_tags')
    r['verified_creative']=True; r['enhancement_opt_out_count']=len(f); save()
    print(r['ad_name'],'creative PASS; opt-outs',len(f),flush=True)
a['campaign_readback']=call('get_campaign',{'campaign_id':a['campaign_id']}); save()
a['adset_readback']=call('get_adset',{'adset_id':a['adset_id'],'fields':'id,name,campaign_id,status,effective_status,targeting,destination_type,promoted_object,optimization_goal'}); save()
assert a['campaign_readback']['status']=='PAUSED' and a['campaign_readback']['effective_status']=='PAUSED'
assert a['campaign_readback']['daily_budget']=='3500'
s=a['adset_readback']; assert s['campaign_id']==a['campaign_id'] and s['status']=='PAUSED' and s['effective_status']=='PAUSED'
assert s['destination_type']=='WEBSITE'; assert s['promoted_object']['pixel_id']=='592714768141415'
assert s['targeting']['age_min']==24 and s['targeting']['age_max']==54
assert s['targeting']['geo_locations']['cities'][0]['radius']==10
if all(r.get('ad_id') for r in a['records']):
    for r in a['records']:
        d=call('get_ad',{'ad_id':r['ad_id'],'fields':'id,name,adset_id,campaign_id,status,effective_status,creative,issues_info,recommendations,tracking_specs'}); r['ad_readback']=d; save()
        print(r['ad_name'],d['status'],d['effective_status'],flush=True)
    for r in a['records']:
        d=r['ad_readback']
        assert d['adset_id']==a['adset_id'] and d['campaign_id']==a['campaign_id']
        assert d['status']=='PAUSED'
        assert d['effective_status'] in ['PAUSED','CAMPAIGN_PAUSED','ADSET_PAUSED','PENDING_REVIEW','IN_PROCESS']
        r['effective_paused_verified']=d['effective_status'] in ['PAUSED','CAMPAIGN_PAUSED','ADSET_PAUSED']
        assert d['creative']['id']==r['creative_id']; assert d['name'].startswith(r['ad_name'])
        r['verified_ad']=True; save(); print(r['ad_name'],'ad PASS',d['effective_status'],flush=True)
    listing=call('list_ads',{'adset_id':a['adset_id'],'limit':100}); a['adset_ads_readback']=listing; save()
    assert len(listing['data'])==6 and not listing.get('paging',{}).get('next')
    assert {x['id'] for x in listing['data']}=={r['ad_id'] for r in a['records']}
    a['effective_status_gate_passed']=all(r['effective_paused_verified'] for r in a['records'])
    a['verification_status']='PASS: exactly six configured-PAUSED ads, six correct placement creatives, twelve hashes; parents paused; website-only; exact copy, identities, UTMs and all enhancements opted out.'
    if not a['effective_status_gate_passed']:
        a['verification_status'] += ' PENDING: Meta asynchronous processing/review still masks effective PAUSED on one or more ads; strict effective-status acceptance is NOT yet passed.'
else: a['verification_status']='Creatives and paused parents verified; ads not yet created.'
a['readback_at_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat(); save(); print(a['verification_status'])
if a.get('effective_status_gate_passed') is False:
    raise SystemExit(2)  # Persist all evidence, but do not pass strict async-state gate.
