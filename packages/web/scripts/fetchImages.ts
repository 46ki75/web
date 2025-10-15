import type { Component } from "jarkup-ts";
import { rm, mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import type { PrerenderBlog } from "./fetchBlogList";
import { client } from "../openapi/client";

export const fetchImages = async (blogs: PrerenderBlog[]) => {
  console.info("Execute fetchImages()...");

  await rm("./public/_notion/blog/image/", { recursive: true, force: true });
  await mkdir("./public/_notion/blog/image/", { recursive: true });
  await mkdir("./public/_notion/talks/image/", { recursive: true });

  const filterBlockImageUrlsRecursive = (
    components: Component[],
    results: Array<{ id: string; s3Url: string }>
  ): Array<{ id: string; s3Url: string }> => {
    for (const component of components) {
      if (component.type === "Image" && component.props?.src && component.id) {
        results.push({
          s3Url: component.props.src,
          id: component.id,
        });
      }
      if (component.slots && "default" in component.slots) {
        filterBlockImageUrlsRecursive(component.slots.default, results);
      }
    }

    return results;
  };

  const filterInlineIconImageUrlsRecursive = (
    components: Component[],
    results: Array<{ id: string; s3Url: string }>
  ): Array<{ id: string; s3Url: string }> => {
    for (const component of components) {
      if (component.type === "Icon" && component.props?.src && component.id) {
        results.push({
          s3Url: component.props.src,
          id: component.id,
        });
      }
      if (component.slots && "default" in component.slots) {
        filterInlineIconImageUrlsRecursive(component.slots.default, results);
      }
    }

    return results;
  };

  const fetchTalkImages = async () => {
    const { data: talks } = await client.GET("/api/v2/talks");

    const promises: Promise<void>[] = [];

    const fetchAndSave = async ({ id, url }: { id: string; url: string }) => {
      const response = await fetch(url);
      const image = await response.arrayBuffer();
      const buffer = Buffer.from(image);
      const webpBuffer = await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp()
        .toBuffer();
      const path = `./public/_notion/talks/image/${id}.webp`;
      promises.push(writeFile(path, webpBuffer));
    };

    if (talks == null) throw new Error("talks is not set");

    return talks.map((talk) => fetchAndSave({ id: talk.id, url: talk.image }));
  };

  const promises = blogs.map(async (blog) => {
    const languages: ("en" | "ja")[] = ["en", "ja"];
    const ogpImagePromises: Promise<void>[] = [];
    const blockImagePromises: Promise<void>[] = [];
    const iconImagePromises: Promise<void>[] = [];

    for (const language of languages) {
      await mkdir(`./public/_notion/blog/image/${blog.slug}/${language}/`, {
        recursive: true,
      });

      // Fetch OGP Images
      const ogpS3Url = blog.ogp_image_s3_signed_url;
      if (ogpS3Url == null) throw new Error("OGP image is not set");
      const response = await fetch(ogpS3Url);
      const image = await response.arrayBuffer();
      const buffer = Buffer.from(image);
      const webpBuffer = await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp()
        .toBuffer();
      const path = `./public/_notion/blog/image/${blog.slug}/${language}/ogp.webp`;
      ogpImagePromises.push(writeFile(path, webpBuffer));
      console.info(`💾 [🖼️  OGP] Saved image: ${path}`);

      // blockList
      const blockList = await client.GET("/api/v2/blog/{slug}", {
        params: { path: { slug: blog.slug }, query: { language } },
      });

      // Fetch Block Images
      const blockImageUrls = filterBlockImageUrlsRecursive(
        (blockList.data?.components as Component[]) || [],
        []
      );
      blockImagePromises.push(
        ...blockImageUrls.map(async (blockImageUrl) => {
          const response = await fetch(blockImageUrl.s3Url);
          const image = await response.arrayBuffer();
          const buffer = Buffer.from(image);
          const webpBuffer = await sharp(buffer)
            .resize({ width: 1920, withoutEnlargement: true })
            .webp()
            .toBuffer();
          const path = `./public/_notion/blog/image/${blog.slug}/${language}/${blockImageUrl.id}.webp`;
          await writeFile(path, webpBuffer);
          console.info(`💾 [📷 Block] Saved image: ${path}`);
        })
      );

      // Fetch InlineIcon Images (RichText > Mention > CustomEmoji)
      const iconImageUrls = filterInlineIconImageUrlsRecursive(
        (blockList.data?.components as Component[]) || [],
        []
      );
      iconImagePromises.push(
        ...iconImageUrls.map(async (iconImageUrl) => {
          const response = await fetch(iconImageUrl.s3Url);
          const image = await response.arrayBuffer();
          const buffer = Buffer.from(image);
          const webpBuffer = await sharp(buffer)
            .resize({ width: 256, withoutEnlargement: true })
            .webp()
            .toBuffer();
          const path = `./public/_notion/blog/image/${blog.slug}/${language}/${iconImageUrl.id}.webp`;
          await writeFile(path, webpBuffer);
          console.info(`💾 [🤔 Icon] Saved image: ${path}`);
        })
      );
    }

    return Promise.all([
      Promise.all(ogpImagePromises),
      Promise.all(blockImagePromises),
      Promise.all(iconImagePromises),
      await fetchTalkImages(),
    ]);
  });

  await Promise.all(promises);
};
