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
  mkdirSync('./public/_dist/blog', { recursive: true })
  writeFileSync(
    './public/_dist/blog/side.json',
    JSON.stringify(blogMetadatas),
    'utf-8'
  )

  return (
    <NoSSR>
      <Blog blogMetadatas={blogMetadatas}>{children}</Blog>
    </NoSSR>
  )
}
