import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const pagesRoot = join(root, 'src', 'pages');
const site = 'https://www.eletricista24horasguaruja.com.br';

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(absolute));
    else if (entry.isFile() && entry.name.endsWith('.astro')) files.push(absolute);
  }
  return files;
}

const files = await collect(pagesRoot);
const urls = new Set();

for (const file of files) {
  const source = await readFile(file, 'utf8');
  const match = source.match(/\bcanonical\s*=\s*['"]([^'"]+)['"]/);
  if (match?.[1]?.startsWith(site)) urls.add(match[1]);
}

const ordered = [...urls].sort((a, b) => a.localeCompare(b));
if (!ordered.includes(site + '/')) {
  throw new Error('A URL canônica da página inicial não foi encontrada; sitemap não foi sobrescrito.');
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...ordered.map((url) => `  <url><loc>${url.replaceAll('&', '&amp;')}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

await writeFile(join(root, 'public', 'sitemap.xml'), xml, 'utf8');
console.log(`Sitemap gerado com ${ordered.length} URLs canônicas.`);
