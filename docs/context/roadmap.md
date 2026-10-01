# zarif.abrar.page: roadmap

Created 2026-10-12.

## Milestone 1: launch

Goal: every path in the spec live at zarif.abrar.page with launch content.

Acceptance criteria:

- [ ] `bun run check` and `bun run build` pass; push to `main` deploys via Actions.
- [ ] zarif.abrar.page serves over HTTPS; abrar.page/any/path 301s to zarif.abrar.page/any/path.
- [ ] `/`, `/work`, `/margins`, `/figments`, `/photos`, and 404 exist with titles per spec ("work, zarif abrar"; home "zarif abrar").
- [ ] Home status strip degrades to "offline" or hides each source when it fails; no console errors with the network blocked.
- [ ] `looking.json` on and off both render per spec.
- [ ] Margins: text is selectable, links work, each has a permalink and a reply mailto; `/margins/feed.xml` validates.
- [ ] Photos: ~20 at launch, no GPS EXIF in the repo or the output (`exiftool` check), lightbox shows metadata.
- [ ] Work entries at launch per spec; no unverified numbers.
- [ ] Link preview cards for work/ and margins pages, static card elsewhere.
- [ ] GoatCounter loads and records the four events.
- [ ] Favicon, light paper background, Petrona, #990000 accent, lowercase copy.

## Later

- zarif.abrar.page as a work entry (after launch).

## Risks and open items

- Typst HTML export is experimental; output can change between versions. Keep CI and local versions pinned together.
- GitHub unauthenticated rate limit (60/hour per visitor IP).
- Open from spec: commentary footage (plain link or none); kinematics entry (hold or one-line pitch).
- Pending content: margins list, figments list, closing lines, photo selection, cookbook numbers.
