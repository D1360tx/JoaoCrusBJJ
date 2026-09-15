const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const booking = require('../site/assets/first-class-booking.js');
const fallback = null;
const source = fs.readFileSync('site/campaign/thank-you.html', 'utf8');
const script = fs.readFileSync('site/assets/first-class-booking.js', 'utf8');
const id = 'WqEFb31yftWo7HOIxyv1';
const url = 'https://api.leadconnectorhq.com/widget/bookings/little-champions-first-ds';
const route = entry => ({ 'little:dripping-springs': entry });

test('exactly five approved choices open; no unknown route defaults to DS', () => {
  assert.equal(booking.releaseEnabled, true);
  for (const program of ['help', 'little', 'youth', 'homeschool', 'adults', 'teens', 'after60', 'private', '__proto__']) {
    for (const location of ['help', 'dripping-springs', 'austin', 'other']) {
      const result = booking.resolve(program, location, booking.calendars, booking.releaseEnabled);
      const calendar = booking.calendars[program + ':' + location];
      assert.equal(result.bookable, !!calendar);
      assert.equal(result.href, calendar ? calendar.url : fallback);
    }
  }
  assert.equal(Object.keys(booking.calendars).length, 5);
  assert.ok(Object.values(booking.calendars).every(c => c.approved && c.url.startsWith('https://api.leadconnectorhq.com/widget/bookings/')));
  assert.deepEqual(Object.values(booking.calendars).map(c => c.id), ['WqEFb31yftWo7HOIxyv1', 'lwI401IPhkVBM5TUAhYm', 'TZDZNzvBn0gcHFyfjk2l', 'GO56GPdtrVWfqhOmGK3w', 'wY51xc5N1INt6jsQByeC']);
  for (const [key, calendar] of Object.entries(booking.calendars)) {
    const [program, location] = key.split(':');
    const approved = { [key]: { ...calendar, approved: true } };
    assert.equal(booking.resolve(program, location, approved, false).href, null);
    assert.equal(booking.resolve(program, location, { [key]: { ...calendar, approved: false } }, true).href, null);
    assert.equal(booking.resolve(program, location, approved, true).href, calendar.url);
  }
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
    { id, url: url.replace('little-champions-first-ds', 'youth-first-ds'), approved: true },
    { id, url: 'https://api.leadconnectorhq.com/widget/booking/' + id, approved: true },
    { id, url: url.replace('api.', 'evil.api.'), approved: true },
    { id, url: url.replace('https://', 'https://user:pass@'), approved: true },
    { id: 'invalid', url, approved: true },
  ]) assert.equal(booking.resolve('little', 'dripping-springs', route(candidate), true).href, fallback);
  assert.equal(booking.resolve('adults', 'austin', ready, true).href, fallback);
});

test('all five cards mount as exact booking links, never email redirects', () => {
  const cards = Object.keys(booking.calendars).map(key => {
    const attrs = { href: 'https://stale.example' }; const events = {};
    const link = { setAttribute: (k,v) => attrs[k]=v, removeAttribute: k => delete attrs[k], addEventListener: (k,v) => events[k]=v };
    const status = {};
    return { attrs, events, link, status, getAttribute: () => key, querySelector: q => q === '[data-booking-link]' ? link : status };
  });
  booking.mount({ querySelectorAll: () => cards });
  for (const c of cards) {
    assert.equal(c.attrs.href, booking.calendars[c.getAttribute()].url);
    assert.equal(c.attrs['aria-disabled'], 'false');
    assert.equal(c.link.textContent, 'Book Your Class');
    let prevented = false; c.events.click({ preventDefault: () => prevented = true });
    assert.equal(prevented, false); assert.match(c.status.textContent, /only after the calendar confirms/);
  }
  assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|location\.(href|assign|replace)\s*[=(]/);
});

test('visible static schedules exactly match shared canonical calendar records', () => {
  const calendar = fs.readFileSync('site/assets/class-calendar.js', 'utf8');
  const classes = JSON.parse(JSON.stringify(require('node:vm').runInNewContext(calendar.match(/var CLASSES = (\[[\s\S]*?\n  \]);/)[1])));
  const cards = [...source.matchAll(/data-booking-card="([^"]+)"[\s\S]*?<ul class="booking-times">([\s\S]*?)<\/ul>/g)];
  assert.deepEqual(cards.map(c => c[1]), Object.keys(booking.calendars));
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  for (const [,key,html] of cards) {
    const [program, location] = key.split(':');
    const expected = classes.filter(c => c.groups.includes(program) && c.location === (location === 'dripping-springs' ? 'ds' : location));
    const actual = [...html.matchAll(/<strong>(.*?)<\/strong><span>(.*?)<\/span>/g)].flatMap(([,ds,time]) => ds.split(' &amp; ').map(day => ({day:days.indexOf(day), time})));
    assert.deepEqual(actual.sort((a,b)=>a.day-b.day), expected.map(({day,time})=>({day,time})).sort((a,b)=>a.day-b.day));
  }
});

test('page preserves honest confirmation, visible review controls and no-JS fallback', () => {
  assert.match(source, /We’ll reach out shortly/);
  assert.match(source, /Book your class below/);
  assert.match(source, /Joao will personally call/);
  assert.match(source, /did not reserve a calendar slot/);
  assert.match(source, /href="#first-class-options"/);
  assert.match(source, /href="schedule.html">View schedule/);
  assert.equal((source.match(/data-booking-link role="link" tabindex="0" aria-disabled="true"/g)||[]).length, 5);
  assert.match(source, /href="mailto:joaocrusbjj@gmail.com">Email Joao/);
  assert.match(source, /<noscript>/);
  assert.doesNotMatch(source, /<iframe|\/widget\/booking\/|—/);
});

test('built thank-you route has qualified anchors and versioned booking asset', { skip: !fs.existsSync('dist/thank-you/index.html') }, () => {
  const html = fs.readFileSync('dist/thank-you/index.html', 'utf8');
  assert.match(html, /href="\/thank-you\/#first-class-options"/);
  assert.doesNotMatch(html, /href="#/);
  assert.match(html, /src="\/assets\/first-class-booking.js\?v=[a-f0-9]{12}"/);
  assert.match(html, /href="\/classes-schedule\/">View schedule/);
  assert.ok(fs.existsSync('dist/assets/first-class-booking.js'));
});
