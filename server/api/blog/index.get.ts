import { Client } from '@notionhq/client'

import type { BlogMeta } from '~/interfaces/blog/BlogMeta'

export default defineEventHandler(async () => {
  const client = new Client({ auth: process.env.NOTION_TOKEN })

  const database_id = process.env.NOTION_BLOG_DATABASE_ID

  if (database_id === undefined) {
    throw new Error(
      'There was an error while retrieving the NOTION_BLOG_DATABASE_ID. Please check the environment variables.'
    )
  }

  const blogs = await client.databases.query({ database_id })

  const response = blogs.results.map((result) => {
    const blogMeta: BlogMeta = {
      slug: '',
      title: '',
      description: '',
      tags: [],
      status: { id: '', color: '', name: '' },
      createdAt: '',
      updatedAt: ''
    }

    if (result.object === 'page' && 'properties' in result) {
      // # --------------------------------------------------------------------------------
      //
      // slug
      //
      // # --------------------------------------------------------------------------------

      if (
        'slug' in result.properties &&
        result.properties.slug.type === 'unique_id' &&
        result.properties.slug.unique_id.number != null
      ) {
        blogMeta.slug = String(result.properties.slug.unique_id.number)
      } else {
        throw new Error('An error occurred while retrieving the slug.')
      }

      // # --------------------------------------------------------------------------------
      //
      // title
      //
      // # --------------------------------------------------------------------------------

      if (
        'title' in result.properties &&
        result.properties.title.type === 'title'
      ) {
        const title = result.properties.title.title
          .map((rt) => rt.plain_text)
          .join('')

        blogMeta.title = title
      } else {
        throw new Error('An error occurred while retrieving the title.')
      }

      // # --------------------------------------------------------------------------------
      //
      // description
      //
      // # --------------------------------------------------------------------------------

      if (
        'description' in result.properties &&
        result.properties.description.type === 'rich_text'
      ) {
        const description = result.properties.description.rich_text
          .map((rt) => rt.plain_text)
          .join('')

        blogMeta.description = description
      } else {
        throw new Error('An error occurred while retrieving the description.')
      }

      // # --------------------------------------------------------------------------------
      //
      // tags
      //
      // # --------------------------------------------------------------------------------

      if (
        'tags' in result.properties &&
        result.properties.tags.type === 'multi_select'
      ) {
        const tags = result.properties.tags.multi_select

        blogMeta.tags = tags
      } else {
        throw new Error('An error occurred while retrieving the tags.')
      }

      // # --------------------------------------------------------------------------------
      //
      // status
      //
      // # --------------------------------------------------------------------------------

      if (
        'status' in result.properties &&
        result.properties.status.type === 'status' &&
        result.properties.status.status != null
      ) {
        const status = result.properties.status.status

        blogMeta.status = status
      } else {
        throw new Error('An error occurred while retrieving the status.')
      }

      // # --------------------------------------------------------------------------------
      //
      // createdAt
      //
      // # --------------------------------------------------------------------------------

      if (
        'createdAt' in result.properties &&
        result.properties.createdAt.type === 'date' &&
        result.properties.createdAt.date != null
      ) {
        const createdAt = result.properties.createdAt.date.start
        blogMeta.createdAt = createdAt
      } else {
        throw new Error(
          'An error occurred while retrieving the createdAt(date).'
        )
      }

      // # --------------------------------------------------------------------------------
      //
      // updatedAt
      //
      // # --------------------------------------------------------------------------------

      if (
        'updatedAt' in result.properties &&
        result.properties.updatedAt.type === 'date' &&
        result.properties.updatedAt.date != null
      ) {
        const updatedAt = result.properties.updatedAt.date.start
        blogMeta.updatedAt = updatedAt
      } else {
        throw new Error(
          'An error occurred while retrieving the updatedAt(date).'
        )
      }
    }

    return blogMeta
  })

  const filteredResponse = response.filter(
    (res) => res.status.name === 'public'
  )

  if (process.env.NODE_ENV === 'development') {
    return response
  } else {
    return filteredResponse
  }
})
