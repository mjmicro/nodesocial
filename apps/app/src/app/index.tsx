import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '~/store/auth.store'
import { routeAfterAuth } from '~/utils/route-after-auth'

export default function Index() {
  const { session, isLoading } = useAuthStore()

  useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.replace('/(auth)/login')
      return
    }

    const controller = new AbortController()
    routeAfterAuth(session.access_token).catch(() => {
      if (!controller.signal.aborted) router.replace('/(tabs)/neighborhood')
    })
    return () => controller.abort()
  }, [session, isLoading])

  return (
    <View className="flex-1 items-center justify-center bg-slate-950">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  )
}
