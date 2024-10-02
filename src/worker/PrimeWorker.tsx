'use client'

import { RootState } from '@/redux'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Heading2, InlineText } from 'relmethis'

const createWorker = () =>
  new Worker(new URL('./primeWorker.ts', import.meta.url))

export const PrimeWorker = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark)

  const [input, setInput] = useState<number>(1)
  const [prime, setPrime] = useState<number | null>(null)

  useEffect(() => {
    const worker = createWorker()

    worker.onmessage = (event: MessageEvent) => {
      setPrime(event.data.result)
    }

    setPrime(null)
    worker.postMessage({ x: input })

    return () => {
      worker.terminate()
    }
  }, [input])

  return (
    <div>
      <Heading2 isDark={isDark}>Find the nth Prime Number</Heading2>
      <p>
        <input
          type='number'
          value={input}
          onChange={(e) => setInput(parseInt(e.target.value))}
          min='1'
        />
        <InlineText isDark={isDark}>
          {`番目の素数: ${prime == null ? '計算中' : prime}`}
        </InlineText>
      </p>
    </div>
  )
}
