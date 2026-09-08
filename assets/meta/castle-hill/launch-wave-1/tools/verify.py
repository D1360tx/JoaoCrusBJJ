#!/usr/bin/env python3
"""Verify exported pixels and metadata without any external service calls."""
from pathlib import Path
from collections import Counter
from urllib.parse import urlparse, parse_qs
import hashlib
import json
from PIL import Image, ImageChops

BASE = Path(__file__).resolve().parents[1]
ROOT = BASE.parents[3]

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def verify():
    manifest = json.loads((BASE/'manifest.json').read_text())
    assets = manifest['assets']
    assert len(assets) == 12
    counts = Counter(a['ad_name'] for a in assets)
    assert len(counts) == 6 and set(counts.values()) == {2}
    assert len(set(a['filename'] for a in assets)) == 12
    assert set((BASE/'images').rglob('*.png')) == {ROOT/a['filename'] for a in assets}
    warnings=[]
    for a in assets:
        p=ROOT/a['filename']; im=Image.open(p)
        assert im.size == (a['width'],a['height']) == (1080,1080 if a['aspect_ratio']=='1x1' else 1920)
        assert im.mode == 'RGB' and im.format == 'PNG'
        assert digest(p) == a['sha256']
        query=parse_qs(urlparse(a['destination_url']).query)
        assert query['utm_content'] == [a['ad_name']]
        assert query['utm_source'] == ['meta'] and query['utm_medium'] == ['paid_social']
        assert query['utm_campaign'] == ['austin_castle_hill_launch_v1']
        assert query['utm_term'] == ['{{adset.name}}'] and query['utm_id'] == ['{{campaign.id}}']
        assert urlparse(a['destination_url']).path == '/castle-hill-grand-opening/'
        assert '\u2014' not in ''.join(a['on_image_copy']+[a[k] for k in ['primary_text','headline','description']])
        s=a['safe_zone']
        boxes=[x['bounds'] for x in a['text_boxes']]+[a['logo']['bounds']]+[x['bounds'] for x in a['photo_frames']]
        for b in boxes:
            assert s[0]<=b[0]<b[2]<=s[2] and s[1]<=b[1]<b[3]<=s[3], (a['filename'], b)
        for source in a['source_images']:
            assert digest(ROOT/source['path']) == source['sha256']
            assert 'ai-' not in source['path'] and 'adults-joao-coaching' not in source['path']
            assert 'black-belt-group' not in source['path']
            assert source['permission_status'] == 'paid_media_release_not_documented'
        logo=a['logo']; assert digest(ROOT/logo['path']) == logo['sha256']
        expected=Image.new('RGB',(108,108),'#FFFDF8')
        mark=Image.open(ROOT/logo['path']).convert('RGBA').resize((108,108),Image.Resampling.LANCZOS)
        expected.paste(mark,(0,0),mark)
        assert ImageChops.difference(im.crop(logo['bounds']),expected).getbbox() is None
        cta=next(t for t in a['text_boxes'] if t['text']=='FIND YOUR FIT')
        assert cta['color']=='#101010'
        assert im.getpixel((74,cta['bounds'][1]-16))==(245,196,0)
        for k, recommended in [('primary_text',125),('headline',40),('description',30)]:
            assert a['copy_lengths'][k] == len(a[k])
            if len(a[k])>recommended:
                warnings.append({'ad_name':a['ad_name'],'field':k,'length':len(a[k]),'recommended':recommended})
        assert len(a['primary_text'])<=2200
        if a['ad_name'].startswith('AA05'):
            assert len(a['photo_frames']) == 2
    unique_warnings=list({json.dumps(w,sort_keys=True):w for w in warnings}.values())
    result={'technical_status':'pass','asset_count':len(assets),'concept_count':len(counts),'dimension_counts':dict(Counter(str((a['width'],a['height'])) for a in assets)),'checks':['SHA256 all exports and sources','Exact ad-specific UTM contracts','No em dashes','Text/photo/logo safe-zone containment','Pixel-exact official logo composition','Black text on exact yellow CTA','12 unique RGB PNG outputs','No known AI derivatives or five-black-belt lineup','AA05 two source frames'],'copy_length_warnings':unique_warnings,'visual_status':'blocked_scene_requirements','permission_status':'blocked_paid_media_releases_not_documented','activation_allowed':False}
    (BASE/'qa-report.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))

if __name__=='__main__':
    verify()
