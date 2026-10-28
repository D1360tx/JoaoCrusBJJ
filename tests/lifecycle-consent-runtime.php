<?php
// Offline only: run with php -n. No curl extension/provider can be reached.
declare(strict_types=1);
if (extension_loaded('curl')) throw new RuntimeException('Run with php -n; real curl must be absent.');
foreach (['CURLOPT_POST','CURLOPT_POSTFIELDS','CURLOPT_HTTPHEADER','CURLOPT_USERAGENT','CURLOPT_RETURNTRANSFER','CURLOPT_CONNECTTIMEOUT','CURLOPT_TIMEOUT','CURLOPT_MAXREDIRS','CURLOPT_PROTOCOLS','CURLOPT_SSL_VERIFYPEER','CURLOPT_SSL_VERIFYHOST','CURLPROTO_HTTPS','CURLINFO_RESPONSE_CODE'] as $i=>$key) define($key,$i+1);
$GLOBALS['calls']=[];
function curl_init($url){ return (object)['url'=>$url,'options'=>[]]; }
function curl_setopt_array($c,$options){$c->options=$options;return true;}
function curl_exec($c){$GLOBALS['calls'][]=$c;return str_contains($c->url,'facebook.com')?'{}':' ';}
function curl_getinfo($c,$key){return 204;}
function curl_errno($c){return 0;}
function curl_close($c){}
define('JOAO_LIFECYCLE_LIBRARY_ONLY',true);
require dirname(__DIR__).'/deploy/bluehost/api/lifecycle.php';
$count=0;
function check(bool $ok,string $label):void{global $count;if(!$ok)throw new RuntimeException($label);$count++;}
putenv('GHL_PIPELINE_ID=pipeline-fixture');
$map=['qualified'=>'stage-qualified','trial_booked'=>'stage-booked','trial_attended'=>'stage-attended','enrolled'=>'stage-enrolled'];
putenv('GHL_LIFECYCLE_STAGE_MAP_JSON='.json_encode($map));
putenv('LIFECYCLE_EVENT_SALT='.str_repeat('x',32));
putenv('META_CAPI_ENABLED=true');
putenv('GA4_MEASUREMENT_PROTOCOL_ENABLED=true');
putenv('GA4_MEASUREMENT_ID=G-FIXTURE123');
putenv('GA4_API_SECRET=offline-fixture-only');
foreach(['trial_booked','trial_attended','enrolled'] as $stage){
 $raw=['schema_version'=>'opportunity_lifecycle_v1','pipeline_id'=>'pipeline-fixture','pipeline_stage_id'=>$map[$stage],'lifecycle_stage'=>$stage,'opportunity_id'=>'opportunity-fixture','contact_id'=>'contact-fixture','request_id'=>'request-fixture','email'=>'offline@example.invalid','analytics_storage'=>'denied','ad_storage'=>'denied','ad_user_data'=>'denied'];
 $lead=lifecycle_normalize($raw);
 check(lifecycle_ga4_send($lead,lifecycle_event_id($lead))['status']==='consent_denied',$stage.' GA4 denied');
 check(lifecycle_meta_send($lead,lifecycle_event_id($lead))['status']==='consent_denied',$stage.' Meta denied');
 foreach(['',null,true,false,'true','false','not_granted','unset','GRANTED','{{contact.analytics_storage_status}}',[],(object)[]] as $invalid){
  $bad=$raw;$bad['analytics_storage']=$invalid;
  try {lifecycle_normalize($bad);throw new RuntimeException('Invalid consent accepted');}
  catch(InvalidArgumentException $error){check(true,$stage.' rejects noncanonical consent');}
 }
 $lead['analytics_storage']='granted';
 check(lifecycle_ga4_send($lead,lifecycle_event_id($lead))['status']==='missing_browser_identity',$stage.' no synthetic fallback');
 $lead['ga_client_id']='123456789.1729000000';
 $lead['ga_session_id']='1729000000';
 $before=count($GLOBALS['calls']);
 check(lifecycle_ga4_send($lead,lifecycle_event_id($lead))['status']==='transport_accepted',$stage.' mock transport');
 check(count($GLOBALS['calls'])===$before+1,$stage.' one transport');
 $payload=json_decode(end($GLOBALS['calls'])->options[CURLOPT_POSTFIELDS],true);
 check($payload['events'][0]['name']===lifecycle_ga4_event_name($stage),$stage.' mapping');
 check($payload['client_id']==='123456789.1729000000',$stage.' real browser ID retained');
 check(!isset($payload['events'][0]['params']['session_id']),$stage.' offline outcome does not revive old session');
 check(!isset($payload['events'][0]['params']['engagement_time_msec']),$stage.' offline outcome does not invent browser engagement');
 check($payload['consent']['ad_user_data']==='DENIED' && $payload['consent']['ad_personalization']==='DENIED',$stage.' advertising denied');
 $encoded=json_encode($payload);
 foreach(['offline@example.invalid','contact-fixture','opportunity-fixture'] as $pii)check(!str_contains($encoded,$pii),$stage.' no direct identity');
 check(lifecycle_event_id($lead)===lifecycle_event_id($lead),$stage.' stable event');
}
check(count($GLOBALS['calls'])===3,'exact three mock Google requests; zero real requests');
check(lifecycle_terminal_status('disabled','ga4'),'disabled ledger stays terminal; no historical backfill');
check(lifecycle_terminal_status('accepted','meta'),'Meta acceptance stays terminal');
check(lifecycle_terminal_status('missing_browser_identity','ga4'),'missing Google identity is terminal, no historic replay');
check(!lifecycle_terminal_status('missing_browser_identity','meta'),'Google skip does not suppress Meta');
foreach(['person@example.invalid', '{{contact.ga_client_id}}', [], true, "123.456\n"] as $badId){
 $raw['ga_client_id']=$badId;$raw['ga_session_id']='1729000000';
 $normalized=lifecycle_normalize($raw);
 check($normalized['ga_client_id']==='', 'invalid browser ID discarded without coercion');
}
define('JOAO_CAPI_LIBRARY_ONLY',true);
require dirname(__DIR__).'/deploy/bluehost/api/lead.php';
$intake=array_fill_keys(['request_id','form_id','schema_version','lead_type','audience','child_count','stage','goal','experience','preferred_location','recommended_program','consent_disclosure_version','page'],'');
$intake+=['email_consent'=>true,'sms_consent'=>false,'age_bands'=>[],'meta'=>['analytics_storage'=>'granted','ga_client_id'=>'123.456','ga_session_id'=>'1729000000']];
$values=flattened_values($intake);
check($values['ga_client_id']==='123.456' && $values['ga_session_id']==='1729000000','actual intake flattening retains browser linkage');
$fields=build_custom_fields($intake,['ga_client_id'=>['id'=>'fixture-client','key'=>'contact.ga_client_id'],'ga_session_id'=>['id'=>'fixture-session','key'=>'contact.ga_session_id']]);
check(count($fields)===2 && $fields[0]['fieldValue']==='123.456','actual CRM mapping emits exact browser linkage');
$intake['meta']['analytics_storage']='denied';
check(flattened_values($intake)['ga_client_id']==='' && build_custom_fields($intake,['ga_client_id'=>['id'=>'fixture-client','key'=>'contact.ga_client_id']])===[],'denied intake never maps Google identity');
$intake['meta']['analytics_storage']='granted';$intake['meta']['ga_client_id']=['invalid'];
check(flattened_values($intake)['ga_client_id']==='', 'structured intake Google identity safely discarded');
echo json_encode(['assertions'=>$count,'mock_google_requests'=>count($GLOBALS['calls']),'real_provider_requests'=>0,'runtime_source_sha256'=>hash_file('sha256',dirname(__DIR__).'/deploy/bluehost/api/lifecycle.php')],JSON_PRETTY_PRINT).PHP_EOL;
