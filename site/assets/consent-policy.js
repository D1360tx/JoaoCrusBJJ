(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.JoaoConsentPolicy = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var REGION_ENDPOINT = "https://api.country.is/";
  var STRICT_COUNTRIES = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DE", "DK", "EE", "ES", "FI",
    "FR", "GR", "HU", "IE", "IS", "IT", "LI", "LT", "LU", "LV", "MT",
    "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK", "GB", "CH",
  ];

  function normalizeCountry(country) {
    var normalized = String(country || "").trim().toUpperCase();
    return /^[A-Z]{2}$/.test(normalized) ? normalized : "";
  }

  function policyForCountry(country) {
    var normalized = normalizeCountry(country);
    if (!normalized) return "unknown";
    return STRICT_COUNTRIES.indexOf(normalized) >= 0 ? "opt_in" : "standard";
  }

  function analyticsConsent(choice, policy) {
    if (choice === "analytics_granted") return "granted";
    if (choice === "analytics_denied") return "denied";
    return policy === "standard" ? "granted" : "denied";
  }

  function regionResult(country) {
    var normalized = normalizeCountry(country);
    return {
      country: normalized,
      policy: policyForCountry(normalized),
    };
  }

  function detectRegion(fetchImplementation, timeoutMs) {
    if (typeof fetchImplementation !== "function") {
      return Promise.resolve(regionResult(""));
    }

    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = null;
    var options = {
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
    };
    if (controller) options.signal = controller.signal;
    if (controller && timeoutMs > 0) {
      timer = setTimeout(function () { controller.abort(); }, timeoutMs);
    }

    return Promise.resolve(fetchImplementation(REGION_ENDPOINT, options))
      .then(function (response) {
        if (!response || !response.ok) throw new Error("region lookup failed");
        return response.json();
      })
      .then(function (payload) {
        return regionResult(payload && payload.country);
      })
      .catch(function () {
        return regionResult("");
      })
      .finally(function () {
        if (timer) clearTimeout(timer);
      });
  }

  return {
    REGION_ENDPOINT: REGION_ENDPOINT,
    STRICT_COUNTRIES: STRICT_COUNTRIES.slice(),
    analyticsConsent: analyticsConsent,
    detectRegion: detectRegion,
    policyForCountry: policyForCountry,
    regionResult: regionResult,
  };
});
