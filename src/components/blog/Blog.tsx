'use client'

import { BlogSide } from '@/components/blog/BlogSide'
import { Header } from '@/components/Header'

import styles from './Blog.module.scss'

import { BlogFooter } from '@/components/blog/BlogFooter'
import { Parallax } from '@/components/blog/Parallax'

import { type BlogMetadata } from '@/utils/blog/Markdown'
import { type ReactNode } from 'react'

// redux
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'

import clsx from 'clsx'

interface BlogProps {
  children: ReactNode
  blogMetadatas: BlogMetadata[]
}

export function Blog({ children, blogMetadatas }: BlogProps) {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <>
      <div
        className={clsx(styles.wrapper, {
          [styles['wrapper--light']]: !isDark,
          [styles['wrapper--dark']]: isDark
        })}
      >
        <Header />
        <div className={styles.container}>
          {children}
          <BlogSide blogMetadatas={blogMetadatas} />
        </div>
        <BlogFooter />
        <Parallax isDark={isDark} />
      </div>
    </>
  )
}
