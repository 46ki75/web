'use client'

import React, { useMemo, type ReactNode } from 'react'

import styles from './BlogMain.module.scss'

import { Breadcrumbs, Heading1, Image, InlineText } from 'relmethis'
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

// redux
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'

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
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  const iconStyle = useMemo(
    () => ({
      color: isDark ? 'white' : 'black',
      width: 16,
      height: 16,
      opacity: 0.8
    }),
    [isDark]
  )

  return (
    <main className={styles.main}>
      <Breadcrumbs
        isDark={isDark}
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
      <Heading1 isDark={isDark} locale='ja-JP'>
        {title}
      </Heading1>

      <div className={styles['main__date']}>
        <CalendarDaysIcon style={iconStyle} />
        <InlineText isDark={isDark} fontSize={'0.8rem'} opacity={0.6}>
          {createdAt}
        </InlineText>

        <ArrowPathIcon style={iconStyle} />
        <InlineText isDark={isDark} fontSize={'0.8rem'} opacity={0.7}>
          {updatedAt}
        </InlineText>
      </div>

      <Image isDark={isDark} src={ogp} alt={title} />

      <article>{children}</article>
    </main>
  )
}
