'use client'

import Link from 'next/link'
import React from 'react'
import { InlineText } from 'relmethis'

import styles from './NotFound.module.scss'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'
import { HomeIcon } from '@heroicons/react/24/outline'

export const NotFound = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <div className={styles['not-found']}>
      <>
        <InlineText isDark={isDark}>ページが見つかりませんでした。</InlineText>
        <Link href={'/'}>
          <HomeIcon
            className={styles['not-found__icon']}
            style={{
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
            }}
          />
        </Link>
      </>
    </div>
  )
}
