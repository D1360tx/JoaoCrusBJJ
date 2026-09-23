<?php
declare(strict_types=1);
// Execute definitions only; all provider calls are intercepted. No dispatcher or env bootstrap.
$source = file_get_contents(__DIR__ . '/../deploy/bluehost/api/lead.php');
$boundary = strpos($source, "\ntry {\n    load_server_env_file();");
if ($boundary === false) throw new RuntimeException('Dispatcher boundary missing');
$definitions = str_replace('function ghl_request(', 'function unused_real_ghl_request(', substr($source, 5, $boundary - 5));
eval($definitions);
$calls = [];
function ghl_request(...$args): array { global $calls; $calls[] = $args; return ['contact' => ['id' => 'fixture-contact']]; }
$checks = 0;
function check(bool $ok, string $message): void { global $checks; $checks++; if (!$ok) throw new RuntimeException($message); }
$base = ['request_id' => 'local-routing-fixture-2026', 'form_id' => 'booking_popup', 'name' => 'Local Fixture', 'email' => 'fixture@example.com', 'phone' => '2025550123', 'consent' => true];
$map = ['booking_link' => ['id' => 'fixture-booking-field', 'key' => 'contact.booking_link']];
$config = ['location_id' => 'fixture-location', 'owner_id' => 'fixture-owner'];
$prefix = 'https://api.leadconnectorhq.com/widget/bookings/';
$fallback = 'https://joaocrusbjj.com/book/';
foreach ([['Adults','Dripping Springs','adults-first-ds'], ['Little Champions 3–7','Dripping Springs','little-champions-first-ds'], ['Youth 8–12','Dripping Springs','youth-first-ds'], ['Homeschool','Dripping Springs','homeschool-first-ds'], ['Youth 8–12','Austin','youth-first-austin'], ['Adults','Austin','adults-first-austin'], ['Austin Adults','Austin','adults-first-austin'], ['Adults Austin','Austin','adults-first-austin'], ['Austin Adults','Dripping Springs',''], ['Adults Austin','Either location',''], ['Homeschool','Austin',''], ['Private Coaching','Dripping Springs',''], ['Not sure yet','Dripping Springs',''], ['Adults','Either location',''], ['Youth 8–12','Not sure yet',''], ['Teens 13–17','Austin',''], ['Jiu-Jitsu After 60','Dripping Springs','']] as [$program,$location,$slug]) {
    $lead = normalize_legacy($base + ['program' => $program, 'location' => $location, 'booking_link' => 'https://attacker.example/']);
    $expected = $slug ? $prefix . $slug : $fallback;
    check(flattened_values($lead)['booking_link'] === $expected, "$program/$location routing");
    // The same duplicate-safe upsert payload is used for new and existing contacts.
    foreach (['create', 'update'] as $operation) {
        $payload = build_contact_payload($lead, $map, $config);
        check($payload['customFields'] === [['id' => 'fixture-booking-field', 'key' => 'contact.booking_link', 'fieldValue' => $expected]], "$operation field output");
        check(!isset($payload['tags']) && $payload['createNewIfDuplicateAllowed'] === false && $payload['assignedTo'] === 'fixture-owner', "$operation preserves tags/owner");
    }
}
$quiz = ['schema_version' => 'program_fit_v1', 'form_id' => 'program_fit_quiz', 'request_id' => 'local-quiz-fixture-2026', 'first_name' => 'Fixture', 'email' => 'fixture@example.com', 'phone' => '2025550123', 'email_consent' => true, 'consent_disclosure_version' => 'program_fit_sms_v2', 'booking_link' => 'https://attacker.example/'];
foreach ([['child','little','dripping','little_champions','little-champions-first-ds'], ['child','youth','dripping','youth_bjj','youth-first-ds'], ['child','youth','austin','youth_bjj','youth-first-austin'], ['adult','','dripping','adult_group_bjj','adults-first-ds'], ['child','little','austin','little_champions',''], ['child','youth','help','youth_bjj',''], ['adult','','either','adult_group_bjj','']] as [$audience,$age,$location,$program,$slug]) {
    $lead = normalize_quiz($quiz + ['audience' => $audience, 'child_count' => $age ? '1' : '', 'age_bands' => $age ? [$age] : [], 'stage' => $age ?: 'new', 'goal' => $age ? 'confidence' : 'fundamentals', 'experience' => $age ? 'new' : 'group', 'preferred_location' => $location, 'recommended_program' => $program]);
    check(flattened_values($lead)['booking_link'] === ($slug ? $prefix . $slug : $fallback), 'quiz routing');
    foreach (['false','true'] as $release) {
        putenv('GHL_ENABLE_SMS_RELEASE=' . $release); putenv('GHL_ENABLE_TAG_ADD=true');
        $lead['sms_consent'] = true;
        add_tags_if_enabled('fixture-contact', $lead);
        check(end($calls)[2]['tags'] === ['website_lead','quiz_lead'], 'quiz only approved tags');
        check(end($calls)[0] === 'POST', 'no tag deletion');
    }
}
$lead = normalize_legacy($base + ['program' => 'Adults', 'location' => 'Dripping Springs']);
add_tags_if_enabled('fixture-contact', $lead);
check(end($calls)[2]['tags'] === ['website_lead'], 'legacy only website tag');
$count = count($calls); putenv('GHL_ENABLE_TAG_ADD=false'); add_tags_if_enabled('fixture-contact', $lead); check(count($calls) === $count, 'disabled tag addition');
foreach (['fbclid','gclid','wbraid','gbraid','msclkid','utm_campaign','campaign_id'] as $key) {
    foreach ([160,161,512,513] as $length) {
        $lead['attribution'] = ['first' => [$key => str_repeat('x',$length)], 'latest' => [$key => str_repeat('y',$length)]];
        $values = flattened_values($lead);
        $limit = in_array($key,['fbclid','gclid'],true) ? 512 : 160;
        foreach (['first','latest'] as $touch) check(strlen($values[$touch.'_'.$key]) === min($length,$limit), "$key/$length/$touch limit");
    }
}
$env = file_get_contents(__DIR__ . '/../docs/HIGHLEVEL-BLUEHOST-CONFIG.example.env');
preg_match('/^GHL_CUSTOM_FIELD_MAP_JSON=(.+)$/m', $env, $match);
$fullMap = json_decode($match[1], true, 512, JSON_THROW_ON_ERROR);
check($fullMap['booking_link']['key'] === 'contact.booking_link' && str_starts_with($fullMap['booking_link']['id'], 'replace-'), 'placeholder contract');
putenv('GHL_ALLOW_CORE_ONLY=false'); putenv('GHL_CUSTOM_FIELD_MAP_JSON='.json_encode($fullMap));
check(isset(custom_field_map()['booking_link']), 'strict complete map');
foreach (['wrong_key', 'duplicate_key', 'duplicate_id', 'empty_id'] as $invalidMap) {
    $bad = $fullMap;
    if ($invalidMap === 'wrong_key') $bad['booking_link']['key'] = 'contact.wrong';
    if ($invalidMap === 'duplicate_key') $bad['other'] = ['id' => 'other-id', 'key' => 'contact.booking_link'];
    if ($invalidMap === 'duplicate_id') $bad['other'] = ['id' => $bad['booking_link']['id'], 'key' => 'contact.other'];
    if ($invalidMap === 'empty_id') $bad['booking_link']['id'] = '';
    putenv('GHL_CUSTOM_FIELD_MAP_JSON='.json_encode($bad));
    try { custom_field_map(); throw new LogicException('Bad booking map accepted'); } catch (RuntimeException $e) { check(true, $invalidMap); }
}
$family = normalize_quiz($quiz + ['audience' => 'child', 'child_count' => '2', 'age_bands' => ['little','youth'], 'goal' => 'confidence', 'experience' => 'new', 'preferred_location' => 'dripping', 'recommended_program' => 'family_program_plan']);
check(booking_link($family) === $fallback, 'multi-child ambiguity falls back');
foreach (['Homeschool', 'homeschool'] as $program) {
    try { normalize_quiz($quiz + ['audience' => 'child', 'child_count' => '1', 'age_bands' => ['little'], 'goal' => 'confidence', 'experience' => 'new', 'preferred_location' => 'dripping', 'recommended_program' => $program]); throw new LogicException('Age inferred homeschool'); }
    catch (InvalidArgumentException $e) { check(true, 'quiz cannot infer homeschool'); }
}
check(booking_link(['recommended_program' => 'Unknown', 'preferred_location' => 'dripping']) === $fallback, 'unknown fallback');
unset($fullMap['booking_link']); putenv('GHL_CUSTOM_FIELD_MAP_JSON='.json_encode($fullMap));
try { custom_field_map(); throw new LogicException('Missing booking map accepted'); } catch (RuntimeException $e) { check(true,'strict missing rejected'); }
putenv('GHL_ALLOW_CORE_ONLY=true'); putenv('GHL_CUSTOM_FIELD_MAP_JSON=invalid'); check(custom_field_map() === [], 'core-only override preserved');
check(!str_contains($source,"'automation_hold'") && !str_contains($source,"'sms_nurture_ready'"), 'no held/draft tag producers');
check(strpos($source, "ghl_request('POST', '/contacts/upsert'") < strpos($source,'add_tags_if_enabled($contactId, $lead);'), 'field upsert before tagging');
printf("PASS: %d routing/payload/map/tag/click-ID assertions; zero external calls.\n",$checks);
