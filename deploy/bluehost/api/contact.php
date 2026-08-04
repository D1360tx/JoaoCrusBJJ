<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const CONTACT_TO = 'joaocrusbjj@gmail.com';
const CONTACT_FROM = 'website@joaocrusbjj.com';

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_value(mixed $value, int $maxLength = 500): string
{
    $text = trim((string)($value ?? ''));
    $text = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $text) ?? '';
    return function_exists('mb_substr') ? mb_substr($text, 0, $maxLength) : substr($text, 0, $maxLength);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, ['https://joaocrusbjj.com', 'https://www.joaocrusbjj.com'], true)) {
    respond(403, ['ok' => false, 'error' => 'Request origin is not allowed.']);
}

$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 16384) {
    respond(413, ['ok' => false, 'error' => 'Request is too large.']);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '{}', true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'error' => 'Invalid request.']);
}

if (clean_value($data['website'] ?? '', 200) !== '') {
    respond(200, ['ok' => true]);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/joao-contact-' . hash('sha256', $ip) . '.json';
$now = time();
$attempts = [];
if (is_file($rateFile)) {
    $stored = json_decode((string)file_get_contents($rateFile), true);
    if (is_array($stored)) {
        $attempts = array_values(array_filter($stored, static fn($timestamp) => is_int($timestamp) && $timestamp > $now - 900));
    }
}
if (count($attempts) >= 5) {
    respond(429, ['ok' => false, 'error' => 'Too many requests. Please call or text 512-644-4560.']);
}
$attempts[] = $now;
@file_put_contents($rateFile, json_encode($attempts), LOCK_EX);

$lead = [
    'lead_type' => clean_value($data['lead_type'] ?? 'class_inquiry', 80),
    'name' => clean_value($data['name'] ?? '', 120),
    'phone' => clean_value($data['phone'] ?? '', 40),
    'email' => strtolower(clean_value($data['email'] ?? '', 160)),
    'program' => clean_value($data['program'] ?? '', 120),
    'location' => clean_value($data['location'] ?? '', 120),
    'age' => clean_value($data['age'] ?? '', 40),
    'message' => clean_value($data['message'] ?? '', 2000),
    'page' => clean_value($data['page'] ?? '', 300),
];

$isGuide = $lead['lead_type'] === 'guide';

if (
    $lead['name'] === '' || $lead['email'] === '' || empty($data['consent']) ||
    (!$isGuide && ($lead['phone'] === '' || $lead['program'] === '' || $lead['location'] === ''))
) {
    respond(400, ['ok' => false, 'error' => 'Please complete all required fields.']);
}
if (filter_var($lead['email'], FILTER_VALIDATE_EMAIL) === false) {
    respond(400, ['ok' => false, 'error' => 'Please enter a valid email address.']);
}

if ($isGuide) {
    $lead['phone'] = $lead['phone'] !== '' ? $lead['phone'] : 'Not provided';
    $lead['program'] = 'Parent Guide';
    $lead['location'] = 'Not applicable';
}

$attributionInput = is_array($data['attribution'] ?? null) ? $data['attribution'] : [];
$attributionKeys = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id',
    'gclid', 'fbclid', 'wbraid', 'gbraid', 'msclkid',
    'landing_page', 'referrer_host', 'captured_at',
];
$cleanTouch = static function ($input) use ($attributionKeys): array {
    $input = is_array($input) ? $input : [];
    $touch = [];
    foreach ($attributionKeys as $key) {
        $touch[$key] = clean_value($input[$key] ?? '', $key === 'landing_page' ? 240 : 160);
    }
    return $touch;
};
$firstTouch = $cleanTouch($attributionInput['first_touch'] ?? $attributionInput);
$lastTouch = $cleanTouch($attributionInput['last_touch'] ?? $attributionInput);

$rows = [
    'Lead type' => $lead['lead_type'],
    'Name' => $lead['name'],
    'Phone' => $lead['phone'],
    'Email' => $lead['email'],
    'Program' => $lead['program'],
    'Location' => $lead['location'],
    'Student age' => $lead['age'] !== '' ? $lead['age'] : 'Not provided',
    'Message' => $lead['message'] !== '' ? $lead['message'] : 'None provided',
    'Submitted from' => $lead['page'] !== '' ? $lead['page'] : 'Unknown page',
];
foreach (['First touch' => $firstTouch, 'Last touch' => $lastTouch] as $touchLabel => $touch) {
    foreach ($touch as $key => $value) {
        if ($value !== '') {
            $rows[$touchLabel . ' ' . str_replace('_', ' ', $key)] = $value;
        }
    }
}

$subjectName = preg_replace('/[^\p{L}\p{N} .\'_-]/u', '', $lead['name']) ?: 'Website visitor';
$subject = ($isGuide ? 'New parent guide request: ' : 'New first class request: ') . $subjectName;
$textLines = [$isGuide ? "New Joao Crus BJJ parent guide request" : "New Joao Crus BJJ website lead", ''];
foreach ($rows as $label => $value) {
    $textLines[] = $label . ': ' . $value;
}
$textLines[] = '';
$textLines[] = 'The visitor consented to being contacted about this request.';
$body = implode("\r\n", $textLines);

$headers = [
    'From: Joao Crus BJJ Website <' . CONTACT_FROM . '>',
    'Reply-To: ' . $lead['email'],
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: JoaoCrusBJJ-Website',
];

$sent = mail(CONTACT_TO, $subject, $body, implode("\r\n", $headers));
if (!$sent) {
    error_log('Joao Crus BJJ contact form mail() failed for ' . $lead['email']);
    respond(502, ['ok' => false, 'error' => 'We could not send your request. Please call or text 512-644-4560.']);
}

respond(200, ['ok' => true]);
