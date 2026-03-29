import { useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '~/utils/supabase'
import { routeAfterAuth } from '~/utils/route-after-auth'

type Method = 'phone' | 'email'

export default function VerifyScreen() {
  const { identifier, method } = useLocalSearchParams<{
    identifier: string
    method: Method
  }>()

  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  async function handleVerify() {
    setIsVerifying(true)

    const { error } = await supabase.auth.verifyOtp(
      method === 'phone'
        ? { phone: identifier, token: otp, type: 'sms' }
        : { email: identifier, token: otp, type: 'email' },
    )

    setIsVerifying(false)

    if (error) {
      Alert.alert('Invalid code', error.message)
      return
    }

    // verifyOtp may not populate session on all platforms — read from client state
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      Alert.alert('Session error', 'Could not get session after verification. Please try again.')
      return
    }

    await routeAfterAuth(token)
  }

  async function handleResend() {
    const { error } =
      method === 'phone'
        ? await supabase.auth.signInWithOtp({ phone: identifier })
        : await supabase.auth.signInWithOtp({ email: identifier })

    if (error) Alert.alert('Could not resend', error.message)
    else Alert.alert('Code resent', `A new code was sent to ${identifier}`)
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 px-6 justify-center">
        <Text className="text-white text-3xl font-bold mb-2">
          {method === 'phone' ? 'Verify your number' : 'Check your email'}
        </Text>
        <Text className="text-slate-400 text-sm mb-8">
          Enter the code sent to{' '}
          <Text className="text-slate-300 font-medium">{identifier}</Text>
        </Text>

        <TextInput
          className="bg-slate-800 text-white rounded-xl px-4 py-5 text-3xl text-center tracking-[0.4em] border border-slate-700 mb-5"
          placeholder="————————"
          placeholderTextColor="#334155"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={8}
          autoFocus
        />

        <Pressable
          className="bg-blue-500 rounded-xl py-4 items-center active:opacity-75"
          style={{ opacity: otp.length < 6 || isVerifying ? 0.5 : 1 }}
          onPress={handleVerify}
          disabled={otp.length < 6 || isVerifying}
        >
          <Text className="text-white font-semibold text-base">
            {isVerifying ? 'Verifying…' : 'Verify'}
          </Text>
        </Pressable>

        <Pressable className="mt-5 items-center py-2" onPress={handleResend}>
          <Text className="text-slate-400 text-sm">
            Didn&apos;t receive it? Resend code
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
