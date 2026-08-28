<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');

$privateLogFile = trim((string)(getenv('LEAD_LOG_FILE') ?: ''));
$privateLogDirectory = $privateLogFile !== '' ? realpath(dirname($privateLogFile)) : false;
$documentRoot = realpath((string)($_SERVER['DOCUMENT_ROOT'] ?? ''));
if (
    $privateLogDirectory !== false
    && is_writable($privateLogDirectory)
    && ($documentRoot === false || !str_starts_with($privateLogDirectory, $documentRoot . DIRECTORY_SEPARATOR))
) {
    ini_set('log_errors', '1');
    ini_set('error_log', $privateLogFile);
}

const MAX_BODY_BYTES = 24576;
const RATE_LIMIT_WINDOW_SECONDS = 900;
const RATE_LIMIT_MAX_ATTEMPTS = 8;
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const META_GRAPH_BASE_URL = 'https://graph.facebook.com';
const LEGACY_ALERT_RECIPIENTS = ['joaocrusbjj@gmail.com', 'diego@icdcventures.com'];
const LEGACY_ALERT_FROM = 'website@joaocrusbjj.com';

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function log_event(string $requestId, string $event, array $safeContext = []): void
{
    $allowed = array_intersect_key($safeContext, array_flip(['status', 'operation', 'curl_errno', 'provider_trace', 'exception', 'reason']));
    error_log('lead_api ' . json_encode(['request_id' => $requestId, 'event' => $event] + $allowed, JSON_UNESCAPED_SLASHES));
}

function clean_text(mixed $value, int $maxLength): string
{
    $text = trim((string)($value ?? ''));
    $text = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $text) ?? '';
    return function_exists('mb_substr') ? mb_substr($text, 0, $maxLength) : substr($text, 0, $maxLength);
}

function env_value(string $key, string $default = ''): string
{
    $value = getenv($key);
    return $value === false ? $default : trim((string)$value);
}

function load_server_env_file(): void
{
    $path = env_value('GHL_ENV_FILE');
    if ($path === '') {
        return;
    }
    $realPath = realpath($path);
    $documentRoot = realpath((string)($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($realPath === false || !is_file($realPath) || ($documentRoot !== false && str_starts_with($realPath, $documentRoot . DIRECTORY_SEPARATOR))) {
        throw new RuntimeException('Invalid server environment file.');
    }
    $lines = file($realPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        throw new RuntimeException('Unable to load server environment file.');
    }
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        if (!preg_match('/^[A-Z][A-Z0-9_]*$/', $key) || getenv($key) !== false) {
            continue;
        }
        $value = trim($value);
        if (strlen($value) >= 2 && (($value[0] === '"' && str_ends_with($value, '"')) || ($value[0] === "'" && str_ends_with($value, "'")))) {
            $value = substr($value, 1, -1);
        }
        putenv($key . '=' . $value);
    }
}

function allowed_origins(): array
{
    $configured = env_value('LEAD_ALLOWED_ORIGINS', 'https://joaocrusbjj.com,https://www.joaocrusbjj.com');
    return array_values(array_filter(array_map('trim', explode(',', $configured))));
}

function request_origin(): string
{
    $origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin !== '') {
        return rtrim($origin, '/');
    }
    $referer = trim((string)($_SERVER['HTTP_REFERER'] ?? ''));
    if ($referer === '') {
        return '';
    }
    $parts = parse_url($referer);
    if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
        return '';
    }
    $port = isset($parts['port']) ? ':' . $parts['port'] : '';
    return strtolower($parts['scheme'] . '://' . $parts['host'] . $port);
}

function enforce_rate_limit(string $ip): void
{
    $salt = env_value('LEAD_RATE_LIMIT_SALT');
    if (strlen($salt) < 32 || str_starts_with(strtolower($salt), 'replace')) {
        throw new RuntimeException('Rate limiter is not configured.');
    }
    $key = hash('sha256', $salt . '|' . $ip);
    $path = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'joao-lead-' . $key . '.json';
    $handle = @fopen($path, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        throw new RuntimeException('Rate limiter unavailable.');
    }
    try {
        rewind($handle);
        $stored = json_decode((string)stream_get_contents($handle), true);
        $now = time();
        $attempts = is_array($stored)
            ? array_values(array_filter($stored, static fn($timestamp): bool => is_int($timestamp) && $timestamp > $now - RATE_LIMIT_WINDOW_SECONDS))
            : [];
        if (count($attempts) >= RATE_LIMIT_MAX_ATTEMPTS) {
            header('Retry-After: ' . RATE_LIMIT_WINDOW_SECONDS);
            respond(429, ['accepted' => false, 'error' => 'Too many requests. Please try later or call 512-644-4560.']);
        }
        $attempts[] = $now;
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($attempts));
        fflush($handle);
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function normalize_email(mixed $value): string
{
    $email = strtolower(clean_text($value, 160));
    return filter_var($email, FILTER_VALIDATE_EMAIL) === false ? '' : $email;
}

function normalize_us_phone(mixed $value, bool $required): string
{
    $raw = clean_text($value, 40);
    if ($raw === '' && !$required) {
        return '';
    }
    if (preg_match('/(?:ext\.?|x)\s*\d+/i', $raw)) {
        return '';
    }
    $digits = preg_replace('/\D+/', '', $raw) ?? '';
    if (strlen($digits) === 10) {
        $digits = '1' . $digits;
    }
    if (strlen($digits) !== 11 || $digits[0] !== '1' || $digits[1] < '2' || $digits[4] < '2') {
        return '';
    }
    return '+' . $digits;
}

function require_enum(string $value, array $allowed, string $field): string
{
    if (!in_array($value, $allowed, true)) {
        throw new InvalidArgumentException('Invalid ' . $field . '.');
    }
    return $value;
}

function split_name(string $name): array
{
    $parts = preg_split('/\s+/', trim($name), 2) ?: [];
    return [$parts[0] ?? '', $parts[1] ?? ''];
}

function expected_recommendation(array $lead): string
{
    if ($lead['audience'] === 'child') {
        if ($lead['child_count'] !== '1') {
            return 'family_program_plan';
        }
        return ['little' => 'little_champions', 'youth' => 'youth_bjj', 'teen' => 'teen_interest_path'][$lead['age_bands'][0]] ?? '';
    }
    $private = in_array($lead['experience'], ['private', 'hybrid'], true)
        || in_array($lead['goal'], ['specific', 'schedule'], true)
        || $lead['preferred_location'] === 'austin'
        || $lead['stage'] === 'competition';
    if ($lead['stage'] === 'after60') {
        return 'jiu_jitsu_after_60';
    }
    return $private ? 'private_coaching' : 'adult_group_bjj';
}

function normalize_quiz(array $data): array
{
    $requestId = clean_text($data['request_id'] ?? '', 80);
    if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9._:-]{15,79}$/', $requestId)) {
        throw new InvalidArgumentException('Invalid request identifier.');
    }
    $audience = require_enum(clean_text($data['audience'] ?? '', 20), ['child', 'adult'], 'audience');
    $childCount = clean_text($data['child_count'] ?? '', 10);
    $ageBands = is_array($data['age_bands'] ?? null) ? array_values(array_unique($data['age_bands'])) : [];
    foreach ($ageBands as $ageBand) {
        require_enum((string)$ageBand, ['little', 'youth', 'teen'], 'age band');
    }
    if ($audience === 'child') {
        require_enum($childCount, ['1', '2', '3', '4+'], 'child count');
        if ($ageBands === [] || ($childCount === '1' && count($ageBands) !== 1)) {
            throw new InvalidArgumentException('Invalid age bands.');
        }
    } elseif ($childCount !== '' || $ageBands !== []) {
        throw new InvalidArgumentException('Child fields do not match audience.');
    }

    $stageAllowed = $audience === 'adult' ? ['new', 'returning', 'current', 'competition', 'after60'] : ['little', 'youth', 'teen'];
    $goalAllowed = $audience === 'adult' ? ['fundamentals', 'specific', 'schedule', 'consistent'] : ['listening', 'confidence', 'boundaries', 'activity'];
    $experienceAllowed = $audience === 'adult' ? ['group', 'private', 'hybrid', 'help'] : ['new', 'tried', 'current', 'returning'];
    $locationAllowed = $audience === 'adult' ? ['dripping', 'austin', 'either'] : ['dripping', 'austin', 'help'];
    $stage = $audience === 'adult' ? require_enum(clean_text($data['stage'] ?? ($data['age_bands'][0] ?? ''), 20), $stageAllowed, 'stage') : (string)$ageBands[0];
    $routeSource = clean_text($data['route_source'] ?? '', 40);
    if ($routeSource !== '') {
        require_enum($routeSource, ['landing-header', 'landing-hero', 'landing-method', 'landing-programs', 'landing-final', 'landing-mobile', 'practice-under-pressure', 'after60-page', 'meta-kids-paid'], 'route source');
    }

    $lead = [
        'request_id' => $requestId,
        'schema_version' => require_enum(clean_text($data['schema_version'] ?? '', 40), ['program_fit_v1'], 'schema version'),
        'form_id' => require_enum(clean_text($data['form_id'] ?? '', 60), ['program_fit_quiz'], 'form'),
        'lead_type' => 'quiz',
        'route_source' => $routeSource,
        'first_name' => clean_text($data['first_name'] ?? '', 80),
        'last_name' => clean_text($data['last_name'] ?? '', 80),
        'email' => normalize_email($data['email'] ?? ''),
        'phone' => normalize_us_phone($data['phone'] ?? '', true),
        'audience' => $audience,
        'child_count' => $childCount,
        'age_bands' => array_map('strval', $ageBands),
        'stage' => $stage,
        'goal' => require_enum(clean_text($data['goal'] ?? '', 30), $goalAllowed, 'goal'),
        'experience' => require_enum(clean_text($data['experience'] ?? '', 30), $experienceAllowed, 'experience'),
        'preferred_location' => require_enum(clean_text($data['preferred_location'] ?? '', 30), $locationAllowed, 'location'),
        'recommended_program' => require_enum(clean_text($data['recommended_program'] ?? '', 40), ['little_champions', 'youth_bjj', 'teen_interest_path', 'family_program_plan', 'private_coaching', 'adult_group_bjj', 'jiu_jitsu_after_60'], 'recommendation'),
        'email_consent' => ($data['email_consent'] ?? false) === true,
        'sms_consent' => ($data['sms_consent'] ?? false) === true,
        'consent_disclosure_version' => require_enum(clean_text($data['consent_disclosure_version'] ?? '', 40), ['program_fit_v1', 'program_fit_sms_v2'], 'consent disclosure'),
        'page' => clean_text($data['page'] ?? '', 300),
        'attribution' => is_array($data['attribution'] ?? null) ? $data['attribution'] : [],
        'meta' => is_array($data['meta'] ?? null) ? $data['meta'] : [],
        'legacy' => false,
    ];
    if ($lead['first_name'] === '' || $lead['email'] === '' || $lead['phone'] === '' || !$lead['email_consent']) {
        throw new InvalidArgumentException('Please complete all required fields.');
    }
    if ($lead['recommended_program'] !== expected_recommendation($lead)) {
        throw new InvalidArgumentException('Recommendation does not match the quiz answers.');
    }
    return $lead;
}

function normalize_legacy(array $data): array
{
    $leadType = require_enum(clean_text($data['lead_type'] ?? 'class_inquiry', 40), ['class_inquiry', 'private_coaching', 'team_corporate', 'guide', 'offline_flyer', 'team_inquiry', 'teen_interest'], 'lead type');
    $formId = clean_text($data['form_id'] ?? '', 80);
    if ($formId === '' || !preg_match('/^[a-z0-9_-]{2,80}$/', $formId)) {
        throw new InvalidArgumentException('Invalid form.');
    }
    $requestId = clean_text($data['request_id'] ?? '', 80);
    if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9._:-]{15,79}$/', $requestId)) {
        throw new InvalidArgumentException('Invalid request identifier.');
    }
    [$firstName, $lastName] = split_name(clean_text($data['name'] ?? '', 120));
    $isGuide = $leadType === 'guide';
    $isTeen = $leadType === 'teen_interest';
    $program = $isGuide ? 'Parent Guide' : require_enum(clean_text($data['program'] ?? '', 80), ['Little Champions 3–7', 'Youth 8–12', 'Teens 13–17', 'Teen Brazilian Jiu-Jitsu Ages 13-17', 'Adults', 'Jiu-Jitsu After 60', 'Private Coaching', 'Team / Corporate', 'Not sure yet'], 'program');
    $location = $isGuide ? 'Not applicable' : require_enum(clean_text($data['location'] ?? '', 40), ['Dripping Springs', 'Austin', 'Either location', 'Not sure yet'], 'location');
    $role = clean_text($data['role'] ?? '', 120);
    $age = clean_text($data['age'] ?? '', 10);
    $availabilityValues = array_values(array_filter(array_map('trim', explode(',', clean_text($data['availability'] ?? '', 500)))));
    if ($isTeen) {
        $role = require_enum($role, ['Parent or guardian', 'Teen student'], 'role');
        $age = require_enum($age, ['13', '14', '15', '16', '17'], 'age');
        foreach ($availabilityValues as $availabilityValue) {
            require_enum($availabilityValue, ['after-school', 'evening', 'saturday'], 'availability');
        }
    }
    $lead = [
        'request_id' => $requestId,
        'schema_version' => 'website_lead_v1',
        'form_id' => $formId,
        'lead_type' => $leadType,
        'route_source' => '',
        'first_name' => $firstName,
        'last_name' => $lastName,
        'email' => normalize_email($data['email'] ?? ''),
        'phone' => normalize_us_phone($data['phone'] ?? '', !$isGuide),
        'audience' => '', 'child_count' => '', 'age_bands' => [], 'stage' => '', 'goal' => '', 'experience' => '',
        'preferred_location' => $location,
        'recommended_program' => $program,
        'email_consent' => ($data['consent'] ?? false) === true,
        'sms_consent' => false,
        'consent_disclosure_version' => $isTeen ? 'teen_interest_v1' : 'website_contact_v1',
        'page' => clean_text($data['page'] ?? '', 300),
        'attribution' => is_array($data['attribution'] ?? null) ? $data['attribution'] : [],
        'meta' => is_array($data['meta'] ?? null) ? $data['meta'] : [],
        'message' => clean_text($data['message'] ?? '', 1500),
        'role' => $role,
        'age' => $age,
        'availability' => implode(', ', $availabilityValues),
        'legacy' => true,
    ];
    if ($lead['first_name'] === '' || $lead['email'] === '' || (!$isGuide && $lead['phone'] === '') || !$lead['email_consent']) {
        throw new InvalidArgumentException('Please complete all required fields.');
    }
    return $lead;
}

function custom_field_map(): array
{
    if (env_value('GHL_ALLOW_CORE_ONLY', 'false') === 'true') {
        return [];
    }
    $raw = env_value('GHL_CUSTOM_FIELD_MAP_JSON');
    $map = json_decode($raw, true);
    if (!is_array($map)) {
        throw new RuntimeException('Custom field mapping is not configured.');
    }
    $requiredFieldMappings = ['request_id', 'form_id', 'schema_version', 'lead_type', 'route_source', 'recommended_program', 'email_consent', 'sms_consent', 'consent_disclosure_version', 'consent_timestamp', 'message', 'role', 'age', 'availability'];
    foreach ($requiredFieldMappings as $required) {
        if (!isset($map[$required]) || !is_array($map[$required])) {
            throw new RuntimeException('Required custom field mapping is missing.');
        }
    }
    foreach ($map as $logical => $definition) {
        if (!is_string($logical) || !is_array($definition)) {
            throw new RuntimeException('Invalid custom field mapping.');
        }
        $id = clean_text($definition['id'] ?? '', 100);
        $key = clean_text($definition['key'] ?? '', 160);
        if ($id === '' || $key === '' || !preg_match('/^[a-zA-Z0-9._-]+$/', $id) || !preg_match('/^[a-zA-Z0-9._-]+$/', $key)) {
            throw new RuntimeException('Invalid custom field mapping.');
        }
    }
    return $map;
}

function flattened_values(array $lead): array
{
    $values = [
        'request_id' => $lead['request_id'],
        'form_id' => $lead['form_id'],
        'schema_version' => $lead['schema_version'],
        'lead_type' => $lead['lead_type'],
        'route_source' => clean_text($lead['route_source'] ?? '', 40),
        'audience' => $lead['audience'],
        'child_count' => $lead['child_count'],
        'age_bands' => implode(',', $lead['age_bands']),
        'stage' => $lead['stage'],
        'goal' => $lead['goal'],
        'primary_goal' => $lead['goal'],
        'experience' => $lead['experience'],
        'preferred_location' => $lead['preferred_location'],
        'recommended_program' => $lead['recommended_program'],
        'email_consent' => $lead['email_consent'] ? 'granted' : 'not_granted',
        'sms_consent' => $lead['sms_consent'] ? 'granted' : 'not_granted',
        'consent_disclosure_version' => $lead['consent_disclosure_version'],
        'consent_timestamp' => gmdate('c'),
        'submission_page' => $lead['page'],
        'message' => clean_text($lead['message'] ?? '', 1500),
        'role' => clean_text($lead['role'] ?? '', 120),
        'age' => clean_text($lead['age'] ?? '', 10),
        'availability' => clean_text($lead['availability'] ?? '', 500),
        'first_name' => clean_text($lead['first_name'] ?? '', 80),
        'last_name' => clean_text($lead['last_name'] ?? '', 80),
        'email' => clean_text($lead['email'] ?? '', 120),
        'phone' => clean_text($lead['phone'] ?? '', 40),
        'company_name' => clean_text($lead['company_name'] ?? '', 120),
        'address1' => clean_text($lead['address1'] ?? '', 160),
        'city' => clean_text($lead['city'] ?? '', 120),
        'country' => clean_text($lead['country'] ?? '', 80),
        'state' => clean_text($lead['state'] ?? '', 80),
        'postal_code' => clean_text($lead['postal_code'] ?? '', 20),
        'website' => clean_text($lead['website'] ?? '', 240),
        'timezone' => clean_text($lead['timezone'] ?? '', 80),
        'lead_source_detail' => clean_text($lead['lead_source_detail'] ?? '', 120),
        'lead_source_original' => clean_text($lead['lead_source_original'] ?? '', 120),
        'source' => clean_text($lead['source'] ?? '', 80),
        'type' => clean_text($lead['type'] ?? '', 80),
        'date_of_birth' => clean_text($lead['date_of_birth'] ?? '', 40),
    ];
    $allowedTouchKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'fbclid', 'wbraid', 'gbraid', 'msclkid', 'landing_page', 'referrer_host', 'captured_at'];
    foreach (["first", "latest"] as $touchName) {
        $touch = is_array($lead['attribution'][$touchName] ?? null) ? $lead['attribution'][$touchName] : [];
        foreach ($allowedTouchKeys as $key) {
            $values[$touchName . '_' . $key] = clean_text($touch[$key] ?? '', $key === 'landing_page' ? 240 : 160);
        }
    }
    return $values;
}

function build_custom_fields(array $lead, array $map): array
{
    $values = flattened_values($lead);
    $fields = [];
    $seenKeys = [];
    foreach ($map as $logical => $definition) {
        if (!array_key_exists($logical, $values) || $values[$logical] === '') {
            continue;
        }
        if (isset($seenKeys[$definition['key']])) {
            continue;
        }
        $seenKeys[$definition['key']] = true;
        $fields[] = ['id' => $definition['id'], 'key' => $definition['key'], 'fieldValue' => $values[$logical]];
    }
    return $fields;
}

function ghl_request(string $method, string $path, array $payload, string $requestId): array
{
    if (!function_exists('curl_init')) {
        throw new RuntimeException('HTTP client unavailable.');
    }
    $token = env_value('GHL_PRIVATE_INTEGRATION_TOKEN');
    if ($token === '') {
        throw new RuntimeException('Provider is not configured.');
    }
    $curl = curl_init(GHL_BASE_URL . $path);
    curl_setopt_array($curl, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Version: 2021-07-28',
            'Content-Type: application/json',
            'Accept: application/json',
            'X-Request-ID: ' . $requestId,
        ],
        CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; JoaoCrusBJJLeadBridge/1.0; +https://joaocrusbjj.com/)',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $raw = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $errno = curl_errno($curl);
    curl_close($curl);
    if ($raw === false || $errno !== 0) {
        log_event($requestId, 'provider_network_failure', ['operation' => $path, 'curl_errno' => $errno]);
        throw new RuntimeException('Provider request failed.');
    }
    $body = json_decode((string)$raw, true);
    if ($status < 200 || $status >= 300 || !is_array($body)) {
        log_event($requestId, 'provider_rejected', ['operation' => $path, 'status' => $status]);
        throw new RuntimeException('Provider rejected request.');
    }
    return $body;
}

function meta_cookie_value(mixed $value): string
{
    $cleaned = clean_text($value, 240);
    return preg_match('/^fb\.1\.\d{10,13}\.[A-Za-z0-9._-]{6,200}$/', $cleaned) ? $cleaned : '';
}

function meta_event_id(array $lead): string
{
    return 'lead_' . $lead['request_id'];
}

function meta_event_source_url(array $lead): string
{
    $page = clean_text($lead['page'] ?? '', 300);
    if (str_starts_with($page, '/')) return 'https://joaocrusbjj.com' . $page;
    $parts = parse_url($page);
    if (
        is_array($parts)
        && strtolower((string)($parts['scheme'] ?? '')) === 'https'
        && in_array(strtolower((string)($parts['host'] ?? '')), ['joaocrusbjj.com', 'www.joaocrusbjj.com'], true)
    ) {
        return 'https://' . strtolower((string)$parts['host']) . ((string)($parts['path'] ?? '/') ?: '/');
    }
    return 'https://joaocrusbjj.com/';
}

function meta_capi_configuration(): array
{
    $pixelId = env_value('META_PIXEL_ID');
    $token = env_value('META_CAPI_ACCESS_TOKEN');
    $graphVersion = env_value('META_GRAPH_VERSION');
    if (!preg_match('/^\d{8,30}$/', $pixelId) || $token === '' || !preg_match('/^v\d+\.\d+$/', $graphVersion)) {
        throw new RuntimeException('Meta CAPI configuration is incomplete.');
    }
    return ['pixel_id' => $pixelId, 'token' => $token, 'graph_version' => $graphVersion];
}

function meta_capi_outbox_dir(bool $create): string
{
    $configured = env_value('META_CAPI_OUTBOX_DIR');
    if ($configured === '' || !str_starts_with($configured, '/') || str_contains($configured, '..')) {
        throw new RuntimeException('Meta CAPI outbox is not safely configured.');
    }
    if ($create && !is_dir($configured) && !mkdir($configured, 0700, true) && !is_dir($configured)) {
        throw new RuntimeException('Meta CAPI outbox could not be created.');
    }
    $resolved = realpath($configured);
    if ($resolved === false || !is_dir($resolved)) throw new RuntimeException('Meta CAPI outbox is unavailable.');
    $documentRoot = realpath((string)($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($documentRoot !== false && ($resolved === $documentRoot || str_starts_with($resolved . '/', $documentRoot . '/'))) {
        throw new RuntimeException('Meta CAPI outbox cannot be under the public document root.');
    }
    @chmod($resolved, 0700);
    return $resolved;
}

function meta_capi_outbox_path(string $eventId, bool $create): string
{
    return meta_capi_outbox_dir($create) . '/' . hash('sha256', $eventId) . '.json';
}

function meta_capi_write_outbox(array $record): void
{
    $eventId = clean_text($record['event_id'] ?? '', 100);
    if (!preg_match('/^lead_[A-Za-z0-9-]{16,80}$/', $eventId)) throw new RuntimeException('Invalid Meta CAPI outbox event.');
    $path = meta_capi_outbox_path($eventId, true);
    $temporary = tempnam(dirname($path), '.meta-capi-');
    if ($temporary === false) throw new RuntimeException('Meta CAPI outbox write failed.');
    try {
        $json = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        if (file_put_contents($temporary, $json, LOCK_EX) === false) throw new RuntimeException('Meta CAPI outbox write failed.');
        chmod($temporary, 0600);
        if (!rename($temporary, $path)) throw new RuntimeException('Meta CAPI outbox promotion failed.');
    } finally {
        if (is_file($temporary)) @unlink($temporary);
    }
}

function meta_capi_send_payload(array $payload, string $requestId, int $attemptLimit): array
{
    $config = meta_capi_configuration();
    $status = 0;
    $errno = 0;
    $trace = '';
    for ($attempt = 1; $attempt <= $attemptLimit; $attempt++) {
        $curl = curl_init(META_GRAPH_BASE_URL . '/' . rawurlencode($config['graph_version']) . '/' . rawurlencode($config['pixel_id']) . '/events');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $config['token'], 'Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_USERAGENT => 'JoaoCrusBJJCAPI/1.0 (+https://joaocrusbjj.com/)',
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
        $trace = is_array($body) ? clean_text($body['fbtrace_id'] ?? '', 100) : '';
        if ($errno === 0 && $status >= 200 && $status < 300 && is_array($body) && (int)($body['events_received'] ?? 0) === 1) {
            log_event($requestId, 'meta_capi_accepted', ['provider_trace' => $trace]);
            return ['accepted' => true, 'status' => $status, 'curl_errno' => 0];
        }
        if ($attempt < $attemptLimit && ($errno !== 0 || $status === 429 || $status >= 500)) usleep(150000);
        else break;
    }
    log_event($requestId, 'meta_capi_failed', ['status' => $status, 'curl_errno' => $errno, 'provider_trace' => $trace]);
    return ['accepted' => false, 'status' => $status, 'curl_errno' => $errno];
}

function meta_capi_status(array $lead): string
{
    if (env_value('META_CAPI_ENABLED', 'false') !== 'true') return 'disabled';
    $meta = is_array($lead['meta'] ?? null) ? $lead['meta'] : [];
    if (($meta['ad_storage'] ?? '') !== 'granted' || ($meta['ad_user_data'] ?? '') !== 'granted') {
        return 'consent_denied';
    }

    $userData = ['em' => [hash('sha256', strtolower($lead['email']))]];
    $phoneDigits = preg_replace('/\D+/', '', $lead['phone']) ?? '';
    if (strlen($phoneDigits) === 10) $phoneDigits = '1' . $phoneDigits;
    if ($phoneDigits !== '') $userData['ph'] = [hash('sha256', $phoneDigits)];
    $clientIp = clean_text($_SERVER['REMOTE_ADDR'] ?? '', 64);
    $clientUserAgent = clean_text($_SERVER['HTTP_USER_AGENT'] ?? '', 500);
    if ($clientIp !== '' && filter_var($clientIp, FILTER_VALIDATE_IP) !== false) $userData['client_ip_address'] = $clientIp;
    if ($clientUserAgent !== '') $userData['client_user_agent'] = $clientUserAgent;
    $fbp = meta_cookie_value($meta['fbp'] ?? '');
    $fbc = meta_cookie_value($meta['fbc'] ?? '');
    if ($fbp !== '') $userData['fbp'] = $fbp;
    if ($fbc !== '') $userData['fbc'] = $fbc;

    $payload = ['data' => [[
        'event_name' => 'Lead',
        'event_time' => time(),
        'event_id' => meta_event_id($lead),
        'event_source_url' => meta_event_source_url($lead),
        'action_source' => 'website',
        'user_data' => $userData,
        'custom_data' => [
            'content_name' => $lead['lead_type'] === 'guide' ? 'Parent Guide' : 'First Class Inquiry',
            'content_category' => $lead['lead_type'] === 'guide' ? 'lead_magnet' : 'class_inquiry',
        ],
    ]]];

    try {
        $result = meta_capi_send_payload($payload, $lead['request_id'], 2);
        if ($result['accepted']) {
            try {
                $outboxPath = meta_capi_outbox_path(meta_event_id($lead), false);
                if (is_file($outboxPath)) @unlink($outboxPath);
            } catch (Throwable $exception) {
                // A successful provider receipt is authoritative even when no prior outbox exists.
            }
            return 'accepted';
        }
        meta_capi_write_outbox([
            'version' => 1,
            'event_id' => meta_event_id($lead),
            'request_id' => $lead['request_id'],
            'payload' => $payload,
            'attempts' => 2,
            'created_at' => time(),
            'next_attempt_at' => time() + 300,
            'last_status' => (int)$result['status'],
            'last_curl_errno' => (int)$result['curl_errno'],
        ]);
        log_event($lead['request_id'], 'meta_capi_queued', []);
    } catch (Throwable $exception) {
        log_event($lead['request_id'], 'meta_capi_queue_failed', ['reason' => 'runtime']);
    }
    return 'failed';
}

function meta_capi_retry_outbox(int $limit = 20): array
{
    if (env_value('META_CAPI_ENABLED', 'false') !== 'true') return ['processed' => 0, 'accepted' => 0, 'failed' => 0, 'dead' => 0];
    $directory = meta_capi_outbox_dir(false);
    $files = glob($directory . '/*.json') ?: [];
    sort($files, SORT_STRING);
    $processed = 0;
    $accepted = 0;
    $failed = 0;
    $dead = 0;
    foreach (array_slice($files, 0, max(1, min($limit, 100))) as $path) {
        $record = json_decode((string)file_get_contents($path), true);
        if (!is_array($record) || !is_array($record['payload'] ?? null) || (int)($record['next_attempt_at'] ?? 0) > time()) continue;
        $eventId = clean_text($record['event_id'] ?? '', 100);
        $requestId = clean_text($record['request_id'] ?? '', 100);
        if (!hash_equals(basename($path, '.json'), hash('sha256', $eventId)) || !preg_match('/^[a-f0-9-]{20,100}$/', $requestId)) continue;
        $processed++;
        $result = meta_capi_send_payload($record['payload'], $requestId, 1);
        if ($result['accepted']) {
            @unlink($path);
            $accepted++;
            continue;
        }
        $record['attempts'] = (int)($record['attempts'] ?? 0) + 1;
        $record['last_status'] = (int)$result['status'];
        $record['last_curl_errno'] = (int)$result['curl_errno'];
        if ($record['attempts'] >= 10) {
            @rename($path, $path . '.dead');
            log_event($requestId, 'meta_capi_dead_lettered', ['attempts' => $record['attempts']]);
            $dead++;
            continue;
        }
        $record['next_attempt_at'] = time() + min(86400, 300 * (2 ** min(8, $record['attempts'] - 2)));
        meta_capi_write_outbox($record);
        $failed++;
    }
    return ['processed' => $processed, 'accepted' => $accepted, 'failed' => $failed, 'dead' => $dead];
}

function build_contact_payload(array $lead, array $map, array $config): array
{
    $payload = [
        'locationId' => $config['location_id'],
        'firstName' => $lead['first_name'],
        'email' => $lead['email'],
        'createNewIfDuplicateAllowed' => false,
        'customFields' => build_custom_fields($lead, $map),
    ];
    if ($config['owner_id'] !== '') $payload['assignedTo'] = $config['owner_id'];
    if ($lead['last_name'] !== '') $payload['lastName'] = $lead['last_name'];
    if ($lead['phone'] !== '') $payload['phone'] = $lead['phone'];
    return $payload;
}

function build_opportunity_payload(array $lead, string $contactId, array $config): array
{
    // HighLevel v3 opportunity upsert acceptance must be proven against the live sub-account.
    // Keep this isolated because vendor schemas have differed across generated documentation.
    return [
        'locationId' => $config['location_id'],
        'pipelineId' => $config['pipeline_id'],
        'pipelineStageId' => $config['stage_id'],
        'contactId' => $contactId,
        'name' => 'Website lead - ' . $lead['recommended_program'],
        'status' => 'open',
        'monetaryValue' => $config['opportunity_value'],
    ];
}

function contact_id_from_response(array $response): string
{
    return clean_text($response['contact']['id'] ?? '', 100);
}

function opportunity_id_from_response(array $response): string
{
    return clean_text($response['opportunity']['id'] ?? ($response['id'] ?? ''), 100);
}

function add_tags_if_enabled(string $contactId, array $lead): void
{
    if (env_value('GHL_ENABLE_TAG_ADD', 'false') !== 'true') return;
    $tags = $lead['lead_type'] === 'quiz' ? ['website_lead', 'quiz_lead', 'automation_hold'] : ['website_lead', 'automation_hold'];
    // SMS release is an independent production interlock. It never clears DND or
    // automation_hold; HighLevel remains authoritative for STOP/DND suppression.
    if (
        $lead['lead_type'] === 'quiz'
        && $lead['sms_consent'] === true
        && $lead['phone'] !== ''
        && env_value('GHL_ENABLE_SMS_RELEASE', 'false') === 'true'
    ) {
        $tags[] = 'sms_nurture_ready';
    }
    ghl_request('POST', '/contacts/' . rawurlencode($contactId) . '/tags', ['tags' => $tags], $lead['request_id']);
}

function send_legacy_alert(array $lead): void
{
    if (env_value('LEAD_ENABLE_LEGACY_EMAIL', 'true') !== 'true') return;
    $subject = 'Accepted website lead: ' . $lead['form_id'];
    $body = "A website lead was accepted by HighLevel.\r\n\r\n"
        . 'Request ID: ' . $lead['request_id'] . "\r\n"
        . 'Name: ' . trim($lead['first_name'] . ' ' . $lead['last_name']) . "\r\n"
        . 'Email: ' . $lead['email'] . "\r\n"
        . 'Phone: ' . ($lead['phone'] ?: 'Not provided') . "\r\n"
        . 'Program: ' . $lead['recommended_program'] . "\r\n"
        . 'Location: ' . $lead['preferred_location'] . "\r\n"
        . 'Role: ' . (($lead['role'] ?? '') ?: 'Not provided') . "\r\n"
        . 'Age: ' . (($lead['age'] ?? '') ?: 'Not provided') . "\r\n"
        . 'Availability: ' . (($lead['availability'] ?? '') ?: 'Not provided') . "\r\n"
        . 'Message: ' . (($lead['message'] ?? '') ?: 'Not provided') . "\r\n";
    $headers = [
        'From: Joao Crus BJJ Website <' . LEGACY_ALERT_FROM . '>',
        'Reply-To: ' . $lead['email'],
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    if (!@mail(implode(', ', LEGACY_ALERT_RECIPIENTS), $subject, $body, implode("\r\n", $headers))) {
        log_event($lead['request_id'], 'legacy_email_failed');
    }
}

if (defined('JOAO_CAPI_LIBRARY_ONLY') && JOAO_CAPI_LIBRARY_ONLY === true) return;

try {
    load_server_env_file();
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        respond(405, ['accepted' => false, 'error' => 'Method not allowed.']);
    }
    $origin = request_origin();
    if ($origin === '' || !in_array($origin, allowed_origins(), true)) {
        respond(403, ['accepted' => false, 'error' => 'Request origin is not allowed.']);
    }
    $contentType = strtolower(trim(explode(';', (string)($_SERVER['CONTENT_TYPE'] ?? ''))[0]));
    if ($contentType !== 'application/json') {
        respond(415, ['accepted' => false, 'error' => 'JSON is required.']);
    }
    $declaredLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($declaredLength > MAX_BODY_BYTES) {
        respond(413, ['accepted' => false, 'error' => 'Request is too large.']);
    }
    $raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
    if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
        respond(413, ['accepted' => false, 'error' => 'Request is too large.']);
    }
    $data = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
    if (!is_array($data)) {
        respond(400, ['accepted' => false, 'error' => 'Invalid request.']);
    }
    if (clean_text($data['website'] ?? '', 200) !== '') {
        respond(202, ['accepted' => false]);
    }
    enforce_rate_limit((string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'));

    $lead = ($data['schema_version'] ?? '') === 'program_fit_v1' ? normalize_quiz($data) : normalize_legacy($data);
    $opportunityValueRaw = env_value('GHL_DEFAULT_OPPORTUNITY_VALUE');
    if ($opportunityValueRaw === '' || !is_numeric($opportunityValueRaw) || (float)$opportunityValueRaw < 0) {
        throw new RuntimeException('Default opportunity value is not configured.');
    }
    $config = [
        'location_id' => env_value('GHL_LOCATION_ID'),
        'pipeline_id' => env_value('GHL_PIPELINE_ID'),
        'stage_id' => env_value('GHL_NEW_LEAD_STAGE_ID'),
        'owner_id' => env_value('GHL_OWNER_USER_ID'),
        'opportunity_value' => (float)$opportunityValueRaw,
    ];
    if ($config['location_id'] === '' || $config['pipeline_id'] === '' || $config['stage_id'] === '') {
        throw new RuntimeException('Provider account IDs are not configured.');
    }
    $map = custom_field_map();
    $contactResponse = ghl_request('POST', '/contacts/upsert', build_contact_payload($lead, $map, $config), $lead['request_id']);
    $contactId = contact_id_from_response($contactResponse);
    if ($contactId === '') {
        throw new RuntimeException('Contact acceptance was ambiguous.');
    }
    add_tags_if_enabled($contactId, $lead);
    $opportunityResponse = ghl_request('POST', '/opportunities/upsert', build_opportunity_payload($lead, $contactId, $config), $lead['request_id']);
    $opportunityId = opportunity_id_from_response($opportunityResponse);
    if ($opportunityId === '') {
        throw new RuntimeException('Opportunity acceptance was ambiguous.');
    }
    $metaCapiStatus = meta_capi_status($lead);
    send_legacy_alert($lead);
    log_event($lead['request_id'], 'accepted', [
        'provider_trace' => clean_text($opportunityResponse['traceId'] ?? ($contactResponse['traceId'] ?? ''), 100),
    ]);
    respond(200, [
        'accepted' => true,
        'request_id' => $lead['request_id'],
        'contact_accepted' => true,
        'opportunity_accepted' => true,
        'meta_event_id' => meta_event_id($lead),
        'meta_capi_status' => $metaCapiStatus,
    ]);
} catch (InvalidArgumentException | JsonException $exception) {
    respond(400, ['accepted' => false, 'error' => $exception instanceof InvalidArgumentException ? $exception->getMessage() : 'Invalid JSON request.']);
} catch (Throwable $exception) {
    $requestId = isset($lead['request_id']) ? (string)$lead['request_id'] : 'unavailable';
    log_event($requestId, 'delivery_failed', [
        'exception' => get_class($exception),
        'reason' => clean_text($exception->getMessage(), 160),
    ]);
    respond(502, ['accepted' => false, 'error' => 'We could not securely accept your request. Please try again or call 512-644-4560.']);
}
