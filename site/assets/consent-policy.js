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

  function validChoice(choice) {
    var normalized = String(choice || "");
    if (normalized === "analytics_granted") return "analytics_only";
    if (normalized === "analytics_denied") return "all_denied";
    return ["all_granted", "analytics_only", "advertising_only", "all_denied"].indexOf(normalized) >= 0
      ? normalized
      : "";
  }

  function categoriesForChoice(choice) {
    choice = validChoice(choice);
    return {
      analytics: choice === "all_granted" || choice === "analytics_only",
      advertising: choice === "all_granted" || choice === "advertising_only",
    };
  }

  function choiceForCategories(analytics, advertising) {
    if (analytics && advertising) return "all_granted";
    if (analytics) return "analytics_only";
    if (advertising) return "advertising_only";
    return "all_denied";
  }

  function consentState(choice, policy, hasGpc) {
    var explicitChoice = validChoice(choice);
    var categories = explicitChoice
      ? categoriesForChoice(explicitChoice)
      : categoriesForChoice(policy === "standard" ? "all_granted" : "all_denied");
    if (hasGpc === true) categories.advertising = false;
    return {
      analytics_storage: categories.analytics ? "granted" : "denied",
      ad_storage: categories.advertising ? "granted" : "denied",
      ad_user_data: categories.advertising ? "granted" : "denied",
      ad_personalization: categories.advertising ? "granted" : "denied",
    };
  }

  function analyticsConsent(choice, policy) {
    return consentState(choice, policy, false).analytics_storage;
  }

  function advertisingConsent(choice, policy, hasGpc) {
    return consentState(choice, policy, hasGpc).ad_storage;
  }

  function readCookieValue(documentObject, key) {
    if (!documentObject || typeof documentObject.cookie !== "string") return "";
    var encodedKey = encodeURIComponent(key) + "=";
    var cookies = documentObject.cookie.split(";");
    for (var index = 0; index < cookies.length; index += 1) {
      var cookie = cookies[index].trim();
      if (cookie.indexOf(encodedKey) !== 0) continue;
      try {
        return decodeURIComponent(cookie.slice(encodedKey.length));
      } catch (error) {
        return "";
      }
    }
    return "";
  }

  function validRecord(value) {
    var record = value;
    if (typeof value === "string") {
      try {
        record = JSON.parse(value);
      } catch (error) {
        return null;
      }
    }
    if (!record || Array.isArray(record) || typeof record !== "object") return null;
    if (record.version !== 2 || !Number.isSafeInteger(record.revision) || record.revision < 1) return null;
    if (["granted", "denied"].indexOf(record.analytics) < 0) return null;
    if (["granted", "denied"].indexOf(record.advertising) < 0) return null;
    return {
      version: 2,
      revision: record.revision,
      analytics: record.analytics,
      advertising: record.advertising,
    };
  }

  function recordForChoice(choice, revision) {
    var categories = categoriesForChoice(choice);
    return {
      version: 2,
      revision: revision,
      analytics: categories.analytics ? "granted" : "denied",
      advertising: categories.advertising ? "granted" : "denied",
    };
  }

  function recordsFromStores(context, key) {
    context = context || {};
    var records = [];
    var cookieRecord = validRecord(readCookieValue(context.document, key));
    if (cookieRecord) records.push(cookieRecord);
    ["localStorage", "sessionStorage"].forEach(function (storageName) {
      try {
        var record = validRecord(context[storageName].getItem(key));
        if (record) records.push(record);
      } catch (error) {
        // Continue to another bootstrap-readable store.
      }
    });
    return records;
  }

  function reconcileRecords(records) {
    if (!records.length) return null;
    var highestRevision = Math.max.apply(null, records.map(function (record) { return record.revision; }));
    var newest = records.filter(function (record) { return record.revision === highestRevision; });
    return {
      version: 2,
      revision: highestRevision,
      analytics: newest.every(function (record) { return record.analytics === "granted"; }) ? "granted" : "denied",
      advertising: newest.every(function (record) { return record.advertising === "granted"; }) ? "granted" : "denied",
    };
  }

  function readLegacyChoice(context, legacyKey) {
    if (!legacyKey) return "";
    var choices = [];
    var cookieChoice = validChoice(readCookieValue(context.document, legacyKey));
    if (cookieChoice) choices.push(cookieChoice);
    ["localStorage", "sessionStorage"].forEach(function (storageName) {
      try {
        var choice = validChoice(context[storageName].getItem(legacyKey));
        if (choice) choices.push(choice);
      } catch (error) {
        // Continue to another legacy store.
      }
    });
    if (!choices.length) return "";
    var analytics = true;
    var advertising = true;
    choices.forEach(function (choice) {
      var categories = categoriesForChoice(choice);
      analytics = analytics && categories.analytics;
      advertising = advertising && categories.advertising;
    });
    return choiceForCategories(analytics, advertising);
  }

  function readRecord(context, key) {
    return reconcileRecords(recordsFromStores(context || {}, key));
  }

  function readChoice(context, key, legacyKey) {
    context = context || {};
    var record = readRecord(context, key);
    if (record) {
      return choiceForCategories(record.analytics === "granted", record.advertising === "granted");
    }
    return readLegacyChoice(context, legacyKey);
  }

  function writeCookie(context, key, value, maxAge) {
    var secure = context.location && context.location.protocol === "https:" ? "; Secure" : "";
    context.document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) +
      "; Max-Age=" + maxAge + "; Path=/; SameSite=Lax" + secure;
  }

  function clearLegacy(context, legacyKey) {
    if (!legacyKey) return;
    ["localStorage", "sessionStorage"].forEach(function (storageName) {
      try { context[storageName].removeItem(legacyKey); } catch (error) {}
    });
    try { writeCookie(context, legacyKey, "", 0); } catch (error) {}
  }

  function saveChoice(context, key, choice, legacyKey) {
    context = context || {};
    choice = validChoice(choice);
    if (!choice) return false;
    var existing = recordsFromStores(context, key);
    var maxRevision = existing.reduce(function (highest, record) {
      return Math.max(highest, record.revision);
    }, 0);
    var record = recordForChoice(choice, maxRevision + 1);
    var serialized = JSON.stringify(record);
    var persisted = false;
    ["localStorage", "sessionStorage"].forEach(function (storageName) {
      try {
        var storage = context[storageName];
        storage.setItem(key, serialized);
        var stored = validRecord(storage.getItem(key));
        if (stored && stored.revision === record.revision) persisted = true;
      } catch (error) {
        // Consent remains usable through another first-party preference store.
      }
    });
    try {
      writeCookie(context, key, serialized, 31536000);
      var cookieRecord = validRecord(readCookieValue(context.document, key));
      if (cookieRecord && cookieRecord.revision === record.revision) persisted = true;
    } catch (error) {
      // A restrictive choice never triggers a reload unless another store persisted it.
    }
    var resolved = readRecord(context, key);
    var verified = Boolean(persisted && resolved && resolved.revision === record.revision &&
      resolved.analytics === record.analytics && resolved.advertising === record.advertising);
    if (verified) clearLegacy(context, legacyKey);
    return verified;
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
    advertisingConsent: advertisingConsent,
    analyticsConsent: analyticsConsent,
    categoriesForChoice: categoriesForChoice,
    choiceForCategories: choiceForCategories,
    consentState: consentState,
    detectRegion: detectRegion,
    policyForCountry: policyForCountry,
    readChoice: readChoice,
    readRecord: readRecord,
    regionResult: regionResult,
    saveChoice: saveChoice,
    validChoice: validChoice,
    validRecord: validRecord,
  };
});
