(() => {
  "use strict";

  const dialog = document.querySelector("#coaching-fit-quiz");
  const form = document.querySelector("#private-fit-form");
  if (!dialog || !form) return;

  const steps = [...form.querySelectorAll("[data-quiz-step]")];
  const matching = form.querySelector("[data-quiz-matching]");
  const result = form.querySelector("[data-quiz-result]");
  const stepLabel = dialog.querySelector("[data-step-label]");
  const progressBar = dialog.querySelector(".quiz-progress");
  const progress = dialog.querySelector("[data-progress]");
  const mobileCta = document.querySelector(".mobile-quiz-cta");
  const heroCta = document.querySelector(".hero [data-open-quiz]");
  const availabilityButton = form.querySelector("[data-request-availability]");
  const availabilityPreview = form.querySelector("[data-availability-preview]");
  const answers = {};
  let currentStep = 0;
  let lastOpener = null;
  let matchingTimer = null;

  const labels = {};
  form.querySelectorAll("[data-answer]").forEach((button) => {
    const label = button.textContent.trim().replace(/^\d+\s*/, "");
    labels[`${button.dataset.answer}:${button.dataset.value}`] = label;
    button.setAttribute("aria-pressed", "false");
  });

  function track(eventName, details = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...details, qa_preview: true });
  }

  function updateProgress(percent, label) {
    progress.style.width = `${percent}%`;
    progressBar.setAttribute("aria-valuenow", String(percent));
    stepLabel.textContent = label;
  }

  function focusActiveHeading() {
    const heading = form.querySelector(".quiz-step:not([hidden]) h2");
    window.setTimeout(() => heading?.focus({ preventScroll: true }), 90);
  }

  function hideFlowViews() {
    steps.forEach((step) => {
      step.hidden = true;
      step.classList.remove("is-active");
    });
    matching.hidden = true;
    matching.classList.remove("is-active");
    result.hidden = true;
    result.classList.remove("is-active");
  }

  function showStep(number, options = {}) {
    window.clearTimeout(matchingTimer);
    currentStep = Math.max(1, Math.min(5, number));
    hideFlowViews();
    const activeStep = steps.find((step) => Number(step.dataset.quizStep) === currentStep);
    activeStep.hidden = false;
    activeStep.classList.add("is-active");
    const percentages = { 1: 20, 2: 40, 3: 60, 4: 75, 5: 90 };
    const label = currentStep < 5 ? `QUESTION ${currentStep} OF 4` : "YOUR PATH";
    updateProgress(percentages[currentStep], label);
    if (options.focus !== false) focusActiveHeading();
    if (currentStep === 5) track("contact_step_view", { quiz_version: "private_game_plan_v4_1" });
  }

  function showMatching() {
    window.clearTimeout(matchingTimer);
    hideFlowViews();
    matching.hidden = false;
    matching.classList.add("is-active");
    updateProgress(84, "BUILDING YOUR PATH");
    track("path_build_view", { quiz_version: "private_game_plan_v4_1" });
    focusActiveHeading();
    matchingTimer = window.setTimeout(() => showStep(5), 1350);
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

  function openQuiz(event) {
    lastOpener = event?.currentTarget || document.activeElement;
    const firstOpen = currentStep === 0;
    if (firstOpen) showStep(1, { focus: false });
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    document.body.classList.add("quiz-open");
    mobileCta?.classList.add("is-hidden");
    track("quiz_view", { quiz_version: "private_game_plan_v4_1" });
    if (firstOpen) track("quiz_start", { quiz_version: "private_game_plan_v4_1", entry: "direct_to_question" });
    focusActiveHeading();
  }

  function resetMatchingIfClosed() {
    if (!matching.hidden) {
      window.clearTimeout(matchingTimer);
      showStep(4, { focus: false });
    }
  }

  function closeQuiz() {
    resetMatchingIfClosed();
    if (dialog.open && typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("quiz-open");
    updateMobileCta();
    window.setTimeout(() => lastOpener?.focus?.({ preventScroll: true }), 60);
  }

  document.querySelectorAll("[data-open-quiz]").forEach((button) => button.addEventListener("click", openQuiz));
  dialog.querySelectorAll("[data-close-quiz]").forEach((button) => button.addEventListener("click", closeQuiz));
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeQuiz();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeQuiz();
  });
  dialog.addEventListener("close", () => {
    resetMatchingIfClosed();
    document.body.classList.remove("quiz-open");
    updateMobileCta();
  });

  form.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      writeAnswer(button.dataset.answer, button.dataset.value);
      track("quiz_step_complete", {
        quiz_version: "private_game_plan_v4_1",
        step_number: currentStep,
        answer_category: button.dataset.value
      });
      window.setTimeout(() => {
        if (currentStep === 4) showMatching();
        else showStep(currentStep + 1);
      }, 120);
    });
  });

  form.querySelectorAll("[data-back]").forEach((button) => {
    if (button.hasAttribute("data-close-quiz")) return;
    button.addEventListener("click", () => {
      track("quiz_back", { quiz_version: "private_game_plan_v4_1", from_step: currentStep });
      showStep(Math.max(1, currentStep - 1));
    });
  });

  function recommendationFor(data) {
    if (data.goal === "competition" || data.friction === "prep" || data.timing === "deadline") {
      return {
        name: "COMPETITION FOCUS SESSION",
        displayLines: ["YOUR COMPETITION", "FOCUS SESSION"],
        copy: "A focused starting session to identify the positions and decisions that matter most for your upcoming competition or deadline."
      };
    }
    if (data.goal === "return" || data.experience === "returning") {
      return {
        name: "RETURN-TO-TRAINING ASSESSMENT",
        displayLines: ["RETURN TO TRAINING", "ASSESSMENT PATH"],
        copy: "A focused re-entry session to identify what still feels familiar, what needs rebuilding, and where to place your attention first."
      };
    }
    if (data.friction === "schedule") {
      return {
        name: "LIMITED-TIME GAME PLAN",
        displayLines: ["LIMITED TIME", "GAME PLAN"],
        copy: "A focused assessment designed to give limited mat time one clear priority you can carry into every available session."
      };
    }
    if (data.goal === "specific-position" || data.friction === "connection" || data.friction === "mistakes") {
      return {
        name: "POSITION FOCUS PATH",
        displayLines: ["POSITION FOCUS", "COACHING PATH"],
        copy: "A concentrated path around one recurring position, the decisions inside it, and the live-training connections you need next."
      };
    }
    return {
      name: "PRIVATE GAME ASSESSMENT",
      displayLines: ["PRIVATE GAME", "ASSESSMENT PATH"],
      copy: "A focused first session to identify the highest-value problem, coach the correction, and map what to work on next."
    };
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    track("lead_submit_attempt", { quiz_version: "private_game_plan_v4_1" });
    if (!form.reportValidity()) {
      track("quiz_error", { quiz_version: "private_game_plan_v4_1", error_type: "validation" });
      return;
    }

    const recommendation = recommendationFor(answers);
    const resultName = form.querySelector("[data-result-name]");
    resultName.replaceChildren(...recommendation.displayLines.map((line) => {
      const span = document.createElement("span");
      span.className = "heading-line";
      span.textContent = line;
      return span;
    }));
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

    hideFlowViews();
    result.hidden = false;
    result.classList.add("is-active");
    updateProgress(100, "YOUR MATCH");
    track("result_view", { quiz_version: "private_game_plan_v4_1", recommendation_class: recommendation.name });
    focusActiveHeading();
  });

  availabilityButton?.addEventListener("click", () => {
    availabilityButton.hidden = true;
    availabilityPreview.hidden = false;
    track("availability_request_preview", {
      quiz_version: "private_game_plan_v4_1",
      recommendation_class: form.elements.namedItem("recommendation").value
    });
    availabilityPreview.focus?.({ preventScroll: true });
  });

  form.querySelector("[data-restart]")?.addEventListener("click", () => {
    form.reset();
    Object.keys(answers).forEach((key) => delete answers[key]);
    form.querySelectorAll("[data-answer]").forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    availabilityButton.hidden = false;
    availabilityPreview.hidden = true;
    currentStep = 1;
    showStep(1);
    track("quiz_restart", { quiz_version: "private_game_plan_v4_1" });
  });

  const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
  const params = new URLSearchParams(window.location.search);
  attributionKeys.forEach((key) => {
    const field = form.elements.namedItem(key);
    if (field) field.value = params.get(key) || "";
  });

  const visibility = { hero: true };
  function updateMobileCta() {
    if (!mobileCta) return;
    mobileCta.classList.toggle("is-hidden", visibility.hero || dialog.open);
  }

  if ("IntersectionObserver" in window && mobileCta && heroCta) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === heroCta) visibility.hero = entry.isIntersecting;
      });
      updateMobileCta();
    }, { threshold: 0.1 });
    observer.observe(heroCta);
  }

  hideFlowViews();
  updateProgress(20, "QUESTION 1 OF 4");
  updateMobileCta();
})();
