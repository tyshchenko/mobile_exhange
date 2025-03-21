
import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme || 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
        },
      }}>
      <Tabs.Screen
        name="exchange"
        options={{
          title: 'Exchange',
          tabBarIcon: ({ color }) => <TabBarIcon name="trending-up" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Market',
          tabBarIcon: ({ color }) => <TabBarIcon name="stats-chart" color={color} />,
        }}
      />
    </Tabs>
  );
}
