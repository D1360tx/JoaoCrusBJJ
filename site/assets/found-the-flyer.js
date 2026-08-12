(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var dialog = document.querySelector("[data-video-dialog]");
    var trigger = document.querySelector("[data-video-placeholder]");
    var lastFocus = null;

    function campaignEvent(name, parameters) {
      if (!window.joaoConsentState ||
          (window.joaoConsentState.analytics_storage !== "granted" &&
           window.joaoConsentState.ad_storage !== "granted")) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, parameters || {}));
    }

    function openVideoNote() {
      campaignEvent("video_start", {
        video_title: "found_the_flyer_welcome_placeholder",
        campaign_name: "found_the_flyer",
        submission_page: window.location.pathname,
      });
      if (!dialog || typeof dialog.showModal !== "function") return;
      lastFocus = document.activeElement;
      dialog.showModal();
      dialog.querySelector("[data-video-close]").focus();
    }

    function closeVideoNote() {
      if (!dialog || !dialog.open) return;
      dialog.close();
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    }

    if (trigger) trigger.addEventListener("click", openVideoNote);
    if (dialog) {
      dialog.querySelectorAll("[data-video-close]").forEach(function (button) {
        button.addEventListener("click", function () {
          var target = button.getAttribute("href");
          closeVideoNote();
          if (target) {
            window.requestAnimationFrame(function () {
              document.querySelector(target).scrollIntoView({ block: "start" });
            });
          }
        });
      });
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) closeVideoNote();
      });
    }

    var program = document.querySelector("#flyer-program");
    document.querySelectorAll("[data-program-choice]").forEach(function (link) {
      link.addEventListener("click", function () {
        if (!program) return;
        var requested = link.dataset.programChoice;
        program.value = requested === "Kids BJJ" ? "Not sure yet" : requested;
        campaignEvent("select_content", {
          content_type: "flyer_program_path",
          item_id: String(requested || "not_set").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          campaign_name: "found_the_flyer",
        });
      });
    });

    campaignEvent("campaign_landing_view", {
      campaign_name: "found_the_flyer",
      campaign_medium: "offline_qr",
      submission_page: window.location.pathname,
    });
  });
})();
