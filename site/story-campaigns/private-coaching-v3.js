(() => {
  "use strict";

  const form = document.querySelector("#private-fit-form");
  if (!form) return;

  const intro = form.querySelector("[data-quiz-intro]");
  const steps = [...form.querySelectorAll("[data-quiz-step]")];
  const result = form.querySelector("[data-quiz-result]");
  const stepLabel = document.querySelector("[data-step-label]");
  const progressBar = document.querySelector(".quiz-progress");
  const progress = document.querySelector("[data-progress]");
  const quiz = document.querySelector("#coaching-fit-quiz");
  const mobileCta = document.querySelector(".mobile-quiz-cta");
  const heroCta = document.querySelector(".hero-copy > [data-scroll-quiz]");
  const answers = {};
  let currentStep = 0;

  const labels = {};
  form.querySelectorAll("[data-answer]").forEach((button) => {
    const label = button.textContent.trim().replace(/^\d+\s*/, "");
    labels[`${button.dataset.answer}:${button.dataset.value}`] = label;
  });

  function updateProgress(percent, label) {
    progress.style.width = `${percent}%`;
    progressBar.setAttribute("aria-valuenow", String(percent));
    stepLabel.textContent = label;
  }

  function showIntro(options = {}) {
    currentStep = 0;
    intro.hidden = false;
    intro.classList.add("is-active");
    result.hidden = true;
    steps.forEach((step) => {
      step.hidden = true;
      step.classList.remove("is-active");
    });
    updateProgress(0, "START");
    if (options.focus !== false) {
      window.setTimeout(() => intro.querySelector("h2")?.focus({ preventScroll: true }), 80);
    }
  }

  function showStep(number, options = {}) {
    currentStep = Math.max(1, Math.min(5, number));
    intro.hidden = true;
    intro.classList.remove("is-active");
    result.hidden = true;
    steps.forEach((step) => {
      const active = Number(step.dataset.quizStep) === currentStep;
      step.hidden = !active;
      step.classList.toggle("is-active", active);
    });
    const label = currentStep < 5 ? `QUESTION ${currentStep} OF 4` : "YOUR FIT";
    updateProgress(currentStep * 20, label);
    if (options.focus !== false) {
      const heading = form.querySelector(`[data-quiz-step="${currentStep}"] h2`);
      window.setTimeout(() => heading?.focus({ preventScroll: true }), 80);
    }
  }

  function writeAnswer(key, value) {
    answers[key] = value;
    const hidden = form.elements.namedItem(key);
    if (hidden) hidden.value = value;
    form.querySelectorAll(`[data-answer="${key}"]`).forEach((button) => {
      const selected = button.dataset.value === value;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  form.querySelector("[data-start]")?.addEventListener("click", () => showStep(1));

  form.querySelectorAll("[data-answer]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      writeAnswer(button.dataset.answer, button.dataset.value);
      window.setTimeout(() => showStep(currentStep + 1), 120);
    });
  });

  form.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => showStep(currentStep - 1));
  });

  function recommendationFor(data) {
    if (data.goal === "competition" || data.friction === "prep" || data.timing === "deadline") {
      return {
        name: "COMPETITION FOCUS SESSION",
        copy: "A focused starting session to identify the positions and decisions that matter most for your upcoming competition or deadline."
      };
    }
    if (data.goal === "return" || data.experience === "returning") {
      return {
        name: "RETURN-TO-TRAINING ASSESSMENT",
        copy: "A focused re-entry session to identify what still feels familiar, what needs rebuilding, and where to place your attention first."
      };
    }
    if (data.friction === "schedule") {
      return {
        name: "LIMITED-TIME GAME PLAN",
        copy: "A focused assessment designed to give limited mat time one clear priority you can carry into every available session."
      };
    }
    if (data.goal === "specific-position" || data.friction === "connection" || data.friction === "mistakes") {
      return {
        name: "POSITION FOCUS PATH",
        copy: "A concentrated path around one recurring position, the decisions inside it, and the live-training connections you need next."
      };
    }
    return {
      name: "PRIVATE GAME ASSESSMENT",
      copy: "A focused first session to identify the highest-value problem, coach the correction, and map what to work on next."
    };
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const recommendation = recommendationFor(answers);
    form.querySelector("[data-result-name]").textContent = recommendation.name;
    form.querySelector("[data-result-copy]").textContent = recommendation.copy;

    const firstName = form.elements.name.value.trim().split(/\s+/)[0];
    form.querySelector("[data-result-greeting]").textContent = firstName
      ? `${firstName}, this is the strongest starting point based on what you shared.`
      : "This is the strongest starting point based on what you shared.";

    const summary = ["goal", "experience", "friction", "timing"]
      .map((key) => labels[`${key}:${answers[key]}`])
      .filter(Boolean)
      .join(" · ");
    form.querySelector("[data-result-summary]").textContent = summary;
    form.elements.namedItem("recommendation").value = recommendation.name;
    form.elements.namedItem("answer_summary").value = summary;

    intro.hidden = true;
    steps.forEach((step) => {
      step.hidden = true;
      step.classList.remove("is-active");
    });
    result.hidden = false;
    updateProgress(100, "YOUR MATCH");
    window.setTimeout(() => form.querySelector("[data-result-name]")?.focus({ preventScroll: true }), 80);
  });

  form.querySelector("[data-restart]")?.addEventListener("click", () => {
    form.reset();
    Object.keys(answers).forEach((key) => delete answers[key]);
    form.querySelectorAll("[data-answer]").forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    showIntro();
  });

  document.querySelectorAll("[data-scroll-quiz]").forEach((button) => {
    button.addEventListener("click", () => {
      quiz.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => quiz.querySelector(".quiz-step:not([hidden]) h2")?.focus({ preventScroll: true }), 450);
    });
  });

  const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
  const params = new URLSearchParams(window.location.search);
  attributionKeys.forEach((key) => {
    const field = form.elements.namedItem(key);
    if (field) field.value = params.get(key) || "";
  });

  if ("IntersectionObserver" in window && mobileCta && heroCta) {
    const visibility = { hero: true, quiz: false };
    const updateMobileCta = () => {
      mobileCta.classList.toggle("is-hidden", visibility.hero || visibility.quiz);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === heroCta) visibility.hero = entry.isIntersecting;
        if (entry.target === quiz) visibility.quiz = entry.isIntersecting;
      });
      updateMobileCta();
    }, { threshold: 0.1 });
    observer.observe(heroCta);
    observer.observe(quiz);
    updateMobileCta();
  }

  showIntro({ focus: false });
})();
