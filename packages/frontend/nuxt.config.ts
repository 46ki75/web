// https://nuxt.com/docs/api/configuration/nuxt-config
import 'dotenv/config'

const fetchRoutes = async () => {
  const response = await fetch(
    'http://localhost:10000/lambda-url/http-api/api/graphql',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query Routes {
            blogList {
              id
            }
          }
        `
      })
    }
  )

  const { data } = await response.json()

  return data as {
    data: { blogList: Array<{ id: string }> }
  }
}

const articleRoutes = await fetchRoutes()

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
        '/api': {
          target: 'http://localhost:10000/lambda-url/http-api',
          changeOrigin: true
        }
      }
    }
  },
  nitro: {
    prerender: {
      routes: articleRoutes.data.blogList.map(
        (article) => `/blog/article/${article.id}`
      )
    }
  }
})
