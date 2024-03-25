import fs from 'fs'
import path from 'path'

/**
 * Function to save inline images. Save images from an S3 signed URL
 * to /public/images/blog/${slug}/i${url.index}.webp. For example,
 * if the blog's ID (slug) is 15, the first image would be saved as
 * `/public/images/blog/15/i0.webp`.
 *
 * @param {string[]} imageURLs
 * @param {string} slug id of the article
 */
export async function saveImages(
  imageURLs: string[],
  slug: string
): Promise<void> {
  const URLObjects = imageURLs.map((src, index) => ({ src, index }))
  for (const url of URLObjects) {
    try {
      const response = await fetch(url.src)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const dirPath = path.join(`./public/images/blog/${slug}`)

      fs.mkdirSync(dirPath, { recursive: true })

      const filePath = path.join(dirPath, `i${url.index}.webp`)

      fs.writeFileSync(filePath, buffer)
    } catch (error) {
      console.error(`Error downloading or saving image ${url.src}: `, error)
    }
  }
}
