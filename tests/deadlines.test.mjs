import test from 'node:test';
import assert from 'node:assert/strict';
import { deadlineSchema } from '../src/lib/content-schemas.ts';

const entry = {
  edition: 2027,
  status: 'published',
  source: 'Approved 2027 call for papers',
  title: 'Proposals',
  dateLabel: 'December 1, 2026',
};

test('a conference-edition deadline may be a date in the preceding calendar year', () => {
  const result = deadlineSchema.parse({ ...entry, date: '2026-12-01' });
  assert.equal(result.date, '2026-12-01');
  assert.equal(result.datetime, undefined);
  assert.equal(result.dateLabel, 'December 1, 2026');
});

test('existing timezone-qualified deadlines retain their timestamp and label', () => {
  const dateLabel = 'January 29, 2027, 11:59 p.m. Eastern';
  const result = deadlineSchema.parse({
    ...entry,
    dateLabel,
    datetime: '2027-01-29T23:59:00-05:00',
  });
  assert.equal(result.datetime, '2027-01-29T23:59:00-05:00');
  assert.equal(result.date, undefined);
  assert.equal(result.dateLabel, dateLabel);
});

test('deadlines reject missing, ambiguous, invalid, or unqualified date values', () => {
  for (const values of [
    {},
    { date: '2027-01-29', datetime: '2027-01-29T23:59:00-05:00' },
    { date: '2027-02-30' },
    { date: '2027-01-29T23:59:00Z' },
    { datetime: '2027-01-29' },
    { datetime: '2027-01-29T23:59:00' },
  ])
    assert.equal(deadlineSchema.safeParse({ ...entry, ...values }).success, false);
});
