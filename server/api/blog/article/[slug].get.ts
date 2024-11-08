import { Client } from '@elmethis/notion-node'
import { Client as NotionClient } from '@notionhq/client'

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

    const notion = new NotionClient({ auth: NOTION_API_KEY })

    const { results } = await notion.databases.query({
      database_id: NOTION_BLOG_DATABASE_ID,
      filter: {
        property: 'slug',
        unique_id: { equals: slugNumber }
      },
      page_size: 1
    })

    if (results.length === 0) {
      return new Response('blog not found', { status: 404 })
    }

    const [result] = results

    const client = new Client({ auth: NOTION_API_KEY })

    await client.convert({ id: result.id })

    await client.save('public', slug)

    return client.components
  } catch (e) {
    console.error(e)
    return new Response('Internal Server Error', { status: 500 })
  }
})
