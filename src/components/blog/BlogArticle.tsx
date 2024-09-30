'use client'

import React from 'react'

import { Markdown } from 'relmethis'

// redux
import { RootState } from '@/redux'
import { useSelector } from 'react-redux'

export const BlogArticle = ({ markdown }: { markdown: string }) => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <>
      <Markdown isDark={isDark} markdown={markdown} locale='ja-JP' />
    </>
  )
}
