import type { ElmJsonRendererProps } from "@elmethis/core";
import { rm, mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import type { PrerenderBlog } from "./fetchBlogList";

export const fetchImages = async (blogs: PrerenderBlog[]) => {
  console.info("Execute fetchImages()...");

  await rm("./public/_notion/blog/image/", { recursive: true, force: true });
  await mkdir("./public/_notion/blog/image/", { recursive: true });

  const filterBlockImageUrlsRecursive = (
    blocks: ElmJsonRendererProps["json"],
    results: Array<{ id: string; s3Url: string }>
  ): Array<{ id: string; s3Url: string }> => {
    for (const block of blocks) {
      if (block.type === "ElmBlockImage" && block.props?.src && block.id) {
        results.push({
          s3Url: block.props.src,
          id: block.id,
        });
      }
      if (block.children && block.children.length > 0) {
        filterBlockImageUrlsRecursive(block.children, results);
      }
    }

    return results;
  };

  const filterInlineIconImageUrlsRecursive = (
    blocks: ElmJsonRendererProps["json"],
    results: Array<{ id: string; s3Url: string }>
  ): Array<{ id: string; s3Url: string }> => {
    for (const block of blocks) {
      if (block.type === "ElmInlineIcon" && block.props?.src && block.id) {
        results.push({
          s3Url: block.props.src,
          id: block.id,
        });
      }
      if (block.children && block.children.length > 0) {
        filterInlineIconImageUrlsRecursive(block.children, results);
      }
    }

    return results;
  };

  const promises = blogs.map(async (blog) => {
    await mkdir(`./public/_notion/blog/image/${blog.id}/`, { recursive: true });

    // Fetch OGP Images
    const ogpS3Url = blog.ogpImageS3Url;
    const response = await fetch(ogpS3Url);
    const image = await response.arrayBuffer();
    const buffer = Buffer.from(image);
    const webpBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp()
      .toBuffer();
    const path = `./public/_notion/blog/image/${blog.id}/ogp.webp`;
    const ogpImagePromise: Promise<void> = writeFile(path, webpBuffer);
    console.info(`💾 [🖼️  OGP] Saved image: ${path}`);

    // Fetch Block Images
    const blockImageUrls = filterBlockImageUrlsRecursive(blog.blockList, []);
    const blockImagePromise = Promise.all(
      blockImageUrls.map(async (blockImageUrl) => {
        const response = await fetch(blockImageUrl.s3Url);
        const image = await response.arrayBuffer();
        const buffer = Buffer.from(image);
        const webpBuffer = await sharp(buffer)
          .resize({ width: 1920, withoutEnlargement: true })
          .webp()
          .toBuffer();
        const path = `./public/_notion/blog/image/${blog.id}/${blockImageUrl.id}.webp`;
        const blockImagePromise: Promise<void> = writeFile(path, webpBuffer);
        console.info(`💾 [📷 Block] Saved image: ${path}`);
        return blockImagePromise;
      })
    );

    // Fetch InlineIcon Images (RichText > Mention > CustomEmoji)
    const iconImageUrls = filterInlineIconImageUrlsRecursive(
      blog.blockList,
      []
    );
    const iconImagePromise = Promise.all(
      iconImageUrls.map(async (iconImageUrl) => {
        const response = await fetch(iconImageUrl.s3Url);
        const image = await response.arrayBuffer();
        const buffer = Buffer.from(image);
        const webpBuffer = await sharp(buffer)
          .resize({ width: 256, withoutEnlargement: true })
          .webp()
          .toBuffer();
        const path = `./public/_notion/blog/image/${blog.id}/${iconImageUrl.id}.webp`;
        const iconImagePromise: Promise<void> = writeFile(path, webpBuffer);
        console.info(`💾 [🤔 Icon] Saved image: ${path}`);
        return iconImagePromise;
      })
    );

    return Promise.all([ogpImagePromise, blockImagePromise, iconImagePromise]);
  });

  await Promise.all(promises);
};
