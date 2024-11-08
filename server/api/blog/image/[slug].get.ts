import { Client } from '@notionhq/client'
import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/json')

  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      return new Response('slug is not set', { status: 400 })
    }

    const slugNumber = Number(slug)

    if (isNaN(slugNumber)) {
      return new Response('slug is not a number', { status: 400 })
    }

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_BLOG_DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID

    if (!NOTION_API_KEY) {
      return new Response('NOTION_API_KEY is not set', { status: 500 })
    }

    if (!NOTION_BLOG_DATABASE_ID) {
      return new Response('NOTION_BLOG_DATABASE_ID is not set', { status: 500 })
    }

    const notion = new Client({ auth: NOTION_API_KEY })

    const { results } = await notion.databases.query({
      database_id: NOTION_BLOG_DATABASE_ID,
      filter: {
        and: [
          {
            property: 'status',
            status: { equals: 'published' }
          },
          {
            property: 'slug',
            unique_id: { equals: slugNumber }
          }
        ]
      },
      page_size: 1
    })

    if (results.length === 0) {
      return new Response('blog not found', { status: 404 })
    }

    const [result] = results

    if (!('properties' in result)) {
      throw new Error('properties not found')
    }

    if (!('ogpImage' in result.properties)) {
      throw new Error('ogpImage not found')
    }

    if (result.properties.ogpImage.type !== 'files') {
      throw new Error('image type is not files')
    }

    if (
      !Array.isArray(result.properties.ogpImage.files) ||
      result.properties.ogpImage.files.length === 0
    ) {
      return new Response('image not found', { status: 404 })
    }

    const [file] = result.properties.ogpImage.files

    const url =
      file.type === 'external'
        ? file.external.url
        : file.type === 'file'
          ? file.file.url
          : null

    if (url == null) {
      return new Response('image not found', { status: 404 })
    }

    const image = await fetch(url)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const webpBuffer = await sharp(buffer).webp().toBuffer()

    setHeader(event, 'Content-Type', 'image/webp')

    return webpBuffer
  } catch (e) {
    console.error(e)
    return new Response('Internal Server Error', { status: 500 })
  }
})
