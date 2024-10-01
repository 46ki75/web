'use client'

import styles from './LandingPage.module.scss'

// redux
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'

import Link from 'next/link'

import { Heading1 } from 'relmethis'

export const LandingPage = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <div className={styles.wrapper}>
      <Link href={'/blog'} style={{ fontSize: 32 }}>
        BLOG
      </Link>
      <Heading1 isDark={isDark}>INDEX PAGE (UNDER CONSTRUCTION)</Heading1>
    </div>
  )
}
