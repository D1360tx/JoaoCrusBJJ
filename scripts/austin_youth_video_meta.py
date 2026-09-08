"""AY09 read-only evidence refresh. Never creates or changes Meta objects."""
from pathlib import Path
import argparse
import datetime
import json
import subprocess
import time

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / 'assets/meta/castle-hill/youth-wave-2/video'
AUDIT = PACK / 'meta-audit.json'
AD = '120251261045730072'
CREATIVE = '1107882611663240'


def call(tool, args):
    assert tool in {'get_ad', 'get_creative', 'get_campaign', 'get_adset'}
    result = subprocess.run([
        'npx', '--yes', 'mcporter', 'call', '--stdio',
        '/home/d1360/.hermes/mcp/meta-ads-mcp/run-hermes.sh', tool,
        '--args', json.dumps(args), '--output', 'json',
    ], capture_output=True, text=True, check=True, timeout=120)
    value = json.loads(result.stdout)
    private = Path('/home/d1360/.cache/joao-ay09')
    private.mkdir(parents=True, exist_ok=True, mode=0o700)
    target = private / (datetime.datetime.now().strftime('%Y%m%d%H%M%S%f') + '-' + tool + '.json')
    target.write_text(json.dumps(value))
    target.chmod(0o600)
    assert 'error' not in value, value
    return value


def refresh(attempts=1, interval=30):
    audit = json.loads(AUDIT.read_text()) if AUDIT.exists() else {'ad_polls': []}
    creative = call('get_creative', {'creative_id': CREATIVE, 'fields': 'id,name,object_story_spec,asset_feed_spec,degrees_of_freedom_spec,url_tags'})
    # Exact values retained except expiring signed thumbnail URLs, private above.
    for video in creative['asset_feed_spec']['videos']:
        video.pop('thumbnail_url', None)
    audit['creative_readback'] = creative
    audit['redactions'] = ['asset_feed_spec.videos[*].thumbnail_url (expiring signed URLs; raw response private)']
    def save():
        AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
    save()
    for attempt in range(attempts):
        ad = call('get_ad', {'ad_id': AD, 'fields': 'id,name,account_id,adset_id,campaign_id,status,effective_status,creative,tracking_specs,issues_info,recommendations,updated_time'})
        audit['ad_readback'] = ad
        audit['ad_polls'].append({'readback_at_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'ad_readback': ad})
        audit['effective_paused_gate_passed'] = ad['status'] == ad['effective_status'] == 'PAUSED'
        save()
        print(ad['id'], ad['status'], ad['effective_status'], flush=True)
        if audit['effective_paused_gate_passed']:
            break
        assert ad['status'] == 'PAUSED', 'Configured paused gate failed'
        if attempt + 1 < attempts:
            time.sleep(interval)
    audit['parents_readback'] = {
        'campaign': call('get_campaign', {'campaign_id': '120251246135250072'}),
        'adset': call('get_adset', {'adset_id': '120251246144560072', 'fields': 'id,name,campaign_id,status,effective_status,targeting,destination_type,promoted_object,optimization_goal,daily_budget,lifetime_budget'}),
    }
    audit['readback_at_utc'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    save()
    return audit


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--attempts', type=int, default=1)
    parser.add_argument('--interval', type=int, default=30)
    parser.add_argument('--strict', action='store_true')
    args = parser.parse_args()
    assert 1 <= args.attempts <= 20 and args.interval >= 0
    refresh(args.attempts, args.interval)
    if args.strict:
        from validate_austin_youth_video import validate
        validate()
        print('AY09 strict asset, placement, opt-out and PAUSED checks PASS')
