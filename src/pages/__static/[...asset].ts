import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';

// Keep the existing published CFP URL working after the custom-domain transition.
export function getStaticPaths() {
  return [{ params: { asset: 'jdj5jdewjhnowxdjstjyvm9weeg2mezq/CISA2027_CFP_V2.pdf' } }];
}
export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await readFile('public/downloads/CISA2027_CFP_V2.pdf')), {
    headers: { 'Content-Type': 'application/pdf' },
  });
