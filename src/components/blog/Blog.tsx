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

interface BlogProps {
  children: ReactNode
  blogMetadatas: BlogMetadata[]
}

export function Blog({ children, blogMetadatas }: BlogProps) {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <>
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.container}>
          <div
            className={styles['blog-main-wrapper']}
            style={{
              backgroundColor: isDark
                ? 'rgba(0, 0, 0, 0.25)'
                : 'rgba(255, 255, 255, 0.25)'
            }}
          >
            {children}
          </div>
          <BlogSide blogMetadatas={blogMetadatas} />
        </div>
        <BlogFooter />
        <Parallax isDark={isDark} />
      </div>
    </>
  )
}
