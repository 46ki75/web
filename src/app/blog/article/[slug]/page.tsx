import { readdirSync } from 'fs'
import path from 'path'
import React from 'react'

export function generateStaticParams() {
  const dirs = readdirSync(path.resolve('./public/static/blog/'))
  return dirs.map((dir) => ({ slug: dir }))
}

const Page = async () => {
  return <div>HEY!</div>
}

export default Page
