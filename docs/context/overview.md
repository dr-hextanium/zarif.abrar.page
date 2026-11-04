# zarif.abrar.page: overview

Created 2026-10-12. Read this at the start of a session.

## DECIDED

Settled. Change only with a decision log entry.

- Stack: Astro 7, static output, bun as package manager and runner. TypeScript 6 (astro check does not support 7 yet).
- Hosting: GitHub Pages, source is GitHub Actions (`.github/workflows/deploy.yml`), triggered by push to `main`.
- Domain: `public/CNAME` holds `zarif.abrar.page` so it lands in `dist/`. `site` is set in `astro.config.mjs`.
- No server. Live data is client-side fetch only:
  - Discord status and Spotify album: Lanyard (REST or websocket).
  - Lichess rapid and puzzle ratings: Lichess public API.
  - Top 3 GitHub pushes: GitHub public events API, unauthenticated (60/hour per visitor IP); must handle failure.
  - Availability: `public/looking.json`, a static file edited by hand.
  - Cube PB: hand-edited data.
- Margins: one `.typ` file per margin, compiled with typst HTML export at build (real text, links, and images). SVG export was rejected: it renders glyphs as paths, so text is not selectable, searchable, or readable by screen readers. HTML export is experimental, so typst is pinned to 0.15.1 in CI; keep local typst on the same version.
- Atom feed `/margins/feed.xml` built from the same typst HTML output, with plain text from that HTML.
- Photos: EXIF read at build with hand overrides; location stripped before commit (public repo). Served as webp/avif.
- Analytics: GoatCounter with events for resume, collaborate, reply, read more.

## PROPOSED

Not settled. Do not build on these without confirming.

- Source layout:
  - `src/pages/`: `index`, `work/`, `margins/`, `figments`, `photos`, `404`
  - `src/content/`: collections for `work` (md/mdx), `photos` (data + overrides); margins as `.typ` under `src/content/margins/`
  - `src/data/`: figments (single file), closing lines, cube pb
  - `src/scripts/`: client widgets (lanyard, lichess, github, looking)
  - `scripts/`: build-time helpers (typst compile, exif, og cards)
  - `public/`: CNAME, looking.json, resume.pdf, fonts if self-hosted
- Typst integration: an Astro integration or prebuild script that runs `typst compile --features html --format html` per margin and feeds the HTML body into pages and the feed.
- Link preview cards: generated at build, possibly `typst compile --format png` from a card template, so it stays one toolchain.
- Petrona: self-hosted via @fontsource/petrona, not Google Fonts, so the site makes no third-party font requests; typst output should use the same file.
- Image pipeline: `astro:assets` for webp/avif plus an EXIF reader (for example `exifr`) at build.

## Owner tasks (outside the repo)

- Create the GitHub repo, push, and set Pages source to "GitHub Actions".
- Porkbun DNS: CNAME `zarif` to `<username>.github.io`; verify the domain in GitHub; enforce HTTPS.
- Porkbun URL forwarding: `abrar.page` 301 to `zarif.abrar.page`, include path.
- GoatCounter account and site code.

## Decision log

Append one line per decision: date, decision, why.

- 2026-10-12: project scaffolded with foreman.
- 2026-10-12: Astro + bun, static, on GitHub Pages via Actions. Least glue for content collections, build hooks, and small client widgets.
- 2026-10-12: margins use typst HTML export, not SVG. SVG outlines text (tested on typst 0.15.1); HTML keeps text, links, accessibility. Typst pinned in CI.
- 2026-10-12: owner hand-codes the site; agents keep to docs, review, and debugging unless asked.
- 2026-10-12: TypeScript pinned to 6 because astro check rejects TypeScript 7.
- 2026-10-31: owner asked agents to implement pages and live widgets from the mockup artifact. Petrona self-hosted via @fontsource/petrona. Lanyard polled over REST every 30s, not websocket. Live code is src/scripts/live/{parse,mount}.ts; accounts in src/data/accounts.ts (empty means hidden). Lichess hides provisional or unplayed ratings. Typst margins and photo pipeline still to come.
- 2026-10-31: removed the latest photo preview from home; photos live only at /photos.
- 2026-10-31: discord status moved to the footer on every page; "no cookies" removed. Email address assembled client-side from a[data-mail] so it is never in the html.
- 2026-11-01: agents may write pages (hand-code-only rule retired). Added work/holdup, a product page for the Holdup Mac app sold through Lemon Squeezy.
- 2026-11-01: added /apps (nav after work) listing the Mac apps; Holdup moved from /work/holdup to /apps/holdup.
- 2026-11-02: removed "elsewhere on the site" from home; the nav already links every path.
