import { Platform } from 'react-native'

export const API_URL =
  Platform.OS === 'web'
    ? `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`
    : (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001')

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  token?: string
  body?: unknown
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = options
  const hasBody = body !== undefined

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    body: hasBody ? JSON.stringify(body) : undefined,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({})) as { message?: string }
    throw new ApiError(response.status, errBody.message ?? response.statusText)
  }

  return response.json() as Promise<T>
}
