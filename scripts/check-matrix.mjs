import { spawnSync } from 'node:child_process';
import { cp, mkdir, rm, symlink, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = process.cwd();
const astro = path.join(root, 'node_modules/astro/bin/astro.mjs');
const run = (cmd, args, cwd, env) => {
  const result = spawnSync(cmd, args, { cwd, env: { ...process.env, ...env }, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`);
  console.log(
    result.stdout
      .split('\n')
      .filter((line) => /Complete!|Verified/.test(line))
      .join('\n'),
  );
};
const fixtureRoot = path.join(root, '.local/content-fixtures');
await rm(fixtureRoot, { recursive: true, force: true });
await mkdir(fixtureRoot, { recursive: true });
try {
  for (const name of ['src', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json'])
    await cp(path.join(root, name), path.join(fixtureRoot, name), { recursive: true });
  await symlink(path.join(root, 'node_modules'), path.join(fixtureRoot, 'node_modules'), 'dir');
  const speakerDir = path.join(fixtureRoot, 'src/content/speakers');
  await cp(
    path.join(root, 'public/social-card.png'),
    path.join(speakerDir, 'fixture-portrait.png'),
  );
  await writeFile(
    path.join(speakerDir, 'fixture-current.md'),
    `---\nedition: 2027\nstatus: published\nsource: Local automated test fixture only.\nname: Fixture Researcher With a Deliberately Long Multi-Part Name\naffiliation: An Equally Long Department of Computational Imaging and Interdisciplinary Scientific Discovery\nrole: Invited speaker\nfeatured: true\norder: 1\nportrait: ./fixture-portrait.png\nportraitCredit: Synthetic test graphic\ntalkTitle: Fixture talk about computational imaging\nabstract: A fixture abstract to verify the populated speaker layout.\n---\nFixture biography to validate the published speaker profile.\n`,
  );
  for (const [name, edition, status] of [
    ['previous', 2026, 'published'],
    ['unconfirmed', 2027, 'draft'],
  ]) {
    await writeFile(
      path.join(speakerDir, `fixture-${name}.md`),
      `---\nedition: ${edition}\nstatus: ${status}\nsource: Test only\nname: DO_NOT_PUBLISH\naffiliation: Test\nrole: Test\n---\nDO_NOT_PUBLISH\n`,
    );
  }
  await writeFile(
    path.join(fixtureRoot, 'src/content/program/fixture.yaml'),
    `edition: 2027\nstatus: published\nsource: Test only\ntitle: Fixture keynote with a very long descriptive title about computational imaging across disciplines\nkind: keynote\ndescription: Fixture session description.\ndate: '2027-06-01'\nstart: '09:00'\nend: '10:00'\nlocation: Fixture room\nspeakerIds: [fixture-current]\norder: 1\n`,
  );
  await writeFile(
    path.join(fixtureRoot, 'src/content/deadlines/fixture.yaml'),
    `edition: 2027\nstatus: published\nsource: Test only\ntitle: Fixture submission deadline\ndateLabel: January 29, 2027, 11:59 p.m. Eastern\ndatetime: '2027-01-29T23:59:00-05:00'\norder: 1\n`,
  );
  for (const env of [
    {
      SITE_URL: 'https://example.github.io',
      BASE_PATH: '/cisa-conference-website/',
      PUBLIC_INDEXABLE: 'false',
    },
    { SITE_URL: 'https://cisa-conference.org', BASE_PATH: '/', PUBLIC_INDEXABLE: 'true' },
  ]) {
    run(process.execPath, [astro, 'build'], root, env);
    run(process.execPath, ['scripts/check-site.mjs'], root, env);
  }
  const env = { SITE_URL: 'http://localhost:4322', BASE_PATH: '/', PUBLIC_INDEXABLE: 'false' };
  run(process.execPath, [astro, 'build'], fixtureRoot, env);
  run(process.execPath, ['scripts/check-site.mjs'], root, {
    ...env,
    SITE_DIST: path.join(fixtureRoot, 'dist'),
  });
  const $ = load(await readFile(path.join(fixtureRoot, 'dist/index.html'), 'utf8'));
  if (!$('.speaker-card').text().includes('Fixture Researcher'))
    throw new Error('Featured speaker did not render');
  const speaker = await readFile(
    path.join(fixtureRoot, 'dist/speakers/fixture-current/index.html'),
    'utf8',
  );
  if (!speaker.includes('Fixture biography')) throw new Error('Speaker profile did not render');
  const schedule = await readFile(path.join(fixtureRoot, 'dist/program/index.html'), 'utf8');
  if (!schedule.includes('09:00–10:00') || !schedule.includes('Fixture keynote'))
    throw new Error('Populated schedule did not render');
  console.log(
    'Verified populated speakers, portraits, profiles, deadlines, and schedule; excluded old and draft records.',
  );
} finally {
  // Restore the developer preview even if a matrix case failed. Fixture builds are isolated.
  run(process.execPath, [astro, 'build'], root, {
    SITE_URL: 'http://localhost:4321',
    BASE_PATH: '/',
    PUBLIC_INDEXABLE: 'false',
  });
}
