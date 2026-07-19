export const locales = ["en", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
};

export const openGraphLocales: Record<Locale, string> = {
  en: "en_US",
  ja: "ja_JP",
};

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "ja";
}

export function localeFromRouteParam(value: string | undefined): Locale | null {
  if (value == null || value === "") return defaultLocale;
  return isLocale(value) ? value : null;
}

export function localeFromPath(pathname: string): Locale {
  return pathname === "/ja" || pathname.startsWith("/ja/") ? "ja" : "en";
}

export function removeLocalePrefix(pathname: string): string {
  if (pathname === "/ja" || pathname === "/ja/") return "/";
  if (pathname.startsWith("/ja/")) return pathname.slice(3);
  if (pathname === "/en" || pathname === "/en/") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname || "/";
}

export function localizePath(path: string, locale: Locale): string {
  const url = new URL(path, "https://locale.invalid");
  const unprefixedPath = removeLocalePrefix(url.pathname);
  url.pathname =
    locale === "ja"
      ? unprefixedPath === "/"
        ? "/ja/"
        : `/ja${unprefixedPath}`
      : unprefixedPath;
  return `${url.pathname}${url.search}${url.hash}`;
}

export function alternateLocale(locale: Locale): Locale {
  return locale === "en" ? "ja" : "en";
}
