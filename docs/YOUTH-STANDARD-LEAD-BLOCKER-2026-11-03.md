# Youth standard Lead optimization: authorized, blocked by Meta

Verified November 3, 2026, 21:32 America/Chicago (`2026-11-04T03:32:07.593666+00:00`).

Diego approved changing only the existing active Youth ad set from the URL-based custom conversion to standard website Lead matching Kids. Budgets, statuses, bids, targeting, attribution, ads, Kids and Adults were to stay unchanged. No clone, replacement ad set, additional spend, test lead or GHL change was authorized.

## Actual provider outcome

MCP-first reads confirmed the exact objects. MCP `update_adset` does not expose `promoted_object`. One bounded native Graph request with `execution_options=["validate_only"]` checked the exact intended promoted-object replacement. Meta returned HTTP 400, code `100`, subcode `3260011`, non-transient:

> Can't Make Edits to Published Ad Set
>
> You can't edit your pixel, conversion event, custom conversion or optimization for an ad set after the ad set is published. To run an ad set with your desired changes, create a new ad set.

No actual mutation followed. No UI fallback, duplication, new spend or other provider write occurred.

## Readback

- Account `456685748412595`; Youth ad set `120252271655290072`, `DS_BROAD_ADV+_YOUTH-8-12_CALM_W1`; campaign `120252271624860072`.
- Youth remains `ACTIVE` / effective `ACTIVE`, `OFFSITE_CONVERSIONS`, `WEBSITE`. Before and after promoted object: `{"custom_conversion_id":"4720505011563755","smart_pse_enabled":false}`.
- Kids ad set `120250964809440072` remains `ACTIVE`, with actual promoted object `{"pixel_id":"592714768141415","custom_event_type":"LEAD","smart_pse_enabled":false}`. The intended replacement copied that pixel and event while preserving Youth's ancillary false flag.
- Adults ad set `120252271656620072` remains `ACTIVE` and unchanged, custom conversion `1803552514251136`.
- Youth campaign daily budget remains `2000` account minor units and bid strategy `LOWEST_COST_WITHOUT_CAP`; Youth's attribution remains 7-day click / 1-day view.
- Programmatic before/after equality passed for every returned configuration field of Youth, Kids, Adults, Youth campaign and the bounded complete Youth ad inventory, including statuses, creative IDs and tracking/conversion specs. No next ad page was returned. No changed Youth fields, even `updated_time`. Omitted ad-set budget/bid fields remain omitted, not asserted zero. Snapshots contain complete responses for the selected fields, not every possible Meta field or full creative asset contents.

No new lead, Meta event, message, CRM/workflow change or website deployment occurred. No rollback is needed because nothing changed.

## Evidence and next gate

Private evidence retained outside Git at `/home/d1360/joao-youth-standard-lead-change-current/`: `REPORT.md`, `STATUS.json`, `before.json`, `after.json`, `requested-payload.json`, `validation.json`, execution source. No credentials, private leads or paging URLs copied into Git.

Creating a replacement ad set is a separate owner decision requiring explicit approval, incumbent handling and spend-preserving configuration. The original approval does not authorize it. Stop here rather than promise this published ad set can be edited through another interface. Existing dirty main and every old PR were preserved. This docs-only record is not a deployment, campaign change or PR merge.
