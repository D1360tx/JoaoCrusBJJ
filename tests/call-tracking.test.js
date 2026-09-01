const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "../site/assets/call-tracking.js"),
  "utf8",
);

function harness(initialState, regionReady = null) {
  const listeners = new Map();
  const appended = [];
  const window = {
    joaoConsentState: { ...initialState },
    joaoRegionReady: regionReady,
    addEventListener(name, listener) {
      listeners.set(name, listener);
    },
  };
  const document = {
    createElement(tagName) {
      const scriptListeners = new Map();
      return {
        tagName,
        addEventListener(name, listener) {
          scriptListeners.set(name, listener);
        },
        dispatch(name) {
          const listener = scriptListeners.get(name);
          if (listener) listener();
        },
      };
    },
    body: {
      appendChild(node) {
        appended.push(node);
      },
    },
  };
  const context = {
    window,
    document,
    module: { exports: {} },
    console,
  };
  vm.runInNewContext(source, context, { filename: "call-tracking.js" });
  return {
    appended,
    dispatchConsent() {
      const listener = listeners.get("joao:consentchange");
      if (listener) listener();
    },
    window,
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

test("does not load HighLevel tracking before optional measurement consent", async () => {
  const page = harness(
    { analytics_storage: "denied", ad_storage: "denied" },
    Promise.resolve({ country: "DE", policy: "strict" }),
  );
  await flushPromises();
  assert.equal(page.appended.length, 0);
  assert.equal(page.window.joaoCallTrackingStarted, undefined);
});

test("loads the pool and session scripts once after consent is granted", async () => {
  const page = harness(
    { analytics_storage: "denied", ad_storage: "denied" },
    Promise.resolve({ country: "DE", policy: "strict" }),
  );
  await flushPromises();
  page.window.joaoConsentState = {
    analytics_storage: "granted",
    ad_storage: "denied",
  };
  page.dispatchConsent();
  assert.equal(page.appended.length, 2);
  assert.match(page.appended[0].src, /egnGWH5KUrbdDxk7HLSN\/number_pool[.]js$/);
  assert.match(page.appended[1].src, /appengine\/js\/user_session[.]js$/);
  assert.equal(page.window.joaoCallTrackingStarted, true);

  page.dispatchConsent();
  assert.equal(page.appended.length, 2);
});

test("loads after a granted regional default resolves", async () => {
  const page = harness(
    { analytics_storage: "granted", ad_storage: "denied" },
    Promise.resolve({ country: "US", policy: "regional_default" }),
  );
  await flushPromises();
  assert.equal(page.appended.length, 2);
  assert.match(page.appended[0].src, /number_pool[.]js$/);
  assert.match(page.appended[1].src, /user_session[.]js$/);
});
