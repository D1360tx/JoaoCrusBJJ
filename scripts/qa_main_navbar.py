"""Responsive read-only browser gate. Requires Playwright and an axe.min.js path.
Serve exact-live-baseline and normalized candidate snapshots; external transport
is blocked. Produces durable route/width evidence and comparison screenshots.
"""
import argparse,asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright

async def run(args):
    pages=json.loads(Path('site/campaign/seo-pages.json').read_text())['pages']
    routes=[p['path'] for p in pages if p['indexable']]
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    results=[]
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True)
        sem=asyncio.Semaphore(3)
        async def route_qa(route):
            async with sem:
                context=await browser.new_context()
                # No lead, number-pool, provider, CAPI, analytics or messaging writes.
                async def guard(r):
                    if r.request.method not in ['GET','HEAD'] or not (r.request.url.startswith(args.base) or r.request.url.startswith(('https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'))):
                        await r.abort();return
                    await r.continue_()
                await context.route('**/*',guard)
                page=await context.new_page();errors=[];failed=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 and r.url.startswith(args.base) else None)
                await page.goto(args.base+route,wait_until='load')
                await page.evaluate('document.fonts.ready')
                deny=page.get_by_role('button',name='Turn off optional tracking',exact=True)
                if await deny.is_visible():
                    await deny.click()
                await page.add_script_tag(path=args.axe)
                for width in [390,768,1280,1440,1920]:
                    await page.set_viewport_size({'width':width,'height':950})
                    await page.evaluate('window.scrollTo(0,0)')
                    await page.wait_for_timeout(120)
                    row={'route':route,'width':width,'errors':list(errors),'http_errors':list(failed)}
                    row['overflow']=await page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
                    if not args.baseline:
                        h=page.locator('[data-main-navbar]');assert await h.count()==1 and await h.is_visible(),(route,width,'header')
                        labels=await h.locator('.jc-main-links').evaluate('(n)=>Array.from(n.children).map(e=>e.tagName==="DETAILS"?e.querySelector("summary").textContent.trim():e.textContent.trim())')
                        assert labels==['Programs','Schedule','Locations','About','Resources','Coaches','Plan a first class'],labels
                        links=await h.locator('a').evaluate_all('(els)=>els.map(e=>({href:e.getAttribute("href"),active:e.getAttribute("aria-current")}))')
                        assert all(x['active']==('page' if x['href']==route else None) for x in links),(route,links)
                        assert await h.locator('a',has_text='Resources').get_attribute('href')=='/resources/'
                        button=h.locator('.jc-main-toggle');summary=h.locator('summary')
                        if width<=1100:
                            assert not await h.locator('.jc-main-links').is_visible()
                            await button.click();assert await button.get_attribute('aria-expanded')=='true'
                            assert await h.locator('.jc-main-links').is_visible()
                        else:assert not await button.is_visible()
                        await summary.focus();await page.keyboard.press('Enter');assert await h.locator('details').get_attribute('open') is not None
                        row['open_navbar_axe']=await page.evaluate('async()=> (await axe.run(document.querySelector("[data-main-navbar]"))).violations.map(v=>v.id)')
                        assert not row['open_navbar_axe'],(route,width,row['open_navbar_axe'])
                        await page.keyboard.press('Escape');assert await h.locator('details').get_attribute('open') is None
                        assert await summary.evaluate('(e)=>e===document.activeElement')
                        await summary.click();await h.locator('.jc-main-brand').focus();await h.locator('.jc-main-mark').click(position={'x':2,'y':2},trial=True)
                        # Click outside disclosure without navigation.
                        await h.locator('.jc-main-wrap').click(position={'x':1,'y':1});assert await h.locator('details').get_attribute('open') is None
                        if width<=1100:
                            await page.keyboard.press('Escape');assert await button.get_attribute('aria-expanded')=='false'
                            assert await button.evaluate('(e)=>e===document.activeElement')
                            await button.click();last=h.locator('.jc-main-cta');await last.focus();await page.keyboard.press('Tab')
                            assert await h.locator('.jc-main-brand').evaluate('(e)=>e===document.activeElement')
                            await page.keyboard.press('Escape')
                        row['nav_geometry']=await h.evaluate('(h)=>{let els=[h.querySelector(".jc-main-brand"),...h.querySelector(".jc-main-links").children].filter(e=>e.getClientRects().length);let r=els.map(e=>e.getBoundingClientRect());return {inside:r.every(x=>x.left>=0&&x.right<=innerWidth),collision:r.some((a,i)=>r.some((b,j)=>j>i&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top))}}')
                        assert row['nav_geometry']['inside'] and not row['nav_geometry']['collision'],(route,width,row)
                        if route=='/resources/':assert await page.locator('form,.booking-dialog').count()==0
                        row['navbar_axe']=await page.evaluate('async()=> (await axe.run(document.querySelector("[data-main-navbar]"))).violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))')
                        assert not row['navbar_axe'],(route,width,row['navbar_axe'])
                    row['axe']=await page.evaluate('async()=> (await axe.run()).violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))')
                    if route in ['/','/resources/','/practice-under-pressure/','/about/','/coaches/'] and width in [390,1440]:
                        await page.screenshot(path=str(out/(route.strip('/').replace('/','-') or 'home'))+'-'+str(width)+'.png')
                    results.append(row)
                    (out/'results.json').write_text(json.dumps(results,indent=2))
                await context.close()
        await asyncio.gather(*(route_qa(r) for r in routes))
        await browser.close()
    assert len(results)==len(routes)*5
    print(json.dumps({'routes':len(routes),'cases':len(results),'page_errors':sum(bool(r['errors']) for r in results),'http_errors':sum(bool(r['http_errors']) for r in results),'overflow_cases':sum(r['overflow'] for r in results),'axe_cases':sum(bool(r['axe']) for r in results),'output':str(out)}))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--base',required=True);p.add_argument('--output',required=True);p.add_argument('--axe',required=True);p.add_argument('--baseline',action='store_true');asyncio.run(run(p.parse_args()))
