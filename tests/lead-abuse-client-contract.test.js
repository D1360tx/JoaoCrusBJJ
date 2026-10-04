'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root=path.resolve(__dirname,'..');
const neutral={handled:true,outcome:'neutral',accepted:false,contact_accepted:false,opportunity_accepted:false,tracking_allowed:false};
for(const name of ['campaign-site','program-fit-quiz','austin-program-fit-quiz']) {
 const source=fs.readFileSync(path.join(root,`site/assets/${name}.js`),'utf8');
 const start=source.indexOf('function handledLeadOutcome('), end=source.indexOf('\n  }\n',start)+5;
 assert.ok(start>=0&&end>start);
 const classify=vm.runInNewContext(source.slice(start,end)+';handledLeadOutcome');
 test(name+' neutral exact envelope and explicit local outcome',()=>{assert.equal(classify({status:200},neutral).outcome,'neutral');assert.equal(classify({status:200},{accepted:true}),null);assert.equal(classify({status:409},{accepted:false,reload_required:true}).outcome,'reload');});
 for(const [label,reply,status] of [
  ['accepted conflict',{...neutral,accepted:true},200],['contact conflict',{...neutral,contact_accepted:true},200],['opportunity conflict',{...neutral,opportunity_accepted:true},200],['tracking conflict',{...neutral,tracking_allowed:true},200],['meta id',{...neutral,meta_event_id:'lead_fake'},200],['contact id',{...neutral,contact_id:'fake'},200],['opportunity id',{...neutral,opportunity_id:'fake'},200],['request id',{...neutral,request_id:'fake'},200],['extra reason',{...neutral,reason:'honeypot'},200],['wrong status',neutral,202],['wrong boolean',{...neutral,handled:1},200],['wrong outcome',{...neutral,outcome:'accepted'},200],['reload tracking',{accepted:false,reload_required:true,tracking_allowed:true},409],['reload accepted',{accepted:true,reload_required:true},409]
 ])test(name+' refuses malformed handled '+label,()=>assert.throws(()=>classify({status},reply)));
}
test('cached deployed runtime fixture provenance stays immutable',()=>{const {createHash}=require('node:crypto');assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,'tests/fixtures/cached-campaign-site.js'))).digest('hex'),'1dd005817e226a6c97c282260614d53627edec016d0324f5cfd63bad8093183f');});
