(function () {
  "use strict";

  var TOTAL_STEPS = 8;
  var STORAGE_KEY = "jc-first-class-quiz-v2";
  var app = document.getElementById("quiz-app");
  if (!app) return;

  var form = document.getElementById("match-form");
  var progress = document.getElementById("quiz-progress");
  var progressTrack = document.getElementById("progress-track");
  var progressNative = document.getElementById("progress-native");
  var progressLabel = document.getElementById("progress-label");
  var progressBack = document.getElementById("progress-back");
  var controls = document.getElementById("quiz-controls");
  var continueButton = document.getElementById("continue-button");
  var stepMessage = document.getElementById("step-message");
  var startButton = document.getElementById("start-quiz");
  var restartButton = document.getElementById("restart-quiz");
  var screens = Array.from(app.querySelectorAll("[data-screen]"));

  var state = {
    current: "intro",
    answers: {
      age: "",
      goals: [],
      environment: "",
      contact: "",
      coaching: [],
      experience: "",
      location: ""
    }
  };

  var labels = {
    goals: {
      confidence: "confidence",
      focus: "focus",
      "emotional-control": "emotional control",
      boundaries: "safe boundaries",
      activity: "healthy activity",
      "real-skill": "real Jiu-Jitsu skill"
    },
    location: {
      "dripping-springs": "Dripping Springs",
      austin: "Austin",
      help: "We will help you choose"
    }
  };

  function track(eventName, details) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName, quiz_name: "child_first_class_match" }, details || {}));
  }

  function buildProgress() {
    for (var i = 1; i <= TOTAL_STEPS; i += 1) {
      var segment = document.createElement("span");
      segment.className = "progress-segment";
      segment.setAttribute("aria-hidden", "true");
      progressTrack.appendChild(segment);
    }
  }

  function saveNonPersonalState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: state.answers }));
    } catch (error) {}
  }

  function restoreNonPersonalState() {
    try {
      var saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || !saved.answers) return;
      Object.keys(state.answers).forEach(function (key) {
        if (saved.answers[key] !== undefined) state.answers[key] = saved.answers[key];
      });
      Object.keys(state.answers).forEach(function (name) {
        var value = state.answers[name];
        var values = Array.isArray(value) ? value : [value];
        values.forEach(function (item) {
          if (!item) return;
          var input = form.querySelector('[name="' + name + '"][value="' + CSS.escape(String(item)) + '"]');
          if (input) input.checked = true;
        });
      });
      updateSelectedStyles();
    } catch (error) {}
  }

  function getScreen(value) {
    return screens.find(function (screen) { return screen.dataset.screen === String(value); });
  }

  function updateProgress(step) {
    var segments = Array.from(progressTrack.children);
    progressNative.value = step;
    progressNative.textContent = "Question " + step + " of " + TOTAL_STEPS;
    segments.forEach(function (segment, index) {
      segment.classList.toggle("is-complete", index + 1 < step);
      segment.classList.toggle("is-current", index + 1 === step);
    });
    progressLabel.textContent = step === TOTAL_STEPS ? "Final step" : "Question " + step + " of " + TOTAL_STEPS;
  }

  function showScreen(value, direction) {
    var next = getScreen(value);
    if (!next) return;
    screens.forEach(function (screen) {
      screen.hidden = screen !== next;
      screen.classList.toggle("is-active", screen === next);
    });
    state.current = value;
    stepMessage.textContent = "";

    var isStep = typeof value === "number";
    progress.hidden = !isStep;
    controls.hidden = !isStep;
    if (isStep) {
      if (value === 7) updateLocationAvailability();
      updateProgress(value);
      continueButton.innerHTML = value === TOTAL_STEPS ? "Build Their Match <span aria-hidden=\"true\">→</span>" : "Continue <span aria-hidden=\"true\">→</span>";
      updateContinueState();
    }

    var heading = next.querySelector("legend, h1, h2");
    if (heading && direction !== "initial") {
      next.setAttribute("tabindex", "-1");
      next.focus({ preventScroll: true });
      next.removeAttribute("tabindex");
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function updateLocationAvailability() {
    var age = Number(state.answers.age);
    var austinInput = form.querySelector('[name="location"][value="austin"]');
    var austinOption = document.getElementById("austin-location-option");
    var austinNote = document.getElementById("austin-location-note");
    var unavailable = age > 0 && age < 8;

    austinInput.disabled = unavailable;
    austinOption.classList.toggle("is-unavailable", unavailable);
    austinNote.textContent = unavailable
      ? "Youth ages 8-12 only. Dripping Springs serves ages 3-7."
      : "Youth ages 8-12 at Castle Hill Fitness";

    if (unavailable && state.answers.location === "austin") {
      austinInput.checked = false;
      state.answers.location = "";
      saveNonPersonalState();
      updateSelectedStyles();
    }
  }

  function selectedValues(name) {
    return Array.from(form.querySelectorAll('[name="' + name + '"]:checked')).map(function (input) { return input.value; });
  }

  function syncAnswers(name) {
    if (name === "goals" || name === "coaching") state.answers[name] = selectedValues(name);
    else {
      var checked = form.querySelector('[name="' + name + '"]:checked');
      state.answers[name] = checked ? checked.value : "";
    }
    saveNonPersonalState();
  }

  function updateSelectedStyles() {
    form.querySelectorAll(".quiz-option").forEach(function (option) {
      var input = option.querySelector("input");
      option.classList.toggle("is-selected", Boolean(input && input.checked));
    });
  }

  function stepIsValid(step) {
    if (step === 1) return Boolean(state.answers.age);
    if (step === 2) return state.answers.goals.length >= 1 && state.answers.goals.length <= 2;
    if (step === 3) return Boolean(state.answers.environment);
    if (step === 4) return Boolean(state.answers.contact);
    if (step === 5) return state.answers.coaching.length >= 1 && state.answers.coaching.length <= 2;
    if (step === 6) return Boolean(state.answers.experience);
    if (step === 7) return Boolean(state.answers.location);
    if (step === 8) return detailsAreValid(false);
    return false;
  }

  function detailsAreValid(report) {
    var required = [
      document.getElementById("child-name"),
      document.getElementById("parent-name"),
      document.getElementById("email"),
      document.getElementById("contact-consent")
    ];
    var valid = required.every(function (field) { return field.checkValidity(); });
    if (report && !valid) {
      var firstInvalid = required.find(function (field) { return !field.checkValidity(); });
      if (firstInvalid) firstInvalid.reportValidity();
    }
    return valid;
  }

  function updateContinueState() {
    if (typeof state.current !== "number") return;
    continueButton.disabled = !stepIsValid(state.current);
  }

  function handleOptionChange(event) {
    var input = event.target;
    if (!input.matches(".quiz-option input")) {
      if (state.current === 8) updateContinueState();
      return;
    }
    var group = input.closest("[data-answer-group]");
    var max = group ? Number(group.dataset.max || 0) : 0;
    if (input.type === "checkbox" && max) {
      var chosen = group.querySelectorAll('input[type="checkbox"]:checked');
      if (chosen.length > max) {
        input.checked = false;
        stepMessage.textContent = "Choose up to " + max + " options.";
      } else {
        stepMessage.textContent = "";
      }
    }
    syncAnswers(input.name);
    updateSelectedStyles();
    updateContinueState();
  }

  function startQuiz() {
    track("quiz_started", { quiz_step: 1 });
    showScreen(1, "forward");
  }

  function goBack() {
    if (typeof state.current !== "number") return;
    track("quiz_back", { from_step: state.current });
    if (state.current === 1) showScreen("intro", "back");
    else showScreen(state.current - 1, "back");
  }

  function continueQuiz() {
    if (typeof state.current !== "number") return;
    if (!stepIsValid(state.current)) {
      if (state.current === 8) detailsAreValid(true);
      else stepMessage.textContent = "Choose an answer to continue.";
      return;
    }

    track("quiz_step_completed", {
      quiz_step: state.current,
      answer_group: state.current === 8 ? "contact_details" : ["age", "goals", "environment", "contact", "coaching", "experience", "location"][state.current - 1]
    });

    if (state.current < TOTAL_STEPS) showScreen(state.current + 1, "forward");
    else completeQuiz();
  }

  function calculateMatch(answers) {
    var age = Number(answers.age);
    var settleScore = 0;
    var challengeScore = 0;

    if (answers.environment === "stays-close") settleScore += 3;
    if (answers.environment === "watches-first") settleScore += 2;
    if (answers.environment === "depends") settleScore += 1;
    if (answers.contact === "avoids-it") settleScore += 3;
    if (answers.contact === "unsure") settleScore += 2;
    if (answers.contact === "warms-up") settleScore += 1;
    if (answers.experience === "new") settleScore += 1;
    if (answers.coaching.indexOf("patient") >= 0) settleScore += 1;
    if (answers.coaching.indexOf("listener") >= 0) settleScore += 1;

    if (answers.environment === "jumps-in") challengeScore += 2;
    if (answers.contact === "loves-it") challengeScore += 2;
    if (answers.experience === "martial-arts") challengeScore += 2;
    if (answers.experience === "bjj") challengeScore += 3;
    if (answers.coaching.indexOf("challenging") >= 0) challengeScore += 1;

    var path = "confidence-builder";
    if (settleScore >= 4) path = "supported-start";
    else if (challengeScore >= 4) path = "ready-to-roll";

    var program;
    if (age <= 7) {
      program = { name: "Little Champions", note: "Ages 3-7", href: "little-champions.html" };
    } else {
      program = { name: "Youth BJJ", note: "Ages 7-12", href: "youth.html" };
    }

    return { path: path, program: program, settleScore: settleScore, challengeScore: challengeScore };
  }

  function resultCopy(match, childName) {
    var possessiveName = childName || "Your child";
    var copy = {
      "supported-start": {
        title: "THE SUPPORTED START.",
        intro: possessiveName + " may learn best when trust and choice come before pressure. The goal is not to rush participation. It is to create a clear, safe invitation into the room.",
        reasons: [
          "Let them watch the rhythm of class before expecting full participation.",
          "Introduce partner contact gradually with clear rules and permission to tap.",
          "Use short, visible wins that turn uncertainty into earned confidence."
        ]
      },
      "confidence-builder": {
        title: "THE CONFIDENCE BUILDER.",
        intro: possessiveName + " appears ready for a balanced first class with clear structure, patient coaching, and enough challenge to make each small win feel earned.",
        reasons: [
          "Give one clear instruction at a time, then let movement reinforce it.",
          "Pair skill practice with encouragement and specific feedback.",
          "Build from listening and body control into confident partner work."
        ]
      },
      "ready-to-roll": {
        title: "THE READY-TO-ROLL START.",
        intro: possessiveName + " may respond well to an active first class with real technique, direct coaching, and purposeful challenges from the beginning.",
        reasons: [
          "Channel their energy into clear technique and responsible partner work.",
          "Offer a specific skill challenge so progress is easy to recognize.",
          "Keep boundaries and control central as the pace increases."
        ]
      }
    };
    return copy[match.path];
  }

  function addGoalReason(reasons) {
    var goal = state.answers.goals[0];
    var messages = {
      confidence: "Connect the lesson to speaking up, trying again, and staying present.",
      focus: "Use short sequences that reward listening and focused repetition.",
      "emotional-control": "Normalize pauses, tapping, and safe resets when frustration rises.",
      boundaries: "Practice clear taps, respectful stops, and responsibility for a partner.",
      activity: "Keep movement purposeful so activity builds coordination and control.",
      "real-skill": "Teach an authentic Jiu-Jitsu skill they can understand and repeat."
    };
    if (messages[goal]) reasons.push(messages[goal]);
  }

  function showResult(statusText) {
    var childName = document.getElementById("child-name").value.trim();
    var match = calculateMatch(state.answers);
    var copy = resultCopy(match, childName);
    var reasons = copy.reasons.slice();
    addGoalReason(reasons);

    document.getElementById("result-child").textContent = childName || "Your child";
    document.getElementById("result-path").textContent = copy.title;
    document.getElementById("result-intro").textContent = copy.intro;
    document.getElementById("result-program").textContent = match.program.name;
    document.getElementById("result-program-note").textContent = match.program.note;
    var locationText = labels.location[state.answers.location] || "We will help you choose";
    if (state.answers.location === "help" && Number(state.answers.age) <= 7) locationText = "Dripping Springs";
    document.getElementById("result-location").textContent = locationText;
    document.getElementById("result-cta").href = match.program.href;
    document.getElementById("result-reasons").replaceChildren.apply(
      document.getElementById("result-reasons"),
      reasons.map(function (reason) {
        var item = document.createElement("li");
        item.textContent = reason;
        return item;
      })
    );
    document.getElementById("result-status").textContent = statusText;

    showScreen("result", "forward");
    track("quiz_result_viewed", {
      result_path: match.path,
      result_program: match.program.name,
      result_location: state.answers.location,
      primary_goal: state.answers.goals[0] || ""
    });
  }

  async function completeQuiz() {
    if (!detailsAreValid(true)) return;
    continueButton.disabled = true;
    continueButton.textContent = "Building match...";

    var payload = {
      quiz: "child_first_class_match",
      answers: state.answers,
      contact: {
        child_first_name: document.getElementById("child-name").value.trim(),
        parent_first_name: document.getElementById("parent-name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim()
      },
      page: window.location.href,
      submitted_at: new Date().toISOString()
    };
    var endpoint = (app.dataset.endpoint || "").trim();
    track("quiz_lead_attempted", { endpoint_connected: Boolean(endpoint) });

    if (!endpoint) {
      showResult("Preview complete. Your answers produced this match, but your contact information was not sent or stored because the secure lead connection is not configured yet.");
      track("quiz_preview_completed", { endpoint_connected: false });
      return;
    }

    try {
      var response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Request failed");
      showResult("Your match and contact request were sent. The academy can now follow up with the best available first-class option.");
      track("quiz_lead_submitted", { endpoint_connected: true });
    } catch (error) {
      continueButton.disabled = false;
      continueButton.innerHTML = "Build Their Match <span aria-hidden=\"true\">→</span>";
      stepMessage.textContent = "We could not send your request. Please try again or call 512-644-4560.";
      track("quiz_lead_error", { endpoint_connected: true });
    }
  }

  function resetQuiz() {
    form.reset();
    state.current = "intro";
    state.answers = { age: "", goals: [], environment: "", contact: "", coaching: [], experience: "", location: "" };
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (error) {}
    updateSelectedStyles();
    showScreen("intro", "back");
    track("quiz_restarted");
  }

  form.addEventListener("change", handleOptionChange);
  form.addEventListener("input", function () {
    if (state.current === 8) updateContinueState();
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    continueQuiz();
  });
  startButton.addEventListener("click", startQuiz);
  progressBack.addEventListener("click", goBack);
  continueButton.addEventListener("click", continueQuiz);
  restartButton.addEventListener("click", resetQuiz);

  buildProgress();
  restoreNonPersonalState();
  track("quiz_view", { quiz_step: 0 });
  showScreen("intro", "initial");

  window.JCQuiz = {
    getState: function () { return JSON.parse(JSON.stringify(state)); },
    calculateMatch: calculateMatch,
    showScreen: showScreen,
    reset: resetQuiz
  };
})();
