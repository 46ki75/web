'use client'

import React, { ReactNode } from 'react'

import styles from './GlobalWrapper.module.scss'

// redux
import { RootState } from '@/redux'
import { useSelector } from 'react-redux'

// classnames
import clsx from 'clsx'
import { NoSSR } from './nossr/NoSSR'

export const GlobalWrapper = ({ children }: { children: ReactNode }) => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <NoSSR>
      <div
        className={clsx(styles.body, {
          [styles['body--light']]: !isDark,
          [styles['body--dark']]: isDark
        })}
      >
        {children}
      </div>
    </NoSSR>
  )
}
