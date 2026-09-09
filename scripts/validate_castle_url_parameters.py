"""Validate the dedicated URL-parameters migration; fail on incomplete ads."""
import json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
E=R/'assets/meta/castle-hill/youth-wave-2/comparisons/reconciliation-2026-09-08/url-parameters-migration.json'
def main():
 e=json.loads(E.read_text()); b=e['before']; a=e['after']; ids=e['original_mappings']; ads=a['ads']['data']
 assert len(ads)==len({v['id'] for v in ads})==11
 assert all(v['status']=='PAUSED' and not v.get('issues_info') for v in ads)
 assert a['parents']==b['parents']
 failures=[]
 for aid,old_id in ids.items():
  ad=next(v for v in ads if v['id']==aid);old_ad=next(v for v in b['ads']['data'] if v['id']==aid)
  for k in ('name','campaign_id','adset_id'):assert ad[k]==old_ad[k]
  c=a['creatives'][ad['creative']['id']];old=b['creatives'][old_id]
  s=c['asset_feed_spec']; expected=dict(old['asset_feed_spec']);expected['link_urls']=[{'website_url':e['target_url']}]
  if c.get('url_tags')!=e['target_url_tags'] or s['link_urls']!=expected['link_urls']:
   failures.append(aid+': dedicated URL parameters migration incomplete')
  else:
   assert s==expected, 'Any change to media IDs/hashes, copy or placement routing is forbidden'
   assert c['object_story_spec']==old['object_story_spec']
   assert c['degrees_of_freedom_spec']==old['degrees_of_freedom_spec']
   print('PASS exact dedicated URL parameters, clean destination and unchanged media/copy:',aid,ad['creative']['id'])
  if ad['effective_status']!='PAUSED':failures.append(aid+': effective status '+ad['effective_status'])
 for ad in ads:
  if ad['id'] not in ids:assert ad==next(v for v in b['ads']['data'] if v['id']==ad['id'])
 print('PASS: 11 configured PAUSED ads, parents unchanged and PAUSED, eight other ads unchanged.')
 if failures:raise SystemExit('\n'.join(failures))
 print('PASS: all three migrated and PAUSED / PAUSED')
if __name__=='__main__':main()
