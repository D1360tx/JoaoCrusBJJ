// Read-only CALM page QA. Local mode uses offline font fixtures; remote mode
// allows GET only to the pinned RawGitHack prefix and public font hosts.
'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const [out,axeFile,fontMapFile,remotePrefix]=process.argv.slice(2);
assert.ok(out&&axeFile&&fontMapFile,'output, axe script, font map required');
fs.mkdirSync(out,{recursive:true});
const fontMap=JSON.parse(fs.readFileSync(fontMapFile));
const pages=['adults-first-class','youth-first-class'];
const widths=[390,768,1280,1440,1920];
const records=[];
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  for(const slug of pages)for(const width of widths){
   const ctx=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'}),errors=[],blocked=[];
   await ctx.route('**/*',async route=>{
    const req=route.request(),u=new URL(req.url());
    if(req.method()!=='GET'){blocked.push(req.url());await route.abort();return;}
    if(fontMap[req.url()]){await route.fulfill({status:200,contentType:u.hostname==='fonts.googleapis.com'?'text/css':'font/ttf',body:fs.readFileSync(fontMap[req.url()])});return;}
    if(remotePrefix&&req.url().startsWith(remotePrefix)){await route.continue();return;}
    if(u.hostname!=='qa.local'){blocked.push(req.url());await route.fulfill({status:200,body:''});return;}
    let f=path.resolve(__dirname,'../dist',u.pathname.slice(1));if(u.pathname.endsWith('/'))f=path.join(f,'index.html');
    if(!fs.existsSync(f)){await route.fulfill({status:404,body:''});return;}
    const mime=f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':f.endsWith('.js')?'application/javascript':f.endsWith('.webp')?'image/webp':f.endsWith('.png')?'image/png':'application/octet-stream';
    await route.fulfill({status:200,contentType:mime,body:fs.readFileSync(f)});
   });
   const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
   const url=remotePrefix?remotePrefix+'site/campaign/'+slug+'.html':'https://qa.local/'+slug+'/';
   await p.goto(url+'?utm_source=fb&utm_medium=paid_social&utm_term=TEST');
   p.setDefaultTimeout(7000);
   if(await p.locator('.consent-decline').isVisible())await p.locator('.consent-decline').click();
   assert.equal(await p.locator('h1').count(),1);
   await p.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';for(const i of document.images){i.loading='eager';await i.decode().catch(()=>{});}await document.fonts.ready;});
   const geometry=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,fonts:[document.fonts.check('16px Anton'),document.fonts.check('16px "Space Grotesk"')],images:[...document.images].map(i=>({src:i.src,width:i.naturalWidth,alt:i.alt})),ctas:[...document.querySelectorAll('[data-kids-quiz]')].filter(a=>a.getBoundingClientRect().width>0).map(a=>({color:getComputedStyle(a).color,bg:getComputedStyle(a).backgroundColor,href:a.href})),robots:document.querySelector('meta[name="robots"]').content}));
   assert.ok(geometry.overflow<=1,JSON.stringify(geometry));assert.deepEqual(geometry.fonts,[true,true]);assert.ok(geometry.images.every(i=>i.width>0));assert.equal(geometry.robots,'noindex,nofollow');
   for(const c of geometry.ctas){assert.equal(c.color,'rgb(16, 16, 16)');assert.equal(c.bg,'rgb(245, 196, 0)');const u=new URL(c.href);assert.equal(u.searchParams.get('utm_term'),'TEST');assert.equal(u.searchParams.get('source'),slug.startsWith('adults')?'meta-adults-paid':'meta-youth-paid');}
   await p.addScriptTag({content:fs.readFileSync(axeFile,'utf8')});
   const violations=await p.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
   await p.screenshot({path:path.join(out,slug+'-'+width+'-full.png'),fullPage:true});
   await p.screenshot({path:path.join(out,slug+'-'+width+'-hero.png')});
   await p.locator('#calm-method').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,slug+'-'+width+'-calm.png')});
   await p.locator('.mk-faq').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,slug+'-'+width+'-lower.png')});
   const sticky=p.locator('[data-mobile-cta]');
   if(width===390){await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(300);assert.equal(await sticky.evaluate(e=>e.classList.contains('is-visible')),false);await p.locator('#calm-method').scrollIntoViewIfNeeded();await p.waitForTimeout(300);assert.equal(await sticky.evaluate(e=>e.classList.contains('is-visible')),true);await p.locator('.mk-final').scrollIntoViewIfNeeded();await p.waitForTimeout(300);assert.equal(await sticky.evaluate(e=>e.classList.contains('is-visible')),false);}
   const faq=p.locator('details').nth(1);await faq.locator('summary').click();assert.equal(await faq.getAttribute('open'),'');await faq.locator('summary').click();assert.equal(await faq.getAttribute('open'),null);
   await p.evaluate(()=>scrollTo(0,0));await p.locator('.mk-text-link').click();await p.waitForTimeout(200);
   assert.ok(p.url().includes('#calm-method'));const anchor=await p.evaluate(()=>({target:document.querySelector('#calm-method').getBoundingClientRect().top,header:document.querySelector('.mk-header').getBoundingClientRect().bottom}));
   // Each CTA's placement, modal iframe route, close/focus and Escape are checked.
   const placements=width===390?['hero','locations','final','mobile']:['header','hero','locations','final'];
   for(const placement of placements){if(placement==='mobile'){await p.locator('#calm-method').scrollIntoViewIfNeeded();await p.waitForTimeout(300);}
    const trigger=p.locator(`[data-kids-quiz][href*="placement=${placement}"]`);await trigger.click();await p.locator('dialog.quiz-modal').waitFor({state:'visible'});
    const frame=p.frameLocator('.quiz-modal__frame');await frame.locator('[data-screen="quiz"]').waitFor({state:'visible'});
    const src=await p.locator('.quiz-modal__frame').getAttribute('src');assert.equal(new URL(src).searchParams.get('placement'),placement);assert.equal(new URL(src).searchParams.get('utm_term'),'TEST');
    assert.equal(await frame.locator('[data-fit-form]').getAttribute('data-form-started-at')!==null,true,'protected timer mounted');
    if(placement==='hero')await p.keyboard.press('Escape');else await p.locator('.quiz-modal__close').click();
    await p.locator('dialog.quiz-modal').waitFor({state:'hidden'});assert.equal(await trigger.evaluate(e=>document.activeElement===e),true);
   }
   const record={slug,width,geometry,anchor,violations,errors,blocked};records.push(record);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(records,null,2));console.log(JSON.stringify({slug,width,overflow:geometry.overflow,violations,anchor,errors}));
   await ctx.close();
  }
 }finally{await browser.close();}
 assert.equal(records.length,10);assert.ok(records.every(r=>r.errors.length===0));assert.ok(records.every(r=>!r.violations.some(v=>['serious','critical'].includes(v.impact))),'serious/critical accessibility findings');assert.ok(records.every(r=>r.anchor.target>=r.anchor.header-1),'anchor covered by sticky header');
 console.log('PASS: 10 page/width cases, all reachable CTA placements, modal/fragment/FAQ/sticky, fonts/images/contrast/accessibility');
})().catch(e=>{console.error(e);process.exit(1);});
