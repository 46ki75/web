// utils
import { Markdown } from '@/utils/blog/Markdown'
import { Blog } from '../../components/blog/Blog'

import { NoSSR } from '@/components/nossr/NoSSR'

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const markdowns = Markdown.listAll()
  const blogMetadatas = markdowns.map((md) => md.toBlogMetadata())

  return (
    <NoSSR>
      <Blog blogMetadatas={blogMetadatas}>{children}</Blog>
    </NoSSR>
  )
}
