const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'site/campaign/resources-draft.html'), 'utf8');
const expected = ['https://grapplewithemotions.com/', 'https://jiu-jitsuclasses.online/courses/', 'https://blueprint.justjiuit.com/', 'https://boundaryguard.joaocrusbjj.com/', 'https://blackbeltparenting.net/'];
const cards = [...html.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/g)];
test('resources: stable preview-first markup and desktop-only alternation', () => {
  assert.equal(crypto.createHash('sha256').update(html).digest('hex'), 'bbc88693bbfda796e25bd412e251ea81438598735f265854734b00241828e8d9', 'Approved copy, links and HTML remain byte-identical');
  for (const [, , body] of cards) {
    assert.match(body, /^\s*<figure class="jr-preview">/);
    assert.ok(body.indexOf('</figure>') < body.indexOf('<div class="jr-project-copy">'));
    assert.doesNotMatch(body, /tabindex=/);
  }
  const css = fs.readFileSync(path.join(root, 'site/assets/resources-draft.css'), 'utf8');
  assert.match(css, /@media\(min-width:921px\)\{\s*\.jr-project:nth-of-type\(even\)/);
  assert.match(css, /grid-template-areas:"copy preview"/);
  assert.match(css, /\.jr-project:nth-of-type\(even\)>\.jr-preview\{grid-area:preview\}/);
  assert.match(css, /\.jr-project:nth-of-type\(even\)>\.jr-project-copy\{grid-area:copy\}/);
});
test('resources: exact five ordered URLs and live cards', () => {
  assert.equal(cards.length, 5);
  cards.forEach(([,attrs,body], i) => {
    assert.ok(attrs.includes(`data-resource-url="${expected[i]}"`));
    assert.match(attrs, /data-status="available"/);
    assert.ok(body.includes(`0${i+1}`));
    assert.match(body, /<h2\b/);
    assert.match(body, /<img\b/);
  });
});
test('resources: approved naming and explicit audience categories', () => {
  const visible = html.replace(/<[^>]*>/g, ' ');
  assert.doesNotMatch(visible, /projects/i);
  assert.match(html, /Beyond the Academy/);
  assert.match(html, /Learning Beyond the Mat/);
  assert.match(html, /Books, Courses &amp; Resources<\/span> <span[^>]*>by Joao Crus/);
  assert.equal((html.match(/Books &amp; Resources/g)||[]).length, 2);
  for (const label of ['Books &amp; emotional development','Online Jiu-Jitsu instruction','Coach education','Boundaries &amp; personal growth','Parenting resources','Families &amp; coaches','Students &amp; instructors','Martial arts instructors','Adults','Parents &amp; caregivers']) assert.ok(html.includes(label),label);
});
test('resources: noindex, one H1, ribbon and no active integrations', () => {
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.equal((html.match(/<h1\b/g)||[]).length, 1);
  assert.match(html, /Draft Preview/);
  assert.doesNotMatch(html, /<(script|form|iframe|embed|object)\b|rel="canonical"|—|\son\w+\s*=/i);
});
test('resources: all five external CTAs are exact safe new tabs', () => {
  const links = [...html.matchAll(/<a\b([^>]*href="https:[^"]*"[^>]*)>/g)];
  assert.equal(links.length, 5);
  links.forEach(([,attrs],i) => {
    assert.ok(attrs.includes(`href="${expected[i]}"`));
    assert.match(attrs,/target="_blank"/);
    assert.match(attrs,/rel="noopener noreferrer external"/);
  });
});
test('resources: restored Blueprint screenshot and website, no volatile prices', () => {
  const body = cards[2][2];
  assert.match(body, /href="https:\/\/blueprint.justjiuit.com\/"/);
  assert.match(body, /src="..\/assets\/resources-draft\/blueprint.webp"/);
  assert.match(body, /12-week program with 24 planned classes/);
  assert.match(body, /free coaching community/);
  assert.doesNotMatch(html, /skool\.com|\$\d|unavailable|verification pending|Site not found|disabled|placeholder|coming soon|\bTODO\b/i);
  const image = fs.readFileSync(path.join(root,'site/assets/resources-draft/blueprint.webp'));
  assert.equal(image.toString('ascii',0,4),'RIFF');
  assert.equal(image.toString('ascii',8,12),'WEBP');
  assert.ok(image.length > 10000);
});
test('resources: local assets and real anchor targets exist', () => {
  for (const [,attr,value] of html.matchAll(/\b(href|src)="([^"]*)"/g)) {
    assert.ok(value && !value.startsWith('#'),`${attr}: ${value}`);
    if(value.startsWith('https:')) continue;
    const [file,hash] = value.split('#');
    const dest=path.resolve(root,'site/campaign',file);
    assert.ok(fs.existsSync(dest),dest);
    if(hash) assert.ok(fs.readFileSync(dest,'utf8').includes(`id="${hash}"`));
  }
  const images=[...html.matchAll(/<img\b([^>]*)>/g)]; assert.equal(images.length,6);
  for(const [,attrs] of images){ assert.match(attrs,/width="\d+"/); assert.match(attrs,/height="\d+"/); assert.match(attrs,/alt="[^"]+"/); }
});
test('resources: no production discovery and old draft byte preservation', () => {
  for (const file of fs.readdirSync(path.join(root,'site/campaign')).filter(x=>x.endsWith('.html') && x!=='resources-draft.html')) assert.ok(!fs.readFileSync(path.join(root,'site/campaign',file),'utf8').includes('resources-draft'),file);
  assert.ok(!fs.readFileSync(path.join(root,'site/campaign/seo-pages.json'),'utf8').includes('resources-draft'));
  // SHA-256 baseline at b445fd03bd6b4897195a5f325a56115c41fa16e9; works without Git history.
  const preserved = {
  "scripts/qa_joao_projects_draft.cjs": "f2989673fd710d18e2915666608855c20f258ddc9ed8019c375bf8f4ba3534da",
  "site/assets/joao-projects-draft.css": "6758b0b0502a95785e0136aaaf5f1b775ddad6b020140c789cc7879ff28cf6e6",
  "site/assets/joao-projects-draft/ANTON-OFL.txt": "9267baca92b7a7ce9db6dd9e6cc32c9fe3ddf1ac96e421d5f87c5746b9089d6a",
  "site/assets/joao-projects-draft/SPACE-GROTESK-OFL.txt": "18a4de52385f6b988782639d5d0cc1326e5a8c2de9a7f01d7b20d9aedcc60943",
  "site/assets/joao-projects-draft/anton.ttf": "fd9301f2837c99df2be07cc7f0be66e9470f5354d8fcf1606027c67fcd637a53",
  "site/assets/joao-projects-draft/boundary.webp": "742b0c90a367c95a96baa548ac9388c9a8d5ca31acffd2571d590594d0a282ad",
  "site/assets/joao-projects-draft/courses.webp": "d6bae30145d1db02a6f412e09d37cc5aefaaf830b6ca3819dc7d3784db8fd39b",
  "site/assets/joao-projects-draft/grapple.webp": "031db1653d0fd35604cdaab6914be321d94088a5c2db93166b1e97632d7122f0",
  "site/assets/joao-projects-draft/parenting.webp": "e3e8c256746b59a100f361b156f45ebf04048890c625b375476be931dc3cbe29",
  "site/assets/joao-projects-draft/space-grotesk.ttf": "acad6de1fc93436f5c0f1f4137751ef04f1aea3063e7036535970ffcfbd79f72",
  "site/campaign/joao-projects-draft.html": "4892579cf94c86138074c14caa6bd69bfeb2918ec0798b291dc1467c63a8fd01",
  "tests/joao-projects-draft.test.js": "fd79f13760132661603367042a9576eee91c8b011ea29daf0b87e923231f4e16"
};
  for(const [file, hash] of Object.entries(preserved)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,file);
});
