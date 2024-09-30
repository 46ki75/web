import { BlogMain } from '@/components/blog/BlogMain'
import React from 'react'

import config from '@/config'

import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'BLOG TOP',
  description: '', // TODO: enter the description
  openGraph: {
    title: 'BLOG TOP',
    description: '', // TODO: enter the description
    images: [`https://${config.domain}/static/blog/index-ogp.webp`] // TODO: replace the placeholder
  }
}

export default function Blog() {
  return (
    <>
      <BlogMain
        title='BLOG TOP'
        ogp='/static/blog/index-ogp.webp'
        createdAt={'2022-10-01'}
        updatedAt={'2024-9-30'}
      >
        <div>BLOG TOP PAGE CONTENTS (HARD CODING)</div>
      </BlogMain>
    </>
  )
}
