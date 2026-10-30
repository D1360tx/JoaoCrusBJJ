# Retained CRM collector and historical reconciliation — methodology v2

This directory is a portable operational source archive, **not website code**. It does not load provider credentials, send messages, change CRM records, reconnect integrations, deploy to Bluehost, or schedule jobs.

## Source ownership / reproduction

- Canonical active collector: `~/.hermes/mcp/joao-ghl-operational`, local commit `57b2e6f8716f5e63357173f263bb60a7252a01c3`.
- `collector-57b2e6f.patch`: exact Git-format collector commit, including implementation, regression tests and rationale. Apply only in the corresponding adapter checkout after reviewing base compatibility (`git apply --check` / `git am` in an isolated checkout). Never apply it to the website root or the separately owned guarded-commit worktree.
- `control_plane.py`: exact active deterministic reporter source from `~/.hermes/workspaces/joao-marketing-control-plane/control_plane.py`; kept here because that runtime workspace is not a Git repository. This archive has no provider access. Its local CLI supports `validate`, `analyze`, `finalize`, `ingest`, `render`, `history`; only `ingest` writes its explicitly selected local SQLite DB. Use validate/finalize/render for a non-ingesting corrected revision.
- `test_control_plane.py`, `test_crm_coverage_reporting.py`: existing source regression suites. `test_history_revision.py`: additional QA-pruning/scope/nonmutation tests. All fixtures are unit-test inputs, never substitutes for provider evidence.
- `policy.json`: sanitized test policy with fixture identities and local-only delivery. **Not a production policy or campaign configuration.** Do not copy it over the runtime policy.

Run from this directory:

```sh
python -m unittest discover -v
python control_plane.py --help
```

Existing actual collection evidence is private and was reused; no additional full 1,360-note-collection read was needed. Adapter tests use mock HTTP transports; their POST/PUT log lines are test traffic, not live CRM writes.

## Verified collection versus immutable history

Actual native MCP and isolated stdio verification already completed: 1,360 contacts / 14 cursor pages; 66 opportunities; all 1,360 contact-note collections; 86 notes; zero read errors. Cold collection: 177.22 seconds. The old 500-contact cap displaced 50 website-tagged contacts behind recent imports. All 42 retained September request hashes and all 54 through the October 13 archive match current retained notes.

Retained counts (accepted submissions / window-created tagged contacts / unique submitters):

| America/Chicago period | Retained counts | Historical completeness |
|---|---|---|
| Aug 27–Sep 29 | 42 / 37 / 38 | Unresolved |
| Aug 27–Oct 29 | 71 / 62 / 63 | Unresolved |
| Oct 29 | 1 / 1 / 1 | Retained daily collection verified |

These are different metric grains, not interchangeable real-lead counts. Current stage, scheduled visit, attended trial and revenue are not equivalent. Neither unknown acquisition nor denied advertising consent may be relabeled direct/non-ad traffic.

## Versioned corrected baseline, not snapshot replacement

`reconciliation-v2-summary.json` records a new analytical revision and binds the untouched September 29 snapshot SHA-256:

`d6c62b3e29f66ba246d07e6cffaf4e179fe939e74c6af6852db826f9e67c34e6`

The immutable old snapshot remains 47 submissions / 39 window-created tagged contacts / 40 submitters. The new private ledger references that exact file and hash, current request rows, origin rows, archived-note identities and SHA-bound QA evidence. It does not overwrite a past snapshot, reduce an old economic row, assert a new floor or clear history by aggregate agreement.

## Exact historical classification result

All 44 distinct parseable launch-origin-only requests have a private row containing request hash, accepted origin timestamp, source period, current-note absence, archival paths/hashes, exact QA exclusion evidence where recovered, note identity where recovered, and uncertainty. The classification is **14 independently archive-bound accepted QA; 30 unresolved accepted intake requests**. These 30 are not asserted to be lost real leads, all QA, or all spam. Two previously identified late-October QA references remain within this conservative unresolved tier because their original independent archive was not rebound in this pass. Nine other requests have an older suspected-spam investigation; suspicion does not authorize a confirmed-QA or real-business classification.

September's ten origin-only requests now separate into six exact archive-bound QA and four unresolved early requests. The September 8 origin label uses America/Boise; it is September 9 in UTC/academy time and exactly matches an explicit controlled synthetic acceptance and archived note identity. The remaining early refs are `969b212de305d8a80c7e`, `c0e94fe4b0f5455fc4cc`, `ee505414b798552bee6b`, `5685e4c63f7ffcb98bb1`. A copied origin log is acceptance evidence, not independent identity/QA proof.

For the five September old-count delta candidates: four now have exact archived note identities (the pretest plus three Phase1 notes). The fifth request `55e14ea8e31b6e1aefb1` is bound to the exact controlled Phase1 contact's latest fields and explicit synthetic content, but its old note ID was not recovered. No complete original 47-note row export was found. The two removed created-contact identities have exact controlled-fixture provenance, but that is not a replacement for all missing note rows.

One additional accepted origin row has a **29-character non-UUID request identifier**, dated August 29 America/Boise. It is retained separately with row/request SHA-256, field structure and timestamp; it is neither normalized into a UUID nor silently dropped. All rows above require exact `event=accepted`; nonaccepted events are not promoted. Identical valid request UUIDs are deduplicated at request grain, not by identity/name/tag.

## Gates and remaining work

`collection_verified=true` does not imply `history_reconciled=true`. Multi-day historical completeness and cumulative economic decisions remain blocked/null. A verified daily scope does not clear an unresolved launch scope. Healthy provider access plus incomplete data recommends collector repair or receipt reconciliation; only actual authentication failure recommends connector restoration.

The remaining gap is unavailable historical identity/receipt evidence, not routine user permission. Additional archives may reduce uncertainty; absent them, report a definitively partial historical baseline or obtain an explicit owner decision about an evidence-limited analytical scope. Never mark full immutable-business-history reconciliation complete merely because counts fit.

Private local work: `~/joao-crm-coverage-repair-current/private-corrected-baseline-ledger-v2.json` plus hash-bound evidence index and structural malformed-row receipt, directory 0700 / files 0600. Those files contain private identifiers/paths and are deliberately **not committed**.
