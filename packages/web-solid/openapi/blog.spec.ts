import { beforeEach, describe, expect, it, vi } from "vitest";

import { getBlogContents, getBlogList, getBlogTags, ogImageUrl } from "./blog";

describe("blog CDN client", () => {
  const fetchMock = vi.fn<
    (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  >(
    async () =>
      new Response("[]", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  );

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("includes the locale in list and article cache paths", async () => {
    await getBlogList("ja");
    await getBlogContents("solid-start", "en");

    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(
      /\/cache\/v3\/blog\/list\/ja\.json$/,
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toMatch(
      /\/cache\/v3\/blog\/article\/solid-start\/contents\/en\.json$/,
    );
  });

  it("uses a language-neutral tag path", async () => {
    await getBlogTags();

    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(
      /\/cache\/v3\/blog\/tags\.json$/,
    );
  });

  it("includes the locale in article image paths", () => {
    expect(ogImageUrl("solid-start", "ja")).toBe(
      "/cache/v3/blog/article/solid-start/og-image/ja",
    );
  });
});
