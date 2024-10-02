'use client'

import React, { useState } from 'react'

import styles from './BlogSide.module.scss'

import Link from 'next/link'
import { Url } from 'next/dist/shared/lib/router/router'

// icons
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

// relmethis
import { InlineText, Image, TableOfContents, RainbowFrame } from 'relmethis'

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

interface BlogSideCardProps {
  href: Url
  image: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  index: number
  isDark: boolean
}

const BlogSideCard = ({
  href,
  image,
  title,
  description,
  createdAt,
  updatedAt,
  index,
  isDark
}: BlogSideCardProps) => {
  const [isHover, setIsHover] = useState(false)

  return (
    <Link
      href={href}
      className={styles['side-card']}
      style={{
        animationDelay: `${index * 200}ms`
      }}
      onMouseOver={() => {
        setIsHover(true)
      }}
      onMouseLeave={() => {
        setIsHover(false)
      }}
    >
      {isHover && <RainbowFrame opacity={0.3} strokeWidth={2} />}
      <Image isDark={isDark} src={image} alt={title} disableModal />
      <div
        className={styles['side-card__typography']}
        style={{
          backgroundColor: isDark
            ? 'rgba(0, 0, 0, 0.25)'
            : 'rgba(255, 255, 255, 0.25)'
        }}
      >
        <div>
          <InlineText isDark={isDark} fontSize={'1.1rem'}>
            {title}
          </InlineText>
        </div>
        <div>
          <InlineText isDark={isDark} fontSize={'0.8rem'} opacity={0.6}>
            {description}
          </InlineText>
        </div>
        <div className={styles['side-card__date']}>
          <CalendarDaysIcon
            className={styles['side-card__icon']}
            style={{ color: isDark ? 'white' : 'black' }}
          />
          <InlineText isDark={isDark} fontSize={'0.8rem'} opacity={0.6}>
            {createdAt}
          </InlineText>
          <ArrowPathIcon
            className={styles['side-card__icon']}
            style={{ color: isDark ? 'white' : 'black' }}
          />
          <InlineText isDark={isDark} fontSize={'0.8rem'} opacity={0.7}>
            {updatedAt}
          </InlineText>
        </div>
      </div>
    </Link>
  )
}

interface BlogSideProps {
  blogMetadatas: BlogMetadata[]
}

export const BlogSide = ({ blogMetadatas }: BlogSideProps) => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)
  const headings = useSelector((state: RootState) => state.headings.headings)

  const isMobile = useMedia('(max-width: 992px)')

  const pathname = usePathname()
  const isShow = pathname.match(/^\/blog\/article\/.+$/) && !isMobile

  return (
    <nav className={styles.side}>
      {isShow && (
        <TableOfContents
          headings={headings}
          isDark={isDark}
          fontSizeRatio={0.8}
        />
      )}

      {blogMetadatas.map((meta, index) => (
        <BlogSideCard
          key={meta.slug}
          href={`/blog/article/${meta.slug}`}
          image={`/static/blog/${meta.slug}/ogp.webp`}
          title={meta.title}
          description={meta.description}
          createdAt={meta.createdAt}
          updatedAt={meta.updatedAt}
          index={index + 1}
          isDark={isDark}
        />
      ))}
    </nav>
  )
}
