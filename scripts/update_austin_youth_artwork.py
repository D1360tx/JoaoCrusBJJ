"""Approved selected-photo/footer replacement. Explicit --apply, existing PAUSED ads only."""
import argparse, copy, datetime, time
import austin_youth_comparison_meta as m
from update_austin_youth_combined_copy import payload, prove_video_copies, assert_ad_preserved
from austin_youth_combined_copy import PRIMARY_TEXT, HEADLINE
TARGETS={'AY09A_BEGINNERS-WELCOME_LONG-VIDEO':('120251263139970072','28341354795499624'),'AY09B_BEGINNERS-WELCOME_STATIC':('120251263002380072','1066596592851512')}
DESCRIPTION='Adults + Youth Ages 8–12 in Austin.'

def invariant(before, after):
    a,b=payload(before),payload(after)
    for c in [a,b]:
        c.pop('name')
        f=c['asset_feed_spec']
        for key in ['videos','images','descriptions']: f.pop(key,None)
    assert m.redact(a)==m.redact(b), 'Unexpected copy, URL, routing, identity or enhancement change'
    assert after['asset_feed_spec']['descriptions']==[{'text':DESCRIPTION}]

def protected():
    ads={i:m.call('get_ad',{'ad_id':i,'fields':m.AD_FIELDS}) for i in [m.AY07,m.ORIGINAL]}
    return {'ads':ads,'creatives':{i:m.redact(m.call('get_creative',{'creative_id':a['creative']['id'],'fields':m.CR_FIELDS})) for i,a in ads.items()}}

def main(apply):
    m.preflight()
    rev=m.A.setdefault('artwork_revision',{'records':{}})
    if 'parents_before' not in rev:
        rev['parents_before']=m.parents(); rev['protected_before']=protected(); m.save()
    for name,(ad_id,old_id) in TARGETS.items():
        x=next(c for c in m.COPIES if c['ad_name']==name)
        assert (x['primary_text'],x['headline'],x['description'])==(PRIMARY_TEXT,HEADLINE,DESCRIPTION)
        ad=m.call('get_ad',{'ad_id':ad_id,'fields':m.AD_FIELDS})
        assert ad['status']=='PAUSED'
        r=m.A['records'][name]
        if ad['effective_status']!='PAUSED':
            assert ad['creative']['id']==rev['records'][name]['replacement_creative_id']
            m.verify_ad(r,x,8)
            ad=r['ad_readback']
        item=rev['records'].setdefault(name,{'before':copy.deepcopy(r),'ad_before':ad,'media':{}}); m.save()
        assert item['before']['creative_id']==old_id
        before=m.call('get_creative',{'creative_id':old_id,'fields':m.CR_FIELDS}); item['creative_before']=m.redact(before); m.save()
        video='LONG-VIDEO' in name
        assets=[a for a in m.M['videos' if video else 'assets'] if a['ad_name']==name]; assert len(assets)==2
        thumbs={}
        for asset in assets:
            label='vertical' if asset['ratio']=='9x16' else 'feed'; path=m.ROOT/asset['path']; assert m.sha(path)==asset['sha256']
            assert 'adults-youth' in path.name
            if label not in item['media']:
                assert apply
                result=m.graph(m.ACCOUNT+'/advideos',upload=path) if video else m.call('upload_image',{'account_id':m.ACCOUNT,'image_path':str(path)})
                item['media'][label]=result['id' if video else 'hash']; item.setdefault('assets',{})[label]=asset; m.save()
            if video:
                info={}
                for n in range(12):
                    info=m.graph(item['media'][label],fields='id,status,length'); item.setdefault('upload_readbacks',{})[label]=info; m.save()
                    if info['status']['video_status']=='ready': break
                    time.sleep(20)
                assert info['status']['video_status']=='ready'
                assert abs(info['length']-float(asset['ffprobe']['format']['duration']))<.01
                th=m.graph(item['media'][label]+'/thumbnails',fields='uri,is_preferred,width,height')
                preferred=[t for t in th['data'] if t.get('is_preferred')]; assert len(preferred)==1
                thumbs[label]=preferred[0]['uri']
        request=payload(before); request['name']=name+' | ADULTS YOUTH ARTWORK | PAID MEDIA HOLD'
        f=request['asset_feed_spec']; f['descriptions']=[{'text':DESCRIPTION}]
        f['videos' if video else 'images']=[({'video_id':v,'thumbnail_url':thumbs[label]} if video else {'hash':v})|{'adlabels':[{'name':label}]} for label,v in item['media'].items()]
        if not item.get('replacement_creative_id'):
            assert apply and ad['creative']['id']==old_id
            result=m.call('create_creative',dict(request,account_id=m.ACCOUNT)); item['replacement_creative_id']=result['id']; m.save()
        after=m.call('get_creative',{'creative_id':item['replacement_creative_id'],'fields':m.CR_FIELDS}); item['creative_readback']=m.redact(after); m.save()
        invariant(before,after)
        candidate={'ad_id':ad_id,'creative_id':item['replacement_creative_id'],'media':item['media'],'creative_readback':m.redact(after)}
        if video:
            # Compare new creative copies to freshly uploaded expected renders, NOT old artwork.
            proof=prove_video_copies(request,after,item,candidate)
            candidate['video_copy_equivalence']=proof
            candidate['creative_media']={v['adlabels'][0]['name']:v['video_id'] for v in after['asset_feed_spec']['videos']}
            candidate['upload_readbacks']=item['upload_readbacks']
            for p in proof.values():
                p['proof']='Fresh expected render upload to creative copy: ready, identical duration/dimensions and byte-identical decoded preferred thumbnails. Full remote-video byte equivalence is not claimed.'
        m.validate_creative(after,x,candidate); item['candidate_verified']=True; m.save()
        if ad['creative']['id']!=candidate['creative_id']:
            assert apply and ad['creative']['id']==old_id
            m.call('update_ad',{'ad_id':ad_id,'creative_id':candidate['creative_id'],'name':name,'status':'PAUSED'})
        m.A['records'][name]=candidate; m.save(); m.verify_ad(candidate,x,8)
        item['generated_post_mapping']=assert_ad_preserved(item['ad_before'],candidate['ad_readback'])
        item['ad_after']=copy.deepcopy(candidate['ad_readback']); item['verified']=True; m.save()
    m.verify(); rev['parents_after']=m.parents(); rev['protected_after']=protected(); m.save()
    m.assert_parent_preserved(rev['parents_before'],rev['parents_after'])
    assert rev['protected_before']==rev['protected_after']
    rev['verified']=True; rev['verified_at_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    rev['description_change']='Youth-only description intentionally replaced with Adults + Youth Ages 8–12 in Austin.'
    rev['visual_qa']='Both static sheets and both five-frame video sheets inspected: full group source/all faces retained; no text overlap; exact combined footer; caption ending intact.'
    m.save()
    m.M['artwork_revision']={'creative_ids':{n:r['replacement_creative_id'] for n,r in rev['records'].items()},'evidence':'meta-audit.json#artwork_revision','footer':'ADULTS + YOUTH AGES 8–12 · CASTLE HILL FITNESS'}
    m.write(m.PACK/'manifest.json',m.M)
    print('Artwork verified; AY07/original AY09 unchanged; only parent-applied authorized location-type normalization.')
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--apply',action='store_true'); main(p.parse_args().apply)
