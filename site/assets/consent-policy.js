(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.JoaoConsentPolicy = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var REGION_ENDPOINT = "https://api.country.is/";
  var KNOWN_COUNTRIES = (
    "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ " +
    "BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ " +
    "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ " +
    "DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR " +
    "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY " +
    "HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP " +
    "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY " +
    "MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ " +
    "NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY " +
    "QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ " +
    "TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ " +
    "VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
  ).split(" ");
  var STRICT_COUNTRIES = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DE", "DK", "EE", "ES", "FI",
    "FR", "GR", "HU", "IE", "IS", "IT", "LI", "LT", "LU", "LV", "MT",
    "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK", "GB", "CH",
  ];

  function normalizeCountry(country) {
    var normalized = String(country || "").trim().toUpperCase();
    return /^[A-Z]{2}$/.test(normalized) && KNOWN_COUNTRIES.indexOf(normalized) >= 0
      ? normalized
      : "";
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

  function validChoice(choice) {
    return choice === "analytics_granted" || choice === "analytics_denied" ? choice : "";
  }

  function readChoiceCookie(documentObject, key) {
    if (!documentObject || typeof documentObject.cookie !== "string") return "";
    var encodedKey = encodeURIComponent(key) + "=";
    var cookies = documentObject.cookie.split(";");
    for (var index = 0; index < cookies.length; index += 1) {
      var cookie = cookies[index].trim();
      if (cookie.indexOf(encodedKey) !== 0) continue;
      try {
        return validChoice(decodeURIComponent(cookie.slice(encodedKey.length)));
      } catch (error) {
        return "";
      }
    }
    return "";
  }

  function readChoice(context, key) {
    context = context || {};
    var cookieChoice = readChoiceCookie(context.document, key);
    if (cookieChoice) return cookieChoice;
    var storageNames = ["localStorage", "sessionStorage"];
    for (var index = 0; index < storageNames.length; index += 1) {
      try {
        var choice = validChoice(context[storageNames[index]].getItem(key));
        if (choice) return choice;
      } catch (error) {
        // Continue to the next bootstrap-readable preference store.
      }
    }
    return "";
  }

  function saveChoice(context, key, choice) {
    context = context || {};
    choice = validChoice(choice);
    if (!choice) return false;
    var persisted = false;
    var storageNames = ["localStorage", "sessionStorage"];
    for (var index = 0; index < storageNames.length; index += 1) {
      try {
        var storage = context[storageNames[index]];
        storage.setItem(key, choice);
        if (storage.getItem(key) === choice) persisted = true;
      } catch (error) {
        // Consent remains usable through another first-party preference store.
      }
    }
    try {
      var documentObject = context.document;
      var secure = context.location && context.location.protocol === "https:" ? "; Secure" : "";
      documentObject.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(choice) +
        "; Max-Age=31536000; Path=/; SameSite=Lax" + secure;
      if (readChoiceCookie(documentObject, key) === choice) persisted = true;
    } catch (error) {
      // A denied choice never triggers a reload unless another store persisted it.
    }
    return persisted;
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
    KNOWN_COUNTRIES: KNOWN_COUNTRIES.slice(),
    STRICT_COUNTRIES: STRICT_COUNTRIES.slice(),
    analyticsConsent: analyticsConsent,
    detectRegion: detectRegion,
    policyForCountry: policyForCountry,
    readChoice: readChoice,
    regionResult: regionResult,
    saveChoice: saveChoice,
  };
});
