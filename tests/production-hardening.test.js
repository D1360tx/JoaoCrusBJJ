const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('404 uses an internal error document and script-free recovery links', () => {
  const config = read('deploy/bluehost/.htaccess');
  assert.match(config, /^ErrorDocument 404 \/404\.html$/m);
  const html = read('deploy/bluehost/404.html');
  for (const route of ['training-programs','classes-schedule','contact']) {
    assert.match(html, new RegExp(`href="/${route}/"`));
    assert.ok(JSON.parse(read('site/campaign/seo-pages.json')).pages.some(p => p.path === `/${route}/`));
  }
  assert.match(html, /noindex,follow/);
  assert.doesNotMatch(html, /<script|<form|http-equiv="refresh"/i);
  assert.match(config, /SetEnv GHL_ENV_FILE \/home1\/joaocrus\/\.joao-secure\/joao-highlevel.env/);
  assert.match(config, /SetEnv LEAD_LOG_FILE \/home1\/joaocrus\/\.joao-secure\/joao-lead-api.log/);
});

test('display optimization is scoped to img src and idempotent', () => {
  execFileSync('python3', ['-c', `
import importlib.util
s=importlib.util.spec_from_file_location('build','scripts/build_vercel_site.py')
m=importlib.util.module_from_spec(s); s.loader.exec_module(m)
h='<img src="../assets/joao-crus-bjj-logo.png" width="52" alt="Logo"><a href="../assets/joao-crus-bjj-logo.png">Download</a><meta content="../assets/joao-crus-bjj-logo.png">'
a=m.optimize_display_images(h)
assert a == h.replace('src="../assets/joao-crus-bjj-logo.png"','src="../assets/joao-crus-bjj-logo-lossless.webp"')
assert m.optimize_display_images(a)==a
`], {cwd: root});
});

test('derivatives and preserved originals are present and smaller', () => {
  for(const name of ['joao-crus-bjj-logo','campaign-images/trauma-to-triumph','campaign-images/grapple-with-emotions']) {
    const png=fs.statSync(path.join(root,'site/assets',name+'.png')).size;
    const webp=fs.statSync(path.join(root,'site/assets',name+'-lossless.webp')).size;
    assert.ok(webp < png * 0.7);
  }
});
