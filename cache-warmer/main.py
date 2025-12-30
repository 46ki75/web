import asyncio
from crawl4ai import AsyncWebCrawler
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy

async def warm_spa_routes():
    strategy = BFSDeepCrawlStrategy(
        max_depth=2,  # Follow links up to 2 levels deep
        include_external=False,  # Stay on same domain
        max_pages=100,  # Limit total pages
    )
    
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://www.ikuma.cloud/",
            deep_crawl=True,
            deep_crawl_strategy=strategy,
        )
        
        print(f"Crawled {len(result.crawled_urls)} pages")

async def main():
    await warm_spa_routes()

if __name__ == "__main__":
    asyncio.run(main())
