const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'site/campaign/kids-warrior-challenge-preview.html');
const cssPath = path.join(root, 'site/assets/kids-warrior-challenge.css');
const videoPath = path.join(root, 'site/assets/campaign-videos/kids-warrior-challenge-intro-2026-08.mp4');
const posterPath = path.join(root, 'site/assets/campaign-videos/kids-warrior-challenge-poster-2026-08.webp');
const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

function matches(pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

test('challenge preview is isolated and noindex', () => {
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(html, /Internal review · Not live/);
  assert.doesNotMatch(html, /href="#"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
});

test('the confirmed six-week price and calibrated claims are present', () => {
  assert.match(html, /Six-Week Kids Warrior Challenge · \$599/);
  assert.match(html, /SIX WEEKS\. <span>\$599\.<\/span>/);
  assert.match(html, /No payment is collected on this page/);
  assert.match(html, /does not charge your card or guarantee a spot/i);
  assert.doesNotMatch(html, /free uniform|money-back|guaranteed confidence|auto-renew/i);
  assert.doesNotMatch(html, /—/);
});

test('dominant challenge CTAs point to the same signup section', () => {
  const ctas = matches(/<a class="kw-btn(?: [^"]*)?" href="([^"]+)"/g);
  assert.ok(ctas.length >= 4, `expected at least 4 challenge buttons, got ${ctas.length}`);
  assert.deepEqual([...new Set(ctas)], ['#challenge-signup']);
  assert.match(html, /<div class="kw-mobile"><a href="#challenge-signup">/);
  assert.match(html, /id="challenge-signup"/);
});

test('GHL lead form uses the accepted legacy contract', () => {
  assert.match(html, /data-form-id="kids_warrior_challenge_interest"/);
  assert.match(html, /data-lead-type="class_inquiry"/);
  assert.match(html, /data-success-url="\/thank-you\/"/);
  for (const field of ['name', 'phone', 'email', 'program', 'location', 'message', 'website', 'consent']) {
    assert.match(html, new RegExp(`name="${field}"`));
  }
  for (const program of ['Little Champions 3–7', 'Youth 8–12', 'Teens 13–17', 'Not sure yet']) {
    assert.match(html, new RegExp(program));
  }
  assert.match(html, /Interested in the \$599 Six-Week Kids Warrior Challenge/);
});

test('burned-in-caption video, poster, and responsive CSS exist', () => {
  for (const file of [videoPath, posterPath]) {
    assert.equal(fs.existsSync(file), true, `${file} should exist`);
    assert.ok(fs.statSync(file).size > 100, `${file} should not be empty`);
  }
  assert.match(html, /kids-warrior-challenge-intro-2026-08\.mp4/);
  assert.doesNotMatch(html, /<track\b|\.vtt/);
  assert.match(html, /kids-warrior-challenge-poster-2026-08\.webp/);
  assert.match(css, /\.kw-page \.kw-cta-note\s*\{[^}]*margin:\s*30px 0 0;/s);
  assert.match(css, /@media \(max-width: 920px\)/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /\.kw-page\.engaged \.kw-mobile/);
});
