# Biweekly GSC Query Opportunity Loop

Run this workflow every two weeks. It turns a Google Search Console export into a review queue. It does **not** publish pages or request indexing.

## Data collection

### Durable automated path

The production automation uses **keyless Google Workload Identity Federation**:

1. Hermes dispatches `.github/workflows/gsc-opportunity-report.yml` through the authenticated GitHub CLI.
2. GitHub Actions presents a short-lived OIDC identity restricted to `D1360tx/JoaoCrusBJJ`.
3. Google exchanges it for the `joao-gsc-reader@woven-nimbus-489418-c3.iam.gserviceaccount.com` identity.
4. The workflow requests only `webmasters.readonly`, runs deterministic tests, generates the report, and uploads a seven-day artifact.
5. `scripts/run_gsc_report_via_github.py` correlates the exact workflow run, requires a successful conclusion and non-empty artifact, and writes the report locally.

Run locally with:

```bash
python3 scripts/run_gsc_report_via_github.py \
  --output /tmp/joao-gsc-opportunities.md
```

This path stores no Google refresh token or service-account key locally. Google organization policy continues to block static service-account key creation.

### Direct short-lived-token path

For controlled diagnostics, a caller may still mint a short-lived read-only token outside the repository and run:

```bash
GSC_ACCESS_TOKEN='short-lived-token' python3 scripts/gsc_opportunity_report.py
```

### Safe manual fallback

1. In Search Console, open **Performance > Search results**.
2. Select the comparison window and export query/page data as CSV.
3. Ensure the CSV includes `Query`, `Page`, `Clicks`, `Impressions`, `CTR`, and `Position`.
4. Run:

```bash
python3 scripts/gsc_opportunity_report.py \
  --csv /path/to/search-console.csv \
  --start YYYY-MM-DD \
  --end YYYY-MM-DD
```

Reports are written to `reports/gsc/opportunities-YYYY-MM-DD.md` by default.

## Automated decisions

- Groups `Crus/Cruz`, `Joao/João`, and `BJJ/jiu-jitsu/jiu jitsu` variants.
- Keeps queries with impressions and average positions 4-20.
- Preserves the ranking page when page data is available.
- Compares query terms with local page titles and H1s for cannibalization clues.
- Labels each group `OPTIMIZE`, `CREATE`, `REVIEW`, or `IGNORE`.

## Human approval gate

Before changing a page:

1. Confirm the query matches a real program, local need, or parent question.
2. Inspect the ranking URL and GSC's Pages dimension.
3. Prefer improving the current ranking page when it already owns the intent.
4. Create a new URL only when the intent is distinct and no existing page should own it.
5. Keep review builds `noindex,nofollow` until Diego approves publication.
6. Record the final choice and compare performance after indexing.

## Scheduling

The recurring Hermes job should collect live data, run this script, summarize only meaningful position 4-20 opportunities, and deliver the decision queue for approval. It must stay silent or report a blocker when read-only GSC access is unavailable. It must never publish, merge, deploy, or request indexing automatically.
