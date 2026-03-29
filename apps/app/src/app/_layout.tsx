import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { supabase } from '~/utils/supabase'
import { useAuthStore } from '~/store/auth.store'
import '../global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
})

export default function RootLayout() {
  const { setSession, setLoading } = useAuthStore()

  useEffect(() => {
    // Rehydrate session from AsyncStorage on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Keep store in sync with Supabase auth events (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession, setLoading])

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
