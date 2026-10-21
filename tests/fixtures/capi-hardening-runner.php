<?php
declare(strict_types=1);
// CLI-only fixture. Native handler/helpers, no real HTTP/provider/mail transport.
define('JOAO_CAPI_LIBRARY_ONLY', true);
define('JOAO_LEAD_TEST', true);
$fixture = json_decode(stream_get_contents(STDIN), true, 32, JSON_THROW_ON_ERROR);
$_SERVER = ['DOCUMENT_ROOT' => __DIR__ . '/../../site', 'REMOTE_ADDR' => '192.0.2.1', 'HTTP_USER_AGENT' => 'SyntheticFixture/1.0'];
if (isset($fixture['gpc'])) $_SERVER['HTTP_SEC_GPC'] = $fixture['gpc'];
foreach (['GHL_ENV_FILE' => '', 'META_CAPI_ENABLED' => 'true', 'META_CAPI_TEST_EVENT_CODE' => '', 'META_CAPI_TEST_REQUEST_ID' => '', 'META_CAPI_METRICS_DIR' => ''] + ($fixture['env'] ?? []) as $key => $value) putenv($key . '=' . $value);
// Explicit overrides, only through this CLI runner (not the HTTP application).
foreach ($fixture['env'] ?? [] as $key => $value) putenv($key . '=' . $value);
$calls = []; $logs = [];
$GLOBALS['joao_lead_test_hooks'] = [
    'meta_transport' => function($payload, $id, $attempts) use (&$calls, $fixture) {
        $calls[] = ['payload' => $payload, 'request_id' => $id, 'attempt_limit' => $attempts];
        return ['accepted' => !($fixture['fail'] ?? false), 'status' => ($fixture['fail'] ?? false) ? 503 : 200, 'curl_errno' => 0];
    },
    'log' => function($id, $event, $context) use (&$logs) { $logs[] = ['request_id' => $id, 'event' => $event] + $context; },
];
require __DIR__ . '/../../deploy/bluehost/api/lead.php';
$directory = sys_get_temp_dir() . '/joao-capi-fixture-' . bin2hex(random_bytes(8));
mkdir($directory, 0700, true);
putenv('META_CAPI_OUTBOX_DIR=' . $directory);
try {
    $action = $fixture['action'] ?? 'status';
    $lead = $fixture['lead'] ?? [];
    if ($action === 'url') $result = array_map(fn($page) => meta_event_source_url(['page' => $page]), $fixture['pages']);
    elseif ($action === 'normalize') $result = ['email' => normalize_email($fixture['email']), 'phone' => normalize_us_phone($fixture['phone'], true)];
    elseif ($action === 'test_payload') $result = meta_capi_test_payload($fixture['payload'], $fixture['request_id']);
    elseif ($action === 'metrics') {
        putenv('META_CAPI_METRICS_DIR=' . $directory);
        if (isset($fixture['days'])) file_put_contents($directory . '/meta-capi-daily.json', json_encode($fixture['days']));
        if ($fixture['public_metrics'] ?? false) $_SERVER['DOCUMENT_ROOT'] = $directory;
        $locked = false;
        if ($fixture['locked'] ?? false) {
            $locked = fopen($directory . '/meta-capi-daily.json', 'c+');
            flock($locked, LOCK_EX);
        }
        foreach ($fixture['statuses'] as $status) meta_capi_record_outcome($status);
        if (is_resource($locked)) fclose($locked);
        $path = $directory . '/meta-capi-daily.json';
        $result = ['days' => is_file($path) ? json_decode((string)file_get_contents($path), true) : null, 'mode' => is_file($path) ? fileperms($path) & 0777 : null, 'directory_mode' => fileperms($directory) & 0777];
    } elseif ($action === 'retry') {
        $record = $fixture['record'];
        meta_capi_write_outbox($record);
        meta_capi_write_outbox($record); // duplicate write occupies one stable event file
        $path = meta_capi_outbox_path($record['event_id'], false);
        $mode = fileperms($path) & 0777;
        $first = meta_capi_retry_outbox();
        $second = meta_capi_retry_outbox();
        $result = ['first' => $first, 'second' => $second, 'mode' => $mode];
    } else $result = meta_capi_status($lead);
    echo json_encode(['result' => $result, 'calls' => $calls, 'logs' => $logs]);
} finally {
    foreach (glob($directory . '/*') ?: [] as $path) unlink($path);
    rmdir($directory);
}
