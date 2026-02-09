/**
 * Get the base URL for the application
 * This is used to handle different base paths in development (/) and production (/MyKeyboradTyping/)
 * @returns The base URL with trailing slash
 */
export function getBaseURL(): string {
  // window.location.pathnameを使用して本番環境かどうかを判定
  // （KeyboardLayoutView.vueと同じロジック）
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/MyKeyboradTyping/')) {
    return '/MyKeyboradTyping/'
  }
  
  return '/'
}
