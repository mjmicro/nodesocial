import { View } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface TabIconProps {
  name: IconName
  focusedName: IconName
  color: string
  size: number
  focused: boolean
}

function TabIcon({ name, focusedName, color, size, focused }: TabIconProps) {
  return <Ionicons name={focused ? focusedName : name} size={size} color={color} />
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="neighborhood"
        options={{
          title: 'Neighborhood',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name="map-outline"
              focusedName="map"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="missions"
        options={{
          title: 'Missions',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name="flag-outline"
              focusedName="flag"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />

      {/* Camera-first Report tab: elevated button, no label */}
      <Tabs.Screen
        name="report"
        options={{
          title: '',
          tabBarIcon: () => (
            <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center shadow-lg -mt-5">
              <Ionicons name="camera" size={26} color="white" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name="trophy-outline"
              focusedName="trophy"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name="person-outline"
              focusedName="person"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  )
}
