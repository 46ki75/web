import fs from 'fs'
import path from 'path'

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
