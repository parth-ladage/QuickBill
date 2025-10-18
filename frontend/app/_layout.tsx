import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import SplashScreen from './SplashScreen'; // 1. Import the SplashScreen

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
      router.replace('/(tabs)');
    } else if (!token && !inAuthGroup) {
      router.replace('/(auth)');
    }
  }, [token, segments]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="createInvoice" options={{ title: 'New Invoice', presentation: 'modal' }} />
      <Stack.Screen name="editInvoice/[id]" options={{ title: 'Edit Invoice', presentation: 'modal' }} />
      <Stack.Screen name="createClient" options={{ title: 'New Client', presentation: 'modal' }} />
      <Stack.Screen name="editClient/[id]" options={{ title: 'Edit Client', presentation: 'modal' }} />
      <Stack.Screen name="pdfPreview" options={{ title: 'Invoice Preview', presentation: 'modal' }} />
      <Stack.Screen name="clientInvoices/[id]" options={{ title: 'Client Invoices' }} />
    </Stack>
  );
};

const RootLayout = () => {
  // 2. Add state to manage when the animation is finished
  const [isAnimationFinished, setAnimationFinished] = useState(false);

  // 3. If the animation is not finished, show the splash screen
  if (!isAnimationFinished) {
    return <SplashScreen onAnimationFinish={() => setAnimationFinished(true)} />;
  }

  // 4. Once the animation is done, show the main app
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default RootLayout;