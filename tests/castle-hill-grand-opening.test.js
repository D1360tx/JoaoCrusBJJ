const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
const page = read('site/campaign/castle-hill-grand-opening.html');
const quiz = read('site/campaign/austin-program-fit-quiz.html');
const manifest = JSON.parse(read('site/campaign/seo-pages.json'));

test('grand opening is manifest-driven, isolated, noindex and date-gated', () => {
  const entry = manifest.pages.find(p => p.file === 'castle-hill-grand-opening.html');
  assert.equal(entry.path, '/castle-hill-grand-opening/');
  assert.equal(entry.indexable, false);
  assert.match(page, /noindex,nofollow/);
  assert.match(page, /Opening September 14/);
  assert.match(page, /Opening date pending confirmation/);
  assert.match(read('CURRENT-DECISIONS.md'), /provisional/);
  assert.match(page, /castle-hill-grand-opening.css/);
  assert.doesNotMatch(page, /—/);
});
test('all five CTAs start at child/adult decision using existing strict source', () => {
  const links = [...page.matchAll(/href="([^"]+)"[^>]*data-austin-quiz/g)];
  assert.equal(links.length, 5);
  const placements = new Set();
  for (const [, href] of links) {
    const url = new URL(href.replaceAll('&amp;', '&'), 'https://example.test/');
    assert.equal(url.pathname, '/austin-program-fit-quiz.html');
    assert.equal(url.searchParams.get('source'), 'austin-program-fit');
    assert.equal(url.searchParams.get('path'), null);
    assert.equal(url.searchParams.get('start'), 'quiz');
    placements.add(url.searchParams.get('placement'));
  }
  assert.equal(placements.size, 5);
  assert.match(read('deploy/bluehost/api/lead.php'), /'austin-program-fit'/);
});
test('both programs and honest local imagery are present without new claims', () => {
  for (const text of ['Youth ages 8–12', 'Tue/Thu 5:00–5:45 p.m.', 'Tue/Thu 6:00–7:00 p.m.', 'private lessons', 'by appointment', 'Castle Hill Fitness Downtown', 'joao-crus-coach-headshot.webp']) assert.ok(page.includes(text), text);
  assert.match(page, /data-default-program="all" data-default-location="austin"/);
  assert.doesNotMatch(page, /Led by Joao|guaranteed|\$\d|five.star/i);
  assert.match(page, /mk-footer__inner bottom/);
});
test('approved photos sit between program labels and headings', () => {
  assert.match(page, /Jiu-jitsu at Castle Hill Fitness/);
  for (const [label, asset, width, height] of [
    ['Youth ages 8–12', 'castle-hill-youth-group-20260907.webp', 867, 672],
    ['Adults', 'castle-hill-adults-coaching-20260907.webp', 1280, 960],
  ]) {
    assert.ok(page.includes(`<p class="mk-eye">${label}</p><img class="castle-program-photo" src="../assets/${asset}" width="${width}" height="${height}" loading="lazy" alt="`));
    assert.ok(fs.existsSync(path.resolve(__dirname, '../site/assets', asset)));
  }
  assert.equal((page.match(/class="castle-program-photo"[^>]+><h3>/g) || []).length, 2);
  assert.equal(manifest.pages.find(p => p.file === 'castle-hill-grand-opening.html').image, '/assets/castle-hill-multisport-room-20260907.webp');
});
test('Austin shared calendar places 5 PM Youth before 6 PM Adults on both days', () => {
  const source = read('site/assets/class-calendar.js');
  const records = require('node:vm').runInNewContext(source.match(/var CLASSES = (\[[\s\S]*?\n  \]);/)[1]);
  assert.equal(records.length, 15);
  for (const day of [1, 3]) assert.deepEqual(Array.from(records.filter(c => c.day === day && c.location === 'austin'), c => c.time), ['5:00–5:45 PM', '6:00–7:00 PM']);
});
test('dedicated quiz is a non-transmitting honest preview, not a fake lead success', () => {
  assert.match(quiz, /data-quiz data-endpoint=""/);
  assert.match(quiz, /Preview my Austin class plan/);
  assert.match(quiz, /No request was sent/);
  assert.doesNotMatch(quiz, /your request was securely sent/);
  assert.match(quiz, /data-step="1"[\s\S]*name="audience" value="child"[\s\S]*name="audience" value="adult"/);
});
test('ad brief sends both creative families to one destination and one broad ad set', () => {
  const brief = read('assets/ads-podcast/03-austin-castle-hill-launch.md');
  assert.match(brief, /Meta Leads/);
  assert.match(brief, /One broad local ad set/);
  assert.match(brief, /https:\/\/joaocrusbjj.com\/castle-hill-grand-opening\/\?utm_source=meta/);
  assert.doesNotMatch(brief, /Ad set [12]:|# (Youth|Adult) ad set/);
  assert.match(brief, /September 14 is provisional/);
});
