// https://nuxt.com/docs/api/configuration/nuxt-config
import "dotenv/config"
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

const { results } = await notion.databases.query({
  database_id: String(process.env.NOTION_BLOG_DATABASE_ID),
  filter: {
    property: 'status',
    status: { equals: 'published' }
  }
})

const ogpImageRoutes = results.map(
  (page: any) =>
    `/api/blog/image/${page.properties.slug.unique_id.number}/ogp.webp`
)

const articleRoutes = results.map(
  (page: any) => `/blog/article/${page.properties.slug.unique_id.number}`
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
    },
    server: {
      proxy: {
        '/graphql': {
          target: 'http://localhost:10000/lambda-url/graphql',
          changeOrigin: true
        },
        '/api/v1/blog/images': {
          target: 'http://localhost:11000/lambda-url/blog-block-image',
          changeOrigin: true
        }
      }
    }
  },
  nitro: {
    prerender: {
      routes: [...ogpImageRoutes, ...articleRoutes]
    }
  }
})
