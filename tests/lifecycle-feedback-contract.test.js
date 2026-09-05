const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const lifecycle = read('deploy/bluehost/api/lifecycle.php');
const lead = read('deploy/bluehost/api/lead.php');
const attribution = read('site/assets/attribution.js');
const envExample = read('docs/HIGHLEVEL-BLUEHOST-CONFIG.example.env');
const runbook = read('docs/LIFECYCLE-FEEDBACK-PHASE1.md');

test('lifecycle endpoint fails closed on auth, pipeline, stage, content type, size, and recency', () => {
  assert.match(lifecycle, /lifecycle_header\('Authorization'\)/);
  assert.match(lifecycle, /str_starts_with\(\$authorization, 'Bearer '\)/);
  assert.match(lifecycle, /hash_equals\(\$expected, \$provided\)/);
  assert.match(lifecycle, /X-GHL-Signature/);
  assert.match(lifecycle, /sodium_crypto_sign_verify_detached/);
  assert.match(lifecycle, /MCowBQYDK2VwAyEAi2HR1srL4o18O8BRa7gVJY7G7bupbN3H9AwJrHCDiOg=/);
  assert.match(lifecycle, /hash_equals\(lifecycle_env\('GHL_PIPELINE_ID'\), \$pipelineId\)/);
  assert.match(lifecycle, /Pipeline stage does not match lifecycle stage/);
  assert.match(lifecycle, /contentType !== 'application\/json'/);
  assert.match(lifecycle, /LIFECYCLE_MAX_BODY_BYTES/);
  assert.match(lifecycle, /259200/);
  assert.doesNotMatch(lifecycle, /HTTP_ORIGIN|HTTP_REFERER/);
});

test('stage contract maps the four approved CRM outcomes without Purchase', () => {
  const required = {
    qualified: ['QualifiedLead', 'qualify_lead'],
    trial_booked: ['Schedule', 'trial_booked'],
    trial_attended: ['TrialAttended', 'trial_attended'],
    enrolled: ['CompleteRegistration', 'close_convert_lead'],
  };
  for (const [stage, names] of Object.entries(required)) {
    assert.match(lifecycle, new RegExp(`'${stage}'`));
    for (const name of names) assert.match(lifecycle, new RegExp(`'${name}'`));
  }
  assert.doesNotMatch(lifecycle, /'Purchase'/);
  assert.match(runbook, /`Purchase` is intentionally excluded/);
});

test('Meta and GA4 routing is separately consent-gated', () => {
  assert.match(lifecycle, /\$lead\['ad_storage'\] !== 'granted' \|\| \$lead\['ad_user_data'\] !== 'granted'/);
  assert.match(lifecycle, /\$lead\['analytics_storage'\] !== 'granted'/);
  assert.match(lifecycle, /'consent_denied'/);
  assert.match(lifecycle, /'disabled'/);
  assert.match(lifecycle, /'ad_personalization' => \(\$lead\['ad_storage'\] === 'granted'/);
  assert.doesNotMatch(lifecycle, /non_personalized_ads/);
});

test('Meta click identifiers preserve numeric IDs and fbc uses epoch milliseconds', () => {
  assert.equal(require('../site/assets/attribution.js').sanitizeCampaignValue('120243032830360109', 'campaign_id'), '120243032830360109');
  assert.equal(require('../site/assets/attribution.js').sanitizeCampaignValue('120247010885890109', 'ad_id'), '120247010885890109');
  assert.match(attribution, /Number\.isFinite\(capturedMs\) \? Math\.floor\(capturedMs\) : Date\.now\(\)/);
  assert.match(lifecycle, /\(\$timestamp \* 1000\)/);
});

test('GA4 debug validation does not suppress a later production collection', () => {
  assert.match(lifecycle, /if \(\$status === 'validated'\)/);
  assert.match(lifecycle, /GA4_MEASUREMENT_PROTOCOL_DEBUG/);
  assert.doesNotMatch(lifecycle, /\['accepted', 'transport_accepted', 'validated'/);
});

test('Meta receives hashes and CRM context while GA4 receives no direct identifiers', () => {
  const ga4Start = lifecycle.indexOf('function lifecycle_ga4_send');
  const ga4End = lifecycle.indexOf('function lifecycle_terminal_status');
  const ga4 = lifecycle.slice(ga4Start, ga4End);
  assert.match(lifecycle, /hash\('sha256', \$lead\['email'\]\)/);
  assert.match(lifecycle, /hash\('sha256', \$lead\['phone'\]\)/);
  assert.match(lifecycle, /'lead_event_source' => 'CRM'/);
  assert.match(lifecycle, /'action_source' => 'system_generated'/);
  assert.doesNotMatch(ga4, /\$lead\['email'\]|\$lead\['phone'\]|\$lead\['contact_id'\]|\$lead\['opportunity_id'\]/);
  assert.match(ga4, /lifecycle_receipt_id\(\$lead\)/);
  assert.match(ga4, /lifecycle_client_id\(\$lead\)/);
});

test('destination ledger provides stable event IDs and per-destination retry suppression', () => {
  assert.match(lifecycle, /\$lead\['opportunity_id'\] \. '\|' \. \$lead\['stage'\]/);
  assert.match(lifecycle, /lifecycle_with_ledger/);
  assert.match(lifecycle, /if \(!lifecycle_terminal_status\(\(string\)\(\$state\['meta'\].*, 'meta'\)\)/);
  assert.match(lifecycle, /if \(!lifecycle_terminal_status\(\(string\)\(\$state\['ga4'\].*, 'ga4'\)\)/);
  assert.match(lifecycle, /@chmod\(\$path, 0600\)/);
  assert.match(lifecycle, /cannot be under the public document root/);
  assert.match(lifecycle, /\$persist\(\$state\)/);
});

test('website lead contract persists all three measurement-consent states', () => {
  assert.match(attribution, /analytics_storage: state\.analytics_storage === "granted"/);
  for (const key of ['analytics_storage', 'ad_storage', 'ad_user_data']) {
    assert.match(lead, new RegExp(`'${key}'`));
    assert.match(envExample, new RegExp(`"${key}"`));
  }
  assert.match(envExample, /contact\.analytics_storage_status/);
  assert.match(envExample, /contact\.ad_storage_status/);
  assert.match(envExample, /contact\.ad_user_data_status/);
});

test('configuration and workflow runbook remain placeholder-only and fail closed by default', () => {
  assert.match(envExample, /GA4_MEASUREMENT_PROTOCOL_ENABLED=false/);
  assert.match(envExample, /GA4_MEASUREMENT_PROTOCOL_DEBUG=false/);
  assert.match(envExample, /LIFECYCLE_WEBHOOK_SECRET=replace-/);
  assert.match(envExample, /LIFECYCLE_EVENT_SALT=replace-/);
  assert.match(runbook, /Contains one outbound webhook action and no customer-message action/);
  assert.match(runbook, /Remains Draft until/);
  assert.match(runbook, /tagged `website_lead`/);
  assert.match(runbook, /\{\{contact\.website_request_id\}\}/);
});
