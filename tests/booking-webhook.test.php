<?php
declare(strict_types=1);
define('JOAO_BOOKING_LIBRARY_ONLY', true);
require __DIR__ . '/../deploy/bluehost/api/booking-webhook.php';
putenv('GHL_LOCATION_ID=synthetic_location');
putenv('LIFECYCLE_EVENT_SALT=' . str_repeat('test-only-', 5));
putenv('GHL_CUSTOM_FIELD_MAP_JSON=' . json_encode(['analytics_storage'=>['id'=>'a'], 'ad_storage'=>['id'=>'b'], 'ad_user_data'=>['id'=>'c']]));
function check(bool $value, string $message): void { if (!$value) throw new RuntimeException($message); }
function rejects(callable $call): void { try { $call(); } catch (InvalidArgumentException $e) { return; } throw new RuntimeException('Expected rejection'); }
$contact = ['id'=>'synthetic_contact', 'locationId'=>'synthetic_location', 'email'=>'booking-test@example.invalid', 'customFields'=>[]];
$payload = ['type'=>'AppointmentCreate','locationId'=>'synthetic_location','appointment'=>[
    'id'=>'synthetic_appointment','contactId'=>'synthetic_contact','calendarId'=>'WqEFb31yftWo7HOIxyv1',
    'appointmentStatus'=>'confirmed','source'=>'booking_widget','dateAdded'=>gmdate('c'),
]];
foreach (booking_calendars() as $id=>$program) {
    $p=$payload; $p['appointment']['calendarId']=$id;
    $lead=booking_normalize($p,$contact);
    check($lead['recommended_program']===$program,'program');
    check($lead['analytics_storage']==='denied' && $lead['ad_storage']==='denied','missing consent');
}
$contact['customFields']=[['id'=>'a','value'=>'granted'],['id'=>'b','value'=>'denied'],['id'=>'c','value'=>'granted']];
$lead=booking_normalize($payload,$contact);
check($lead['analytics_storage']==='granted' && $lead['ad_storage']==='denied','independent consent');
check(lifecycle_ga4_event_name($lead['stage'])==='trial_booked','existing GA4 contract');
check(lifecycle_meta_event_name($lead['stage'])==='Schedule','Meta contract');
$event=booking_event_id($lead);
$update=$payload; $update['type']='AppointmentUpdate';
check(booking_event_id(booking_normalize($update,$contact))===$event,'stable update dedup');
foreach (['appointmentStatus'=>'cancelled','source'=>'manual','calendarId'=>'unrelated_calendar','dateAdded'=>'2000-01-01T00:00:00Z'] as $k=>$v) {
    $p=$payload; $p['appointment'][$k]=$v; rejects(fn()=>booking_normalize($p,$contact));
}
$p=$payload; $p['locationId']='wrong_location'; rejects(fn()=>booking_normalize($p,$contact));
$p=$payload; $p['type']='ContactCreate'; rejects(fn()=>booking_normalize($p,$contact));
$c=$contact; $c['id']='wrong_contact'; rejects(fn()=>booking_normalize($payload,$c));
check(!lifecycle_valid_ghl_signature(json_encode($payload)), 'unsigned public visit rejected');
if (function_exists('sodium_crypto_sign_keypair')) {
    $keys=sodium_crypto_sign_keypair();
    putenv('GHL_WEBHOOK_ED25519_PUBLIC_KEY=' . base64_encode(sodium_crypto_sign_publickey($keys)));
    $raw=json_encode($payload);
    $_SERVER['HTTP_X_GHL_SIGNATURE']=base64_encode(sodium_crypto_sign_detached($raw,sodium_crypto_sign_secretkey($keys)));
    check(lifecycle_valid_ghl_signature($raw),'valid test signature');
    check(!lifecycle_valid_ghl_signature($raw.' '),'tamper rejected');
} else { throw new RuntimeException('Sodium required for signature test'); }
$dir=sys_get_temp_dir().'/joao-booking-ledger-'.bin2hex(random_bytes(6));
putenv('LIFECYCLE_LEDGER_DIR='.$dir);
$calls=0;
for($i=0;$i<3;$i++) lifecycle_with_ledger($event,function($state,$persist)use(&$calls){if($state['ga4']==='pending'){$calls++;$state['ga4']='transport_accepted';}return $state;});
check($calls===1,'ledger dedup');
foreach(glob($dir.'/*.json') as $file) unlink($file); rmdir($dir);
fwrite(STDOUT,"PASS: five routes, provider schema, signatures, tamper rejection, consent denial, stable ID and ledger replay suppression\n");
