# SEO and AI Search Foundation

> Working foundation for the custom Joao Crus BJJ website  
> Production domain: `https://joaocrusbjj.com`  
> Staging policy: `noindex, nofollow` until production cutover

## Goals

1. Preserve existing search equity during the WordPress-to-custom-site migration.
2. Give each production page one clear search intent.
3. Build strong local signals for Dripping Springs and Austin without creating doorway pages.
4. Make Joao's firsthand experience, teaching method, lineage, books, videos, and parent education easy for search engines and answer engines to understand.
5. Measure qualified organic leads, not rankings alone.

## Implemented in this foundation

- Declarative page metadata in `site/campaign/seo-pages.json`
- Canonical URL, Open Graph, Twitter Card, and JSON-LD generation
- Organization, WebSite, WebPage, Person, and SportsActivityLocation entities
- Production `robots.txt` with search and AI-crawler access
- Canonical-only XML sitemap
- `llms.txt` with concise, claim-safe academy facts and priority URLs
- Existing WordPress URL inventory and redirect disposition
- Automated SEO validation

## Production rules

### Indexation

- RawGitHack, localhost, and first-party staging remain `noindex, nofollow`.
- Only approved canonical pages become `index,follow` during production deployment.
- Drafts, visual variants, confirmation pages, and unfinished legal pages remain noindex.
- Canonical tags always reference the final `https://joaocrusbjj.com` URL, never staging.

### URL policy

- Preserve high-value existing WordPress paths where they align with the new content.
- Use lowercase, hyphenated, extensionless paths with a trailing slash.
- Configure one-hop 301 redirects before cutover.
- Do not redirect unrelated retired URLs to the homepage. Use a relevant destination or return `410 Gone` after review.

### Page targeting

- One primary search intent per page.
- Location pages must provide genuinely local information: address, directions, programs, schedule, instructors, photographs, and operational details.
- Program pages explain audience and instruction; location pages answer where and when.
- The Kids hub, Little Champions, and Youth pages must remain distinct enough to avoid cannibalization.

### On-page standards

- One descriptive H1.
- Unique title and description.
- Direct answer or definition near the start of informational sections.
- Descriptive H2/H3 headings that match parent questions naturally.
- Accurate image alt text, dimensions, modern formats, and responsive loading.
- Descriptive internal anchor text instead of generic “click here.”
- Visible citations for research or historical claims that require support.
- No keyword stuffing or unverifiable superlatives.

### Local SEO

- Keep name, address, and phone consistent across the site, Google Business Profile, Facebook, directories, and citations.
- Maintain separate structured entities for Dripping Springs and Austin.
- Do not treat class hours as business opening hours.
- Add Austin parking, entrance, and check-in information after Joao confirms it.
- Do not publish a recurring Austin adult group schedule until confirmed.

### Schema policy

Schema must match visible page content. The initial graph includes:

- `Organization`
- `WebSite`
- `WebPage`
- `Person` where Joao or coaches are visibly profiled
- `SportsActivityLocation` for the two physical locations

Add visible breadcrumbs before adding `BreadcrumbList`. Add FAQ schema only to pages with visible, substantive questions and answers. Do not use self-serving LocalBusiness review markup to seek star snippets.

### AI-search policy

Traditional crawlability and authority come first. AI-search additions include:

- Clear standalone answer passages
- Strong entity names and relationships in JSON-LD
- Firsthand stories labeled as firsthand experience
- Source links for lineage footage and research-backed claims
- Stable, concise facts in `llms.txt`
- Explicit crawler access in `robots.txt`
- Public coach credentials and authorship
- Current dates on substantive resources when added

`llms.txt` is a supplemental discovery aid, not a substitute for indexable HTML, internal links, citations, or traditional SEO.

## Migration sequence

1. Export Search Console query/page data, backlinks, and indexed URLs before cutover.
2. Resolve every row in `docs/SEO-REDIRECT-INVENTORY.csv`.
3. Deploy to first-party staging with noindex and test canonical output.
4. Validate links, schema, sitemap, robots, status codes, redirects, mobile rendering, and Core Web Vitals.
5. Deploy the custom site to the primary domain.
6. Enable indexation only on approved production pages.
7. Submit the new sitemap to Google Search Console and Bing Webmaster Tools.
8. Monitor indexing, 404s, redirect failures, rankings, Core Web Vitals, and qualified organic conversions daily during the first week, then weekly.

## Open blockers

- Final hosting and route/rewrite configuration
- Complete Search Console and backlink exports
- Final legal copy
- Canonical production Teen page inside the campaign build
- Whether books, podcast, blog articles, and ecommerce remain in launch scope
- Final Google Business Profile strategy for the Austin location
- Canonical academy email address
- Austin parking/check-in details and Castle Hill naming permission
