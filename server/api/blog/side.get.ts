import { Client } from '@notionhq/client'

interface BlogMeta {
  slug: number
  title: string
  description: string
  tags: Array<{
    id: string
    name: string
    color: string
  }>
  createdAt: string
  updatedAt: string
  ogp: string
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/json')

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
      property: 'status',
      status: { equals: 'published' }
    },
    page_size: 10
  })

  const blogs = results.map((blog) => {
    if (!('properties' in blog)) {
      throw new Error('properties not found')
    }

    const properties = blog.properties

    if (!('slug' in properties)) {
      throw new Error('slug not found')
    }

    if (properties.slug.type !== 'unique_id') {
      throw new Error('slug type is not unique_id')
    }

    if (!('number' in properties.slug.unique_id)) {
      throw new Error('slug.number not found')
    }

    if (!('title' in properties)) {
      throw new Error('title not found')
    }

    if (properties.title.type !== 'title') {
      throw new Error('title type is not title')
    }

    if (!('description' in properties)) {
      throw new Error('description not found')
    }

    if (properties.description.type !== 'rich_text') {
      throw new Error('description type is not rich_text')
    }

    if (!('tags' in properties)) {
      throw new Error('tags not found')
    }

    if (properties.tags.type !== 'multi_select') {
      throw new Error('tags type is not multi_select')
    }

    if (!('created_time' in blog)) {
      throw new Error('created_time not found')
    }

    if (!('last_edited_time' in blog)) {
      throw new Error('last_edited_time not found')
    }

    return {
      slug: properties.slug.unique_id.number,
      title: properties.title.title.map((text) => text.plain_text).join(''),
      description: properties.description.rich_text
        .map((text) => text.plain_text)
        .join(''),
      tags: properties.tags.multi_select,
      createdAt: blog.created_time,
      updatedAt: blog.last_edited_time,
      ogp: `/api/blog/image/${properties.slug.unique_id.number}/ogp.webp`
    }
  })

  return blogs
})
