"""Hard AY09 final attribution acceptance: exact raw macros, one canonical query."""
from urllib.parse import urlsplit, parse_qsl
QUERY='utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}'
BASE='https://joaocrusbjj.com/castle-hill-grand-opening/'
DESTINATION=BASE+'?'+QUERY

def validate(c):
    links=c['asset_feed_spec']['link_urls']
    assert links==[{'website_url':DESTINATION}], 'Exact canonical destination and raw query required'
    seen=[]
    def walk(value,path='creative'):
        if isinstance(value,dict):
            for key,v in value.items():
                p=path+'.'+key
                if key=='url_tags':
                    assert v in (None,''), 'URL tags must be absent/empty to avoid double-appended UTMs'
                    seen.append(p)
                elif isinstance(v,str) and ('utm_' in v or key in ('website_url','link_url','link')):
                    assert v==DESTINATION, ('Conflicting link/UTM representation',p)
                    parsed=urlsplit(v); pairs=parse_qsl(parsed.query,keep_blank_values=True)
                    assert len(pairs)==6 and len({k for k,_ in pairs})==6
                    assert parsed.query==QUERY and not parsed.fragment and 'fbclid' not in v
                    seen.append(p)
                elif isinstance(v,(dict,list)): walk(v,p)
        elif isinstance(value,list):
            for i,v in enumerate(value): walk(v,path+f'[{i}]')
    walk(c)
    return {'passed':True,'destination':DESTINATION,'query':QUERY,'representations_checked':seen,'url_tags':c.get('url_tags'),'fbclid':'Not manually appended; Meta automatic behavior unchanged'}

if __name__=='__main__':
    import austin_youth_comparison_meta as m
    proof={}
    for name,r in m.A['records'].items():
        if not name.startswith('AY09'): continue
        ad=m.call('get_ad',{'ad_id':r['ad_id'],'fields':m.AD_FIELDS})
        assert ad['creative']['id']==r['creative_id'] and ad['status']==ad['effective_status']=='PAUSED'
        c=m.call('get_creative',{'creative_id':ad['creative']['id'],'fields':m.CR_FIELDS})
        proof[name]=validate(c)|{'ad_id':ad['id'],'creative_id':c['id']}
    assert len(proof)==2
    m.A['final_utm_acceptance']=proof
    issues=m.call('get_adset',{'adset_id':m.S,'fields':'id,status,effective_status,issues_info'})
    assert issues['status']==issues['effective_status']=='PAUSED' and not issues.get('issues_info')
    m.A['authorized_location_type_revision']['final_issues_readback']=issues
    m.save(); print('PASS both final creatives: exact canonical URL, six unique raw UTMs, url_tags absent, no manual fbclid; ad set PAUSED/PAUSED with no issues_info returned.')
