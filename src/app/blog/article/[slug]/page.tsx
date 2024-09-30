import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import React from 'react'

import { BlogMain } from '@/components/blog/BlogMain'
import { Markdown } from 'relmethis'

export function generateStaticParams() {
  const dirs = readdirSync(path.resolve('./public/static/blog/'))
  return dirs.map((dir) => ({ slug: dir }))
}

function getMarkdown(slug: string) {
  const filePath = path.join('./public/static/blog/', slug, `index.md`)
  const content = readFileSync(filePath, 'utf8')
  return content
}

const Page = async ({ params }: { params: { slug: string } }) => {
  const markdown = getMarkdown(params.slug)

  return (
    <BlogMain createdAt={'2022-10-01'} updatedAt={'2024-9-30'}>
      <Markdown markdown={markdown} />
    </BlogMain>
  )
}

export default Page
