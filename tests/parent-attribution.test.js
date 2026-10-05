'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const attribution = require('../site/assets/attribution.js');
const now = Date.UTC(2026, 9, 5);
function storage() { const values = {}; return {getItem:k=>values[k] || null,setItem:(k,v)=>{values[k]=v;},removeItem:k=>{delete values[k];}}; }
function ctx(route, parent, consent='granted', local=storage()) {
 const location = new URL('https://joaocrusbjj.com'+route);
 const c={location,document:{referrer:'',cookie:''},localStorage:local,sessionStorage:storage(),joaoConsentState:{analytics_storage:consent}};
 c.parent=parent?{location:new URL(parent)}:c;return c;
}
for(const quiz of ['/program-finder/quiz/','/austin-program-finder/quiz/']) {
 test(quiz+' actual same-origin parent supplies path only',()=>{
  const c=ctx(quiz+'?embed=1&utm_source=facebook&placement=hero&utm_content=private%40example.invalid&parent_page=https://evil.example/', 'https://joaocrusbjj.com/adults-first-class/?email=private@example.invalid#private');
  const result=attribution.capture(c,now);
  assert.equal(result.first_touch.landing_page,'/adults-first-class/');assert.equal(result.last_touch.landing_page,'/adults-first-class/');
  assert.equal(result.last_touch.utm_source,'facebook');assert.equal(result.last_touch.placement,'hero');assert.equal(result.last_touch.utm_content,undefined);
  assert.ok(!JSON.stringify(result).includes('private'));
 });
 test(quiz+' direct or untrusted parents cannot manufacture landing context',()=>{
  for(const parent of [undefined,'https://evil.example/adults-first-class/','https://joaocrusbjj.com:444/adults-first-class/','https://joaocrusbjj.com/person/private@example.invalid/']) {
   assert.equal(attribution.capture(ctx(quiz+'?embed=1&parent_page=/adults-first-class/',parent),now).first_touch.landing_page,quiz);
  }
  const c=ctx(quiz+'?embed=1');c.parent={get location(){throw new Error('SecurityError');}};
  assert.equal(attribution.capture(c,now).last_touch.landing_page,quiz);
  assert.equal(attribution.capture(ctx(quiz,'https://joaocrusbjj.com/adults-first-class/'),now).last_touch.landing_page,quiz);
 });
 test(quiz+' denied consent never reads parent or storage',()=>{
  const c=ctx(quiz+'?embed=1',undefined,'denied');
  for(const name of ['parent','localStorage','sessionStorage'])Object.defineProperty(c,name,{get(){throw new Error(name+' read');}});
  assert.deepEqual(attribution.capture(c,now).first_touch,{});
 });
}
test('first touch and non-direct history are preserved, no source inference/backfill',()=>{
 const local=storage();
 const initial=attribution.capture(ctx('/?utm_source=google',undefined,'granted',local),now);
 const latest=attribution.capture(ctx('/program-finder/quiz/?embed=1&utm_source=facebook&placement=hero','https://joaocrusbjj.com/adults-first-class/', 'granted',local),now+1000);
 assert.deepEqual(latest.first_touch,initial.first_touch);assert.equal(latest.last_touch.landing_page,'/adults-first-class/');
 const direct=attribution.capture(ctx('/program-finder/quiz/?embed=1&source=meta-adults-paid','https://joaocrusbjj.com/youth-first-class/','granted',local),now+2000);
 assert.deepEqual(direct.last_touch,latest.last_touch);
});
