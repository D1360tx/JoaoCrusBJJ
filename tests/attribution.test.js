const assert = require("node:assert/strict");
const test = require("node:test");
const attribution = require("../site/assets/attribution.js");

class MemoryStorage {
  constructor(seed = {}) {
    this.values = { ...seed };
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.values, key) ? this.values[key] : null;
  }
  setItem(key, value) {
    this.values[key] = String(value);
  }
  removeItem(key) {
    delete this.values[key];
  }
}

function context(url, referrer = "", localStorage = new MemoryStorage(), sessionStorage = new MemoryStorage(), consent = "granted", adConsent = "denied", adUserData = "denied", cookie = "") {
  const parsed = new URL(url);
  return {
    document: { referrer, cookie },
    location: {
      href: parsed.href,
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      search: parsed.search,
    },
    localStorage,
    sessionStorage,
    joaoConsentState: { analytics_storage: consent, ad_storage: adConsent, ad_user_data: adUserData },
  };
}

const DAY = 24 * 60 * 60 * 1000;
const START = Date.UTC(2026, 7, 3, 15, 0, 0);

test("preserves first and last non-direct touch across direct return visits", () => {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  const first = attribution.capture(
    context(
      "https://joaocrusbjj.com/?utm_source=facebook&utm_medium=paid_social&utm_campaign=fall_enrollment&fbclid=abc123",
      "https://facebook.com/",
      local,
      session,
    ),
    START,
  );
  assert.equal(first.first_touch.utm_source, "facebook");
  assert.equal(first.last_touch.utm_medium, "paid_social");
  assert.equal(first.last_touch.fbclid, "abc123");

  const directReturn = attribution.capture(
    context("https://joaocrusbjj.com/classes-schedule/", "", local, new MemoryStorage()),
    START + 7 * DAY,
  );
  assert.equal(directReturn.first_touch.utm_campaign, "fall_enrollment");
  assert.equal(directReturn.last_touch.utm_campaign, "fall_enrollment");
  assert.equal(directReturn.last_touch.landing_page, "/");
});

test("updates last touch without overwriting first touch", () => {
  const local = new MemoryStorage();
  attribution.capture(
    context("https://joaocrusbjj.com/?utm_source=google&utm_medium=cpc&utm_campaign=brand", "", local),
    START,
  );
  const result = attribution.capture(
    context("https://joaocrusbjj.com/adults-program/?utm_source=newsletter&utm_medium=email&utm_campaign=august", "", local),
    START + DAY,
  );
  assert.equal(result.first_touch.utm_source, "google");
  assert.equal(result.last_touch.utm_source, "newsletter");
  assert.equal(result.last_touch.utm_medium, "email");
  assert.equal(result.utm_campaign, "august");
});

test("external referrals update last touch while same-site navigation does not", () => {
  const local = new MemoryStorage();
  attribution.capture(context("https://joaocrusbjj.com/", "", local), START);
  const referred = attribution.capture(
    context("https://joaocrusbjj.com/locations/", "https://www.google.com/search?q=bjj", local),
    START + DAY,
  );
  assert.equal(referred.last_touch.referrer_host, "www.google.com");
  const internal = attribution.capture(
    context("https://joaocrusbjj.com/contact/", "https://joaocrusbjj.com/locations/", local),
    START + 2 * DAY,
  );
  assert.equal(internal.last_touch.referrer_host, "www.google.com");
});

test("expires attribution after 90 days and starts a new record", () => {
  const local = new MemoryStorage();
  attribution.capture(
    context("https://joaocrusbjj.com/?utm_source=facebook&utm_medium=paid_social", "", local),
    START,
  );
  const result = attribution.capture(
    context("https://joaocrusbjj.com/little-champions/", "", local),
    START + 91 * DAY,
  );
  assert.equal(result.first_touch.utm_source, undefined);
  assert.equal(result.first_touch.landing_page, "/little-champions/");
  assert.equal(result.last_touch.landing_page, "/little-champions/");
});

test("does not extend an original first touch beyond its own 90-day window", () => {
  const local = new MemoryStorage();
  attribution.capture(
    context("https://joaocrusbjj.com/?utm_source=facebook&utm_medium=paid_social", "", local),
    START,
  );
  attribution.capture(
    context("https://joaocrusbjj.com/?utm_source=newsletter&utm_medium=email", "", local),
    START + 89 * DAY,
  );
  const result = attribution.capture(
    context("https://joaocrusbjj.com/contact/", "", local),
    START + 91 * DAY,
  );
  assert.equal(result.first_touch.utm_source, "newsletter");
  assert.equal(result.last_touch.utm_source, "newsletter");
});

test("migrates the previous session-only attribution record", () => {
  const local = new MemoryStorage();
  const session = new MemoryStorage({
    joao_attribution: JSON.stringify({
      utm_source: "instagram",
      utm_medium: "paid_social",
      landing_page: "/kids-bjj/",
    }),
  });
  const result = attribution.capture(
    context("https://joaocrusbjj.com/contact/", "", local, session),
    START,
  );
  assert.equal(result.first_touch.utm_source, "instagram");
  assert.equal(result.last_touch.landing_page, "/kids-bjj/");
});

test("keeps migrated first touch but honors a new campaign as last touch", () => {
  const session = new MemoryStorage({
    joao_attribution: JSON.stringify({
      utm_source: "instagram",
      utm_medium: "social",
      landing_page: "/kids-bjj/",
    }),
  });
  const result = attribution.capture(
    context(
      "https://joaocrusbjj.com/?utm_source=google&utm_medium=cpc&utm_campaign=brand",
      "",
      new MemoryStorage(),
      session,
    ),
    START,
  );
  assert.equal(result.first_touch.utm_source, "instagram");
  assert.equal(result.last_touch.utm_source, "google");
});

test("does not revive expired attribution from a long-lived session", () => {
  const expired = {
    version: 2,
    first_touch: { utm_source: "old_campaign", landing_page: "/" },
    last_touch: { utm_source: "old_campaign", landing_page: "/" },
    expires_at: START - 1,
  };
  const local = new MemoryStorage({
    [attribution.STORAGE_KEY]: JSON.stringify(expired),
  });
  const session = new MemoryStorage({
    joao_attribution: JSON.stringify(expired.last_touch),
  });
  const result = attribution.capture(
    context("https://joaocrusbjj.com/adults-program/", "", local, session),
    START,
  );
  assert.equal(result.first_touch.utm_source, undefined);
  assert.equal(result.first_touch.landing_page, "/adults-program/");
});

test("continues without persistence when browser storage is denied", () => {
  const parsed = new URL("https://joaocrusbjj.com/?utm_source=newsletter&utm_medium=email");
  const denied = {
    document: { referrer: "" },
    location: {
      href: parsed.href,
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      search: parsed.search,
    },
    get localStorage() {
      throw new Error("denied");
    },
    get sessionStorage() {
      throw new Error("denied");
    },
    joaoConsentState: { analytics_storage: "granted" },
  };
  const result = attribution.capture(denied, START);
  assert.equal(result.first_touch.utm_source, "newsletter");
  assert.equal(result.last_touch.utm_medium, "email");
});

test("does not read, persist, or return campaign data before optional measurement consent", () => {
  const stored = {
    version: 2,
    first_touch: { utm_source: "stored", captured_at: new Date(START).toISOString() },
    last_touch: { utm_source: "stored", captured_at: new Date(START).toISOString() },
  };
  const local = new MemoryStorage({ [attribution.STORAGE_KEY]: JSON.stringify(stored) });
  const session = new MemoryStorage();
  const result = attribution.capture(
    context(
      "https://joaocrusbjj.com/?utm_source=current&utm_medium=paid_social",
      "",
      local,
      session,
      "denied",
    ),
    START + DAY,
  );
  assert.deepEqual(result.first_touch, {});
  assert.deepEqual(result.last_touch, {});
  assert.equal(JSON.parse(local.getItem(attribution.STORAGE_KEY)).first_touch.utm_source, "stored");
  assert.equal(session.getItem("joao_attribution"), null);
});

test("never touches storage properties while all optional measurement is denied", () => {
  const parsed = new URL("https://joaocrusbjj.com/?utm_source=current");
  const denied = {
    document: { referrer: "" },
    location: {
      href: parsed.href,
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      search: parsed.search,
    },
    get localStorage() {
      throw new Error("localStorage must not be read");
    },
    get sessionStorage() {
      throw new Error("sessionStorage must not be read");
    },
    joaoConsentState: { analytics_storage: "denied" },
  };
  const result = attribution.capture(denied, START);
  assert.deepEqual(result.first_touch, {});
  assert.deepEqual(result.last_touch, {});
});

test("advertising-only consent permits non-PII campaign attribution persistence", () => {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  const result = attribution.capture(
    context(
      "https://joaocrusbjj.com/?utm_source=facebook&utm_medium=paid_social&fbclid=qa123",
      "",
      local,
      session,
      "denied",
      "granted",
    ),
    START,
  );
  assert.equal(result.first_touch.utm_source, "facebook");
  assert.equal(result.last_touch.fbclid, "qa123");
  assert.ok(local.getItem(attribution.STORAGE_KEY));
});

test("captures Meta campaign, ad set, ad, and placement macros for CRM attribution", () => {
  const result = attribution.capture(
    context(
      "https://joaocrusbjj.com/kids-first-class/?utm_source=facebook&utm_medium=paid_social&utm_campaign=kids_fall&campaign_id=1201&campaign_name=Kids%20Fall&adset_id=2202&adset_name=Parents%203-7&ad_id=3303&ad_name=Tap%20Means%20Stop&placement=instagram_feed&site_source_name=ig",
      "",
      new MemoryStorage(),
      new MemoryStorage(),
      "granted",
      "granted",
    ),
    START,
  );
  assert.equal(result.last_touch.campaign_id, "1201");
  assert.equal(result.last_touch.campaign_name, "Kids Fall");
  assert.equal(result.last_touch.adset_id, "2202");
  assert.equal(result.last_touch.adset_name, "Parents 3-7");
  assert.equal(result.last_touch.ad_id, "3303");
  assert.equal(result.last_touch.ad_name, "Tap Means Stop");
  assert.equal(result.last_touch.placement, "instagram_feed");
  assert.equal(result.last_touch.site_source_name, "ig");
});

test("rejects PII-bearing and oversized campaign values", () => {
  const result = attribution.capture(
    context(
      "https://joaocrusbjj.com/?utm_source=facebook&utm_content=parent%40example.com&utm_term=%2B1%20512-555-0199&utm_campaign=" + "x".repeat(161),
    ),
    START,
  );
  assert.equal(result.utm_source, "facebook");
  assert.equal(result.utm_content, undefined);
  assert.equal(result.utm_term, undefined);
  assert.equal(result.utm_campaign, undefined);
  assert.equal(attribution.sanitizeCampaignValue("safe-creative-2"), "safe-creative-2");
});

test("builds consent-gated Meta matching context from first-party cookies and fbclid", () => {
  const ctx = context(
    "https://joaocrusbjj.com/program-finder/quiz/?fbclid=click_abc123",
    "",
    new MemoryStorage(),
    new MemoryStorage(),
    "granted",
    "granted",
    "granted",
    "_fbp=fb.1.1787880000.browser_abc123; _fbc=fb.1.1787880000.click_cookie_123",
  );
  const captured = attribution.capture(ctx, START);
  assert.deepEqual(attribution.metaContext(ctx, captured), {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    fbp: "fb.1.1787880000.browser_abc123",
    fbc: "fb.1.1787880000.click_cookie_123",
  });
});

test("derives fbc from captured fbclid but sends no identifiers without advertising consent", () => {
  const granted = context(
    "https://joaocrusbjj.com/?fbclid=derived_click_123",
    "",
    new MemoryStorage(),
    new MemoryStorage(),
    "granted",
    "granted",
    "granted",
  );
  const captured = attribution.capture(granted, START);
  assert.equal(attribution.metaContext(granted, captured).fbc, `fb.1.${START}.derived_click_123`);

  const denied = context("https://joaocrusbjj.com/", "", new MemoryStorage(), new MemoryStorage(), "granted", "denied", "denied", "_fbp=fb.1.1787880000.browser_abc123");
  assert.deepEqual(attribution.metaContext(denied, captured), {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
  });
});

test("clears durable attribution when all optional measurement consent is withdrawn", () => {
  const local = new MemoryStorage({ [attribution.STORAGE_KEY]: "stored" });
  local.setItem("joao_attribution", "legacy-local");
  const session = new MemoryStorage({ joao_attribution: "stored", [attribution.STORAGE_KEY]: "stored-session" });
  attribution.clear(context("https://joaocrusbjj.com/", "", local, session, "denied"));
  assert.equal(local.getItem(attribution.STORAGE_KEY), null);
  assert.equal(local.getItem("joao_attribution"), null);
  assert.equal(session.getItem("joao_attribution"), null);
  assert.equal(session.getItem(attribution.STORAGE_KEY), null);
});

test("uses session persistence when localStorage alone is denied", () => {
  const session = new MemoryStorage();
  function deniedLocal(url) {
    const base = context(url, "", null, session);
    Object.defineProperty(base, "localStorage", { get() { throw new Error("denied"); } });
    return base;
  }
  attribution.capture(
    deniedLocal("https://joaocrusbjj.com/?utm_source=instagram&utm_medium=paid_social"),
    START,
  );
  const result = attribution.capture(
    deniedLocal("https://joaocrusbjj.com/contact/"),
    START + DAY,
  );
  assert.equal(result.first_touch.utm_source, "instagram");
  assert.equal(result.last_touch.utm_medium, "paid_social");
});

test("uses local persistence when sessionStorage alone is denied", () => {
  const local = new MemoryStorage();
  function deniedSession(url) {
    const base = context(url, "", local, null);
    Object.defineProperty(base, "sessionStorage", { get() { throw new Error("denied"); } });
    return base;
  }
  attribution.capture(
    deniedSession("https://joaocrusbjj.com/?utm_source=google&utm_medium=cpc"),
    START,
  );
  const result = attribution.capture(
    deniedSession("https://joaocrusbjj.com/adults-program/"),
    START + DAY,
  );
  assert.equal(result.first_touch.utm_source, "google");
  assert.equal(result.last_touch.utm_medium, "cpc");
});
