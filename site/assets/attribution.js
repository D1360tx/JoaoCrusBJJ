(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) {
    root.JoaoAttribution = api;
    root.joaoAttribution = api.capture(root);
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var STORAGE_KEY = "joao_attribution_v2";
  var LEGACY_KEY = "joao_attribution";
  var WINDOW_DAYS = 90;
  var TTL_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;
  var CAMPAIGN_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "utm_id",
    "campaign_id",
    "campaign_name",
    "adset_id",
    "adset_name",
    "ad_id",
    "ad_name",
    "placement",
    "site_source_name",
    "gclid",
    "fbclid",
    "wbraid",
    "gbraid",
    "msclkid",
  ];
  var IDENTIFIER_KEYS = [
    "utm_id",
    "campaign_id",
    "adset_id",
    "ad_id",
    "gclid",
    "fbclid",
    "wbraid",
    "gbraid",
    "msclkid",
  ];
  var TOUCH_KEYS = CAMPAIGN_KEYS.concat(["landing_page", "referrer_host", "captured_at"]);

  function clean(value, maxLength) {
    return String(value || "").trim().slice(0, maxLength || 160);
  }

  function sanitizeCampaignValue(value, key) {
    var raw = String(value || "").trim();
    if (!raw || raw.length > 160 || /[\u0000-\u001f\u007f]/.test(raw)) return "";
    if (IDENTIFIER_KEYS.indexOf(key) >= 0) {
      return /^[A-Za-z0-9._:-]{1,160}$/.test(raw) ? raw : "";
    }
    if (/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(raw)) return "";
    if (/(?:\+?\d[\s().-]*){7,}/.test(raw)) return "";
    return raw;
  }

  function readJson(storage, key) {
    try {
      var parsed = JSON.parse(storage.getItem(key) || "null");
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function writeJson(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Attribution must never block navigation or lead submission.
    }
  }

  function measurementStorageGranted(context) {
    return Boolean(
      context &&
      context.joaoConsentState &&
      (context.joaoConsentState.analytics_storage === "granted" ||
        context.joaoConsentState.ad_storage === "granted")
    );
  }

  function advertisingMeasurementGranted(context) {
    var state = context && context.joaoConsentState;
    return Boolean(state && state.ad_storage === "granted" && state.ad_user_data === "granted");
  }

  function readCookie(context, name) {
    try {
      var prefix = encodeURIComponent(name) + "=";
      var parts = String(context.document.cookie || "").split(";");
      for (var index = 0; index < parts.length; index += 1) {
        var part = parts[index].trim();
        if (part.indexOf(prefix) === 0) return decodeURIComponent(part.slice(prefix.length));
      }
    } catch (error) {
      // Cookie access can be blocked independently by browser privacy controls.
    }
    return "";
  }

  function validMetaCookie(value) {
    var cleaned = clean(value, 240);
    return /^fb\.1\.\d{10,13}\.[A-Za-z0-9._-]{6,200}$/.test(cleaned) ? cleaned : "";
  }

  function clickIdFromAttribution(attribution) {
    var latest = attribution && attribution.last_touch;
    var first = attribution && attribution.first_touch;
    return sanitizeCampaignValue((latest && latest.fbclid) || (first && first.fbclid), "fbclid");
  }

  function metaContext(context, attribution) {
    var state = context && context.joaoConsentState || {};
    var result = {
      analytics_storage: state.analytics_storage === "granted" ? "granted" : "denied",
      ad_storage: state.ad_storage === "granted" ? "granted" : "denied",
      ad_user_data: state.ad_user_data === "granted" ? "granted" : "denied",
    };
    if (!advertisingMeasurementGranted(context)) return result;
    var fbp = validMetaCookie(readCookie(context, "_fbp"));
    var fbc = validMetaCookie(readCookie(context, "_fbc"));
    var fbclid = clickIdFromAttribution(attribution);
    if (!fbc && fbclid) {
      var touch = attribution.last_touch && attribution.last_touch.fbclid
        ? attribution.last_touch
        : attribution.first_touch || {};
      var capturedMs = Date.parse(touch.captured_at || "");
      var timestamp = Number.isFinite(capturedMs) ? Math.floor(capturedMs) : Date.now();
      fbc = "fb.1." + timestamp + "." + fbclid;
    }
    if (fbp) result.fbp = fbp;
    if (fbc) result.fbc = fbc;
    return result;
  }

  function clear(context) {
    ["localStorage", "sessionStorage"].forEach(function (storageName) {
      [STORAGE_KEY, LEGACY_KEY].forEach(function (key) {
        try {
          context[storageName].removeItem(key);
        } catch (error) {
          // Revocation must not interrupt navigation when storage is unavailable.
        }
      });
    });
  }

  function sanitizeTouch(input) {
    var touch = {};
    TOUCH_KEYS.forEach(function (key) {
      var value = CAMPAIGN_KEYS.indexOf(key) >= 0
        ? sanitizeCampaignValue(input && input[key], key)
        : clean(input && input[key], key === "landing_page" ? 240 : 160);
      if (value) touch[key] = value;
    });
    return touch;
  }

  function currentTouch(context, nowMs) {
    var query = new URLSearchParams(context.location.search || "");
    var touch = {
      landing_page: clean(context.location.pathname || "/", 240) || "/",
      captured_at: new Date(nowMs).toISOString(),
    };
    CAMPAIGN_KEYS.forEach(function (key) {
      var value = sanitizeCampaignValue(query.get(key), key);
      if (value) touch[key] = value;
    });
    try {
      var referrerHost = context.document.referrer
        ? new URL(context.document.referrer, context.location.href).hostname
        : "";
      if (referrerHost && referrerHost !== context.location.hostname) {
        touch.referrer_host = clean(referrerHost);
      }
    } catch (error) {
      // Ignore malformed referrers supplied by privacy tools or browsers.
    }
    return touch;
  }

  function isAttributedTouch(touch) {
    return CAMPAIGN_KEYS.some(function (key) {
      return Boolean(touch[key]);
    }) || Boolean(touch.referrer_host);
  }

  function legacyTouch(sessionStore) {
    var legacy = readJson(sessionStore, LEGACY_KEY);
    return legacy ? sanitizeTouch(legacy) : null;
  }

  function touchExpiry(touch) {
    var captured = Date.parse(touch && touch.captured_at);
    return Number.isFinite(captured) ? captured + TTL_MS : 0;
  }

  function isFreshTouch(touch, fallbackExpiry, now) {
    var expiry = touchExpiry(touch) || Number(fallbackExpiry) || 0;
    return expiry > now;
  }

  function flatten(record) {
    var firstTouch = sanitizeTouch(record.first_touch);
    var lastTouch = sanitizeTouch(record.last_touch);
    var result = {
      first_touch: firstTouch,
      last_touch: lastTouch,
      attribution_window_days: WINDOW_DAYS,
    };
    Object.keys(lastTouch).forEach(function (key) {
      result[key] = lastTouch[key];
    });
    return result;
  }

  function capture(context, nowMs) {
    var now = Number.isFinite(nowMs) ? nowMs : Date.now();
    if (!measurementStorageGranted(context)) {
      return flatten({ first_touch: {}, last_touch: {} });
    }
    var current = currentTouch(context, now);
    var localStore = null;
    var sessionStore = null;
    try {
      localStore = context.localStorage;
    } catch (error) {
      // localStorage may be denied while sessionStorage remains available.
    }
    try {
      sessionStore = context.sessionStorage;
    } catch (error) {
      // sessionStorage may be denied independently by privacy controls.
    }
    var record = readJson(localStore, STORAGE_KEY);

    if (!record) {
      var migrated = legacyTouch(sessionStore);
      if (migrated && !migrated.captured_at) migrated.captured_at = current.captured_at;
      var initial = migrated && Object.keys(migrated).length ? migrated : current;
      record = {
        version: 2,
        first_touch: initial,
        last_touch: isAttributedTouch(current) ? current : initial,
      };
    } else {
      var firstFresh = isFreshTouch(record.first_touch, record.expires_at, now);
      var lastFresh = isFreshTouch(record.last_touch, record.expires_at, now);
      if (!firstFresh) record.first_touch = lastFresh ? record.last_touch : current;
      if (!lastFresh) record.last_touch = record.first_touch;
      if (isAttributedTouch(current)) record.last_touch = current;
    }

    record.first_touch = sanitizeTouch(record.first_touch);
    record.last_touch = sanitizeTouch(record.last_touch);
    record.expires_at = Math.max(touchExpiry(record.first_touch), touchExpiry(record.last_touch));
    writeJson(localStore, STORAGE_KEY, record);
    writeJson(sessionStore, LEGACY_KEY, record.last_touch);
    return flatten(record);
  }

  return {
    CAMPAIGN_KEYS: CAMPAIGN_KEYS.slice(),
    STORAGE_KEY: STORAGE_KEY,
    WINDOW_DAYS: WINDOW_DAYS,
    clear: clear,
    capture: capture,
    metaContext: metaContext,
    sanitizeCampaignValue: sanitizeCampaignValue,
  };
});
