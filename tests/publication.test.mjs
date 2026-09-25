import test from 'node:test';
import assert from 'node:assert/strict';
import { publicEntries } from '../src/lib/publication.mjs';
import { deployment, withBase } from '../src/lib/deployment.mjs';

test('only confirmed entries from the current edition are public', () => {
  const entries = [
    { id: 'previous-speaker', data: { status: 'published', edition: 2026 } },
    { id: 'unannounced-speaker', data: { status: 'draft', edition: 2027 } },
    { id: 'confirmed-second', data: { status: 'published', edition: 2027, order: 2 } },
    { id: 'confirmed-first', data: { status: 'published', edition: 2027, order: 1 } },
  ];
  assert.deepEqual(
    publicEntries(entries, 2027).map((item) => item.id),
    ['confirmed-first', 'confirmed-second'],
  );
  assert.equal(entries[0].id, 'previous-speaker', 'the source list is not mutated');
});

test('project and domain configurations preserve routes, downloads, and fragments', () => {
  const project = deployment({
    SITE_URL: 'https://example.github.io',
    BASE_PATH: 'conference',
    PUBLIC_INDEXABLE: 'false',
  });
  assert.equal(project.base, '/conference/');
  assert.equal(
    withBase('/program/#research-themes', project.base),
    '/conference/program/#research-themes',
  );
  assert.equal(withBase('/downloads/cfp.pdf', project.base), '/conference/downloads/cfp.pdf');
  assert.equal(
    withBase('mailto:info@cisa-conference.org', project.base),
    'mailto:info@cisa-conference.org',
  );
  assert.equal(withBase('#main', project.base), '#main');
  const domain = deployment({ SITE_URL: 'https://cisa-conference.org', PUBLIC_INDEXABLE: 'true' });
  assert.equal(domain.base, '/');
  assert.equal(domain.indexable, true);
  assert.equal(withBase('/attend/', domain.base), '/attend/');
});

test('preview cannot accidentally declare itself the production origin', () => {
  assert.equal(deployment({}).indexable, false);
  assert.throws(() => deployment({ SITE_URL: 'https://example.github.io/repo/' }), /origin/);
  assert.throws(() => deployment({ BASE_PATH: '../other' }), /simple URL path/);
  assert.throws(() => deployment({ PUBLIC_INDEXABLE: 'true' }), /must not be indexable/);
});
