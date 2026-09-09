/* Local-only browser QA. Blocks every external request and every POST. Never submits a valid lead. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.QA_BASE || 'http://127.0.0.1:8766';
const out = path.resolve('qa/austin');
fs.mkdirSync(out, { recursive: true });
(async () => {
 const browser = await chromium.launch({headless:true});
 const context = await browser.newContext();
 const transmissions = [], errors = [], results = [];
 await context.route('**/*', route => {
   const req = route.request(), u = new URL(req.url());
   if(req.method() !== 'GET') { transmissions.push({url:u.pathname,method:req.method()}); return route.abort(); }
   if(u.hostname === 'api.country.is') return route.fulfill({status:200,contentType:'application/json',body:'{"country":"US"}'});
   if(u.origin !== base) return route.fulfill({status:200,contentType:'text/plain',body:''});
   return route.continue();
 });
 const page = await context.newPage();
 page.on('pageerror', e => errors.push(e.message));
 const geometry = async () => {
   await page.evaluate(async () => {await document.fonts.ready; for(const img of document.images) {img.loading='eager'; await img.decode().catch(()=>{});}});
   const overflow = await page.evaluate(() => {
     const bad = [...document.querySelectorAll('body *')].filter((el) => {
       const r = el.getBoundingClientRect();
       return r.right > innerWidth + 1 || r.left < -1 || el.scrollWidth > el.clientWidth + 1;
     }).slice(0, 12).map((el) => ({tag:el.tagName, cls:el.className, right:Math.round(el.getBoundingClientRect().right), left:Math.round(el.getBoundingClientRect().left), sw:el.scrollWidth, cw:el.clientWidth}));
     return {page: document.documentElement.scrollWidth > innerWidth + 1, bad};
   });
   assert.equal(overflow.page,false,`horizontal overflow: ${JSON.stringify(overflow.bad)}`);
   assert.equal(await page.evaluate(()=>[...document.images].some(i=>!i.naturalWidth)),false,'broken image');
 };
 for(const width of [390,768,1280,1440,1920]) {
  await page.setViewportSize({width,height:900});
  for(const audience of ['youth','adults']) {
   const route = `/austin-${audience}-first-class/`;
   await page.goto(base+route+'?utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_v1&utm_content=qa&gclid=qa-gclid&fbclid=qa-fbclid');
   await geometry();
   await page.waitForTimeout(150);
   assert.equal(await page.locator('footer .consent-preferences').count(),1,'privacy choices control');
   assert.equal(await page.evaluate(()=>scrollY),0,'entry scroll reset');
   const links=await page.locator('[data-austin-quiz]').evaluateAll(es=>es.map(e=>e.href));
   assert.equal(links.length,5);
   for(const href of links) {const u=new URL(href);assert.equal(u.pathname,'/austin-program-finder/quiz/'); assert.equal(u.searchParams.get('path'),audience==='youth'?'child':'adult'); for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','gclid','fbclid'])assert.ok(u.searchParams.get(k));}
   for(const c of await page.locator('[data-austin-quiz]').all()) {
    const colors=await c.evaluate(e=>({fg:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));
    assert.equal(colors.fg,'rgb(16, 16, 16)'); assert.equal(colors.bg,'rgb(245, 196, 0)');
   }
   await page.screenshot({path:`${out}/${audience}-${width}-hero.png`});
   if(width===390) assert.equal(await page.locator('[data-mobile-cta]').evaluate(e=>e.classList.contains('is-visible')),false);
   await page.locator('.mk-match').scrollIntoViewIfNeeded(); await page.waitForTimeout(100);
   if(width===390) assert.equal(await page.locator('[data-mobile-cta]').evaluate(e=>e.classList.contains('is-visible')),true,'midpage sticky');
   await page.screenshot({path:`${out}/${audience}-${width}-middle.png`});
   await page.locator('.mk-final').scrollIntoViewIfNeeded(); await page.waitForTimeout(100);
   assert.equal(await page.locator('[data-mobile-cta]').evaluate(e=>e.classList.contains('is-visible')),false,'final sticky suppression');
   await page.screenshot({path:`${out}/${audience}-${width}-final.png`});
   await page.reload({waitUntil:'load'}); await page.waitForTimeout(100);
   assert.equal(await page.evaluate(()=>scrollY),0,'restored-view reset');
   await page.locator('.mk-hero [data-austin-quiz]').evaluate(link => link.click());
   assert.equal(await page.locator('dialog').evaluate(e=>e.open),true);
   const frame=page.frameLocator('.quiz-modal__frame');
   await frame.locator('[data-step="2"]:visible').waitFor();
   assert.equal(await frame.locator('[name="audience"]:checked').inputValue(),audience==='youth'?'child':'adult');
   await page.locator('.quiz-modal__close').evaluate(button => button.click());
   await page.waitForFunction(() => document.activeElement && document.activeElement.matches('.mk-hero [data-austin-quiz]'));
   assert.equal(await page.locator('.mk-hero [data-austin-quiz]').evaluate(e=>e===document.activeElement),true);
   results.push({width,audience,landing:'passed'});
  }
  await page.goto(`${base}/austin-program-finder/quiz/?source=meta-austin-youth-paid&path=child&start=quiz`,{waitUntil:'load'});
  await page.locator('[data-back]').click();
  await page.locator('[data-step="1"]:visible [name="audience"][value="adult"]').check();
  await page.locator('[data-next]').click();
  assert.equal(await page.locator('[data-fit-form]').evaluate(form=>form.elements.child_count.value),'','Youth-to-Adult switch must clear child_count');
  results.push({width,scenario:'branch-switch',quiz:'passed'});

  for(const scenario of ['child','group','private','hybrid','help']) {
   await page.goto(base+`/austin-program-finder/quiz/?path=${scenario==='child'?'child':'adult'}&start=quiz`);
   await page.locator('[data-step="2"]:visible').waitFor();
   assert.equal(await page.locator('footer .consent-preferences').count(),1,'quiz privacy choices control');
   await geometry();
   if(scenario==='child') {
    await page.locator('[name="stage"][value="outside"]').check();
    assert.equal(await page.locator('[data-next]').isDisabled(),true);
    assert.equal(await page.locator('[data-age-gate]').isVisible(),true);
   }
   await page.locator(`[name="stage"][value="${scenario==='child'?'youth':'new'}"]`).check();
   await page.locator('[data-next]').click();
   await page.locator(`[name="goal"][value="${scenario==='child'?'boundaries':'fundamentals'}"]`).check();
   await page.locator('[data-next]').click();
   await page.locator(`[name="experience"][value="${scenario==='child'?'new':scenario}"]`).check();
   await page.locator('[data-next]').click();
   assert.match(await page.locator('[data-step="5"]').innerText(),scenario==='child'?/5:00–5:45/:/6:00–7:00|by appointment/);
   await page.locator('[name="location"][value="austin"]').check();
   await page.locator('[data-next]').click();
   await geometry();
   assert.equal(await page.locator('[data-step="6"]').isVisible(),true);
   await page.locator('[data-fit-form]').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
   assert.match(await page.locator('[data-error]').innerText(),/Complete/);
   assert.equal(await page.locator('[data-screen="result"]').isVisible(),false);
   await page.screenshot({path:`${out}/quiz-${scenario}-${width}-invalid.png`});
   results.push({width,scenario,quiz:'age/format/schedule/contact-last/invalid passed'});
  }
 }
 assert.deepEqual(transmissions,[],'no POST attempts'); assert.deepEqual(errors,[],'runtime errors');
 fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify({results,transmissions,errors},null,2));
 console.log(`Austin browser QA PASSED: ${results.length} viewport/scenario checks; 0 POST attempts; 0 runtime errors.`);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
