// global styles
import './globals.scss'

// fonts
import { Noto_Sans_JP } from 'next/font/google'
const notoSansJp = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: [],
  preload: true
})

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
