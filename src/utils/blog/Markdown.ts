import { readdirSync, readFileSync } from 'fs'
import path from 'path'

interface BlogMetadata {
  slug: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

interface MarkdownConstructorParams {
  slug: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

export class Markdown {
  public slug: string
  public title: string
  public description: string
  public createdAt: string
  public updatedAt: string

  constructor({
    slug,
    title,
    description,
    createdAt,
    updatedAt
  }: MarkdownConstructorParams) {
    this.slug = slug
    this.title = title
    this.description = description
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * server side only
   */
  static listAll(): Markdown[] {
    const slugs = readdirSync(path.resolve('./public/static/blog/'))
    const markdowns = slugs.map((slug) => this.getBySlug(slug))
    return markdowns
  }

  /**
   * server side only
   */
  static getBySlug(slug: string) {
    const metadataFilePath = path.join(
      './public/static/blog/',
      slug,
      `meta.json`
    )

    const metadata: BlogMetadata = JSON.parse(
      readFileSync(metadataFilePath, 'utf8')
    )

    return new Markdown({
      slug: metadata.slug,
      title: metadata.title,
      description: metadata.description,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt
    })
  }

  /**
   * server side only
   */
  get markdown() {
    const markdownFilePath = path.join(
      './public/static/blog/',
      this.slug,
      `index.md`
    )

    const markdown = readFileSync(markdownFilePath, 'utf8')

    return markdown
  }

  get ogp() {
    return `/static/blog/${this.slug}/ogp.webp`
  }

  get href() {
    return `/blog/article/${this.slug}`
  }
}
