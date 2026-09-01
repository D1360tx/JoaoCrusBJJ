(function () {
  "use strict";

  var NUMBER_POOL_URL = "https://backend.leadconnectorhq.com/appengine/loc/PnNnRDAjstycMWpOmUn7/pool/egnGWH5KUrbdDxk7HLSN/number_pool.js";
  var SESSION_URL = "https://backend.leadconnectorhq.com/appengine/js/user_session.js";
  var CANONICAL_DIGITS = "15126444560";
  var started = false;
  var assignedHref = "";

  function phoneDigits(value) {
    var digits = String(value || "").replace(/\D/g, "");
    return digits.length === 10 ? "1" + digits : digits;
  }

  function syncTelLinks() {
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href^="tel:"]'));
    if (!assignedHref) {
      var assigned = links.find(function (link) {
        var digits = phoneDigits(link.getAttribute("href"));
        return digits.length === 11 && digits !== CANONICAL_DIGITS;
      });
      if (assigned) assignedHref = assigned.getAttribute("href");
    }
    if (!assignedHref) return false;
    links.forEach(function (link) {
      if (phoneDigits(link.getAttribute("href")) === CANONICAL_DIGITS) {
        link.setAttribute("href", assignedHref);
      }
    });
    return true;
  }

  function keepTelLinksSynchronized() {
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      syncTelLinks();
      if (attempts >= 40) window.clearInterval(timer);
    }, 250);
    if ("MutationObserver" in window) {
      new window.MutationObserver(syncTelLinks).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href"],
      });
    }
  }

  function measurementGranted(state) {
    return Boolean(
      state &&
      (state.analytics_storage === "granted" || state.ad_storage === "granted")
    );
  }

  function appendScript(src) {
    var script = document.createElement("script");
    script.src = src;
    script.async = false;
    document.body.appendChild(script);
  }

  function start() {
    if (started || !measurementGranted(window.joaoConsentState)) return false;
    started = true;
    window.joaoCallTrackingStarted = true;
    appendScript(NUMBER_POOL_URL);
    appendScript(SESSION_URL);
    keepTelLinksSynchronized();
    return true;
  }

  function startAfterRegionResolution() {
    var regionReady = window.joaoRegionReady;
    if (regionReady && typeof regionReady.then === "function") {
      regionReady.then(start).catch(function () {});
      return;
    }
    start();
  }

  window.addEventListener("joao:consentchange", start);
  startAfterRegionResolution();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { measurementGranted: measurementGranted };
  }
})();
