# Joao operational capability and permission matrix

Verified 2026-10-30, location `PnNnRDAjstycMWpOmUn7` only.

| Area | New dedicated provider permissions | Exposed automation now | Remaining release requirement |
|---|---|---|---|
| Contacts | `contacts.readonly`, `contacts.write` | Existing reads; exact-record non-identity field previews | Independent owner approval gate, narrow commit implementation and separately approved fixture test |
| Notes and tasks | Included in contact read/write scopes, not invented separate task scopes | Existing reads; legacy write code remains unregistered | Exact note/task diff, side-effect review, owner approval and readback |
| Opportunities and pipeline stages | `opportunities.readonly`, `opportunities.write` | Existing reads; name/status/value/stage previews pinned to existing record/pipeline | Guarded commit and automation-impact acceptance; no actual stage transition performed |
| Pipeline definitions | Opportunity scope family; individual endpoint support not exercised | Inventory only | Confirm current exact public endpoint or use approved signed-in UI; no schema mutation tool |
| Custom-field definitions | `locations/customFields.readonly`, `locations/customFields.write` | Existing definition reads only | Schema backup, dependency/consent-ID review and separately approved schema edit |
| Tags | `locations/tags.readonly`, `locations/tags.write` | Existing catalog read surface, no new tag mutation tool | Tags can enroll automation. Require producer/consumer review and exact approval |
| Calendars | `calendars.readonly`, `calendars.write` | Existing reads | Definition and notification review before approved edits |
| Appointments | `calendars/events.readonly`, `calendars/events.write` | Existing bounded reads; legacy appointment preview/commit code is unregistered | Owner approval gate and separately approved no-notification fixture acceptance |
| Workflow definitions | **`workflows.readonly`, `workflows.write` are present in this current provider UI** | Existing workflow list succeeds; no new workflow mutation tool | Current definition API contract not exercised. Do not assume browser-only or claim implemented API editing. Browser remains an alternative after exact-target approval |
| Workflow logs | `workflows.logs` | Provider grant prepared, log endpoint not exercised | Bounded location/record-specific read adapter |
| Workflow publishing/deletion | **Not granted:** `workflows.publish`, `workflows.delete` | No tools | Separate exact-object authorization and safety acceptance; not part of this setup |
| Forms | `forms.readonly`, **`forms.write` present in current UI** | Provider grant prepared; no form endpoint tested or tools added | Contract and publication semantics review; no actual form edit |
| Email templates | `emails/builder.readonly`, `emails/builder.write`, `emails/templates.readonly`, `emails/templates.write`, `locations/templates.readonly` | Provider grant prepared; no template mutation tool | Preserve original and linkage; approved exact template diff. Builder-write scope bundles deletion, which gateway must not expose |
| Conversations/history | `conversations.readonly`, `conversations/message.readonly` | Existing read methods unchanged; new token has grants | Endpoint-specific bounded read verification; no sends |
| Email/SMS drafts | No send scope granted | **Working private local recipient-free plain-text draft save/read** | Not GHL-persisted. No verified draft-only public messaging endpoint; no outbound test performed |
| Outbound sends and workflow enrollment | Message-send scope omitted; enrollment still inherently bundled in `contacts.write` | **Denied / no exposed tool** | Exact audience/content/consent/cost approval, authenticated owner gate and separate delivery acceptance |
| DND/consent/unsubscribe | No new consent-specific scope; underlying contact write remains broad | **All denied**, including custom fields/tags/identity fields in preparation tools | No manufacture of consent or opt-out clearing; not authorized by this setup |
| Bulk/delete/exports | No dedicated capabilities added; some provider edit scopes inherently bundle deletion | No bulk/delete/export tool | Separate explicit request; broad provider scope is not execution permission |
| Payments, charges, billing, users/admin, ownership | **No scopes selected** | No tools | Outside current operational setup authorization |

## Exact state

- New integration: **24** verified selected scopes, not all 180 available scopes.
- Existing **GoHighLevel** integration: **10** selected scopes, unchanged by this run. It already has `contacts.write`, `opportunities.write` and `locations/customFields.write` despite its read-env filename. The existing MCP still exposes only reads and receives no separately configured write credential.
- New write credential is private and unused by active MCPs. Its workflow/pipeline/calendar/custom-field GETs returned 200. Provider write contracts are **not live-tested**.
- Separate registered preparation MCP: five tools, real stdio preview/draft invocation passed, **no commit/approval issuer**. Existing open conversations need targeted MCP reload or a new session for discovery.
- Business/customer mutations, messages, enrollment, published changes, appointments and financial actions during setup: **zero**. The only provider mutation was creation of the dedicated private integration and its permission set.

Scope evidence: `provider-scope-options.json`, `precreate-scope-proof.json`, `saved-provider-scope-proof.json`. The latter proves saved selections by reopening the exact new integration.
