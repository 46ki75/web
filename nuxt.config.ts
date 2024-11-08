// https://nuxt.com/docs/api/configuration/nuxt-config
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

const { results } = await notion.databases.query({
  database_id: String(process.env.NOTION_BLOG_DATABASE_ID),
  filter: {
    property: 'status',
    status: { equals: 'published' }
  }
})

const routes = results.map(
  (page: any) =>
    `/api/blog/image/${page.properties.slug.unique_id.number}/ogp.webp`
)

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  vite: {
    css: {
      modules: {
        scopeBehaviour: 'local'
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
  },
  nitro: {
    prerender: {
      routes
    }
  }
})
