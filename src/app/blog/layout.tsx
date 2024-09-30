import { BlogSide } from '@/components/blog/BlogSide'
import { Header } from '@/components/Header'

import styles from './layout.module.scss'

import { BlogFooter } from '@/components/blog/BlogFooter'
import { NoSSR } from '@/components/nossr/NoSSR'
import { Pagetop } from 'relmethis'
import { Parallax } from '@/components/blog/Parallax'

// node
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

export interface BlogMetadata {
  slug: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

const getMetadata = (): BlogMetadata[] => {
  const dirs = readdirSync(path.resolve('./public/static/blog/'))
  const metadatas: Array<BlogMetadata> = dirs.map((dir) => {
    const data = readFileSync(
      path.resolve('./public/static/blog/', dir, 'meta.json'),
      'utf-8'
    )
    return { ...JSON.parse(data), slug: dir }
  })

  return metadatas
}

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const meta = getMetadata()

  return (
    <>
      <NoSSR>
        <div className={styles.wrapper}>
          <Header />
          <div className={styles.container}>
            {children}
            <BlogSide metas={meta} />
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
