# Live lifecycle acceptance — October 28–29, 2026

This is the current operational state. Earlier dated draft/checkpoint documents preserve historical investigation and authorization boundaries, not the current release status.

## Released configuration

- PR #145 merged at `b1f0031a09ad7dfe671346ee9727b814e4771d89`; reviewed and merged trees match.
- Six files deployed: `api/lead.php`, `api/lifecycle.php`, `assets/attribution.js`, `assets/campaign-site.js`, `assets/program-fit-quiz.js`, `assets/austin-program-fit-quiz.js`. The prior release verified 158 protected files unchanged; no HTML, blog, sitemap or `.htaccess` changes. Final origin hashes still match all six release targets; final Windows Chrome public asset hashes/HTTP guards equal post-deployment evidence.
- Full rollback archive: `/home1/joaocrus/releases/lifecycle-20261029T025844Z/full-root.tar.gz`. All 164 original file hashes, modes and ownership were verified before promotion.
- GA4 property `547238162`, web stream `15334887785`, measurement ID `G-EW2F2YKR3Y`; scoped MP secret remains outside webroot in protected configuration. MP is **enabled**. The final env SHA exactly equals the permanent-enable baseline; no fixture-only overrides or debug routing were introduced.
- Canonical TEXT contact fields `contact.ga_client_id` and `contact.ga_session_id` exist and are mapped. Three existing lifecycle reporter JSON bodies were saved, reloaded and exact-compared after adding these two bindings; original authentication and consent bindings remained unchanged.
- Native version history: Booked, Attended and Enrolled each current **v7 / Published**, immediately previous **v6 / Published**. Final workflow list shows all three Published and zero active enrollment in each reporter. No historical event replay or consent backfill occurred.
- GA4 is linked to Joao Ads client `7194154121`, not the manager. Personalized Advertising and embedded Analytics edit access remain disabled.

## Actual owned-fixture acceptance

Exactly one new owner-controlled synthetic identity was used. It was absent by exact email and owned-phone duplicate lookup immediately before testing. No pre-existing test/customer contact was reused.

1. Genuine Windows Chrome loaded the public contact page with HTTP 200. Optional browser analytics/advertising were explicitly allowed through the site's real privacy controls. Email permission was checked; customer-care and marketing SMS were both unchecked.
2. Two real public form submissions returned HTTP 200 with `accepted`, contact/opportunity acceptance and note acceptance. Both reached the actual thank-you route; both website Meta CAPI Lead requests were accepted. These are **two Lead requests**, not a claim of one provider event.
3. Exact CRM readback found **one contact, one opportunity, two submission notes**. First source remained `icdc_qa`; latest source became `icdc_qa_repeat`. Original browser client identity and session context were present in the contact. Persisted analytics/ad-storage/ad-user-data/email states were granted; SMS was `not_granted`.
4. Only that new opportunity was advanced once through Trial Booked, Trial Showed and Enrolled. The existing enrollment automation marked it won; no appointment, membership, payment or charge was created by the test.

### Reporter and downstream results

| Transition | Meta event | GA4 event | Native GHL webhook | Meta result | GA4 transport | GA4 downstream realtime eventCount |
|---|---|---|---|---|---|---|
| Trial Booked | Schedule | `trial_booked` | HTTP 200 / accepted | accepted | transport_accepted | 1 |
| Trial Showed | TrialAttended | `trial_attended` | HTTP 200 / accepted | accepted | transport_accepted | 1 |
| Enrolled | CompleteRegistration | `close_convert_lead` | HTTP 200 / accepted | accepted | transport_accepted | 1 |

Each native Event Details response was matched to its exact fixture/stage HMAC event ID and corresponding private origin ledger. The read-only GA4 realtime Data API for property `547238162` actually returned all three names with one event each. This is downstream Google receipt evidence, not merely an MP HTTP 204 claim. Meta's endpoint acceptance is proven; this cycle does **not** claim a new native Meta Test Events display or paid-ad attribution.

Offline CRM events deliberately omit an old session ID and invented engagement time. Genuine client identity is retained; original-session or paid-click attribution is not promised. No fake GCLID, ad click, backdated event or spend was introduced.

## Google Ads conversion action

One action was created from the **existing** starred `close_convert_lead` key event through GA4 Advertising → Conversion management. The Analytics review screen explicitly guaranteed Secondary/observation-only before Save. The Ads-native wizard's unsaved Primary candidate was abandoned without creating it.

Verified after save, reload and native Ads detail/table readbacks:

- Action: `Joao Crus BJJ (web) close_convert_lead`
- Conversion type ID: `7879865232`
- Source: Google Analytics (GA4); platform Website; event `close_convert_lead`; property Joao Crus BJJ, selected property ID `547238162` at import.
- Category: Converted leads; optimization **Secondary**; Count **One conversion**.
- Value: **Don't use a value**. Provider's resulting zero value is a no-value setting, not fictional revenue.
- Included in account-level goals: **No**. Tracking: No recent conversions at readback. Click window 90 days; engaged-view window 3 days; data-driven / Google paid channels.
- Status **All**, exactly **1–3 of 3**: incumbent `Form` remains Primary / Every / 30 days / account-level Yes; incumbent `Lead form - Submit` remains Primary / One / 1 day / account-level Yes. No duplicate or removed lifecycle action was added.

No campaign, budget, bidding setting, Primary action, account-default goal, enhanced-conversion terms, Google Signals or personalization setting was changed. Import receipt is configuration acceptance; test activity predates import and has no paid click, so zero Ads credit is expected, not a defect or proof of paid attribution.

## Cleanup and historical notice

- Privately archived exact contact, notes, tasks, appointments and opportunity (all API HTTP 200), complete native conversation/message list (seven records, `nextPage=false`), both full individual email messages, and all ten visible past workflows with no active entries. The regular conversations API and MCP returned 401; native read-only DevTools **Copy response**, not credentials or request replay, provided the missing archive.
- Two customer emails to the owned alias were sent by existing approved workflows. The other five conversation records were type-28 opportunity activities. **No SMS** appeared in the complete message list. Payment/subscription/invoice panels were empty.
- Deleted only the new exact-ID contact after verifying the exact alias in the native confirmation. Cascade cleanup verified: contact GET **400 / not found**, opportunity GET **404**, exact email and owned-phone duplicate GETs **200 / no match**. Earlier retained fixtures were not selected for deletion.
- The original incomplete population export was not upgraded into a fabricated account census. Cleanup proof is exact identity/object readback, not a whole-account collateral-object audit.
- After the new Attended native HTTP 200 success, acknowledged only its historical October 15 notice. Reloaded review list now shows **Needs review (0)**. Its historical invalid-consent request/root cause remains **unproven**; no consent was manufactured to clear it.
- Private fixture evidence remains outside Git in a mode-0700 directory with mode-0600 files. No production debug/test overrides require restoration; permanent MP configuration remains enabled.

## Verification and evidence

Prior exact-release checks remain valid: Node **421/421**, Python **66/66**, PHP **92 assertions** plus **6 identity-lock checks**, merged fast Node **26/26**, production validator **5984 checks / 44 routes**. No source/runtime code changed during acceptance; no claim of rerunning the full suite is made.

Sanitized local evidence is under `/home/d1360/joao-lifecycle-repair-current/`: `booked-native-success.json`, `attended-native-success.json`, `enrolled-native-success.json`, `ga4-live-realtime-receipt.json`, `ads-secondary-details-readback.json`, `ads-secondary-final-inventory.json`, three `*-native-version-history.json` files, `attended-notice-final-readback.json`, `workflow-final-readback.json`, `config-final-readback.json`, `origin-final-readback.json`, and `public-final.json`. Raw fixture/history evidence stays private under the separately protected directory, not in repository artifacts.

Known operational issue: fresh SSH connections intermittently timed out; a bounded reconnect recovered access and an existing-authorized multiplexed SSH channel completed exact reads. It was not an owner permission/attestation gate. No WAF/ModSecurity exception or visitor impersonation was used.

Synthetic provider events cannot be represented as real enrollment performance. Exclude this owned QA cycle from customer/acquisition reporting. Paid attribution and a new native Meta deduplication-rate proof remain outside what this test establishes.
