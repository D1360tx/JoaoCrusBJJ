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
  let currentStep = 1;
  const answers = {};

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
          ['3–4', 'little-3-4', 'Little Champions · Ages 3–7', 'age'],
          ['5–7', 'little-5-7', 'Little Champions · Ages 3–7', 'age'],
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

  function optionMarkup(name, option, index) {
    const [label, value, description, iconName] = option;
    return `<label class="fit-option">
      <input type="radio" name="${name}" value="${value}" required>
      <span class="fit-option__icon" aria-hidden="true">${icon(iconName)}</span>
      <span><strong>${label}</strong><small>${description}</small></span>
      <span class="fit-option__check" aria-hidden="true">✓</span>
    </label>`;
  }

  function populateBranch() {
    const audience = form.elements.audience.value;
    const config = configurations[audience];
    ['stage', 'goal', 'experience', 'location'].forEach((key) => {
      const container = root.querySelector(`[data-dynamic-options="${key}"]`);
      const data = config[key];
      if (key !== 'location') {
        const step = container.closest('.fit-step');
        step.querySelector('[data-question-heading]').textContent = data.heading;
        const help = step.querySelector('[data-question-help]');
        if (help && data.help) help.textContent = data.help;
      }
      container.innerHTML = data.options.map((option, index) => optionMarkup(key, option, index)).join('');
    });
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
    return required.every((input) => {
      if (input.type === 'radio') return Boolean(step.querySelector(`[name="${input.name}"]:checked`));
      if (input.type === 'checkbox') return input.checked;
      return input.checkValidity();
    });
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
    ['audience', 'stage', 'goal', 'experience', 'location'].forEach((key) => {
      if (data.get(key)) answers[key] = data.get(key);
    });
  }

  function calculateResult() {
    if (answers.audience === 'child') {
      const stage = answers.stage;
      if (stage.startsWith('little-')) return {
        title: 'Little Champions',
        summary: 'Based on your child’s age, experience, and goals, the ages 3–7 program is the most appropriate factual starting point.',
        reasons: ['Short, age-appropriate activities', 'Clear instructions and active coaching', 'Practice with movement, listening, and safe boundaries'],
        link: 'little-champions.html',
        linkText: 'View Little Champions',
        image: '../assets/toddler-purposeful-play-hero.webp',
        next: 'Review the class and current schedule',
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

  root.querySelector('[data-start]').addEventListener('click', () => {
    showScreen('quiz');
    showStep(1);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'quiz_start', quiz_name: 'program_fit_preview' });
  });

  form.addEventListener('input', syncControls);
  form.addEventListener('change', (event) => {
    if (event.target.name === 'audience') populateBranch();
    syncControls();
  });

  nextButton.addEventListener('click', () => {
    if (!stepIsValid()) {
      error.textContent = 'Choose an answer to continue.';
      return;
    }
    recordStep();
    showStep(currentStep + 1);
  });

  backButton.addEventListener('click', () => showStep(currentStep - 1, 'back'));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!stepIsValid()) {
      error.textContent = 'Complete the required fields to see the recommendation.';
      return;
    }
    recordStep();
    const result = calculateResult();
    renderResult(result);
    showScreen('matching');
    window.setTimeout(() => showScreen('result'), 1050);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: endpoint ? 'lead_submit_attempt' : 'quiz_preview_complete', quiz_name: 'program_fit_preview', recommendation: result.title });
  });

  root.querySelector('[data-restart]').addEventListener('click', () => {
    form.reset();
    Object.keys(answers).forEach((key) => delete answers[key]);
    root.querySelectorAll('[data-dynamic-options]').forEach((container) => { container.innerHTML = ''; });
    showScreen('intro');
    currentStep = 1;
    syncControls();
  });

  syncControls();
})();
