const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('site/campaign/thank-you.html', 'utf8');

test('thank-you page confirms a real accepted production request', () => {
  assert.match(source, /Your request is in\./);
  assert.match(source, /help\s+you choose the right program, location, and first class\./);
  assert.doesNotMatch(source, /Once the production form is connected/i);
});
