// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss'
  ],

  // GitHub Pages用の設定
  app: {
    baseURL: '/MyKeyboradTyping/',
  },

  ssr: false, // GitHub Pagesは静的ホスティングのみ

  nitro: {
    preset: 'static'
  }
})
