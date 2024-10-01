'use client'

import React, { useEffect, useState } from 'react'

import {
  BlockFallback,
  parseMarkdownToMdast,
  RenderMdast,
  Root,
  TableOfContents
} from 'relmethis'

// redux
import { RootState } from '@/redux'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'

export const BlogArticle = React.memo(({ markdown }: { markdown: string }) => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  const [mdast, setMdast] = useState<Root | null>(null)

  useEffect(() => {
    setMdast(parseMarkdownToMdast(markdown))
  }, [markdown])

  if (mdast == null) return <BlockFallback />

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
}, isEqual)

BlogArticle.displayName = 'BlogArticle'
