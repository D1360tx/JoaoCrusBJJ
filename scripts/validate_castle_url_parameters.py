"""Validate the dedicated URL-parameters migration; fail on incomplete ads."""
import json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
E=R/'assets/meta/castle-hill/youth-wave-2/comparisons/reconciliation-2026-09-08/url-parameters-migration.json'
def main():
 e=json.loads(E.read_text()); b=e['before']; a=e['after']; ids=e['original_mappings']; ads=a['ads']['data']
 assert len(ads)==len({v['id'] for v in ads})==11
 assert all(v['status']==v['effective_status']=='PAUSED' and not v.get('issues_info') for v in ads)
 proof_path=E.with_name('url-tag-video-equivalence.json')
 if proof_path.exists():
  proof=json.loads(proof_path.read_text())
  current=proof['ads']['data']
  assert len(current)==len({v['id'] for v in current})==11
  assert all(v['status']==v['effective_status']=='PAUSED' for v in current)
  assert all(v['status']==v['effective_status']=='PAUSED' for v in proof['parents'].values())
  assert proof['parents']==b['parents']
  assert proof['copy_routing_media_labels_equal_after_documented_remap']
  assert proof['identity_equal'] and proof['enhancements_equal']
  assert all(p['equal_duration'] and p['equal_thumbnail_dimensions'] and p['equal_thumbnail_rgb'] for p in proof['pairs'])
  assert all(v=={'success':True} for v in proof['validate_only'].values())
  assert {v['id']:v['creative']['id'] for v in current}=={v['id']:v['creative']['id'] for v in ads}
  ads=current
  a=dict(a,ads=proof['ads'],creatives=proof['current_creatives'],parents=proof['parents'])
  print('PASS fresh paused-state, validate-only and thumbnail evidence; full video equivalence:',proof['full_video_equivalence_proven'])
  # A preferred thumbnail and matching duration cannot authorize a full-video swap.
  # This evidence records an unresolved gate, never a replacement for timeline proof.
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
