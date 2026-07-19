type CreateHighlighter =
  (typeof import("shiki/bundle/full"))["createHighlighter"];
type GetSingletonHighlighter =
  (typeof import("shiki/bundle/full"))["getSingletonHighlighter"];

// Elmethis only uses this object for `language in bundledLanguages` checks.
export const bundledLanguages = new Proxy<Record<string, never>>(
  {},
  { has: () => true },
);

export const createHighlighter = (async (
  ...args: Parameters<CreateHighlighter>
): Promise<Awaited<ReturnType<CreateHighlighter>>> => {
  if (import.meta.env.SSR) {
    throw new Error("Shiki is only initialized in the browser");
  }
  const shiki = await import("shiki/bundle/full");
  return shiki.createHighlighter(...args);
}) as CreateHighlighter;

export const getSingletonHighlighter = (async (
  ...args: Parameters<GetSingletonHighlighter>
): Promise<Awaited<ReturnType<GetSingletonHighlighter>>> => {
  if (import.meta.env.SSR) {
    throw new Error("Shiki is only initialized in the browser");
  }
  const shiki = await import("shiki/bundle/full");
  return shiki.getSingletonHighlighter(...args);
}) as GetSingletonHighlighter;
