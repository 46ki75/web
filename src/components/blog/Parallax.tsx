'use client'

import React from 'react'

import styles from './Parallax.module.scss'

import { useWindowScroll } from 'react-use'

export const Parallax = () => {
  const { y } = useWindowScroll()
  return (
    <>
      <div
        className={styles.bg1}
        style={{
          transform: `scale(1.2) translateY(${y / 400}%)`,
          transformOrigin: 'bottom'
        }}
      ></div>
      <div
        className={styles.bg2}
        style={{
          transform: `scale(1.2) translateY(${y / 900}%)`,
          transformOrigin: 'bottom'
        }}
      ></div>
    </>
  )
}
