(function () {
  document.addEventListener("DOMContentLoaded", function () {
    function campaignEvent(name, parameters) {
      if (!window.joaoConsentState ||
          (window.joaoConsentState.analytics_storage !== "granted" &&
           window.joaoConsentState.ad_storage !== "granted")) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, parameters || {}));
    }

    var heroVideo = document.querySelector("[data-hero-video]");
    if (heroVideo) {
      var heroStarted = false;
      var heroCompleted = false;
      var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function trackHeroStart() {
        if (heroStarted) return;
        heroStarted = true;
        campaignEvent("video_start", {
          video_title: "practice_under_pressure_welcome",
          campaign_name: "practice_under_pressure",
          submission_page: window.location.pathname,
        });
      }

      heroVideo.addEventListener("play", trackHeroStart);
      heroVideo.addEventListener("timeupdate", function () {
        if (heroCompleted || !Number.isFinite(heroVideo.duration)) return;
        if (heroVideo.duration - heroVideo.currentTime > 0.6) return;
        heroCompleted = true;
        campaignEvent("video_complete", {
          video_title: "practice_under_pressure_welcome",
          campaign_name: "practice_under_pressure",
          submission_page: window.location.pathname,
        });
      });

      if (heroVideo.textTracks && heroVideo.textTracks[0]) {
        heroVideo.textTracks[0].mode = "showing";
      }

      if (reducedMotion) {
        heroVideo.removeAttribute("autoplay");
        heroVideo.pause();
        heroVideo.currentTime = 0;
      } else {
        var playAttempt = heroVideo.play();
        if (playAttempt && typeof playAttempt.catch === "function") playAttempt.catch(function () {});
        if (!heroVideo.paused) trackHeroStart();
      }
    }

    document.querySelectorAll("[data-quiz-route]").forEach(function (link) {
      try {
        var target = new URL(link.href, window.location.href);
        var current = new URLSearchParams(window.location.search);
        current.forEach(function (value, key) {
          if (!target.searchParams.has(key)) target.searchParams.set(key, value);
        });
        if (!target.searchParams.has("source")) target.searchParams.set("source", "practice-under-pressure");
        if (!target.searchParams.has("utm_source")) target.searchParams.set("utm_source", "website");
        if (!target.searchParams.has("utm_medium")) target.searchParams.set("utm_medium", "landing_page");
        if (!target.searchParams.has("utm_campaign")) target.searchParams.set("utm_campaign", "practice_under_pressure");
        link.href = target.pathname + target.search + target.hash;
      } catch (error) {
        // Keep the static canonical fallback when URL parsing is unavailable.
      }
    });

    campaignEvent("campaign_landing_view", {
      campaign_name: "practice_under_pressure",
      campaign_medium: "website_landing",
      submission_page: window.location.pathname,
    });
  });
})();
