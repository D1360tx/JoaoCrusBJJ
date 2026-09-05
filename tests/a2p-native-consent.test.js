const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const script = read('site/assets/campaign-site.js');
const assignment = script.match(/bookingDialog.innerHTML =([\s\S]*?);\n    document.body.appendChild/)[1];
const popup = vm.runInNewContext(assignment);

for (const [name, html] of [['contact', read('site/campaign/contact.html')], ['popup', popup]]) {
  test(`${name}: two separate optional unchecked controls and adjacent complete disclosures`, () => {
    for (const [field, purpose] of [
      ['sms_consent', 'non-promotional customer-care'],
      ['sms_marketing_consent', 'promotional and marketing'],
    ]) {
      const input = html.match(new RegExp(`<input[^>]*name="${field}"[^>]*>`))[0];
      assert.doesNotMatch(input, /\b(?:checked|required|disabled)\b/);
      const id = input.match(/id="([^"]+)"/)[1];
      const label = html.match(new RegExp(`<label for="${id}">([^]*?)</label>`))[1];
      for (const phrase of ['Joao Crus Brazilian Jiu-Jitsu', purpose, 'recurring automated', 'Message frequency varies', 'Message and data rates may apply', 'STOP', 'HELP', 'Consent is optional and is not a condition of purchase', 'Privacy Policy', 'Terms']) assert.ok(label.includes(phrase), `${field}: ${phrase}`);
      assert.match(label, /href="(?:privacy.html|\/privacy-policy\/)"/);
      assert.match(label, /href="(?:terms.html|\/terms\/)"/);
    }
    assert.match(html, /data-sms-disclosure-version="website_sms_v3"/);
    assert.doesNotMatch(html, /Automated texts are not enabled/);
  });
}

test('form serializer emits both boolean consents and version only for SMS-capable forms', () => {
  const code = script.slice(script.indexOf('      data.consent ='), script.indexOf('      data.request_id ='));
  for (const version of [undefined, 'website_sms_v3']) for (const checked of [false, true]) {
    const data = { sms_consent: 'on', sms_marketing_consent: 'on', consent_disclosure_version: 'forged' };
    const form = {
      dataset: { formId: 'contact_page', smsDisclosureVersion: version },
      querySelector: selector => selector.includes('sms_marketing_consent') ? !checked : selector.includes('sms_consent') ? checked : true,
    };
    vm.runInNewContext(code, { data, form });
    assert.equal(data.sms_consent, version ? checked : undefined);
    assert.equal(data.sms_marketing_consent, version ? !checked : undefined);
    assert.equal(data.consent_disclosure_version, version);
    assert.equal(data.consent, true);
  }
});

test('both legal pages cover customer-care, retention, no marketing sharing and mutual links', () => {
  for (const p of ['privacy', 'terms']) {
    const html = read(`site/campaign/${p}.html`).replace(/\s+/g, ' ');
    for (const term of ['Joao Crus BJJ', 'customer-care', 'promotional', 'independent', 'Message frequency varies', 'Message and data rates may apply', 'STOP', 'HELP', 'Consent is not a condition of purchase', 'opt-out', 'not sold', 'third parties or affiliates', 'marketing or promotional purposes']) assert.ok(html.includes(term), `${p}: ${term}`);
    assert.match(html, /href="sms-opt-in.html"/);
    assert.doesNotMatch(html, /—/);
  }
  assert.match(read('site/campaign/privacy.html'), /href="terms.html"/);
  assert.match(read('site/campaign/privacy.html'), /Data security practices/);
  assert.match(read('site/campaign/terms.html'), /href="privacy.html"/);
  assert.match(read('site/campaign/terms.html'), /Carriers are not liable for\s+delayed or undelivered messages/);
});

test('historic opt-in URL leads to real native forms without a widget', () => {
  const page = read('site/campaign/sms-opt-in.html');
  assert.doesNotMatch(page, /chat.widget|data-widget-id|widgets.leadconnectorhq.com/i);
  for (const target of ['contact.html', 'program-fit-quiz.html', 'privacy.html', 'terms.html']) assert.ok(page.includes(`href="${target}"`));
  const route = JSON.parse(read('site/campaign/seo-pages.json')).pages.find(p => p.path === '/sms-opt-in/');
  assert.equal(route.file, 'sms-opt-in.html');
  assert.equal(route.indexable, false);
});

test('built native form, policy links and historic route preserve the contract', () => {
  const contact = read('dist/contact/index.html');
  assert.match(contact, /name="sms_consent"/);
  assert.match(contact, /name="sms_marketing_consent"/);
  assert.match(contact, /data-sms-disclosure-version="website_sms_v3"/);
  assert.match(contact, /href="\/privacy-policy\/"/);
  assert.match(contact, /href="\/terms\/"/);
  const guide = read('dist/sms-opt-in/index.html');
  assert.match(guide, /href="\/contact\/"/);
  assert.match(guide, /href="\/program-finder\/quiz\/"/);
  assert.doesNotMatch(guide, /data-widget-id|widgets.leadconnectorhq.com/);
});
