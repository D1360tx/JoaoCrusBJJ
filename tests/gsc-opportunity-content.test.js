const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('site/campaign/seo-pages.json'));
const owners = [
  ['/', 'index.html', /Brazilian Jiu-Jitsu in Dripping Springs/],
  ['/austin-brazilian-jiu-jitsu/', 'austin.html', /Austin Brazilian Jiu-Jitsu at Castle Hill/],
  ['/adults-program/', 'adults.html', /Beginner & Adult BJJ in Dripping Springs/],
  ['/kids-program/', 'kids.html', /Kids Martial Arts & BJJ in Dripping Springs/],
  ['/little-champions/', 'little-champions.html', /Preschool & Kids BJJ Ages 3-7 in Dripping Springs/],
  ['/teens/', 'teens-campaign-ages-13-17.html', /Teen Brazilian Jiu-Jitsu Ages 13-17 in Dripping Springs/]
];
const decode = s => s.replaceAll('&amp;', '&');
for (const [route, file, title] of owners) {
  test(`GSC owner ${route} retains unique metadata, emotional H1 and honest next step`, () => {
    const rows = manifest.pages.filter(p => p.path === route);
    assert.equal(rows.length, 1);
    const page = rows[0]; assert.equal(page.indexable, true); assert.match(page.title, title);
    const html = read(page.source_file ? `site/${page.source_file}` : `site/campaign/${file}`);
    assert.equal(decode(html.match(/<title>(.*?)<\/title>/s)[1]), page.title);
    assert.ok(html.includes(page.description.replaceAll('&', '&amp;')));
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    const body = html.split('<main')[1].split('</main>')[0];
    assert.match(body, /Joao personally calls/);
    assert.match(body, /free studio visit or trial class/);
    assert.doesNotMatch(body, /no[- ]?gi|only local school|nobody else|guaranteed self.defense|dedicated self.defense course|—/i);
  });
}
test('contextual links distinguish location, program and supporting resources', () => {
  const links = {
    'index.html': ['austin.html', 'kids.html', 'adults.html'],
    'austin.html': ['youth.html', 'adults.html', 'private-coaching.html'],
    'adults.html': ['austin.html', 'private-coaching.html', 'about.html'],
    'kids.html': ['little-champions.html', 'youth.html', 'choose-kids-bjj-program.html', '../teens-campaign-ages-13-17.html'],
    'little-champions.html': ['bjj-class-ages-3-7.html', 'age-start-bjj.html', 'kids.html']
  };
  for (const [file, targets] of Object.entries(links)) {
    const body = read(`site/campaign/${file}`).split('<main')[1].split('</main>')[0];
    for (const target of targets) {
      assert.ok(body.includes(`href="${target}"`), `${file}: contextual ${target}`);
      assert.ok(fs.existsSync(path.resolve(root, 'site/campaign', target)));
    }
  }
  const about = read('site/campaign/about.html');
  assert.match(about, /Carlson Gracie/); assert.match(about, /De La Riva/);
});
test('teen availability is not a launch or instant-booking promise', () => {
  const html = read('site/teens-campaign-ages-13-17.html');
  assert.match(html, /Teen BJJ is available/);
  assert.match(html, /Details, schedule, and capacity need discussion with Joao/);
  assert.match(html, /data-form-id="teens_interest" data-lead-type="teen_interest"/);
  assert.match(html, /data-success-url="\/thank-you\/"/);
  assert.doesNotMatch(html, /Not yet\. The dedicated teen cohort|Program forming now|class is being built|program is being built|first teen class|first schedule|first peer group|program is being designed/i);
  const calendar = read('site/assets/class-calendar.js');
  assert.match(calendar, /Discuss teen availability with Joao/);
  assert.doesNotMatch(calendar, /schedule forming|choose the first class time/);
});
test('Austin facts remain synchronized without duplicating the calendar', () => {
  const llms = read('site/campaign/llms.txt');
  assert.match(llms, /5:00-5:45 p\.m\./);
  assert.match(llms, /Tuesday and Thursday from 6:00-7:00 p\.m\./);
  assert.match(llms, /private instruction is available by appointment/);
  assert.doesNotMatch(llms, /schedule is not currently published|5:00-6:00/);
  const calendar = read('site/assets/class-calendar.js');
  for (const day of [1, 3]) assert.ok(calendar.includes(`{ day: ${day}, time: "6:00–7:00 PM", name: "Adults", program: "adults", groups: ["adults"], location: "austin", }`));
  const austin = read('site/campaign/austin.html');
  assert.match(austin, /data-default-location="austin"/);
  assert.match(austin, /1112 N Lamar Blvd, Austin TX 78703/);
  assert.match(austin, /6:00–7:00 p\.m\./);
  const schema = JSON.parse(austin.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const location = schema['@graph'].find(x => x['@id'].endsWith('/austin-brazilian-jiu-jitsu/#location'));
  assert.equal(location.address.streetAddress, '1112 N Lamar Blvd');
  assert.equal(location.address.postalCode, '78703');
});
