/** One origin and base path for local previews, project Pages, and custom domains. */
export function deployment(env) {
  const url = new URL(env.SITE_URL || 'http://localhost:4321');
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'SITE_URL must be an http(s) origin with no path, query, or fragment. Use BASE_PATH for the repository path.',
    );
  }
  const raw = env.BASE_PATH || '/';
  if (/[:?#\\]|\.\./.test(raw)) throw new Error('BASE_PATH must be a simple URL path.');
  const base = `/${raw.split('/').filter(Boolean).join('/')}${raw.split('/').filter(Boolean).length ? '/' : ''}`;
  const indexable = env.PUBLIC_INDEXABLE === 'true';
  if (indexable && ['localhost', '127.0.0.1'].includes(url.hostname)) {
    throw new Error('A local preview must not be indexable.');
  }
  return { origin: url.origin, base, indexable };
}

export function withBase(path, base = '/') {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return path;
  return `${base}${path.replace(/^\/+/, '')}`;
}
