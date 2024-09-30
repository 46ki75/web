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
    <BlogMain
      title={markdown.title}
      ogp={markdown.ogp}
      createdAt={markdown.createdAt}
      updatedAt={markdown.updatedAt}
      slug={markdown.slug}
    >
      <RelMarkdown markdown={markdown.markdown} locale='ja-JP' />
    </BlogMain>
  )
}

export default Page
