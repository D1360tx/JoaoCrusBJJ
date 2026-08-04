const assert = require("node:assert/strict");
const test = require("node:test");
const policy = require("../site/assets/consent-policy.js");

test("requires opt-in in the EEA, UK, and Switzerland", () => {
  for (const country of ["AT", "DE", "FR", "IE", "IS", "LI", "NO", "GB", "CH"]) {
    assert.equal(policy.policyForCountry(country), "opt_in", country);
  }
});

test("uses standard analytics behavior for known non-strict countries", () => {
  for (const country of ["US", "CA", "MX", "BR", "JP", "AU"]) {
    assert.equal(policy.policyForCountry(country), "standard", country);
  }
});

test("fails strict when the country is missing, malformed, or not recognized", () => {
  assert.equal(policy.KNOWN_COUNTRIES.length, 249);
  assert.equal(new Set(policy.KNOWN_COUNTRIES).size, 249);
  for (const country of ["", null, "USA", "ZZ", "XX", "EU", "UK"]) {
    assert.equal(policy.policyForCountry(country), "unknown", String(country));
    assert.deepEqual(policy.regionResult(country), { country: "", policy: "unknown" });
  }
});

test("explicit choices override the regional default", () => {
  assert.equal(policy.analyticsConsent("", "standard"), "granted");
  assert.equal(policy.analyticsConsent("", "opt_in"), "denied");
  assert.equal(policy.analyticsConsent("", "unknown"), "denied");
  assert.equal(policy.analyticsConsent("analytics_denied", "standard"), "denied");
  assert.equal(policy.analyticsConsent("analytics_granted", "opt_in"), "granted");
});

test("region lookup returns only normalized country policy data", async () => {
  let request;
  const result = await policy.detectRegion(async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ ip: "203.0.113.10", country: "us" }) };
  }, 1000);

  assert.deepEqual(result, { country: "US", policy: "standard" });
  assert.equal(request.url, policy.REGION_ENDPOINT);
  assert.equal(request.options.credentials, "omit");
  assert.equal(request.options.cache, "no-store");
  assert.equal(request.options.referrerPolicy, "no-referrer");
  assert.equal(Object.prototype.hasOwnProperty.call(result, "ip"), false);
});

test("region lookup failure returns the strict unknown fallback", async () => {
  const failed = await policy.detectRegion(async () => {
    throw new Error("offline");
  }, 1000);
  assert.deepEqual(failed, { country: "", policy: "unknown" });

  const invalid = await policy.detectRegion(async () => ({
    ok: true,
    json: async () => ({ country: "" }),
  }), 1000);
  assert.deepEqual(invalid, { country: "", policy: "unknown" });
});
