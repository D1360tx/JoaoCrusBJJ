import hashlib,json,unittest,re
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parents[1]; P=R/'assets/meta/castle-hill/youth-wave-2/comparisons'
class ComparisonTests(unittest.TestCase):
 def setUp(self):
  self.m=json.loads((P/'manifest.json').read_text()); self.copy=json.loads((P/'approved-copy.json').read_text())
 def test_static_assets_bounds_and_hashes(self):
  self.assertEqual(len(self.m['assets']),4)
  for a in self.m['assets']:
   p=R/a['path']; self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(),a['sha256'])
   with Image.open(p) as image: self.assertEqual(image.size,(a['width'],a['height']))
   boxes=[t['bounds'] for t in a['text_boxes']]+[a['photo_frame']]; safe=a['safe_zone']
   for b in boxes: self.assertTrue(safe[0]<=b[0]<b[2]<=safe[2] and safe[1]<=b[1]<b[3]<=safe[3],(a['path'],b))
   for i,b in enumerate(boxes):
    for c in boxes[i+1:]: self.assertFalse(max(b[0],c[0])<min(b[2],c[2]) and max(b[1],c[1])<min(b[3],c[3]),(a['path'],b,c))
 def test_copy_and_one_variable_comparison(self):
  a,b,c=self.copy; self.assertEqual(a['headline'],'A Place to Start and Learn Together'); self.assertEqual(a['description'],'Youth BJJ, ages 8–12 in Austin.')
  self.assertEqual(a['primary_text'],'At 8–12, joining a new group can feel like the hardest part. Youth BJJ gives complete beginners a clear way in: meet the coach, learn one movement, practice with a partner, and build from there.\n\nOn the first visit, your child can watch or participate while your family sees how the class feels.\n\nClasses meet Tuesday and Thursday, 5:00–5:45 p.m. inside Castle Hill Fitness. Complete the class finder and Joao will personally call to help plan a free visit.')
  for key in ['primary_text','headline','description','destination_url','cta']:
   self.assertEqual(b[key],c[key])
   original=json.loads((P.parent/'video/approved-copy.json').read_text())[key]
   if key=='destination_url': original=original.replace('utm_content=AY09_BEGINNERS-WELCOME_VIDEO','utm_content={{ad.name}}')
   self.assertEqual(b[key],original)
  for x in [b,c]: self.assertIn('utm_content={{ad.name}}',x['destination_url'])
  for x in self.copy: self.assertNotIn('—',x['primary_text']); self.assertIn('{{adset.name}}',x['destination_url']); self.assertIn('{{campaign.id}}',x['destination_url'])
  self.assertIn('{{ad.name}}',a['destination_url'])
  for asset in self.m['assets']:
   if asset['ad_name'].startswith('AY07_'): self.assertEqual([x['text'] for x in asset['text_boxes']],["THERE'S ROOM",'TO BE A BEGINNER.','A coach to learn from. Partners to practice with.','YOUTH BJJ | AGES 8–12 | CASTLE HILL FITNESS'])
 def test_natural_video_cut(self):
  self.assertEqual(len(self.m['videos']),2); edit=self.m['video_edit']; self.assertEqual(edit['source_in'],28.04); self.assertEqual(edit['source_out'],54.88); self.assertLess(edit['source_out'],edit['next_sentence_starts'])
  for v in self.m['videos']:
   self.assertEqual(hashlib.sha256((R/v['path']).read_bytes()).hexdigest(),v['sha256']); self.assertAlmostEqual(float(v['ffprobe']['format']['duration']),26.84,delta=.06); self.assertLessEqual(v['footer_bottom'],v['safe_zone'][3])
   self.assertEqual(hashlib.sha256((R/v['caption_file']).read_bytes()).hexdigest(),v['caption_sha256'])
   self.assertEqual({x['codec_name'] for x in v['ffprobe']['streams']},{'h264','aac'})
  self.assertEqual(edit['captions'][-1]['text'],'the right place for you or your child.')
 def test_no_public_secrets(self):
  for p in P.glob('*.json'):
   t=p.read_text(); self.assertIsNone(re.search(r'access_token=|https?[^\s\"]+(?:fbcdn.net|fbsbx.com)|EA[A-Za-z0-9]{80,}',t),p.name)
 def test_live_contract_when_present(self):
  a=json.loads((P/'meta-audit.json').read_text())
  if not a.get('all_three_verified'): self.skipTest('Full three-ad Meta verification not yet complete')
  self.assertEqual(len(a['records']),3)
  self.assertEqual(a['records']['AY07_BEGINNER-BELONGING_STATIC']['ad_id'],'120251261010900072')
  self.assertEqual(a['original_ad_before'],a['original_ad_after']); self.assertEqual(a['before']['adset'],a['after']['adset'])
  for key in ['daily_budget','lifetime_budget','bid_strategy','status','effective_status']: self.assertEqual(a['before']['campaign'].get(key),a['after']['campaign'].get(key))
  for name,r in a['records'].items():
   ad=r['ad_readback']; self.assertEqual(ad['status'],'PAUSED'); self.assertEqual(ad['effective_status'],'PAUSED'); self.assertEqual(ad['creative']['id'],r['creative_id']); self.assertEqual(ad['adset_id'],'120251246144560072'); self.assertEqual(ad['campaign_id'],'120251246135250072')
   x=next(c for c in self.copy if c['ad_name']==name); cr=r['creative_readback']; f=cr['asset_feed_spec']
   self.assertEqual(cr['object_story_spec'],{'page_id':'977808342257807','instagram_user_id':'17841402345785819'})
   features=cr['degrees_of_freedom_spec']['creative_features_spec']; self.assertEqual(set(features),set(a['original_creative']['degrees_of_freedom_spec']['creative_features_spec'])); self.assertTrue(all(v['enroll_status']=='OPT_OUT' for v in features.values()))
   for field,key in [('bodies','primary_text'),('titles','headline'),('descriptions','description')]: self.assertEqual(f[field],[{'text':x[key]}])
   self.assertEqual(f['link_urls'],[{'website_url':x['destination_url']}]); self.assertEqual(f['call_to_action_types'],['LEARN_MORE']); self.assertEqual(f['optimization_type'],'PLACEMENT'); self.assertNotIn('form_id',json.dumps(cr))
   if name.startswith('AY09'):
    self.assertIn('utm_content={{ad.name}}',f['link_urls'][0]['website_url'])
    self.assertEqual(len(features),83)
   video='LONG-VIDEO' in name; media=f['videos' if video else 'images']; self.assertEqual({z['adlabels'][0]['name']:z['video_id' if video else 'hash'] for z in media},r.get('creative_media',r['media']))
   self.assertEqual([z['priority'] for z in f['asset_customization_rules']],[1,2])
if __name__=='__main__': unittest.main()
