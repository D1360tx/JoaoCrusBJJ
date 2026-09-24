const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const manifest=JSON.parse(fs.readFileSync('site/campaign/seo-pages.json','utf8'));
const excluded=new Set(['/practice-under-pressure/','/resources/']);
const pages=manifest.pages.filter(p=>p.indexable!==false&&!excluded.has(p.path));
const read=f=>fs.readFileSync(f,'utf8');
test('Resources discovery covers exactly 23 standard canonical pages, source and output',()=>{
 assert.equal(pages.length,23);
 for(const p of pages){
  const files=[path.join('site',p.source_file||'campaign/'+p.file),path.join('dist',p.path,'index.html')];
  for(const f of files){
   const html=read(f);
   const nav=html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/)[0];
   const footer=html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)[0];
   assert.match(nav,/>About<\/a\s*><a href="\/resources\/">Resources<\/a>/,f);
   assert.equal((nav.match(/href="\/resources\/"/g)||[]).length,1,f);
   assert.equal((footer.match(/href="\/resources\/"/g)||[]).length,1,f);
   assert.ok(nav.indexOf('>Resources<')<nav.search(/class="(?:cta|program-nav-cta)"/),f);
  }
 }
});
test('Contextual discovery belongs to Home authority, Words Beyond the Mat and Joao only',()=>{
 for(const root of ['site/campaign','dist']){
  const page=n=>read(root==='dist'?path.join(root,n==='index'?'index.html':n+'/index.html'):path.join(root,n+'.html'));
  assert.match(page('index'),/Meet Joao →<\/a>\s*<p>Keep learning with Joao’s books, podcast, and courses\. <a href="\/resources\/">Explore Joao’s resources →<\/a><\/p>/);
  assert.match(page('about'),/WORDS BEYOND THE MAT\.<\/h2><\/div>\s*<p>Explore Joao’s books, podcast, and courses\. <a href="\/resources\/">Browse all resources →<\/a><\/p>/);
  const coaches=page('coaches');const main=coaches.match(/<main\b[\s\S]*?<\/main>/)[0];
  assert.equal((main.match(/href="\/resources\/"/g)||[]).length,1);
  assert.match(coaches.match(/<section[^>]*id="joao-crus"[\s\S]*?<\/section>/)[0],/href="\/resources\/"/);
 }
});
test('Campaign and special page primary navigation stays outside discovery rollout',()=>{
 for(const p of manifest.pages.filter(p=>p.indexable===false||excluded.has(p.path))){
  const html=read(path.join('site',p.source_file||'campaign/'+p.file));
  const header=html.match(/<header\b[\s\S]*?<\/header>/)?.[0]||'';
  assert.doesNotMatch(header,/href="\/resources\/"/,p.path);
 }
});
