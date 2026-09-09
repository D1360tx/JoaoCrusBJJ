/* Deterministic local acceptance: all third parties blocked; lead POST mocked. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.QA_BASE||'http://127.0.0.1:8766';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const evidence=[];
 for(const consent of ['granted','denied']) for(const outcome of ['accepted','rejected','wrong-event']) {
  const context=await browser.newContext({viewport:{width:390,height:900}});
  let posts=0,payload;const errors=[];
  await context.route('**/*',async route=>{
   const req=route.request(),u=new URL(req.url());
   if(u.hostname==='api.country.is')return route.fulfill({json:{country:consent==='granted'?'US':'DE'}});
   if(u.origin!==base)return route.fulfill({status:200,body:''});
   if(req.method()!=='GET'){
    assert.equal(u.pathname,'/api/lead.php');posts++;payload=req.postDataJSON();
    return route.fulfill({status:outcome==='rejected'?502:200,json:{accepted:true,contact_accepted:true,opportunity_accepted:true,note_accepted:true,request_id:payload.request_id,meta_event_id:outcome==='wrong-event'?'lead_wrong_event_id':'lead_'+payload.request_id}});
   } return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const params=new URLSearchParams({utm_source:'meta',utm_medium:'paid_social',utm_campaign:'castle_qa',utm_content:'AY09B',utm_term:'broad',utm_id:'120251246135250072',campaign_id:'120251246135250072',campaign_name:'castle_campaign',adset_id:'120251246144560072',adset_name:'castle_set',ad_id:'120251263002380072',ad_name:'AY09B',placement:'feed',site_source_name:'ig',gclid:'qa_gclid',fbclid:'qa_fbclid',wbraid:'qa_wbraid',gbraid:'qa_gbraid',msclkid:'qa_msclkid',email:'secret@example.invalid'});
  await page.goto(base+'/castle-hill-grand-opening/?'+params);
  await page.waitForFunction(()=>window.joaoConsentState?.analytics_storage===((location.search.includes('unused'))?'denied':window.joaoConsentState?.analytics_storage)&&window.joaoConsentRegion);
  assert.equal(new URL(page.url()).searchParams.has('email'),false);
  assert.equal(await page.locator('.austin-review').count(),0);
  for(const link of await page.locator('[data-austin-quiz]').evaluateAll(es=>es.map(e=>e.href))){const u=new URL(link);for(const [k,v] of params)if(k!=='email')assert.equal(u.searchParams.get(k),v,k);assert.ok(u.searchParams.get('cta_placement'));}
  if(consent==='denied') await page.locator('.consent-save').click();
  await page.locator('.mk-hero [data-austin-quiz]').click();
  const frame=page.frameLocator('.quiz-modal__frame');await frame.locator('[data-step="1"]:visible').waitFor();
  for(const [name,value] of [['audience','child'],['stage','youth'],['goal','boundaries'],['experience','new'],['location','austin']]){await frame.locator(`[name="${name}"][value="${value}"]`).check();await frame.locator('[data-next]').click();}
  await frame.locator('[data-fit-form]').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  assert.equal(posts,0);assert.match(await frame.locator('[data-error]').innerText(),/Complete/);
  await frame.locator('[name="first_name"]').fill('SYNTHETIC Castle QA');await frame.locator('[name="email"]').fill('castle-qa@example.invalid');await frame.locator('[name="phone"]').fill('2025550147');
  await frame.locator('[name="email_consent"]').check();
  const f=page.frames().find(f=>f.url().includes('/austin-program-finder/quiz/'));
  await f.evaluate(()=>{window.qaMeta=[];window.fbq=(...a)=>window.qaMeta.push(a);});
  await frame.locator('[data-submit]').click();
  await page.waitForTimeout(500);
  assert.equal(posts,1);assert.equal(payload.meta.analytics_storage,consent);
  assert.equal(payload.sms_consent,false);assert.equal(payload.preferred_location,'austin');
  if(consent==='granted')for(const touch of [payload.attribution.first,payload.attribution.latest])for(const [k,v] of params)if(k!=='email')assert.equal(touch[k],v,'payload '+k);
  const state=await f.evaluate(()=>({meta:window.qaMeta,events:(window.dataLayer||[]).map(x=>x.event?x:Array.from(x)),result:!document.querySelector('[data-screen="result"]').hidden&&document.querySelector('[data-screen="result"]').classList.contains('is-active')}));
  const count=state.events.filter(e=>Array.isArray(e)&&e[0]==='event'&&e[1]==='generate_lead').length;
  assert.equal(count,consent==='granted'&&outcome==='accepted'?1:0);assert.equal(state.meta.length,count);assert.equal(state.result,outcome==='accepted');
  assert.ok(!JSON.stringify(state.events).includes('example.invalid'));assert.deepEqual(errors,[]);
  evidence.push({consent,outcome,posts,ga4:count,meta:state.meta.length});await context.close();
 }
 await browser.close();console.log(JSON.stringify(evidence,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
