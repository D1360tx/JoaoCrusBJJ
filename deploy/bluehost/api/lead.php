<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');

const MAX_BODY_BYTES = 24576;
const RATE_LIMIT_WINDOW_SECONDS = 900;
const RATE_LIMIT_MAX_ATTEMPTS = 8;
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
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
    $allowed = array_intersect_key($safeContext, array_flip(['status', 'operation', 'curl_errno', 'provider_trace']));
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

    $stageAllowed = $audience === 'adult' ? ['new', 'returning', 'current', 'competition'] : ['little', 'youth', 'teen'];
    $goalAllowed = $audience === 'adult' ? ['fundamentals', 'specific', 'schedule', 'consistent'] : ['listening', 'confidence', 'boundaries', 'activity'];
    $experienceAllowed = $audience === 'adult' ? ['group', 'private', 'hybrid', 'help'] : ['new', 'tried', 'current', 'returning'];
    $locationAllowed = $audience === 'adult' ? ['dripping', 'austin', 'either'] : ['dripping', 'austin', 'help'];
    $stage = $audience === 'adult' ? require_enum(clean_text($data['stage'] ?? ($data['age_bands'][0] ?? ''), 20), $stageAllowed, 'stage') : (string)$ageBands[0];
    $routeSource = clean_text($data['route_source'] ?? '', 40);
    if ($routeSource !== '') {
        require_enum($routeSource, ['landing-header', 'landing-hero', 'landing-method', 'landing-programs', 'landing-final', 'landing-mobile', 'practice-under-pressure'], 'route source');
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
        'recommended_program' => require_enum(clean_text($data['recommended_program'] ?? '', 40), ['little_champions', 'youth_bjj', 'teen_interest_path', 'family_program_plan', 'private_coaching', 'adult_group_bjj'], 'recommendation'),
        'email_consent' => ($data['email_consent'] ?? false) === true,
        'sms_consent' => ($data['sms_consent'] ?? false) === true,
        'consent_disclosure_version' => require_enum(clean_text($data['consent_disclosure_version'] ?? '', 40), ['program_fit_v1'], 'consent disclosure'),
        'page' => clean_text($data['page'] ?? '', 300),
        'attribution' => is_array($data['attribution'] ?? null) ? $data['attribution'] : [],
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
    $leadType = require_enum(clean_text($data['lead_type'] ?? 'class_inquiry', 40), ['class_inquiry', 'guide', 'offline_flyer', 'team_inquiry', 'teen_interest'], 'lead type');
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
    $program = $isGuide ? 'Parent Guide' : require_enum(clean_text($data['program'] ?? '', 80), ['Little Champions 3–7', 'Youth 8–12', 'Teens 13–17', 'Teen Brazilian Jiu-Jitsu Ages 13-17', 'Adults', 'Private Coaching', 'Team / Corporate', 'Not sure yet'], 'program');
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
        'request_id' => $lead['request_id'], 'form_id' => $lead['form_id'], 'schema_version' => $lead['schema_version'],
        'lead_type' => $lead['lead_type'], 'route_source' => clean_text($lead['route_source'] ?? '', 40), 'audience' => $lead['audience'], 'child_count' => $lead['child_count'],
        'age_bands' => implode(',', $lead['age_bands']), 'stage' => $lead['stage'], 'goal' => $lead['goal'],
        'experience' => $lead['experience'], 'preferred_location' => $lead['preferred_location'],
        'recommended_program' => $lead['recommended_program'], 'email_consent' => $lead['email_consent'] ? 'granted' : 'not_granted',
        'sms_consent' => $lead['sms_consent'] ? 'granted' : 'not_granted',
        'consent_disclosure_version' => $lead['consent_disclosure_version'], 'consent_timestamp' => gmdate('c'),
        'submission_page' => $lead['page'],
        'message' => clean_text($lead['message'] ?? '', 1500),
        'role' => clean_text($lead['role'] ?? '', 120),
        'age' => clean_text($lead['age'] ?? '', 10),
        'availability' => clean_text($lead['availability'] ?? '', 500),
    ];
    $allowedTouchKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'fbclid', 'wbraid', 'gbraid', 'msclkid', 'landing_page', 'referrer_host', 'captured_at'];
    foreach (['first', 'latest'] as $touchName) {
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
    foreach ($map as $logical => $definition) {
        if (!array_key_exists($logical, $values) || $values[$logical] === '') {
            continue;
        }
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
            'Version: v3',
            'Content-Type: application/json',
            'Accept: application/json',
            'X-Request-ID: ' . $requestId,
        ],
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

function build_contact_payload(array $lead, array $map, array $config): array
{
    $payload = [
        'locationId' => $config['location_id'],
        'firstName' => $lead['first_name'],
        'email' => $lead['email'],
        'assignedTo' => $config['owner_id'],
        'createNewIfDuplicateAllowed' => false,
        'customFields' => build_custom_fields($lead, $map),
    ];
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
        'assignedTo' => $config['owner_id'],
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
    $config = [
        'location_id' => env_value('GHL_LOCATION_ID'),
        'pipeline_id' => env_value('GHL_PIPELINE_ID'),
        'stage_id' => env_value('GHL_NEW_LEAD_STAGE_ID'),
        'owner_id' => env_value('GHL_OWNER_USER_ID'),
    ];
    if (in_array('', $config, true)) {
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
    send_legacy_alert($lead);
    log_event($lead['request_id'], 'accepted', [
        'provider_trace' => clean_text($opportunityResponse['traceId'] ?? ($contactResponse['traceId'] ?? ''), 100),
    ]);
    respond(200, [
        'accepted' => true,
        'request_id' => $lead['request_id'],
        'contact_accepted' => true,
        'opportunity_accepted' => true,
    ]);
} catch (InvalidArgumentException | JsonException $exception) {
    respond(400, ['accepted' => false, 'error' => $exception instanceof InvalidArgumentException ? $exception->getMessage() : 'Invalid JSON request.']);
} catch (Throwable $exception) {
    $requestId = isset($lead['request_id']) ? (string)$lead['request_id'] : 'unavailable';
    log_event($requestId, 'delivery_failed');
    respond(502, ['accepted' => false, 'error' => 'We could not securely accept your request. Please try again or call 512-644-4560.']);
}
