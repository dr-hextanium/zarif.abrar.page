# zarif.abrar.page

Zarif Abrar's personal site: work, margins (writing), figments, photos. Static Astro site on GitHub Pages at zarif.abrar.page.

## Working mode

The owner hand-codes this site. Agents do not write pages, components, styles, or build scripts, do not dispatch implementers, and do not scaffold features unless the owner asks for that specific piece. Default help is: answer questions, review code the owner wrote, debug when asked, keep the docs current.

## Context files

Read the ones that match the task. Do not load all of them by default.

| File | Read when |
|---|---|
| [overview.md](docs/context/overview.md) | Starting a session, checking what is DECIDED vs PROPOSED, layout, the decision log |
| [roadmap.md](docs/context/roadmap.md) | Milestones, acceptance criteria, open items, pending content |
| [spec.md](docs/context/spec.md) | Any question about what a page, path, or feature should do |

Product truth lives in `PRODUCT.md`. When a decision changes, update the relevant context file and append to the decision log in `overview.md`.

## Commands

- Install: `bun install`
- Typecheck: `bun run check` (astro check; needs TypeScript 6, not 7)
- Test: none yet
- Run locally: `bun run dev`
- Build: `bun run build` (output in `dist/`)

## Hard rules

- No server, ever. GitHub Pages is static; every live widget is a client-side fetch to a public CORS API and must degrade quietly when it fails.
- No secrets in the repo or client code. Nothing in this site uses an API key.
- Photos: GPS and location EXIF are stripped before an image is committed, not only at build. The source repo is public.
- Resume PDF: strip document metadata before committing.
- Interest signals (collaborate, reply) go by email only. No public counts.
- Analytics is GoatCounter only, no cookies, no other trackers.
- Cookbook numbers stay out until the owner verifies them.

## Cost and free-tier limits

Free services only; never add a card.

- GitHub Pages: 1 GB site, 100 GB/month bandwidth soft limit, 10 builds/hour.
- GitHub Actions: free for public repos.
- GitHub REST (unauthenticated, from the visitor's browser): 60 requests/hour per IP. Past it the strip shows nothing for github.
- Lanyard, Lichess API: free and public, rate limited. Past the limit the widget hides or shows "offline".
- GoatCounter: free for personal non-commercial use.
- Porkbun: domain renewal is the only cost (owner's account).

## Tiers

Foreman tiers apply; project paths and checks in `.foreman/tiers.md`.

## UI track

- Design and polish: `impeccable:impeccable`
- UX strategy and flows: `intent:intent`

## Writing conventions

- No em-dashes in UI copy, docs, comments, or commit messages. Use commas or colons.
- UI copy is lowercase wherever reasonable; proper nouns and paper titles keep capitals.
- UI copy is short and literal. No hype.

## Git workflow

- Work on `dev`. Ship to `main` only when a change is done and checked; a push to `main` deploys.
- Follow Conventional Commits: `type(scope): description`, lowercase, imperative, 72 characters or fewer.
- Atomic commits: one logical change each, and every commit passes the checks.
- Keep every commit tiny and semantic: the smallest change that stands alone, a short subject that says exactly what changed, no body unless the why is not obvious. Split by concern, not by file.
- Agents commit only their own doc changes. Pushing to `main` needs the owner.

## Handoff

Use /foreman:handoff. HANDOFF.md is gitignored.
