export const siteOrigin = `https://${import.meta.env.VITE_API_DOMAIN}`;

export function absoluteUrl(path: string): string {
  return new URL(path, siteOrigin).toString();
}
