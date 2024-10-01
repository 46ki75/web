import React from 'react'

import styles from './BlogFooter.module.scss'
import { InlineLink, InlineText } from 'relmethis'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'

export const BlogFooter = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  return (
    <footer className={styles.footer}>
      <div className={styles['footer__link-wrapper']}>
        <div className={styles['footer__link-container']}>
          <InlineText isDark={isDark}>PLACEHOLDERS</InlineText>
          <InlineText isDark={isDark} opacity={0.6}>
            🚧 under construction
          </InlineText>
        </div>

        <div className={styles['footer__link-container']}>
          <InlineText isDark={isDark}>Socials</InlineText>
          <InlineLink href='https://github.com/46ki75' isDark={isDark}>
            GitHub
          </InlineLink>
          <InlineLink href='https://x.com/46ki75' isDark={isDark}>
            X (twitter)
          </InlineLink>
          <InlineLink href='mailto:info@46ki75.com' isDark={isDark}>
            email
          </InlineLink>
        </div>

        <div className={styles['footer__link-container']}>
          <div>
            <InlineText isDark={isDark}>Links</InlineText>
          </div>
          <div>
            <InlineLink href='https://github.com/46ki75' isDark={isDark}>
              GitHub
            </InlineLink>
          </div>
          <div>
            <InlineLink href='https://x.com/46ki75' isDark={isDark}>
              X (twitter)
            </InlineLink>
          </div>
          <div>
            <InlineLink href='mailto:info@46ki75.com' isDark={isDark}>
              email
            </InlineLink>
          </div>
        </div>
      </div>

      <InlineText isDark={isDark} opacity={0.8}>
        {`© 2021 - ${String(new Date().getFullYear())} Chomolungma Shirayuki`}
      </InlineText>
    </footer>
  )
}
