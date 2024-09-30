import { BlogMain } from '@/components/blog/BlogMain'
import React from 'react'

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
