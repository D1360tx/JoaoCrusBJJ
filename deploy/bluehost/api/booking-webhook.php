<?php
declare(strict_types=1);

// Provider-signed appointments, never a browser redirect or CTA conversion.
define('JOAO_LIFECYCLE_LIBRARY_ONLY', true);
require __DIR__ . '/lifecycle.php';

function booking_calendars(): array
{
    return [
        'WqEFb31yftWo7HOIxyv1' => 'little',
        'lwI401IPhkVBM5TUAhYm' => 'youth',
        'TZDZNzvBn0gcHFyfjk2l' => 'homeschool',
        'GO56GPdtrVWfqhOmGK3w' => 'adults',
        'wY51xc5N1INt6jsQByeC' => 'youth',
    ];
}

function booking_normalize(array $data, array $contact): array
{
    if (!in_array($data['type'] ?? '', ['AppointmentCreate', 'AppointmentUpdate'], true)
        || ($data['locationId'] ?? '') !== lifecycle_env('GHL_LOCATION_ID')) {
        throw new InvalidArgumentException('Invalid booking source.');
    }
    $appointment = $data['appointment'] ?? [];
    $id = lifecycle_require_identifier($appointment['id'] ?? '', 'appointment');
    $calendar = $appointment['calendarId'] ?? '';
    $calendars = booking_calendars();
    if (!isset($calendars[$calendar]) || ($appointment['appointmentStatus'] ?? '') !== 'confirmed'
        || ($appointment['source'] ?? '') !== 'booking_widget') {
        throw new InvalidArgumentException('Not a confirmed first-class widget appointment.');
    }
    $contactId = lifecycle_require_identifier($appointment['contactId'] ?? '', 'contact');
    if (($contact['id'] ?? '') !== $contactId || ($contact['locationId'] ?? '') !== $data['locationId']) {
        throw new InvalidArgumentException('Contact does not match booking.');
    }
    $timestamp = strtotime((string)($appointment['dateUpdated'] ?? $appointment['dateAdded'] ?? ''));
    if ($timestamp === false || $timestamp < time() - 259200 || $timestamp > time() + 300) {
        throw new InvalidArgumentException('Stale booking notification.');
    }
    $map = json_decode(lifecycle_env('GHL_CUSTOM_FIELD_MAP_JSON'), true);
    if (!is_array($map)) throw new RuntimeException('Contact consent map unavailable.');
    $fields = [];
    foreach ($contact['customFields'] ?? [] as $field) {
        if (isset($field['id'])) $fields[$field['id']] = $field['value'] ?? '';
    }
    $consent = static function (string $key) use ($map, $fields): string {
        $fieldId = $map[$key]['id'] ?? '';
        return $fieldId !== '' && ($fields[$fieldId] ?? '') === 'granted' ? 'granted' : 'denied';
    };
    // Source forms persist advertising denial for GPC. Missing consent never grants.
    return [
        'stage' => 'trial_booked', 'appointment_id' => $id,
        'request_id' => $id, 'contact_id' => $contactId,
        'email' => lifecycle_normalize_email($contact['email'] ?? ''),
        'phone' => lifecycle_normalize_phone($contact['phone'] ?? ''),
        'analytics_storage' => $consent('analytics_storage'),
        'ad_storage' => $consent('ad_storage'), 'ad_user_data' => $consent('ad_user_data'),
        'recommended_program' => $calendars[$calendar], 'stage_changed_at' => $timestamp,
        'latest_fbclid' => '', 'latest_captured_at' => '',
        'latest_utm_source' => '', 'latest_utm_medium' => '', 'latest_utm_campaign' => '',
    ];
}

function booking_event_id(array $lead): string
{
    return 'appointment_' . substr(hash_hmac('sha256', lifecycle_env('GHL_LOCATION_ID') . '|' . $lead['appointment_id'], lifecycle_env('LIFECYCLE_EVENT_SALT')), 0, 32);
}

function booking_get_contact(string $id): array
{
    lifecycle_require_identifier($id, 'contact');
    $token = lifecycle_env('GHL_PRIVATE_INTEGRATION_TOKEN');
    if ($token === '') throw new RuntimeException('Provider credential unavailable.');
    $curl = curl_init('https://services.leadconnectorhq.com/contacts/' . rawurlencode($id));
    curl_setopt_array($curl, [
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token, 'Version: 2021-07-28', 'Accept: application/json'],
        CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_TIMEOUT => 8,
        CURLOPT_MAXREDIRS => 0, CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $raw = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);
    $body = is_string($raw) ? json_decode($raw, true) : null;
    if ($status !== 200 || !is_array($body['contact'] ?? null)) throw new RuntimeException('Provider contact read failed.');
    return $body['contact'];
}

if (defined('JOAO_BOOKING_LIBRARY_ONLY') && JOAO_BOOKING_LIBRARY_ONLY === true) return;

try {
    lifecycle_load_env();
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        lifecycle_respond(405, ['accepted' => false]);
    }
    // Enable only after signed delivery and single-owner Schedule acceptance.
    if (lifecycle_env('GHL_BOOKING_WEBHOOK_ENABLED', 'false') !== 'true') lifecycle_respond(503, ['accepted' => false]);
    if (strlen(lifecycle_env('LIFECYCLE_EVENT_SALT')) < 32) throw new RuntimeException('Event salt unavailable.');
    if (strtolower(trim(explode(';', (string)($_SERVER['CONTENT_TYPE'] ?? ''))[0])) !== 'application/json') lifecycle_respond(415, ['accepted' => false]);
    $raw = file_get_contents('php://input', false, null, 0, LIFECYCLE_MAX_BODY_BYTES + 1);
    if ($raw === false || strlen($raw) > LIFECYCLE_MAX_BODY_BYTES) lifecycle_respond(413, ['accepted' => false]);
    // Deliberately no browser-accessible marker or bearer fallback.
    if (!lifecycle_valid_ghl_signature($raw)) lifecycle_respond(401, ['accepted' => false]);
    $data = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
    if (!is_array($data)) throw new InvalidArgumentException('Invalid notification.');
    if (($data['locationId'] ?? '') !== lifecycle_env('GHL_LOCATION_ID')) throw new InvalidArgumentException('Invalid location.');
    $contact = booking_get_contact((string)($data['appointment']['contactId'] ?? ''));
    $lead = booking_normalize($data, $contact);
    $eventId = booking_event_id($lead);
    $state = lifecycle_with_ledger($eventId, static function (array $state, callable $persist) use ($lead, $eventId): array {
        foreach (['meta', 'ga4'] as $destination) {
            if (lifecycle_terminal_status((string)$state[$destination], $destination)) continue;
            // At most one transport attempt. Ambiguous failures require reconciliation,
            // not automatic GA4 replay (GA4 does not deduplicate arbitrary event_id).
            if ($state[$destination] === 'attempting' || $state[$destination] === 'failed') continue;
            $state[$destination] = 'attempting';
            $persist($state);
            $result = $destination === 'meta' ? lifecycle_meta_send($lead, $eventId) : lifecycle_ga4_send($lead, $eventId);
            $state[$destination] = $result['status'];
            $persist($state);
        }
        return $state;
    });
    $accepted = lifecycle_terminal_status((string)$state['meta'], 'meta') && lifecycle_terminal_status((string)$state['ga4'], 'ga4');
    lifecycle_respond($accepted ? 200 : 502, ['accepted' => $accepted, 'event_id' => $eventId, 'meta_status' => $state['meta'], 'ga4_status' => $state['ga4']]);
} catch (InvalidArgumentException | JsonException $error) {
    lifecycle_respond(400, ['accepted' => false]);
} catch (Throwable $error) {
    lifecycle_respond(502, ['accepted' => false]);
}
