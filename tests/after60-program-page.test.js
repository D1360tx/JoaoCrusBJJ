const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const pagePath = 'site/campaign/jiu-jitsu-after-60.html';
const cssPath = 'site/assets/after60-program.css';
const manifestPath = 'site/campaign/seo-pages.json';
const read = (path) => fs.readFileSync(path, 'utf8');

test('canonical After 60 page uses Joao approved four-week positioning', () => {
  const page = read(pagePath);
  assert.match(page, /4-week introduction/);
  assert.match(page, /Men &amp; women 60\+/);
  assert.match(page, /STAY STRONG\. STAY MOBILE\./);
  assert.match(page, /RELATIONAL FIRST\.<br>PHYSICAL SECOND\./);
  assert.match(page, /No aggressive sparring/);
  assert.match(page, /Five parts|FIVE PARTS/);
  assert.match(page, /Two mornings per week/);
  assert.doesNotMatch(page, /Copy review:|Production is unchanged|Duration to confirm|approximately 60 minutes/);
  assert.doesNotMatch(page, /jiu-jitsu-after-60-joao-copy|after60-joao-copy-review/);
  assert.doesNotMatch(page, /—/);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
});

test('canonical After 60 form retains the production lead contract', () => {
  const page = read(pagePath);
  assert.match(page, /data-form-id="after60_first_class"/);
  assert.match(page, /data-lead-type="class_inquiry"/);
  assert.match(page, /data-success-url="\/thank-you\/"/);
  for (const field of ['name', 'email', 'phone', 'program', 'location', 'consent']) {
    assert.match(page, new RegExp(`name="${field}"`));
  }
  assert.match(page, /program-fit-quiz\.html\?source=after60-page&amp;path=after60&amp;start=quiz/);
  assert.match(page, /jiu-jitsu-after-60\.html#class-flow/);
});

test('manifest keeps After 60 canonical and indexable with the new description', () => {
  const manifest = JSON.parse(read(manifestPath));
  const entry = manifest.pages.find(page => page.file === 'jiu-jitsu-after-60.html');
  assert.ok(entry);
  assert.equal(entry.path, '/jiu-jitsu-after-60/');
  assert.equal(entry.indexable, true);
  assert.match(entry.description, /four-week Brazilian Jiu-Jitsu introduction/);
});

test('After 60 stylesheet covers long-form and mobile layouts', () => {
  const css = read(cssPath);
  assert.match(css, /\.benefit-grid/);
  assert.match(css, /\.class-flow/);
  assert.match(css, /\.philosophy-card/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.doesNotMatch(css, /review-ribbon|review-note/);
});
