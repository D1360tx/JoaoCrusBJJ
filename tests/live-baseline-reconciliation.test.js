const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const ids = ['utm_id','campaign_id','adset_id','ad_id','gclid','fbclid','wbraid','gbraid','msclkid'];

function sanitize(script, params) {
  const window = {location: new URL('https://joaocrusbjj.com/test/?' + params), navigator: {}, history: {replaceState() {}}, dispatchEvent() {}};
  const document = {referrer: 'https://joaocrusbjj.com/?email=private@example.invalid'};
  vm.runInNewContext(script, {window, document, URL, CustomEvent: function() {}});
  return new URL(window.dataLayer.find(x => x.page_location).page_location);
}

test('every emitted route retains CTA placement and strict numeric campaign/click IDs before GTM', () => {
  const manifest = JSON.parse(read('site/campaign/seo-pages.json'));
  for (const entry of manifest.pages.filter(p => p.file !== 'about-ai-coaches.html')) {
    const file = path.join('dist', entry.path, 'index.html');
    const html = read(file);
    const script = html.match(/<script>(\(function\(w,d,s,l,i\)[\s\S]*?)<\/script>/)[1];
    const params = new URLSearchParams({cta_placement:'hero', placement:'feed', email:'private@example.invalid', source:'austin-program-fit', start:'quiz', embed:'1'});
    ids.forEach(k => params.set(k, '120251246135250072'));
    const safe = sanitize(script, params);
    ids.forEach(k => assert.equal(safe.searchParams.get(k), params.get(k), entry.path + k));
    for (const k of ['cta_placement','placement','source','start','embed']) assert.equal(safe.searchParams.get(k), params.get(k));
    assert.equal(safe.searchParams.has('email'), false);
    for (const invalid of ['private@example.invalid','bad value','bad:identifier','x\nvalue','x'.repeat(161)]) {
      const rejected = sanitize(script, new URLSearchParams(Object.fromEntries(ids.map(k => [k, invalid]))));
      ids.forEach(k => assert.equal(rejected.searchParams.has(k), false, entry.path + k));
    }
  }
});

test('Austin forwarding keeps ad placement separate from CTA position with and without shared attribution', () => {
  for (const shared of [true, false]) {
    const link = {href:'https://joaocrusbjj.com/austin-program-finder/quiz/?source=austin-program-fit&embed=1&start=quiz&placement=hero', addEventListener() {}};
    const params = new URLSearchParams({placement:'feed', campaign_name:'campaign',adset_name:'set',ad_name:'ad',site_source_name:'ig'});
    ids.forEach(k => params.set(k, '120251246135250072'));
    const window = {location:new URL('https://joaocrusbjj.com/?'+params), history:{}, scrollTo() {}, addEventListener() {}};
    if(shared) window.JoaoAttribution = require('../site/assets/attribution.js');
    const document = {querySelectorAll:s => s === '[data-austin-quiz]' ? [link] : [],querySelector:() => null};
    vm.runInNewContext(read('site/assets/austin-campaign.js'), {window, document, URL, URLSearchParams});
    const target = new URL(link.href, window.location);
    for (const [k,v] of params) assert.equal(target.searchParams.get(k),v,k);
    assert.equal(target.searchParams.get('cta_placement'),'hero');
    assert.equal(target.searchParams.get('start'),'quiz');
  }
});

test('Austin accepted-lead routing separates analytics and advertising consent', () => {
  const source = read('site/assets/austin-program-fit-quiz.js');
  for (const analytics of ['granted','denied']) for (const advertising of ['granted','denied']) {
    const ga = [], meta = [];
    const window = {joaoConsentState:{analytics_storage:analytics,ad_storage:advertising,ad_user_data:advertising},dataLayer:[],gtag:(...args)=>ga.push(args),fbq:(...args)=>meta.push(args)};
    const context = {window}; vm.createContext(context);
    vm.runInContext("const quizName='program_fit';" + source.slice(source.indexOf('const routedMetaEventIds'),source.indexOf('function safeStepAnswer')) + ';globalThis.route=routeAcceptedLead;',context);
    context.route({recommendation:'youth_bjj',lead_program:'youth_bjj',lead_location:'austin',meta_event_id:'lead_qa.matrix_1234567890',email:'private@example.invalid',phone:'2025550147'});
    assert.equal(ga.length,analytics==='granted'?1:0);
    assert.equal(meta.length,advertising==='granted'?1:0);
    if(ga.length) assert.equal(ga[0][1],'generate_lead');
    if(meta.length) assert.equal(meta[0][3].eventID,'lead_qa.matrix_1234567890');
    assert.doesNotMatch(JSON.stringify([ga,meta,window.dataLayer]),/private@example|2025550147/);
    assert.equal(window.dataLayer.some(e=>e.event==='lead_submit_success'),false);
  }
});

test('Austin delayed Meta delivery stops when consent is withdrawn', () => {
  const source = read('site/assets/austin-program-fit-quiz.js');
  const timers = [], calls = [];
  const window = {joaoConsentState:{ad_storage:'granted',ad_user_data:'granted'},setTimeout:f=>timers.push(f),dataLayer:[]};
  const context = {window};
  vm.createContext(context);
  vm.runInContext("const quizName='program_fit';" + source.slice(source.indexOf('const routedMetaEventIds'),source.indexOf('function safeStepAnswer')) + ';globalThis.route=routeAcceptedLead;',context);
  context.route({meta_event_id:'lead_qa.withdrawal_1234567890'});
  assert.equal(timers.length,1);
  window.joaoConsentState.ad_user_data='denied';
  window.fbq=(...args)=>calls.push(args);
  timers.shift()();
  assert.equal(calls.length,0);
});
