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
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/MyKeyboradTyping/icon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/MyKeyboradTyping/apple-touch-icon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/MyKeyboradTyping/apple-touch-icon.png' }
      ]
    }
  },

  ssr: false, // GitHub Pagesは静的ホスティングのみ

  nitro: {
    preset: 'static'
  }
})
