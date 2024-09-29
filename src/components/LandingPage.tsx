'use client'

import dynamic from 'next/dynamic'

const FullscreenFallback = dynamic(
  () => import('relmethis').then((mod) => mod.FullscreenFallback),
  { ssr: false }
)

const Heading1 = dynamic(
  () => import('relmethis').then((mod) => mod.Heading1),
  { ssr: false }
)

import { Header } from '@/components/Header'
import { Suspense } from 'react'
import Link from 'next/link'

export const LandingPage = () => {
  return (
    <Suspense fallback={<FullscreenFallback />}>
      <div>
        <Heading1>INDEX PAGE (UNDER CONSTRUCTION)</Heading1>
        <Link href={'/blog'}>BLOG</Link>
      </div>
    </Suspense>
  )
}
