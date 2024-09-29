'use client'

import React from 'react'

import dynamic from 'next/dynamic'

const Heading1 = dynamic(
  () => import('relmethis').then((mod) => mod.Heading1),
  { ssr: false }
)

export const BlogMain = () => {
  return (
    <main>
      <Heading1 locale='ja-JP'>BlogMain</Heading1>
    </main>
  )
}
