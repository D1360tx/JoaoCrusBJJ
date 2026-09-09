#!/usr/bin/env python3
"""Rejection-only live diagnostics. Never sends identity or valid lead data."""
import json
import urllib.request
import urllib.error

URL = 'https://joaocrusbjj.com/api/lead.php'
ORIGIN = 'https://joaocrusbjj.com'
WINDOWS_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
LINUX_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'


def main():
    cases = [
        ('empty', '{}', 400, 'Invalid form.', {}),
        ('malformed', '{', 400, 'Invalid JSON request.', {}),
        ('wrong_origin', '{}', 403, 'Request origin is not allowed.', {'Origin': 'https://example.invalid'}),
        ('wrong_content_type', '{}', 415, 'JSON is required.', {'Content-Type': 'text/plain'}),
        ('get', None, 405, 'Method not allowed.', {}),
        ('invalid_request_id', '{"form_id":"contact_page","request_id":"!"}', 400, 'Invalid request identifier.', {}),
        ('honeypot', '{"website":"rejection-only"}', 202, None, {}),
        ('linux_empty', '{}', 400, 'Invalid form.', {'User-Agent': LINUX_UA}),
    ]
    results = []
    for name, body, expected, error, overrides in cases:
        headers = {'Origin': ORIGIN, 'Referer': ORIGIN + '/austin-program-finder/quiz/',
                   'Content-Type': 'application/json', 'User-Agent': WINDOWS_UA}
        headers.update(overrides)
        request = urllib.request.Request(URL, data=body.encode() if body is not None else None, headers=headers)
        try:
            response = urllib.request.urlopen(request, timeout=30)
        except urllib.error.HTTPError as exc:
            response = exc
        raw = response.read().decode()
        try:
            payload = json.loads(raw)
        except ValueError:
            payload = None
        passed = response.status == expected and isinstance(payload, dict) and payload.get('accepted') is False
        if error is not None:
            passed = passed and isinstance(payload, dict) and payload.get('error') == error
        results.append({'case': name, 'status': response.status, 'json': payload,
                        'modsecurity': 'Mod_Security' in raw, 'pass': passed})
    print(json.dumps(results, indent=2))
    return 0 if all(row['pass'] for row in results) else 1


if __name__ == '__main__':
    raise SystemExit(main())
