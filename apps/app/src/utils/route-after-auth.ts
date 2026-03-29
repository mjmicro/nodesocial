import { router } from 'expo-router'
import { API_URL } from '@truthlayer/api-client'

export async function routeAfterAuth(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  router.replace(res.status === 404 ? '/(auth)/onboarding' : '/(tabs)/neighborhood')
}
