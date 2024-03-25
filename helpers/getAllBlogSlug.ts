import { factory } from './Factory'
import { type NotionBlogPageProperty } from '../models/backend'
import { f, s } from 'notion-markup-utils'

export const getAllBlogSlug = async () => {
  const notion = await factory.getNotionClient()

  const { results } = await notion.databases.query<NotionBlogPageProperty>({
    id: await factory.getBlogDBID(),
    filter: {
      and: [f.status('status').equals('public')]
    },
    sorts: [s.descending('createdAt'), s.descending('updatedAt')],
    forceRefresh: true
  })

  if (results.length === 0) {
    return []
  }

  const response: string[] = results.map(({ url, properties }) => {
    if (
      properties.createdAt.date != null &&
      properties.updatedAt.date != null
    ) {
      return String(properties.slug.simplify())
    } else {
      throw new Error(`Date is Empty: URL -> ${url}`)
    }
  })

  return response
}
