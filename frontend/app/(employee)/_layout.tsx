// Employee Layout - Bottom tabs navigation

import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function EmployeeLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1193d4',
        tabBarInactiveTintColor: '#617c89',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          title: 'Tercihlerim',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="edit-calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-shifts"
        options={{
          title: 'Shiftlerim',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
