'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
let browser;
before(async()=>{browser=await chromium.launch({headless:true});});
after(async()=>{await browser?.close();});
async function setup(denied=false,retry=false) {
 const context=await browser.newContext({serviceWorkers:'block'}),posts=[],errors=[];
 await context.addInitScript(({denied})=>{
  window.joaoConsentState={analytics_storage:denied?'denied':'granted',ad_storage:'denied',ad_user_data:'denied'};
  window.dataLayer=[];window.gtag=()=>{};
  localStorage.setItem('joao_consent_v2',JSON.stringify({version:2,revision:1,analytics:denied?'denied':'granted',advertising:'denied'}));
 },{denied});
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.hostname==='evil.example'&&req.isNavigationRequest())return route.fulfill({contentType:'text/html',body:'<iframe src="https://qa.local/program-finder/quiz/?embed=1&source=meta-adults-paid&parent_page=https://qa.local/adults-first-class/"></iframe>'});
  if(u.hostname!=='qa.local')return route.fulfill({status:200,body:''});
  if(u.pathname==='/api/lead.php'){
   assert.equal(req.method(),'POST');const data=req.postDataJSON();posts.push(data);
   const body=retry&&posts.length===1?{}:{accepted:true,contact_accepted:true,opportunity_accepted:true,note_accepted:true,request_id:data.request_id,meta_event_id:'lead_'+data.request_id,tracking_allowed:false};
   return route.fulfill({status:retry&&posts.length===1?502:200,contentType:'application/json',body:JSON.stringify(body)});
  }
  assert.equal(req.method(),'GET','all non-stub writes blocked');
  let filename=path.resolve(dist,'.'+u.pathname);if(u.pathname.endsWith('/'))filename=path.join(filename,'index.html');
  assert.ok(filename.startsWith(dist+path.sep));
  if(!fs.existsSync(filename))return route.fulfill({status:404,body:''});
  const type=filename.endsWith('.html')?'text/html':filename.endsWith('.js')?'application/javascript':filename.endsWith('.css')?'text/css':'application/octet-stream';
  return route.fulfill({contentType:type,body:fs.readFileSync(filename)});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(7000);
 return {context,page,posts,errors};
}
async function fullQuiz(frame,austin,child=false) {
 const start=frame.locator('[data-start]');if(await start.isVisible())await start.click();
 const audience=frame.locator(`[name="audience"][value="${child?'child':'adult'}"]`);if(await audience.isVisible()){await audience.check();await frame.locator('[data-next]').click();}
 if(child&&await frame.locator('[name="child_count"][value="1"]').count())await frame.locator('[name="child_count"][value="1"]').check();
 await frame.locator(`[name="stage"][value="${child?'youth':'new'}"]`).check();await frame.locator('[data-next]').click();
 await frame.locator(`[name="goal"][value="${child?'confidence':'fundamentals'}"]`).check();await frame.locator('[data-next]').click();
 await frame.locator(`[name="experience"][value="${child?'new':'group'}"]`).check();await frame.locator('[data-next]').click();
 await frame.locator(`[name="location"][value="${austin?'austin':'dripping'}"]`).check();await frame.locator('[data-next]').click();
 await frame.locator('[name="first_name"]').fill('Offline');await frame.locator('[name="email"]').fill('offline@example.invalid');await frame.locator('[name="phone"]').fill('5125550100');await frame.locator('[name="email_consent"]').check();
}
const campaign='?utm_source=facebook&utm_medium=paid_social&utm_campaign=calm&placement=instagram_feed&fbclid=click_safe&email=private%40example.invalid&utm_content=private%40example.invalid&parent_page=https://evil.example/#private';
for(const [landing,austin,source] of [['adults-first-class',false,'meta-adults-paid'],['youth-first-class',false,'meta-youth-paid'],['austin-adults-first-class',true,'meta-austin-adults-paid'],['austin-youth-first-class',true,'meta-austin-youth-paid']]) {
 for(const denied of [false,true])test(landing+' modal '+(denied?'denied':'granted')+' consent and retry',async()=>{
  const q=await setup(denied,true);
  try {
   await q.page.goto('https://qa.local/'+landing+'/'+campaign);
   await q.page.locator('[data-quiz-modal]').first().click();
   const frame=await q.page.locator('.quiz-modal__frame').elementHandle().then(e=>e.contentFrame());
   await frame.waitForLoadState();
   // Exercise actual parent lookup with shared storage unavailable, so first touch
   // must be captured in the quiz rather than borrowed from the landing capture.
   await frame.evaluate(()=>{localStorage.removeItem('joao_attribution_v2');sessionStorage.removeItem('joao_attribution');window.joaoAttribution=window.JoaoAttribution.capture(window);});
   await fullQuiz(frame,austin,landing.includes('youth'));await frame.locator('[data-submit]').click();await frame.locator('[data-error]').waitFor({state:'visible'});
   await frame.locator('[data-submit]').click();await frame.locator('[data-screen="result"]').waitFor({state:'visible'});
   assert.equal(q.posts.length,2);assert.deepEqual(q.posts[1],q.posts[0]);
   const data=q.posts[0];assert.equal(data.route_source,source);assert.equal(data.page,'https://qa.local/'+(austin?'austin-program-finder':'program-finder')+'/quiz/');
   assert.equal(data.abuse_protocol_version,2);assert.ok(Number.isFinite(data.form_started_at));assert.equal(data.company_website,'');assert.equal(data.email_consent,true);assert.equal(data.sms_consent,false);
   for(const touch of ['first','latest'])if(denied)assert.deepEqual(data.attribution[touch],{});else{
    assert.equal(data.attribution[touch].landing_page,'/'+landing+'/');assert.equal(data.attribution[touch].utm_source,'facebook');assert.equal(data.attribution[touch].utm_campaign,'calm');assert.equal(data.attribution[touch].fbclid,'click_safe');assert.ok(data.attribution[touch].placement);assert.equal(data.attribution[touch].utm_content,undefined);
   }
   assert.ok(!JSON.stringify(data.attribution).includes('private'));assert.ok(!frame.url().includes('private'));assert.ok(!q.page.url().includes('private'));assert.deepEqual(q.errors,[]);
  }finally{await q.context.close();}
 });
}
for(const austin of [false,true])test('direct '+(austin?'Austin':'general')+' quiz preserves actual submission/landing URL',async()=>{
 const q=await setup();try{
  const route='/'+(austin?'austin-program-finder':'program-finder')+'/quiz/';
  await q.page.goto('https://qa.local'+route+'?embed=1&utm_source=facebook&source='+ (austin?'austin-program-fit':'meta-adults-paid')+'&parent_page=/adults-first-class/');
  await fullQuiz(q.page,austin);await q.page.locator('[data-submit]').click();await q.page.locator('[data-screen="result"]').waitFor({state:'visible'});
  assert.equal(q.posts.length,1);assert.equal(q.posts[0].page,'https://qa.local'+route);assert.equal(q.posts[0].attribution.first.landing_page,route);assert.equal(q.posts[0].attribution.latest.landing_page,route);assert.deepEqual(q.errors,[]);
 }finally{await q.context.close();}
});
test('actual external parent and spoofed URL/referrer cannot supply landing',async()=>{
 const q=await setup();try{
  await q.page.goto('https://evil.example/adults-first-class/');const frame=q.page.frames().find(f=>f!==q.page.mainFrame());await frame.waitForLoadState();
  const touch=await frame.evaluate(()=>window.joaoAttribution.first_touch);assert.equal(touch.landing_page,'/program-finder/quiz/');assert.ok(!frame.url().includes('parent_page'));assert.deepEqual(q.errors,[]);
 }finally{await q.context.close();}
});
