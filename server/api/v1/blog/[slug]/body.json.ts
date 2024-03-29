import { factory } from '~/helpers/Factory'
import { type NotionBlogPageProperty } from '@/models/backend'
import { f } from 'notion-markup-utils'

import { saveImages } from '../../../../../helpers/saveImages'

// models
import { DOMJSON } from 'notion-markup-utils/dist/block/DOMJSON'

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

  const rawDom = await notion.blocks.getDOMJSON({ id: result.id })
  const convertedDom = convertDomJSON(rawDom, String(slug))

  // console.log(convertedDom)

  await saveImages(convertedDom.newUrls, slug)

  return convertedDom.updatedDOMs
})

const convertDomJSON = (
  doms: DOMJSON[],
  slug: string,
  index: number = 0,
  urls: string[] = []
): { updatedDOMs: DOMJSON[]; newUrls: string[]; newIndex: number } => {
  let currentIndex = index
  for (const dom of doms) {
    if (dom.type === 'image' && dom.url != null) {
      urls.push(dom.url)
      dom.url = `/images/blog/${slug}/i${currentIndex}.webp`
      currentIndex++
    }
    if (dom.children.length > 0) {
      const { updatedDOMs, newUrls, newIndex } = convertDomJSON(
        dom.children,
        slug,
        currentIndex,
        urls
      )
      dom.children = updatedDOMs
      urls = newUrls
      currentIndex = newIndex
    }
  }
  return { updatedDOMs: doms, newUrls: urls, newIndex: currentIndex }
}
