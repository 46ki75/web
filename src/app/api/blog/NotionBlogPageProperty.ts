import {
  type UniqueIDPageProperty,
  type TitlePageProperty,
  type RichTextPageProperty,
  type MultiSelectPageProperty,
  type StatusPageProperty,
  type DatePageProperty,
  type FilesPageProperty
} from 'notion-markup-utils'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type NotionBlogPageProperty = {
  slug: UniqueIDPageProperty
  title: TitlePageProperty
  description: RichTextPageProperty
  tags: MultiSelectPageProperty
  status: StatusPageProperty<'draft' | 'private' | 'public'>
  createdAt: DatePageProperty
  updatedAt: DatePageProperty
  ogpImage: FilesPageProperty
}
