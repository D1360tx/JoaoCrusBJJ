const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'site/campaign/meta-kids-first-class.html');
const cssPath = path.join(root, 'site/assets/meta-kids-landing.css');
const jsPath = path.join(root, 'site/assets/meta-kids-landing.js');
const quizPath = path.join(root, 'site/assets/program-fit-quiz.js');
const modalPath = path.join(root, 'site/assets/program-fit-modal.js');
const page = fs.readFileSync(pagePath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');
const quiz = fs.readFileSync(quizPath, 'utf8');
const modal = fs.readFileSync(modalPath, 'utf8');

function matches(pattern) {
  return [...page.matchAll(pattern)];
}

test('kids paid-social page is production-ready, isolated, and noindex', () => {
  assert.match(page, /<meta name="robots" content="noindex,nofollow">/);
  assert.doesNotMatch(page, /Internal review|Not live|mk-review/i);
  assert.doesNotMatch(page, /You kept the flyer/i);
  assert.doesNotMatch(page, /adults starting/i);
});

test('hero and message-match modules align to the four approved static ads', () => {
  for (const phrase of ['TAP MEANS STOP', 'CONFIDENCE GROWS THROUGH PRACTICE', 'STARTING AT AGE 3', 'THE RIGHT CLASS MATTERS']) {
    assert.match(page, new RegExp(phrase));
  }
  assert.match(page, /Kids BJJ · Ages 3–17 · Dripping Springs \+ Austin/);
  assert.match(page, /CONFIDENCE STARTS WITH/);
  assert.match(page, /About 60 seconds\. No booking\. No charge\./);
  assert.match(page, /Programs from age 3/);
  assert.match(page, /Dripping Springs \+ Austin/);
});

test('every primary CTA enters the child quiz and preserves a unique placement', () => {
  const hrefs = matches(/href="([^"]+)"[^>]*data-kids-quiz/g).map((match) => match[1].replaceAll('&amp;', '&'));
  assert.equal(hrefs.length, 5);
  const placements = new Set();
  hrefs.forEach((href) => {
    const url = new URL(href, 'https://joaocrusbjj.com/campaign/');
    assert.equal(url.pathname, '/campaign/program-fit-quiz.html');
    assert.equal(url.searchParams.get('source'), 'meta-kids-paid');
    assert.equal(url.searchParams.get('path'), 'child');
    assert.equal(url.searchParams.get('embed'), '1');
    assert.equal(url.searchParams.get('start'), 'quiz');
    placements.add(url.searchParams.get('placement'));
  });
  assert.deepEqual([...placements].sort(), ['final', 'header', 'hero', 'message-match', 'mobile']);
});

test('paid attribution keys are forwarded to every quiz CTA', () => {
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'fbclid']) {
    assert.match(js, new RegExp(`['"]${key}['"]`));
  }
  assert.match(js, /document\.querySelectorAll\('\[data-kids-quiz\]'\)/);
});

test('page uses owned real-photo assets with intrinsic dimensions', () => {
  const images = matches(/<img\s+[^>]*>/g).map((match) => match[0]);
  assert.ok(images.length >= 3);
  images.forEach((image) => {
    assert.match(image, /width="\d+"/);
    assert.match(image, /height="\d+"/);
    assert.doesNotMatch(image, /https?:\/\//);
  });
  assert.match(page, /campaign-images\/kids-training\.webp/);
  assert.doesNotMatch(page, /toddler-purposeful-play-hero\.webp/);
  assert.match(page, /class="mk-age-mark"[^>]*>3\+</);
  assert.match(page, /campaign-images\/joao-crus\.webp/);
  assert.doesNotMatch(page, /ai-hero|ai-concept/i);
});

test('quiz accepts the dedicated paid-social source and modal reports it dynamically', () => {
  assert.match(quiz, /meta-kids-paid/);
  assert.match(modal, /route_source/);
  assert.doesNotMatch(modal, /source: 'practice_under_pressure'/);
});

test('mobile CTA has explicit hidden, visible, and final-section suppression logic', () => {
  assert.match(css, /\.mk-mobile-cta \{ display: none;/);
  assert.match(css, /\.mk-mobile-cta\.is-visible/);
  assert.match(js, /isVisible\(finalSection\)/);
  assert.match(js, /!isVisible\(heroCta\) && !isVisible\(finalSection\)/);
});

test('yellow CTA buttons always use black text', () => {
  assert.match(css, /\.mk-page \.mk-btn \{[^}]*background: var\(--mk-yellow\);[^}]*color: var\(--mk-black\);/);
  assert.match(css, /\.mk-inline-cta \.mk-btn \{ color: var\(--mk-black\);/);
});

test('all local assets referenced by the page exist', () => {
  const refs = matches(/(?:src|href)="(\.\.\/assets\/[^"]+)"/g).map((match) => match[1]);
  refs.forEach((ref) => {
    const localPath = path.resolve(path.dirname(pagePath), ref);
    assert.equal(fs.existsSync(localPath), true, `${ref} should exist`);
  });
});
