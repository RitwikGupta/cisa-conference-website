import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';
import { publicationFields as publication, deadlineSchema } from './lib/content-schemas';

const participationLink = z.object({
  url: z.url({ protocol: /^https$/ }),
  label: z.string(),
  confirmed: z.boolean(),
});
const event = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/event' }),
  schema: z.object({
    ...publication,
    name: z.string(),
    shortName: z.string(),
    sequence: z.string(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    dateLabel: z.string(),
    timezone: z.string(),
    venue: z.string(),
    city: z.string(),
    region: z.string(),
    country: z.string(),
    email: z.email(),
    cfp: z.string(),
    submission: participationLink.optional(),
    registration: participationLink.optional(),
  }),
});
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    intro: z.string().optional(),
  }),
});
const themes = defineCollection({
  loader: file('./src/data/themes.yaml'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    examples: z.array(z.string()),
    order: z.number(),
  }),
});
const speakers = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/speakers' }),
  schema: ({ image }) =>
    z.object({
      ...publication,
      name: z.string(),
      affiliation: z.string(),
      role: z.string(),
      talkTitle: z.string().optional(),
      abstract: z.string().optional(),
      portrait: image().optional(),
      portraitCredit: z.string().optional(),
      website: z.url({ protocol: /^https?$/ }).optional(),
      featured: z.boolean().default(false),
      order: z.number().default(0),
    }),
});
const program = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/program' }),
  schema: z
    .object({
      ...publication,
      title: z.string(),
      kind: z.enum(['keynote', 'session', 'tutorial', 'poster', 'break']),
      description: z.string(),
      date: z.iso.date().optional(),
      start: z
        .string()
        .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
        .optional(),
      end: z
        .string()
        .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
        .optional(),
      location: z.string().optional(),
      speakerIds: z.array(z.string()).default([]),
      order: z.number().default(0),
    })
    .refine(
      (item) =>
        (!item.start && !item.end) ||
        Boolean(item.date && item.start && item.end && item.start < item.end),
      'Scheduled items require a date and an end time later than their start time.',
    ),
});
const deadlines = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/deadlines' }),
  schema: deadlineSchema,
});
const organizers = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/organizers' }),
  schema: z.object({
    ...publication,
    name: z.string(),
    role: z.string(),
    affiliation: z.string().optional(),
    website: z.url({ protocol: /^https?$/ }).optional(),
    order: z.number().default(0),
  }),
});
export const collections = { event, pages, themes, speakers, program, deadlines, organizers };
