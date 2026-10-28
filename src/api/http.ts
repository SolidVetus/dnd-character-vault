export const API_BASE_URL = 'http://127.0.0.1:3000/api'

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = `Ошибка запроса: ${response.status}`

    try {
      const error = (await response.json()) as { message?: string }
      message = error.message || message
    } catch {
      message = `Ошибка запроса: ${response.status}`
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
