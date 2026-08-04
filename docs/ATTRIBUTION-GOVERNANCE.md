# Joao Crus BJJ Attribution Governance

## Purpose

Keep campaign sessions out of GA4's **Unassigned** channel and preserve useful, non-PII attribution with every accepted website lead.

## Required campaign parameters

Every controlled campaign link must include:

- `utm_source`: the platform or sender, lowercase (`facebook`, `instagram`, `google`, `newsletter`)
- `utm_medium`: one of the approved values below
- `utm_campaign`: a stable campaign name using lowercase snake case

Add `utm_content` for ad/creative variation and `utm_term` for paid-search keywords when useful.

| Traffic type | Approved `utm_medium` | Expected GA4 channel |
|---|---|---|
| Meta/TikTok/LinkedIn ads | `paid_social` | Paid Social |
| Google/Bing search ads | `cpc` | Paid Search |
| Email campaigns | `email` | Email |
| Organic social posts | `social` | Organic Social |
| Partner links | `referral` | Referral |
| SMS campaigns | `sms` | SMS |

Do not invent operational mediums such as `qa`, `boost`, `social_ad`, or `newsletter`. A valid source with an unknown medium can still land in **Unassigned**.

## Meta Ads template

```text
utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

Use the destination URL parameter field in Ads Manager. Do not manually append a second `?` when the destination already has query parameters.

## Internal and QA traffic

Use `qa=1` for controlled production tests. The site queues `traffic_type=internal` and `debug_mode=true` before GTM loads. In GA4, configure the Internal Traffic data filter in **Testing** mode first and verify it before changing the filter to Active.

Do not use `utm_medium=qa`; it intentionally does not match a standard GA4 channel.

## Website attribution behavior

- Google Consent Mode v2 defaults execute before any analytics tag. All four consent types begin as `denied`; GTM waits for the country-level region decision and is not loaded unless analytics becomes granted. The ungated GTM noscript fallback is intentionally omitted.
- Known visitors outside the EEA, United Kingdom, and Switzerland receive `analytics_storage=granted` by default without a first-visit banner. The footer Privacy choices control remains available and an explicit denial is remembered.
- Visitors in the EEA, United Kingdom, and Switzerland must opt in before `analytics_storage` is granted. A failed, missing, or malformed country lookup follows the same strict path. An explicit saved choice overrides the regional default.
- Country detection uses `https://api.country.is/` with credentials omitted, no referrer, and no cache. The site retains only the two-letter country code in page memory and does not persist the returned IP address or precise location.
- `ad_storage`, `ad_user_data`, and `ad_personalization` remain denied in every region. Global Privacy Control therefore cannot enable advertising-related storage or personalization and does not force ordinary first-party analytics off.
- Durable first-party attribution is read and written only while analytics storage is granted. While denied, the current non-PII touch remains available in page memory for the active inquiry but is not persisted in `localStorage` or `sessionStorage`.
- Turning analytics off clears both the current durable attribution record, the legacy session record, and accessible first-party Google Analytics cookies. Application-owned events are discarded while analytics is denied so they cannot be replayed after a later opt-in.
- Each retained touch has its own 90-day window. A newer campaign does not extend an older first touch beyond 90 days.
- Direct return visits do not erase the latest attributable campaign or external referral.
- Lead submissions include both touches plus supported ad click IDs: `gclid`, `fbclid`, `wbraid`, `gbraid`, and `msclkid`.
- Only landing paths and referrer hostnames are stored. Names, emails, phone numbers, messages, and arbitrary referrer URLs are never sent to GA4 attribution fields.
- Every route that loads GTM also loads the shared regional policy, consent UI, stylesheet, persistent Privacy choices control, and focus restoration behavior. The first-visit banner appears only for strict or unknown regions without a saved choice.
- Before GTM loads, the page URL is reduced to the page path plus approved campaign/click-ID parameters, and the GA4 referrer value is reduced to the referring origin. Unknown query parameters and referrer paths are not forwarded to GA4. GTM preview parameters (`gtm_debug`, `gtm_auth`, `gtm_preview`, and `gtm_cookies_win`) are also allowed so Tag Assistant can validate unpublished container versions.
- The bootstrap applies those sanitized values with `gtag('set', …)` before `gtm.start`; the container's Google tag must not override `page_location` or `page_referrer` with raw browser values.
- Browser privacy controls, deleted storage, ad blockers, and stripped referrers can still result in Direct or `(not set)` traffic.

## External booking and CRM launch gate

Before sending visitors to HighLevel, Zen Planner, Cal.com, or another hosted booking domain:

1. Configure GA4 cross-domain measurement for the owned booking domain.
2. Add only genuine payment/booking providers to unwanted referrals.
3. Confirm the linker parameter survives navigation.
4. Submit a real test lead and verify one GA4 key event and one CRM record.
5. Confirm first/last-touch fields and click IDs arrive in the CRM.

## Release verification

1. In fresh browser profiles, mock or intercept the region lookup for one standard country (`US`), one strict country (`DE` or `GB`), and one failure/unknown result.
2. For all three paths, confirm the synchronous Consent Mode default is denied and GTM does not load before region resolution.
3. On the US path, confirm analytics becomes granted without a first-visit banner, advertising consent remains denied, and the persistent Privacy choices control can turn analytics off and clear attribution.
4. On the strict and unknown paths, confirm the banner appears, analytics remains denied, and no attribution storage is created before an explicit grant.
5. Repeat the US and strict paths with Global Privacy Control enabled. Advertising consent must remain denied while ordinary regional analytics behavior remains unchanged.
6. Confirm a synthetic PII parameter is removed from the browser URL and absent from outgoing GA4 location/referrer fields in every path.
7. Confirm an explicit allow/deny choice persists across routes and overrides the automatic regional default.
8. Confirm the GA4 collect request includes intended campaign and QA markers without raw PII-bearing URL or referrer values.
9. Submit a test lead only to a non-production or approved test destination and confirm first/last-touch fields arrive without PII in analytics.
10. After GA4 processing, verify the expected Default Channel Group and check that no unexplained Unassigned session was introduced.
