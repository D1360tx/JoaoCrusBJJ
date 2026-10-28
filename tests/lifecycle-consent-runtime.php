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
 $before=count($GLOBALS['calls']);
 check(lifecycle_ga4_send($lead,lifecycle_event_id($lead))['status']==='transport_accepted',$stage.' mock transport');
 check(count($GLOBALS['calls'])===$before+1,$stage.' one transport');
 $payload=json_decode(end($GLOBALS['calls'])->options[CURLOPT_POSTFIELDS],true);
 check($payload['events'][0]['name']===lifecycle_ga4_event_name($stage),$stage.' mapping');
 check($payload['consent']['ad_user_data']==='DENIED' && $payload['consent']['ad_personalization']==='DENIED',$stage.' advertising denied');
 $encoded=json_encode($payload);
 foreach(['offline@example.invalid','contact-fixture','opportunity-fixture'] as $pii)check(!str_contains($encoded,$pii),$stage.' no direct identity');
 check(lifecycle_event_id($lead)===lifecycle_event_id($lead),$stage.' stable event');
}
check(count($GLOBALS['calls'])===3,'exact three mock Google requests; zero real requests');
check(lifecycle_terminal_status('disabled','ga4'),'disabled ledger stays terminal; no historical backfill');
check(lifecycle_terminal_status('accepted','meta'),'Meta acceptance stays terminal');
echo json_encode(['assertions'=>$count,'mock_google_requests'=>count($GLOBALS['calls']),'real_provider_requests'=>0,'runtime_source_sha256'=>hash_file('sha256',dirname(__DIR__).'/deploy/bluehost/api/lifecycle.php')],JSON_PRETTY_PRINT).PHP_EOL;
