const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('site/campaign/thank-you.html', 'utf8');
const book = fs.readFileSync('site/campaign/book.html', 'utf8');

test('thank-you page uses the exact approved follow-up copy without a personal-call promise', () => {
  assert.match(source, /<h1>Your request is in\.<\/h1>/);
  assert.match(source, /<p class="lead">We'll follow up to help you choose the right program, location, and first class\.<\/p>/);
  assert.doesNotMatch(source, /reach out shortly|personally call|Once the production form is connected/i);
  assert.match(source, /Your form did not reserve a calendar slot\./);
});

test('yellow confirmation styling stays page-scoped with black small text and CTA foreground', () => {
  assert.match(source, /\.thank-hero \{[^}]*background: #f5c400; color: #101010;/);
  assert.match(source, /\.thank-hero h1 \{[^}]*color: #194fc3;/);
  assert.match(source, /\.thank-hero \.eye, \.thank-hero \.lead, \.thank-hero \.thank-note \{ color: #101010; \}/);
  assert.match(source, /\.thank-hero \.btn \{ background: #f5c400; color: #101010; \}/);
  assert.match(source, /\.booking-card \.btn \{[^}]*background: #f5c400; color: #101010;/);
  assert.match(source, /<header class="header">/);
  assert.match(source, /<footer class="footer">/);
});

test('Austin adult GROUP first-class booking is a visible sibling card, not private or interest-list routing', () => {
  const card = source.match(/<article class="booking-card" data-booking-card="adults:austin"[\s\S]*?<\/article>/)?.[0];
  assert.ok(card);
  assert.equal((source.match(/data-booking-card="adults:austin"/g) || []).length, 1);
  assert.match(source, /Austin · Castle Hill Fitness/);
  assert.match(source, /1112 N Lamar Blvd/);
  assert.match(card, /Adult group classes/);
  assert.match(card, />Adults<\/h4>/);
  assert.match(card, /Tuesday &amp; Thursday/);
  assert.match(card, /6:00–7:00 PM/);
  assert.match(card, /href="https:\/\/api\.leadconnectorhq\.com\/widget\/bookings\/adults-first-austin"/);
  assert.match(card, />Book Your Class<\/a>/);
  assert.doesNotMatch(card, /hidden|aria-disabled|private|interest list/i);
  assert.match(source, /Your first studio visit is free\./);
});

test('approved reference anchor and all six existing booking destinations remain honest', () => {
  assert.match(source, /id="first-class-options"/);
  const urls = text => [...text.matchAll(/href="(https:\/\/api\.leadconnectorhq\.com\/widget\/bookings\/[^"\s]+)"/g)].map(m => m[1]).sort();
  assert.equal(urls(source).length, 6);
  assert.deepEqual(urls(source), urls(book));
  assert.equal((source.match(/data-booking-card=/g) || []).length, 6);
  assert.match(source, /6:00–7:00 PM/);
  assert.doesNotMatch(source, /first-class-booking\.js|booking paused|<form|fbq\(|generate_lead|dataLayer\.push/i);
  assert.match(source, /Your class is booked only after the calendar confirms it\./);
});
