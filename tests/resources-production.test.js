const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const html = read('site/campaign/resources.html');
const built = read('dist/resources/index.html');
const urls = ['https://grapplewithemotions.com/','https://jiu-jitsuclasses.online/courses/','https://blueprint.justjiuit.com/','https://boundaryguard.joaocrusbjj.com/','https://blackbeltparenting.net/'];
test('resources: five approved destinations, preview-first accessible cards',()=>{
 const cards=[...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)];assert.equal(cards.length,5);
 cards.forEach(([all,body],i)=>{assert.match(body,/^\s*<figure class="jr-preview">/);assert.ok(body.includes(`href="${urls[i]}"`));assert.match(body,/target="_blank" rel="noopener noreferrer external"/);assert.ok(body.indexOf('</figure>')<body.indexOf('class="jr-project-copy"'));});
 assert.match(read('site/assets/resources.css'),/grid-template-areas:"copy preview"/);
});
test('resources: production metadata and non-conversion contract',()=>{
 for(const s of [html,built]){assert.doesNotMatch(s,/<form\b|Draft Preview|Review comparison only|No forms or tracking|resources-draft|joao-projects-draft|fbq\(|resource_click|generate_lead/);assert.equal((s.match(/<h1\b/g)||[]).length,1);assert.match(s,/<link rel="canonical" href="https:\/\/joaocrusbjj.com\/resources\/">/);}
 assert.match(built,/BreadcrumbList/);assert.match(built,/https:\/\/joaocrusbjj.com\/resources\/#breadcrumb/);
 assert.doesNotMatch(built,/assets\/campaign-site|<noscript|<iframe/);
 assert.equal((built.match(/GTM-596MGPMD/g)||[]).length,1);
 assert.ok(built.indexOf('assets/consent-policy.js')<built.indexOf('GTM-596MGPMD'));
 assert.ok(built.indexOf('assets/attribution.js')<built.indexOf('assets/consent-controls.js'));
 assert.match(built,/jr-footer-links bottom/);
});
test('resources: manifest, discovery, qualified anchors and asset completeness',()=>{
 const p=JSON.parse(read('site/campaign/seo-pages.json')).pages.filter(p=>p.path==='/resources/');assert.equal(p.length,1);assert.equal(p[0].indexable,true);
 assert.match(read('dist/sitemap.xml'),/<loc>https:\/\/joaocrusbjj.com\/resources\/<\/loc>/);
 assert.match(read('dist/llms.txt'),/https:\/\/joaocrusbjj.com\/resources\//);
 const book=read('dist/book/index.html');assert.match(book.slice(book.indexOf('<footer')),/href="\/resources\/"/);assert.doesNotMatch(book.slice(0,book.indexOf('<main')),/href="\/resources\/"/);
 assert.doesNotMatch(built,/href="#/);assert.match(built,/href="\/resources\/#resources"/);
 for(const [,src] of built.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)){if(/^(https?:|mailto:|tel:)/.test(src)||src==='/'||src.endsWith('/'))continue; const dest=path.join(root,'dist',src.replace(/^\.\.\//,'')); assert.ok(fs.existsSync(dest),src);}
});
