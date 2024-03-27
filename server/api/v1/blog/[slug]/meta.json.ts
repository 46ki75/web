import { factory } from '~/helpers/Factory'
import { type NotionBlogPageProperty } from '@/models/backend'
import { f } from 'notion-markup-utils'

// models
import { type Blog } from '@/models/frontend'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (slug == null) return {}

  const notion = await factory.getNotionClient()

  const { results } = await notion.databases.query<NotionBlogPageProperty>({
    id: await factory.getBlogDBID(),
    filter: {
      and: [
        f.status('status').equals('public'),
        f.id('slug').equals(Number(slug))
      ]
    },
    forceRefresh: true
  })

  if (results.length === 0) {
    return {}
  }

  const [result] = results
  const { properties } = result

  if (properties.createdAt.date != null && properties.updatedAt.date != null) {
    const response: Blog = {
      slug: String(result.properties.slug.simplify()),
      title: properties.title.simplify(),
      description: properties.description.simplify(),
      tags: properties.tags.simplify(),
      status: properties.status.simplify(),
      createdAt: properties.createdAt.date.start,
      updatedAt: properties.updatedAt.date.start
    }

    return response
  } else {
    throw new Error(`Date is Empty: URL -> ${result.url}`)
  }
})
