'use client'

import React from 'react'

import styles from './BlogCard.module.scss'

import Link from 'next/link'
import { Url } from 'next/dist/shared/lib/router/router'

// icons
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

// relmethis
import { InlineText, Image, RainbowFrame } from 'relmethis'

// # --------------------------------------------------------------------------------
//
// component
//
// # --------------------------------------------------------------------------------

interface BlogCardProps {
  href: Url
  image: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  index: number
  isDark: boolean
  scrollToTop: () => void
}

export const BlogCard = ({
  href,
  image,
  title,
  description,
  createdAt,
  updatedAt,
  index,
  isDark,
  scrollToTop
}: BlogCardProps) => {
  return (
    <Link
      href={href}
      className={styles.card}
      style={{
        animationDelay: `${index * 200}ms`
      }}
      onClick={scrollToTop}
    >
      <RainbowFrame opacity={0.3} strokeWidth={2} displayOnHover />

      <Image isDark={isDark} src={image} alt={title} disableModal />
      <div
        className={styles['card__typography']}
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
        <div className={styles['card__date']}>
          <CalendarDaysIcon
            className={styles['card__icon']}
            style={{ color: isDark ? 'white' : 'black' }}
          />
          <InlineText isDark={isDark} fontSize={'0.8rem'} opacity={0.6}>
            {createdAt}
          </InlineText>
          <ArrowPathIcon
            className={styles['card__icon']}
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
