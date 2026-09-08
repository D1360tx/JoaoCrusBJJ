"""Offline strict AY09 artifact and saved Meta-evidence validator."""
from pathlib import Path
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / 'assets/meta/castle-hill/youth-wave-2/video'
VIDEOS = {'vertical': '1824100178577845', 'feed': '2134875450753413'}
FILES = {
    'AY09_BEGINNERS-WELCOME_VIDEO_9x16.mp4', 'AY09_BEGINNERS-WELCOME_VIDEO_4x5.mp4',
    'AY09-captions.ass', 'AY09-captions-4x5.ass',
    'AY09-contact-sheet-final.jpg', 'AY09-contact-sheet-4x5.jpg',
}


def load(path):
    return json.loads(path.read_text())


def validate_meta(audit, copy):
    ad = audit['ad_readback']
    creative = audit['creative_readback']
    spec = creative['asset_feed_spec']
    assert ad['id'] == '120251261045730072'
    assert ad['creative']['id'] == creative['id'] == '1107882611663240'
    assert ad['account_id'] == '456685748412595'
    assert ad['campaign_id'] == '120251246135250072'
    assert ad['adset_id'] == '120251246144560072'
    assert ad['name'] == copy['meta_ad_name'] == 'AY09_BEGINNERS-WELCOME_VIDEO | PAUSED DRAFT | 2026-09-08'
    assert ad['status'] == ad['effective_status'] == 'PAUSED'
    assert audit['effective_paused_gate_passed'] is True
    assert not ad.get('issues_info')
    assert creative['object_story_spec'] == {'page_id': '977808342257807', 'instagram_user_id': '17841402345785819'}
    for key, field in [('bodies', 'primary_text'), ('titles', 'headline'), ('descriptions', 'description')]:
        assert spec[key] == [{'text': copy[field]}]
    assert spec['link_urls'] == [{'website_url': copy['destination_url']}]
    assert copy['destination_url'] == 'https://joaocrusbjj.com/castle-hill-grand-opening/?utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content=AY09_BEGINNERS-WELCOME_VIDEO&utm_term={{adset.name}}&utm_id={{campaign.id}}'
    assert spec['optimization_type'] == 'PLACEMENT'
    assert spec['ad_formats'] == ['SINGLE_VIDEO']
    assert spec['call_to_action_types'] == [copy['cta']] == ['LEARN_MORE']
    assert len(spec['videos']) == 2
    labels = {}
    label_ids = {}
    for video in spec['videos']:
        assert len(video['adlabels']) == 1
        label = video['adlabels'][0]
        assert label['name'] not in labels
        labels[label['name']] = video['video_id']
        label_ids[label['name']] = label['id']
    assert labels == VIDEOS
    assert not spec.get('images')
    rules = sorted(spec['asset_customization_rules'], key=lambda rule: rule['priority'])
    assert [rule['priority'] for rule in rules] == [1, 2]
    assert [rule['video_label']['name'] for rule in rules] == ['vertical', 'feed']
    for rule in rules:
        assert rule['video_label']['id'] == label_ids[rule['video_label']['name']]
    assert rules[0]['customization_spec'] == {
        'age_min': 13, 'age_max': 65, 'publisher_platforms': ['facebook', 'instagram'],
        'facebook_positions': ['story', 'facebook_reels'], 'instagram_positions': ['story', 'reels'],
    }
    assert rules[1]['customization_spec'] == {'age_min': 13, 'age_max': 65}
    assert spec['additional_data'] == {'multi_share_end_card': False, 'is_click_to_message': False}
    assert spec['reasons_to_shop'] is False and spec['shops_bundle'] is False
    features = creative['degrees_of_freedom_spec']['creative_features_spec']
    baseline = load(ROOT / 'assets/meta/castle-hill/safe-wave-1/meta-audit.json')['records'][0]['creative_readback']['degrees_of_freedom_spec']['creative_features_spec']
    assert features == baseline and len(features) == 83
    assert all(value['enroll_status'] == 'OPT_OUT' for value in features.values())
    assert not creative.get('url_tags')
    assert 'lead_gen_form_id' not in json.dumps(creative)
    assert any(value.get('action.type') == ['offsite_conversion'] and value.get('fb_pixel') == ['592714768141415'] for value in ad['tracking_specs'])
    previous = load(PACK.parent / 'meta-audit.json')['after']
    current = audit['parents_readback']
    for parent in current.values():
        assert parent['status'] == parent['effective_status'] == 'PAUSED'
    assert current['campaign']['id'] == ad['campaign_id']
    for key in ['daily_budget', 'lifetime_budget', 'bid_strategy']:
        assert current['campaign'].get(key) == previous['campaign'].get(key)
    assert current['campaign']['daily_budget'] == '3500'
    assert current['adset'] == previous['adset']
    assert current['adset']['destination_type'] == 'WEBSITE'
    assert current['adset']['promoted_object'] == {'pixel_id': '592714768141415', 'custom_event_type': 'LEAD', 'smart_pse_enabled': False}
    assert current['adset']['optimization_goal'] == 'OFFSITE_CONVERSIONS'
    assert audit['ad_polls'][-1]['ad_readback'] == ad


def validate_assets():
    manifest = load(PACK / 'manifest.json')
    assert manifest['status'] == 'PAUSED DRAFT'
    assert len(manifest['activation_gates']) == 3
    assert 'paid-media permission' in manifest['activation_gates'][0]
    assert manifest['source']['people'] == 'Joao only; no students'
    assert manifest['creative_video_ids'] == VIDEOS
    assert manifest['source_uploads']['vertical']['id'] == '1105203821964858'
    assert manifest['source_uploads']['feed']['id'] == '1576133854006081'
    assert len(manifest['files']) == 6
    assert {file['filename'] for file in manifest['files']} == FILES
    assert {path.name for path in PACK.iterdir() if path.suffix in {'.mp4', '.ass', '.jpg', '.png'}} == FILES
    for file in manifest['files']:
        path = PACK / file['filename']
        assert path.stat().st_size == file['bytes']
        assert hashlib.sha256(path.read_bytes()).hexdigest() == file['sha256']
        if path.suffix == '.mp4':
            actual = json.loads(subprocess.check_output([
                'ffprobe', '-v', 'error', '-show_entries',
                'stream=codec_type,codec_name,width,height:format=duration', '-of', 'json', str(path),
            ]))
            assert actual['streams'] == file['ffprobe']['streams']
            assert len(actual['streams']) == 2
            video, audio = actual['streams']
            assert (video['codec_name'], audio['codec_name']) == ('h264', 'aac')
            assert (video['width'], video['height']) == (720, 1280 if '9x16' in path.name else 900)
            assert abs(float(actual['format']['duration']) - 16.607) < 0.002
            # Decode every frame/audio packet, not only container metadata.
            subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(path), '-f', 'null', '-'], check=True, capture_output=True)
        elif path.suffix == '.ass':
            text = path.read_text()
            assert '[Events]' in text and 'Dialogue:' in text
        else:
            from PIL import Image
            with Image.open(path) as image:
                image.verify()


def validate():
    validate_assets()
    validate_meta(load(PACK / 'meta-audit.json'), load(PACK / 'approved-copy.json'))


if __name__ == '__main__':
    validate()
    print('AY09 strict validation PASS: six hashed artifacts, full decode, exact Meta contract and 83 opt-outs')
