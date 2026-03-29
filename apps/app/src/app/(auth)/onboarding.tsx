import { useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRegister } from '@truthlayer/api-client'
import { RegisterSchema } from '@truthlayer/shared'
import { useAuthStore } from '~/store/auth.store'

export default function OnboardingScreen() {
  const [handle, setHandle] = useState('')
  const [displayName, setDisplayName] = useState('')

  const session = useAuthStore((s) => s.session)
  const register = useRegister(session?.access_token)

  function handleComplete() {
    const result = RegisterSchema.safeParse({ handle, displayName })
    if (!result.success) {
      Alert.alert('Check your input', result.error.errors[0]?.message)
      return
    }

    register.mutate(result.data, {
      onSuccess: () => router.replace('/(tabs)/neighborhood'),
      onError: (err) => Alert.alert('Registration failed', err.message),
    })
  }

  const canSubmit = handle.length >= 3 && displayName.length >= 1 && !register.isPending

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 px-6 justify-center">
        <Text className="text-white text-3xl font-bold mb-2">Create your profile</Text>
        <Text className="text-slate-400 text-sm mb-10">
          Pick a handle that represents you in your neighborhood.
        </Text>

        <Text className="text-slate-300 text-sm font-medium mb-2">Handle</Text>
        <View className="flex-row items-center bg-slate-800 rounded-xl border border-slate-700 px-4 mb-5">
          <Text className="text-slate-500 text-base">@</Text>
          <TextInput
            className="flex-1 text-white py-4 text-base ml-1"
            placeholder="yourhandle"
            placeholderTextColor="#475569"
            value={handle}
            onChangeText={(t) => setHandle(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
            returnKeyType="next"
          />
          <Text className="text-slate-600 text-xs">{handle.length}/30</Text>
        </View>

        <Text className="text-slate-300 text-sm font-medium mb-2">Display name</Text>
        <TextInput
          className="bg-slate-800 text-white rounded-xl border border-slate-700 px-4 py-4 text-base mb-8"
          placeholder="Your Name"
          placeholderTextColor="#475569"
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={60}
          returnKeyType="done"
          onSubmitEditing={handleComplete}
        />

        <Pressable
          className="bg-blue-500 rounded-xl py-4 items-center active:opacity-75"
          style={{ opacity: canSubmit ? 1 : 0.5 }}
          onPress={handleComplete}
          disabled={!canSubmit}
        >
          <Text className="text-white font-semibold text-base">
            {register.isPending ? 'Creating profile…' : 'Get started'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
