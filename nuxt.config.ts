// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/eslint-module'],
  routeRules: {
    '/api/hello.json': { prerender: true }
  }
})
