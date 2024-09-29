'use client'

import React, { type ReactNode } from 'react'

import styles from './BlogMain.module.scss'

import { Breadcrumbs, Heading1, InlineText } from 'relmethis'
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

interface BlogMainProps {
  children: ReactNode
  createdAt: string
  updatedAt: string
}

export const BlogMain = ({ children, createdAt, updatedAt }: BlogMainProps) => {
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

      <div className={styles['main__date']}>
        <CalendarDaysIcon className={styles['main__icon']} />
        <InlineText fontSize={'0.8rem'} opacity={0.6}>
          {createdAt}
        </InlineText>
        <ArrowPathIcon className={styles['main__icon']} />
        <InlineText fontSize={'0.8rem'} opacity={0.7}>
          {updatedAt}
        </InlineText>
      </div>

      <article>{children}</article>
    </main>
  )
}
