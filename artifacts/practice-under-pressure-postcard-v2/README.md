# Practice Under Pressure Postcard V2

## Review status

This is a two-sided 6 × 9 inch review proof matching the canonical `/practice-under-pressure/` landing page. It preserves the earlier Found the Flyer postcard as a separate V1 concept.

## QR destination

```text
https://joaocrusbjj.com/practice-under-pressure/?utm_source=car_flyer&utm_medium=offline&utm_campaign=found_the_flyer&utm_content=postcard_v2
```

| Parameter | Value | Purpose |
|---|---|---|
| `utm_source` | `car_flyer` | Physical flyer/postcard source |
| `utm_medium` | `offline` | GA4-recognizable offline channel label |
| `utm_campaign` | `found_the_flyer` | Existing QR campaign family |
| `utm_content` | `postcard_v2` | Distinguishes this matched postcard batch from prior creative |

For meaningful placement or print-batch tests, generate a new QR with a distinct non-personal `utm_content`, such as `postcard_v2_castle_hill` or `postcard_v2_batch_02`. Do not reuse one printed QR across variants if variant-level attribution matters.

## Files

- Source: `site/campaign/practice-under-pressure-postcard-v2.html`
- Print CSS: `site/assets/practice-under-pressure-postcard-v2.css`
- QR generator: `scripts/generate_practice_pressure_postcard_v2_qr.py`
- Exact encoded URL: `site/assets/practice-under-pressure-postcard-v2/qr-destination.txt`
- SVG and PNG QR: `site/assets/practice-under-pressure-postcard-v2/`
- Two-page PDF review proof: `artifacts/practice-under-pressure-postcard-v2/print-proof.pdf`
- Front/back PNG review proofs: `artifacts/practice-under-pressure-postcard-v2/`

## Production note

The supplied PDF is a browser-rendered review proof at exact 9 × 6 inch page dimensions. Before commercial printing, confirm the printer's required bleed, safe area, color profile, paper stock, duplex orientation, and PDF standard. Add bleed in a printer-specific production export rather than enlarging this reviewed layout by assumption.
