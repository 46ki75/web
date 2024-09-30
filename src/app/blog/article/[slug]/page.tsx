import { readdirSync } from 'fs'
import path from 'path'
import React from 'react'

import { BlogMain } from '@/components/blog/BlogMain'

import config from '@/config'

// utils
import { Markdown } from '@/utils/blog/Markdown'

// types
import { type Metadata } from 'next'
import { BlogArticle } from '@/components/blog/BlogArticle'

export function generateStaticParams() {
  const slugs = readdirSync(path.resolve('./public/static/blog/'))
  return slugs.map((slug) => ({ slug }))
}

export function generateMetadata({
  params
}: {
  params: { slug: string }
}): Metadata {
  const markdown = Markdown.getBySlug(params.slug)

  return {
    title: markdown.title,
    description: markdown.description,
    openGraph: {
      title: markdown.title,
      description: markdown.description,
      images: [`https://${config.domain}${markdown.ogp}`]
    }
  }
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
      <BlogArticle markdown={markdown.markdown} />
    </BlogMain>
  )
}

export default Page
