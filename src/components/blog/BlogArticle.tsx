'use client'

import React from 'react'

import { parseMarkdownToMdast, RenderMdast, TableOfContents } from 'relmethis'

// redux
import { RootState } from '@/redux'
import { useSelector } from 'react-redux'

export const BlogArticle = ({ markdown }: { markdown: string }) => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  const mdast = parseMarkdownToMdast(markdown)

  const { headings, markdownComponent, footnoteComponent } = RenderMdast({
    mdastNodes: mdast.children,
    definitions: [],
    footnoteComponent: [],
    isDark,
    locale: 'ja-JP'
  })

  return (
    <>
      <TableOfContents headings={headings} isDark={isDark} />
      {markdownComponent}
      {footnoteComponent}
    </>
  )
}
