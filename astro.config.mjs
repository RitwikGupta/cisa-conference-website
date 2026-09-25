import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { deployment } from './src/lib/deployment.mjs';
import { legacyRoutes } from './src/data/legacy-routes.mjs';

const { origin, base } = deployment(process.env);
const aliases = new Set(Object.keys(legacyRoutes).map((path) => `${base}${path}/`));

export default defineConfig({
  site: origin,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !aliases.has(new URL(page).pathname) && !page.endsWith('/404/'),
    }),
  ],
});
