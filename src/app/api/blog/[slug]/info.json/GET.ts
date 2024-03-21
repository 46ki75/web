import { factory } from '@/Factory'
import { type NextRequest, NextResponse } from 'next/server'
import { type NotionBlogPageProperty } from '@/models/backend'
import { f } from 'notion-markup-utils'

import { load } from 'cheerio'
import { saveImages } from './saveImages'

// models
import { type BlogWithHTML } from '@/models/frontend'

export const GET = async (
  _: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> => {
  const notion = await factory.getNotionClient()

  const { results } = await notion.databases.query<NotionBlogPageProperty>({
    id: await factory.getBlogDBID(),
    filter: {
      and: [
        f.status('status').equals('public'),
        f.id('slug').equals(Number(params.slug))
      ]
    },
    forceRefresh: true
  })

  if (results.length === 0) {
    return NextResponse.json({}, { status: 404 })
  }

  const [result] = results
  const { properties } = result

  const html = await notion.blocks.getHTML({ id: result.id })

  const $ = load(String(html))
  const imageURLs: string[] = []

  $('img').each((index, element) => {
    const src = $(element).attr('src')
    if (src != null) imageURLs.push(src)
    $(element).attr('src', `/images/blog/${params.slug}/i${index}.webp`)
  })

  await saveImages(imageURLs, params.slug)

  if (properties.createdAt.date != null && properties.updatedAt.date != null) {
    const response: BlogWithHTML = {
      slug: String(result.properties.slug.simplify()),
      title: properties.title.simplify(),
      description: properties.description.simplify(),
      tags: properties.tags.simplify(),
      status: properties.status.simplify(),
      createdAt: properties.createdAt.date.start,
      updatedAt: properties.updatedAt.date.start,
      html: $.html()
    }

    return NextResponse.json(response)
  } else {
    throw new Error(`Date is Empty: URL -> ${result.url}`)
  }
}
