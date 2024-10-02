// utils
import { Markdown } from '@/utils/blog/Markdown'
import { Blog } from '../../components/blog/Blog'

import { NoSSR } from '@/components/nossr/NoSSR'
import { mkdirSync, writeFileSync } from 'fs'

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const markdowns = Markdown.listAll()
  const blogMetadatas = markdowns.map((md) => md.toBlogMetadata())
  const sortedBlogMetadatas = blogMetadatas.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const sortedBlogMetadatasLatest = sortedBlogMetadatas.slice(0, 10)

  mkdirSync('./public/_dist/blog', { recursive: true })
  writeFileSync(
    './public/_dist/blog/meta.json',
    JSON.stringify(sortedBlogMetadatas),
    'utf-8'
  )

  return (
    <NoSSR>
      <Blog blogMetadatas={sortedBlogMetadatasLatest}>{children}</Blog>
    </NoSSR>
  )
}
