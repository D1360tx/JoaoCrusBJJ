# Required release-test job (local, never waived by Vercel)

Vercel publishes a **static preview**, not the Bluehost PHP application. Its build job runs the static builder and complete preview artifact validator. `npm ci --omit=dev` installs from the lockfile without bringing a QA-only Chromium/PHP toolchain into that static job. There are no PHP functions or functional intake fallbacks on Vercel.

**Before any merge or Bluehost deployment, the exact final commit must pass this separate local release job. A green Vercel check alone is not release approval.** This is an operator-required release gate, not an automatically enforced GitHub required check. No acceptance test was removed, skipped, or replaced with a fake runtime. The job exports the exact Git commit and runs the complete Node suites in preview and production, real PHP dispatcher/booking behavior, intercepted Chromium tests, production SEO/build/artifact validator, all Python tests and emitted-PHP/changed-JS lint. Every execution runs with network denied and no production credentials. Missing native runtimes, installed dependencies or namespace support fail closed.

## Dependency preflight (network permitted for installation only)

On a dedicated local Linux QA workstation:

```sh
npm ci
npx playwright install chromium
python3 -m venv /private/path/joao-release-python
/private/path/joao-release-python/bin/pip install -r requirements/ga4-bridge.lock.txt
```

Provide a native PHP 8 CLI (an isolated distribution-package extraction is acceptable). Do not install or modify Bluehost runtimes. `unshare -Urn` must work; the runner asserts loopback only, no routes and ENETUNREACH before tests. Chromium needs its normal OS libraries installed during preflight, never during tests. Existing matching verified local tools may be reused. Never substitute fake PHP, install runtime dependencies inside the network-denied test job, inherit live credentials, skip tests or submit live fixtures.

## Exact-SHA execution

```sh
python3 scripts/test_release.py --sha <full-final-commit> \
  --php /private/path/native-php8-cli \
  --python /private/path/joao-release-python/bin/python \
  --evidence /private/path/unique-release-evidence-directory
```

The evidence directory must not already exist and must be outside the repository. `results.json` binds command exits to the full SHA; full per-command logs and the production `archive/dist/` are retained privately. Re-run after **any** head change, including documentation commits, and bind the candidate manifest to that exact production output. Prior green results do not transfer by assumption. Source SEO validation has seven separately reproduced baseline issues; do not confuse that existing source-only report with the passing full preview/production artifact validators.

No auto-deploy, GitHub merge, live POST, provider call, customer send or workflow mutation belongs to this job. Network-denied local fake-provider hooks exercise real dispatcher behavior, not downstream acceptance.
