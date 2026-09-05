const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const php = read('deploy/bluehost/api/lead.php');
const stageHelper = read('scripts/ghl_get_stage_ids.sh');
const bluehostHtaccess = read('deploy/bluehost/.htaccess');
const campaignSite = read('site/assets/campaign-site.js');
const metaRetryWorker = read('deploy/bluehost/api/meta-capi-retry.php');

test('endpoint enforces method, same-origin, JSON and bounded body controls', () => {
  assert.match(php, /REQUEST_METHOD/);
  assert.match(php, /header\('Allow: POST'\)/);
  assert.match(php, /request_origin\(\)/);
  assert.match(php, /allowed_origins\(\)/);
  assert.match(php, /CONTENT_TYPE/);
  assert.match(php, /MAX_BODY_BYTES \+ 1/);
  assert.match(php, /website/);
  assert.match(php, /enforce_rate_limit/);
  assert.match(php, /flock\(\$handle, LOCK_EX\)/);
  assert.match(php, /env_value\('LEAD_RATE_LIMIT_SALT'\)/);
  assert.doesNotMatch(php, /env_value\('LEAD_RATE_LIMIT_SALT',/);
  assert.match(php, /strlen\(\$salt\) < 32/);
  assert.match(php, /str_starts_with\(strtolower\(\$salt\), 'replace'\)/);
  assert.match(php, /Retry-After/);
});

test('endpoint normalizes identity and validates quiz recommendation enums', () => {
  assert.match(php, /strtolower\(clean_text\(\$value, 160\)\)/);
  assert.match(php, /return '\+' \. \$digits/);
  assert.match(php, /teen_interest_path/);
  assert.match(php, /family_program_plan/);
  assert.match(php, /Recommendation does not match the quiz answers/);
  assert.match(php, /\['little', 'youth', 'teen'\]/);
  assert.match(php, /\['child', 'adult'\]/);
  assert.match(php, /'route_source' => \$routeSource/);
  assert.match(php, /'after60-page'/);
  assert.match(php, /'meta-kids-paid'\], 'route source'/);
  assert.match(php, /'Jiu-Jitsu After 60'/);
  assert.match(php, /'jiu_jitsu_after_60'/);
});

test('quiz custom fields use parent-facing labels without changing routing enums', () => {
  assert.match(php, /function quiz_display_value\(string \$field, string \$value\): string/);
  assert.match(php, /'little' => 'Little Champions · Ages 3–7'/);
  assert.match(php, /'listening' => 'Listening and following directions'/);
  assert.match(php, /'dripping' => 'Dripping Springs'/);
  assert.match(php, /'little_champions' => 'Little Champions · Ages 3–7'/);
  assert.match(php, /'audience' => quiz_display_value\('audience', \$lead\['audience'\]\)/);
  assert.match(php, /'age_bands' => quiz_display_age_bands\(\$lead\['age_bands'\]\)/);
  assert.match(php, /function expected_recommendation\(array \$lead\): string/);
});

test('contact payload is duplicate-safe, preserves existing tags/source, and opportunity fields are present', () => {
  const contactBuilder = php.slice(php.indexOf('function build_contact_payload'), php.indexOf('function build_opportunity_payload'));
  const opportunityBuilder = php.slice(php.indexOf('function build_opportunity_payload'), php.indexOf('function contact_id_from_response'));
  assert.match(contactBuilder, /createNewIfDuplicateAllowed' => false/);
  assert.match(contactBuilder, /assignedTo/);
  assert.match(contactBuilder, /customFields/);
  assert.doesNotMatch(contactBuilder, /'tags'/);
  assert.doesNotMatch(contactBuilder, /'source'/);
  assert.match(opportunityBuilder, /pipelineId/);
  assert.match(opportunityBuilder, /pipelineStageId/);
  assert.match(opportunityBuilder, /status' => 'open'/);
  assert.match(opportunityBuilder, /monetaryValue' => \$config\['opportunity_value'\]/);
  assert.doesNotMatch(opportunityBuilder, /assignedTo/);
  assert.match(php, /\/contacts\/upsert/);
  assert.match(php, /\/opportunities\/upsert/);
  assert.match(php, /GHL_ENABLE_TAG_ADD/);
  assert.match(php, /GHL_DEFAULT_OPPORTUNITY_VALUE/);
  assert.match(php, /Default opportunity value is not configured/);
  assert.match(php, /\/contacts\/' \. rawurlencode\(\$contactId\) \. '\/tags'/);
});

test('SMS nurture release is consent-gated and independently disabled until carrier setup is ready', () => {
  const tagBridge = php.slice(
    php.indexOf('function add_tags_if_enabled'),
    php.indexOf('function send_legacy_alert')
  );
  assert.match(tagBridge, /GHL_ENABLE_SMS_RELEASE/);
  assert.match(tagBridge, /\$lead\['sms_consent'\] === true/);
  assert.match(tagBridge, /\$lead\['phone'\] !== ''/);
  assert.match(tagBridge, /sms_nurture_ready/);
  assert.match(tagBridge, /automation_hold/);
  assert.doesNotMatch(tagBridge, /remove.*automation_hold/i);
});

test('provider calls use server-only config, bounded TLS curl, and non-PII logging', () => {
  assert.match(php, /Authorization:/);
  assert.match(php, /Version: 2021-07-28/);
  assert.match(php, /GHL_ENV_FILE/);
  assert.match(php, /DOCUMENT_ROOT/);
  assert.match(php, /GHL_CUSTOM_FIELD_MAP_JSON/);
  assert.match(php, /GHL_ALLOW_CORE_ONLY/);
  assert.ok(
    php.indexOf("env_value('GHL_ALLOW_CORE_ONLY'") < php.indexOf("env_value('GHL_CUSTOM_FIELD_MAP_JSON'")
  );
  assert.match(bluehostHtaccess, /SetEnv GHL_ENV_FILE \/home1\/joaocrus\/\.joao-secure\/joao-highlevel\.env/);
  assert.match(bluehostHtaccess, /SetEnv LEAD_LOG_FILE \/home1\/joaocrus\/\.joao-secure\/joao-lead-api\.log/);
  assert.match(php, /ini_set\('error_log', \$privateLogFile\)/);
  assert.match(php, /!str_starts_with\(\$privateLogDirectory, \$documentRoot/);
  assert.match(php, /CURLOPT_USERAGENT/);
  assert.match(php, /CURLOPT_CONNECTTIMEOUT => 4/);
  assert.match(php, /CURLOPT_TIMEOUT => 10/);
  assert.match(php, /CURLOPT_PROTOCOLS => CURLPROTO_HTTPS/);
  assert.match(php, /CURLOPT_SSL_VERIFYPEER => true/);
  const logger = php.slice(php.indexOf('function log_event'), php.indexOf('function clean_text'));
  assert.doesNotMatch(logger, /email|phone|first_name|last_name|request body/i);
});

test('Meta CAPI Lead delivery is consent-gated, deduplicated, privacy-safe, and non-blocking', () => {
  const metaBridge = php.slice(
    php.indexOf('function meta_cookie_value'),
    php.indexOf('function build_contact_payload')
  );
  assert.match(metaBridge, /META_CAPI_ENABLED/);
  assert.match(metaBridge, /META_CAPI_ACCESS_TOKEN/);
  assert.match(metaBridge, /META_PIXEL_ID/);
  assert.match(metaBridge, /META_GRAPH_VERSION/);
  assert.match(metaBridge, /\$meta\['ad_storage'\].*'granted'/s);
  assert.match(metaBridge, /\$meta\['ad_user_data'\].*'granted'/s);
  assert.match(metaBridge, /'event_name' => 'Lead'/);
  assert.match(metaBridge, /'event_id' => meta_event_id\(\$lead\)/);
  assert.match(metaBridge, /'action_source' => 'website'/);
  assert.match(metaBridge, /hash\('sha256', strtolower\(\$lead\['email'\]\)\)/);
  assert.match(metaBridge, /hash\('sha256', \$phoneDigits\)/);
  assert.match(metaBridge, /'fbp'/);
  assert.match(metaBridge, /'fbc'/);
  assert.match(metaBridge, /events_received/);
  assert.match(metaBridge, /for \(\$attempt = 1; \$attempt <= \$attemptLimit; \$attempt\+\+\)/);
  assert.match(metaBridge, /META_CAPI_OUTBOX_DIR/);
  assert.match(metaBridge, /file_put_contents\(\$temporary, \$json, LOCK_EX\)/);
  assert.match(metaBridge, /next_attempt_at/);
  assert.match(metaBridge, /meta_capi_dead_lettered/);
  assert.match(metaBridge, /hash_equals\(basename\(\$path, '\.json'\), hash\('sha256', \$eventId\)\)/);
  assert.match(metaRetryWorker, /PHP_SAPI !== 'cli'/);
  assert.match(metaRetryWorker, /JOAO_CAPI_LIBRARY_ONLY/);
  assert.match(metaRetryWorker, /meta_capi_retry_outbox\(20\)/);
  assert.doesNotMatch(metaBridge, /log_event\([^\n]+\$lead\['email'\]/);
  assert.match(php, /\$metaCapiStatus = meta_capi_status\(\$lead\);/);
  assert.match(php, /'meta_event_id' => meta_event_id\(\$lead\)/);
  assert.match(php, /'meta_capi_status' => \$metaCapiStatus/);
  assert.ok(php.indexOf('$metaCapiStatus = meta_capi_status($lead);') > php.indexOf("if ($opportunityId === '')"));
});

test('success is explicit only after durable contact and opportunity acceptance', () => {
  const contactCall = php.indexOf("ghl_request('POST', '/contacts/upsert'");
  const contactCheck = php.indexOf("if ($contactId === '')");
  const opportunityCall = php.indexOf("ghl_request('POST', '/opportunities/upsert'");
  const opportunityCheck = php.indexOf("if ($opportunityId === '')");
  const noteCall = php.indexOf('create_submission_note($contactId, $lead, $config)');
  const mailCall = php.indexOf('send_legacy_alert($lead)');
  const accepted = php.indexOf("'accepted' => true", mailCall);
  assert.ok(contactCall < contactCheck && contactCheck < opportunityCall && opportunityCall < opportunityCheck);
  assert.ok(opportunityCheck < noteCall && noteCall < mailCall && mailCall < accepted);
  assert.match(php, /'contact_accepted' => true/);
  assert.match(php, /'opportunity_accepted' => true/);
  assert.match(php, /'note_accepted' => \$noteAccepted/);
});

test('every accepted submission appends a readable HighLevel note with quiz and campaign/ad context', () => {
  const noteBridge = php.slice(
    php.indexOf('function append_attribution_note'),
    php.indexOf('function send_legacy_alert')
  );
  assert.match(noteBridge, /Website submission/);
  assert.match(noteBridge, /Request ID/);
  assert.match(noteBridge, /Recommended program/);
  assert.match(noteBridge, /Primary goal/);
  assert.match(noteBridge, /First touch/);
  assert.match(noteBridge, /Latest touch/);
  for (const field of ['utm_source', 'utm_medium', 'utm_campaign', 'campaign_id', 'campaign_name', 'adset_id', 'adset_name', 'ad_id', 'ad_name', 'placement', 'site_source_name', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'fbclid', 'landing_page', 'referrer_host']) {
    assert.match(noteBridge, new RegExp(`['"]${field}['"]`));
  }
  assert.match(noteBridge, /\/contacts\/' \. rawurlencode\(\$contactId\) \. '\/notes'/);
  assert.match(noteBridge, /'title' =>/);
  assert.match(noteBridge, /'body' =>/);
  assert.match(noteBridge, /'pinned' => false/);
  assert.doesNotMatch(noteBridge, /'color' =>/);
  assert.match(noteBridge, /mb_substr\(\$noteBody, 0, 4500\)/);
  assert.match(noteBridge, /'v3'/);
  assert.doesNotMatch(noteBridge, /\$lead\['email'\]|\$lead\['phone'\]/);
});

test('legacy and Teen inquiry context is validated and retained for CRM mapping and fallback alert', () => {
  assert.match(php, /'private_coaching'/);
  assert.match(php, /'team_corporate'/);
  assert.match(php, /'teen_interest'/);
  assert.match(php, /'Teen Brazilian Jiu-Jitsu Ages 13-17'/);
  assert.match(php, /'Either location'/);
  assert.match(php, /\['Parent or guardian', 'Teen student'\]/);
  assert.match(php, /\['13', '14', '15', '16', '17'\]/);
  assert.match(php, /\['after-school', 'evening', 'saturday'\]/);
  for (const field of ['message', 'role', 'age', 'availability']) {
    assert.match(php, new RegExp(`'${field}' => clean_text\\(\\$lead\\['${field}'\\]`));
  }
  assert.match(php, /'Message: ' \. \(\(\$lead\['message'\]/);
  assert.match(php, /'Role: ' \. \(\(\$lead\['role'\]/);
  assert.match(php, /'Age: ' \. \(\(\$lead\['age'\]/);
  assert.match(php, /'Availability: ' \. \(\(\$lead\['availability'\]/);
  assert.match(php, /teen_interest_v1/);
});

test('stage discovery helper keeps the private token out of positional arguments', () => {
  assert.match(stageHelper, /GHL_PRIVATE_INTEGRATION_TOKEN/);
  assert.match(stageHelper, /read -r -s/);
  assert.match(stageHelper, /Authorization: Bearer \$\{TOKEN\}/);
  assert.doesNotMatch(stageHelper, /TOKEN=\$1/);
});

test('website forms normalize stored attribution into the gateway first/latest contract', () => {
  const attributionAdapter = campaignSite.slice(
    campaignSite.indexOf('function currentAttribution'),
    campaignSite.indexOf('function updateNavOffset')
  );
  assert.match(attributionAdapter, /first:\s*attribution\.first_touch/);
  assert.match(attributionAdapter, /latest:\s*attribution\.last_touch/);
  assert.doesNotMatch(attributionAdapter, /return window\.joaoAttribution \|\| \{\}/);
});
