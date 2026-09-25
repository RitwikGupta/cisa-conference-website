/** @param {{ status: string, edition: number }} entry @param {number} edition */
export const isPublished = (entry, edition) =>
  entry.status === 'published' && entry.edition === edition;
/**
 * @template {{ id: string, data: { status: string, edition: number, order?: number } }} T
 * @param {T[]} entries
 * @param {number} edition
 * @returns {T[]}
 */
export function publicEntries(entries, edition) {
  return entries
    .filter((entry) => isPublished(entry.data, edition))
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0) || a.id.localeCompare(b.id));
}
