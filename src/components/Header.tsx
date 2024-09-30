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

import { InlineText, ToggleTheme } from 'relmethis'

export const Header = () => {
  const { y } = useWindowScroll()

  const dispatch = useDispatch()
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <header
      className={styles.header}
      style={{
        backgroundColor: isDark
          ? y > 50
            ? 'rgba(0, 0, 0, 0.1)'
            : 'rgba(0, 0, 0, 0.8)'
          : y > 50
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.8)'
      }}
    >
      <InlineText isDark={isDark}>Header</InlineText>

      <ToggleTheme
        isDark={isDark}
        size={'28px'}
        onClick={() => {
          dispatch(toggleTheme())
        }}
      />
    </header>
  )
}
