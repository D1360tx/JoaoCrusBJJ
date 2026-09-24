"""One manifest-scoped, build-time navbar contract; no runtime HTML injection."""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = '<!-- SHARED_MAIN_NAVBAR -->'
PATTERN = r'<header class="jc-main-header" data-main-navbar>.*?</header>'

def render_navbar(route):
    html = (ROOT / 'site/campaign/components/main-navbar.html').read_text().strip()
    expected = ['/', '/training-programs/', '/kids-program/', '/little-champions/', '/youth-bjj/', '/teens/', '/adults-program/', '/jiu-jitsu-after-60/', '/private-bjj-lessons/', '/team-building/', '/classes-schedule/', '/locations/', '/about/', '/resources/', '/coaches/', '/contact/']
    assert re.findall(r'href="([^"]+)"', html) == expected, 'Shared navbar link order/destinations changed'
    assert '<summary>Programs</summary>' in html
    assert re.findall(r'>\s*(Schedule|Locations|About|Resources|Coaches|Plan a first class)\s*</a', html) == ['Schedule', 'Locations', 'About', 'Resources', 'Coaches', 'Plan a first class']
    assert 'aria-current' not in html, 'Active state belongs to the renderer'
    # Only exact destinations claim aria-current=page. Parent Guide and Pressure
    # have no exact global destination and intentionally claim no current page.
    html = html.replace(f'href="{route}"', f'href="{route}" aria-current="page"')
    return html

def navbar_assets():
    tags = []
    for ext in ('css', 'js'):
        filename = f'main-navbar.{ext}'
        digest = hashlib.sha256((ROOT / 'site/assets' / filename).read_bytes()).hexdigest()[:12]
        url = f'/assets/{filename}?v={digest}'
        tags.append(f'<link rel="stylesheet" href="{url}">' if ext == 'css' else f'<script src="{url}" defer></script>')
    return '\n'.join(tags)

def apply_navbar(html, page):
    if page.get('indexable', True) is False:
        if MARKER in html:
            raise ValueError(f'Navbar marker on excluded route: {page["path"]}')
        return html
    if html.count(MARKER) != 1:
        raise ValueError(f'Expected one shared navbar marker: {page["path"]}')
    html = html.replace(MARKER, render_navbar(page['path']))
    # Append after page styles and existing script placement to avoid changing
    # attribution bootstrap insertion order on pages with no existing JS.
    return html.replace('</head>', navbar_assets() + '\n</head>', 1)

def validate_navbar(html, page):
    matches = re.findall(PATTERN, html, re.S)
    if not page.get('indexable', True):
        assert not matches, f'{page["path"]}: excluded route has shared navbar'
        return
    assert matches == [render_navbar(page['path'])], f'{page["path"]}: navbar missing, duplicated, divergent, or wrong active state'
    assert html.count('data-main-navbar') == 1
    assert MARKER not in html
    assert not re.search(r'<header\b[^>]*class="(?:header|program-global-header|jr-header)"', html), f'{page["path"]}: divergent header survives'
    assert not re.search(r'<nav\b[^>]*class="(?:nav|program-global-links)"', html), f'{page["path"]}: divergent nav survives'
    for tag in navbar_assets().splitlines():
        assert html.count(tag) == 1, f'{page["path"]}: missing/duplicate navbar asset'
