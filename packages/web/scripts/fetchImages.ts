import type { ElmJsonRendererProps } from "@elmethis/core";
import { ENDPOINT } from "../nuxt.config";
import { rm, mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

export const fetchImages = async () => {
  await rm("./public/_notion/blog/image/", { recursive: true, force: true });
  await mkdir("./public/_notion/blog/image/", { recursive: true });

  const fetchBlockImageUrls = (
    blocks: ElmJsonRendererProps["json"],
    results: Array<{ id: string; s3Url: string }>
  ): Array<{ id: string; s3Url: string }> => {
    for (const block of blocks) {
      if (block.type === "ElmImage" && block.props?.src && block.id) {
        results.push({
          s3Url: block.props.src,
          id: block.id,
        });
      }
      if (block.children && block.children.length > 0) {
        fetchBlockImageUrls(block.children, results);
      }
    }

    return results;
  };

  const response = await fetch(`${ENDPOINT}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: /* GraphQL */ `
        query ListBlog {
          blogList {
            id
            ogpImageS3Url
            blockList
          }
        }
      `,
    }),
  });

  const blog: {
    data: {
      blogList: Array<{
        id: string;
        ogpImageS3Url: string;
        blockList: ElmJsonRendererProps["json"];
      }>;
    };
  } = await response.json();

  const promises = blog.data.blogList.map(async (blog) => {
    await mkdir(`./public/_notion/blog/image/${blog.id}/`, { recursive: true });

    const ogpS3Url = blog.ogpImageS3Url;
    const response = await fetch(ogpS3Url);
    const image = await response.arrayBuffer();
    const buffer = Buffer.from(image);
    const webpBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp()
      .toBuffer();
    const ogpImagePromise: Promise<void> = writeFile(
      `./public/_notion/blog/image/${blog.id}/ogp.webp`,
      webpBuffer
    );

    const blockImageUrls = fetchBlockImageUrls(blog.blockList, []);
    const blogkImagePromise = Promise.all(
      blockImageUrls.map(async (blogkImageUrl) => {
        const response = await fetch(blogkImageUrl.s3Url);
        const image = await response.arrayBuffer();
        const buffer = Buffer.from(image);
        const webpBuffer = await sharp(buffer)
          .resize({ width: 1920, withoutEnlargement: true })
          .webp()
          .toBuffer();
        const blockImagePromise: Promise<void> = writeFile(
          `./public/_notion/blog/image/${blog.id}/${blogkImageUrl.id}.webp`,
          webpBuffer
        );
        return blockImagePromise;
      })
    );

    return Promise.all([ogpImagePromise, blogkImagePromise]);
  });

  await Promise.all(promises);
};
