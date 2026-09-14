const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const booking = require('../site/assets/first-class-booking.js');
const fallback = 'mailto:joaocrusbjj@gmail.com';
const source = fs.readFileSync('site/campaign/thank-you.html', 'utf8');
const script = fs.readFileSync('site/assets/first-class-booking.js', 'utf8');
const id = 'WqEFb31yftWo7HOIxyv1';
const url = 'https://api.leadconnectorhq.com/widget/booking/' + id;
const route = entry => ({ 'little:dripping-springs': entry });

test('all current choices stay closed; no unknown route defaults to DS', () => {
  assert.equal(booking.releaseEnabled, false);
  for (const program of ['help', 'little', 'youth', 'homeschool', 'adults', 'teens', 'after60', 'private', '__proto__']) {
    for (const location of ['help', 'dripping-springs', 'austin', 'other']) {
      const result = booking.resolve(program, location, booking.calendars, booking.releaseEnabled);
      assert.equal(result.bookable, false);
      assert.equal(result.href, fallback);
    }
  }
  assert.equal(Object.keys(booking.calendars).length, 4);
  assert.ok(Object.values(booking.calendars).every(c => !c.approved && !c.url));
});

test('both release and route approval and a matching clean URL are required', () => {
  const ready = route({ id, url, approved: true });
  assert.equal(booking.resolve('little', 'dripping-springs', ready, true).href, url);
  for (const enabled of [false, undefined, 'true', 1]) {
    assert.equal(booking.resolve('little', 'dripping-springs', ready, enabled).href, fallback);
  }
  for (const candidate of [
    { id, url, approved: false }, { id, url, approved: 'true' },
    { id, url: 'javascript:alert(1)', approved: true },
    { id, url: url + '?email=private@example.com', approved: true },
    { id, url: url + '#confirmed', approved: true },
    { id, url: url.replace(id, 'lwI401IPhkVBM5TUAhYm'), approved: true },
    { id, url: url.replace('api.', 'evil.api.'), approved: true },
    { id, url: url.replace('https://', 'https://user:pass@'), approved: true },
    { id: 'invalid', url, approved: true },
  ]) assert.equal(booking.resolve('little', 'dripping-springs', route(candidate), true).href, fallback);
  assert.equal(booking.resolve('adults', 'austin', ready, true).href, fallback);
});

test('chooser reacts to both selections without submitting or auto-navigating', () => {
  const events = {};
  const program = { value: 'little', addEventListener: (event, fn) => { events.program = fn; } };
  const location = { value: 'dripping-springs', addEventListener: (event, fn) => { events.location = fn; } };
  const link = {}; const status = {};
  const nodes = { '[data-booking-program]': program, '[data-booking-location]': location, '[data-booking-link]': link, '[data-booking-status]': status };
  booking.mount({ querySelector: () => ({ querySelector: selector => nodes[selector] }) });
  assert.equal(link.href, fallback);
  location.value = 'austin'; events.location();
  assert.match(status.textContent, /not open/);
  program.value = 'private'; events.program();
  assert.equal(link.href, fallback);
  assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|dataLayer|location\.(href|assign|replace)\s*[=(]/);
});

test('page preserves honest confirmation, secondary schedule and accessible no-JS fallback', () => {
  assert.match(source, /Joao will personally call/);
  assert.match(source, /did not reserve a calendar slot/);
  assert.match(source, /href="#first-class-options"/);
  assert.match(source, /id="first-class-options"/);
  assert.match(source, /href="schedule.html">View schedule/);
  assert.match(source, /data-booking-link href="mailto:joaocrusbjj@gmail.com"/);
  assert.match(source, /data-booking-status role="status" aria-live="polite"/);
  for (const field of ['program', 'location']) {
    assert.match(source, new RegExp('label for="first-class-' + field + '"'));
    assert.match(source, new RegExp('id="first-class-' + field + '"'));
  }
  assert.match(source, /<noscript>/);
  assert.doesNotMatch(source, /<iframe|\/widget\/booking\//);
});

test('built thank-you route has qualified anchors and versioned booking asset', { skip: !fs.existsSync('dist/thank-you/index.html') }, () => {
  const html = fs.readFileSync('dist/thank-you/index.html', 'utf8');
  assert.match(html, /href="\/thank-you\/#first-class-options"/);
  assert.doesNotMatch(html, /href="#/);
  assert.match(html, /src="\/assets\/first-class-booking.js\?v=[a-f0-9]{12}"/);
  assert.match(html, /href="\/classes-schedule\/">View schedule/);
  assert.ok(fs.existsSync('dist/assets/first-class-booking.js'));
});
