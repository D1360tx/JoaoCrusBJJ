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
