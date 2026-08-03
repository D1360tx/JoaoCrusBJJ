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
}

function context(url, referrer = "", localStorage = new MemoryStorage(), sessionStorage = new MemoryStorage()) {
  const parsed = new URL(url);
  return {
    document: { referrer },
    location: {
      href: parsed.href,
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      search: parsed.search,
    },
    localStorage,
    sessionStorage,
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
  };
  const result = attribution.capture(denied, START);
  assert.equal(result.first_touch.utm_source, "newsletter");
  assert.equal(result.last_touch.utm_medium, "email");
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
