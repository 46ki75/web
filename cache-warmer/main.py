import asyncio
from crawl4ai import AsyncWebCrawler
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy


async def warm_spa_routes():
    strategy = BFSDeepCrawlStrategy(
        max_depth=4,  # Follow links up to 2 levels deep
        include_external=False,  # Stay on same domain
        max_pages=100,  # Limit total pages
    )

    # Build BrowserConfig with optional headers (safer: Playwright context-level headers)
    from crawl4ai import CrawlerRunConfig, BrowserConfig
    import os

    # Support Basic Auth via environment variables (safe defaults):
    # - BASIC_AUTH_USER & BASIC_AUTH_PASSWORD
    # - BASIC_AUTH can be one of:
    #   * "user:pass"  -> encoded
    #   * "Basic <token>" -> used as-is
    #   * "<base64token>" -> used as token
    # If no env vars are provided, the crawler runs normally without auth.
    user = os.getenv("BASIC_AUTH_USER")
    pwd = os.getenv("BASIC_AUTH_PASSWORD")
    basic = os.getenv("BASIC_AUTH")

    headers = None
    if user and pwd:
        import base64

        token = base64.b64encode(f"{user}:{pwd}".encode()).decode()
        headers = {"Authorization": f"Basic {token}"}
        if os.getenv("CRAWLER_DEBUG"):
            print("Using Basic Auth from env (username redacted)")
    elif basic:
        basic = basic.strip()
        if basic.lower().startswith("basic "):
            headers = {"Authorization": basic}
            if os.getenv("CRAWLER_DEBUG"):
                print("Using Basic Auth from env (prebuilt header)")
        elif ":" in basic:
            import base64

            token = base64.b64encode(basic.encode()).decode()
            headers = {"Authorization": f"Basic {token}"}
            if os.getenv("CRAWLER_DEBUG"):
                print("Using Basic Auth from env (user:pass string)")
        else:
            # Treat as base64 token
            headers = {"Authorization": f"Basic {basic}"}
            if os.getenv("CRAWLER_DEBUG"):
                print("Using Basic Auth from env (base64 token)")

    # Create BrowserConfig with headers (Playwright will apply these to context)
    browser_config = BrowserConfig(headers=headers) if headers else BrowserConfig()

    # Use AsyncWebCrawler with the prepared BrowserConfig
    async with AsyncWebCrawler(config=browser_config) as crawler:
        config = CrawlerRunConfig(
            deep_crawl_strategy=strategy,
            stream=False,
        )
        result = await crawler.arun(
            url="https://dev-www.ikuma.cloud/",
            config=config,
        )

        # Determine number of pages crawled (support list, container, or async generator)
        import inspect

        try:
            pages = len(result)
        except TypeError:
            if inspect.isasyncgen(result):
                pages = 0
                async for _ in result:
                    pages += 1
            else:
                pages = 1

        print(f"Crawled {pages} pages")


async def main():
    await warm_spa_routes()


if __name__ == "__main__":
    asyncio.run(main())
