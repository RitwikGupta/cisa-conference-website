import { z } from 'astro/zod';

export const publicationFields = {
  edition: z.number().int(),
  status: z.enum(['draft', 'published']),
};

export const deadlineSchema = z
  .object({
    ...publicationFields,
    title: z.string(),
    dateLabel: z.string(),
    date: z.iso.date().optional(),
    datetime: z.iso.datetime({ offset: true }).optional(),
    order: z.number().default(0),
  })
  .refine((item) => Boolean(item.date) !== Boolean(item.datetime), {
    message: 'A deadline requires exactly one date or timezone-qualified datetime.',
    path: ['date'],
  });
