"""AY09A/B URL-only creative replacement. Default read-only; --apply is paused-only.
Preserves historical evidence and refuses media/routing changes before swapping ads.
"""
import argparse
import copy
import datetime
import austin_youth_comparison_meta as m

TARGETS = {
    'AY09A_BEGINNERS-WELCOME_LONG-VIDEO': ('120251263139970072', '1050466397745571'),
    'AY09B_BEGINNERS-WELCOME_STATIC': ('120251263002380072', '1091227666887241'),
}
OLD = 'utm_content=AY09_BEGINNERS-WELCOME_VIDEO'
NEW = 'utm_content={{ad.name}}'


def payload(creative):
    return copy.deepcopy({k: creative[k] for k in
                          ['object_story_spec', 'asset_feed_spec', 'degrees_of_freedom_spec']})


def exact_replacement(before, after):
    expected = payload(before)
    url = expected['asset_feed_spec']['link_urls'][0]['website_url']
    assert OLD in url
    expected['asset_feed_spec']['link_urls'][0]['website_url'] = url.replace(OLD, NEW)
    assert m.redact(expected) == m.redact(payload(after)), 'Non-URL creative difference; no swap permitted'
    assert before.get('url_tags') == after.get('url_tags')
    fs = after['degrees_of_freedom_spec']['creative_features_spec']
    assert len(fs) == 83 and all(v['enroll_status'] == 'OPT_OUT' for v in fs.values())


def main(apply=False, ad_name=None):
    m.preflight()
    fix = m.A.setdefault('attribution_correction', {'records': {}})
    if 'protected_before' not in fix:
        fix['protected_before'] = {ad: m.call('get_ad', {'ad_id': ad, 'fields': m.AD_FIELDS})
                                   for ad in [m.AY07, m.ORIGINAL]}
        m.save()
    for name, (ad_id, old_id) in TARGETS.items():
        if ad_name and name != ad_name:
            continue
        r = m.A['records'][name]
        x = next(c for c in m.COPIES if c['ad_name'] == name)
        ad = m.call('get_ad', {'ad_id': ad_id, 'fields': m.AD_FIELDS})
        assert ad['name'] == name and ad['status'] == 'PAUSED'
        item = fix['records'].setdefault(name, {})
        if 'before' not in item:
            assert ad['creative']['id'] == old_id and ad['effective_status'] == 'PAUSED'
            item['before'] = copy.deepcopy(r)
            item['ad_before'] = ad
            m.save()
        before = m.call('get_creative', {'creative_id': old_id, 'fields': m.CR_FIELDS})
        if not item.get('replacement_creative_id'):
            assert ad['creative']['id'] == old_id
            if not apply:
                print(name, 'URL correction pending; --apply required')
                continue
            request = payload(before)
            request['asset_feed_spec']['link_urls'][0]['website_url'] = x['destination_url']
            assert x['destination_url'] == before['asset_feed_spec']['link_urls'][0]['website_url'].replace(OLD, NEW)
            request.update(account_id=m.ACCOUNT, name=before['name'])
            result = m.call('create_creative', request)
            item['replacement_creative_id'] = result['id']
            m.save()
        new_id = item['replacement_creative_id']
        after = m.call('get_creative', {'creative_id': new_id, 'fields': m.CR_FIELDS})
        item['creative_readback'] = m.redact(after)
        m.save()
        exact_replacement(before, after)
        m.validate_creative(after, x, r)
        if ad['creative']['id'] != new_id:
            assert ad['creative']['id'] == old_id
            assert apply, 'Replacement verified but swap requires --apply'
            m.call('update_ad', {'ad_id': ad_id, 'creative_id': new_id, 'name': name, 'status': 'PAUSED'})
        r['creative_id'] = new_id
        r['creative_readback'] = m.redact(after)
        item['superseded_creative_id'] = old_id
        m.save()
        m.verify_ad(r, x, 8)
    if all(m.A['records'][name]['creative_id'] == fix['records'].get(name, {}).get('replacement_creative_id') for name in TARGETS):
        m.verify()
        for ad_id, before_ad in fix['protected_before'].items():
            after_ad = m.call('get_ad', {'ad_id': ad_id, 'fields': m.AD_FIELDS})
            fix.setdefault('protected_after', {})[ad_id] = after_ad
            m.save()
            assert before_ad == after_ad
        assert m.A['after']['campaign']['daily_budget'] == '3500'
        fix['verified_at_utc'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        fix['verified'] = True
        m.save()
        manifest = m.M
        manifest['comparison_attribution'] = {
            'utm_content': '{{ad.name}}',
            'destination_urls': {x['ad_name']: x['destination_url'] for x in m.COPIES if x['ad_name'] in TARGETS},
            'ad_ids': {name: ids[0] for name, ids in TARGETS.items()},
            'creative_ids': {name: fix['records'][name]['replacement_creative_id'] for name in TARGETS},
            'evidence': 'meta-audit.json#attribution_correction',
        }
        m.write(m.PACK / 'manifest.json', manifest)
        print('Verified URL-only replacements, unchanged media IDs/hashes, 83 OPT_OUT each, protected ads/parents unchanged.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--ad-name', choices=list(TARGETS))
    args = parser.parse_args()
    main(args.apply, args.ad_name)
