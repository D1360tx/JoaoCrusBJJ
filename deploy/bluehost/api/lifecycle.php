<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');

const LIFECYCLE_MAX_BODY_BYTES = 16384;
const LIFECYCLE_META_GRAPH_BASE_URL = 'https://graph.facebook.com';
const LIFECYCLE_GA4_BASE_URL = 'https://www.google-analytics.com';

function lifecycle_respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function lifecycle_clean(mixed $value, int $maxLength): string
{
    $text = trim((string)($value ?? ''));
    $text = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $text) ?? '';
    return function_exists('mb_substr') ? mb_substr($text, 0, $maxLength) : substr($text, 0, $maxLength);
}

function lifecycle_env(string $key, string $default = ''): string
{
    $value = getenv($key);
    return $value === false ? $default : trim((string)$value);
}

function lifecycle_load_env(): void
{
    $path = lifecycle_env('GHL_ENV_FILE');
    if ($path === '') return;
    $realPath = realpath($path);
    $documentRoot = realpath((string)($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($realPath === false || !is_file($realPath) || ($documentRoot !== false && str_starts_with($realPath, $documentRoot . DIRECTORY_SEPARATOR))) {
        throw new RuntimeException('Invalid server environment file.');
    }
    $lines = file($realPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) throw new RuntimeException('Unable to load server environment file.');
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        if (!preg_match('/^[A-Z][A-Z0-9_]*$/', $key) || getenv($key) !== false) continue;
        $value = trim($value);
        if (strlen($value) >= 2 && (($value[0] === '"' && str_ends_with($value, '"')) || ($value[0] === "'" && str_ends_with($value, "'")))) {
            $value = substr($value, 1, -1);
        }
        putenv($key . '=' . $value);
    }
}

function lifecycle_log(string $eventId, string $event, array $safe = []): void
{
    $allowed = array_intersect_key($safe, array_flip(['stage', 'destination', 'status', 'curl_errno', 'provider_trace', 'reason']));
    error_log('lifecycle_api ' . json_encode(['event_id' => $eventId, 'event' => $event] + $allowed, JSON_UNESCAPED_SLASHES));
}

function lifecycle_require_identifier(mixed $value, string $field): string
{
    $cleaned = lifecycle_clean($value, 100);
    if (!preg_match('/^[A-Za-z0-9][A-Za-z0-9._:-]{7,99}$/', $cleaned)) {
        throw new InvalidArgumentException('Invalid ' . $field . '.');
    }
    return $cleaned;
}

function lifecycle_require_consent(mixed $value, string $field): string
{
    $cleaned = lifecycle_clean($value, 20);
    if (!in_array($cleaned, ['granted', 'denied'], true)) {
        throw new InvalidArgumentException('Invalid ' . $field . '.');
    }
    return $cleaned;
}

function lifecycle_normalize_email(mixed $value): string
{
    $email = strtolower(lifecycle_clean($value, 160));
    return filter_var($email, FILTER_VALIDATE_EMAIL) === false ? '' : $email;
}

function lifecycle_normalize_phone(mixed $value): string
{
    $digits = preg_replace('/\D+/', '', lifecycle_clean($value, 40)) ?? '';
    if (strlen($digits) === 10) $digits = '1' . $digits;
    return strlen($digits) === 11 && $digits[0] === '1' ? $digits : '';
}

function lifecycle_stage_contract(): array
{
    $raw = lifecycle_env('GHL_LIFECYCLE_STAGE_MAP_JSON');
    $map = json_decode($raw, true);
    $required = ['qualified', 'trial_booked', 'trial_attended', 'enrolled'];
    if (!is_array($map)) {
        throw new RuntimeException('Lifecycle stage map is not configured.');
    }
    $keys = array_keys($map);
    sort($keys, SORT_STRING);
    $expected = $required;
    sort($expected, SORT_STRING);
    if ($keys !== $expected) {
        throw new RuntimeException('Lifecycle stage map is not configured.');
    }
    foreach ($map as $stage => $id) {
        if (!is_string($id) || !preg_match('/^[A-Za-z0-9-]{8,100}$/', $id)) {
            throw new RuntimeException('Lifecycle stage map is invalid.');
        }
    }
    return $map;
}

function lifecycle_header(string $name): string
{
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    $value = $_SERVER[$key] ?? ($name === 'Authorization' ? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '') : '');
    return is_string($value) ? trim($value) : '';
}

function lifecycle_ed25519_public_key(): string
{
    $configured = trim(lifecycle_env('GHL_WEBHOOK_ED25519_PUBLIC_KEY'));
    $encoded = $configured !== ''
        ? preg_replace('/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s+/', '', $configured)
        : 'MCowBQYDK2VwAyEAi2HR1srL4o18O8BRa7gVJY7G7bupbN3H9AwJrHCDiOg=';
    $decoded = base64_decode((string)$encoded, true);
    if (!is_string($decoded)) {
        throw new RuntimeException('HighLevel webhook public key is invalid.');
    }
    if (strlen($decoded) === SODIUM_CRYPTO_SIGN_PUBLICKEYBYTES) {
        return $decoded;
    }
    if (strlen($decoded) >= SODIUM_CRYPTO_SIGN_PUBLICKEYBYTES) {
        return substr($decoded, -SODIUM_CRYPTO_SIGN_PUBLICKEYBYTES);
    }
    throw new RuntimeException('HighLevel webhook public key is invalid.');
}

function lifecycle_valid_ghl_signature(string $rawBody): bool
{
    $encoded = lifecycle_header('X-GHL-Signature');
    if ($encoded === '' || !function_exists('sodium_crypto_sign_verify_detached')) {
        return false;
    }
    $signature = base64_decode($encoded, true);
    if (!is_string($signature) || strlen($signature) !== SODIUM_CRYPTO_SIGN_BYTES) {
        return false;
    }
    try {
        return sodium_crypto_sign_verify_detached($signature, $rawBody, lifecycle_ed25519_public_key());
    } catch (Throwable $error) {
        return false;
    }
}

function lifecycle_authorize(string $rawBody): void
{
    if (lifecycle_valid_ghl_signature($rawBody)) {
        return;
    }
    $expected = lifecycle_env('LIFECYCLE_WEBHOOK_SECRET');
    $authorization = lifecycle_header('Authorization');
    $provided = str_starts_with($authorization, 'Bearer ') ? trim(substr($authorization, 7)) : '';
    if (strlen($expected) < 32 || $provided === '' || !hash_equals($expected, $provided)) {
        lifecycle_respond(401, ['accepted' => false, 'error' => 'Unauthorized.']);
    }
}

function lifecycle_safe_campaign_value(mixed $value, bool $identifier = false): string
{
    $cleaned = lifecycle_clean($value, 160);
    if ($cleaned === '') return '';
    if ($identifier) {
        return preg_match('/^[A-Za-z0-9._:-]{1,160}$/', $cleaned) ? $cleaned : '';
    }
    if (preg_match('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', $cleaned) || preg_match('/(?:\+?\d[\s().-]*){7,}/', $cleaned)) {
        return '';
    }
    return $cleaned;
}

function lifecycle_normalize(array $data): array
{
    if (lifecycle_clean($data['schema_version'] ?? '', 40) !== 'opportunity_lifecycle_v1') {
        throw new InvalidArgumentException('Invalid schema version.');
    }
    $pipelineId = lifecycle_require_identifier($data['pipeline_id'] ?? '', 'pipeline');
    if (!hash_equals(lifecycle_env('GHL_PIPELINE_ID'), $pipelineId)) {
        throw new InvalidArgumentException('Invalid pipeline.');
    }
    $stage = lifecycle_clean($data['lifecycle_stage'] ?? '', 40);
    $map = lifecycle_stage_contract();
    if (!isset($map[$stage])) throw new InvalidArgumentException('Invalid lifecycle stage.');
    $stageId = lifecycle_require_identifier($data['pipeline_stage_id'] ?? '', 'pipeline stage');
    if (!hash_equals((string)$map[$stage], $stageId)) {
        throw new InvalidArgumentException('Pipeline stage does not match lifecycle stage.');
    }
    $requestId = lifecycle_require_identifier($data['request_id'] ?? '', 'request identifier');
    $email = lifecycle_normalize_email($data['email'] ?? '');
    $phone = lifecycle_normalize_phone($data['phone'] ?? '');
    if ($email === '' && $phone === '') throw new InvalidArgumentException('A matchable contact method is required.');
    $changedAt = lifecycle_clean($data['stage_changed_at'] ?? '', 50);
    $changedTimestamp = $changedAt === '' ? time() : strtotime($changedAt);
    if ($changedTimestamp === false || $changedTimestamp < time() - 259200 || $changedTimestamp > time() + 300) {
        throw new InvalidArgumentException('Invalid stage change time.');
    }
    $lead = [
        'stage' => $stage,
        'pipeline_id' => $pipelineId,
        'pipeline_stage_id' => $stageId,
        'opportunity_id' => lifecycle_require_identifier($data['opportunity_id'] ?? '', 'opportunity'),
        'contact_id' => lifecycle_require_identifier($data['contact_id'] ?? '', 'contact'),
        'request_id' => $requestId,
        'email' => $email,
        'phone' => $phone,
        'analytics_storage' => lifecycle_require_consent($data['analytics_storage'] ?? '', 'analytics consent'),
        'ad_storage' => lifecycle_require_consent($data['ad_storage'] ?? '', 'advertising storage consent'),
        'ad_user_data' => lifecycle_require_consent($data['ad_user_data'] ?? '', 'advertising user-data consent'),
        'recommended_program' => lifecycle_safe_campaign_value($data['recommended_program'] ?? ''),
        'submission_page' => lifecycle_clean($data['submission_page'] ?? '', 300),
        'latest_utm_source' => lifecycle_safe_campaign_value($data['latest_utm_source'] ?? ''),
        'latest_utm_medium' => lifecycle_safe_campaign_value($data['latest_utm_medium'] ?? ''),
        'latest_utm_campaign' => lifecycle_safe_campaign_value($data['latest_utm_campaign'] ?? '', true),
        'latest_fbclid' => lifecycle_safe_campaign_value($data['latest_fbclid'] ?? '', true),
        'latest_captured_at' => lifecycle_clean($data['latest_captured_at'] ?? '', 50),
        'stage_changed_at' => $changedTimestamp,
    ];
    return $lead;
}

function lifecycle_event_id(array $lead): string
{
    return 'crm_' . $lead['stage'] . '_' . substr(hash_hmac('sha256', $lead['opportunity_id'] . '|' . $lead['stage'], lifecycle_env('LIFECYCLE_EVENT_SALT')), 0, 32);
}

function lifecycle_receipt_id(array $lead): string
{
    return substr(hash_hmac('sha256', $lead['request_id'], lifecycle_env('LIFECYCLE_EVENT_SALT')), 0, 24);
}

function lifecycle_client_id(array $lead): string
{
    $binary = hash_hmac('sha256', 'ga4|' . $lead['request_id'], lifecycle_env('LIFECYCLE_EVENT_SALT'), true);
    $parts = unpack('Nfirst/Nsecond', substr($binary, 0, 8));
    return (string)($parts['first'] ?? 1) . '.' . (string)($parts['second'] ?? 1);
}

function lifecycle_ledger_dir(bool $create): string
{
    $configured = lifecycle_env('LIFECYCLE_LEDGER_DIR');
    if ($configured === '' || !str_starts_with($configured, '/') || str_contains($configured, '..')) {
        throw new RuntimeException('Lifecycle ledger is not safely configured.');
    }
    if ($create && !is_dir($configured) && !mkdir($configured, 0700, true) && !is_dir($configured)) {
        throw new RuntimeException('Lifecycle ledger could not be created.');
    }
    $resolved = realpath($configured);
    if ($resolved === false || !is_dir($resolved)) throw new RuntimeException('Lifecycle ledger is unavailable.');
    $documentRoot = realpath((string)($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($documentRoot !== false && ($resolved === $documentRoot || str_starts_with($resolved . '/', $documentRoot . '/'))) {
        throw new RuntimeException('Lifecycle ledger cannot be under the public document root.');
    }
    @chmod($resolved, 0700);
    return $resolved;
}

function lifecycle_write_ledger($handle, string $path, array $state): void
{
    ftruncate($handle, 0);
    rewind($handle);
    if (fwrite($handle, json_encode($state, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)) === false) {
        throw new RuntimeException('Lifecycle ledger write failed.');
    }
    fflush($handle);
    @chmod($path, 0600);
}

function lifecycle_with_ledger(string $eventId, callable $callback): array
{
    $path = lifecycle_ledger_dir(true) . '/' . hash('sha256', $eventId) . '.json';
    $handle = @fopen($path, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) throw new RuntimeException('Lifecycle ledger unavailable.');
    try {
        rewind($handle);
        $stored = json_decode((string)stream_get_contents($handle), true);
        $state = is_array($stored) ? $stored : ['version' => 1, 'event_id' => $eventId, 'meta' => 'pending', 'ga4' => 'pending'];
        $persist = static function (array $nextState) use ($handle, $path): void {
            lifecycle_write_ledger($handle, $path, $nextState);
        };
        $state = $callback($state, $persist);
        $persist($state);
        return $state;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function lifecycle_meta_event_name(string $stage): string
{
    return [
        'qualified' => 'QualifiedLead',
        'trial_booked' => 'Schedule',
        'trial_attended' => 'TrialAttended',
        'enrolled' => 'CompleteRegistration',
    ][$stage];
}

function lifecycle_meta_fbc(array $lead): string
{
    if ($lead['latest_fbclid'] === '') return '';
    $timestamp = strtotime($lead['latest_captured_at']);
    if ($timestamp === false) return '';
    return 'fb.1.' . ($timestamp * 1000) . '.' . $lead['latest_fbclid'];
}

function lifecycle_meta_send(array $lead, string $eventId): array
{
    if (lifecycle_env('META_CAPI_ENABLED', 'false') !== 'true') return ['status' => 'disabled'];
    if ($lead['ad_storage'] !== 'granted' || $lead['ad_user_data'] !== 'granted') return ['status' => 'consent_denied'];
    $pixelId = lifecycle_env('META_PIXEL_ID');
    $token = lifecycle_env('META_CAPI_ACCESS_TOKEN');
    $version = lifecycle_env('META_GRAPH_VERSION');
    if (!preg_match('/^\d{8,30}$/', $pixelId) || $token === '' || !preg_match('/^v\d+\.\d+$/', $version)) {
        return ['status' => 'failed', 'reason' => 'configuration'];
    }
    $userData = [];
    if ($lead['email'] !== '') $userData['em'] = [hash('sha256', $lead['email'])];
    if ($lead['phone'] !== '') $userData['ph'] = [hash('sha256', $lead['phone'])];
    $fbc = lifecycle_meta_fbc($lead);
    if ($fbc !== '') $userData['fbc'] = $fbc;
    $payload = ['data' => [[
        'event_name' => lifecycle_meta_event_name($lead['stage']),
        'event_time' => $lead['stage_changed_at'],
        'event_id' => $eventId,
        'action_source' => 'system_generated',
        'user_data' => $userData,
        'custom_data' => [
            'event_source' => 'crm',
            'lead_event_source' => 'CRM',
            'lifecycle_stage' => $lead['stage'],
            'content_name' => $lead['recommended_program'],
            'content_category' => 'prospect_enrollment',
        ],
    ]]];
    $curl = curl_init(LIFECYCLE_META_GRAPH_BASE_URL . '/' . rawurlencode($version) . '/' . rawurlencode($pixelId) . '/events');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token, 'Content-Type: application/json', 'Accept: application/json'],
        CURLOPT_USERAGENT => 'JoaoCrusBJJLifecycle/1.0 (+https://joaocrusbjj.com/)',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $raw = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $errno = curl_errno($curl);
    curl_close($curl);
    $body = is_string($raw) ? json_decode($raw, true) : null;
    if ($errno === 0 && $status >= 200 && $status < 300 && is_array($body) && (int)($body['events_received'] ?? 0) === 1) {
        return ['status' => 'accepted', 'provider_trace' => lifecycle_clean($body['fbtrace_id'] ?? '', 100)];
    }
    return ['status' => 'failed', 'http_status' => $status, 'curl_errno' => $errno];
}

function lifecycle_ga4_event_name(string $stage): string
{
    return [
        'qualified' => 'qualify_lead',
        'trial_booked' => 'trial_booked',
        'trial_attended' => 'trial_attended',
        'enrolled' => 'close_convert_lead',
    ][$stage];
}

function lifecycle_ga4_send(array $lead, string $eventId): array
{
    if (lifecycle_env('GA4_MEASUREMENT_PROTOCOL_ENABLED', 'false') !== 'true') return ['status' => 'disabled'];
    if ($lead['analytics_storage'] !== 'granted') return ['status' => 'consent_denied'];
    $measurementId = lifecycle_env('GA4_MEASUREMENT_ID');
    $secret = lifecycle_env('GA4_API_SECRET');
    if (!preg_match('/^G-[A-Z0-9]{6,20}$/', $measurementId) || $secret === '') {
        return ['status' => 'failed', 'reason' => 'configuration'];
    }
    $params = [
        'event_id' => $eventId,
        'lead_receipt_id' => lifecycle_receipt_id($lead),
        'lifecycle_stage' => $lead['stage'],
        'recommended_program' => $lead['recommended_program'],
        'source' => $lead['latest_utm_source'],
        'medium' => $lead['latest_utm_medium'],
        'campaign' => $lead['latest_utm_campaign'],
        'engagement_time_msec' => 1,
    ];
    $params = array_filter($params, static fn(mixed $value): bool => $value !== '');
    $payload = [
        'client_id' => lifecycle_client_id($lead),
        'timestamp_micros' => $lead['stage_changed_at'] * 1000000,
        'consent' => [
            'ad_user_data' => $lead['ad_user_data'] === 'granted' ? 'GRANTED' : 'DENIED',
            'ad_personalization' => ($lead['ad_storage'] === 'granted' && $lead['ad_user_data'] === 'granted') ? 'GRANTED' : 'DENIED',
        ],
        'events' => [[
            'name' => lifecycle_ga4_event_name($lead['stage']),
            'params' => $params,
        ]],
    ];
    $endpoint = lifecycle_env('GA4_MEASUREMENT_PROTOCOL_DEBUG', 'false') === 'true' ? '/debug/mp/collect' : '/mp/collect';
    $url = LIFECYCLE_GA4_BASE_URL . $endpoint . '?measurement_id=' . rawurlencode($measurementId) . '&api_secret=' . rawurlencode($secret);
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'],
        CURLOPT_USERAGENT => 'JoaoCrusBJJLifecycle/1.0 (+https://joaocrusbjj.com/)',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $raw = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $errno = curl_errno($curl);
    curl_close($curl);
    $body = is_string($raw) && $raw !== '' ? json_decode($raw, true) : [];
    $validationMessages = is_array($body) ? ($body['validationMessages'] ?? []) : [];
    if ($errno === 0 && $status >= 200 && $status < 300 && is_array($validationMessages) && $validationMessages === []) {
        return ['status' => lifecycle_env('GA4_MEASUREMENT_PROTOCOL_DEBUG', 'false') === 'true' ? 'validated' : 'transport_accepted'];
    }
    return ['status' => 'failed', 'http_status' => $status, 'curl_errno' => $errno, 'reason' => $validationMessages === [] ? 'transport' : 'validation'];
}

function lifecycle_terminal_status(string $status, string $destination = ''): bool
{
    if ($status === 'validated') {
        return $destination === 'ga4' && lifecycle_env('GA4_MEASUREMENT_PROTOCOL_DEBUG', 'false') === 'true';
    }
    return in_array($status, ['accepted', 'transport_accepted', 'consent_denied', 'disabled'], true);
}

if (defined('JOAO_LIFECYCLE_LIBRARY_ONLY') && JOAO_LIFECYCLE_LIBRARY_ONLY === true) return;

try {
    lifecycle_load_env();
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        lifecycle_respond(405, ['accepted' => false, 'error' => 'Method not allowed.']);
    }
    $salt = lifecycle_env('LIFECYCLE_EVENT_SALT');
    if (strlen($salt) < 32) throw new RuntimeException('Lifecycle event salt is not configured.');
    $contentType = strtolower(trim(explode(';', (string)($_SERVER['CONTENT_TYPE'] ?? ''))[0]));
    if ($contentType !== 'application/json') lifecycle_respond(415, ['accepted' => false, 'error' => 'JSON is required.']);
    $declaredLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($declaredLength > LIFECYCLE_MAX_BODY_BYTES) lifecycle_respond(413, ['accepted' => false, 'error' => 'Request is too large.']);
    $raw = file_get_contents('php://input', false, null, 0, LIFECYCLE_MAX_BODY_BYTES + 1);
    if ($raw === false || strlen($raw) > LIFECYCLE_MAX_BODY_BYTES) lifecycle_respond(413, ['accepted' => false, 'error' => 'Request is too large.']);
    lifecycle_authorize($raw);
    $data = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
    if (!is_array($data)) throw new InvalidArgumentException('Invalid request.');
    $lead = lifecycle_normalize($data);
    $eventId = lifecycle_event_id($lead);
    $state = lifecycle_with_ledger($eventId, function (array $state, callable $persist) use ($lead, $eventId): array {
        if (!lifecycle_terminal_status((string)($state['meta'] ?? 'pending'), 'meta')) {
            $result = lifecycle_meta_send($lead, $eventId);
            $state['meta'] = $result['status'];
            $state['updated_at'] = time();
            $persist($state);
            lifecycle_log($eventId, 'destination_result', ['stage' => $lead['stage'], 'destination' => 'meta', 'status' => $result['status'], 'curl_errno' => $result['curl_errno'] ?? 0, 'provider_trace' => $result['provider_trace'] ?? '']);
        }
        if (!lifecycle_terminal_status((string)($state['ga4'] ?? 'pending'), 'ga4')) {
            $result = lifecycle_ga4_send($lead, $eventId);
            $state['ga4'] = $result['status'];
            $state['updated_at'] = time();
            $persist($state);
            lifecycle_log($eventId, 'destination_result', ['stage' => $lead['stage'], 'destination' => 'ga4', 'status' => $result['status'], 'curl_errno' => $result['curl_errno'] ?? 0, 'reason' => $result['reason'] ?? '']);
        }
        $state['updated_at'] = time();
        return $state;
    });
    $accepted = lifecycle_terminal_status((string)$state['meta'], 'meta') && lifecycle_terminal_status((string)$state['ga4'], 'ga4');
    lifecycle_respond($accepted ? 200 : 502, [
        'accepted' => $accepted,
        'event_id' => $eventId,
        'lifecycle_stage' => $lead['stage'],
        'meta_status' => $state['meta'],
        'ga4_status' => $state['ga4'],
    ]);
} catch (InvalidArgumentException | JsonException $exception) {
    lifecycle_respond(400, ['accepted' => false, 'error' => $exception instanceof InvalidArgumentException ? $exception->getMessage() : 'Invalid JSON request.']);
} catch (Throwable $exception) {
    lifecycle_log('unavailable', 'delivery_failed', ['reason' => lifecycle_clean($exception->getMessage(), 160)]);
    lifecycle_respond(502, ['accepted' => false, 'error' => 'Lifecycle event delivery failed.']);
}
