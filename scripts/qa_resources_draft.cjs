/* Local-only browser QA. Dependencies may live outside the repository.
 * NODE_PATH=/path/to/node_modules node scripts/qa_joao_projects_draft.cjs
 * Start: python3 -m http.server 8769 --bind 127.0.0.1 --directory site
 */
const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const url = process.env.QA_URL || 'http://127.0.0.1:8769/campaign/resources-draft.html';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(url).hostname), 'QA must use localhost');
const output = process.env.QA_OUTPUT || '/tmp/resources-draft-qa';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const width of [390, 768, 1280, 1440, 1920]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [], failed = [], external = [], responses = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('requestfailed', request => failed.push(request.url()));
      page.on('response', response => { if (response.status() >= 400) responses.push([response.url(), response.status()]); });
      // No remote request or tracking is allowed during rendering or CTA checks.
      await context.route('**/*', route => {
        if (new URL(route.request().url()).origin !== new URL(url).origin) {
          external.push(route.request().url());
          return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Intercepted external navigation</title>' });
        }
        return route.continue();
      });
      assert.equal((await page.goto(url)).status(), 200);
      await page.evaluate(() => document.fonts.ready);
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(el => el.decode());
      }
      const geometry = await page.evaluate(() => {
        const headingLines = [...document.querySelectorAll('h1,h2')].map(el => {
          const lines = new Map();
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            for (const match of node.textContent.matchAll(/\S+/g)) {
              const range = document.createRange();
              range.setStart(node, match.index); range.setEnd(node, match.index + match[0].length);
              const r = range.getBoundingClientRect(), key = Math.round(r.top);
              lines.set(key, [...(lines.get(key) || []), match[0]]);
            }
          }
          return { title: el.textContent.trim(), lines: [...lines.values()] };
        });
        const clipped = [...document.querySelectorAll('h1,h2,.jr-button,.jr-browser,.jr-blueprint-word')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent.trim());
        return {
          width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
          headingLines, clipped,
          rows: [...document.querySelectorAll('.jr-project')].map(el => {
            const rect = node => { const r = node.getBoundingClientRect(); return { x:r.x, y:r.y, right:r.right, bottom:r.bottom, width:r.width, height:r.height }; };
            const preview = el.querySelector('.jr-preview'), copy = el.querySelector('.jr-project-copy');
            return { preview:rect(preview), copy:rect(copy), cta:rect(copy.querySelector('a')), previewFirst:el.firstElementChild === preview, previewFocusable:preview.querySelectorAll('a,button,input,[tabindex]').length };
          }),
          images: [...document.images].map(img => ({ loaded: img.complete && img.naturalWidth > 0, src: img.getAttribute('src') })),
          buttons: [...document.querySelectorAll('a.jr-button')].map(el => ({ foreground: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor, height: el.getBoundingClientRect().height })),
          fontsReady: document.fonts.check('16px "JP Space"') && document.fonts.check('40px "JP Anton"'),
        };
      });
      assert.equal(geometry.rows.length, 5);
      geometry.rows.forEach(({ preview, copy, cta, previewFirst, previewFocusable }, index) => {
        assert.ok(previewFirst, 'Stable preview-first DOM');
        assert.equal(previewFocusable, 0, 'Repositioned media has no tab stops');
        assert.ok(cta.width > 0 && cta.height >= 44 && cta.x >= copy.x && cta.right <= copy.right + 1 && cta.bottom <= copy.bottom + 1, 'CTA contained and visible');
        if (width <= 920) {
          assert.ok(preview.bottom < copy.y, 'Mobile preview above content');
          assert.ok(Math.abs(preview.x - copy.x) < 1 && Math.abs(preview.width - copy.width) < 1, 'Stable single-column stack');
        } else {
          const [left, right] = index % 2 === 0 ? [preview, copy] : [copy, preview];
          assert.ok(left.right < right.x, `Desktop alternation row ${index + 1}`);
          assert.ok(Math.abs((preview.y + preview.height / 2) - (copy.y + copy.height / 2)) < 1, 'Panels share a centered row');
        }
      });
      assert.ok(geometry.scrollWidth <= width, JSON.stringify(geometry));
      assert.deepEqual(geometry.clipped, []);
      assert.ok(geometry.images.every(image => image.loaded));
      assert.ok(geometry.fontsReady);
      for (const heading of geometry.headingLines) {
        if (heading.title === 'Blueprint') continue; // Intentional one-word project name.
        assert.ok(heading.lines.every(line => line.length > 1), `Heading orphan at ${width}: ${JSON.stringify(heading)}`);
      }
      geometry.buttons.forEach(button => {
        assert.equal(button.foreground, 'rgb(16, 16, 16)');
        assert.equal(button.background, 'rgb(245, 196, 0)');
        assert.ok(button.height >= 44);
      });
      assert.deepEqual(external, [], 'No external requests during render');
      const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(accessibility.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })), []);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `draft-${width}-top.png`) });
      await page.screenshot({ path: path.join(output, `draft-${width}-full.png`), fullPage: true });
      for (const [index, article] of (await page.locator('article').all()).entries()) {
        await article.evaluate(el => el.scrollIntoView({ block: 'start' }));
        await page.screenshot({ path: path.join(output, `draft-${width}-project-${index + 1}.png`) });
      }
      await page.locator('.jr-footer').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `draft-${width}-bottom.png`) });
      await page.locator('.jr-closing a').click();
      assert.equal(new URL(page.url()).hash, '#resources');
      assert.ok(Math.abs(await page.locator('#resources').evaluate(el => el.getBoundingClientRect().top)) <= 2);
      await page.locator('.jr-hero .jr-button').click();
      assert.equal(new URL(page.url()).hash, '#resources');
      await page.goto(url); await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.className), 'jr-skip');
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#main');
      // Traverse naturally, rather than focusing each CTA and hiding tab-order bugs.
      await page.locator('.jr-hero .jr-button').focus();
      for (const link of await page.locator('article a').all()) {
        await page.keyboard.press('Tab');
        assert.ok(await link.evaluate(el => el === document.activeElement));
        const expected = await link.getAttribute('href');
        const popupEvent = context.waitForEvent('page');
        await link.focus(); await page.keyboard.press('Enter');
        const popup = await popupEvent;
        await popup.waitForLoadState();
        assert.equal(popup.url(), expected);
        assert.equal(await popup.evaluate(() => window.opener), null);
        await popup.close();
      }
      assert.equal(external.length, 5, 'Only the five intercepted CTA navigations');
      assert.deepEqual(errors, []); assert.deepEqual(failed, []); assert.deepEqual(responses, []);
      results.push({ width, geometry, axeViolations: 0, consoleErrors: errors, failedRequests: failed, httpErrors: responses, interceptedCTAs: external, screenshots: 8, interactions: 'skip, hero, return, 5 keyboard new-tab CTAs passed' });
      fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(results, null, 2));
      console.log(`PASS ${width}px: geometry, headings, images, fonts, contrast, axe, links, keyboard, 8 screenshots`);
      await context.close();
    }
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
    const page = await context.newPage(); await page.goto(url);
    assert.equal(await page.locator('article').count(), 5);
    assert.equal(await page.locator('article a').count(), 5);
    console.log('PASS no-JavaScript fallback: 5 resources, 5 links');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
