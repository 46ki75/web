import asyncio
from crawl4ai import AsyncWebCrawler
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy


async def warm_spa_routes():
    strategy = BFSDeepCrawlStrategy(
        max_depth=4,  # Follow links up to 2 levels deep
        include_external=False,  # Stay on same domain
        max_pages=100,  # Limit total pages
    )

    async with AsyncWebCrawler() as crawler:
        # Use a CrawlerRunConfig so DeepCrawlDecorator sees the strategy and runs deep crawling
        from crawl4ai import CrawlerRunConfig

        config = CrawlerRunConfig(deep_crawl_strategy=strategy, stream=False)
        result = await crawler.arun(
            url="https://www.ikuma.cloud/",
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
