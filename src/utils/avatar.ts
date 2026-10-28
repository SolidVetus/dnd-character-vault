import { API_BASE_URL } from '@/api/http'

export function getAvatarUrl(url: string | null): string {
  if (!url) return ''

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  const origin = API_BASE_URL.replace(/\/api$/, '')

  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}
