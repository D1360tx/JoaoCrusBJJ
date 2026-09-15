const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('site/assets/first-class-booking.js', 'utf8');
const keys = Object.keys(require('../site/assets/first-class-booking.js').calendars);

function harness({ released = false, analytics = false, ads = false, userData = ads, gpc = false, pixel = true } = {}) {
  const ga = [], meta = [];
  const cards = keys.map(key => {
    const attrs = {}, listeners = {}, status = {};
    const link = { setAttribute: (k, v) => attrs[k] = v, removeAttribute: k => delete attrs[k], addEventListener: (k, v) => listeners[k] = v };
    return { attrs, listeners, getAttribute: () => key, querySelector: selector => selector === '[data-booking-link]' ? link : status };
  });
  const window = {
    document: { querySelectorAll: () => cards },
    navigator: { globalPrivacyControl: gpc },
    joaoConsentState: { analytics_storage: analytics ? 'granted' : 'denied', ad_storage: ads ? 'granted' : 'denied', ad_user_data: userData ? 'granted' : 'denied' },
    dataLayer: [], gtag: (...args) => ga.push(args),
    ...(pixel ? { fbq: (...args) => meta.push(args) } : {})
  };
  // Simulate approved routes only in this VM. Never change the production gate.
  const code = released ? source.replace('var releaseEnabled = false;', 'var releaseEnabled = true;').replaceAll('approved: false', 'approved: true') : source;
  vm.runInNewContext(code, { window, URL });
  return { cards, window, ga, meta, click: (index = 0, cancelled = false) => cards[index].listeners.click({ defaultPrevented: cancelled, preventDefault() {} }) };
}

test('direct visits and repeated mounts are never lead or appointment conversions', () => {
  for (const released of [false, true]) {
    for (let visit = 0; visit < 3; visit++) {
      const h = harness({ released, analytics: true, ads: true });
      assert.equal(h.ga.length, 0); assert.equal(h.meta.length, 0);
      assert.equal(h.window.dataLayer.length, 0);
    }
  }
});

test('all five unreleased booking links remain silent even with consent', () => {
  const h = harness({ analytics: true, ads: true });
  keys.forEach((_, i) => h.click(i));
  assert.equal(h.ga.length, 0); assert.equal(h.meta.length, 0);
});

test('approved clicks send one diagnostic to each consented destination, no legacy router event', () => {
  const h = harness({ released: true, analytics: true, ads: true });
  keys.forEach((key, i) => {
    h.click(i);
    const [program, location] = key.split(':');
    assert.deepEqual(h.ga[i].slice(0, 2), ['event', 'booking_start']);
    assert.equal(h.ga[i][2].send_to, 'G-EW2F2YKR3Y');
    assert.equal(h.ga[i][2].program, program);
    assert.equal(h.ga[i][2].location, location.replaceAll('-', '_'));
    assert.deepEqual(h.meta[i].slice(0, 2), ['trackCustom', 'StartFirstClassBooking']);
    assert.deepEqual(Object.keys(h.meta[i][2]).sort(), ['form_name', 'link_context', 'location', 'program']);
  });
  assert.equal(h.ga.length, 5); assert.equal(h.meta.length, 5);
  assert.equal(h.window.dataLayer.length, 0);
  assert.doesNotMatch(JSON.stringify([h.ga, h.meta]), /generate_lead|"Lead"|Schedule|Purchase|booking_confirmed|email|phone|contact_id/);
});

test('category consent, GPC, withdrawal and absent Pixel fail closed without replay', () => {
  for (const analytics of [false, true]) for (const ads of [false, true]) {
    const h = harness({ released: true, analytics, ads }); h.click();
    assert.equal(h.ga.length, Number(analytics)); assert.equal(h.meta.length, Number(ads));
  }
  for (const options of [{ gpc: true }, { userData: false }, { pixel: false }]) {
    const h = harness({ released: true, analytics: true, ads: true, ...options }); h.click();
    assert.equal(h.ga.length, 1); assert.equal(h.meta.length, 0);
  }
  const h = harness({ released: true }); h.click();
  h.window.joaoConsentState = { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted' };
  assert.equal(h.ga.length, 0); assert.equal(h.meta.length, 0);
  h.click(); assert.equal(h.ga.length, 1); assert.equal(h.meta.length, 1);
  h.window.joaoConsentState = {}; h.click();
  assert.equal(h.ga.length, 1); assert.equal(h.meta.length, 1);
});

test('cancelled clicks emit nothing; GTM queue fallback keeps the explicit GA4 destination', () => {
  const h = harness({ released: true, analytics: true, ads: true }); h.click(0, true);
  assert.equal(h.ga.length, 0); assert.equal(h.meta.length, 0);
  delete h.window.gtag; h.click();
  const queued = Array.from(h.window.dataLayer[0]);
  assert.deepEqual(queued.slice(0, 2), ['event', 'booking_start']);
  assert.equal(queued[2].send_to, 'G-EW2F2YKR3Y');
});
