(() => {
  const root = document.querySelector('[data-quiz]');
  if (!root) return;

  const screens = Object.fromEntries([...root.querySelectorAll('[data-screen]')].map((el) => [el.dataset.screen, el]));
  const form = root.querySelector('[data-fit-form]');
  const steps = [...root.querySelectorAll('[data-step]')];
  const railSteps = [...root.querySelectorAll('[data-rail-steps] li')];
  const progress = root.querySelector('[data-progress]');
  const progressBar = root.querySelector('[data-progress-bar]');
  const progressLabel = root.querySelector('[data-progress-label]');
  const progressPercent = root.querySelector('[data-progress-percent]');
  const backButton = root.querySelector('[data-back]');
  const nextButton = root.querySelector('[data-next]');
  const submitButton = root.querySelector('[data-submit]');
  const error = root.querySelector('[data-error]');
  const endpoint = root.dataset.endpoint || '';
  const routeParams = new URLSearchParams(window.location.search);
  if (routeParams.get('embed') === '1') document.body.classList.add('fit-embed');
  const allowedRouteSources = ['meta-austin-youth-paid', 'meta-austin-adults-paid', 'austin-program-fit'];
  const requestedRouteSource = routeParams.get('source');
  const routeSource = allowedRouteSources.includes(requestedRouteSource) ? requestedRouteSource : 'austin-program-fit';
  let currentStep = 1;
  let requestId = '';
  let completionSignature = '';
  let quizStartTracked = false;
  let quizStartPending = false;
  const answers = { location: 'austin' };
  const trackedStepCompletions = new Set();
  const questionKeys = ['audience', 'stage', 'goal', 'experience', 'schedule_confirmation', 'contact'];
  const quizName = endpoint ? 'program_fit' : 'program_fit_preview';

  function pushQuizEvent(eventName, parameters = {}) {
    if (!window.joaoConsentState ||
        (window.joaoConsentState.analytics_storage !== 'granted' &&
         window.joaoConsentState.ad_storage !== 'granted')) {
      return false;
    }
    const payload = {
      event: eventName,
      quiz_name: quizName,
      form_name: 'program_fit_quiz',
      lead_type: 'quiz',
      route_source: routeSource,
      ...parameters
    };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === '' || payload[key] === undefined || payload[key] === null) delete payload[key];
    });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    return true;
  }

  function safeStepAnswer(stepNumber) {
    if (stepNumber === 1) return answers.audience;
    if (stepNumber === 2) return 'not_collected';
    if (stepNumber === 3) return answers.goal;
    if (stepNumber === 4) return answers.experience;
    if (stepNumber === 5) return answers.location;
    if (stepNumber === 6) return 'completed';
    return '';
  }

  function trackStepComplete(stepNumber) {
    if (trackedStepCompletions.has(stepNumber)) return false;
    const tracked = pushQuizEvent('quiz_step_complete', {
      quiz_step: stepNumber,
      quiz_question: questionKeys[stepNumber - 1],
      quiz_answer: safeStepAnswer(stepNumber)
    });
    if (tracked) trackedStepCompletions.add(stepNumber);
    return tracked;
  }

  function currentCompletionSignature(recommendation) {
    return JSON.stringify([
      answers.audience || '',
      answers.child_count || '',
      Array.isArray(answers.stage) ? answers.stage.slice().sort() : (answers.stage || ''),
      answers.goal || '',
      answers.experience || '',
      answers.location || '',
      recommendation
    ]);
  }

  function trackQuizComplete(recommendation) {
    const nextCompletionSignature = currentCompletionSignature(recommendation);
    if (nextCompletionSignature === completionSignature) return false;
    const tracked = pushQuizEvent('quiz_complete', {
      recommendation,
      quiz_revision: completionSignature ? 'answers_changed' : 'first_completion'
    });
    if (tracked) completionSignature = nextCompletionSignature;
    return tracked;
  }

  function trackQuizStart(entry) {
    if (quizStartTracked || quizStartPending) return false;
    const state = window.joaoConsentState || {};
    const measurementGranted = state.analytics_storage === 'granted' || state.ad_storage === 'granted';
    if (measurementGranted) {
      quizStartTracked = pushQuizEvent('quiz_start', { quiz_entry: entry });
      return quizStartTracked;
    }
    const regionResolved = window.joaoConsentRegion && window.joaoConsentRegion.policy !== 'unknown';
    if (regionResolved || !window.joaoRegionReady) return false;
    quizStartPending = true;
    window.addEventListener('joao:consentchange', () => {
      quizStartPending = false;
      quizStartTracked = pushQuizEvent('quiz_start', { quiz_entry: entry });
    }, { once: true });
    return false;
  }

  const icon = (type) => {
    const icons = {
      age: '<svg viewBox="0 0 48 48"><circle cx="24" cy="15" r="8"/><path d="M11 41c1-11 6-17 13-17s12 6 13 17"/></svg>',
      focus: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="8"/><path d="M24 4v7m0 26v7M4 24h7m26 0h7"/></svg>',
      confidence: '<svg viewBox="0 0 48 48"><path d="M24 5l6 9 11 3-7 8 1 12-11-5-11 5 1-12-7-8 11-3z"/></svg>',
      movement: '<svg viewBox="0 0 48 48"><circle cx="30" cy="9" r="5"/><path d="M26 16l-8 9 8 6 5 12m-8-24 10 7 8-2M18 25l-9 9"/></svg>',
      shield: '<svg viewBox="0 0 48 48"><path d="M24 4l15 6v11c0 10-6 18-15 23C15 39 9 31 9 21V10z"/><path d="M17 24l5 5 10-11"/></svg>',
      new: '<svg viewBox="0 0 48 48"><path d="M10 35l8-20 10 18 6-14 5 16M7 40h34"/><circle cx="18" cy="12" r="3"/></svg>',
      return: '<svg viewBox="0 0 48 48"><path d="M10 17h18a11 11 0 110 22H17"/><path d="M16 9l-8 8 8 8"/></svg>',
      training: '<svg viewBox="0 0 48 48"><path d="M10 32l9-16 10 16 9-16M7 39h34"/><circle cx="19" cy="11" r="4"/><circle cx="38" cy="11" r="4"/></svg>',
      pin: '<svg viewBox="0 0 48 48"><path d="M39 20c0 12-15 24-15 24S9 32 9 20a15 15 0 1130 0z"/><circle cx="24" cy="20" r="5"/></svg>',
      private: '<svg viewBox="0 0 48 48"><circle cx="16" cy="14" r="6"/><circle cx="34" cy="14" r="6"/><path d="M5 41c1-12 5-19 11-19s10 7 11 19m-3 0c1-12 5-19 10-19s9 7 10 19"/></svg>'
    };
    return icons[type] || icons.focus;
  };

  const configurations = {
  "child": {
    "stage": {
      "heading": "Is your child ages 8–12?",
      "help": "Austin Youth is for ages 8–12. Please confirm before continuing.",
      "options": [
        [
          "Yes, ages 8–12",
          "youth",
          "Austin Youth BJJ",
          "age"
        ],
        [
          "Outside ages 8–12",
          "outside",
          "This Austin Youth class is not the right age band",
          "shield"
        ]
      ]
    },
    "goal": {
      "heading": "What would you most like help with?",
      "options": [
        [
          "Safe boundaries and body control",
          "boundaries",
          "Tap means stop. Practice respecting a partner.",
          "shield"
        ],
        [
          "Confidence in new situations",
          "confidence",
          "Try, reset, and try again",
          "confidence"
        ],
        [
          "Listening and following directions",
          "listening",
          "Practice one clear cue at a time",
          "focus"
        ],
        [
          "A positive physical activity",
          "activity",
          "Purposeful movement",
          "movement"
        ]
      ]
    },
    "experience": {
      "heading": "Has your child trained before?",
      "options": [
        [
          "Completely new",
          "new",
          "No experience required",
          "new"
        ],
        [
          "Tried martial arts before",
          "tried",
          "A fresh starting point",
          "training"
        ],
        [
          "Currently training",
          "current",
          "Build on current experience",
          "training"
        ],
        [
          "Returning after a break",
          "returning",
          "Re-enter at an appropriate pace",
          "return"
        ]
      ]
    },
    "location": {
      "options": [
        [
          "Confirm Austin Youth schedule",
          "austin",
          "Tue/Thu 5:00–5:45 p.m. · Inside Castle Hill Fitness",
          "pin"
        ]
      ]
    }
  },
  "adult": {
    "stage": {
      "heading": "Where are you starting?",
      "help": "New and returning adults are welcome.",
      "options": [
        [
          "Completely new",
          "new",
          "A clear introduction, not a test",
          "new"
        ],
        [
          "Returning after time away",
          "returning",
          "Rebuild with direction",
          "return"
        ],
        [
          "Currently training",
          "current",
          "Refine your technique",
          "training"
        ],
        [
          "Preparing for competition",
          "competition",
          "Discuss focused preparation",
          "focus"
        ]
      ]
    },
    "goal": {
      "heading": "What matters most right now?",
      "options": [
        [
          "Learn the fundamentals",
          "fundamentals",
          "Practice calm technical responses",
          "training"
        ],
        [
          "Improve a specific part of my game",
          "specific",
          "Focused correction",
          "focus"
        ],
        [
          "Train around a difficult schedule",
          "schedule",
          "Flexible private appointments",
          "private"
        ],
        [
          "Return to consistent training",
          "consistent",
          "A sustainable routine",
          "return"
        ]
      ]
    },
    "experience": {
      "heading": "Group classes or private lessons?",
      "options": [
        [
          "Adult group classes",
          "group",
          "Tue/Thu 6:00–7:00 p.m. at Castle Hill Fitness",
          "training"
        ],
        [
          "Private lessons",
          "private",
          "Flexible appointments, arranged with Joao",
          "private"
        ],
        [
          "Group plus private support",
          "hybrid",
          "Discuss both with Joao",
          "focus"
        ],
        [
          "Help me choose",
          "help",
          "Joao can recommend a starting format",
          "confidence"
        ]
      ]
    },
    "location": {
      "options": [
        [
          "Confirm Austin starting point",
          "austin",
          "Group: Tue/Thu 6:00–7:00 p.m. · Private: by appointment",
          "pin"
        ]
      ]
    }
  }
};

  function optionMarkup(name, option, index, type = 'radio') {
    const [label, value, description, iconName] = option;
    return `<label class="fit-option">
      <input type="${type}" name="${name}" value="${value}" ${type === 'radio' ? 'required' : ''}>
      <span class="fit-option__icon" aria-hidden="true">${icon(iconName)}</span>
      <span><strong>${label}</strong><small>${description}</small></span>
      <span class="fit-option__check" aria-hidden="true">✓</span>
    </label>`;
  }

  function populateBranch() {
    const audience = form.elements.audience.value;
    const config = configurations[audience];
    ['stage', 'goal', 'experience', 'location', 'child_count'].forEach((key) => { delete answers[key]; });
    const childCount = root.querySelector('[data-child-count]');
    childCount.hidden = audience !== 'child';
    root.querySelectorAll('[name="child_count"]').forEach((input) => { input.required = audience === 'child'; });
    if (audience !== 'child') {
      root.querySelectorAll('[name="child_count"]').forEach((input) => { input.checked = false; });
    }
    ['stage', 'goal', 'experience', 'location'].forEach((key) => {
      const container = root.querySelector(`[data-dynamic-options="${key}"]`);
      const data = config[key];
      if (key !== 'location') {
        const step = container.closest('.fit-step');
        step.querySelector('[data-question-heading]').textContent = data.heading;
        const help = step.querySelector('[data-question-help]');
        if (help && data.help) help.textContent = data.help;
      }
      const type = audience === 'child' && key === 'stage' && form.elements.child_count.value !== '1' ? 'checkbox' : 'radio';
      container.dataset.requiredGroup = type === 'checkbox' ? 'stage' : '';
      container.innerHTML = data.options.map((option, index) => optionMarkup(key, option, index, type)).join('');
    });
    if (audience === 'child') { form.elements.child_count.value = '1'; }
    syncChildAgeInputs();
  }

  function syncChildAgeInputs() {
    if (form.elements.audience.value !== 'child') return;
    const container = root.querySelector('[data-dynamic-options="stage"]');
    const multiple = Boolean(form.elements.child_count.value) && form.elements.child_count.value !== '1';
    const inputs = [...container.querySelectorAll('input[name="stage"]')];
    if (!multiple) {
      inputs.filter((input) => input.checked).slice(1).forEach((input) => { input.checked = false; });
    }
    inputs.forEach((input) => {
      input.type = multiple ? 'checkbox' : 'radio';
      input.required = !multiple;
    });
    container.dataset.requiredGroup = multiple ? 'stage' : '';
  }

  function syncChildAgeCopy() {
    if (form.elements.audience.value !== 'child') return;
    const count = form.elements.child_count.value;
    const step = root.querySelector('[data-step="2"]');
    step.querySelector('[data-question-heading]').textContent = count && count !== '1'
      ? 'What age groups are your children in?'
      : 'How old is your child?';
    step.querySelector('[data-question-help]').textContent = count && count !== '1'
      ? 'Select every age group represented. Each child will be matched to the published program range.'
      : 'Select the age group that matches your child.';
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, screen]) => {
      screen.hidden = key !== name;
      screen.classList.toggle('is-active', key === name);
    });
    const target = screens[name].querySelector('h1, h2, legend, [data-start]');
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function activeStep() { return steps[currentStep - 1]; }

  function stepIsValid() {
    const step = activeStep();
    const required = [...step.querySelectorAll('[required]')];
    if (currentStep === 2 && form.elements.audience.value === 'child' && form.elements.stage.value !== 'youth') return false;
    const requiredFieldsValid = required.every((input) => {
      if (input.type === 'radio') return Boolean(step.querySelector(`[name="${input.name}"]:checked`));
      if (input.type === 'checkbox') return input.checked;
      return input.checkValidity();
    });
    const requiredGroupsValid = [...step.querySelectorAll('[data-required-group]')]
      .filter((group) => group.dataset.requiredGroup)
      .every((group) => Boolean(group.querySelector('input:checked')));
    return requiredFieldsValid && requiredGroupsValid;
  }

  function syncControls() {
    const valid = stepIsValid();
    if (currentStep === 5) {
      const privateChoice = form.elements.audience.value === 'adult' && ['private','hybrid'].includes(form.elements.experience.value);
      activeStep().querySelector('[data-question-help]').textContent = privateChoice ? 'Private lessons are by appointment. Joao calls to discuss a flexible time.' : form.elements.audience.value === 'child' ? 'Youth ages 8–12: Tue/Thu 5:00–5:45 p.m.' : 'Adult group: Tue/Thu 6:00–7:00 p.m. Private lessons are also available by appointment.';
    }
    nextButton.disabled = !valid;
    submitButton.disabled = !valid;
    backButton.hidden = currentStep === 1;
    nextButton.hidden = currentStep === 6;
    submitButton.hidden = currentStep !== 6;
    progress.value = currentStep;
    progressBar.style.width = `${(currentStep / 6) * 100}%`;
    progressLabel.textContent = `Question ${currentStep} of 6`;
    progressPercent.textContent = `${Math.round((currentStep / 6) * 100)}% complete`;
    railSteps.forEach((item, index) => {
      item.classList.toggle('is-current', index === currentStep - 1);
      item.classList.toggle('is-complete', index < currentStep - 1);
    });
  }

  function showStep(stepNumber, direction = 'forward') {
    currentStep = stepNumber;
    steps.forEach((step, index) => {
      step.hidden = index !== currentStep - 1;
      step.classList.toggle('is-active', index === currentStep - 1);
    });
    error.textContent = '';
    syncControls();
    const legend = activeStep().querySelector('legend');
    legend.setAttribute('tabindex', '-1');
    legend.focus({ preventScroll: true });
    root.dataset.direction = direction;
  }

  function recordStep() {
    const data = new FormData(form);
    ['audience', 'goal', 'experience', 'location', 'child_count'].forEach((key) => {
      if (data.get(key)) answers[key] = data.get(key);
    });
    const stages = data.getAll('stage');
    if (stages.length) answers.stage = answers.audience === 'child' ? stages : stages[0];
  }

  function calculateResult() {
    const child = answers.audience === 'child';
    const wantsPrivate = !child && (['private', 'hybrid'].includes(answers.experience) ||
      (answers.experience === 'help' && (['specific', 'schedule'].includes(answers.goal) || answers.stage === 'competition')));
    return {
      title: child ? 'Youth BJJ' : wantsPrivate ? 'Private Coaching' : 'Adult Group BJJ',
      summary: child ? 'Austin Youth ages 8–12 is your age-matched starting point.' : wantsPrivate ? 'Discuss flexible private lessons with Joao.' : 'The Austin adult group is your starting point. Joao will help confirm fit.',
      reasons: ['Inside Castle Hill Fitness, 1112 N Lamar Blvd, Austin TX 78703', 'Beginner questions are welcome', 'Joao personally calls to recommend a class and schedule a free studio visit'],
      link: child ? '/austin-youth-first-class/' : '/austin-adults-first-class/',
      linkText: 'Review your Austin program',
      image: child ? '../assets/youth-junior-warriors-group.webp' : '../assets/campaign-images/adults-black-belt-group-2026-07.webp',
      next: 'Joao calls to arrange a free studio visit. Observe or participate. Nothing is booked automatically.',
      location: child ? 'Austin · Tue/Thu 5:00–5:45 p.m.' : wantsPrivate ? 'Austin · Private lessons by appointment' : 'Austin · Tue/Thu 6:00–7:00 p.m.'
    };
  }

  function renderResult(result) {
    root.querySelector('[data-result-title]').textContent = result.title;
    root.querySelector('[data-result-summary]').textContent = result.summary;
    root.querySelector('[data-result-reasons]').innerHTML = result.reasons.map((reason) => `<li>${reason}</li>`).join('');
    const link = root.querySelector('[data-result-link]');
    link.href = result.link;
    link.childNodes[0].nodeValue = `${result.linkText} `;
    const image = root.querySelector('[data-result-image]');
    image.src = result.image;
    image.alt = `${result.title} at Joao Crus BJJ`;
    root.querySelector('[data-result-next]').textContent = result.next;
    root.querySelector('[data-result-location]').textContent = result.location;
  }

  function recommendationKey(result) {
    const keys = {
      'Little Champions': 'little_champions',
      'Youth BJJ': 'youth_bjj',
      'Teen Interest Path': 'teen_interest_path',
      'Family Program Plan': 'family_program_plan',
      'Private Coaching': 'private_coaching',
      'Adult Group BJJ': 'adult_group_bjj',
      'Jiu-Jitsu After 60': 'jiu_jitsu_after_60'
    };
    return keys[result.title] || 'staff_review';
  }

  function newRequestId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return `quiz-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function leadPayload(result) {
    const data = new FormData(form);
    const attribution = window.joaoAttribution && typeof window.joaoAttribution === 'object'
      ? window.joaoAttribution
      : { first_touch: {}, last_touch: {} };
    if (!requestId) requestId = newRequestId();
    return {
      schema_version: 'program_fit_v1',
      request_id: requestId,
      form_id: 'program_fit_quiz',
      lead_type: 'quiz',
      route_source: routeSource,
      first_name: String(data.get('first_name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      audience: answers.audience || '',
      child_count: answers.child_count || '',
      age_bands: answers.audience === 'child'
        ? (Array.isArray(answers.stage) ? answers.stage : (answers.stage ? [answers.stage] : []))
        : [],
      stage: answers.audience === 'adult' ? (answers.stage || '') : '',
      goal: answers.goal || '',
      experience: answers.experience || '',
      preferred_location: 'austin',
      recommended_program: recommendationKey(result),
      email_consent: data.get('email_consent') === 'on',
      sms_consent: data.get('sms_consent') === 'on',
      consent_disclosure_version: 'program_fit_sms_v2',
      page: `${window.location.origin}${window.location.pathname}`,
      attribution: {
        first: attribution.first_touch || {},
        latest: attribution.last_touch || {}
      },
      website: String(data.get('website') || '').trim()
    };
  }

  async function submitLead(payload) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 35000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.accepted !== true || body.contact_accepted !== true || body.opportunity_accepted !== true || body.request_id !== payload.request_id) {
        throw new Error('Lead delivery was not accepted.');
      }
      return body;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function startQuiz(entry) {
    showScreen('quiz');
    if (['child', 'adult'].includes(form.elements.audience.value)) { recordStep(); showStep(2); } else showStep(1);
    trackQuizStart(entry);
  }

  root.querySelector('[data-start]').addEventListener('click', () => startQuiz('intro'));

  form.addEventListener('input', syncControls);
  form.addEventListener('change', (event) => {
    if (event.target.name === 'audience') populateBranch();
    if (event.target.name === 'stage') {
      root.querySelector('[data-age-gate]').hidden = !(form.elements.audience.value === 'child' && form.elements.stage.value === 'outside');
    }
    if (event.target.name === 'child_count') {
      syncChildAgeCopy();
      syncChildAgeInputs();
    }
    syncControls();
  });

  nextButton.addEventListener('click', () => {
    if (!stepIsValid()) {
      error.textContent = 'Choose an answer to continue.';
      return;
    }
    recordStep();
    trackStepComplete(currentStep);
    showStep(currentStep + 1);
  });

  backButton.addEventListener('click', () => {
    pushQuizEvent('quiz_back', { quiz_step: currentStep, quiz_destination_step: currentStep - 1 });
    showStep(currentStep - 1, 'back');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (currentStep !== 6 || !stepIsValid() || answers.location !== 'austin' || (answers.audience === 'child' && (answers.child_count !== '1' || answers.stage[0] !== 'youth'))) {
      error.textContent = 'Complete the required fields to see the recommendation.';
      return;
    }
    recordStep();
    trackStepComplete(6);
    const result = calculateResult();
    renderResult(result);
    const recommendation = recommendationKey(result);

    trackQuizComplete(recommendation);

    if (!endpoint) {
      showScreen('matching');
      window.setTimeout(() => {
        showScreen('result');
        pushQuizEvent('quiz_result_view', { recommendation });
      }, 1050);
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    const originalText = submitButton.innerHTML;
    submitButton.textContent = 'Sending securely…';
    showScreen('matching');
    pushQuizEvent('lead_submit_attempt', {
      form_id: 'program_fit_quiz',
      recommendation,
      lead_program: recommendation,
      lead_location: answers.location
    });

    try {
      await submitLead(leadPayload(result));
      showScreen('result');
      pushQuizEvent('lead_submit_success', {
        form_id: 'program_fit_quiz',
        recommendation,
        lead_program: recommendation,
        lead_location: answers.location
      });
      pushQuizEvent('quiz_result_view', { recommendation });
    } catch (submitError) {
      showScreen('quiz');
      showStep(6);
      error.textContent = 'We could not securely send your request. Please try again or call 512-644-4560.';
      pushQuizEvent('lead_submit_error', { form_id: 'program_fit_quiz' });
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.innerHTML = originalText;
    }
  });

  root.querySelector('[data-restart]').addEventListener('click', () => {
    form.reset();
    Object.keys(answers).forEach((key) => delete answers[key]);
    requestId = '';
    completionSignature = '';
    quizStartTracked = false;
    quizStartPending = false;
    trackedStepCompletions.clear();
    root.querySelectorAll('[data-dynamic-options]').forEach((container) => { container.innerHTML = ''; });
    pushQuizEvent('quiz_restart');
    showScreen('intro');
    currentStep = 1;
    syncControls();
  });

  const requestedPath = routeParams.get('path');
  if (requestedPath === 'child' || requestedPath === 'adult' || requestedPath === 'after60') {
    const audienceInput = form.querySelector(`[name="audience"][value="${requestedPath === 'after60' ? 'adult' : requestedPath}"]`);
    if (audienceInput) {
      audienceInput.checked = true;
      populateBranch();
      if (requestedPath === 'after60') {
        const after60Input = form.querySelector('[name="stage"][value="after60"]');
        if (after60Input) after60Input.checked = true;
      }
    }
  }
  startQuiz(routeParams.get('start') === 'quiz' ? 'cta' : 'direct');
})();
