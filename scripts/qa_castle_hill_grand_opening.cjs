/* Deterministic local QA only. Every non-GET and external request is intercepted. */
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.QA_BASE || 'http://127.0.0.1:8766';
const out = 'qa/castle-hill-grand-opening';
fs.mkdirSync(out, {recursive:true});
(async () => {
 const browser = await chromium.launch({headless:true});
 const context = await browser.newContext();
 context.setDefaultTimeout(15000);
 context.setDefaultNavigationTimeout(20000);
 const posts=[], errors=[], broken=[], results=[];
 await context.route('**/*', route => {
  const req=route.request(), u=new URL(req.url());
  if(req.method()!=='GET'){posts.push(req.method()+' '+u.pathname);return route.abort();}
  if(u.hostname==='api.country.is') return route.fulfill({contentType:'application/json',body:'{"country":"US"}'});
  if(['fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)) return route.continue();
  if(u.origin!==base) return route.fulfill({contentType:'text/plain',body:''});
  return route.continue();
 });
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',req=>{if(req.failure()?.errorText !== 'net::ERR_ABORTED')broken.push(req.url()+': '+req.failure()?.errorText);});
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)broken.push(r.url());});
 const geometry=async()=>{
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async i=>{i.loading='eager';await i.decode().catch(()=>{});}));});
  const overflow = await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1 || e.scrollWidth>e.clientWidth+1).map(e=>({text:e.textContent,width:e.getBoundingClientRect().width,scroll:e.scrollWidth,font:getComputedStyle(e).fontSize})));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'page overflow '+JSON.stringify(overflow));
  assert.deepEqual(await page.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)),[],'broken images');
 };
 const a11y=async()=>{
  const audit=await new AxeBuilder({page}).analyze();
  assert.deepEqual(audit.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],'serious/critical accessibility');
 };
 const headings=async()=>{
  const orphans=await page.evaluate(()=>[...document.querySelectorAll('.castle-opening h1,.castle-opening h2,.castle-opening h3')].flatMap(el=>{
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT), lines=new Map();let n;
   while(n=walker.nextNode()) for(const m of n.textContent.matchAll(/\S+/g)){
    const range=document.createRange();range.setStart(n,m.index);range.setEnd(n,m.index+m[0].length);
    const top=Math.round(range.getBoundingClientRect().top);lines.set(top,[...(lines.get(top)||[]),m[0]]);
   }
   const values=[...lines.values()];return values.length>1 && values.at(-1).length===1 ? [el.textContent] : [];
  }));
  assert.deepEqual(orphans,[],'single-word heading orphans');
 };
 const params=new URLSearchParams({utm_source:'meta',utm_medium:'paid_social',utm_campaign:'austin_castle_hill_launch_v1',utm_content:'AY01',utm_term:'broad_local',utm_id:'campaign-test',gclid:'test-gclid',fbclid:'test-fbclid'});
 for(const width of (process.env.QA_WIDTHS || '390,768,1280,1440,1920').split(',').map(Number)){
  console.log('QA width', width);
  await page.setViewportSize({width,height:900});
  await page.goto(`${base}/castle-hill-grand-opening/?${params}`);
  await geometry();await headings();await a11y();
  assert.equal(await page.evaluate(()=>scrollY),0);
  assert.equal(await page.locator('h1').count(),1);
  assert.equal((await page.locator('h1').innerText()).replace(/\s+/g,' ').toLowerCase(), 'a new place to start.jiu-jitsu at castle hill fitness.');
  assert.match(await page.locator('meta[name=robots]').getAttribute('content'), /noindex/);
  // Shared calendar uses an em-dash glyph for empty cells, not editorial copy.
  assert.equal(await page.locator('main').evaluate(e=>{const copy=e.cloneNode(true);copy.querySelectorAll('.jc-calendar-blank').forEach(n=>n.remove());return copy.textContent.includes('—');}),false);
  const hero = await page.locator('.mk-hero__frame img').evaluate(i=>({ratio:i.clientWidth/i.clientHeight,native:i.naturalWidth/i.naturalHeight}));
  assert.ok(Math.abs(hero.ratio-hero.native)<0.02,'hero preserves native crop');
  assert.deepEqual(await page.locator('.jc-calendar-slot .jc-calendar-time').allTextContents(), ['5:00–5:45 PM','5:00–5:45 PM','6:00–7:00 PM','6:00–7:00 PM']);
  const adult = page.locator('.castle-programs article').nth(1).locator('img');
  assert.match(await adult.getAttribute('src'), /campaign-images\/adults-black-belt-group-2026-07\.webp$/);
  assert.equal(await adult.getAttribute('alt'), 'Five adult black belts standing together at Joao Crus Brazilian Jiu-Jitsu');
  assert.deepEqual(await adult.evaluate(i=>[i.naturalWidth,i.naturalHeight]), [640,616]);
  const cards = await page.locator('.castle-programs article').evaluateAll(es => es.map(e => {
    const img=e.querySelector('img'), h=e.querySelector('h3');
    return {order: img.previousElementSibling.classList.contains('mk-eye') && img.nextElementSibling === h, gap: h.getBoundingClientRect().top-img.getBoundingClientRect().bottom, fit:getComputedStyle(img).objectFit, ratio:img.clientWidth/img.clientHeight};
  }));
  for(const card of cards){assert.equal(card.order,true);assert.equal(card.gap,18);assert.equal(card.fit,'contain');assert.ok(Math.abs(card.ratio-4/3)<0.02);}
  assert.deepEqual(await page.locator('.castle-opening h1,.castle-opening h2,.castle-opening h3').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)),[],'heading clipping');
  await page.screenshot({path:`${out}/hero-${width}.png`});
  await page.locator('.castle-programs').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${out}/programs-${width}.png`});
  await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0);});
  assert.equal(await page.locator('.consent-preferences').count(),1);

  const links=await page.locator('[data-austin-quiz]').evaluateAll(es=>es.map(e=>e.href));
  assert.equal(links.length,5);
  for(const href of links){const u=new URL(href);assert.equal(u.pathname,'/austin-program-finder/quiz/');assert.equal(u.searchParams.get('path'),null);assert.equal(u.searchParams.get('source'),'austin-program-fit');assert.ok(u.searchParams.get('placement'));for(const [k,v]of params)assert.equal(u.searchParams.get(k),v);}
  for(const el of await page.locator('[data-austin-quiz]').all())assert.deepEqual(await el.evaluate(e=>[getComputedStyle(e).backgroundColor,getComputedStyle(e).color]),['rgb(245, 196, 0)','rgb(16, 16, 16)']);
  await page.screenshot({path:`${out}/landing-${width}-full.png`,fullPage:true});
  await page.locator('.mk-hero [data-austin-quiz]').click();
  let frame=page.frameLocator('.quiz-modal__frame');
  await frame.locator('[data-step="1"]:visible').waitFor();
  assert.equal(await frame.locator('[name="audience"]:checked').count(),0);
  assert.equal(await frame.locator('[data-step="6"]').isVisible(),false);
  await page.locator('.quiz-modal__close').click();
  await page.waitForFunction(()=>document.activeElement.matches('.mk-hero [data-austin-quiz]'));
  await page.locator('.mk-text-link').click();
  assert.equal(new URL(page.url()).pathname,'/castle-hill-grand-opening/');
  assert.equal(new URL(page.url()).hash,'#what-they-practice');
  await page.locator('.consent-preferences').click();
  await page.locator('.consent-decline').click();
  await page.reload();
  await page.locator('.consent-preferences').click();
  assert.equal(await page.locator('.consent-banner input:checked').count(),0,'durable denial after reload');
  await page.locator('.consent-save').click();
  await page.locator('.mk-final').scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  assert.equal(await page.locator('[data-mobile-cta]').evaluate(e=>e.classList.contains('is-visible')),false);
  results.push({width,scenario:'landing/CTA/privacy/a11y/headings',status:'passed'});
  for(const scenario of ['child','group','private','hybrid','help','help-private','competition-help']){
   await page.goto(`${base}/austin-program-finder/quiz/?source=austin-program-fit&start=quiz&placement=hero&${params}`);
   await page.locator('[data-step="1"]:visible').waitFor();
   await page.locator(`[name="audience"][value="${scenario==='child'?'child':'adult'}"]`).check();
   await page.locator('[data-next]').click();await geometry();await a11y();
   if(scenario==='child'){
    await page.locator('[name="stage"][value="outside"]').check();assert.equal(await page.locator('[data-next]').isDisabled(),true);assert.equal(await page.locator('[data-age-gate]').isVisible(),true);
   }
   await page.locator(`[name="stage"][value="${scenario==='child'?'youth':scenario==='competition-help'?'competition':'new'}"]`).check();
   await page.locator('[data-next]').click();await geometry();await a11y();
   await page.locator(`[name="goal"][value="${scenario==='child'?'boundaries':scenario==='help-private'?'schedule':'fundamentals'}"]`).check();
   await page.locator('[data-next]').click();await geometry();await a11y();
   await page.locator(`[name="experience"][value="${scenario==='child'?'new':scenario.includes('help')?'help':scenario}"]`).check();
   await page.locator('[data-next]').click();await geometry();await a11y();
   await page.locator('[name="location"][value="austin"]').check();
   await page.locator('[data-next]').click();await geometry();await a11y();
   assert.equal(await page.locator('[data-submit]').isDisabled(),true,'contact-last submit remains disabled until required fields and consent are complete');
   await page.locator('[name="first_name"]').fill('Local Preview');await page.locator('[name="email"]').fill('preview@example.test');await page.locator('[name="phone"]').fill('5125550100');await page.locator('[name="email_consent"]').check();
   assert.equal(await page.locator('[data-submit]').isEnabled(),true,'valid preview inputs enable the local preview action');
   await page.locator('[data-submit]').click();
   await page.locator('[data-screen="result"]:visible').waitFor();await geometry();await a11y();
   assert.match(await page.locator('.fit-preview-notice').innerText(),/No request was sent/);
   const expectedTitle=scenario==='child'?'youth bjj':['private','hybrid','help-private','competition-help'].includes(scenario)?'private coaching':'adult group bjj';
   assert.equal((await page.locator('[data-result-title]').innerText()).toLowerCase(),expectedTitle);
   assert.equal(await page.evaluate(()=>(window.dataLayer||[]).some(e=>e.event==='lead_submit_success')),false);
   await page.screenshot({path:`${out}/result-${scenario}-${width}.png`});
   results.push({width,scenario,status:'passed'});
  }
 }
 assert.deepEqual(posts,[],'zero non-GET attempts');assert.deepEqual(errors,[]);assert.deepEqual(broken,[]);
 fs.writeFileSync(`${out}/results.json`,JSON.stringify({results,posts,errors,broken},null,2));
 console.log(`Castle Hill browser QA PASSED: ${results.length} viewport/scenario checks; 0 POST attempts; 0 runtime errors; 0 broken assets; 0 serious/critical accessibility violations.`);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
