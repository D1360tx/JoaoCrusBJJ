(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var CONSENT_KEY = "joao_consent_v1";
    var hasGpc = navigator.globalPrivacyControl === true;
    var consentChoice = "";
    var consentInvoker = null;

    try {
      consentChoice = localStorage.getItem(CONSENT_KEY) || "";
    } catch (error) {
      // Consent controls continue to work for this page when storage is unavailable.
    }

    function consentValue(choice) {
      return !hasGpc && choice === "analytics_granted" ? "granted" : "denied";
    }

    function applyConsent(choice) {
      var analyticsConsent = consentValue(choice);
      window.joaoConsentState = {
        analytics_storage: analyticsConsent,
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      };
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", window.joaoConsentState);
      }
      if (window.JoaoAttribution) {
        if (analyticsConsent === "denied") window.JoaoAttribution.clear(window);
        window.joaoAttribution = window.JoaoAttribution.capture(window);
      }
      window.dispatchEvent(new CustomEvent("joao:consentchange", {
        detail: { analytics_storage: analyticsConsent },
      }));
    }

    var consentBanner = document.createElement("section");
    consentBanner.className = "consent-banner";
    consentBanner.hidden = true;
    consentBanner.setAttribute("role", "dialog");
    consentBanner.setAttribute("aria-labelledby", "consent-title");
    consentBanner.innerHTML =
      '<div class="consent-copy"><strong id="consent-title">Privacy choices</strong>' +
      '<p>We use optional analytics to understand site use and campaign performance. You can change this choice at any time.</p>' +
      '<p class="consent-gpc" hidden>Your browser is sending a Global Privacy Control signal, so optional analytics storage will remain off.</p>' +
      '<a href="/privacy-policy/">Read the privacy policy</a></div>' +
      '<div class="consent-actions"><button class="btn consent-allow" type="button">Allow analytics</button>' +
      '<button class="consent-decline" type="button">Decline</button></div>';
    document.body.appendChild(consentBanner);

    var consentAllow = consentBanner.querySelector(".consent-allow");
    var consentDecline = consentBanner.querySelector(".consent-decline");
    var consentGpc = consentBanner.querySelector(".consent-gpc");
    if (hasGpc) {
      consentAllow.hidden = true;
      consentGpc.hidden = false;
    }

    function showConsentChoices(event) {
      consentInvoker = event && event.currentTarget instanceof HTMLElement
        ? event.currentTarget
        : null;
      consentBanner.hidden = false;
      document.body.classList.add("consent-open");
      (hasGpc ? consentDecline : consentAllow).focus();
    }

    function saveConsent(choice) {
      consentChoice = hasGpc ? "analytics_denied" : choice;
      try {
        localStorage.setItem(CONSENT_KEY, consentChoice);
      } catch (error) {
        // The choice still applies to the current page when storage is unavailable.
      }
      applyConsent(consentChoice);
      consentBanner.hidden = true;
      document.body.classList.remove("consent-open");
      if (consentInvoker && document.contains(consentInvoker)) consentInvoker.focus();
      consentInvoker = null;
    }

    consentAllow.addEventListener("click", function () {
      saveConsent("analytics_granted");
    });
    consentDecline.addEventListener("click", function () {
      saveConsent("analytics_denied");
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

    if (!consentChoice || hasGpc && consentChoice !== "analytics_denied") {
      showConsentChoices();
    }
  });
})();
