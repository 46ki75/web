'use client'

import React from 'react'

import styles from './BlogSide.module.scss'

import Link from 'next/link'
import { Url } from 'next/dist/shared/lib/router/router'

// icons
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

// relmethis
import { InlineText, Image } from 'relmethis'
import { BlogMetadata } from '@/app/blog/layout'

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
}

const BlogSideCard = ({
  href,
  image,
  title,
  description,
  createdAt,
  updatedAt,
  index
}: BlogSideCardProps) => {
  return (
    <Link
      href={href}
      className={styles['side-card']}
      style={{ animationDelay: `${index * 200}ms` }}
    >
      <Image src={image} alt={title} />
      <div className={styles['side-card__typography']}>
        <div>
          <InlineText fontSize={'1.1rem'}>{title}</InlineText>
        </div>
        <div>
          <InlineText fontSize={'0.8rem'} opacity={0.6}>
            {description}
          </InlineText>
        </div>
        <div className={styles['side-card__date']}>
          <CalendarDaysIcon className={styles['side-card__icon']} />
          <InlineText fontSize={'0.8rem'} opacity={0.6}>
            {createdAt}
          </InlineText>
          <ArrowPathIcon className={styles['side-card__icon']} />
          <InlineText fontSize={'0.8rem'} opacity={0.7}>
            {updatedAt}
          </InlineText>
        </div>
      </div>
    </Link>
  )
}

interface BlogSideProps {
  metas: Array<BlogMetadata>
}

export const BlogSide = ({ metas }: BlogSideProps) => {
  return (
    <nav className={styles.side}>
      {metas.map((data, index) => (
        <BlogSideCard
          key={data.slug}
          href={`/blog/article/${data.slug}`}
          image={`/static/blog/${data.slug}/ogp.webp`}
          title={data.title}
          description={data.description}
          createdAt={data.createdAt}
          updatedAt={data.updatedAt}
          index={index + 1}
        />
      ))}
    </nav>
  )
}
