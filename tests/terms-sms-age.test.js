const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Terms state the exact SMS adult eligibility restriction once', () => {
  const sentence = 'You must be 18 years of age or older to use this SMS service.';
  for (const file of ['site/campaign/terms.html', 'dist/terms/index.html']) {
    const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert.equal(html.split(sentence).length - 1, 1, file);
    assert.ok(html.includes(`<h2>Joao Crus BJJ SMS messaging terms</h2>\n          <p>${sentence}</p>`), file);
  }
});
