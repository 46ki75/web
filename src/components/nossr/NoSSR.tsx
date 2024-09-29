'use client'

import React, { type ReactNode } from 'react'

import dynamic from 'next/dynamic'

const RenderChildren = dynamic(
  () => import('./RenderChildren').then((mod) => mod.RenderChildren),
  { ssr: false }
)
export const NoSSR = ({ children }: { children: ReactNode }) => {
  return <RenderChildren>{children}</RenderChildren>
}
