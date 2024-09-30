'use client'

import React from 'react'

import { Pagetop as P } from 'relmethis'

// redux
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'

export const Pagetop = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)
  return <P isDark={isDark} />
}
