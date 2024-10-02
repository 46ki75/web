'use client'

import { RootState } from '@/redux'
import { BlogMetadata } from '@/utils/blog/Markdown'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { FuseResult } from 'fuse.js'
import React, { useDeferredValue, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { BlockFallback, Heading2, Paragraph } from 'relmethis'

const ENDPOINT = '/_dist/blog/meta.json'

const createWorker = () =>
  new Worker(new URL('./blogSearchWorker.ts', import.meta.url))

export const BlogSearchWorker = () => {
  const { data } = useQuery({
    queryKey: [ENDPOINT],
    queryFn: async () => (await axios.get<BlogMetadata[]>(ENDPOINT)).data
  })

  const isDark = useSelector((state: RootState) => state.theme.isDark)

  const [keyword, setKeyword] = useState<string>('')
  const deferredKeyword = useDeferredValue(keyword)
  const [meta, setMeta] = useState<FuseResult<BlogMetadata>[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const worker = createWorker()

    worker.onmessage = (event: MessageEvent) => {
      setMeta(event.data.result)
      setIsLoading(false)
    }

    setIsLoading(true)
    worker.postMessage({ keyword: deferredKeyword, blogMetadatas: data })

    return () => {
      worker.terminate()
    }
  }, [data, deferredKeyword])

  return (
    <div>
      <Heading2 isDark={isDark}>ブログ記事検索</Heading2>
      <p>
        <input
          type='text'
          value={keyword}
          onChange={(e) => setKeyword(String(e.target.value))}
        />
        {isLoading ? (
          <BlockFallback />
        ) : (
          meta?.map((m) => (
            <Paragraph key={m.item.slug} isDark={isDark}>
              {m.item.title}
            </Paragraph>
          ))
        )}
      </p>
    </div>
  )
}
