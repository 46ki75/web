import { factory } from '@/Factory'
import { type NextRequest, NextResponse } from 'next/server'
import { f } from 'notion-markup-utils'
import { type NotionBlogPageProperty } from '@/models/backend'

import fs from 'fs'
import path from 'path'

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

  if (results.length === 0) throw new Error('No article found.')
  const [result] = results

  if (result.properties.ogpImage.files.length === 0) {
    const imagePath = path.resolve('./public/images/noimage.webp')
    const buffer = fs.readFileSync(imagePath)
    return new NextResponse(buffer, {
      status: 200,
      headers: { 'Content-Type': 'image/webp' }
    })
  }

  const [ogpImageFileObject] = result.properties.ogpImage.files

  const ogpImageURL = String(ogpImageFileObject.simplify())

  const response = await fetch(ogpImageURL)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new NextResponse(buffer, {
    status: 200,
    headers: { 'Content-Type': 'image/webp' }
  })
}
