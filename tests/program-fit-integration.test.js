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

test('production quiz collects explicit channel consent and targets the lead API', () => {
  const html = read('site/campaign/program-fit-quiz.html');
  assert.match(html, /data-endpoint="\/api\/lead\.php"/);
  assert.match(html, /name="email_consent" required/);
  assert.match(html, /name="sms_consent" required/);
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

test('quiz submission uses an idempotency key and never places PII in analytics events', () => {
  const js = read('site/assets/program-fit-quiz.js');
  assert.match(js, /request_id: requestId/);
  assert.match(js, /createNewIfDuplicateAllowed|request_id/);
  assert.match(js, /fetch\(endpoint/);
  assert.match(js, /credentials: 'same-origin'/);
  assert.match(js, /email_consent:/);
  assert.match(js, /sms_consent:/);
  assert.match(js, /first: attribution\.first_touch/);
  assert.match(js, /latest: attribution\.last_touch/);
  const eventLines = js.split('\n').filter((line) => line.includes('dataLayer.push'));
  for (const line of eventLines) {
    assert.doesNotMatch(line, /first_name|email|phone/);
  }
});

test('built routes rewrite production-candidate links to canonical URLs', () => {
  const landing = read('dist/program-finder/index.html');
  const quiz = read('dist/program-finder/quiz/index.html');
  assert.match(landing, /href="\/program-finder\/quiz\/\?source=landing-hero"/);
  assert.match(quiz, /data-endpoint="\/api\/lead\.php"/);
  assert.match(quiz, /href="\/privacy-policy\/"/);
  assert.match(quiz, /href="\/terms\/"/);
  assert.match(quiz, /content="noindex,nofollow"/);
});
