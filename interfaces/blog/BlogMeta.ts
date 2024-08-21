import type { Select } from './Select'

export interface BlogMeta {
  slug: string
  title: string
  description: string
  tags: Select[]
  status: Select
  createdAt: string
  updatedAt: string
}
