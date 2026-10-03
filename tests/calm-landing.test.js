const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const pages = {
  adults: { file: 'site/campaign/adults-first-class.html', source: 'meta-adults-paid', path: 'adult', route: '/adults-first-class/' },
  youth: { file: 'site/campaign/youth-first-class.html', source: 'meta-youth-paid', path: 'child', route: '/youth-first-class/' }
};
const quiz = read('site/assets/program-fit-quiz.js');
const endpoint = read('deploy/bluehost/api/lead.php');
const manifest = JSON.parse(read('site/campaign/seo-pages.json'));

for (const [name, spec] of Object.entries(pages)) {
  const html = read(spec.file);

  test(`${name} CALM page is a noindex paid landing page with a canonical route`, () => {
    assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://joaocrusbjj.com${spec.route}">`));
    const entry = manifest.pages.find((page) => page.file === path.basename(spec.file));
    assert.ok(entry, 'registered in seo-pages.json');
    assert.equal(entry.path, spec.route);
    assert.equal(entry.indexable, false);
  });

  test(`${name} CTAs enter the quiz with an allowlisted source and unique placements`, () => {
    const hrefs = [...html.matchAll(/href="([^"]+)"[^>]*data-kids-quiz/g)].map((m) => m[1].replaceAll('&amp;', '&'));
    assert.equal(hrefs.length, 5);
    const placements = new Set();
    for (const href of hrefs) {
      const url = new URL(href, 'https://joaocrusbjj.com/campaign/');
      assert.equal(url.pathname, '/campaign/program-fit-quiz.html');
      assert.equal(url.searchParams.get('source'), spec.source);
      assert.equal(url.searchParams.get('path'), spec.path);
      assert.equal(url.searchParams.get('embed'), '1');
      assert.equal(url.searchParams.get('start'), 'quiz');
      placements.add(url.searchParams.get('placement'));
    }
    assert.deepEqual([...placements].sort(), ['final', 'header', 'hero', 'locations', 'mobile']);
    assert.match(quiz, new RegExp(`'${spec.source}'`));
    assert.match(endpoint, new RegExp(`'${spec.source}'`));
    assert.match(read('scripts/build_vercel_site.py'), new RegExp(`'${spec.source}'`), 'GTM URL sanitizer keeps the source');
  });

  test(`${name} copy follows the CALM doctrine claim rules`, () => {
    const text = html.replace(/<[^>]+>/g, ' ');
    for (const pillar of ['CONTROL.', 'AWARENESS.', 'LIMITS.', 'MOVEMENT.']) assert.ok(text.includes(pillar), pillar);
    assert.match(text, /CALM Method/);
    assert.doesNotMatch(html, /—/, 'no em dashes');
    assert.doesNotMatch(text, /personally calls|does not book a class automatically/i, 'current booking-link flow');
    assert.doesNotMatch(text, /\bconsent\b|\bdestroy\b|\bdominate\b|\bwarrior\b/i, 'banned words');
    assert.doesNotMatch(text, /\byou will\b|\bguarantee/i, 'no promised outcomes');
    assert.match(text, /Dripping Springs/);
    assert.match(text, /Austin/);
    assert.match(html, /href="tel:\+15126444560"/);
  });
}

test('main quiz recommends the Austin adult group instead of forcing private coaching', () => {
  assert.doesNotMatch(quiz, /answers\.location === 'austin' \|\| answers\.stage === 'competition'/);
  assert.match(quiz, /Austin · Tue\/Thu 6:00–7:00 p\.m\./);
  assert.doesNotMatch(endpoint, /\|\| \$lead\['preferred_location'\] === 'austin'\n/);
});
