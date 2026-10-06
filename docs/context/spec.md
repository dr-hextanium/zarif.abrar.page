# zarif.abrar.page spec

Owner's spec as given 2026-10-12. Implementation decisions live in overview.md (margins use typst HTML export, not SVG).

## hosting
- static site, github pages, source public, free services only
- url: zarif.abrar.page (CNAME `zarif` -> <username>.github.io, CNAME file in repo, enforce https)
- abrar.page: porkbun url forwarding, 301, include path, to zarif.abrar.page
- email everywhere: zarif@abrar.page, prefilled subjects

## paths
- /            home
- /work        projects and roles, by impact, filters: software, hardware, robotics, research
- /margins     dated stream, one typst file per margin, slug by hand or auto from first words
- /figments    one-liners in a single file, scattered freeform, reshuffled per visit
- /photos      single grid
- titles per path ("work, zarif abrar"), home is "zarif abrar"

## home (narrative prose, top to bottom)
- index card (slightly rotated): name, bio ("biochemistry at stony brook" + what i build)
- spinning record with current spotify album art, stops when offline; on mobile tucks into card corner
- status strip: icons + lowercase text; discord via lanyard, availability via json,
  top 3 github pushes, lichess rapid + puzzle, cube pb (manual), "offline" when idle
- latest photo, black and white until hover, links to /photos
- "what i'm working on": perch, pipit (pitch only)
- resume pdf link (file replaced in repo)
- links to each path
- closing line, randomized per visit from playful set

## looking.json
- flag + phrase + availability
- when on: direct closing line, red "open to [phrase]" in status strip,
  resume link in accent, bio line "currently looking for [phrase]"

## work/ at launch
- the cookbook (no numbers until verified)
- campus residences it technician / programmer intern (dated)
- ftc world championship commentary, 2026 (dated, text-only)
- perch, pipit (in progress)
- zarif.abrar.page (after launch)
- entry page order: image/demo, short summary with numbers, writeup
- dates on roles only

## margins
- typst for all, compiled to svg at build via github actions (superseded: HTML export, see overview.md)
- text with hyperlinks, images black and white until hover
- permalink each, email reply link with prefilled subject
- atom feed at /margins/feed.xml, svg + plain text fallback

## figments
- one line, optional expansion
- collaborate button: mailto with figment name in subject
- interest signals email only, no public counts, no done/undone distinction

## photos
- single grid, black and white until hover, title on hover
- lightbox with metadata: exif auto at build, hand override, location stripped
- ~20 at launch, ~1 every two weeks, webp/avif compressed

## aesthetic
- light only, slightly warm paper background (#F5F1E8)
- accent: sbu red #990000 (links, statuses, hover, figment dots)
- petrona for everything
- lowercase wherever reasonable, proper nouns and paper titles capitalized
- noticeable but restrained animation, subtle transitions
- path-style links (work/perch)
- favicon: lowercase "z" in petrona on paper

## extras
- goatcounter analytics + events: resume, collaborate, reply, read more
- link previews: per-page cards for work/ and margins, static card elsewhere
- 404 in playful voice, links to home and work/

## open
- commentary footage: plain link or none
- kinematics entry: hold or one-line pitch
- pending from you: margins list, figments list, closing lines, photo selection, cookbook numbers
