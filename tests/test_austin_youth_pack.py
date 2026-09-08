"""Offline artifact and exact live-readback contract tests."""
from pathlib import Path
import json, hashlib, unittest
from PIL import Image
R=Path(__file__).resolve().parents[1]; P=R/'assets/meta/castle-hill/youth-wave-2'
class YouthPack(unittest.TestCase):
 def test_assets(self):
  m=json.loads((P/'manifest.json').read_text()); copy=json.loads((P/'approved-copy.json').read_text())
  self.assertEqual(len(m['assets']),4); self.assertEqual(len({x['sha256'] for x in m['assets']}),4)
  self.assertFalse(m['ai_imagery']); self.assertEqual(len(m['activation_gates']),3)
  allowed={x['path'] for x in m['source_allowlist']}
  self.assertEqual(allowed,{'site/assets/castle-hill-youth-group-20260907.webp','site/assets/youth-junior-warriors-group.webp'})
  for source in m['source_allowlist']: self.assertEqual(hashlib.sha256((R/source['path']).read_bytes()).hexdigest(),source['sha256'])
  for x in copy:
   self.assertEqual({v['aspect_ratio'] for v in m['assets'] if v['ad_name']==x['ad_name']},{'1x1','9x16'})
  for asset in m['assets']:
   with Image.open(R/asset['filename']) as image: self.assertEqual(image.size,(1080,1080 if asset['aspect_ratio']=='1x1' else 1920))
   self.assertEqual(hashlib.sha256((R/asset['filename']).read_bytes()).hexdigest(),asset['sha256'])
   self.assertTrue(set(asset['source_images'])<=allowed)
   expected=next(x for x in copy if x['ad_name']==asset['ad_name'])
   for k,v in expected.items(): self.assertEqual(asset[k],v)
   safe=asset['safe_zone']; boxes=[b['bounds'] for b in asset['text_boxes']]
   for b in boxes:
    self.assertTrue(b[0]>=safe[0] and b[1]>=safe[1] and b[2]<=safe[2] and b[3]<=safe[3])
   boxes.append(asset['photo_frame'])
   for i,b in enumerate(boxes):
    for c in boxes[i+1:]: self.assertTrue(b[2]<=c[0] or c[2]<=b[0] or b[3]<=c[1] or c[3]<=b[1],(b,c))
 def test_meta(self):
  a=json.loads((P/'meta-audit.json').read_text()); copy=json.loads((P/'approved-copy.json').read_text())
  self.assertEqual(len(a['records']),2); self.assertEqual(len({r['ad_id'] for r in a['records']}),2)
  for r,x in zip(a['records'],copy):
   d=r['ad_readback']; c=r['creative_readback']; s=c['asset_feed_spec']
   self.assertEqual(d['id'],r['ad_id']); self.assertEqual(c['id'],r['creative_id']); self.assertEqual(d['creative']['id'],r['creative_id'])
   self.assertEqual(d['status'],'PAUSED'); self.assertEqual(d['name'],x['ad_name'])
   self.assertIn(d['effective_status'],['PAUSED','CAMPAIGN_PAUSED','ADSET_PAUSED']); self.assertTrue(a['effective_paused_gate_passed'])
   self.assertEqual(d['adset_id'],a['adset_id']); self.assertEqual(d['campaign_id'],a['campaign_id'])
   self.assertEqual(c['object_story_spec'],{'page_id':'977808342257807','instagram_user_id':'17841402345785819'})
   for k,field in [('bodies','primary_text'),('titles','headline'),('descriptions','description')]: self.assertEqual(s[k],[{'text':x[field]}])
   self.assertEqual(s['link_urls'],[{'website_url':x['destination_url']}]); self.assertIn('utm_content={{ad.name}}',x['destination_url'])
   self.assertEqual(s['optimization_type'],'PLACEMENT'); self.assertEqual(s['ad_formats'],['SINGLE_IMAGE']); self.assertEqual(s['call_to_action_types'],['LEARN_MORE'])
   self.assertEqual({v['adlabels'][0]['name']:v['hash'] for v in s['images']},{'square':r['image_hashes']['1x1'],'vertical':r['image_hashes']['9x16']})
   rules=sorted(s['asset_customization_rules'],key=lambda z:z['priority'])
   self.assertEqual([z['priority'] for z in rules],[1,2]); self.assertEqual([z['image_label']['name'] for z in rules],['vertical','square'])
   spec=rules[0]['customization_spec']; self.assertEqual(set(spec['facebook_positions']),{'story','facebook_reels'}); self.assertEqual(set(spec['instagram_positions']),{'story','reels'})
   self.assertEqual(set(spec['publisher_platforms']),{'facebook','instagram'}); self.assertFalse(set(rules[1]['customization_spec'])-{'age_min','age_max'})
   f=c['degrees_of_freedom_spec']['creative_features_spec']; baseline=json.loads((R/'assets/meta/castle-hill/safe-wave-1/meta-audit.json').read_text())['records'][0]['creative_readback']['degrees_of_freedom_spec']['creative_features_spec']
   self.assertEqual(f,baseline); self.assertTrue(all(v['enroll_status']=='OPT_OUT' for v in f.values()))
   self.assertNotIn('lead_gen_form_id',json.dumps(c)); self.assertFalse(c.get('url_tags'))
  self.assertEqual(a['before']['adset'],a['after']['adset'])
  for k in ['daily_budget','lifetime_budget','bid_strategy']: self.assertEqual(a['before']['campaign'].get(k),a['after']['campaign'].get(k))
  for v in a['after'].values(): self.assertEqual(v['status'],'PAUSED'); self.assertEqual(v['effective_status'],'PAUSED')
  s=a['after']['adset']; self.assertEqual(s['destination_type'],'WEBSITE'); self.assertEqual(s['promoted_object']['pixel_id'],'592714768141415'); self.assertEqual(s['promoted_object']['custom_event_type'],'LEAD'); self.assertFalse(s['promoted_object']['smart_pse_enabled'])
if __name__=='__main__': unittest.main()
