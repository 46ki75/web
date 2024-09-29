// global styles
import './globals.scss'

// Global NO SSR
import dynamic from 'next/dynamic'
const Body = dynamic(
  () => import('../components/Body').then((mod) => mod.Body),
  { ssr: false }
)

// fonts
import { Noto_Sans_JP } from 'next/font/google'
const notoSansJp = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: []
})

// layout
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='ja' className={notoSansJp.className}>
      <body>
        <Body>{children}</Body>
      </body>
    </html>
  )
}
