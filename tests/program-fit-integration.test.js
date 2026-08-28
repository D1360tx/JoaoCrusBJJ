const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

function quizAnalyticsHarness(consent) {
  const js = read('site/assets/program-fit-quiz.js');
  const analyticsHelper = js.slice(js.indexOf('function pushQuizEvent'), js.indexOf('const icon'));
  const listeners = new Map();
  const window = {
    joaoConsentState: consent,
    joaoRegionReady: consent === undefined ? {} : undefined,
    dataLayer: [],
    addEventListener(name, handler, options = {}) {
      const items = listeners.get(name) || [];
      items.push({ handler, once: options.once === true });
      listeners.set(name, items);
    },
    dispatchTestEvent(name) {
      const items = [...(listeners.get(name) || [])];
      listeners.set(name, items.filter((item) => !item.once));
      items.forEach((item) => item.handler());
    },
  };
  const context = {
    window,
    endpoint: '/api/lead.php',
    routeSource: 'practice-under-pressure',
  };
  vm.createContext(context);
  vm.runInContext(`
    let completionSignature = '';
    let quizStartTracked = false;
    let quizStartPending = false;
    const answers = {};
    const trackedStepCompletions = new Set();
    const questionKeys = ['audience', 'stage', 'goal', 'experience', 'location', 'contact'];
    const quizName = 'program_fit';
    ${analyticsHelper}
    globalThis.quizAnalytics = {
      answers,
      pushQuizEvent,
      safeStepAnswer,
      trackStepComplete,
      trackQuizComplete,
      trackQuizStart,
      completionSignature: () => completionSignature,
    };
  `, context);
  return context;
}

test('program finder production routes are separate and noindex', () => {
  const manifest = JSON.parse(read('site/campaign/seo-pages.json'));
  const landing = manifest.pages.find((page) => page.file === 'program-fit-landing.html');
  const quiz = manifest.pages.find((page) => page.file === 'program-fit-quiz.html');
  assert.equal(landing.path, '/program-finder/');
  assert.equal(quiz.path, '/program-finder/quiz/');
  assert.equal(landing.indexable, false);
  assert.equal(quiz.indexable, false);
  assert.ok(fs.existsSync(path.join(root, 'site/campaign/program-fit-landing-preview.html')));
  assert.ok(fs.existsSync(path.join(root, 'site/campaign/program-fit-quiz-preview.html')));
});

test('production quiz collects required email and optional SMS consent and targets the lead API', () => {
  const html = read('site/campaign/program-fit-quiz.html');
  assert.match(html, /data-endpoint="\/api\/lead\.php"/);
  assert.match(html, /name="email_consent" required/);
  assert.match(html, /name="sms_consent">/);
  assert.doesNotMatch(html, /name="sms_consent" required/);
  assert.match(html, /name="phone"[^>]*required/);
  assert.match(html, /name="website"/);
  assert.match(html, /Message frequency varies/);
  assert.match(html, /Reply STOP to opt out or HELP for help/);
  assert.match(html, /Consent is not a condition of purchase/);
  assert.doesNotMatch(html, /does not send or store/i);
});

test('SMS disclosure version and legal policies document the same messaging program', () => {
  const js = read('site/assets/program-fit-quiz.js');
  const privacy = read('site/campaign/privacy.html');
  const terms = read('site/campaign/terms.html');
  assert.match(js, /consent_disclosure_version: 'program_fit_sms_v2'/);
  for (const policy of [privacy, terms]) {
    assert.match(policy, /Message\s+frequency\s+varies/);
    assert.match(policy, /Message\s+and\s+data\s+rates\s+may\s+apply/);
    assert.match(policy, /STOP/);
    assert.match(policy, /HELP/);
    assert.match(policy, /Consent is not a condition of purchase/);
  }
  assert.match(privacy, /mobile information.*not.*shared.*marketing or promotional purposes/is);
});

test('review quiz remains inert and preserves review disclosure', () => {
  const html = read('site/campaign/program-fit-quiz-preview.html');
  assert.match(html, /data-endpoint=""/);
  assert.match(html, /does not send or store/i);
  assert.doesNotMatch(html, /name="sms_consent"/);
});

test('quiz payload is retry-stable, channel-aware, and never places PII in analytics', () => {
  const js = read('site/assets/program-fit-quiz.js');
  assert.match(js, /request_id: requestId/);
  assert.match(js, /route_source: routeSource/);
  assert.match(js, /fetch\(endpoint/);
  assert.match(js, /credentials: 'same-origin'/);
  assert.match(js, /email_consent:/);
  assert.match(js, /sms_consent:/);
  assert.match(js, /age_bands: answers\.audience === 'child'/);
  assert.match(js, /stage: answers\.audience === 'adult'/);
  assert.match(js, /first: attribution\.first_touch/);
  assert.match(js, /latest: attribution\.last_touch/);
  assert.match(js, /JoaoAttribution\.metaContext\(window, attribution\)/);
  assert.match(js, /meta_event_id: acceptance\.meta_event_id/);
  assert.match(js, /routeAcceptedLead\(\{/);
  assert.match(js, /event: 'lead_submit_success_routed'/);
  assert.match(js, /window\.gtag\('event', 'generate_lead'/);
  assert.match(js, /window\.fbq\('track', 'Lead',[\s\S]*\{ eventID: parameters\.meta_event_id \}/);
  assert.doesNotMatch(js, /pushQuizEvent\('lead_submit_success'/);
  assert.match(js, /body\.meta_event_id !== `lead_\$\{payload\.request_id\}`/);
  assert.match(js, /new AbortController\(\)/);
  assert.match(js, /35000/);

  const analyticsHelper = js.slice(js.indexOf('function pushQuizEvent'), js.indexOf('const icon'));
  assert.ok(analyticsHelper.length > 0, 'analytics helper must be defined before quiz behavior');
  assert.doesNotMatch(analyticsHelper, /first_name|last_name|email|phone|message|website/);
});

test('quiz analytics are discarded while measurement consent is denied', () => {
  const context = quizAnalyticsHarness({ analytics_storage: 'denied', ad_storage: 'denied' });
  context.quizAnalytics.answers.audience = 'child';
  context.quizAnalytics.answers.child_count = '4+';
  context.quizAnalytics.answers.stage = ['little', 'youth'];
  assert.equal(context.quizAnalytics.trackStepComplete(1), false);
  assert.equal(context.quizAnalytics.trackStepComplete(2), false);
  assert.equal(context.quizAnalytics.trackQuizComplete('family_program_plan'), false);
  assert.deepEqual(context.window.dataLayer, []);
  assert.equal(context.quizAnalytics.completionSignature(), '');
});

test('quiz start waits for initial consent resolution without replaying a denied start', () => {
  const granted = quizAnalyticsHarness(undefined);
  assert.equal(granted.quizAnalytics.trackQuizStart('cta'), false);
  assert.equal(granted.quizAnalytics.trackQuizStart('cta'), false);
  granted.window.joaoConsentState = { analytics_storage: 'granted', ad_storage: 'denied' };
  granted.window.dispatchTestEvent('joao:consentchange');
  assert.deepEqual(JSON.parse(JSON.stringify(granted.window.dataLayer)), [{
    event: 'quiz_start',
    quiz_name: 'program_fit',
    form_name: 'program_fit_quiz',
    lead_type: 'quiz',
    route_source: 'practice-under-pressure',
    quiz_entry: 'cta',
  }]);

  const denied = quizAnalyticsHarness(undefined);
  denied.quizAnalytics.trackQuizStart('cta');
  denied.window.joaoConsentState = { analytics_storage: 'denied', ad_storage: 'denied' };
  denied.window.dispatchTestEvent('joao:consentchange');
  denied.window.joaoConsentState = { analytics_storage: 'granted', ad_storage: 'granted' };
  denied.window.dispatchTestEvent('joao:consentchange');
  assert.deepEqual(denied.window.dataLayer, []);
});

test('quiz step analytics exclude child count and age bands and dedupe backtracking', () => {
  const context = quizAnalyticsHarness({ analytics_storage: 'granted', ad_storage: 'denied' });
  Object.assign(context.quizAnalytics.answers, {
    audience: 'child',
    child_count: '4+',
    stage: ['little', 'youth'],
    goal: 'confidence',
    experience: 'new',
    location: 'dripping',
  });
  assert.equal(context.quizAnalytics.trackStepComplete(1), true);
  assert.equal(context.quizAnalytics.trackStepComplete(1), false);
  assert.equal(context.quizAnalytics.trackStepComplete(2), true);
  assert.equal(context.quizAnalytics.trackStepComplete(2), false);
  const events = JSON.parse(JSON.stringify(context.window.dataLayer));
  assert.deepEqual(events.map((event) => event.quiz_answer), ['child', 'not_collected']);
  assert.doesNotMatch(JSON.stringify(events), /4\+|little|youth|child_count|age_bands/);
});

test('quiz completion ignores identical retries and labels changed-answer revisions', () => {
  const context = quizAnalyticsHarness({ analytics_storage: 'granted', ad_storage: 'denied' });
  Object.assign(context.quizAnalytics.answers, {
    audience: 'adult', stage: 'new', goal: 'fundamentals', experience: 'group', location: 'dripping',
  });
  assert.equal(context.quizAnalytics.trackQuizComplete('adult_group_bjj'), true);
  assert.equal(context.quizAnalytics.trackQuizComplete('adult_group_bjj'), false);
  context.quizAnalytics.answers.experience = 'private';
  assert.equal(context.quizAnalytics.trackQuizComplete('private_coaching'), true);
  const events = JSON.parse(JSON.stringify(context.window.dataLayer));
  assert.deepEqual(events.map((event) => event.quiz_revision), ['first_completion', 'answers_changed']);
  assert.deepEqual(events.map((event) => event.recommendation), ['adult_group_bjj', 'private_coaching']);
});

test('quiz emits a complete non-PII funnel contract with controlled question enums', () => {
  const js = read('site/assets/program-fit-quiz.js');
  for (const event of [
    'quiz_start',
    'quiz_step_complete',
    'quiz_back',
    'quiz_complete',
    'quiz_result_view',
    'lead_submit_attempt',
    'lead_submit_error',
  ]) {
    assert.match(js, new RegExp(`pushQuizEvent\\('${event}'`), `${event} must use the shared analytics helper`);
  }
  assert.match(js, /const questionKeys = \['audience', 'stage', 'goal', 'experience', 'location', 'contact'\]/);
  assert.match(js, /quiz_question: questionKeys\[stepNumber - 1\]/);
  assert.match(js, /quiz_answer: safeStepAnswer\(stepNumber\)/);
  assert.match(js, /if \(trackedStepCompletions\.has\(stepNumber\)\) return false/);
  assert.match(js, /if \(nextCompletionSignature === completionSignature\) return false/);
  assert.match(js, /trackedStepCompletions\.clear\(\)/);
});

test('teen and family recommendations map to explicit accepted CRM enums', () => {
  const js = read('site/assets/program-fit-quiz.js');
  assert.match(js, /title: 'Teen Interest Path'/);
  assert.match(js, /'Teen Interest Path': 'teen_interest_path'/);
  assert.match(js, /title: 'Family Program Plan'/);
  assert.match(js, /'Family Program Plan': 'family_program_plan'/);
  assert.doesNotMatch(js, /Teen Interest List|teen_interest_list/);
});

test('single-child age selection uses radios, multi-child uses checkboxes, and path preselection is enum-bound', () => {
  const js = read('site/assets/program-fit-quiz.js');
  assert.match(js, /input\.type = multiple \? 'checkbox' : 'radio'/);
  assert.match(js, /input\.required = !multiple/);
  assert.match(js, /requestedPath === 'child' \|\| requestedPath === 'adult' \|\| requestedPath === 'after60'/);
  assert.match(js, /\[name="stage"\]\[value="after60"\]/);
  assert.doesNotMatch(js, /requestedPath === 'help'/);
});

test('Little Champions discloses the current location when Austin is preferred', () => {
  const js = read('site/assets/program-fit-quiz.js');
  assert.match(js, /current published ages 3–7 group is in Dripping Springs, not Austin/);
  assert.match(js, /Review the Dripping Springs schedule before requesting a class/);
});

test('quiz and shared forms require the explicit accepted response contract', () => {
  const quiz = read('site/assets/program-fit-quiz.js');
  const shared = read('site/assets/campaign-site.js');
  for (const source of [quiz, shared]) {
    assert.match(source, /body\.accepted !== true/);
    assert.match(source, /body\.contact_accepted !== true/);
    assert.match(source, /body\.opportunity_accepted !== true/);
    assert.match(source, /body\.request_id !==/);
  }
  assert.match(shared, /fetch\("\/api\/lead\.php"/);
  assert.match(shared, /new AbortController\(\)/);
  assert.match(shared, /35000/);
  assert.match(shared, /data\.request_id = form\.dataset\.requestId/);
  assert.match(shared, /data\.meta = currentMetaContext\(\)/);
  assert.match(shared, /parameters\.meta_event_id = acceptance\.meta_event_id/);
  assert.match(shared, /routeAcceptedLead\("lead_submit_success", parameters\)/);
  assert.match(shared, /sourceEventName \+ "_routed"/);
  assert.match(shared, /window\.gtag\("event", sourceEventName === "lead_submit_success" \? "generate_lead" : sourceEventName/);
  assert.match(shared, /window\.fbq\("track", "Lead",[\s\S]*\{ eventID: parameters\.meta_event_id \}/);
  assert.doesNotMatch(shared, /pushAnalytics\("lead_submit_success", parameters\)/);
  assert.match(shared, /body\.meta_event_id !== "lead_" \+ data\.request_id/);
  assert.match(shared, /data-booking-form data-form-id="booking_popup" data-lead-type="class_inquiry"/);
  assert.doesNotMatch(shared, /fetch\("\/api\/contact\.php"/);
});

test('builder orders consent and attribution before quiz behavior and emits canonicals', () => {
  const builder = read('scripts/build_vercel_site.py');
  const landing = read('site/campaign/program-fit-landing.html');
  const quiz = read('site/campaign/program-fit-quiz.html');
  assert.match(builder, /first_deferred_script/);
  assert.match(builder, /routeEnums/);
  assert.match(builder, /practice-under-pressure/);
  assert.match(landing, /rel="canonical" href="https:\/\/joaocrusbjj\.com\/program-finder\/"/);
  assert.match(quiz, /rel="canonical" href="https:\/\/joaocrusbjj\.com\/program-finder\/quiz\/"/);
});

test('practice-under-pressure opens its primary quiz in a modal and preserves landing-page attribution', () => {
  const page = read('site/campaign/practice-under-pressure.html');
  const helper = read('site/assets/practice-under-pressure.js');
  const modal = read('site/assets/program-fit-modal.js');
  const homepage = read('site/campaign/index.html');
  assert.match(page, /href="program-fit-quiz\.html\?source=practice-under-pressure&amp;embed=1&amp;start=quiz" data-quiz-route data-quiz-modal/);
  assert.match(page, /program-fit-modal\.css/);
  assert.match(page, /program-fit-modal\.js/);
  assert.match(modal, /dialog\.showModal\(\)/);
  assert.match(modal, /frame\.src = trigger\.href/);
  const builder = read('scripts/build_vercel_site.py');
  const quiz = read('site/assets/program-fit-quiz.js');
  assert.match(builder, /embed:\{json\.dumps\(\['1'\]\)\}/);
  assert.match(builder, /start:\{json\.dumps\(\['quiz'\]\)\}/);
  assert.match(quiz, /routeParams\.get\('start'\) === 'quiz'/);
  assert.match(quiz, /startQuiz\('cta'/);
  assert.match(page, /href="\/program-finder\/quiz\/\?source=practice-under-pressure&amp;path=help" data-quiz-route>Find my program/);
  assert.match(helper, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(helper, /if \(!target\.searchParams\.has\(key\)\) target\.searchParams\.set\(key, value\)/);
  assert.match(helper, /target\.searchParams\.set\("utm_source", "website"\)/);
  assert.match(helper, /target\.searchParams\.set\("utm_medium", "landing_page"\)/);
  assert.match(helper, /target\.searchParams\.set\("utm_campaign", "practice_under_pressure"\)/);
  assert.match(homepage, /href="contact\.html">Plan a first class/);
  assert.doesNotMatch(homepage, /data-quiz-route/);
});

test('shared-form consent grants email or call only and excludes automated texts', () => {
  const shared = read('site/assets/campaign-site.js');
  const teen = read('site/teens-campaign-ages-13-17.html');
  const pressure = read('site/campaign/practice-under-pressure.html');
  for (const source of [shared, teen, pressure]) {
    assert.match(source, /may email or call me/);
    assert.match(source, /Automated texts are not enabled from this form/);
    assert.doesNotMatch(source, /may call or text me/);
  }
});

test('built routes rewrite links, preserve canonicals, and order attribution before quiz behavior', () => {
  const landing = read('dist/program-finder/index.html');
  const quiz = read('dist/program-finder/quiz/index.html');
  assert.match(landing, /href="\/program-finder\/quiz\/\?source=landing-hero"/);
  assert.match(quiz, /data-endpoint="\/api\/lead\.php"/);
  assert.match(quiz, /href="\/privacy-policy\/"/);
  assert.match(quiz, /href="\/terms\/"/);
  assert.match(quiz, /content="noindex,nofollow"/);
  assert.match(quiz, /rel="canonical" href="https:\/\/joaocrusbjj\.com\/program-finder\/quiz\/"/);
  const attributionPosition = quiz.indexOf('/assets/attribution.js');
  const quizBehaviorPosition = quiz.indexOf('/assets/program-fit-quiz.js');
  assert.ok(attributionPosition >= 0 && attributionPosition < quizBehaviorPosition);
});
