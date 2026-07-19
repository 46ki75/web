type CreateHighlighter =
  (typeof import("shiki/bundle/full"))["createHighlighter"];

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
