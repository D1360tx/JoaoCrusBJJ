const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const php = read('deploy/bluehost/api/lead.php');
const stageHelper = read('scripts/ghl_get_stage_ids.sh');

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
  assert.match(php, /'practice-under-pressure'\], 'route source'/);
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
  assert.doesNotMatch(opportunityBuilder, /assignedTo/);
  assert.match(php, /\/contacts\/upsert/);
  assert.match(php, /\/opportunities\/upsert/);
  assert.match(php, /GHL_ENABLE_TAG_ADD/);
  assert.match(php, /\/contacts\/' \. rawurlencode\(\$contactId\) \. '\/tags'/);
});

test('provider calls use server-only config, bounded TLS curl, and non-PII logging', () => {
  assert.match(php, /Authorization:/);
  assert.match(php, /Version: 2021-07-28/);
  assert.match(php, /GHL_ENV_FILE/);
  assert.match(php, /DOCUMENT_ROOT/);
  assert.match(php, /GHL_CUSTOM_FIELD_MAP_JSON/);
  assert.match(php, /GHL_ALLOW_CORE_ONLY/);
  assert.match(php, /CURLOPT_USERAGENT/);
  assert.match(php, /CURLOPT_CONNECTTIMEOUT => 4/);
  assert.match(php, /CURLOPT_TIMEOUT => 10/);
  assert.match(php, /CURLOPT_PROTOCOLS => CURLPROTO_HTTPS/);
  assert.match(php, /CURLOPT_SSL_VERIFYPEER => true/);
  const logger = php.slice(php.indexOf('function log_event'), php.indexOf('function clean_text'));
  assert.doesNotMatch(logger, /email|phone|first_name|last_name|request body/i);
});

test('success is explicit only after durable contact and opportunity acceptance', () => {
  const contactCall = php.indexOf("ghl_request('POST', '/contacts/upsert'");
  const contactCheck = php.indexOf("if ($contactId === '')");
  const opportunityCall = php.indexOf("ghl_request('POST', '/opportunities/upsert'");
  const opportunityCheck = php.indexOf("if ($opportunityId === '')");
  const mailCall = php.indexOf('send_legacy_alert($lead)');
  const accepted = php.indexOf("'accepted' => true");
  assert.ok(contactCall < contactCheck && contactCheck < opportunityCall && opportunityCall < opportunityCheck);
  assert.ok(opportunityCheck < mailCall && mailCall < accepted);
  assert.match(php, /'contact_accepted' => true/);
  assert.match(php, /'opportunity_accepted' => true/);
});

test('legacy and Teen inquiry context is validated and retained for CRM mapping and fallback alert', () => {
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
