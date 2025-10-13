import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { token } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // @ts-ignore
    if (segments.length === 0) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (token && inAuthGroup) {
      // If the user is signed in AND is in the auth group, redirect them.
      router.replace('/(tabs)');
    } else if (!token && !inAuthGroup) {
      // If the user is NOT signed in AND is NOT in the auth group, redirect them.
      router.replace('/(auth)');
    }
  }, [token, segments]);

  // Always render the Stack navigator from the very first render.
  return (
    <Stack>
      {/* The auth screens (login, register) */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {/* The main app screens (the tab bar) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Modal screens that can be opened from anywhere */}
      <Stack.Screen 
        name="createInvoice" 
        options={{ 
          title: 'New Invoice', 
          presentation: 'modal' 
        }} 
      />
      <Stack.Screen 
        name="editInvoice/[id]" 
        options={{ 
          title: 'Edit Invoice', 
          presentation: 'modal' 
        }} 
      />
      <Stack.Screen 
        name="createClient" 
        options={{ title: 'New Client', presentation: 'modal' }} 
      />
      <Stack.Screen 
        name="editClient/[id]" 
        options={{ title: 'Edit Client', presentation: 'modal' }} 
      />

      <Stack.Screen 
        name="pdfPreview" 
        options={{ title: 'Invoice Preview', presentation: 'modal' }} 
      />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default RootLayout;