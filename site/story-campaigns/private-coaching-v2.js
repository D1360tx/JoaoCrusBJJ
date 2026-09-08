(() => {
  "use strict";

  const form = document.querySelector("#private-fit-form");
  if (!form) return;

  const steps = [...form.querySelectorAll("[data-quiz-step]")];
  const result = form.querySelector("[data-quiz-result]");
  const currentStepText = document.querySelector("[data-current-step]");
  const progress = document.querySelector("[data-progress]");
  const quiz = document.querySelector("#coaching-fit-quiz");
  const mobileCta = document.querySelector(".mobile-quiz-cta");
  const answers = {};
  let currentStep = 1;

  const labels = {};
  form.querySelectorAll("[data-answer]").forEach((button) => {
    const label = button.textContent.trim().replace(/^\d+\s*/, "");
    labels[`${button.dataset.answer}:${button.dataset.value}`] = label;
  });

  function showStep(number, options = {}) {
    currentStep = Math.max(1, Math.min(5, number));
    result.hidden = true;
    steps.forEach((step) => {
      const active = Number(step.dataset.quizStep) === currentStep;
      step.hidden = !active;
      step.classList.toggle("is-active", active);
    });
    currentStepText.textContent = String(currentStep);
    progress.style.width = `${currentStep * 20}%`;
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
      button.classList.toggle("is-selected", button.dataset.value === value);
      button.setAttribute("aria-pressed", String(button.dataset.value === value));
    });
  }

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
    if (data.goal === "competition" || data.friction === "prep") {
      return {
        name: "COMPETITION FOCUS SESSION",
        copy: "A focused starting session to identify the positions and decisions that matter most for your upcoming competition goal."
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
        name: "FLEXIBLE GAME PLAN SESSION",
        copy: "A focused assessment designed to give limited training time a clear priority you can carry into every available session."
      };
    }
    if (data.format === "series" || data.goal === "specific-position") {
      return {
        name: "POSITION FOCUS SERIES",
        copy: "A short, concentrated path around one recurring position, the decisions inside it, and the connections you need next."
      };
    }
    if (data.format === "ongoing") {
      return {
        name: "ONGOING GAME DEVELOPMENT",
        copy: "A longer 1-on-1 coaching path for organizing your game, testing it under resistance, and adjusting it as you progress."
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

    const summary = ["goal", "experience", "friction", "format"]
      .map((key) => labels[`${key}:${answers[key]}`])
      .filter(Boolean)
      .join(" · ");
    form.querySelector("[data-result-summary]").textContent = summary;

    steps.forEach((step) => {
      step.hidden = true;
      step.classList.remove("is-active");
    });
    result.hidden = false;
    currentStepText.textContent = "5";
    progress.style.width = "100%";
    window.setTimeout(() => form.querySelector("[data-result-name]")?.focus({ preventScroll: true }), 80);
  });

  form.querySelector("[data-restart]")?.addEventListener("click", () => {
    form.reset();
    Object.keys(answers).forEach((key) => delete answers[key]);
    form.querySelectorAll("[data-answer]").forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    showStep(1);
  });

  document.querySelectorAll("[data-scroll-quiz]").forEach((button) => {
    button.addEventListener("click", () => {
      quiz.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => form.querySelector(".quiz-step:not([hidden]) h2")?.focus({ preventScroll: true }), 450);
    });
  });

  const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
  const params = new URLSearchParams(window.location.search);
  attributionKeys.forEach((key) => {
    const field = form.elements.namedItem(key);
    if (field) field.value = params.get(key) || "";
  });

  if ("IntersectionObserver" in window && mobileCta) {
    const observer = new IntersectionObserver(([entry]) => {
      mobileCta.classList.toggle("is-hidden", entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(quiz);
  }

  showStep(1, { focus: false });
})();
