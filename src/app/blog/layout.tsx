import { BlogSide } from '@/components/blog/BlogSide'
import { Header } from '@/components/Header'

import styles from './layout.module.scss'

import { BlogFooter } from '@/components/blog/BlogFooter'
import { NoSSR } from '@/components/nossr/NoSSR'
import { Pagetop } from 'relmethis'

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <NoSSR>
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.container}>
          {children}
          <BlogSide />
        </div>
        <BlogFooter />
        <Pagetop />
      </div>
    </NoSSR>
  )
}
