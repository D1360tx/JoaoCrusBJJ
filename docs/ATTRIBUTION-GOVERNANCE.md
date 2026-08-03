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

- First touch and last non-direct touch are stored for 90 days in first-party browser storage.
- Direct return visits do not erase the latest attributable campaign or external referral.
- Lead submissions include both touches plus supported ad click IDs: `gclid`, `fbclid`, `wbraid`, `gbraid`, and `msclkid`.
- Only landing paths and referrer hostnames are stored. Names, emails, phone numbers, messages, and arbitrary referrer URLs are never sent to GA4 attribution fields.
- Browser privacy controls, deleted storage, ad blockers, and stripped referrers can still result in Direct or `(not set)` traffic.

## External booking and CRM launch gate

Before sending visitors to HighLevel, Zen Planner, Cal.com, or another hosted booking domain:

1. Configure GA4 cross-domain measurement for the owned booking domain.
2. Add only genuine payment/booking providers to unwanted referrals.
3. Confirm the linker parameter survives navigation.
4. Submit a real test lead and verify one GA4 key event and one CRM record.
5. Confirm first/last-touch fields and click IDs arrive in the CRM.

## Release verification

1. Open a fresh browser session with a standard tagged URL and `qa=1`.
2. Confirm the GA4 collect request includes the intended campaign and internal/debug marker.
3. Submit a test lead to a non-production or approved test destination.
4. Confirm first and last touch appear in the accepted lead payload.
5. After GA4 processing, verify the expected Default Channel Group and check that no unexplained Unassigned session was introduced.
