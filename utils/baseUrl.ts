/**
 * Get the base URL from the <base> tag in the document
 * This is used to handle different base paths in development (/) and production (/MyKeyboradTyping/)
 * @returns The base URL with trailing slash
 */
export function getBaseURL(): string {
  let baseURL = '/'
  
  if (typeof document !== 'undefined') {
    const baseElement = document.querySelector('base')
    if (baseElement?.href) {
      try {
        const url = new URL(baseElement.href)
        baseURL = url.pathname
      } catch (e) {
        console.warn('Failed to parse base URL:', e)
      }
    }
  }
  
  // baseURLの末尾にスラッシュを確保
  return baseURL.endsWith('/') ? baseURL : baseURL + '/'
}
