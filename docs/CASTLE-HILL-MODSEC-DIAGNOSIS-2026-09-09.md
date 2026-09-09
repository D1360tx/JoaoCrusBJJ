# Bluehost lead POST diagnosis — 2026-09-09 UTC

## Current outcome: supported UA paths verified; Linux residual accepted

The user explicitly authorized exactly one replacement synthetic submission with Windows browser/user-agent and accepted the Linux-desktop-only WAF limitation as **non-launch-blocking**. The replacement passed the actual live landing → embedded quiz → submit UI using Playwright Chromium on WSL with a Windows UA. HTTP 200 with contact/opportunity/note/CAPI accepted; exact CRM and analytics evidence is in [the hardened release certificate](CASTLE-HILL-HARDENED-RELEASE-2026-09-09.md). This does **not** claim native Windows or physical-device certification.

| UA path | Latest evidence | Scope |
|---|---|---|
| Windows Chromium | Valid UI submission HTTP 200, accepted CRM + GA4 + paired Meta | One authorized replacement; no repeat |
| macOS Chromium | HTTP 400 JSON `accepted:false`, `Invalid form.` | Fixed empty-object control only |
| iOS Safari | HTTP 400 JSON `accepted:false`, `Invalid form.` | Fixed empty-object control only |
| Android Chromium | HTTP 400 JSON `accepted:false`, `Invalid form.` | Fixed empty-object control only |
| Linux desktop Chromium | HTTP 406 Mod_Security HTML | Same original UA; residual rule 900401 |

The four new invalid-only controls contained `{}` and cannot create a lead. They prove UA-path reachability/rejection, not full mobile or native-OS E2E. Only **one valid replacement POST** occurred: request `d4a28f30-ce91-482c-991c-d195f461cece`, event `lead_d4a28f30-ce91-482c-991c-d195f461cece`, contact `zFGHIX1kLASZg2nLvEFH`, opportunity `OxJ4tQ9AizMt78PfzIZK`. No second replacement, security-rule exception, production code/env change or Meta write. Campaign, ad set and all 11 ads remain PAUSED / PAUSED.

Linux compatibility remains a Bluehost follow-up, not a gate to the separately authorized supported-path launch. Do not extrapolate that rule 900401 blocks every Linux browser or that all other native platforms are fully tested: the evidence isolates the tested UA signatures. The scoped remediation advice below remains valid; there is no permission to disable WAF globally.

## Historical diagnosis: hosting-level fix blocked, production restored

The block is **not all JSON POSTs**. The exact Linux Chromium User-Agent from the consumed synthetic attempt triggers Bluehost rule **900401**, `PHP Spam Botnet`, phase 1, `/opt/mod_security/hg_rules.conf` line 187. A Windows Chromium User-Agent with the same route, origin, referer, JSON content type and `{}` body reaches PHP and returns 400 JSON `accepted:false`, `Invalid form.`. This is diagnostic contrast, not permission to spoof visitor browsers or claim Linux compatibility fixed.

Exact original WAF event: `aqDi0NPLJRF-sTdLo-Aw9gAAjgw` at server time September 8 22:38:40 (September 9 04:38:40 UTC). Harmless reproduction event: `aqDlIsF9lXjVtbYIQhHHKwAA-jM`. Earlier Python/fake-Mozilla probes separately hit 909111 and 900095; neither rule is the real-browser blocker and neither should be excluded.

Read-only account UAPI `ModSecurity list_domains` returns `You do not have the feature “modsecurity”.` The rule file itself is permission-denied. Apache error-log entries are readable and establish the exact rule/phase, but not the entire chained predicate. Do not claim the complete internal rule is known.

## Backup-first scoped trial and rollback

- Created and integrity-verified `/home1/joaocrus/releases/castle-pre-modsec-20260909.tar.gz`, mode 0600, SHA-256 `dfb53f539169b9df77a2b53145a90dcfd42b711f97aa989f0477dead08c383c8`.
- Live/source `.htaccess` baseline matched SHA-256 `75e4f166bb8d9810f932023a478ec2b76c7d3d18355d0bbfaf4a1b8c209c57d5`.
- Trial added only `SecRuleRemoveById 900401` inside an exact `REQUEST_URI == '/api/lead.php'` Apache conditional and `security2_module` guard. It did **not** resolve the phase-1 block: `{}` still 406, event `aqDlWuekEvrW3PBz-E5dvwABI1Y`.
- Immediately restored the original `.htaccess`; remote SHA-256 independently returned the baseline above. Removed the ineffective source change. No WAF exception remains deployed. No global disable, transport change, env, endpoint, GTM or Meta mutation.

## Rejection-only application proof after rollback

The Windows Chromium control reached these existing PHP guards. All JSON results have `accepted:false`:

| Probe | HTTP | Result |
|---|---:|---|
| Empty object | 400 | Invalid form. |
| Malformed JSON | 400 | Invalid JSON request. |
| Wrong origin | 403 | Request origin is not allowed. |
| Wrong content type | 415 | JSON is required. |
| GET | 405 | Method not allowed. |
| Invalid request identifier | 400 | Invalid request identifier. |
| Honeypot | 202 | accepted:false; intentional silent rejection, not a lead acceptance |
| Original Linux Chromium, empty object | 406 | ModSecurity HTML; **still blocked** |

`scripts/probe_lead_rejections.py` contains only these fixed invalid payloads, never identity or a complete valid lead. Its nonzero status is intentional until Linux compatibility is repaired. The first run also exposed a probe expectation typo (`Invalid JSON.` versus actual `Invalid JSON request.`), corrected in source; the HTTP result was valid rejection throughout. Avoid repeated rapid runs: the ordinary application rate limit remains 8 attempts/15 minutes.

During the earlier diagnostic phase, no second synthetic lead submission occurred. Every transmitted body was empty, malformed, lacked required identity/consent, or contained the honeypot. Code-path inspection places each observed guard before contact/opportunity writes, email and CAPI; direct HTTP probes execute no browser analytics. No contact/opportunity/conversion was created by these probes. This is not downstream acceptance proof and does not replace the consumed test.

Fresh independent Meta MCP reads verified campaign `120251246135250072`, ad set `120251246144560072`, and the same 11 unique ad IDs listed in the hardened release audit all configured/effective PAUSED. No pagination next link was present. No Meta writes.

## Required Bluehost operator action

Ask Bluehost to investigate false positive **900401** for host `joaocrusbjj.com`, exact path `/api/lead.php`, using the event IDs above. Prefer correcting the specific false-positive predicate; otherwise place a **pre-rule phase-1 exclusion of only 900401, only this virtual host and exact path**, before the offending rule executes. Do not disable ModSecurity, exclude other IDs, or exempt the entire API directory. A late per-directory Apache conditional did not work and must not be represented as a fix.

After Bluehost changes it, rerun the fixed invalid-only probe suite using the original Linux UA and a real browser rejection request. Verify JSON 4xx, wrong origin/type/method/identifier and honeypot behavior, unchanged backend hashes and paused Meta state. No further synthetic submission without separate authorization. Production remains source release `8480f5c497f75c4e95569e4b92c992a3d42b5f3f`; no new working application release is claimed.
