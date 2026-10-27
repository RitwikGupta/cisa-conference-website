import type { CollectionEntry } from 'astro:content';

export const conference2026 = {
  edition: 2026,
  name: '2026 IEEE Conference on Computational Imaging Using Synthetic Apertures',
  startDate: '2026-05-26',
  endDate: '2026-05-29',
  dateLabel: 'May 26–29, 2026',
  venue: 'University at Albany',
  city: 'Albany',
  region: 'New York',
  country: 'US',
  email: 'info@cisa-conference.org',
};

export const speakers2026: Pick<CollectionEntry<'speakers'>, 'id' | 'data'>[] = [
  { name: 'Harbir Antil', affiliation: 'George Mason University' },
  { name: 'Davide Scaramuzza', affiliation: 'University of Zurich' },
  { name: 'Yu Sun', affiliation: 'Johns Hopkins University' },
  { name: 'Jinwei Ye', affiliation: 'George Mason University' },
].map(({ name, affiliation }, order) => ({
  id: name.toLowerCase().replaceAll(' ', '-'),
  data: {
    name,
    affiliation,
    role: 'Keynote speaker',
    edition: 2026,
    status: 'published',
    featured: true,
    order,
  },
}));

export const deadlines2026: Pick<CollectionEntry<'deadlines'>, 'id' | 'data'>[] = [
  {
    id: 'initial-submissions',
    title: 'Initial submissions and climate summaries',
    date: '2026-03-24',
    dateLabel: 'March 24, 2026',
  },
  {
    id: 'acceptance',
    title: 'Acceptance notification',
    date: '2026-04-06',
    dateLabel: 'April 6, 2026',
  },
  {
    id: 'camera-ready',
    title: 'Camera-ready papers',
    date: '2026-05-01',
    dateLabel: 'May 1, 2026',
  },
].map(({ id, ...data }, order) => ({
  id,
  data: { ...data, edition: 2026, status: 'published', order },
}));

export const themes2026: Pick<CollectionEntry<'themes'>, 'id' | 'data'>[] = [
  {
    id: 'computational-imaging',
    data: {
      title: 'Computational imaging',
      description:
        'Physical imaging models and computational methods for reconstructing geometry, appearance, and signals.',
      examples: ['Inverse problems', 'Optimization', 'Machine learning'],
      order: 1,
    },
  },
  {
    id: 'synthetic-aperture-radar',
    data: {
      title: 'Synthetic aperture radar',
      description:
        'Radar acquisition, processing, performance, and exploitation for Earth observation and remote sensing.',
      examples: ['SAR processing', 'Radar systems', 'Earth resource monitoring'],
      order: 2,
    },
  },
  {
    id: 'environmental-monitoring',
    data: {
      title: 'Environmental monitoring',
      description:
        'Sensors and data interpretation for imaging oceans and land surfaces and monitoring the natural environment.',
      examples: ['Satellite measurements', 'Climate monitoring', 'Environmental standards'],
      order: 3,
    },
  },
];
