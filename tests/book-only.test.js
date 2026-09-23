const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const calendars = ['adults-first-ds', 'little-champions-first-ds', 'youth-first-ds', 'homeschool-first-ds', 'youth-first-austin', 'adults-first-austin'].map(slug => `https://api.leadconnectorhq.com/widget/bookings/${slug}`);
const labels = ['Adults (Dripping Springs)', 'Little Champions (Dripping Springs)', 'Youth (Dripping Springs)', 'Homeschool (Dripping Springs)', 'Youth (Austin)', 'Adults (Austin)'];

function runShell(source, bookingOnly) {
  const appended = [], events = {}, classes = new Set();
  const node = () => ({ textContent: '', attributes: {}, addEventListener() {}, setAttribute(k,v) { this.attributes[k] = v; }, querySelector: () => node(), querySelectorAll: () => [], style: { setProperty() {} } });
  const menu = node(), year = node(), nav = node(), header = node();
  header.getBoundingClientRect = () => ({ bottom: 80 });
  const body = { hasAttribute: key => bookingOnly && key === 'data-booking-only', appendChild: el => appended.push(el), classList: { contains: k => classes.has(k), add: k => classes.add(k), remove: k => classes.delete(k), toggle(k,on) { on ? classes.add(k) : classes.delete(k); } } };
  const document = { body, querySelector: s => ({ '.menu': menu, '.nav': nav, '.header': header })[s] || null, querySelectorAll: s => s === '[data-year]' ? [year] : [], createElement: tag => Object.assign(node(), { tagName: tag }), addEventListener(name, fn) { (events[name] ||= []).push(fn); } };
  const location = { pathname: '/book/', hash: '' };
  const window = { location, addEventListener() {}, requestAnimationFrame: fn => fn(), joaoConsentState: { analytics_storage: 'granted' } };
  vm.runInNewContext(source, { document, window, location, requestAnimationFrame: fn => fn(), Set, Date });
  events.DOMContentLoaded[0]();
  return { appended, events, classes, menu, year, window };
}

test('production booking page uses a content-hashed isolated runtime and exact calendar-only contract', () => {
  const html = read('dist/book/index.html');
  const source = read('site/assets/campaign-site.js');
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
  assert.match(html, /<body data-booking-only>/);
  assert.ok(html.includes(`/assets/campaign-site.${hash}.js`));
  assert.equal(read(`dist/assets/campaign-site.${hash}.js`), source);
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /rel="canonical" href="https:\/\/joaocrusbjj.com\/book\/"/);
  assert.deepEqual([...html.matchAll(/href="(https:\/\/api\.leadconnectorhq\.com\/widget\/bookings\/[^" ]+)"/g)].map(m => m[1]), calendars);
  assert.deepEqual([...html.matchAll(/<strong>([^<]+)<\/strong><span>[^<]*open calendar/g)].map(m => m[1]), labels);
  assert.doesNotMatch(html, /\/widget\/booking\/|\(DS\)/);
  assert.doesNotMatch(html, /<form\b|<dialog\b|lead\.php|type="submit"|(?:src|href)="[^"]*quiz/i);
  for (const name of ['consent-policy.js', 'attribution.js', 'consent-controls.js', 'GTM-596MGPMD']) assert.ok(html.includes(name));
  for (const file of ['dist/contact/index.html', 'dist/index.html']) assert.ok(!read(file).includes(`campaign-site.${hash}.js`));
  const shell = runShell(read(`dist/assets/campaign-site.${hash}.js`), true);
  assert.equal(shell.appended.length, 0, 'must never create/append a dialog or form');
  assert.equal(shell.year.textContent, new Date().getFullYear());
  shell.menu.onclick(); assert.ok(shell.classes.has('nav-open'));
  shell.events.keydown[0]({ key: 'Escape' }); assert.ok(!shell.classes.has('nav-open'));
  const link = { getAttribute: () => '/contact/', closest: () => null };
  for (const listener of shell.events.click) listener({ target: { closest: () => link } });
  assert.equal(shell.window.dataLayer[0].event, 'booking_start', 'contact analytics must tolerate absent dialog');
});

test('unmarked pages still initialize the existing booking form', () => {
  const shell = runShell(read('site/assets/campaign-site.js'), false);
  assert.equal(shell.appended.length, 1);
  assert.equal(shell.appended[0].tagName, 'dialog');
  assert.match(shell.appended[0].innerHTML, /<form class="booking-form"/);
});
