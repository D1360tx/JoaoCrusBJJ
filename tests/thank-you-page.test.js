const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('site/campaign/thank-you.html', 'utf8');

test('thank-you page confirms a real accepted production request', () => {
  assert.match(source, /We’ll reach out shortly\./);
  assert.match(source, /Joao will personally call to help you plan your first visit\./);
  assert.match(source, /Your form did not reserve a calendar slot\./);
  assert.doesNotMatch(source, /Once the production form is connected/i);
});
