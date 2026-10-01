## Paths

Path minimums only raise a tier.

- `src/styles/**`: Tweak
- `src/scripts/**`: Feature
- `public/looking.json`: Logic
- `scripts/**exif*`: Critical
- `src/content/photos/**`: Critical
- `public/**/*.pdf`: Critical
- `.github/workflows/**`: Logic

## Checks

- Tweak: `bun run check`
- Feature: `bun run check && bun run build`
- Logic: `bun run check && bun run build`
- Critical: `bun run check && bun run build`, then `exiftool -gps:all dist` shows no GPS tags
