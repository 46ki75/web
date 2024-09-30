import { readdirSync } from 'fs'
import path from 'path'
import React from 'react'

import { BlogMain } from '@/components/blog/BlogMain'
import { Markdown as RelMarkdown } from 'relmethis'

// utils
import { Markdown } from '@/utils/blog/Markdown'

export function generateStaticParams() {
  const dirs = readdirSync(path.resolve('./public/static/blog/'))
  return dirs.map((dir) => ({ slug: dir }))
}

const Page = async ({ params }: { params: { slug: string } }) => {
  const markdown = Markdown.getBySlug(params.slug)

  return (
    <BlogMain createdAt={'2022-10-01'} updatedAt={'2024-9-30'}>
      <RelMarkdown markdown={markdown.markdown} />
    </BlogMain>
  )
}

export default Page
