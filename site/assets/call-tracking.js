(function () {
  "use strict";

  var NUMBER_POOL_URL = "https://backend.leadconnectorhq.com/appengine/loc/PnNnRDAjstycMWpOmUn7/pool/egnGWH5KUrbdDxk7HLSN/number_pool.js";
  var SESSION_URL = "https://backend.leadconnectorhq.com/appengine/js/user_session.js";
  var started = false;

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
