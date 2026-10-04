'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const path = require('node:path');
const PHP = process.env.JOAO_TEST_PHP;
const now = 1800000000000;
const id = '12345678-1234-4234-8234-123456789abc';
const normal = {request_id:id, name:'Maria Example',email:'maria@example.invalid',phone:'5125550100',consent:true,lead_type:'class_inquiry',form_id:'contact_page',program:'Adults',location:'Dripping Springs',website:'',company_website:'',abuse_protocol_version:2,form_started_at:now-10000};
function run(data, extra={}) {
  assert.ok(PHP, 'Set JOAO_TEST_PHP to a local isolated PHP CLI; tests must not skip');
  const r=spawnSync('unshare',['-Urn',PHP,'-n','-d','allow_url_fopen=0','-d','disable_functions=mail,exec,shell_exec,system,passthru,popen,proc_open',path.join(__dirname,'fixtures/lead-abuse-runner.php')],{input:JSON.stringify({data,...extra}),encoding:'utf8',env:{PATH:process.env.PATH}});
  assert.equal(r.status,0,r.stderr); return JSON.parse(r.stdout);
}
const neutral={handled:true,outcome:'neutral',accepted:false,contact_accepted:false,opportunity_accepted:false,tracking_allowed:false};
for (const [label,edit,event] of [
  ['new trap',{company_website:'bot@example.invalid'},'honeypot'],['old trap',{website:'bot'},'honeypot'],
  ['trap array',{company_website:[]},'honeypot'],['trap object',{website:{}},'honeypot'],['trap null',{website:null},'honeypot'],
  ['1s',{form_started_at:now-1000},'too_fast'],['2999ms',{form_started_at:now-2999},'too_fast'],['future',{form_started_at:now+1},'too_fast'],
  ...[null,true,[],{},'1e12','NaN','Infinity','1800000000000.0',1.5,-1,9007199254740992,'999999999999999999999999'].map((v,i)=>['malformed '+i,{form_started_at:v},'timing_invalid'])
]) test('drop '+label,()=>{const r=run({...normal,...edit});assert.equal(r.status,200);assert.deepEqual(r.body,neutral);assert.deepEqual(r.calls,[]);assert.equal(r.logs[0].event,'lead_spam_'+event);assert.doesNotMatch(JSON.stringify(r.logs),/example.invalid|Maria|5125550100/);});
test('missing v2 neutral, old cached missing reload without writes',()=>{let data={...normal};delete data.form_started_at;const r=run(data);assert.deepEqual(r.body,neutral);assert.deepEqual(r.calls,[]);delete data.abuse_protocol_version;const old=run(data);assert.equal(old.status,409);assert.equal(old.body.reload_required,true);assert.match(old.body.error,/reload/);assert.deepEqual(old.calls,[]);});
for(const age of [3000,10000,86400000,86400001,90000000]) test('accept age '+age,()=>{const r=run({...normal,form_started_at:now-age});assert.equal(r.body.accepted,true,JSON.stringify(r));assert.equal(r.body.note_accepted,true);assert.equal(r.body.meta_event_id,'lead_'+id);assert.deepEqual(r.calls.map(c=>c.method),['POST','POST','GET','POST','POST','META','MAIL']);assert.equal(r.calls.find(c=>c.method==='META').event_id,r.body.meta_event_id);assert.equal(r.logs.some(l=>l.event==='lead_spam_stale_form'),age>86400000);});
test('strict decimal integer timing accepted',()=>assert.equal(run({...normal,form_started_at:String(now-3000)}).body.accepted,true));
test('malicious request ID never logged on drops',()=>{const r=run({...normal,request_id:'personal@example.invalid',company_website:'bot'});assert.equal(r.logs[0].request_id,'unavailable');});
test('repeat opportunity name-only preserves state/value',()=>{const r=run(normal,{repeat:true});assert.equal(r.body.accepted,true);const put=r.calls.find(c=>c.method==='PUT');assert.deepEqual(put.payload,{name:'Maria Example - Adults'});});
for(const [label,edit] of [['invalid phone',{phone:'bad'}],['invalid email',{email:'bad'}],['no consent',{consent:false}],['invalid program',{program:'invalid'}]]) test('legitimate validator '+label,()=>{const r=run({...normal,...edit});assert.equal(r.status,400);assert.deepEqual(r.calls,[]);});
for(const fail of ['/contacts/upsert','/opportunities/search?','/opportunities/upsert','/notes']) test('provider failure '+fail,()=>{const r=run(normal,{fail});assert.equal(r.status,502);assert.equal(r.body.accepted,false);assert.ok(!r.calls.some(c=>['META','MAIL'].includes(c.method)));});
test('original AND heuristic boundaries and 1/4 cohort catch limit; no intake integration',()=>{
 const pattern='aBcDeFgHiJkl';
 const cohort=[[pattern,'',''],[pattern,'','8815550100'],[pattern,'','5125550101'],[pattern,'','5125550102']];
 const cases=[...cohort,['Maria','','5125550100'],['Abcdefghijkl','',''],['ABCDEFGHIJKL','',''],['abcdefghijkl','',''],['abcDEFghijkl','',''],['abcDEFghiJKL','',''],['aBcDeFgHiJk','',''],[pattern,'Example',''],['MaríaEjemplo','',''],['王小明','',''],['Mary-JaneName','',''],['Mary JaneExample','','']];
 const results=run(normal,{classify:cases});assert.deepEqual(results,[true,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false]);assert.equal(results.slice(0,4).filter(Boolean).length,1);
 const r=run({...normal,name:pattern,phone:'invalid'});assert.equal(r.status,400);assert.deepEqual(r.calls,[]);
});
