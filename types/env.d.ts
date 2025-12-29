/// <reference types="vite/client" />

// Viteの既存の型定義を拡張
declare module 'vite/client' {
  interface ImportMetaEnv {
    // Viteのデフォルト環境変数（既に定義されているため再宣言不要）
    // DEV, PROD, SSR などはViteが自動的に提供
  }
}
