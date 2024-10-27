'use client'

import React, { useCallback, useRef } from 'react'

import styles from './BlogSide.module.scss'

import { useRouter } from 'next/navigation'

// relmethis
import { ArticleCard, TableOfContents } from 'relmethis'

// utils
import { type BlogMetadata } from '@/utils/blog/Markdown'

// redux
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'
import { usePathname } from 'next/navigation'
import { useMedia } from 'react-use'

// # --------------------------------------------------------------------------------
//
// component
//
// # --------------------------------------------------------------------------------

interface BlogSideProps {
  blogMetadatas: BlogMetadata[]
}

export const BlogSide = ({ blogMetadatas }: BlogSideProps) => {
  const router = useRouter()

  const isDark = useSelector((state: RootState) => state.theme.isDark)
  const headings = useSelector((state: RootState) => state.headings.headings)

  const isMobile = useMedia('(max-width: 992px)')

  const pathname = usePathname()
  const isShow = pathname?.match(/^\/blog\/article\/.+$/) && !isMobile

  const scrollableRef = useRef<HTMLElement>(null)

  const scrollToTop = useCallback(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = 0
    }
  }, [scrollableRef])

  return (
    <nav ref={scrollableRef} className={styles.side}>
      {isShow && (
        <TableOfContents
          headings={headings}
          isDark={isDark}
          fontSizeRatio={0.8}
        />
      )}

      {blogMetadatas.map((meta) => (
        <ArticleCard
          key={meta.slug}
          image={`/static/blog/${meta.slug}/ogp.webp`}
          title={meta.title}
          description={meta.description}
          createdAt={meta.createdAt}
          updatedAt={meta.updatedAt}
          isDark={isDark}
          onClick={() => {
            scrollToTop()
            router.push(`/blog/article/${meta.slug}`)
          }}
        />
      ))}
    </nav>
  )
}
