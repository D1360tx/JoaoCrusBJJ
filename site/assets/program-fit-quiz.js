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
  const allowedRouteSources = ['landing-header', 'landing-hero', 'landing-method', 'landing-programs', 'landing-final', 'landing-mobile', 'practice-under-pressure', 'meta-kids-paid', 'after60-page'];
  const requestedRouteSource = routeParams.get('source');
  const routeSource = allowedRouteSources.includes(requestedRouteSource) ? requestedRouteSource : '';
  let currentStep = 1;
  let requestId = '';
  let completionSignature = '';
  let quizStartTracked = false;
  let quizStartPending = false;
  const answers = {};
  const trackedStepCompletions = new Set();
  const questionKeys = ['audience', 'stage', 'goal', 'experience', 'location', 'contact'];
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

  const routedMetaEventIds = new Set();

  function routeMetaLead(metaEventId, clean) {
    if (!/^lead_[A-Za-z0-9][A-Za-z0-9._:-]{15,79}$/.test(metaEventId || '') || routedMetaEventIds.has(metaEventId)) return false;
    routedMetaEventIds.add(metaEventId);
    let attempts = 0;
    function sendWhenReady() {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_name: clean.form_name,
          content_category: clean.lead_type
        }, { eventID: metaEventId });
        return;
      }
      attempts += 1;
      if (attempts < 20) window.setTimeout(sendWhenReady, 100);
    }
    sendWhenReady();
    return true;
  }

  function routeAcceptedLead(parameters = {}) {
    const consent = window.joaoConsentState || {};
    const analyticsGranted = consent.analytics_storage === 'granted';
    const advertisingGranted = consent.ad_storage === 'granted' && consent.ad_user_data === 'granted';
    const clean = {
      form_name: 'program_fit_quiz',
      lead_type: 'quiz',
      recommendation: parameters.recommendation,
      lead_program: parameters.lead_program,
      lead_location: parameters.lead_location
    };

    if (analyticsGranted || advertisingGranted) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'lead_submit_success_routed',
        quiz_name: quizName,
        ...clean,
        meta_event_id: parameters.meta_event_id
      });
    }

    if (analyticsGranted) {
      const ga4Command = typeof window.gtag === 'function'
        ? window.gtag
        : function () { window.dataLayer.push(arguments); };
      ga4Command('event', 'generate_lead', {
        send_to: 'G-EW2F2YKR3Y',
        form_name: clean.form_name,
        lead_type: clean.lead_type,
        program: clean.lead_program,
        location: clean.lead_location
      });
    }

    if (advertisingGranted) routeMetaLead(parameters.meta_event_id, clean);
    return analyticsGranted || advertisingGranted;
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
    child: {
      stage: {
        heading: 'How old is your child?',
        help: 'Age determines the appropriate program before any preference scoring.',
        options: [
          ['3–7', 'little', 'Little Champions · Ages 3–7', 'age'],
          ['8–12', 'youth', 'Youth · Ages 8–12', 'age'],
          ['13–17', 'teen', 'Teens · Ages 13–17', 'age']
        ]
      },
      goal: {
        heading: 'What would you most like help with?',
        options: [
          ['Listening and following directions', 'listening', 'Practice one clear cue at a time', 'focus'],
          ['Confidence in new situations', 'confidence', 'Build confidence through real attempts', 'confidence'],
          ['Safe boundaries and body control', 'boundaries', 'Practice stopping, tapping, and shared space', 'shield'],
          ['A positive physical activity', 'activity', 'Movement with a clear purpose', 'movement']
        ]
      },
      experience: {
        heading: 'Which description sounds closest?',
        options: [
          ['Completely new', 'new', 'A first-ever sport or first time on the mat is normal', 'new'],
          ['Tried martial arts before', 'tried', 'Some familiarity, with a fresh starting point', 'training'],
          ['Currently training', 'current', 'Match the next step to current experience', 'training'],
          ['Returning after a break', 'returning', 'Re-enter at an appropriate pace', 'return']
        ]
      },
      location: {
        options: [
          ['Dripping Springs', 'dripping', 'Group programs for Little Champions, Youth, and current adult classes', 'pin'],
          ['Austin', 'austin', 'Current Youth ages 8–12 group class or adult private coaching', 'pin'],
          ['Help me decide', 'help', 'Let the program and format guide the location', 'focus']
        ]
      }
    },
    adult: {
      stage: {
        heading: 'Which describes your starting stage?',
        help: 'This shapes whether group training or private coaching is the stronger first step.',
        options: [
          ['I am looking for the After 60 program', 'after60', 'A steady-paced, beginner-friendly group in Dripping Springs', 'confidence'],
          ['Completely new', 'new', 'I want a clear introduction', 'new'],
          ['Returning after time away', 'returning', 'I want to rebuild with direction', 'return'],
          ['Currently training', 'current', 'I want to improve a specific area', 'training'],
          ['Preparing for competition', 'competition', 'I need focused preparation', 'focus']
        ]
      },
      goal: {
        heading: 'What is your main goal?',
        options: [
          ['Learn the fundamentals', 'fundamentals', 'Build a connected starting framework', 'training'],
          ['Improve a specific part of my game', 'specific', 'Get direct correction on a recurring problem', 'focus'],
          ['Train around a difficult schedule', 'schedule', 'Use flexible private instruction', 'private'],
          ['Return to consistent training', 'consistent', 'Find a sustainable re-entry point', 'return']
        ]
      },
      experience: {
        heading: 'Which format sounds most useful?',
        options: [
          ['Adult group classes', 'group', 'Dripping Springs group schedule', 'training'],
          ['Private coaching', 'private', 'One-on-one, by appointment', 'private'],
          ['Group plus private support', 'hybrid', 'Use focused sessions to support group training', 'focus'],
          ['Help me choose', 'help', 'Use my answers to recommend a path', 'confidence']
        ]
      },
      location: {
        options: [
          ['Dripping Springs', 'dripping', 'Current adult group classes and private coaching', 'pin'],
          ['Austin', 'austin', 'Adult private coaching by appointment', 'pin'],
          ['Either works', 'either', 'Recommend the strongest format first', 'focus']
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
    const childCount = root.querySelector('[data-child-count]');
    childCount.hidden = audience !== 'child';
    root.querySelectorAll('[name="child_count"]').forEach((input) => { input.required = audience === 'child'; });
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
    if (answers.audience === 'child') {
      const stages = Array.isArray(answers.stage) ? answers.stage : [answers.stage];
      if (answers.child_count !== '1') {
        const names = [...new Set(stages.map((stage) => ({ little: 'Little Champions', youth: 'Youth BJJ', teen: 'Teen Interest Path' })[stage]))];
        return {
          title: 'Family Program Plan',
          summary: `For ${answers.child_count === '4+' ? 'your children' : `${answers.child_count} children`}, the age-appropriate starting paths are ${names.join(', ')}.`,
          reasons: ['Each child is matched by the program’s published age range', 'One family inquiry can cover every child', 'Location and schedule can be confirmed together'],
          link: 'programs.html', linkText: 'View all kids programs', image: '../assets/campaign-images/home-academy-group-2026-07.webp',
          next: 'Review the matched programs together', location: 'Dripping Springs + Austin availability varies by age'
        };
      }
      const stage = stages[0];
      if (stage === 'little') return {
        title: 'Little Champions',
        summary: answers.location === 'austin'
          ? 'Little Champions is the age-appropriate program. The current published ages 3–7 group is in Dripping Springs, not Austin.'
          : 'Based on your child’s age, experience, and goals, the ages 3–7 program is the most appropriate factual starting point.',
        reasons: answers.location === 'austin'
          ? ['Short, age-appropriate activities', 'The current group location is Dripping Springs', 'Staff can discuss whether that location works for your family']
          : ['Short, age-appropriate activities', 'Clear instructions and active coaching', 'Practice with movement, listening, and safe boundaries'],
        link: 'little-champions.html',
        linkText: 'View Little Champions',
        image: '../assets/toddler-purposeful-play-hero.webp',
        next: answers.location === 'austin' ? 'Review the Dripping Springs schedule before requesting a class' : 'Review the class and current schedule',
        location: 'Dripping Springs · Mon/Wed 5:00–5:45 p.m.'
      };
      if (stage === 'youth') return {
        title: 'Youth BJJ',
        summary: 'The ages 8–12 Youth program matches your child’s age and offers a clear next step for beginner or continuing training.',
        reasons: ['Age-specific group instruction', 'Current classes in Dripping Springs and Austin', 'A structured path for new or current students'],
        link: 'youth.html', linkText: 'View Youth BJJ', image: '../assets/youth-junior-warriors-group.webp',
        next: 'Compare the two current locations', location: answers.location === 'austin' ? 'Austin · Tue/Thu 5:00–5:45 p.m.' : 'Dripping Springs · Mon/Wed 5:50–6:35 p.m.'
      };
      return {
        title: 'Teen Interest Path',
        summary: 'The teen program is the age-appropriate route. Current scheduling should be confirmed before a first-class plan is offered.',
        reasons: ['Age-matched instruction', 'A clear interest path while schedule details are confirmed', 'Direct follow-up instead of an invented class time'],
        link: '../teens-campaign-ages-13-17.html', linkText: 'View the Teen program', image: '../assets/teen-cohort-hero.webp',
        next: 'Review the program and join the interest path', location: 'Schedule confirmation required'
      };
    }

    if (answers.stage === 'after60') return {
      title: 'Jiu-Jitsu After 60',
      summary: 'You selected the distinct After 60 program, a beginner-friendly Dripping Springs class with a steady pace and practical technique.',
      reasons: ['A class specifically for students after 60', 'Two current weekday sessions', 'Technique and confidence developed at a steady pace'],
      link: 'jiu-jitsu-after-60.html', linkText: 'View Jiu-Jitsu After 60', image: '../assets/campaign-images/adults-black-belt-group-2026-07.webp',
      next: 'Review the After 60 class and schedule', location: 'Dripping Springs · Tue/Thu 11:20 a.m.–12:10 p.m.'
    };

    const wantsPrivate = ['private', 'hybrid'].includes(answers.experience) || answers.goal === 'specific' || answers.goal === 'schedule' || answers.location === 'austin' || answers.stage === 'competition';
    if (wantsPrivate) return {
      title: 'Private Coaching',
      summary: 'Your goals, schedule, or preferred format suggest that direct coaching may be the strongest first step.',
      reasons: ['Focused correction around your current goal', 'Instruction shaped around experience and schedule', 'Austin or Dripping Springs by appointment'],
      link: 'private-coaching.html', linkText: 'View private coaching', image: '../assets/campaign-images/joao-crus.webp',
      next: 'Request a private coaching assessment', location: answers.location === 'austin' ? 'Austin · By appointment' : 'Dripping Springs or Austin · By appointment'
    };
    return {
      title: 'Adult Group BJJ',
      summary: 'Your answers point toward the current Dripping Springs adult group as the clearest starting path.',
      reasons: ['Beginner-friendly group instruction', 'A current recurring weekly schedule', 'Private coaching can be added later if a focused need appears'],
      link: 'adults.html', linkText: 'View Adult BJJ', image: '../assets/campaign-images/adults-joao-coaching-hero-2026-07.webp',
      next: 'Review the current adult class schedule', location: 'Dripping Springs · Mon/Wed 6:40 p.m. + Sat 11:00 a.m.'
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
      preferred_location: answers.location || '',
      recommended_program: recommendationKey(result),
      email_consent: data.get('email_consent') === 'on',
      sms_consent: data.get('sms_consent') === 'on',
      consent_disclosure_version: 'program_fit_sms_v2',
      page: `${window.location.origin}${window.location.pathname}`,
      attribution: {
        first: attribution.first_touch || {},
        latest: attribution.last_touch || {}
      },
      meta: window.JoaoAttribution && typeof window.JoaoAttribution.metaContext === 'function'
        ? window.JoaoAttribution.metaContext(window, attribution)
        : { ad_storage: 'denied', ad_user_data: 'denied' },
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
      if (!response.ok || body.accepted !== true || body.contact_accepted !== true || body.opportunity_accepted !== true || body.request_id !== payload.request_id || body.meta_event_id !== `lead_${payload.request_id}`) {
        throw new Error('Lead delivery was not accepted.');
      }
      return body;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function startQuiz(entry) {
    showScreen('quiz');
    showStep(1);
    trackQuizStart(entry);
  }

  root.querySelector('[data-start]').addEventListener('click', () => startQuiz('intro'));

  form.addEventListener('input', syncControls);
  form.addEventListener('change', (event) => {
    if (event.target.name === 'audience') populateBranch();
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
    if (!stepIsValid()) {
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
      const payload = leadPayload(result);
      const acceptance = await submitLead(payload);
      showScreen('result');
      routeAcceptedLead({
        recommendation,
        lead_program: recommendation,
        lead_location: answers.location,
        meta_event_id: acceptance.meta_event_id
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
  if (routeParams.get('start') === 'quiz') startQuiz('cta');
  else syncControls();
})();
