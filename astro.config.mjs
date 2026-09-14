import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://eletricista24horasguaruja.com.br',
  integrations: [sitemap()],
  build: { format: 'directory' }
});
