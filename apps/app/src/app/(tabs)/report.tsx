import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Day 11 — ReportsModule + camera-first capture
export default function ReportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-4 pt-4 pb-3 border-b border-slate-800">
        <Text className="text-white text-2xl font-bold">Report</Text>
        <Text className="text-slate-500 text-xs mt-1">Camera-first · GPS required</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-slate-600 text-sm">Camera capture coming Day 11</Text>
      </View>
    </SafeAreaView>
  )
}
