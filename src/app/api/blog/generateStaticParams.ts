import { factory } from '@/Factory'
import { type NotionBlogPageProperty } from '@/models/backend'

export const generateStaticParams = async (): Promise<
  Array<{ slug: string }>
> => {
  const notion = await factory.getNotionClient()
  const { results } = await notion.databases.query<NotionBlogPageProperty>({
    id: await factory.getBlogDBID()
  })

  const slugs = results.map((result) => {
    return { slug: String(result.properties.slug.unique_id.number) }
  })

  return slugs
}
