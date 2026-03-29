import { Text, View, Pressable, Alert, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '~/utils/supabase'
import { useAuthStore } from '~/store/auth.store'
import { useOwnProfile } from '@truthlayer/api-client'

export default function ProfileScreen() {
  const { session } = useAuthStore()
  const { data: profile } = useOwnProfile(session?.access_token)

  async function doSignOut() {
    await supabase.auth.signOut()
    router.replace('/(auth)/login')
  }

  function handleSignOut() {
    if (Platform.OS === 'web') {
      if (window.confirm('Sign out?')) doSignOut()
    } else {
      Alert.alert('Sign out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: doSignOut },
      ])
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-4 pt-4 pb-3 border-b border-slate-800">
        <Text className="text-white text-2xl font-bold">Profile</Text>
        {profile?.handle && (
          <Text className="text-slate-400 text-sm mt-1">@{profile.handle}</Text>
        )}
      </View>

      <View className="flex-1 px-4 pt-6">
        {profile && (
          <View className="bg-slate-800 rounded-xl p-4 mb-4">
            <Text className="text-white font-semibold text-base mb-1">
              {profile.displayName}
            </Text>
            <Text className="text-slate-400 text-sm">
              Level {profile.level} · {profile.xp} XP
            </Text>
          </View>
        )}

        <View className="mt-auto pb-4">
          <Pressable
            className="border border-slate-700 rounded-xl py-4 items-center active:opacity-75"
            onPress={handleSignOut}
          >
            <Text className="text-red-400 font-medium">Sign out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
