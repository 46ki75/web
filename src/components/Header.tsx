'use client'

import React from 'react'

import styles from './Header.module.scss'
import { useWindowScroll } from 'react-use'

export const Header = () => {
  const { y } = useWindowScroll()

  return (
    <header
      className={styles.header}
      style={{
        backgroundColor:
          y > 50 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'
      }}
    >
      Header
    </header>
  )
}
