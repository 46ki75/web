import { BlogSide } from '@/components/blog/BlogSide'
import { Header } from '@/components/Header'

import styles from './page.module.scss'
import { BlogFooter } from '@/components/blog/BlogFooter'
import { NoSSR } from '@/components/nossr/NoSSR'

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        {children}
        <NoSSR>
          <BlogSide />
        </NoSSR>
      </div>
      <BlogFooter />
    </div>
  )
}
