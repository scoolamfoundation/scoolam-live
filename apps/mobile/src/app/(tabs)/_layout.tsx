import { Tabs } from 'expo-router';
import { Home, Play, BookOpen } from 'lucide-react-native';
import { Platform, View } from 'react-native';
import { useAuth, useRequireAuth } from '@/utils/auth/useAuth';

export default function TabLayout() {
  const { isReady, isAuthenticated } = useAuth();

  // Trigger the sign-in modal automatically when the user is not authenticated
  useRequireAuth();

  // Block tab content from rendering until auth state is confirmed.
  // The AuthModal mounted in root _layout.tsx will prompt the user to sign in.
  if (!isReady || !isAuthenticated) {
    return <View style={{ flex: 1, backgroundColor: '#0D4C3E' }} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderColor: '#F3F4F6',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#0D4C3E',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="topics"
        options={{
          title: 'Topics',
          tabBarIcon: ({ color }) => <Play color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
