const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'site/campaign/joao-projects-draft.html'), 'utf8');
const expected = [
  ['https://grapplewithemotions.com/', 'available'],
  ['https://jiu-jitsuclasses.online/courses/', 'available'],
  ['https://blueprint.justjiuit.com/', 'unavailable'],
  ['https://boundaryguard.joaocrusbjj.com/', 'available'],
  ['https://blackbeltparenting.net/', 'available'],
];
const cards = [...html.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/g)];
test('exactly five ordered project URLs and availability states', () => {
  assert.equal(cards.length, 5);
  cards.forEach(([_, attrs, body], index) => {
    assert.ok(attrs.includes(`data-project-url="${expected[index][0]}"`));
    assert.ok(attrs.includes(`data-status="${expected[index][1]}"`));
    assert.ok(body.includes(`0${index + 1}`));
    assert.match(body, /<h2\b/);
    assert.match(body, /class="jp-tags"/);
  });
});
test('preview-only semantics and no scripts, forms or embeds', () => {
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /Draft Preview/);
  assert.doesNotMatch(html, /<(script|form|iframe)\b|rel="canonical"|—/i);
});
test('four precise external CTAs are safe new-tab links', () => {
  const links = [...html.matchAll(/<a\b([^>]*href="https:[^"]*"[^>]*)>/g)];
  assert.equal(links.length, 4);
  links.forEach(([_, attrs], i) => {
    assert.ok(attrs.includes(`href="${expected.filter(x => x[1] === 'available')[i][0]}"`));
    assert.match(attrs, /target="_blank"/);
    assert.match(attrs, /rel="noopener noreferrer external"/);
  });
});
test('Blueprint is a non-interactive unavailable state, not invented content', () => {
  const blueprint = cards[2][2];
  assert.doesNotMatch(blueprint, /<a\b|<img\b/);
  assert.match(blueprint, /<button[^>]*disabled/);
  assert.match(blueprint, /Website unavailable/);
  assert.match(blueprint, /Site not found/);
  assert.match(blueprint, /details have not been verified/);
});
test('no bare/hash placeholder links; local destinations and images exist', () => {
  for (const [, attr, value] of html.matchAll(/\b(href|src)="([^"]*)"/g)) {
    assert.ok(value && !value.startsWith('#'), `${attr}: ${value}`);
    if (value.startsWith('https:')) continue;
    const [file, hash] = value.split('#');
    const dest = path.resolve(root, 'site/campaign', file);
    assert.ok(fs.existsSync(dest), dest);
    if (hash) assert.ok(fs.readFileSync(dest, 'utf8').includes(`id="${hash}"`));
  }
  const images = [...html.matchAll(/<img\b([^>]*)>/g)];
  assert.equal(images.length, 5);
  for (const [, attrs] of images) {
    assert.match(attrs, /width="\d+"/); assert.match(attrs, /height="\d+"/); assert.match(attrs, /alt="[^"]*"/);
  }
});
test('draft is not promoted into production discovery', () => {
  const manifest = fs.readFileSync(path.join(root, 'site/campaign/seo-pages.json'), 'utf8');
  assert.ok(!manifest.includes('joao-projects-draft'));
  for (const file of fs.readdirSync(path.join(root, 'site/campaign')).filter(x => x.endsWith('.html') && x !== 'joao-projects-draft.html')) {
    assert.ok(!fs.readFileSync(path.join(root, 'site/campaign', file), 'utf8').includes('joao-projects-draft'), file);
  }
});
