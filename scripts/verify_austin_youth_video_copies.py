"""Verify Meta-created video IDs against uploads using duration, thumbnails and request labels.
Graph may omit source URLs for creative-owned copies; do not invent decoded-video proof.
"""
import io,json,requests
from PIL import Image,ImageChops,ImageStat
from austin_youth_comparison_meta import A,PACK,graph,save,sha,PRIVATE
r=A['records']['AY09A_BEGINNERS-WELCOME_LONG-VIDEO']; verified={}
for item in r['creative_readback']['asset_feed_spec']['videos']:
 label=item['adlabels'][0]['name']; vid=item['video_id']; original=r['media'][label]
 info=graph(vid,fields='id,status,length'); r.setdefault('creative_video_readbacks',{})[label]=info; save()
 assert info['status']['video_status']=='ready' and abs(info['length']-r['upload_readbacks'][label]['length'])<.01
 photos=[]; evidence=[]
 for ident in [original,vid]:
  th=graph(ident+'/thumbnails',fields='uri,is_preferred,width,height'); t=next((x for x in th['data'] if x.get('is_preferred')),th['data'][0])
  response=requests.get(t['uri'],timeout=90); response.raise_for_status(); p=PRIVATE/(ident+'-thumb.jpg');p.write_bytes(response.content)
  photos.append(Image.open(io.BytesIO(response.content)).convert('RGB').resize((180,320 if label=='vertical' else 225)))
  evidence.append({'video_id':ident,'thumbnail_sha256':sha(p),'width':t['width'],'height':t['height']})
 difference=sum(ImageStat.Stat(ImageChops.difference(*photos)).mean)/3
 assert difference<3,difference
 expected=9/16 if label=='vertical' else 4/5
 assert all(abs(x['width']/x['height']-expected)<.01 for x in evidence)
 r.setdefault('video_copy_equivalence',{})[label]={'upload_id':original,'creative_video_id':vid,'duration_seconds':info['length'],'thumbnails':evidence,'thumbnail_mean_absolute_difference_0_255':difference,'proof':'Exact create_creative request labels + ready status + equal duration + matching source/copy preferred thumbnails and expected aspect ratio. Graph omitted source for copy; decoded remote video not claimed.'}
 verified[label]=vid;save();print(label,vid,'thumbnail MAD',difference,'duration',info['length'])
r['creative_media']=verified;save()
