export const siteOrigin = import.meta.env.VITE_SITE_URL;

export function absoluteUrl(path: string): string {
  return new URL(path, siteOrigin).toString();
}
