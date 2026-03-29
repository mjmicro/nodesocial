import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Day 12 — MissionsModule
export default function MissionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-4 pt-4 pb-3 border-b border-slate-800">
        <Text className="text-white text-2xl font-bold">Missions</Text>
        <Text className="text-slate-500 text-xs mt-1">Community-driven problem solving</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-slate-600 text-sm">Missions coming Day 12</Text>
      </View>
    </SafeAreaView>
  )
}
