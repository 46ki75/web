// global styles
import './globals.scss'

// fonts
import { Noto_Sans_JP } from 'next/font/google'
const notoSansJp = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: [],
  preload: true
})

// SEO Meta
import { Metadata } from 'next'
import config from '@/config'
export const metadata: Metadata = {
  authors: [{ name: 'Chomolungma Shirayuki', url: 'https://www.46ki75.com' }],
  openGraph: {
    type: 'website',
    locale: 'ja-JP',
    siteName: '', // TODO: enter the site name
    images: [`https://${config.domain}/static/home/index-ogp.webp`] // TODO: replace the placeholder
  }
}

// layout
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='ja' className={notoSansJp.className}>
      <body>{children}</body>
    </html>
  )
}
