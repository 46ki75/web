// https://nuxt.com/docs/api/configuration/nuxt-config
import { getAllBlogSlug } from './helpers/getAllBlogSlug'

export default defineNuxtConfig({
  devtools: { enabled: true },
  hooks: {
    'build:before': () => {
      console.log('Build Start')
    },
    async 'nitro:config'(nitroConfig) {
      const slugs = await getAllBlogSlug()
      const paths = ['/api/blog/list.json', '/api/blog/tags.json']
      paths.push(...slugs.map((slug) => `/api/blog/${slug}/info.json`))
      paths.push(...slugs.map((slug) => `/api/blog/${slug}/ogp.webp`))
      nitroConfig?.prerender?.routes?.push(...paths)
    }
  }
})
