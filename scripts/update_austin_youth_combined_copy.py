"""Approved AY09A/B primary text and headline swap; --apply required for mutations.
Compare all writable creative fields, permitting only verified Meta video-ID copies.
Raw/signed responses stay private; sanitized historical evidence is append-only.
"""
import argparse
import copy
import datetime
import hashlib
import io
import json
import time
import requests
from PIL import Image
import austin_youth_comparison_meta as m
from austin_youth_combined_copy import PRIMARY_TEXT, HEADLINE

TARGETS = {
    'AY09A_BEGINNERS-WELCOME_LONG-VIDEO': ('120251263139970072', '1742996493484338'),
    'AY09B_BEGINNERS-WELCOME_STATIC': ('120251263002380072', '1066872229294951'),
}
FIELDS = ['name', 'object_story_spec', 'asset_feed_spec', 'degrees_of_freedom_spec', 'url_tags']


def payload(c):
    return copy.deepcopy({k: c[k] for k in FIELDS if k in c})


def assert_copy_only(before, after, proof):
    expected = payload(before)
    expected['asset_feed_spec']['bodies'] = [{'text': PRIMARY_TEXT}]
    expected['asset_feed_spec']['titles'] = [{'text': HEADLINE}]
    actual = payload(after)
    for old, new in zip(expected['asset_feed_spec'].get('videos', []), actual['asset_feed_spec'].get('videos', [])):
        if old['video_id'] != new['video_id']:
            label = old['adlabels'][0]['name']
            p = proof[label]
            assert p['prior_video_id'] == old['video_id'] and p['creative_video_id'] == new['video_id']
            assert p['ready'] and p['durations_identical'] and p['dimensions_identical'] and p['decoded_thumbnails_identical']
            assert p['thumbnail_mean_absolute_difference_0_255'] == 0
            old['video_id'] = new['video_id']
    # Meta enforces unique internal creative names and auto-suffixes copies.
    # This generated object metadata is not the preserved ad name or paid copy.
    assert actual.pop('name').split(' 2026-')[0] == expected.pop('name').split(' 2026-')[0]
    assert m.redact(expected) == m.redact(actual), 'Unexpected non-copy creative change'
    assert before.get('url_tags') == after.get('url_tags')
    fs = after['degrees_of_freedom_spec']['creative_features_spec']
    assert len(fs) == 83 and all(v['enroll_status'] == 'OPT_OUT' for v in fs.values())


def assert_ad_preserved(before, after):
    old, new = copy.deepcopy(before), copy.deepcopy(after)
    old.pop('creative'); new.pop('creative')
    # A replacement creative owns a new generated unpublished post.
    # Preserve all event types, pixel and page tracking; compare only post IDs symbolically.
    post_ids = []
    for ad in [old, new]:
        ids = {v for t in ad.get('tracking_specs', []) for v in t.get('post', [])}
        assert len(ids) == 1
        post_ids.append(next(iter(ids)))
        for tracking in ad['tracking_specs']:
            if 'post' in tracking:
                assert len(tracking['post']) == 1
                tracking['post'] = ['CREATIVE_OWNED_POST']
        ad['tracking_specs'].sort(key=lambda t: json.dumps(t, sort_keys=True))
    assert old == new, 'Non-creative ad settings changed'
    return {'prior_post_id': post_ids[0], 'replacement_post_id': post_ids[1]}


def prove_video_copies(before, after, item, record):
    proof = {}
    old = {z['adlabels'][0]['name']: z for z in before['asset_feed_spec'].get('videos', [])}
    new = {z['adlabels'][0]['name']: z for z in after['asset_feed_spec'].get('videos', [])}
    assert set(old) == set(new)
    for label in old:
        old_id, new_id = old[label]['video_id'], new[label]['video_id']
        if old_id == new_id:
            continue
        infos, thumbnails = [], []
        for vid in [old_id, new_id]:
            info = {}
            for attempt in range(8):
                info = m.graph(vid, fields='id,status,length,source')
                if info['status']['video_status'] == 'ready':
                    break
                assert attempt < 7, 'Video processing did not finish'
                time.sleep(20)
            infos.append(info)
            th = m.graph(vid + '/thumbnails', fields='uri,is_preferred,width,height')
            preferred = [t for t in th['data'] if t.get('is_preferred')]
            assert len(preferred) == 1, 'Require exactly one preferred thumbnail'
            t = preferred[0]
            response = requests.get(t['uri'], timeout=90)
            response.raise_for_status()
            image = Image.open(io.BytesIO(response.content)).convert('RGB')
            assert image.size == (t['width'], t['height'])
            thumbnails.append({'video_id': vid, 'width': image.width, 'height': image.height,
                               'decoded_rgb_sha256': hashlib.sha256(image.tobytes()).hexdigest()})
        dimensions = (720, 1280 if label == 'vertical' else 900)
        assert all((t['width'], t['height']) == dimensions for t in thumbnails)
        assert infos[0]['length'] == infos[1]['length']
        assert thumbnails[0]['decoded_rgb_sha256'] == thumbnails[1]['decoded_rgb_sha256']
        proof[label] = {'prior_video_id': old_id, 'creative_video_id': new_id,
                        'upload_id': record['media'][label], 'ready': True,
                        'durations_identical': True, 'duration_seconds': infos[1]['length'],
                        'dimensions_identical': True, 'decoded_thumbnails_identical': True,
                        'thumbnail_mean_absolute_difference_0_255': 0, 'thumbnails': thumbnails,
                        'source_returned': [bool(i.get('source')) for i in infos],
                        'proof': 'Ready status, identical duration/dimensions and byte-identical decoded preferred thumbnails versus prior creative. Full remote-video byte equivalence is not claimed.'}
        item['video_copy_equivalence'] = proof
        m.save()
    return proof


def main(apply=False):
    m.preflight()
    change = m.A.setdefault('combined_copy_revision', {'records': {}})
    if 'parents_before' not in change:
        change['parents_before'] = m.parents()
        change['protected_before'] = {ad: m.call('get_ad', {'ad_id': ad, 'fields': m.AD_FIELDS}) for ad in [m.AY07, m.ORIGINAL]}
        change['protected_creatives_before'] = {ad: m.redact(m.call('get_creative', {'creative_id': v['creative']['id'], 'fields': m.CR_FIELDS})) for ad, v in change['protected_before'].items()}
        m.save()
    for name, (ad_id, old_id) in TARGETS.items():
        r = m.A['records'][name]
        x = next(c for c in m.COPIES if c['ad_name'] == name)
        assert x['primary_text'] == PRIMARY_TEXT
        assert x['headline'] == HEADLINE
        ad = m.call('get_ad', {'ad_id': ad_id, 'fields': m.AD_FIELDS})
        assert ad['name'] == name and ad['status'] == 'PAUSED'
        item = change['records'].setdefault(name, {})
        if 'before' not in item:
            assert ad['creative']['id'] == old_id and ad['effective_status'] == 'PAUSED'
            item['before'] = copy.deepcopy(r)
            item['ad_before'] = ad
            m.save()
        before = m.call('get_creative', {'creative_id': old_id, 'fields': m.CR_FIELDS})
        item['creative_before'] = m.redact(before)
        m.save()
        if not item.get('replacement_creative_id'):
            if not apply:
                print(name, 'copy revision pending; --apply required')
                continue
            assert ad['creative']['id'] == old_id
            request = payload(before)
            request['asset_feed_spec']['bodies'] = [{'text': PRIMARY_TEXT}]
            request['asset_feed_spec']['titles'] = [{'text': HEADLINE}]
            result = m.call('create_creative', dict(request, account_id=m.ACCOUNT))
            item['replacement_creative_id'] = result['id']
            m.save()
        new_id = item['replacement_creative_id']
        after = m.call('get_creative', {'creative_id': new_id, 'fields': m.CR_FIELDS})
        item['internal_creative_name_note'] = 'Meta auto-suffixed the new internal creative name. Exact-name restoration on AY09A was rejected as duplicate (1487229). Ad name is unchanged; historical creatives retained.'
        item['creative_readback'] = m.redact(after)
        m.save()
        proof = prove_video_copies(before, after, item, r)
        assert_copy_only(before, after, proof)
        candidate = copy.deepcopy(r)
        if proof:
            candidate['creative_media'] = {z['adlabels'][0]['name']: z['video_id'] for z in after['asset_feed_spec']['videos']}
            candidate.setdefault('video_copy_equivalence', {}).update(proof)
        m.validate_creative(after, x, candidate)
        if ad['creative']['id'] != new_id:
            assert ad['creative']['id'] == old_id and apply
            m.call('update_ad', {'ad_id': ad_id, 'creative_id': new_id, 'name': name, 'status': 'PAUSED'})
        candidate['creative_id'] = new_id
        candidate['creative_readback'] = m.redact(after)
        r.update(candidate)
        item['superseded_creative_id'] = old_id
        m.save()
        m.verify_ad(r, x, 8)
        item['generated_post_mapping'] = assert_ad_preserved(item['ad_before'], r['ad_readback'])
        item['ad_after'] = copy.deepcopy(r['ad_readback'])
        item['verified'] = True
        m.save()
    if not all(change['records'].get(n, {}).get('verified') for n in TARGETS):
        return
    m.verify()
    change['parents_after'] = m.parents()
    assert change['parents_before'] == change['parents_after']
    change['protected_after'] = {ad: m.call('get_ad', {'ad_id': ad, 'fields': m.AD_FIELDS}) for ad in change['protected_before']}
    change['protected_creatives_after'] = {ad: m.redact(m.call('get_creative', {'creative_id': v['creative']['id'], 'fields': m.CR_FIELDS})) for ad, v in change['protected_after'].items()}
    m.save()
    assert change['protected_before'] == change['protected_after']
    assert change['protected_creatives_before'] == change['protected_creatives_after']
    change['verified_at_utc'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    change['verified'] = True
    m.save()
    m.M['combined_copy_revision'] = {'primary_text': PRIMARY_TEXT,
        'headline': HEADLINE,
        'ad_ids': {n: ids[0] for n, ids in TARGETS.items()},
        'creative_ids': {n: change['records'][n]['replacement_creative_id'] for n in TARGETS},
        'evidence': 'meta-audit.json#combined_copy_revision'}
    m.write(m.PACK / 'manifest.json', m.M)
    print('Verified exact primary text/headline; protected ads/creatives and parents unchanged. Non-copy configuration preserved; generated creative/post IDs, internal name suffixes and proven video remaps recorded.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    main(parser.parse_args().apply)
