const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
// Vercel serves a static review build without PHP endpoints/runtime. Never skip
// PHP checks for production artifacts or a normal local/release validation run.
const phpProbe = spawnSync(process.env.PHP_BINARY || 'php', ['-n', '-v'], { encoding: 'utf8' });
const previewWithoutPhp = process.env.VERCEL === '1'
  && !fs.existsSync(path.join(root, 'dist/api/lead.php'))
  && phpProbe.error?.code === 'ENOENT';
const phpOptions = { skip: previewWithoutPhp ? 'Static Vercel preview has no PHP runtime; required in production validation' : false };

test('offline PHP booking/tag/strict-map/click-ID contract', phpOptions, () => {
  const result = spawnSync(process.env.PHP_BINARY || 'php', ['-n', '-d', 'allow_url_fopen=0', '-d', 'disable_functions=curl_exec,mail,fsockopen,stream_socket_client', 'tests/lead-booking-routing.php'], { cwd: root, encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(result.error, undefined, 'PHP CLI required: set PHP_BINARY to an available PHP 8 binary');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /PASS: \d+ routing\/payload\/map\/tag\/click-ID assertions; zero external calls/);
});

test('Homeschool is explicit in contact/popup options and maps as a class inquiry', () => {
  const vm = require('node:vm');
  const script = fs.readFileSync(path.join(root, 'site/assets/campaign-site.js'), 'utf8');
  const popup = vm.runInNewContext(script.match(/bookingDialog.innerHTML =([\s\S]*?);\n    document.body.appendChild/)[1]);
  const contact = fs.readFileSync(path.join(root, 'site/campaign/contact.html'), 'utf8');
  for (const html of [popup, contact]) assert.match(html, /<option>Homeschool<\/option>/);
  const code = script.slice(script.indexOf('function leadType('), script.indexOf('function leadType(') + 1500);
  const functionSource = code.slice(0, code.indexOf('\n    function ', 1));
  const context = {}; vm.createContext(context); vm.runInContext(functionSource, context);
  assert.equal(context.leadType({ dataset: {} }, { program: 'Homeschool' }), 'class_inquiry');
});

test('inactive sibling attribution closure retains the same field-specific limits without dispatch', phpOptions, () => {
  const source = fs.readFileSync(path.join(root, 'deploy/bluehost/api/contact.php'), 'utf8');
  const clean = source.slice(source.indexOf('function clean_value'), source.indexOf("if (($_SERVER['REQUEST_METHOD']"));
  const attribution = source.slice(source.indexOf('$attributionKeys ='), source.indexOf('$firstTouch ='));
  const code = clean + attribution + `foreach (['fbclid','gclid','wbraid','gbraid','msclkid','utm_campaign'] as $key) { foreach ([160,161,512,513] as $length) { $touch = $cleanTouch([$key => str_repeat('x', $length)]); $limit = in_array($key,['fbclid','gclid'],true) ? 512 : 160; if (strlen($touch[$key]) !== min($length,$limit)) throw new RuntimeException('Boundary failed'); } } echo 'PASS';`;
  const result = spawnSync(process.env.PHP_BINARY || 'php', ['-n', '-d', 'allow_url_fopen=0', '-d', 'disable_functions=curl_exec,mail,fsockopen,stream_socket_client', '-r', code], { encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.stdout, 'PASS');
});
