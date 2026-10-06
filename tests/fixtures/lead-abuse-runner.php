<?php
declare(strict_types=1);
// Isolated CLI runner: no production configuration, all transports injected.
define('JOAO_LEAD_TEST', true);
$fixture = json_decode(stream_get_contents(STDIN), true, 32, JSON_THROW_ON_ERROR);
$calls = []; $logs = [];
$_SERVER = ['REQUEST_METHOD' => 'POST', 'HTTP_ORIGIN' => 'https://joaocrusbjj.com', 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => 'fixture-' . getmypid()];
foreach (['GHL_ENV_FILE' => '', 'LEAD_RATE_LIMIT_SALT' => str_repeat('local-only-', 4), 'GHL_LOCATION_ID' => 'local-location', 'GHL_PIPELINE_ID' => 'local-pipeline', 'GHL_NEW_LEAD_STAGE_ID' => 'local-stage', 'GHL_DEFAULT_OPPORTUNITY_VALUE' => '2832', 'GHL_ENABLE_TAG_ADD' => 'true', 'GHL_ALLOW_CORE_ONLY' => 'true', 'GHL_ENABLE_SMS_RELEASE' => 'false'] as $key => $value) putenv($key . '=' . $value);
// Fake deterministic mapped fields exercise booking/consent emission, not core-only fallback.
$map = [];
foreach (['request_id', 'form_id', 'schema_version', 'lead_type', 'route_source', 'recommended_program', 'booking_link', 'email_consent', 'sms_consent', 'consent_disclosure_version', 'consent_timestamp', 'analytics_storage', 'ad_storage', 'ad_user_data', 'message', 'role', 'age', 'availability', 'audience', 'child_count', 'age_bands', 'stage', 'goal', 'experience', 'preferred_location', 'sms_marketing_consent'] as $field) {
    $map[$field] = ['id' => 'local-' . $field, 'key' => 'contact.' . $field];
}
putenv('GHL_ALLOW_CORE_ONLY=false');
putenv('GHL_CUSTOM_FIELD_MAP_JSON=' . json_encode($map));
$GLOBALS['joao_lead_test_hooks'] = [
    'input' => fn() => json_encode($fixture['data']),
    'clock' => fn() => 1800000000000,
    'log' => function($id, $event, $context) use (&$logs) { $logs[] = ['request_id' => $id, 'event' => $event] + $context; },
    'ghl' => function($method, $path, $payload, $id) use (&$calls, $fixture) {
        $calls[] = ['method' => $method, 'path' => $path, 'payload' => $payload];
        if (($fixture['fail'] ?? '') !== '' && str_contains($path, $fixture['fail'])) return [];
        if ($path === '/contacts/upsert') return ['contact' => ['id' => 'local-contact']];
        if (str_starts_with($path, '/opportunities/search?')) return ['opportunities' => ($fixture['repeat'] ?? false) ? [['id' => 'local-opportunity']] : []];
        if (str_starts_with($path, '/opportunities/')) return ['opportunity' => ['id' => 'local-opportunity']];
        if (str_ends_with($path, '/notes')) return ['note' => ['id' => 'local-note']];
        if (str_ends_with($path, '/tags')) return [];
        throw new RuntimeException('Unstubbed provider path');
    },
    'meta' => function($lead) use (&$calls) { $calls[] = ['method' => 'META', 'event_id' => meta_event_id($lead)]; return 'stubbed'; },
    'mail' => function($lead) use (&$calls) { $calls[] = ['method' => 'MAIL']; },
    'respond' => function($status, $body) use (&$calls, &$logs) { echo json_encode(['status' => $status, 'body' => $body, 'calls' => $calls, 'logs' => $logs]); },
];
if (isset($fixture['classify'])) {
    define('JOAO_CAPI_LIBRARY_ONLY', true);
    require __DIR__ . '/../../deploy/bluehost/api/lead.php';
    echo json_encode(array_map(fn($item) => classify_suspect_name_phone(...$item), $fixture['classify']));
} else {
    require __DIR__ . '/../../deploy/bluehost/api/lead.php';
}
