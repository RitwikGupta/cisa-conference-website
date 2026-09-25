import { getCollection, getEntry } from 'astro:content';
import { publicEntries } from './publication.mjs';

export const event = (await getEntry('event', '2027'))!.data;
if (event.status !== 'published')
  throw new Error('The current conference must be verified and published.');
export const themes = (await getCollection('themes')).sort((a, b) => a.data.order - b.data.order);
export const speakers = publicEntries(await getCollection('speakers'), event.edition);
export const program = publicEntries(await getCollection('program'), event.edition);
export const deadlines = publicEntries(await getCollection('deadlines'), event.edition);
export const organizers = publicEntries(await getCollection('organizers'), event.edition);
for (const entry of program) {
  if (entry.data.date && (entry.data.date < event.startDate || entry.data.date > event.endDate)) {
    throw new Error(`Program item ${entry.id} is outside the conference dates.`);
  }
  for (const id of entry.data.speakerIds) {
    if (!speakers.some((speaker) => speaker.id === id))
      throw new Error(`Program item ${entry.id} references unpublished or missing speaker ${id}.`);
  }
}
