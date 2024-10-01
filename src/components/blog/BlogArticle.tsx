'use client'

import React, { useEffect, useState } from 'react'

import {
  BlockFallback,
  parseMarkdownToMdast,
  RenderMdast,
  Root
} from 'relmethis'

// redux
import { RootState } from '@/redux'
import { useDispatch, useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { setHeadings } from '@/redux/headingsSlice'

export const BlogArticle = React.memo(({ markdown }: { markdown: string }) => {
  const dispatch = useDispatch()
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

  dispatch(setHeadings(headings))

  return (
    <>
      {markdownComponent}
      {footnoteComponent}
    </>
  )
}, isEqual)

BlogArticle.displayName = 'BlogArticle'
