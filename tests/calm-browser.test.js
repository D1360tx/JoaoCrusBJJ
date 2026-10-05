'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
let browser;
before(async()=>{browser=await chromium.launch({headless:true});});
after(async()=>{await browser?.close();});
async function fixture(audience,location,overrides={}) {
 const context=await browser.newContext({serviceWorkers:'block'}),posts=[],errors=[];
 await context.addInitScript(()=>{window.__qaNow=1799999990000;Date.now=()=>window.__qaNow;window.dataLayer=[];window.__meta=[];window.__ga=[];window.joaoConsentState={analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted'};window.gtag=(...a)=>window.__ga.push(a);window.fbq=(...a)=>window.__meta.push(a);});
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.hostname!=='qa.local'){await route.fulfill({status:200,body:''});return;}
  if(u.pathname==='/api/lead.php') {
   const data=req.postDataJSON();const p=spawnSync('unshare',['-Urn',process.env.JOAO_TEST_PHP,'-n','-d','allow_url_fopen=0','-d','disable_functions=mail,exec,shell_exec,system,passthru,popen,proc_open',path.join(root,'tests/fixtures/lead-abuse-runner.php')],{input:JSON.stringify({data}),encoding:'utf8',env:{PATH:process.env.PATH}});
   assert.equal(p.status,0,p.stderr);const result=JSON.parse(p.stdout);posts.push({data,result});await route.fulfill({status:result.status,contentType:'application/json',body:JSON.stringify(result.body)});return;
  }
  if(req.resourceType()==='script'&&!/\/(program-fit-quiz|attribution)\.js$/.test(u.pathname)){await route.fulfill({status:200,body:''});return;}
  let f=path.join(root,'dist',u.pathname);if(u.pathname.endsWith('/'))f=path.join(f,'index.html');
  if(!fs.existsSync(f)){await route.fulfill({status:404,body:''});return;}
  await route.fulfill({status:200,contentType:f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'application/octet-stream',body:fs.readFileSync(f)});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const source=audience==='child'?'meta-youth-paid':'meta-adults-paid';
 await page.goto('https://qa.local/program-finder/quiz/?embed=1&start=quiz&path='+audience+'&source='+source+'&placement=hero&utm_source=fb&utm_medium=paid_social&utm_campaign=calm&utm_content=local-fixture&utm_term=TEST&gclid=fixture-gclid&fbclid=fixture-fbclid');
 try {
  context.setDefaultTimeout(5000);
  await page.evaluate(()=>{window.joaoConsentState={analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted'};window.joaoAttribution=window.JoaoAttribution.capture(window);});
  const audienceOption=page.locator(`[name="audience"][value="${audience}"]`);if(await audienceOption.isVisible()){await audienceOption.check();await page.locator('[data-next]').click();}
  const stage=overrides.stage||(audience==='child'?'youth':'new');
  if(audience==='child')await page.locator('[name="child_count"][value="1"]').check();
  await page.locator(`[name="stage"][value="${stage}"]`).check();await page.locator('[data-next]').click();
  await page.locator(`[name="goal"][value="${overrides.goal||(audience==='child'?'confidence':'fundamentals')}"]`).check();await page.locator('[data-next]').click();
  await page.locator(`[name="experience"][value="${overrides.experience||(audience==='child'?'new':'group')}"]`).check();await page.locator('[data-next]').click();
  await page.locator(`[name="location"][value="${location}"]`).check();await page.locator('[data-next]').click();
  assert.equal(await page.locator('[data-submit]').isDisabled(),true);await page.locator('[data-fit-form]').evaluate(f=>f.requestSubmit());assert.equal(posts.length,0,'empty contact never transmits');
  await page.locator('[name="first_name"]').fill('Local');await page.locator('[name="email"]').fill('local@example.invalid');await page.locator('[name="phone"]').fill('5125550100');await page.locator('[name="email_consent"]').check();
  await page.locator('[data-submit]').click();await page.locator('[data-screen="result"]').waitFor({state:'visible'});
  assert.equal(posts.length,1);const {data,result}=posts[0];assert.equal(result.body.accepted,true,JSON.stringify(result));
  assert.equal(data.route_source,source);assert.equal(data.preferred_location,location);assert.equal(data.first_name,'Local');assert.equal(data.email_consent,true);assert.equal(data.abuse_protocol_version,2);assert.equal(data.form_started_at,1799999990000);assert.equal(data.company_website,'');
  assert.equal(data.attribution.latest.utm_source,'fb');assert.equal(data.attribution.latest.utm_term,'TEST');assert.equal(data.attribution.latest.gclid,'fixture-gclid');assert.equal(data.attribution.latest.fbclid,'fixture-fbclid');
  const program=overrides.expected||(audience==='child'?'youth_bjj':'adult_group_bjj');assert.equal(data.recommended_program,program);
  const calls=JSON.stringify(result.calls);
  if(program==='private_coaching')assert.ok(calls.includes('https://joaocrusbjj.com/book/'));else assert.ok(calls.includes((audience==='child'?'youth':'adults')+'-first-'+(location==='austin'?'austin':'ds')),calls);
  const events=await page.evaluate(()=>({ga:window.__ga,meta:window.__meta,layer:window.dataLayer}));
  assert.equal(events.ga.filter(x=>x[1]==='generate_lead').length,1);assert.equal(events.meta.filter(x=>x[1]==='Lead').length,1);assert.equal(events.meta.find(x=>x[1]==='Lead')[3].eventID,'lead_'+data.request_id);assert.equal(result.body.meta_event_id,'lead_'+data.request_id);
  assert.deepEqual(errors,[]);
 } finally {await context.close();}
}
for(const audience of ['adult','child'])for(const location of ['austin','dripping'])test(`CALM ${audience}/${location}: contact validation, real PHP fixture, booking, source, UTMs and paired IDs`,()=>fixture(audience,location));
for(const [key,value] of [['experience','private'],['experience','hybrid'],['goal','specific'],['goal','schedule'],['stage','competition']])test(`Austin retains private condition ${key}=${value}`,()=>fixture('adult','austin',{[key]:value,expected:'private_coaching'}));
