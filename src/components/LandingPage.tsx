'use client'

import styles from './LandingPage.module.scss'
import clsx from 'clsx'

// redux
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'

import Link from 'next/link'
import { NoSSR } from './nossr/NoSSR'
import { Heading1 } from 'relmethis'

export const LandingPage = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <NoSSR>
      <div
        className={clsx(styles.wrapper, {
          [styles['wrapper--light']]: !isDark,
          [styles['wrapper--dark']]: isDark
        })}
      >
        <Link href={'/blog'} style={{ fontSize: 32 }}>
          BLOG
        </Link>
        <Heading1>INDEX PAGE (UNDER CONSTRUCTION)</Heading1>
      </div>
    </NoSSR>
  )
}
