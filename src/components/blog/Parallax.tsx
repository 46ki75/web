'use client'

import React from 'react'

import styles from './Parallax.module.scss'

import { useWindowScroll } from 'react-use'

interface ParallaxProps {
  isDark: boolean
}

export const Parallax = ({ isDark }: ParallaxProps) => {
  const { y } = useWindowScroll()
  const opacity = isDark ? 0.08 : 0.5
  return (
    <>
      <div
        className={styles.bg1}
        style={{
          transform: `scale(1.2) translateY(${y / 400}%)`,
          transformOrigin: 'bottom',
          opacity
        }}
      ></div>
      <div
        className={styles.bg2}
        style={{
          transform: `scale(1.2) translateY(${y / 900}%)`,
          transformOrigin: 'bottom',
          opacity
        }}
      ></div>
    </>
  )
}
