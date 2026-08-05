# ICDC Creative Library

Private, standalone ad-swipe interface for Joao Crus BJJ and other ICDC Ventures projects.

## Preview locally

From the repository root:

```bash
python3 -m http.server 4188
```

Open `http://127.0.0.1:4188/site/ad-vault/`.

## Content model

Creative records currently live in `ad-vault.js`. Every record includes:

- Project and brand
- Capture date
- Local image/video evidence
- Format, audience, and funnel classifications
- Hook, offer, saved rationale, and Joao application
- Source, landing-page, and full-analysis links

The underlying evidence and complete analyses remain in `assets/ads-swipe/`.

## Adding projects

1. Add the project to the `PROJECTS` map in `ad-vault.js`.
2. Add a matching `[data-project]` button to `index.html`.
3. Add creative records with the same project key.
4. Update the visible swipe count in the project card and header.
5. Re-run responsive and interaction QA.

## Deployment policy

- This route carries `noindex,nofollow`.
- It is intentionally separate from the approved production Joao site.
- It is not copied by the existing production build script.
- Review with a commit-pinned RawGitHack URL unless a dedicated private deployment is created.
