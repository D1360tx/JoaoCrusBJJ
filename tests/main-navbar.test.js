const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const manifest=JSON.parse(fs.readFileSync('site/campaign/seo-pages.json'));
test('shared navbar: all 25 indexable outputs, excluded routes, and mutation rejection',()=>{
 const result=execFileSync('python3',['-c',String.raw`
import sys,json,re
from pathlib import Path
sys.path.insert(0,'scripts')
from main_navbar import validate_navbar,PATTERN,MARKER
pages=json.loads(Path('site/campaign/seo-pages.json').read_text())['pages']
count=0
for p in pages:
 f=Path('dist')/(p['path'].strip('/')+'/index.html' if p['path']!='/' else 'index.html')
 if not f.exists():
  assert p['file']=='about-ai-coaches.html';continue
 html=f.read_text();validate_navbar(html,p)
 source=Path('site')/p.get('source_file','campaign/'+p['file'])
 if not p.get('indexable',True):
  assert MARKER not in source.read_text();continue
 count+=1;assert source.read_text().count(MARKER)==1
 nav=re.search(PATTERN,html,re.S)[0]
 mutations=[html.replace(nav,''),html.replace(nav,nav+nav),html.replace('>Resources<','>Missing<'),html.replace('href="/resources/"','href="/wrong/"'),html.replace(nav,nav.replace('aria-current="page"','aria-current="false"')) if 'aria-current=' in nav else html.replace(nav,nav.replace('href="/resources/"','href="/resources/" aria-current="page"')),html.replace(nav,nav+'<nav class="nav"></nav>')]
 for bad in mutations:
  try:validate_navbar(bad,p)
  except AssertionError:pass
  else:raise AssertionError('mutation accepted: '+p['path'])
assert count==25
print('25 routes; missing, duplicate, label/order/destination, active and divergent markup mutations rejected')
`],{encoding:'utf8'});assert.match(result,/25 routes/);
});
test('Resources stays form-free; Pressure retains its existing quiz and Teens its contextual row',()=>{
 const resources=fs.readFileSync('dist/resources/index.html','utf8');
 assert.doesNotMatch(resources,/campaign-site\.js|<form\b|booking-dialog/);
 for(const route of ['resources','practice-under-pressure']){
  const s=fs.readFileSync(`dist/${route}/index.html`,'utf8');assert.equal((s.match(/data-main-navbar/g)||[]).length,1);assert.match(s,/main-navbar\.js\?v=[a-f0-9]{12}/);
 }
 assert.match(fs.readFileSync('dist/practice-under-pressure/index.html','utf8'),/program-fit-modal\.js/);
 assert.match(fs.readFileSync('dist/teens/index.html','utf8'),/class="program-context"/);
});
test('navigation behavior is scoped and cannot submit, track, or duplicate legacy handlers',()=>{
 const js=fs.readFileSync('site/assets/main-navbar.js','utf8');
 const template=fs.readFileSync('site/campaign/components/main-navbar.html','utf8');
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendBeacon|dataLayer|fbq|localStorage|createElement|\.submit\(/);
 assert.doesNotMatch(template,/data-programs-menu|class="(?:nav|menu|program-menu-button|program-global-links)"/);
 assert.match(js,/dataset\.navReady/);assert.match(js,/Escape/);assert.match(js,/\.focus\(/);
});
