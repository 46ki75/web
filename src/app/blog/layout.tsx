import { BlogSide } from '@/components/blog/BlogSide'
import { Header } from '@/components/Header'

import styles from './layout.module.scss'

import { BlogFooter } from '@/components/blog/BlogFooter'
import { NoSSR } from '@/components/nossr/NoSSR'
import { Pagetop } from 'relmethis'
import { Parallax } from '@/components/blog/Parallax'

// utils
import { Markdown } from '@/utils/blog/Markdown'

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  // const meta = getMetadata()

  const markdowns = Markdown.listAll()
  const blogMetadatas = markdowns.map((md) => md.toBlogMetadata())

  return (
    <>
      <NoSSR>
        <div className={styles.wrapper}>
          <Header />
          <div className={styles.container}>
            {children}
            <BlogSide blogMetadatas={blogMetadatas} />
          </div>
          <BlogFooter />
          <Parallax />
        </div>
      </NoSSR>
      <NoSSR>
        <Pagetop />
      </NoSSR>
    </>
  )
}
