'use strict';
const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {chromium} = require(process.env.JOAO_PLAYWRIGHT || 'playwright');
const root=path.resolve(__dirname,'..');
const dist=process.env.JOAO_TEST_DIST || path.join(root,'dist');
let browser;
before(async()=>{browser=await chromium.launch({headless:true});});
after(async()=>{await browser?.close();});
const neutral={handled:true,outcome:'neutral',accepted:false,contact_accepted:false,opportunity_accepted:false,tracking_allowed:false};
function php(data, extra={}) {
 const r=spawnSync('unshare',['-Urn',process.env.JOAO_TEST_PHP,'-n','-d','allow_url_fopen=0','-d','disable_functions=mail,exec,shell_exec,system,passthru,popen,proc_open',path.join(root,'tests/fixtures/lead-abuse-runner.php')],{input:JSON.stringify({data,...extra}),encoding:'utf8',env:{PATH:process.env.PATH}});
 assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);
}
async function setup(url, options={}) {
 const context=await browser.newContext({viewport:{width:options.width || 390,height:844},serviceWorkers:'block'});
 context.setDefaultTimeout(5000);
 const posts=[],external=[],consoleErrors=[];
 await context.addInitScript(({denied})=>{
   window.__qaNow=1799999990000;Date.now=()=>window.__qaNow;
   window.__ga=[];window.__meta=[];window.dataLayer=[];
   window.joaoConsentState={analytics_storage:denied?'denied':'granted',ad_storage:denied?'denied':'granted',ad_user_data:denied?'denied':'granted'};
   window.gtag=(...a)=>window.__ga.push(a);window.fbq=(...a)=>window.__meta.push(a);
   window.JoaoAttribution={metaContext:()=>({ad_storage:denied?'denied':'granted',ad_user_data:denied?'denied':'granted'})};
 },{denied:options.denied || false});
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.hostname!=='qa.local'){external.push(req.url());await route.fulfill({status:200,body:''});return;}
  if(u.pathname==='/api/lead.php') {
    const data=req.postDataJSON();if(options.old) {delete data.form_started_at;delete data.abuse_protocol_version;}
    const fail=options.fail || (options.failFirst && posts.length===0 ? '/notes' : '');
    const result=php(data,fail?{fail}:{});posts.push({data,result});
    const body=options.reply?options.reply(data):result.body;
    await route.fulfill({status:result.status,contentType:'application/json',body:JSON.stringify(body)});return;
  }
  if(req.resourceType()==='script'&&!/\/(campaign-site(?:\.[a-f0-9]+)?|program-fit-quiz|austin-program-fit-quiz)\.js$/.test(u.pathname)) {await route.fulfill({status:200,body:''});return;}
  if(options.cached && /\/campaign-site(?:\.[a-f0-9]+)?\.js$/.test(u.pathname)) {
    await route.fulfill({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(root,'tests/fixtures/cached-campaign-site.js'))});return;
  }
  let filename=path.join(dist,u.pathname.replace(/^\//,''));if(u.pathname.endsWith('/'))filename=path.join(filename,'index.html');
  assert.ok(filename.startsWith(dist+path.sep));
  if(!fs.existsSync(filename)){await route.fulfill({status:404,body:''});return;}
  const mime=filename.endsWith('.html')?'text/html':filename.endsWith('.js')?'application/javascript':filename.endsWith('.css')?'text/css':'application/octet-stream';
  await route.fulfill({status:200,contentType:mime,body:fs.readFileSync(filename)});
 });
 const page=await context.newPage();page.on('pageerror',e=>consoleErrors.push(e.message));await page.goto('https://qa.local'+url);
 await page.evaluate(denied=>{window.joaoConsentState={analytics_storage:denied?'denied':'granted',ad_storage:denied?'denied':'granted',ad_user_data:denied?'denied':'granted'};window.gtag=(...a)=>window.__ga.push(a);window.fbq=(...a)=>window.__meta.push(a);},options.denied || false);
 return {context,page,posts,external,consoleErrors};
}
async function snapshot(page){return page.evaluate(()=>({ga:window.__ga,meta:window.__meta,events:window.dataLayer.filter(x=>x&&typeof x==='object').map(x=>x.event)}));}
function noConversion(s){assert.ok(!s.events.some(x=>/lead_submit_success|guide_request_success|quiz_result_view|lead_submit_error/.test(x||'')),JSON.stringify(s));assert.equal(s.ga.filter(x=>['generate_lead','guide_request','guide_request_success','lead_submit_success'].includes(x[1])).length,0);assert.equal(s.meta.filter(x=>x[1]==='Lead').length,0);}
async function fillLegacy(page, selector) {
 const form=page.locator(selector);await form.locator('[name="name"]').fill('Maria Example');await form.locator('[name="email"]').fill('maria@example.invalid');
 if(await form.locator('[name="phone"]').count())await form.locator('[name="phone"]').fill('5125550100');
 for(const [n,v] of [['program','Adults'],['location','Dripping Springs']])if(await form.locator(`[name="${n}"]`).count())await form.locator(`[name="${n}"]`).selectOption({label:v});
 await form.locator('[name="consent"]').check();return form;
}
async function fullQuiz(page, austin, branch='adult') {
 const start=page.locator('[data-start]');if(await start.isVisible())await start.click();
 const audience=page.locator(`[name="audience"][value="${branch}"]`);if(await audience.isVisible()){await audience.check();await page.locator('[data-next]').click();}
 if(branch==='child')await page.locator('[name="child_count"][value="1"]').check();
 await page.locator(`[name="stage"][value="${branch==='child'?'youth':'new'}"]`).check();await page.locator('[data-next]').click();
 await page.locator(`[name="goal"][value="${branch==='child'?'confidence':'fundamentals'}"]`).check();await page.locator('[data-next]').click();
 await page.locator(`[name="experience"][value="${branch==='child'?'new':'group'}"]`).check();await page.locator('[data-next]').click();
 await page.locator(`[name="location"][value="${austin?'austin':'dripping'}"]`).check();await page.locator('[data-next]').click();
 await page.locator('[name="first_name"]').fill('Maria');await page.locator('[name="email"]').fill('maria@example.invalid');await page.locator('[name="phone"]').fill('5125550100');await page.locator('[name="email_consent"]').check();
}
for(const route of ['/program-finder/quiz/','/austin-program-finder/quiz/']) {
 const austin=route.includes('austin');
 for(const scenario of ['accepted','honeypot','fast','future','missing','malformed','stale','old','malformed-neutral','provider-failure']) test(route+' full adult quiz '+scenario,async()=>{
   const q=await setup(route,{old:scenario==='old',fail:scenario==='provider-failure'?'/notes':undefined,reply:scenario==='malformed-neutral'?()=>({...neutral,meta_event_id:'forged'}):undefined});
   try {
     const startBefore=await q.page.locator('[data-fit-form]').getAttribute('data-form-started-at');
     if(!austin)assert.equal(startBefore,null);
     await fullQuiz(q.page,austin);
     const start=await q.page.locator('[data-fit-form]').getAttribute('data-form-started-at');assert.equal(start,'1799999990000');
     await q.page.locator('[data-back]').click();await q.page.locator('[data-next]').click();assert.equal(await q.page.locator('[data-fit-form]').getAttribute('data-form-started-at'),start);
     if(scenario==='honeypot')await q.page.locator('[name="company_website"]').evaluate(el=>el.value='bot');
     const times={fast:'1799999999000',future:'1800000000001',malformed:'NaN',stale:'1799910000000'};
     if(times[scenario])await q.page.locator('[data-fit-form]').evaluate((el,time)=>el.dataset.formStartedAt=time,times[scenario]);
     if(scenario==='missing')await q.page.locator('[data-fit-form]').evaluate(el=>delete el.dataset.formStartedAt);
     await q.page.locator('[data-submit]').click();
     await q.page.waitForFunction(()=>!document.querySelector('[data-submit]').disabled);
     assert.equal(q.posts.length,1);const {data,result}=q.posts[0];assert.equal(data.abuse_protocol_version,scenario==='old'?undefined:2);assert.ok(Object.hasOwn(data,'company_website'));
     const state=await snapshot(q.page);
     if(['accepted','stale'].includes(scenario)) {
       assert.equal(result.body.accepted,true,JSON.stringify(result));await q.page.locator('[data-screen="result"]').waitFor({state:'visible'});
       assert.equal(state.ga.filter(x=>x[1]==='generate_lead').length,1);
       const pixel=state.meta.find(x=>x[1]==='Lead');assert.equal(pixel[3].eventID,result.body.meta_event_id);assert.equal(pixel[3].eventID,'lead_'+data.request_id);
       assert.equal(result.calls.find(x=>x.method==='META').event_id,pixel[3].eventID);
       assert.equal(result.logs.some(x=>x.event==='lead_spam_stale_form'),scenario==='stale');
     } else if(['malformed-neutral','provider-failure'].includes(scenario)) {
       assert.ok(state.events.includes('lead_submit_error'));assert.equal(state.meta.length,0);assert.equal(state.ga.filter(x=>x[1]==='generate_lead').length,0);
     } else {
       noConversion(state);assert.equal(result.calls.length,0);
       if(scenario==='old') {assert.match(await q.page.locator('[data-error]').textContent(),/reload/);assert.equal(await q.page.locator('[name="email"]').inputValue(),'maria@example.invalid');}
       else await q.page.locator('[data-screen="neutral"]').waitFor({state:'visible'});
     }
     assert.deepEqual(q.consoleErrors,[]);assert.ok(!q.page.url().includes('thank-you'));
   } finally {await q.context.close();}
 });
 test(route+' full child quiz accepted and paired',async()=>{const q=await setup(route);try{await fullQuiz(q.page,austin,'child');await q.page.locator('[data-submit]').click();await q.page.locator('[data-screen="result"]').waitFor({state:'visible'});assert.equal(q.posts[0].result.body.accepted,true);const s=await snapshot(q.page);assert.equal(s.meta.find(x=>x[1]==='Lead')[3].eventID,q.posts[0].result.body.meta_event_id);assert.deepEqual(q.consoleErrors,[]);}finally{await q.context.close();}});
 test(route+' accepted consent denied suppresses browser conversions',async()=>{const q=await setup(route,{denied:true});try{await fullQuiz(q.page,austin);await q.page.locator('[data-submit]').click();await q.page.locator('[data-screen="result"]').waitFor({state:'visible'});assert.equal(q.posts[0].result.body.accepted,true);const s=await snapshot(q.page);assert.equal(s.ga.filter(x=>['generate_lead','lead_submit_success','guide_request_success'].includes(x[1])).length,0);assert.equal(s.meta.filter(x=>x[1]==='Lead').length,0);}finally{await q.context.close();}});
}
for(const kind of ['static','popup','guide'])for(const scenario of ['honeypot','fast','old'])test(kind+' '+scenario+' no conversion',async()=>{
 const q=await setup(kind==='guide'?'/':'/contact/',{width:kind==='popup'?1280:390});try{
  const selector=kind==='popup'?'[data-booking-form]':'[data-form]';
  if(kind==='popup') {
   assert.equal(await q.page.locator(selector).getAttribute('data-form-started-at'),null);
   await q.page.locator('a[aria-haspopup="dialog"]').first().click();
   assert.equal(await q.page.locator(selector).getAttribute('data-form-started-at'),'1799999990000');
  }
  const form=await fillLegacy(q.page,selector);
  if(scenario==='honeypot')await form.locator('[name="company_website"]').evaluate(el=>el.value='bot');
  if(scenario==='fast')await form.evaluate(el=>el.dataset.formStartedAt='1799999999000');
  if(scenario==='old') {await form.evaluate(el=>delete el.dataset.formStartedAt); /* NaN from current client; explicit old fixture below */}
  await form.locator('[type="submit"]').click();await q.page.waitForFunction(s=>!document.querySelector(s+' [type="submit"]').disabled,selector);
  assert.equal(q.posts.length,1);assert.equal(q.posts[0].result.calls.length,0);noConversion(await snapshot(q.page));assert.ok(!q.page.url().includes('thank-you'));assert.deepEqual(q.consoleErrors,[]);
 }finally{await q.context.close();}
});
test('cached legacy missing timestamp displays reload response and preserves entries',async()=>{const q=await setup('/contact/',{old:true});try{const form=await fillLegacy(q.page,'[data-form]');await form.locator('[type="submit"]').click();await q.page.waitForFunction(()=>document.querySelector('[data-form] .status').textContent.includes('reload'));assert.equal(q.posts[0].result.status,409);assert.equal(await form.locator('[name="email"]').inputValue(),'maria@example.invalid');noConversion(await snapshot(q.page));}finally{await q.context.close();}});
test('book generated hashed runtime never mounts lead UI at five widths',async()=>{for(const width of [390,768,1280,1440,1920]){const q=await setup('/book/',{width});try{assert.equal(await q.page.locator('form,dialog,[name="company_website"]').count(),0);assert.match(await q.page.locator('script[src*="campaign-site"]').getAttribute('src'),/campaign-site\.[a-f0-9]{12}\.js/);assert.equal(q.posts.length,0);assert.deepEqual(q.consoleErrors,[]);}finally{await q.context.close();}}});

test('actual cached baseline campaign runtime receives reload error, never converts',async()=>{
 const q=await setup('/contact/',{cached:true});try{const form=await fillLegacy(q.page,'[data-form]');await form.locator('[type="submit"]').click();await q.page.waitForFunction(()=>document.querySelector('[data-form] .status').textContent.includes('reload'));assert.equal(q.posts[0].data.form_started_at,undefined);assert.equal(q.posts[0].result.status,409);assert.equal(q.posts[0].result.calls.length,0);assert.equal(await form.locator('[name="email"]').inputValue(),'maria@example.invalid');const s=await snapshot(q.page);assert.equal(s.ga.filter(x=>x[1]==='generate_lead').length,0);assert.equal(s.meta.length,0);assert.ok(s.events.includes('lead_submit_error'),'old clients retain their old error diagnostic, not a success');}finally{await q.context.close();}
});

test('complete inventory: 11 static forms mounted, uniform accessible text trap and immutable timer',async()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'site/campaign/seo-pages.json'))).pages;
 const forms=manifest.filter(p=>/\bdata-form(?:\s|=|>)/.test(fs.readFileSync(path.join(root,'site',p.source_file || 'campaign/'+p.file),'utf8')));
 assert.equal(forms.length,11);
 for(const item of forms){const q=await setup(item.path);try{const form=q.page.locator('[data-form]');assert.equal(await form.getAttribute('data-form-started-at'),'1799999990000');const trap=form.locator('[name="company_website"]');assert.equal(await trap.count(),1);assert.equal(await trap.getAttribute('type'),'text');assert.equal(await trap.getAttribute('tabindex'),'-1');assert.equal(await trap.getAttribute('autocomplete'),'off');assert.equal(await trap.getAttribute('maxlength'),'200');assert.ok(await trap.evaluate(el=>el.closest('[aria-hidden="true"]')!==null));assert.ok((await trap.boundingBox()).x<0);await q.page.evaluate(()=>{window.__qaNow+=90000000;window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});assert.equal(await form.getAttribute('data-form-started-at'),'1799999990000');assert.deepEqual(q.consoleErrors,[]);}finally{await q.context.close();}}
});

for(const route of ['/program-finder/quiz/?embed=1&start=quiz','/austin-program-finder/quiz/?embed=1&start=quiz'])test(route+' timer starts on embedded direct open',async()=>{const q=await setup(route);try{assert.equal(await q.page.locator('[data-fit-form]').getAttribute('data-form-started-at'),'1799999990000');assert.ok(await q.page.locator('[data-screen="quiz"]').isVisible());}finally{await q.context.close();}});

test('popup reopen retains timer and request in the same session',async()=>{const q=await setup('/contact/',{width:1280});try{await q.page.locator('a[aria-haspopup="dialog"]').first().click();const form=q.page.locator('[data-booking-form]');const start=await form.getAttribute('data-form-started-at');await q.page.locator('.booking-close').click();await q.page.evaluate(()=>window.__qaNow+=10000);await q.page.locator('a[aria-haspopup="dialog"]').first().click();assert.equal(await form.getAttribute('data-form-started-at'),start);}finally{await q.context.close();}});

for(const route of ['/program-finder/quiz/','/austin-program-finder/quiz/'])test(route+' retry/double-submit preserves IDs/timer and converts once',async()=>{
 const q=await setup(route,{failFirst:true});try{await fullQuiz(q.page,route.includes('austin'));const start=await q.page.locator('[data-fit-form]').getAttribute('data-form-started-at');await q.page.locator('[data-submit]').click();await q.page.waitForFunction(()=>document.querySelector('[data-error]').textContent.includes('could not'));assert.equal(q.posts.length,1);await q.page.evaluate(()=>{window.__qaNow+=10000;document.querySelector('[data-fit-form]').requestSubmit();document.querySelector('[data-fit-form]').requestSubmit();});await q.page.locator('[data-screen="result"]').waitFor({state:'visible'});assert.equal(q.posts.length,2);assert.equal(q.posts[0].data.request_id,q.posts[1].data.request_id);assert.equal(q.posts[1].data.form_started_at,Number(start));const s=await snapshot(q.page);assert.equal(s.ga.filter(x=>x[1]==='generate_lead').length,1);assert.equal(s.meta.filter(x=>x[1]==='Lead').length,1);assert.equal(s.meta.find(x=>x[1]==='Lead')[3].eventID,q.posts[1].result.body.meta_event_id);}finally{await q.context.close();}
});

for(const kind of ['static','popup','guide'])test(kind+' normal accepted flow preserves event pairing and redirect',async()=>{
 const q=await setup(kind==='guide'?'/':'/contact/',{width:1280});try{if(kind==='popup')await q.page.locator('a[aria-haspopup="dialog"]').first().click();const form=await fillLegacy(q.page,kind==='popup'?'[data-booking-form]':'[data-form]');await form.locator('[type="submit"]').click();await q.page.waitForFunction(()=>window.__meta.some(x=>x[1]==='Lead'));const s=await snapshot(q.page);assert.equal(q.posts.length,1);assert.equal(q.posts[0].result.body.accepted,true);assert.equal(s.meta.find(x=>x[1]==='Lead')[3].eventID,q.posts[0].result.body.meta_event_id);assert.equal(s.ga.filter(x=>x[1]===(kind==='guide'?'guide_request':'generate_lead')).length,1);await q.page.waitForURL(kind==='guide'?'**/parent-guide/':'**/thank-you/');}finally{await q.context.close();}
});



test('every generated campaign runtime consumer mounts uniform popup, book excluded',async()=>{
 function htmls(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?htmls(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[]);}
 const consumers=htmls(dist).filter(f=>/<script[^>]+src="[^" ]*campaign-site(?:\.[a-f0-9]+)?\.js/.test(fs.readFileSync(f,'utf8')));
 assert.ok(consumers.length>=32,'do not silently narrow popup coverage');
 for(const file of consumers){let route='/'+path.relative(dist,file).replace(/index\.html$/,'').replaceAll(path.sep,'/');const q=await setup(route);try{if(route==='/book/')assert.equal(await q.page.locator('[data-booking-form]').count(),0);else{const form=q.page.locator('[data-booking-form]');assert.equal(await form.count(),1,route);assert.equal(await form.getAttribute('data-form-started-at'),null,route);const trap=form.locator('[name="company_website"]');assert.equal(await trap.count(),1,route);assert.equal(await trap.getAttribute('tabindex'),'-1');assert.equal(await trap.getAttribute('maxlength'),'200');assert.ok(await trap.evaluate(el=>el.closest('[aria-hidden="true"]').style.left==='-10000px'),route);}assert.equal(q.posts.length,0);assert.deepEqual(q.consoleErrors,[],route);}finally{await q.context.close();}}
});

for(const route of ['/contact/','/program-finder/quiz/','/austin-program-finder/quiz/'])test(route+' mismatched accepted IDs fail closed in real client',async()=>{
 const q=await setup(route,{reply:()=>({accepted:true,contact_accepted:true,opportunity_accepted:true,note_accepted:true,request_id:'wrong-request',meta_event_id:'lead_wrong-request'})});try{if(route==='/contact/'){const form=await fillLegacy(q.page,'[data-form]');await form.locator('[type="submit"]').click();await q.page.waitForFunction(()=>document.querySelector('[data-form] .status').textContent.includes('Unable'));}else{await fullQuiz(q.page,route.includes('austin'));await q.page.locator('[data-submit]').click();await q.page.waitForFunction(()=>document.querySelector('[data-error]').textContent.includes('could not'));}const s=await snapshot(q.page);assert.ok(s.events.includes('lead_submit_error'));assert.equal(s.ga.filter(x=>x[1]==='generate_lead').length,0);assert.equal(s.meta.length,0);assert.ok(!q.page.url().includes('thank-you'));}finally{await q.context.close();}
});

test('static retry/double-submit preserves request ID and mounted timer',async()=>{
 const q=await setup('/contact/',{failFirst:true});try{const form=await fillLegacy(q.page,'[data-form]');const start=await form.getAttribute('data-form-started-at');await form.locator('[type="submit"]').click();await q.page.waitForFunction(()=>document.querySelector('[data-form] .status').textContent.includes('could not'));await q.page.evaluate(()=>{window.__qaNow+=10000;document.querySelector('[data-form]').requestSubmit();document.querySelector('[data-form]').requestSubmit();});await q.page.waitForFunction(()=>window.__meta.some(x=>x[1]==='Lead'));assert.equal(q.posts.length,2);assert.equal(q.posts[0].data.request_id,q.posts[1].data.request_id);assert.equal(q.posts[1].data.form_started_at,Number(start));const s=await snapshot(q.page);assert.equal(s.ga.filter(x=>x[1]==='generate_lead').length,1);assert.equal(s.meta.filter(x=>x[1]==='Lead').length,1);}finally{await q.context.close();}
});
