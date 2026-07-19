# SolidStart i18n migration plan

This document outlines the internationalization design for migrating
`packages/web-solid` from Qwik City to SolidStart. The implementation uses
`@solid-primitives/i18n` for typed translation utilities and an application-owned
Solid context for locale state.

## Goals

- Keep English at unprefixed URLs such as `/about` and `/blog`.
- Keep Japanese at prefixed URLs such as `/ja/about` and `/ja/blog`.
- Render the correct locale during SSR without post-hydration correction.
- Share route and component implementations between locales.
- Keep locale-specific blog data independently cacheable.
- Preserve localized metadata, canonical URLs, and alternate-language links.
- Prevent locale state from leaking between concurrent SSR requests.

## Core decisions

The URL is the authoritative locale source:

| URL                 | Locale   |
| ------------------- | -------- |
| `/about`            | English  |
| `/blog/...`         | English  |
| `/ja/about`         | Japanese |
| `/ja/blog/...`      | Japanese |

The first version will not redirect unprefixed URLs based on `Accept-Language`
or `localStorage`. This keeps English URLs deterministic and avoids varying the
public HTML cache by language preference. A cookie may remember an explicit
language selection, but it must not override the locale encoded in a URL.

Both UI dictionaries will be loaded statically. The shared UI has few strings,
so asynchronous catalog loading would add SSR and hydration complexity without
a meaningful bundle-size benefit.

Long-form content will remain separate from the UI dictionaries. Privacy pages
will continue to use locale-specific Markdown, About content can use separate
locale components or Markdown, and blog content will continue to come from the
locale-specific cache API.

## 1. Define the locale domain

Create `src/i18n/locale.ts` as the framework-independent source of truth for:

- `Locale = "en" | "ja"`
- `defaultLocale = "en"`
- supported locale validation
- deriving a locale from a pathname or route parameter
- adding and removing the `/ja` prefix
- switching a pathname while preserving its meaning
- locale labels and Open Graph locale values

The path helpers must handle the root path, trailing slashes, query parameters,
and URL fragments consistently.

Expected conversions include:

```text
/blog?tag=rust       -> /ja/blog?tag=rust
/ja/privacy#contact  -> /privacy#contact
/ja/                 -> /
```

## 2. Add typed dictionaries

Add the following structure to the SolidStart application:

```text
src/i18n/
  context.tsx
  locale.ts
  messages/
    en.ts
    ja.ts
```

Use the English dictionary to define the raw dictionary shape. The Japanese
dictionary must satisfy the same type so missing and mismatched keys fail the
TypeScript build.

```ts
export const en = {
  common: {
    home: "Home",
    blog: "Blog",
    language: "Language",
  },
  blog: {
    featured: "Featured",
    recent: "Recent",
    search: "Search blogs",
  },
};

export type RawDictionary = typeof en;
```

Use `flatten` from `@solid-primitives/i18n` once for each immutable dictionary
at module initialization. Do not use the context APIs shown in old examples of
the package; the current package exposes composable utilities such as `flatten`,
`translator`, `resolveTemplate`, and scoped translator helpers.

## 3. Create the i18n context

Create an application-owned context with Solid's `createContext`. Its value
should expose at least:

```ts
type I18nContextValue = {
  locale: Accessor<Locale>;
  t: Translator;
  localizePath: (path: string, locale?: Locale) => string;
};
```

Inside the provider, derive the dictionary reactively from the route locale and
create the translator from the dictionary accessor:

```ts
const dictionary = createMemo(() => dictionaries[locale()]);
const t = translator(dictionary);
```

Add a strict `useI18n()` helper that throws when it is used outside the
provider. The provider and locale accessor must be created inside the component
tree for every SSR request. Only immutable dictionaries and pure helpers may be
module-level singletons.

## 4. Consolidate localized routes

Use an optional leading route parameter to share page implementations:

```text
src/routes/
  [[lang]].tsx
  [[lang]]/
    index.tsx
    about.tsx
    privacy.tsx
    blog.tsx
    blog/
      index.tsx
      search.tsx
      article/
        [slug].tsx
```

Use `[[lang]].tsx` as the localized layout. It should validate the route
parameter, provide the i18n context, and render the shared header, footer, and
page layout.

The validation policy is:

| `lang` value | Behavior                                      |
| ------------ | --------------------------------------------- |
| missing      | Render English                                |
| `ja`         | Render Japanese                               |
| `en`         | Redirect to the unprefixed canonical URL      |
| other        | Return 404                                    |

Non-page endpoints such as `robots.txt` and sitemaps should remain outside the
optional locale layout.

## 5. Implement language switching

Replace the mutable global language state with route navigation. The language
switcher should compute the equivalent URL in the target locale, preserve the
query and hash, and navigate to that URL.

An explicit switch may also write a preference cookie with `Path=/`,
`SameSite=Lax`, and a long `Max-Age`. Remove the current `localStorage` lookup,
`navigator.language` correction, and document-ready redirect. Those behaviors
allow the server and client to render different locales and can cause visible
content changes or hydration problems.

Ordinary internal links should use `localizePath` and Solid Router's `A`
component. They do not need `hreflang`. Reserve `hreflang` for links that
actually identify alternate-language resources and for SEO metadata.

## 6. Set the document language during SSR

In `entry-server.tsx`, derive the locale from `event.request.url` and pass it to
the custom document rendered by `StartServer`. Render the locale on the root
element:

```tsx
<html lang={locale}>
```

The server document is outside the client router. Add a small client-side effect
inside the locale provider to update `document.documentElement.lang` after
client-side navigation between English and Japanese routes.

This replaces the current static `lang="en"` value on `<body>` and ensures that
the original HTML response identifies the rendered language correctly.

## 7. Migrate shared UI messages

Move short interface messages into the typed dictionaries and replace local
translation records and locale ternaries with `t()` calls. Initial candidates
include:

- header and footer labels
- breadcrumbs
- blog section headings
- blog search labels and controls
- loading and error messages
- accessible labels and image alternative text
- language selector labels

Do not translate proper names, product names, or language-neutral branding
unless the existing application already has a locale-specific form.

## 8. Keep long content separate

Retain or introduce separate locale assets for content that benefits from
normal Markdown or JSX authoring:

| Content         | Representation                                  |
| --------------- | ----------------------------------------------- |
| Privacy policy  | `privacy.en.md` and `privacy.ja.md`             |
| About body      | locale components or locale Markdown files      |
| Blog body       | locale-specific blog cache API payload          |
| Blog tag names  | existing `name_en` and `name_ja` fields         |

The route-derived locale chooses the content asset. These documents should not
be copied into the short UI message dictionary.

## 9. Make server data locale-explicit

Every localized query must receive the locale as an argument. The shared blog
routes should call APIs in forms equivalent to:

```ts
getBlogList(locale)
getBlogContents(slug, locale)
```

Include locale in query and cache identities. Never read it from mutable module
state. The shared article route will replace the duplicated English and Japanese
loaders and pass its validated locale together with `params.slug`.

The existing `/cache/v3/blog/.../{en|ja}.json` URL design remains unchanged, so
each localized object stays independently cacheable by CloudFront.

## 10. Use locale-aware formatting

Use native `Intl` formatters built from the locale accessor. Create formatters
with `createMemo` when they are used by reactive client components:

```ts
const dateFormatter = createMemo(
  () => new Intl.DateTimeFormat(locale(), { dateStyle: "long" }),
);
```

Apply the same pattern to article dates, badge dates, and future number or list
formatting. Keep raw values language-independent.

## 11. Rebuild localized metadata

Use `@solidjs/meta` and shared SEO helpers that receive an explicit locale and
URL. Each localized page should emit:

- localized title and description
- a canonical URL for the current language
- `rel="alternate"` links for `en`, `ja`, and `x-default`
- `og:locale` as `en_US` or `ja_JP`
- locale-specific article metadata and JSON-LD

For asynchronous article metadata, configure data loading and SSR so the
resolved metadata is present in the original HTML response.

## 12. Preserve sitemap behavior

Generate both English and Japanese page URLs from the same route definitions.
Keep `x-default` aligned with the unprefixed English URL. Verify that article
URLs and alternate links are omitted or handled explicitly when content is not
available in both languages.

## 13. Verification

Add automated coverage for the following behavior:

- `/`, `/about`, and `/blog/...` render English during SSR.
- `/ja/`, `/ja/about`, and `/ja/blog/...` render Japanese during SSR.
- The original response contains the correct `<html lang>` value.
- Hydration completes without locale-related warnings.
- Language switching preserves path, query parameters, and fragments.
- Unknown locale prefixes return 404.
- `/en/...` follows the canonical redirect policy.
- Parallel English and Japanese SSR requests do not leak locale state.
- Blog query and cache identities include the locale.
- Canonical, alternate, Open Graph, and JSON-LD metadata are correct.
- Sitemaps contain the intended URLs for both locales.

## Delivery order

Implement the migration in this order so each stage has a clear verification
boundary:

1. Add locale utilities, dictionaries, and unit tests.
2. Add the application-owned i18n context and provider.
3. Add the shared optional-locale route layout.
4. Set the SSR document language and client navigation synchronization.
5. Migrate the header, footer, internal links, and language switcher.
6. Migrate Home, About, and Privacy.
7. Consolidate blog layouts, loaders, and pages.
8. Rebuild localized metadata and sitemaps.
9. Add SSR, routing, and concurrency tests.
10. Remove the old Qwik language context and client-side correction behavior.

Automatic first-visit language negotiation should be considered only after this
route-authoritative implementation is complete. If it is added, it should be a
separate middleware change with an explicit CloudFront caching policy.
