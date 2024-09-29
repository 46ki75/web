'use client'

import dynamic from 'next/dynamic'

const FullscreenFallback = dynamic(
  () => import('relmethis').then((mod) => mod.FullscreenFallback),
  { ssr: false }
)

import React, { type ReactNode, Suspense } from 'react'

export const FirstLoading = ({ children }: { children: ReactNode }) => {
  return <Suspense fallback={<FullscreenFallback />}>{children}</Suspense>
}
