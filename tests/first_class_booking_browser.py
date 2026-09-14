"""Local-only browser acceptance. Requires Python Playwright + Chromium.
Run after scripts/build_vercel_site.py. All external network except read-only Google Fonts and all writes blocked.
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
            font_host = urlparse(request.url).hostname in {'fonts.googleapis.com', 'fonts.gstatic.com'}
            if request.method != 'GET' or (urlparse(request.url).netloc != urlparse(origin).netloc and not font_host):
                blocked.add(urlparse(request.url).hostname or 'unknown')
                route.abort()
            else:
                route.continue_()
        context.route('**/*', guard)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        for width in [390, 768, 1280, 1440]:
            page.set_viewport_size({'width': width, 'height': 900})
            page.goto(origin + '/thank-you/')
            page.evaluate('document.fonts.ready')
            page.wait_for_function('window.joaoConsentRegion !== undefined')
            consent_save = page.locator('.consent-save')
            if consent_save.is_visible():
                consent_save.click()
            page.locator('.thank-hero a[href="/thank-you/#first-class-options"]').click()
            page.wait_for_url('**/thank-you/#first-class-options')
            page.wait_for_function("document.querySelector('#first-class-options .eye').getBoundingClientRect().top >= document.querySelector('.header').getBoundingClientRect().bottom")
            assert page.locator('[data-booking-card]').count() == 5
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            assert page.locator('.thank-hero .lead').evaluate('(el) => getComputedStyle(el).textAlign') == 'center'
            rect = page.locator('.thank-hero .lead').bounding_box()
            assert abs(rect['x'] + rect['width']/2 - width/2) < 2
            for link in page.locator('[data-booking-link]').all():
                assert link.is_visible()
                assert link.get_attribute('href') is None
                assert link.get_attribute('aria-disabled') == 'true'
                assert link.text_content() == 'Book Your Class'
                assert link.evaluate('(el) => el.scrollWidth <= el.clientWidth + 1')
                assert link.evaluate('(el) => getComputedStyle(el).color') == 'rgb(16, 16, 16)'
                assert link.evaluate('(el) => getComputedStyle(el).backgroundColor') == 'rgb(245, 196, 0)'
                before = page.url
                link.dispatch_event('click')
                link.focus(); page.keyboard.press('Enter')
                assert page.url == before
            for card in page.locator('[data-booking-card]').all():
                assert card.locator('.booking-times').is_visible()
                assert 'paused for review' in card.locator('[data-booking-status]').inner_text()
            page.locator('.thank-followup').scroll_into_view_if_needed()
            assert page.locator('.thank-followup img').evaluate('(el) => el.complete && el.naturalWidth > 0')
            page.screenshot(path=str(EVIDENCE / f'thank-you-followup-{width}.png'))
            page.locator('[data-booking-card]').first.scroll_into_view_if_needed()
            page.screenshot(path=str(EVIDENCE / f'thank-you-booking-{width}.png'))
            page.evaluate("document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,0)")
            page.screenshot(path=str(EVIDENCE / f'thank-you-viewport-{width}.png'))
            page.screenshot(path=str(EVIDENCE / f'thank-you-{width}.png'), full_page=True)
            rows.append({'width': width, 'cards': 5, 'overflow': False, 'centered': True, 'booking_disabled': True})
        assert not errors, errors
        context.close()
        nojs = browser.new_context(java_script_enabled=False)
        nojs.route('**/*', guard)
        page = nojs.new_page()
        page.goto(origin + '/thank-you/')
        assert page.locator('[data-booking-card]').count() == 5
        assert all(link.get_attribute('href') is None for link in page.locator('[data-booking-link]').all())
        assert page.locator('.thank-followup a[href="mailto:joaocrusbjj@gmail.com"]').is_visible()
        assert page.locator('noscript').is_visible()
        browser.close()
finally:
    server.shutdown()

result = {'status': 'passed', 'viewports': rows, 'total_card_checks': sum(row['cards'] for row in rows), 'no_js_fallback': True, 'page_errors': [], 'external_hosts_blocked': sorted(blocked), 'writes_allowed': False}
(EVIDENCE / 'results.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
