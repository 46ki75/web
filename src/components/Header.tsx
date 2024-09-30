'use client'

import React from 'react'

// scss modules
import styles from './Header.module.scss'

// react-use
import { useWindowScroll } from 'react-use'

// redux
import { useDispatch, useSelector } from 'react-redux'
import { type RootState } from '@/redux'
import { toggleTheme } from '@/redux/themeSlice'

export const Header = () => {
  const { y } = useWindowScroll()

  const dispatch = useDispatch()
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <header
      className={styles.header}
      style={{
        backgroundColor:
          y > 50 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'
      }}
    >
      <div>Header</div>
      <button
        onClick={() => {
          dispatch(toggleTheme())
        }}
      >
        {isDark ? 'DARK' : 'LIGHT'}
      </button>
    </header>
  )
}
