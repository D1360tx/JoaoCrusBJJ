const assert = require("node:assert/strict");
const test = require("node:test");
const policy = require("../site/assets/consent-policy.js");

const V2_KEY = "joao_consent_v2";
const V1_KEY = "joao_consent_v1";
const GRANTED = {
  analytics_storage: "granted",
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
};
const DENIED = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

class MemoryStorage {
  constructor(initial = {}) { this.values = new Map(Object.entries(initial)); }
  getItem(key) { return this.values.get(key) || null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

function cookieDocument(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    get cookie() {
      return [...values.entries()].map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("; ");
    },
    set cookie(serialized) {
      const [pair, ...attributes] = String(serialized).split(";");
      const separator = pair.indexOf("=");
      const key = decodeURIComponent(pair.slice(0, separator));
      const value = decodeURIComponent(pair.slice(separator + 1));
      const expires = attributes.join(";");
      if (/Max-Age=0/i.test(expires)) values.delete(key);
      else values.set(key, value);
    },
  };
}

function record(revision, analytics, advertising) {
  return JSON.stringify({ version: 2, revision, analytics, advertising });
}

function context({ local = {}, session = {}, cookies = {} } = {}) {
  return {
    document: cookieDocument(cookies),
    localStorage: new MemoryStorage(local),
    sessionStorage: new MemoryStorage(session),
    location: { protocol: "https:" },
  };
}

test("requires opt-in in the EEA, UK, and Switzerland", () => {
  for (const country of ["AT", "DE", "FR", "IE", "IS", "LI", "NO", "GB", "CH"]) {
    assert.equal(policy.policyForCountry(country), "opt_in", country);
  }
});

test("uses standard opt-out behavior for known non-strict countries", () => {
  for (const country of ["US", "CA", "MX", "BR", "JP", "AU"]) {
    assert.equal(policy.policyForCountry(country), "standard", country);
    assert.deepEqual(policy.consentState("", "standard", false), GRANTED);
  }
});

test("fails strict when the country is missing, malformed, or unknown", () => {
  for (const country of ["", null, "USA", "ZZ", "XX", "EU", "UK"]) {
    assert.equal(policy.policyForCountry(country), "unknown", String(country));
    assert.deepEqual(policy.regionResult(country), { country: "", policy: "unknown" });
    assert.deepEqual(policy.consentState("", "unknown", false), DENIED);
  }
});

test("explicit granular choices override regional defaults", () => {
  assert.deepEqual(policy.consentState("all_denied", "standard", false), DENIED);
  assert.deepEqual(policy.consentState("all_granted", "opt_in", false), GRANTED);
  assert.deepEqual(policy.consentState("analytics_only", "standard", false), {
    analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
  });
  assert.deepEqual(policy.consentState("advertising_only", "opt_in", false), {
    analytics_storage: "denied", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted",
  });
});

test("GPC always denies advertising while retaining allowed analytics", () => {
  assert.deepEqual(policy.consentState("", "standard", true), {
    analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
  });
  assert.deepEqual(policy.consentState("all_granted", "opt_in", true), {
    analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
  });
  assert.deepEqual(policy.consentState("", "opt_in", true), DENIED);
});

test("legacy preferences migrate without expanding advertising consent", () => {
  const granted = context({ local: { [V1_KEY]: "analytics_granted" } });
  const denied = context({ cookies: { [V1_KEY]: "analytics_denied" } });
  assert.equal(policy.readChoice(granted, V2_KEY, V1_KEY), "analytics_only");
  assert.equal(policy.readChoice(denied, V2_KEY, V1_KEY), "all_denied");
});

test("validates the complete v2 record schema", () => {
  assert.deepEqual(policy.validRecord(record(7, "granted", "denied")), {
    version: 2, revision: 7, analytics: "granted", advertising: "denied",
  });
  for (const value of ["", "{}", "[]", "null", "not-json", JSON.stringify({ version: 2, revision: 0, analytics: "granted", advertising: "denied" }), JSON.stringify({ version: 2, revision: 1, analytics: "yes", advertising: "denied" })]) {
    assert.equal(policy.validRecord(value), null, value);
  }
});

test("the highest revision wins across stores", () => {
  const ctx = context({
    cookies: { [V2_KEY]: record(1, "denied", "denied") },
    local: { [V2_KEY]: record(3, "granted", "granted") },
    session: { [V2_KEY]: record(2, "granted", "denied") },
  });
  assert.equal(policy.readChoice(ctx, V2_KEY, V1_KEY), "all_granted");
  assert.equal(policy.readRecord(ctx, V2_KEY).revision, 3);
});

test("equal-revision conflicts resolve with denial winning per category", () => {
  const ctx = context({
    local: { [V2_KEY]: record(4, "granted", "denied") },
    session: { [V2_KEY]: record(4, "denied", "granted") },
  });
  assert.equal(policy.readChoice(ctx, V2_KEY, V1_KEY), "all_denied");
});

test("a valid v2 preference takes precedence over stale v1 data", () => {
  const ctx = context({
    local: { [V2_KEY]: record(2, "granted", "granted"), [V1_KEY]: "analytics_denied" },
    cookies: { [V1_KEY]: "analytics_denied" },
  });
  assert.equal(policy.readChoice(ctx, V2_KEY, V1_KEY), "all_granted");
});

test("saving increments the revision, verifies the write, and clears legacy data", () => {
  const ctx = context({
    local: { [V2_KEY]: record(5, "denied", "denied"), [V1_KEY]: "analytics_denied" },
    session: { [V1_KEY]: "analytics_denied" },
    cookies: { [V1_KEY]: "analytics_denied" },
  });
  assert.equal(policy.saveChoice(ctx, V2_KEY, "all_granted", V1_KEY), true);
  assert.equal(policy.readChoice(ctx, V2_KEY, V1_KEY), "all_granted");
  assert.equal(policy.readRecord(ctx, V2_KEY).revision, 6);
  assert.equal(ctx.localStorage.getItem(V1_KEY), null);
  assert.equal(ctx.sessionStorage.getItem(V1_KEY), null);
  assert.ok(!ctx.document.cookie.includes(V1_KEY));
});

test("a stale unwritable denial cannot defeat a newer writable revision", () => {
  const ctx = context({
    cookies: { [V2_KEY]: record(1, "denied", "denied") },
    local: { [V2_KEY]: record(2, "granted", "granted") },
  });
  Object.defineProperty(ctx.document, "cookie", {
    get() { return `${encodeURIComponent(V2_KEY)}=${encodeURIComponent(record(1, "denied", "denied"))}`; },
    set() { throw new Error("blocked"); },
  });
  assert.equal(policy.readChoice(ctx, V2_KEY, V1_KEY), "all_granted");
  assert.equal(policy.saveChoice(ctx, V2_KEY, "analytics_only", V1_KEY), true);
  assert.equal(policy.readChoice(ctx, V2_KEY, V1_KEY), "analytics_only");
  assert.equal(policy.readRecord(ctx, V2_KEY).revision, 3);
});

test("reports failure when no consent store is writable", () => {
  const blocked = {
    getItem() { return null; }, setItem() { throw new Error("blocked"); }, removeItem() {},
  };
  const ctx = {
    document: { get cookie() { return ""; }, set cookie(value) { throw new Error(`blocked:${value}`); } },
    localStorage: blocked,
    sessionStorage: blocked,
    location: { protocol: "https:" },
  };
  assert.equal(policy.saveChoice(ctx, V2_KEY, "all_denied", V1_KEY), false);
  assert.equal(policy.readChoice(ctx, V2_KEY, V1_KEY), "");
});

test("region lookup returns normalized country data without retaining IP", async () => {
  const result = await policy.detectRegion(async (url, options) => {
    assert.equal(url, policy.REGION_ENDPOINT);
    assert.equal(options.credentials, "omit");
    assert.equal(options.referrerPolicy, "no-referrer");
    return { ok: true, async json() { return { country: "us", ip: "203.0.113.10" }; } };
  }, 100);
  assert.deepEqual(result, { country: "US", policy: "standard" });
  assert.equal("ip" in result, false);
});

test("region lookup failure returns the strict unknown fallback", async () => {
  assert.deepEqual(await policy.detectRegion(async () => { throw new Error("offline"); }, 100), {
    country: "", policy: "unknown",
  });
});
