const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const youth = read('site/campaign/meta-austin-youth-first-class.html');
const adults = read('site/campaign/meta-austin-adults-first-class.html');
const quizPage = read('site/campaign/austin-program-fit-quiz.html');
const quiz = read('site/assets/austin-program-fit-quiz.js');
const landingJs = read('site/assets/austin-campaign.js');
const css = read('site/assets/austin-campaign.css');
const endpoint = read('deploy/bluehost/api/lead.php');
const manifest = JSON.parse(read('site/campaign/seo-pages.json'));
const brief = read('assets/ads-podcast/03-austin-castle-hill-launch.md');

function matches(source, pattern) { return [...source.matchAll(pattern)]; }

for (const [audience, page, source, routePath] of [
  ['Youth', youth, 'meta-austin-youth-paid', 'child'],
  ['Adult', adults, 'meta-austin-adults-paid', 'adult'],
]) {
  test(`${audience} landing is an isolated noindex comparison with five routed CTAs`, () => {
    assert.match(page, /<meta name="robots" content="noindex,nofollow">/);
    assert.match(page, /Austin comparison preview · Not a live ad destination/);
    assert.match(page, /Castle Hill Fitness/);
    assert.match(page, /1112 N Lamar Blvd/);
    const hrefs = matches(page, /href="([^"]+)"[^>]*data-austin-quiz/g)
      .map((match) => match[1].replaceAll('&amp;', '&'));
    assert.equal(hrefs.length, 5);
    const placements = new Set();
    for (const href of hrefs) {
      const url = new URL(href, 'https://joaocrusbjj.com/campaign/');
      assert.equal(url.pathname, '/campaign/austin-program-fit-quiz.html');
      assert.equal(url.searchParams.get('source'), source);
      assert.equal(url.searchParams.get('path'), routePath);
      assert.equal(url.searchParams.get('embed'), '1');
      assert.equal(url.searchParams.get('start'), 'quiz');
      placements.add(url.searchParams.get('placement'));
    }
    assert.deepEqual([...placements].sort(), ['final', 'header', 'hero', 'message-match', 'mobile']);
  });

  test(`${audience} landing uses owned local images with dimensions`, () => {
    const images = matches(page, /<img\s+[^>]*>/g).map((match) => match[0]);
    assert.ok(images.length >= 3);
    for (const image of images) {
      assert.match(image, /width="\d+"/);
      assert.match(image, /height="\d+"/);
      assert.doesNotMatch(image, /https?:\/\//);
    }
  });
}

test('Youth page and ads match age, schedule, tapping, and practiced-confidence promises', () => {
  for (const phrase of ['Youth ages 8–12', 'Tue/Thu 5:00–5:45 p.m.', 'Tap means stop.', 'Confidence grows through practice.']) {
    assert.match(youth, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    assert.match(brief, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
  assert.doesNotMatch(youth, /programs? (?:begin|start)(?:s)? at age 3/i);
});

test('Adult page and ads match the group, private, beginner, and pressure paths', () => {
  for (const phrase of ['Tue/Thu 6:00–7:00 p.m.', 'Private lessons', 'New to jiu-jitsu? Start here.', 'Practice calm under pressure.']) {
    assert.match(adults, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    assert.match(brief, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});

test('Austin quiz is fixed to Austin, gates Youth age, branches adults, and captures contact last', () => {
  assert.match(quizPage, /data-step="6"[^>]*fit-step--contact|fit-step--contact[^>]*data-step="6"/);
  assert.match(quizPage, /data-age-gate/);
  assert.match(quiz, /preferred_location: 'austin'/);
  assert.match(quiz, /form\.elements\.stage\.value !== 'youth'/);
  assert.match(quiz, /\['private', 'hybrid'\]/);
  assert.match(quiz, /Tue\/Thu 5:00–5:45 p\.m\./);
  assert.match(quiz, /Tue\/Thu 6:00–7:00 p\.m\./);
  assert.match(quiz, /Private lessons are by appointment/);
  assert.match(quiz, /input\.checked = false/);
  assert.match(quiz, /delete answers\[key\]/);
  assert.match(quiz, /\/austin-youth-first-class\//);
  assert.match(quiz, /\/austin-adults-first-class\//);
  assert.doesNotMatch(quiz, /link: child \? 'meta-austin/);
  assert.match(youth, /class="mk-wrap mk-footer__inner bottom"/);
  assert.match(adults, /class="mk-wrap mk-footer__inner bottom"/);
  assert.match(quizPage, /class="fit-footer bottom"/);
  assert.match(quizPage, /data-endpoint="\/api\/lead.php"/);
  assert.doesNotMatch(quizPage, /Preview only|No request is sent/);
  assert.match(quiz, /metaContext\(window, attribution\)/);
  assert.match(quiz, /body.note_accepted !== true/);
  assert.match(quiz, /body.meta_event_id !== `lead_\$\{payload.request_id\}`/);
  assert.doesNotMatch(quiz, /pushQuizEvent\('lead_submit_success'/);
  assert.ok(quiz.indexOf('const acceptance = await submitLead(payload)') < quiz.indexOf('      routeAcceptedLead({'));
});

test('backend accepts only explicit Austin route sources and rejects mismatched Austin payloads', () => {
  for (const source of ['meta-austin-youth-paid', 'meta-austin-adults-paid', 'austin-program-fit']) {
    assert.match(endpoint, new RegExp(source));
  }
  assert.match(endpoint, /\$lead\['preferred_location'\] !== 'austin'/);
  assert.match(endpoint, /\$ageBands !== \['youth'\]/);
  assert.match(endpoint, /\$audience === 'adult' && \$stage === 'after60'/);
});

test('landing behavior forwards supported attribution and controls sticky CTA visibility', () => {
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'fbclid']) {
    assert.match(landingJs, new RegExp(`['"]${key}['"]`));
  }
  assert.match(landingJs, /history\.scrollRestoration = 'manual'/);
  assert.match(landingJs, /!isVisible\(heroCta\)/);
  assert.match(landingJs, /!isVisible\(finalSection\)/);
  assert.match(landingJs, /austin-schedule/);
});

test('yellow Austin CTAs have explicit Campaign Black text', () => {
  assert.match(css, /background:#f5c400;color:#101010/);
});

test('all three Austin campaign routes are manifest-driven and noindex', () => {
  const expected = new Map([
    ['meta-austin-youth-first-class.html', '/austin-youth-first-class/'],
    ['meta-austin-adults-first-class.html', '/austin-adults-first-class/'],
    ['austin-program-fit-quiz.html', '/austin-program-finder/quiz/'],
  ]);
  for (const [file, route] of expected) {
    const entry = manifest.pages.find((page) => page.file === file);
    assert.ok(entry, `${file} missing from manifest`);
    assert.equal(entry.path, route);
    assert.equal(entry.indexable, false);
  }
});

test('campaign brief supplies six distinct ads per audience and exact destinations', () => {
  const youthAds = new Set(matches(brief, /^### (AY\d{2}_[A-Z0-9-]+(?:_[A-Z]+)?)$/gm).map((m) => m[1]));
  const adultAds = new Set(matches(brief, /^### (AA\d{2}_[A-Z0-9-]+(?:_[A-Z]+)?)$/gm).map((m) => m[1]));
  assert.equal(youthAds.size, 6);
  assert.equal(adultAds.size, 6);
  assert.match(brief, /https:\/\/joaocrusbjj\.com\/austin-youth-first-class\//);
  assert.match(brief, /https:\/\/joaocrusbjj\.com\/austin-adults-first-class\//);
  assert.match(brief, /utm_campaign=austin_castle_hill_launch_v1/);
  assert.doesNotMatch(brief, /utm_creative=/);
});

test('campaign-facing copy contains no em dash', () => {
  for (const source of [youth, adults, quizPage, brief]) assert.doesNotMatch(source, /—/);
});
