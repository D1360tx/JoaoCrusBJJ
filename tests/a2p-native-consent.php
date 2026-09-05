<?php
declare(strict_types=1);
// Exercise actual endpoint functions locally, never its HTTP dispatcher/providers.
$source = file_get_contents(__DIR__ . '/../deploy/bluehost/api/lead.php');
$boundary = strpos($source, "\ntry {\n    load_server_env_file();");
if ($boundary === false) throw new RuntimeException('Dispatcher boundary missing.');
$definitions = substr($source, 5, $boundary - 5);
$definitions = str_replace('function ghl_request(', 'function unused_real_ghl_request(', $definitions);
eval($definitions);
$calls = [];
function ghl_request(...$args): array { global $calls; $calls[] = $args; return []; }
$checks = 0;
function check(bool $ok, string $message): void { global $checks; $checks++; if (!$ok) throw new RuntimeException($message); }
$base = ['request_id' => 'a2p-local-test-20260905', 'name' => 'Local Test', 'email' => 'test@example.com', 'phone' => '2025550123', 'program' => 'Adults', 'location' => 'Dripping Springs', 'consent' => true, 'page' => 'https://joaocrusbjj.com/contact/'];
foreach (['contact_page', 'booking_popup'] as $id) {
    foreach ([[false, false], [true, false], [false, true], [true, true]] as [$consent, $marketingConsent]) {
        $data = $base + ['form_id' => $id, 'sms_consent' => $consent, 'sms_marketing_consent' => $marketingConsent, 'consent_disclosure_version' => 'website_sms_v3'];
        $lead = normalize_legacy($data);
        check($lead['sms_consent'] === $consent, "$id boolean");
        check($lead['sms_marketing_consent'] === $marketingConsent, "$id marketing boolean");
        check($lead['consent_disclosure_version'] === 'website_sms_v3', "$id version");
        $values = flattened_values($lead);
        check($values['sms_consent'] === ($consent ? 'granted' : 'not_granted'), "$id storage");
        check($values['sms_marketing_consent'] === ($marketingConsent ? 'granted' : 'not_granted'), "$id marketing storage");
        check($values['submission_page'] === $base['page'], "$id page");
        check((bool)strtotime($values['consent_timestamp']), "$id timestamp");
        $fields = build_custom_fields($lead, ['sms_consent' => ['id' => 'test-sms', 'key' => 'contact.sms_consent'], 'sms_marketing_consent' => ['id' => 'test-marketing', 'key' => 'contact.sms_marketing_consent'], 'consent_disclosure_version' => ['id' => 'test-version', 'key' => 'contact.consent_disclosure_version']]);
        check(count($fields) === 3, "$id mapped fields");
        foreach (['false', 'true'] as $release) {
            putenv('GHL_ENABLE_TAG_ADD=true'); putenv('GHL_ENABLE_SMS_RELEASE=' . $release);
            add_tags_if_enabled('local-test-only', $lead);
            $last = $calls[count($calls) - 1];
            check(!in_array('sms_nurture_ready', $last[2]['tags'], true), "$id held under $release");
            check(in_array('automation_hold', $last[2]['tags'], true), "$id automation hold");
        }
    }
    $old = normalize_legacy($base + ['form_id' => $id]);
    check($old['sms_consent'] === false, "$id cached false");
    check($old['consent_disclosure_version'] === 'website_contact_v1', "$id cached version");
}
foreach ([
    ['form_id' => 'website_form', 'sms_consent' => true, 'consent_disclosure_version' => 'website_sms_v3'],
    ['form_id' => 'contact_page', 'sms_consent' => true],
    ['form_id' => 'contact_page', 'sms_consent' => true, 'consent_disclosure_version' => 'unknown'],
    ['form_id' => 'booking_popup', 'sms_consent' => 'on', 'consent_disclosure_version' => 'website_sms_v3'],
    ['form_id' => 'booking_popup', 'sms_consent' => 1, 'consent_disclosure_version' => 'website_sms_v3'],
    ['form_id' => 'booking_popup', 'sms_marketing_consent' => 'on', 'consent_disclosure_version' => 'website_sms_v3'],
] as $invalid) {
    try { normalize_legacy($base + $invalid); throw new RuntimeException('Invalid consent accepted'); }
    catch (InvalidArgumentException $e) { check(true, 'invalid rejected'); }
}
$legacy = normalize_legacy($base + ['form_id' => 'website_form']);
check($legacy['sms_consent'] === false, 'Legacy remains non-SMS');
check(!str_contains($source, "'dnd' => false"), 'No automatic DND reset');
printf("PASS: %d local PHP consent assertions; provider requests intercepted, no external calls.\n", $checks);
