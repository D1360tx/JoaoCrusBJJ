'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {readFileSync} = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createHash} = require('node:crypto');
const id = '12345678-1234-4234-8234-123456789abc';
const otherId = '22345678-1234-4234-8234-123456789abc';
const lead = {request_id:id,email:'synthetic@example.invalid',phone:'+15125550100',lead_type:'class_inquiry',page:'/contact/?email=synthetic%40example.invalid#phone',meta:{ad_storage:'granted',ad_user_data:'granted',fbp:'fb.1.1700000000000.123456789',fbc:'fb.1.1700000000000.synthetic-click'}};
function run(fixture, runner='capi-hardening-runner.php') {
  assert.ok(process.env.JOAO_TEST_PHP, 'Native PHP is mandatory');
  const r=spawnSync('unshare',['-Urn',process.env.JOAO_TEST_PHP,'-n','-d','allow_url_fopen=0','-d','disable_functions=mail,exec,shell_exec,system,passthru,popen,proc_open',path.join(__dirname,'fixtures',runner)],{input:JSON.stringify(fixture),encoding:'utf8',env:{PATH:process.env.PATH,TMPDIR:process.env.TMPDIR||'/home/d1360/.hermes/cache/scratch'}});
  assert.equal(r.status,0,r.stderr); return JSON.parse(r.stdout);
}
const hash=s=>createHash('sha256').update(s).digest('hex');
test('native normalization and exact CAPI hashed/unhashed fields',()=>{
  const normalized=run({action:'normalize',email:' Synthetic@Example.invalid ',phone:'(512) 555-0100'}).result;
  assert.deepEqual(normalized,{email:lead.email,phone:lead.phone});
  assert.equal(run({action:'normalize',email:'bad',phone:'5125550100 ext 9'}).result.phone,'');
  const r=run({lead}); assert.equal(r.result,'accepted');assert.equal(r.calls.length,1);
  const e=r.calls[0].payload.data[0];
  assert.equal(e.event_id,'lead_'+id);assert.equal(e.event_name,'Lead');assert.equal(e.action_source,'website');
  assert.equal(e.event_source_url,'https://joaocrusbjj.com/contact/');
  assert.deepEqual(e.user_data.em,[hash(lead.email)]);assert.deepEqual(e.user_data.ph,[hash('15125550100')]);
  assert.equal(e.user_data.client_ip_address,'192.0.2.1');assert.equal(e.user_data.client_user_agent,'SyntheticFixture/1.0');
  assert.equal(e.user_data.fbp,lead.meta.fbp);assert.equal(e.user_data.fbc,lead.meta.fbc);
  assert.doesNotMatch(JSON.stringify(r.logs),/synthetic|192\.0\.2|5550100|Fixture/);
});
for(const [label,meta,gpc] of [
  ['missing',{},undefined],['storage denied',{ad_storage:'denied',ad_user_data:'granted'},undefined],
  ['user data denied',{ad_storage:'granted',ad_user_data:'denied'},undefined],['GPC overrides grant',lead.meta,'1']
]) test('server suppresses '+label,()=>{const r=run({lead:{...lead,meta},gpc});assert.equal(r.result,'consent_denied');assert.deepEqual(r.calls,[]);assert.equal(r.logs[0].event,'meta_capi_consent_denied');});
test('disabled does not send even under two-key test activation',()=>{const r=run({lead,env:{META_CAPI_ENABLED:'false',META_CAPI_TEST_EVENT_CODE:'TEST123',META_CAPI_TEST_REQUEST_ID:id}});assert.equal(r.result,'disabled');assert.deepEqual(r.calls,[]);});
const fallback='https://joaocrusbjj.com/';
for(const [page,expected] of [
  ['/contact/?email=synthetic@example.invalid&phone=5125550100#private','https://joaocrusbjj.com/contact/'],
  ['https://joaocrusbjj.com/contact/?utm_content=email%253Dsynthetic%2540example.invalid','https://joaocrusbjj.com/contact/'],
  ['/contact/?return=%252F%253Fphone%253D5125550100','https://joaocrusbjj.com/contact/'],
  ['/contact/#email=synthetic@example.invalid','https://joaocrusbjj.com/contact/'],
  ['https://WWW.JOAOCRUSBJJ.COM:443/contact/?utm_source=fb','https://www.joaocrusbjj.com/contact/'],
  ['https://joaocrusbjj.com?phone=5125550100',fallback],
  ...['//evil.invalid/contact/?email=x','//joaocrusbjj.com/contact/','/\\evil.invalid','https://joaocrusbjj.com.evil.invalid/contact/','https://evil.invalid@joaocrusbjj.com/contact/','http://joaocrusbjj.com/contact/','javascript:alert(1)','https://joaocrusbjj.com:444/contact/','/contact/%2540synthetic','/synthetic@example.invalid','/5125550100','/contact/../private','https://joaocrusbjj.com/\ncontact/'].map(p=>[p,fallback])
]) test('pathname-only URL '+JSON.stringify(page),()=>assert.deepEqual(run({action:'url',pages:[page]}).result,[expected]));
const payload={data:[{event_name:'Lead',event_id:'lead_'+id,event_time:1800000000,user_data:{em:[hash(lead.email)]}}]};
for(const [label,env,p=payload,requestId=id,expected=false] of [
  ['unset',{}],['code only',{META_CAPI_TEST_EVENT_CODE:'TEST123'}],['request only',{META_CAPI_TEST_REQUEST_ID:id}],
  ['mismatch',{META_CAPI_TEST_EVENT_CODE:'TEST123',META_CAPI_TEST_REQUEST_ID:otherId}],
  ['invalid code',{META_CAPI_TEST_EVENT_CODE:'TEST/123',META_CAPI_TEST_REQUEST_ID:id}],
  ['oversized',{META_CAPI_TEST_EVENT_CODE:'T'.repeat(65),META_CAPI_TEST_REQUEST_ID:id}],
  ['invalid request',{META_CAPI_TEST_EVENT_CODE:'TEST123',META_CAPI_TEST_REQUEST_ID:'all'}],
  ['exact pair',{META_CAPI_TEST_EVENT_CODE:'TEST123',META_CAPI_TEST_REQUEST_ID:id},payload,id,true],
  ['wrong event',{META_CAPI_TEST_EVENT_CODE:'TEST123',META_CAPI_TEST_REQUEST_ID:id},{data:[{event_name:'Lead',event_id:'lead_'+otherId}]}],
  ['batch',{META_CAPI_TEST_EVENT_CODE:'TEST123',META_CAPI_TEST_REQUEST_ID:id},{data:[payload.data[0],payload.data[0]]}],
  ['stale code stripped',{}, {...payload,test_event_code:'STALE'}]
]) test('test-code gate '+label,()=>{const r=run({action:'test_payload',env,payload:p,request_id:requestId}).result;assert.equal(r.test_event_code,expected?'TEST123':undefined);assert.deepEqual(r.data,p.data);});
test('test activation never overrides denial',()=>{const r=run({lead,gpc:'1',env:{META_CAPI_TEST_EVENT_CODE:'TEST123',META_CAPI_TEST_REQUEST_ID:id}});assert.equal(r.result,'consent_denied');assert.deepEqual(r.calls,[]);});
test('retry retains exact original event time and ID; duplicate file and worker second pass send once',()=>{
  const r=run({action:'retry',record:{version:1,event_id:'lead_'+id,request_id:id,payload:{...payload,test_event_code:'STALE'},attempts:2,next_attempt_at:0,created_at:1800000000}});
  assert.equal(r.result.mode,0o600);assert.equal(r.result.first.accepted,1);assert.equal(r.result.second.processed,0);assert.equal(r.calls.length,1);
  assert.deepEqual(r.calls[0].payload,payload);assert.equal(r.calls[0].attempt_limit,1);
});
test('retry failure defers without forcing timestamps or sending again before due',()=>{
 const r=run({action:'retry',fail:true,record:{version:1,event_id:'lead_'+id,request_id:id,payload,attempts:2,next_attempt_at:0}});
 assert.equal(r.result.first.failed,1);assert.equal(r.result.second.processed,0);assert.equal(r.calls.length,1);assert.deepEqual(r.calls[0].payload,payload);
});
test('aggregate counters are bounded, owner-only, minimized and status-complete for this fixture',()=>{
 const r=run({action:'metrics',days:{'2000-01-01':{accepted:9,raw_email:'never-persist@example.invalid'}},statuses:['accepted','consent_denied','disabled','failed','accepted']});
 assert.equal(r.result.mode,0o600);assert.equal(r.result.directory_mode,0o700);
 assert.equal(Object.keys(r.result.days).length,1);assert.deepEqual(Object.values(r.result.days)[0],{accepted:2,consent_denied:1,disabled:1,failed:1});
 assert.doesNotMatch(JSON.stringify(r.result),/email|phone|cookie|request_id|user_agent|never-persist/);
});
for (const mode of ['locked', 'public_metrics']) test('metrics '+mode+' fails closed without blocking intake',()=>{
 const r=run({action:'metrics',[mode]:true,statuses:['accepted']});
 assert.equal(r.result.days,null);assert.equal(r.logs[0].event,'meta_capi_metrics_failed');
 assert.deepEqual(r.calls,[]);assert.deepEqual(r.logs[0],{request_id:'unavailable',event:'meta_capi_metrics_failed'});
});
const normal={request_id:id,name:'Synthetic Example',email:'synthetic@example.invalid',phone:'5125550100',consent:true,lead_type:'class_inquiry',form_id:'contact_page',program:'Adults',location:'Dripping Springs',company_website:'',website:'',form_started_at:1799999990000,abuse_protocol_version:2,meta:lead.meta};
test('native intake Sec-GPC overrides CRM custom fields and Meta consistently, contact still accepted',()=>{
 const r=run({data:normal,capi:true,gpc:'1'},'lead-abuse-runner.php');
 assert.equal(r.body.accepted,true);assert.equal(r.body.meta_capi_status,'consent_denied');assert.ok(!r.calls.some(c=>c.method==='META_MOCK'));
 const fields=r.calls.find(c=>c.path==='/contacts/upsert').payload.customFields;
 for(const key of ['ad_storage','ad_user_data'])assert.equal(fields.find(f=>f.key==='contact.'+key).fieldValue,'denied');
});
test('native accepted lead uses two-key test hook; posted test fields cannot activate it',()=>{
 const data={...normal,test_event_code:'CLIENT',META_CAPI_TEST_REQUEST_ID:id};
 const plain=run({data,capi:true},'lead-abuse-runner.php');assert.equal(plain.body.accepted,true);assert.equal(plain.calls.find(c=>c.method==='META_MOCK').payload.test_event_code,undefined);
 const r=run({data,capi:true,test_env:{META_CAPI_TEST_EVENT_CODE:'TEST123',META_CAPI_TEST_REQUEST_ID:id}},'lead-abuse-runner.php');
 const p=r.calls.find(c=>c.method==='META_MOCK').payload;assert.equal(p.test_event_code,'TEST123');assert.equal(p.data[0].event_id,r.body.meta_event_id);assert.equal(r.body.meta_event_id,'lead_'+id);
});
for(const file of ['campaign-site.js','program-fit-quiz.js','austin-program-fit-quiz.js']) {
 const source=readFileSync(path.join(__dirname,'../site/assets',file),'utf8');
 const start=source.indexOf('function routeMetaLead('),end=source.indexOf('function routeAcceptedLead(',start);
 const fn=source.slice(start,end);
 for(const mode of ['granted','storage revoked','userdata revoked','GPC','initial denial'])test(file+' deferred Pixel '+mode,()=>{
   const timers=[],calls=[],window={navigator:{globalPrivacyControl:false},joaoConsentState:{ad_storage:'granted',ad_user_data:'granted'},setTimeout:f=>timers.push(f)};
   if(mode==='initial denial')window.joaoConsentState.ad_storage='denied';
   const context={window,routedMetaEventIds:file==='campaign-site.js'?Object.create(null):new Set()};
   vm.createContext(context);vm.runInContext(fn+';globalThis.route=routeMetaLead;',context);
   context.route('lead_'+id,{form_name:'fixture',lead_type:'quiz'});
   if(mode==='storage revoked')window.joaoConsentState.ad_storage='denied';
   if(mode==='userdata revoked')window.joaoConsentState.ad_user_data='denied';
   if(mode==='GPC')window.navigator.globalPrivacyControl=true;
   window.fbq=(...args)=>calls.push(args);while(timers.length)timers.shift()();
   assert.equal(calls.length,mode==='granted'?1:0);
   if(calls.length)assert.equal(calls[0][3].eventID,'lead_'+id);
   context.route('lead_'+id,{form_name:'fixture'});assert.equal(calls.length,mode==='granted'?1:0);
 });
}
