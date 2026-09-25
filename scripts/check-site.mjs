import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { deployment } from '../src/lib/deployment.mjs';
import { legacyRoutes } from '../src/data/legacy-routes.mjs';

const root = path.resolve(process.env.SITE_DIST || 'dist');
const { origin, base, indexable } = deployment(process.env);
const errors = [];
const cache = new Map();
const walk = async (dir) =>
  (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((item) =>
        item.isDirectory() ? walk(path.join(dir, item.name)) : path.join(dir, item.name),
      ),
    )
  ).flat();
const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const exists = async (file) => {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
};
const document = async (file) => {
  if (!cache.has(file)) cache.set(file, load(await readFile(file, 'utf8')));
  return cache.get(file);
};
const toFile = async (pathname) => {
  if (!pathname.startsWith(base)) return null;
  const relative = decodeURIComponent(pathname.slice(base.length));
  const direct = path.join(root, relative);
  if (await exists(direct)) return direct;
  if (await exists(path.join(direct, 'index.html'))) return path.join(direct, 'index.html');
  return null;
};
const checkUrl = async (raw, from, label) => {
  if (!raw || /^(data:|mailto:|tel:)/.test(raw)) return;
  const url = new URL(raw, from);
  if (url.origin !== origin) return;
  const file = await toFile(url.pathname);
  if (!file) {
    errors.push(`${label}: missing ${url.pathname}`);
    return;
  }
  if (url.hash && file.endsWith('.html')) {
    const $ = await document(file);
    const id = decodeURIComponent(url.hash.slice(1));
    if (
      !$('[id]')
        .toArray()
        .some((element) => $(element).attr('id') === id)
    )
      errors.push(`${label}: missing fragment ${url.hash} on ${url.pathname}`);
  }
};
for (const file of htmlFiles) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const route = relative === 'index.html' ? '' : relative.replace(/index\.html$/, '');
  const from = `${origin}${base}${route}`;
  const $ = await document(file);
  const refresh = $('meta[http-equiv="refresh"]');
  if ($('h1').length !== 1) errors.push(`${relative}: expected one h1`);
  if (!$('title').text()) errors.push(`${relative}: missing title`);
  if ($('html').attr('lang') !== 'en') errors.push(`${relative}: missing document language`);
  if (!refresh.length && !relative.endsWith('404.html')) {
    if (
      $('meta[name="robots"]').attr('content') !==
      (indexable ? 'index, follow' : 'noindex, nofollow')
    )
      errors.push(`${relative}: incorrect indexing policy`);
    if ($('link[rel="canonical"]').attr('href') !== from)
      errors.push(`${relative}: incorrect canonical URL`);
    if (!$('main').text().includes('2027')) errors.push(`${relative}: missing edition`);
    const ld = JSON.parse($('script[type="application/ld+json"]').text());
    if (ld.startDate !== '2027-06-01' || ld.endDate !== '2027-06-03')
      errors.push(`${relative}: inconsistent conference dates`);
  }
  const text = $('body').text();
  if (/DO_NOT_PUBLISH|Example speaker|Example session|Example deadline|Albany|CISA 2026/.test(text))
    errors.push(`${relative}: unpublished or stale content leaked`);
  for (const el of $('a[href], link[href], script[src], img[src]').toArray()) {
    await checkUrl($(el).attr('href') || $(el).attr('src'), from, relative);
  }
  for (const el of $('[srcset]').toArray()) {
    for (const candidate of $(el).attr('srcset').split(','))
      await checkUrl(candidate.trim().split(/\s+/)[0], from, relative);
  }
  for (const image of $('img').toArray())
    if ($(image).attr('alt') === undefined) errors.push(`${relative}: image has no alt`);
  if (refresh.length) await checkUrl(refresh.attr('content').split('url=')[1], from, relative);
}
for (const file of files.filter((file) => file.endsWith('.css'))) {
  const text = await readFile(file, 'utf8');
  const from = `${origin}${base}${path.relative(root, file).split(path.sep).join('/')}`;
  for (const match of text.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))
    await checkUrl(match[1], from, path.basename(file));
}
for (const [route, destination] of Object.entries(legacyRoutes)) {
  const file = path.join(root, route, 'index.html');
  if (!(await exists(file))) errors.push(`Missing legacy redirect ${route}`);
  else {
    const $ = await document(file);
    if ($('link[rel="canonical"]').attr('href') !== `${origin}${base}${destination.slice(1)}`)
      errors.push(`Incorrect redirect destination for ${route}`);
  }
}
const sitemap = await readFile(path.join(root, 'sitemap-0.xml'), 'utf8');
for (const route of Object.keys(legacyRoutes))
  if (sitemap.includes(`<loc>${origin}${base}${route}/</loc>`))
    errors.push(`Legacy route in sitemap: ${route}`);
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
if (!robots.includes(indexable ? 'Allow: /' : 'Disallow: /')) errors.push('Incorrect robots.txt');
const pdf = await readFile(path.join(root, 'downloads/CISA2027_CFP_V2.pdf'));
if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-')))
  errors.push('The call for papers download is not a PDF');
const calendar = await readFile(path.join(root, 'downloads/cisa-2027.ics'), 'utf8');
if (!calendar.includes('DTEND;VALUE=DATE:20270604'))
  errors.push('Calendar end date must be exclusive');
if (calendar.split('\r\n').some((line) => Buffer.byteLength(line) > 75))
  errors.push('Calendar lines exceed 75 bytes');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  `Verified ${htmlFiles.length} HTML pages, internal links and fragments, assets, redirects, metadata, publication rules, PDF, and calendar at ${origin}${base}`,
);
