const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../site/assets/attribution.js');
function context(gtag) { return { joaoConsentState: {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied'}, gtag, setTimeout, clearTimeout }; }
test('Google browser linkage reads exact public GA IDs without an advertising grant', async () => {
 const calls=[]; const c=context((op,id,key,cb)=>{calls.push([op,id,key]);cb(key==='client_id'?'123.456':1729000000);});
 assert.deepEqual(await api.googleContext(c),{ga_client_id:'123.456',ga_session_id:'1729000000'});
 assert.deepEqual(calls,[['get','G-EW2F2YKR3Y','client_id'],['get','G-EW2F2YKR3Y','session_id']]);
});
test('advertising-only consent never reads Google IDs', async () => {
 const c=context(()=>{throw Error('must not run');}); c.joaoConsentState={analytics_storage:'denied',ad_storage:'granted',ad_user_data:'granted'};
 assert.deepEqual(await api.googleContext(c),{});
});
test('revocation during callback suppresses browser identity', async () => {
 const callbacks=[]; const c=context((op,id,key,cb)=>callbacks.push(cb));
 const p=api.googleContext(c); callbacks[0]('123.456');c.joaoConsentState.analytics_storage='denied';callbacks[1]('1729000000');
 assert.deepEqual(await p,{});
});
test('no callback times out without blocking the lead or leaking late values', async () => {
 const callbacks=[]; const c=context((op,id,key,cb)=>callbacks.push(cb));
 const result=await api.googleContext(c);callbacks[0]('123.456');callbacks[1]('1729000000');assert.deepEqual(result,{});
});
test('malformed, PII, unresolved and partial Google values are discarded', async () => {
 for(const value of ['person@example.invalid','{{contact.id}}',{},true,'123.456\n']) {
  const c=context((op,id,key,cb)=>cb(key==='client_id'?value:'1729000000'));
  assert.deepEqual(await api.googleContext(c),{});
 }
});
test('Google API exceptions are optional attribution failure, not intake failure', async () => {
 assert.deepEqual(await api.googleContext(context(()=>{throw Error('unavailable');})),{});
});
