import { factory } from '@/Factory'
import { NextResponse } from 'next/server'
import { type NotionBlogPageProperty } from '../NotionBlogPageProperty'
import { f, s } from 'notion-markup-utils'

// models
import { type Blog } from '@/models/frontend'

export const GET = async (): Promise<NextResponse> => {
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
    return NextResponse.json({}, { status: 404 })
  }

  const response: Blog[] = results.map(({ url, properties }) => {
    if (
      properties.createdAt.date != null &&
      properties.updatedAt.date != null
    ) {
      return {
        slug: String(properties.slug.simplify()),
        title: properties.title.simplify(),
        description: properties.description.simplify(),
        tags: properties.tags.simplify(),
        status: properties.status.simplify(),
        createdAt: properties.createdAt.date?.start,
        updatedAt: properties.updatedAt.date?.start
      }
    } else {
      throw new Error(`Date is Empty: URL -> ${url}`)
    }
  })

  return NextResponse.json(response)
}
