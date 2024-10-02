import { BlogMetadata } from '@/utils/blog/Markdown'
import Fuse, { type IFuseOptions } from 'fuse.js'

const options: IFuseOptions<BlogMetadata> = {
  includeScore: true,
  shouldSort: true,
  minMatchCharLength: 2,
  threshold: 0.4,
  ignoreLocation: true,
  keys: ['title', 'description']
}

interface MessageEventInput {
  keyword: string
  blogMetadatas: BlogMetadata[]
}

self.onmessage = (event: MessageEvent<MessageEventInput>) => {
  const { keyword, blogMetadatas } = event.data
  const fuse = new Fuse(blogMetadatas, options)
  const result = fuse.search(keyword).slice(0, 10)
  self.postMessage({ result })
}
