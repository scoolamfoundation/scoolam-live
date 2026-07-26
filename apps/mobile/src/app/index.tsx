import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/utils/auth/useAuth';
import { Shield } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO_URL =
  'https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png';

const WEB_ADMIN_URL = `${process.env.EXPO_PUBLIC_BASE_URL ?? ''}/admin/login`;

export default function Index() {
  const router = useRouter();
  const { auth, isReady, signIn, signUp } = useAuth();
  const [showButtons, setShowButtons] = useState(false);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Responsive logo size — scales with screen height, capped between 120–200px
  const logoSize = Math.min(200, Math.max(120, height * 0.22));
  const titleSize = Math.min(32, Math.max(24, width * 0.075));

  useEffect(() => {
    if (!isReady) return;
    if (auth?.user) {
      router.replace('/home' as any);
    } else {
      setShowButtons(true);
    }
  }, [isReady, auth, router]);

  const openAdminPortal = () => {
    void Linking.openURL(WEB_ADMIN_URL);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0D4C3E',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Decorative circles */}
      <View
        style={{
          position: 'absolute',
          top: -80,
          right: -60,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: 'rgba(255,255,255,0.04)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 120,
          left: -80,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: 'rgba(255,255,255,0.04)',
        }}
      />

      {/* Logo section — flex: 1 so it fills available space above buttons */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 30,
        }}
      >
        <Image
          source={{ uri: LOGO_URL }}
          style={{ width: logoSize, height: logoSize }}
          contentFit="contain"
        />
        <Text
          style={{
            fontSize: titleSize,
            color: '#fff',
            fontWeight: '800',
            marginTop: 16,
            letterSpacing: -0.5,
          }}
        >
          Scoolam
        </Text>
        <Text
          style={{
            fontSize: Math.min(16, Math.max(13, width * 0.038)),
            color: '#A7C7C1',
            marginTop: 8,
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          Your Daily Learning App
        </Text>
      </View>

      {/* Buttons section — fixed at bottom, never overlaps logo */}
      <View
        style={{
          paddingHorizontal: 28,
          paddingBottom: Math.max(20, insets.bottom + 12),
          gap: 12,
        }}
      >
        {!isReady ? (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        ) : showButtons ? (
          <>
            <TouchableOpacity
              style={{
                backgroundColor: '#fff',
                paddingVertical: Math.min(18, height * 0.025),
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 4,
              }}
              onPress={() => signIn()}
            >
              <Text style={{ color: '#0D4C3E', fontSize: 16, fontWeight: '800' }}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: 'transparent',
                paddingVertical: Math.min(18, height * 0.025),
                borderRadius: 16,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.5)',
              }}
              onPress={() => signUp()}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openAdminPortal}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
              }}
            >
              <Shield size={14} color="rgba(255,255,255,0.4)" />
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' }}>
                Admin Portal
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );
}
