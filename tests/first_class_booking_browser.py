"""Local-only browser acceptance. Requires Python Playwright + Chromium.
Run after scripts/build_vercel_site.py. All non-local network and all writes blocked.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse
import json
import os

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = Path(os.environ.get('BOOKING_QA_EVIDENCE', '/tmp/joao-booking-qa'))
EVIDENCE.mkdir(parents=True, exist_ok=True)

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT / 'dist')))
Thread(target=server.serve_forever, daemon=True).start()
origin = 'http://127.0.0.1:' + str(server.server_port)
rows = []
blocked = set()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        def guard(route):
            request = route.request
            if request.method != 'GET' or urlparse(request.url).netloc != urlparse(origin).netloc:
                blocked.add(urlparse(request.url).hostname or 'unknown')
                route.abort()
            else:
                route.continue_()
        context.route('**/*', guard)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        for width in [390, 768, 1280]:
            page.set_viewport_size({'width': width, 'height': 900})
            page.goto(origin + '/thank-you/')
            page.wait_for_function('window.joaoConsentRegion !== undefined')
            consent_save = page.locator('.consent-save')
            if consent_save.is_visible():
                consent_save.click()
            page.locator('a[href="/thank-you/#first-class-options"]').click()
            page.wait_for_url('**/thank-you/#first-class-options')
            programs = page.locator('[data-booking-program] option').evaluate_all('(xs) => xs.map(x => x.value)')
            locations = page.locator('[data-booking-location] option').evaluate_all('(xs) => xs.map(x => x.value)')
            combinations = 0
            for program in programs:
                for location in locations:
                    page.locator('[data-booking-program]').select_option(program)
                    page.locator('[data-booking-location]').select_option(location)
                    assert page.locator('[data-booking-link]').get_attribute('href') == 'mailto:joaocrusbjj@gmail.com'
                    assert 'not open' in page.locator('[data-booking-status]').inner_text()
                    combinations += 1
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            assert page.locator('[data-booking-link]').is_visible()
            assert page.locator('[data-booking-link]').evaluate('(el) => el.scrollWidth <= el.clientWidth + 1')
            page.locator('#first-class-title').scroll_into_view_if_needed()
            page.screenshot(path=str(EVIDENCE / f'thank-you-viewport-{width}.png'))
            page.screenshot(path=str(EVIDENCE / f'thank-you-{width}.png'), full_page=True)
            rows.append({'width': width, 'combinations': combinations, 'overflow': False, 'fallback': 'mailto', 'anchor': page.url.split(origin)[1:]})
        assert not errors, errors
        context.close()
        nojs = browser.new_context(java_script_enabled=False)
        nojs.route('**/*', guard)
        page = nojs.new_page()
        page.goto(origin + '/thank-you/')
        assert page.locator('[data-booking-link]').get_attribute('href') == 'mailto:joaocrusbjj@gmail.com'
        assert page.locator('noscript').is_visible()
        browser.close()
finally:
    server.shutdown()

result = {'status': 'passed', 'viewports': rows, 'total_selection_checks': sum(row['combinations'] for row in rows), 'no_js_fallback': True, 'page_errors': [], 'external_hosts_blocked': sorted(blocked), 'writes_allowed': False}
(EVIDENCE / 'results.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
