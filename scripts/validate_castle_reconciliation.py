"""Offline regression for the exact reconciled, paused Meta snapshot."""
import json
from pathlib import Path
from urllib.parse import urlsplit
R=Path(__file__).resolve().parents[1]
E=R/'assets/meta/castle-hill/youth-wave-2/comparisons/reconciliation-2026-09-08'
def main():
 e=json.loads((E/'readback.json').read_text());ads=e['ads']
 assert len(ads)==len({a['id'] for a in ads})==11
 assert all(a['status']==a['effective_status']=='PAUSED' and not a.get('issues_info') for a in ads)
 assert all(p['status']==p['effective_status']=='PAUSED' for p in e['parents'].values())
 assert e['parents']['campaign']['daily_budget']=='1000'
 expected={'120251263139970072':'1392143345711700','120251263002380072':'1548660843191930','120251261045730072':'1392143345711700'}
 query='utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}'
 copy=json.loads((E.parent/'approved-copy.json').read_text())[1]
 for aid,cid in expected.items():
  a=next(a for a in ads if a['id']==aid);assert a['creative']['id']==cid
  c=e['creatives'][cid];s=c['asset_feed_spec'];assert not c.get('url_tags')
  assert s['bodies']==[{'text':copy['primary_text']}]
  assert s['titles']==[{'text':copy['headline']}]
  assert s['descriptions']==[{'text':copy['description']}]
  assert len(s['link_urls'])==1
  assert s['link_urls'][0]['website_url']==copy['destination_url']
  assert urlsplit(s['link_urls'][0]['website_url']).query==query
  assert all(v['enroll_status']=='OPT_OUT' for v in c['degrees_of_freedom_spec']['creative_features_spec'].values())
 assert len(e['audio_verification'])==2 and all(a['equals_completed_cut'] for a in e['audio_verification'])
 assert e['draft_resolution']['owner_id']=='120251246144560072'
 print('PASS: 11 paused ads, 2 paused parents, 3 exact AY09 mappings/copy/UTMs, budget 1000, enhancement opt-outs and completed audio evidence.')
if __name__=='__main__':main()
