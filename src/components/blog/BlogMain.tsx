'use client'

import React, { type ReactNode } from 'react'

import styles from './BlogMain.module.scss'

import { Breadcrumbs, Heading1 } from 'relmethis'

export const BlogMain = ({ children }: { children: ReactNode }) => {
  return (
    <main className={styles.main}>
      <Breadcrumbs
        align='left'
        links={[
          { href: '/', label: 'HOME', color: '#449763' },
          { href: 'blog', label: 'BLOG', color: '#4c6da2' }
        ]}
      />
      <Heading1 locale='ja-JP'>BlogMain</Heading1>

      <article>{children}</article>
    </main>
  )
}
