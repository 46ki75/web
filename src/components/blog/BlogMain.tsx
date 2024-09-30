'use client'

import React, { type ReactNode } from 'react'

import styles from './BlogMain.module.scss'

import { Breadcrumbs, Heading1, Image, InlineText } from 'relmethis'
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

interface BlogMainProps {
  children: ReactNode
  title: string
  ogp: string
  createdAt: string
  updatedAt: string
  slug?: string
}

export const BlogMain = ({
  children,
  title,
  ogp,
  createdAt,
  updatedAt,
  slug
}: BlogMainProps) => {
  return (
    <main className={styles.main}>
      <Breadcrumbs
        align='left'
        links={[
          { href: '/', label: 'HOME', color: '#449763' },
          { href: '/blog', label: 'BLOG', color: '#4c6da2' },
          ...(slug != null
            ? [
                {
                  href: `/blog/article/${slug}`,
                  label: 'ARTICLE',
                  color: '#9771bd'
                }
              ]
            : [])
        ]}
      />
      <Heading1 locale='ja-JP'>{title}</Heading1>

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

      <Image src={ogp} alt={title} />

      <article>{children}</article>
    </main>
  )
}
