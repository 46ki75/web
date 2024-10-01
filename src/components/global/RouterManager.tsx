'use client'

import React, { useEffect } from 'react'

import { useRouter } from 'next/router'

export const RouterManager = () => {
  const router = useRouter()

  const handleRouteChangeStart = () => {
    console.log('遷移完了時の処理を実行')
  }

  const handleRouteChangeComplete = () => {
    console.log('遷移完了時の処理を実行')
  }

  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChangeComplete)
    router.events.on('routeChangeStart', handleRouteChangeStart)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
      router.events.off('routeChangeStart', handleRouteChangeStart)
    }
  }, [router])

  return <></>
}
