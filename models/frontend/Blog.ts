import type { DOMJSON } from 'notion-markup-utils/dist/block/DOMJSON'

export interface Blog {
  slug: string
  title: string
  description: string
  tags: Select[]
  status: Select
  createdAt: string
  updatedAt: string
}

export type BlogWithHTML = Blog & { dom: DOMJSON[] }

export interface Select {
  name: string
  color:
    | 'blue'
    | 'brown'
    | 'default'
    | 'gray'
    | 'green'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'yellow'
}
