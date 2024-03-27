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
      const paths = [
        '/api/v1/blog/home/meta.json',
        '/api/v1/blog/list/meta.json',
        '/api/v1/blog/list/tags.json'
      ]
      paths.push(...slugs.map((slug) => `/api/v1/blog/${slug}/meta.json`))
      paths.push(...slugs.map((slug) => `/api/v1/blog/${slug}/body.json`))
      paths.push(...slugs.map((slug) => `/api/v1/blog/${slug}/ogp.webp`))
      nitroConfig?.prerender?.routes?.push(...paths)
    }
  },
  css: ['~/assets/global.scss'],
  modules: ['@nuxt/image']
})
