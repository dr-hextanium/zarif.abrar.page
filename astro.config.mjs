// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://zarif.abrar.page',
  // pages load in the background when a link is hovered, so the click is instant
  prefetch: { prefetchAll: true },
  // portless pins the dev port (portless.json appPort); fail if it is busy
  // instead of drifting to a port the proxy does not route to.
  vite: {
    server: { strictPort: true },
  },
});
