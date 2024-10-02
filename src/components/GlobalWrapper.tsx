'use client'

import React, { ReactNode } from 'react'

import styles from './GlobalWrapper.module.scss'

// redux
import { RootState } from '@/redux'
import { useSelector } from 'react-redux'

// classnames
import clsx from 'clsx'
import { NoSSR } from './nossr/NoSSR'

// lazy
import dynamic from 'next/dynamic'
const Pagetop = dynamic(() => import('relmethis').then((mod) => mod.Pagetop), {
  ssr: false
})

// react-query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const client = new QueryClient()

export const GlobalWrapper = ({ children }: { children: ReactNode }) => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <NoSSR>
      <QueryClientProvider client={client}>
        <div
          className={clsx(styles.body, {
            [styles['body--light']]: !isDark,
            [styles['body--dark']]: isDark
          })}
        >
          {children}
        </div>
        <Pagetop isDark={isDark} />
      </QueryClientProvider>
    </NoSSR>
  )
}
