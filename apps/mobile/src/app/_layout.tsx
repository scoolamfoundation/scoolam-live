/**
 * This file is customizable BUT — do not remove:
 *   • `<AuthModal />` render (shipped v2 auth modal; removing it breaks
 *     signin/signup since useAuth().signIn() only flips state, not render)
 *   • `useAuth().initiate()` + `isReady` gate (loads persisted session from
 *     SecureStore — removing causes user to appear signed-out on app launch)
 *
 * Safe to change: the Stack routes, QueryClient config, splash behavior, the
 * wrapping providers, or to add nested providers around <Stack>.
 */

// ─── Screen Capture Prevention ────────────────────────────────────────────────
// DISABLED for Expo Go testing — uncomment the import and useEffect body below
// when building a production/development build (not Expo Go).
//
// import * as ScreenCapture from 'expo-screen-capture';
//
// Inside RootLayout, add:
//   useEffect(() => {
//     void ScreenCapture.preventScreenCaptureAsync().catch(() => {});
//     return () => { void ScreenCapture.allowScreenCaptureAsync().catch(() => {}); };
//   }, []);
// ─────────────────────────────────────────────────────────────────────────────

import { ErrorBoundary } from '@/__create/ErrorBoundary';
import { useAuth } from '@/utils/auth/useAuth';
import { AuthModal } from '@/utils/auth/useAuthModal';
import { useInAppPurchase } from '@/utils/iap';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';

const SPLASH_TIMEOUT_MS = 3_000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const { initiate: initiateIAP } = useInAppPurchase();
  const [timedOut, setTimedOut] = useState(false);
  const splashHeld = useRef(false);

  // Hold the splash screen — done inside the component, not at module scope
  useEffect(() => {
    if (!splashHeld.current) {
      splashHeld.current = true;
      void SplashScreen.preventAutoHideAsync().catch(() => {});
    }
  }, []);

  // Kick off auth session restore
  useEffect(() => {
    initiate();
  }, [initiate]);

  // Initialize RevenueCat SDK on startup
  useEffect(() => {
    void initiateIAP();
  }, [initiateIAP]);

  // Hard timeout so a slow/failed auth never hangs the app forever
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), SPLASH_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  // Hide native splash once auth is resolved (or timed out)
  useEffect(() => {
    if (isReady || timedOut) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady, timedOut]);

  // Always render the branded loading screen — never return null
  if (!isReady && !timedOut) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0D4C3E',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={{
            uri: 'https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png',
          }}
          style={{ width: 160, height: 160 }}
          contentFit="contain"
        />
        <Text style={{ color: '#A7C7C1', fontSize: 16, fontWeight: '600', marginTop: 8 }}>
          Your Daily Learning App
        </Text>
        <ActivityIndicator color="#A7C7C1" size="large" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="privacy-policy" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="terms-of-service" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="help" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="invite-friends" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="subscription-status" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="certificate-view" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="video/[id]" />
            <Stack.Screen name="quiz/[id]" />
            <Stack.Screen name="daily-quiz/[id]" />
          </Stack>
          <AuthModal />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
