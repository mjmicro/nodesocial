import { useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '~/utils/supabase'

type Method = 'phone' | 'email'

function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return raw.startsWith('+') ? raw : `+1${digits}`
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function LoginScreen() {
  const [method, setMethod] = useState<Method>('phone')
  const [value, setValue] = useState('')
  const [isSending, setIsSending] = useState(false)

  const canSend =
    method === 'phone'
      ? value.replace(/\D/g, '').length >= 7
      : isValidEmail(value)

  async function handleSendOtp() {
    setIsSending(true)

    const { error } =
      method === 'phone'
        ? await supabase.auth.signInWithOtp({ phone: toE164(value) })
        : await supabase.auth.signInWithOtp({ email: value })

    setIsSending(false)

    if (error) {
      Alert.alert('Could not send code', error.message)
      return
    }

    const identifier = method === 'phone' ? toE164(value) : value
    router.push({ pathname: '/(auth)/phone-verify', params: { identifier, method } })
  }

  function switchMethod(next: Method) {
    setMethod(next)
    setValue('')
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 px-6 justify-center">
        <Text className="text-white text-4xl font-bold tracking-tight mb-1">
          TruthLayer
        </Text>
        <Text className="text-slate-400 text-base mb-10">
          Your neighborhood, verified.
        </Text>

        <View className="flex-row bg-slate-800 rounded-xl p-1 mb-6">
          {(['phone', 'email'] as Method[]).map((m) => (
            <Pressable
              key={m}
              className="flex-1 py-2 rounded-lg items-center"
              style={{ backgroundColor: method === m ? '#3b82f6' : 'transparent' }}
              onPress={() => switchMethod(m)}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: method === m ? '#fff' : '#64748b' }}
              >
                {m === 'phone' ? 'Phone' : 'Email'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-slate-300 text-sm font-medium mb-2">
          {method === 'phone' ? 'Phone number' : 'Email address'}
        </Text>
        <TextInput
          key={method}
          className="bg-slate-800 text-white rounded-xl px-4 py-4 text-base mb-5 border border-slate-700"
          placeholder={method === 'phone' ? '+1 (555) 000-0000' : 'you@example.com'}
          placeholderTextColor="#475569"
          value={value}
          onChangeText={setValue}
          keyboardType={method === 'phone' ? 'phone-pad' : 'email-address'}
          autoCapitalize="none"
          autoComplete={method === 'phone' ? 'tel' : 'email'}
          textContentType={method === 'phone' ? 'telephoneNumber' : 'emailAddress'}
          returnKeyType="send"
          onSubmitEditing={handleSendOtp}
        />

        <Pressable
          className="bg-blue-500 rounded-xl py-4 items-center active:opacity-75"
          style={{ opacity: canSend && !isSending ? 1 : 0.5 }}
          onPress={handleSendOtp}
          disabled={!canSend || isSending}
        >
          <Text className="text-white font-semibold text-base">
            {isSending ? 'Sending…' : 'Send verification code'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
