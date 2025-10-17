import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

const TabsLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#6200ee' }}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: '#6200ee' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
          tabBarActiveTintColor: '#6200ee',
          // --- MOVED tabBarStyle HERE ---
          tabBarStyle: {
            paddingBottom: insets.bottom,
            height: 50 + insets.bottom,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Invoices',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          // The name here must match the file name, which is 'clients.tsx'
          name="clientDashboard" 
          options={{
            title: 'Clients',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabsLayout;