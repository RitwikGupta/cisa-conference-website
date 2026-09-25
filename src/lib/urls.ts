import { withBase } from './deployment.mjs';

export const href = (path: string) => withBase(path, import.meta.env.BASE_URL);
export const absolute = (path: string) => new URL(href(path), import.meta.env.SITE).href;
