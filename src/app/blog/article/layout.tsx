import React, { ReactNode } from 'react'

import { BlogMain } from '@/components/blog/BlogMain'

const MdxLayout = ({ children }: { children: ReactNode }) => {
  return (
    <BlogMain createdAt={'2022-10-01'} updatedAt={'2024-9-30'}>
      {children}
    </BlogMain>
  )
}

export default MdxLayout
