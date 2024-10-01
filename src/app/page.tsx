import { LandingPage } from '@/components/LandingPage'
import { NoSSR } from '@/components/nossr/NoSSR'

export default function Home() {
  return (
    <NoSSR>
      <LandingPage />
    </NoSSR>
  )
}
