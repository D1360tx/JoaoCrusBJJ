(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var CONSENT_KEY = "joao_consent_v2";
    var LEGACY_CONSENT_KEY = "joao_consent_v1";
    var DISMISS_KEY = "joao_consent_dismissed_v1";
    var hasGpc = navigator.globalPrivacyControl === true;
    var consentChoice = "";
    var consentInvoker = null;
    var policy = window.JoaoConsentPolicy;
    var regionReady = window.joaoRegionReady || Promise.resolve(
      window.joaoConsentRegion || { country: "", policy: "unknown" }
    );

    if (policy && typeof policy.readChoice === "function") {
      consentChoice = policy.readChoice(window, CONSENT_KEY, LEGACY_CONSENT_KEY);
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

      function stateForChoice(choice) {
        if (policy && typeof policy.consentState === "function") {
          return policy.consentState(choice, region.policy, hasGpc);
        }
        var granted = choice === "all_granted";
        return {
          analytics_storage: granted ? "granted" : "denied",
          ad_storage: granted && !hasGpc ? "granted" : "denied",
          ad_user_data: granted && !hasGpc ? "granted" : "denied",
          ad_personalization: granted && !hasGpc ? "granted" : "denied",
        };
      }

      function choiceForCategories(analytics, advertising) {
        if (policy && typeof policy.choiceForCategories === "function") {
          return policy.choiceForCategories(analytics, advertising);
        }
        if (analytics && advertising) return "all_granted";
        if (analytics) return "analytics_only";
        if (advertising) return "advertising_only";
        return "all_denied";
      }

      function clearCookies(pattern) {
        var cookieNames = document.cookie.split(";").map(function (cookie) {
          return cookie.split("=")[0].trim();
        }).filter(function (name) {
          return pattern.test(name);
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
        var nextState = stateForChoice(choice);
        var previousState = window.joaoConsentState || {};
        window.joaoConsentState = nextState;
        var changed = ["analytics_storage", "ad_storage", "ad_user_data", "ad_personalization"].some(function (key) {
          return previousState[key] !== nextState[key];
        });
        if (typeof window.gtag === "function" && changed) {
          window.gtag("consent", "update", nextState);
        }
        if (typeof window.fbq === "function") {
          window.fbq("consent", nextState.ad_storage === "granted" ? "grant" : "revoke");
        }
        if ((nextState.analytics_storage === "granted" || nextState.ad_storage === "granted") &&
            typeof window.joaoStartGtm === "function") {
          window.joaoStartGtm();
        }
        if (nextState.analytics_storage === "denied") {
          clearCookies(/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)|^_gac_/);
        }
        if (nextState.ad_storage === "denied") {
          clearCookies(/^_fb[pc]$|^_gcl_/);
        }
        if (window.JoaoAttribution) {
          if (nextState.analytics_storage === "denied" && nextState.ad_storage === "denied") {
            window.JoaoAttribution.clear(window);
          }
          window.joaoAttribution = window.JoaoAttribution.capture(window);
        }
        window.dispatchEvent(new CustomEvent("joao:consentchange", {
          detail: {
            analytics_storage: nextState.analytics_storage,
            ad_storage: nextState.ad_storage,
            ad_user_data: nextState.ad_user_data,
            ad_personalization: nextState.ad_personalization,
            country: region.country || "",
            policy: region.policy || "unknown",
            global_privacy_control: hasGpc,
          },
        }));
        return nextState;
      }

      var consentBanner = document.createElement("section");
      consentBanner.className = "consent-banner";
      consentBanner.hidden = true;
      consentBanner.setAttribute("role", "dialog");
      consentBanner.setAttribute("aria-labelledby", "consent-title");
      consentBanner.innerHTML =
        '<button class="consent-close" type="button" aria-label="Close privacy choices"><span aria-hidden="true">×</span></button>' +
        '<div class="consent-copy"><strong id="consent-title">Privacy choices</strong>' +
        '<p>Choose whether we may use optional analytics and advertising technologies. You can change these choices at any time.</p>' +
        '<div class="consent-categories">' +
        '<label><input class="consent-analytics" type="checkbox"> <span><b>Analytics</b><small>Google Analytics helps us understand site use and campaign performance.</small></span></label>' +
        '<label><input class="consent-advertising" type="checkbox"> <span><b>Advertising</b><small>Google Ads and Meta help measure ads and show more relevant promotions.</small></span></label>' +
        '</div>' +
        '<p class="consent-gpc" hidden>Your browser is sending Global Privacy Control. Advertising measurement and personalization remain off.</p>' +
        '<a href="/privacy-policy/">Read the privacy policy</a></div>' +
        '<div class="consent-actions"><button class="consent-save" type="button">Save choices</button>' +
        '<button class="consent-allow" type="button">Allow all</button>' +
        '<button class="consent-decline" type="button">Turn off optional tracking</button></div>';
      document.body.appendChild(consentBanner);

      var analyticsToggle = consentBanner.querySelector(".consent-analytics");
      var advertisingToggle = consentBanner.querySelector(".consent-advertising");
      var consentAllow = consentBanner.querySelector(".consent-allow");
      var consentClose = consentBanner.querySelector(".consent-close");
      var consentDecline = consentBanner.querySelector(".consent-decline");
      var consentSave = consentBanner.querySelector(".consent-save");
      var consentGpc = consentBanner.querySelector(".consent-gpc");
      if (hasGpc) {
        consentGpc.hidden = false;
        advertisingToggle.disabled = true;
      }

      function showConsentChoices(event) {
        consentInvoker = event && event.currentTarget instanceof HTMLElement
          ? event.currentTarget
          : null;
        var scrollLeft = window.scrollX;
        var scrollTop = window.scrollY;
        var state = stateForChoice(consentChoice);
        analyticsToggle.checked = state.analytics_storage === "granted";
        advertisingToggle.checked = state.ad_storage === "granted" && !hasGpc;
        consentBanner.hidden = false;
        document.body.classList.add("consent-open");
        try {
          consentSave.focus({ preventScroll: true });
        } catch (error) {
          consentSave.focus();
        }
        if (window.scrollX !== scrollLeft || window.scrollY !== scrollTop) {
          window.scrollTo(scrollLeft, scrollTop);
        }
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
        var previousState = stateForChoice(consentChoice);
        var shouldReload = window.joaoGtmStarted === true;
        consentChoice = choice;
        var consentPersisted = false;
        if (policy && typeof policy.saveChoice === "function") {
          consentPersisted = policy.saveChoice(window, CONSENT_KEY, consentChoice, LEGACY_CONSENT_KEY);
        } else {
          try {
            localStorage.setItem(CONSENT_KEY, consentChoice);
            consentPersisted = localStorage.getItem(CONSENT_KEY) === consentChoice;
          } catch (error) {
            // The choice still applies to the current page when storage is unavailable.
          }
        }
        var nextState = applyConsent(consentChoice);
        var changed = previousState.analytics_storage !== nextState.analytics_storage ||
          previousState.ad_storage !== nextState.ad_storage;
        try {
          sessionStorage.removeItem(DISMISS_KEY);
        } catch (error) {
          // The explicit choice is already stored by the consent policy.
        }
        hideConsentChoices();
        if (shouldReload && changed && consentPersisted) window.location.reload();
      }

      consentSave.addEventListener("click", function () {
        saveConsent(choiceForCategories(analyticsToggle.checked, advertisingToggle.checked && !hasGpc));
      });
      consentAllow.addEventListener("click", function () {
        saveConsent(choiceForCategories(true, !hasGpc));
      });
      consentDecline.addEventListener("click", function () {
        saveConsent("all_denied");
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
      // A failed or missing region lookup must never silently enable optional tracking.
      window.joaoConsentRegion = { country: "", policy: "unknown" };
    });
  });
})();
