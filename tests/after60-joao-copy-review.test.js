const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const sourcePath = 'site/campaign/jiu-jitsu-after-60.html';
const reviewPath = 'site/campaign/jiu-jitsu-after-60-joao-copy.html';
const cssPath = 'site/assets/after60-joao-copy-review.css';

const read = (path) => fs.readFileSync(path, 'utf8');

test('Joao copy review preserves the current production source', () => {
  const source = read(sourcePath);
  assert.match(source, /START STEADY\. <span class="yellow">BUILD REAL&nbsp;CONFIDENCE\.<\/span>/);
  assert.doesNotMatch(source, /Copy review:/);
});

test('After 60 review applies the supplied four-week positioning', () => {
  const page = read(reviewPath);
  assert.match(page, /4-week introduction/);
  assert.match(page, /Men &amp; women 60\+/);
  assert.match(page, /STAY STRONG\. STAY MOBILE\./);
  assert.match(page, /RELATIONAL FIRST\.<br>PHYSICAL SECOND\./);
  assert.match(page, /No aggressive sparring/);
  assert.match(page, /Five parts|FIVE PARTS/);
  assert.match(page, /Two mornings per week/);
  assert.match(page, /data-form-id="after60_first_class"/);
  assert.match(page, /data-lead-type="class_inquiry"/);
  assert.match(page, /data-success-url="\/thank-you\/"/);
  assert.match(page, /meta name="robots" content="noindex,nofollow"/);
  assert.doesNotMatch(page, /—/);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
});

test('After 60 review flags the unresolved class-duration conflict', () => {
  const page = read(reviewPath);
  assert.match(page, /approximately 60 minutes/);
  assert.match(page, /11:20 AM to 12:10 PM/);
  assert.match(page, /does not publish conflicting minute-by-minute timing/);
});

test('After 60 review stylesheet covers long-form and mobile layouts', () => {
  const css = read(cssPath);
  assert.match(css, /\.benefit-grid/);
  assert.match(css, /\.class-flow/);
  assert.match(css, /\.philosophy-card/);
  assert.match(css, /@media \(max-width: 620px\)/);
});
