const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

test('program finder production routes are separate and noindex', () => {
  const manifest = JSON.parse(read('site/campaign/seo-pages.json'));
  const landing = manifest.pages.find((page) => page.file === 'program-fit-landing.html');
  const quiz = manifest.pages.find((page) => page.file === 'program-fit-quiz.html');
  assert.equal(landing.path, '/program-finder/');
  assert.equal(quiz.path, '/program-finder/quiz/');
  assert.equal(landing.indexable, false);
  assert.equal(quiz.indexable, false);
  assert.ok(fs.existsSync(path.join(root, 'site/campaign/program-fit-landing-preview.html')));
  assert.ok(fs.existsSync(path.join(root, 'site/campaign/program-fit-quiz-preview.html')));
});

test('production quiz collects required email and optional SMS consent and targets the lead API', () => {
  const html = read('site/campaign/program-fit-quiz.html');
  assert.match(html, /data-endpoint="\/api\/lead\.php"/);
  assert.match(html, /name="email_consent" required/);
  assert.match(html, /name="sms_consent">/);
  assert.doesNotMatch(html, /name="sms_consent" required/);
  assert.match(html, /name="phone"[^>]*required/);
  assert.match(html, /name="website"/);
  assert.doesNotMatch(html, /does not send or store/i);
});

test('review quiz remains inert and preserves review disclosure', () => {
  const html = read('site/campaign/program-fit-quiz-preview.html');
  assert.match(html, /data-endpoint=""/);
  assert.match(html, /does not send or store/i);
  assert.doesNotMatch(html, /name="sms_consent"/);
});

test('quiz payload is retry-stable, channel-aware, and never places PII in analytics', () => {
  const js = read('site/assets/program-fit-quiz.js');
  assert.match(js, /request_id: requestId/);
  assert.match(js, /route_source: routeSource/);
  assert.match(js, /fetch\(endpoint/);
  assert.match(js, /credentials: 'same-origin'/);
  assert.match(js, /email_consent:/);
  assert.match(js, /sms_consent:/);
  assert.match(js, /age_bands: answers\.audience === 'child'/);
  assert.match(js, /stage: answers\.audience === 'adult'/);
  assert.match(js, /first: attribution\.first_touch/);
  assert.match(js, /latest: attribution\.last_touch/);
  assert.match(js, /new AbortController\(\)/);
  assert.match(js, /12000/);
  const eventLines = js.split('\n').filter((line) => line.includes('dataLayer.push'));
  for (const line of eventLines) assert.doesNotMatch(line, /first_name|email|phone/);
});

test('teen and family recommendations map to explicit accepted CRM enums', () => {
  const js = read('site/assets/program-fit-quiz.js');
  assert.match(js, /title: 'Teen Interest Path'/);
  assert.match(js, /'Teen Interest Path': 'teen_interest_path'/);
  assert.match(js, /title: 'Family Program Plan'/);
  assert.match(js, /'Family Program Plan': 'family_program_plan'/);
  assert.doesNotMatch(js, /Teen Interest List|teen_interest_list/);
});

test('single-child age selection uses radios, multi-child uses checkboxes, and path preselection is enum-bound', () => {
  const js = read('site/assets/program-fit-quiz.js');
  assert.match(js, /input\.type = multiple \? 'checkbox' : 'radio'/);
  assert.match(js, /input\.required = !multiple/);
  assert.match(js, /requestedPath === 'child' \|\| requestedPath === 'adult'/);
  assert.doesNotMatch(js, /requestedPath === 'help'/);
});

test('Little Champions discloses the current location when Austin is preferred', () => {
  const js = read('site/assets/program-fit-quiz.js');
  assert.match(js, /current published ages 3–7 group is in Dripping Springs, not Austin/);
  assert.match(js, /Review the Dripping Springs schedule before requesting a class/);
});

test('quiz and shared forms require the explicit accepted response contract', () => {
  const quiz = read('site/assets/program-fit-quiz.js');
  const shared = read('site/assets/campaign-site.js');
  for (const source of [quiz, shared]) {
    assert.match(source, /body\.accepted !== true/);
    assert.match(source, /body\.contact_accepted !== true/);
    assert.match(source, /body\.opportunity_accepted !== true/);
    assert.match(source, /body\.request_id !==/);
  }
  assert.match(shared, /fetch\("\/api\/lead\.php"/);
  assert.match(shared, /new AbortController\(\)/);
  assert.match(shared, /12000/);
  assert.match(shared, /data\.request_id = form\.dataset\.requestId/);
  assert.match(shared, /data-booking-form data-form-id="booking_popup" data-lead-type="class_inquiry"/);
  assert.doesNotMatch(shared, /fetch\("\/api\/contact\.php"/);
});

test('builder orders consent and attribution before quiz behavior and emits canonicals', () => {
  const builder = read('scripts/build_vercel_site.py');
  const landing = read('site/campaign/program-fit-landing.html');
  const quiz = read('site/campaign/program-fit-quiz.html');
  assert.match(builder, /first_deferred_script/);
  assert.match(builder, /routeEnums/);
  assert.match(builder, /practice-under-pressure/);
  assert.match(landing, /rel="canonical" href="https:\/\/joaocrusbjj\.com\/program-finder\/"/);
  assert.match(quiz, /rel="canonical" href="https:\/\/joaocrusbjj\.com\/program-finder\/quiz\/"/);
});

test('practice-under-pressure routes its primary funnel to quiz and preserves flyer attribution', () => {
  const page = read('site/campaign/practice-under-pressure.html');
  const helper = read('site/assets/found-the-flyer.js');
  const homepage = read('site/campaign/index.html');
  assert.match(page, /href="program-fit-quiz\.html\?source=practice-under-pressure" data-quiz-route/);
  assert.match(page, /href="\/program-finder\/quiz\/\?source=practice-under-pressure&amp;path=help" data-quiz-route>Find my program/);
  assert.match(helper, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(helper, /if \(!target\.searchParams\.has\(key\)\) target\.searchParams\.set\(key, value\)/);
  assert.match(helper, /target\.searchParams\.set\("utm_source", "offline_flyer"\)/);
  assert.match(helper, /target\.searchParams\.set\("utm_medium", "qr"\)/);
  assert.match(helper, /target\.searchParams\.set\("utm_campaign", "practice_under_pressure"\)/);
  assert.match(homepage, /href="contact\.html">Plan a first class/);
  assert.doesNotMatch(homepage, /data-quiz-route/);
});

test('shared-form consent grants email or call only and excludes automated texts', () => {
  const shared = read('site/assets/campaign-site.js');
  const teen = read('site/teens-campaign-ages-13-17.html');
  const flyer = read('site/campaign/practice-under-pressure.html');
  for (const source of [shared, teen, flyer]) {
    assert.match(source, /may email or call me/);
    assert.match(source, /Automated texts are not enabled from this form/);
    assert.doesNotMatch(source, /may call or text me/);
  }
});

test('built routes rewrite links, preserve canonicals, and order attribution before quiz behavior', () => {
  const landing = read('dist/program-finder/index.html');
  const quiz = read('dist/program-finder/quiz/index.html');
  assert.match(landing, /href="\/program-finder\/quiz\/\?source=landing-hero"/);
  assert.match(quiz, /data-endpoint="\/api\/lead\.php"/);
  assert.match(quiz, /href="\/privacy-policy\/"/);
  assert.match(quiz, /href="\/terms\/"/);
  assert.match(quiz, /content="noindex,nofollow"/);
  assert.match(quiz, /rel="canonical" href="https:\/\/joaocrusbjj\.com\/program-finder\/quiz\/"/);
  const attributionPosition = quiz.indexOf('/assets/attribution.js');
  const quizBehaviorPosition = quiz.indexOf('/assets/program-fit-quiz.js');
  assert.ok(attributionPosition >= 0 && attributionPosition < quizBehaviorPosition);
});
