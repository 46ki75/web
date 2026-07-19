import { describe, expect, it } from "vitest";

import {
  alternateLocale,
  isLocale,
  localeFromPath,
  localeFromRouteParam,
  localizePath,
  removeLocalePrefix,
} from "./locale";

describe("locale helpers", () => {
  it("validates route locale parameters", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ja")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(localeFromRouteParam(undefined)).toBe("en");
    expect(localeFromRouteParam("ja")).toBe("ja");
    expect(localeFromRouteParam("fr")).toBeNull();
  });

  it("derives the locale from the URL path", () => {
    expect(localeFromPath("/")).toBe("en");
    expect(localeFromPath("/blog")).toBe("en");
    expect(localeFromPath("/ja")).toBe("ja");
    expect(localeFromPath("/ja/blog")).toBe("ja");
    expect(localeFromPath("/japanese")).toBe("en");
  });

  it("adds and removes locale prefixes without losing URL state", () => {
    expect(localizePath("/blog?tag=rust", "ja")).toBe("/ja/blog?tag=rust");
    expect(localizePath("/ja/privacy#contact", "en")).toBe("/privacy#contact");
    expect(localizePath("/ja/", "en")).toBe("/");
    expect(localizePath("/?page=2#recent", "ja")).toBe("/ja/?page=2#recent");
    expect(removeLocalePrefix("/en/blog")).toBe("/blog");
    expect(removeLocalePrefix("/ja/blog")).toBe("/blog");
  });

  it("selects the alternate locale", () => {
    expect(alternateLocale("en")).toBe("ja");
    expect(alternateLocale("ja")).toBe("en");
  });
});
