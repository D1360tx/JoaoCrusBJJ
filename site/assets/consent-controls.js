(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var CONSENT_KEY = "joao_consent_v1";
    var DISMISS_KEY = "joao_consent_dismissed_v1";
    var hasGpc = navigator.globalPrivacyControl === true;
    var consentChoice = "";
    var consentInvoker = null;
    var policy = window.JoaoConsentPolicy;
    var regionReady = window.joaoRegionReady || Promise.resolve(
      window.joaoConsentRegion || { country: "", policy: "unknown" }
    );

    if (policy && typeof policy.readChoice === "function") {
      consentChoice = policy.readChoice(window, CONSENT_KEY);
    } else {
      try {
        consentChoice = localStorage.getItem(CONSENT_KEY) || "";
      } catch (error) {
        // Consent controls continue to work for this page when storage is unavailable.
      }
    }

    function consentWasDismissed() {
      try {
        return sessionStorage.getItem(DISMISS_KEY) === "1";
      } catch (error) {
        return false;
      }
    }

    regionReady.then(function (region) {
      region = region || { country: "", policy: "unknown" };
      window.joaoConsentRegion = region;

      function consentValue(choice) {
        if (policy && typeof policy.analyticsConsent === "function") {
          return policy.analyticsConsent(choice, region.policy);
        }
        return choice === "analytics_granted" ? "granted" : "denied";
      }

      function clearAnalyticsCookies() {
        var cookieNames = document.cookie.split(";").map(function (cookie) {
          return cookie.split("=")[0].trim();
        }).filter(function (name) {
          return /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)|^_gac_/.test(name);
        });
        var domains = ["", location.hostname, "." + location.hostname];
        if (/([.]|^)joaocrusbjj[.]com$/i.test(location.hostname)) {
          domains.push(".joaocrusbjj.com");
        }
        cookieNames.forEach(function (name) {
          domains.forEach(function (domain) {
            document.cookie = name + "=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" +
              (domain ? "; domain=" + domain : "") + "; SameSite=Lax";
          });
        });
      }

      function applyConsent(choice) {
        var analyticsConsent = consentValue(choice);
        var previousAnalyticsConsent = window.joaoConsentState &&
          window.joaoConsentState.analytics_storage;
        window.joaoConsentState = {
          analytics_storage: analyticsConsent,
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        };
        if (typeof window.gtag === "function" && previousAnalyticsConsent !== analyticsConsent) {
          window.gtag("consent", "update", window.joaoConsentState);
        }
        if (analyticsConsent === "granted" && typeof window.joaoStartGtm === "function") {
          window.joaoStartGtm();
        }
        if (analyticsConsent === "denied") clearAnalyticsCookies();
        if (window.JoaoAttribution) {
          if (analyticsConsent === "denied") window.JoaoAttribution.clear(window);
          window.joaoAttribution = window.JoaoAttribution.capture(window);
        }
        window.dispatchEvent(new CustomEvent("joao:consentchange", {
          detail: {
            analytics_storage: analyticsConsent,
            country: region.country || "",
            policy: region.policy || "unknown",
          },
        }));
      }

      var consentBanner = document.createElement("section");
      consentBanner.className = "consent-banner";
      consentBanner.hidden = true;
      consentBanner.setAttribute("role", "dialog");
      consentBanner.setAttribute("aria-labelledby", "consent-title");
      consentBanner.innerHTML =
        '<button class="consent-close" type="button" aria-label="Close privacy choices"><span aria-hidden="true">×</span></button>' +
        '<div class="consent-copy"><strong id="consent-title">Privacy choices</strong>' +
        '<p>Optional analytics help us understand site use and campaign performance. You can continue without analytics and change this choice later.</p>' +
        '<p class="consent-gpc" hidden>Your browser is sending a Global Privacy Control signal. Advertising-related storage and personalization remain off.</p>' +
        '<a href="/privacy-policy/">Read the privacy policy</a></div>' +
        '<div class="consent-actions"><button class="consent-allow" type="button">Allow analytics</button>' +
        '<button class="consent-decline" type="button">Continue without analytics</button></div>';
      document.body.appendChild(consentBanner);

      var consentAllow = consentBanner.querySelector(".consent-allow");
      var consentClose = consentBanner.querySelector(".consent-close");
      var consentDecline = consentBanner.querySelector(".consent-decline");
      var consentGpc = consentBanner.querySelector(".consent-gpc");
      if (hasGpc) consentGpc.hidden = false;

      function showConsentChoices(event) {
        consentInvoker = event && event.currentTarget instanceof HTMLElement
          ? event.currentTarget
          : null;
        consentBanner.hidden = false;
        document.body.classList.add("consent-open");
        (consentValue(consentChoice) === "granted" ? consentDecline : consentAllow).focus();
      }

      function hideConsentChoices() {
        consentBanner.hidden = true;
        document.body.classList.remove("consent-open");
        if (consentInvoker && document.contains(consentInvoker)) consentInvoker.focus();
        consentInvoker = null;
      }

      function closeConsentChoices() {
        hideConsentChoices();
        try {
          sessionStorage.setItem(DISMISS_KEY, "1");
        } catch (error) {
          // Closing still works for this page when session storage is unavailable.
        }
      }

      function saveConsent(choice) {
        var shouldReloadWithoutTags = choice === "analytics_denied" &&
          window.joaoGtmStarted === true;
        consentChoice = choice;
        var consentPersisted = false;
        if (policy && typeof policy.saveChoice === "function") {
          consentPersisted = policy.saveChoice(window, CONSENT_KEY, consentChoice);
        } else {
          try {
            localStorage.setItem(CONSENT_KEY, consentChoice);
            consentPersisted = localStorage.getItem(CONSENT_KEY) === consentChoice;
          } catch (error) {
            // The choice still applies to the current page when storage is unavailable.
          }
        }
        applyConsent(consentChoice);
        try {
          sessionStorage.removeItem(DISMISS_KEY);
        } catch (error) {
          // The explicit choice is already stored by the consent policy.
        }
        hideConsentChoices();
        if (shouldReloadWithoutTags && consentPersisted) window.location.reload();
      }

      consentAllow.addEventListener("click", function () {
        saveConsent("analytics_granted");
      });
      consentDecline.addEventListener("click", function () {
        saveConsent("analytics_denied");
      });
      consentClose.addEventListener("click", closeConsentChoices);
      consentBanner.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeConsentChoices();
        }
      });

      var preferenceHosts = document.querySelectorAll(".bottom");
      if (!preferenceHosts.length) preferenceHosts = document.querySelectorAll("footer .wrap");
      preferenceHosts.forEach(function (host) {
        var preferences = document.createElement("button");
        preferences.className = "consent-preferences";
        preferences.type = "button";
        preferences.textContent = "Privacy choices";
        preferences.addEventListener("click", showConsentChoices);
        host.appendChild(preferences);
      });

      applyConsent(consentChoice);
      if (!consentChoice && region.policy !== "standard" && !consentWasDismissed()) {
        showConsentChoices();
      }
    }).catch(function () {
      // A failed or missing region lookup must never silently enable analytics.
      window.joaoConsentRegion = { country: "", policy: "unknown" };
    });
  });
})();
