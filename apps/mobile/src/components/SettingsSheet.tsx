import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  User,
  Crown,
  ScrollText,
  Shield,
  HelpCircle,
  Gift,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '@/utils/auth/useAuth';
import { useUser } from '@/utils/auth/useUser';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  onPress: () => void;
  color?: string;
  bg?: string;
}

export default function SettingsSheet({ visible, onClose }: SettingsSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut, signIn } = useAuth();
  const { user } = useUser();

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [pendingNav, setPendingNav] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Navigate AFTER the modal has been dismissed to avoid real-device routing issues
  useEffect(() => {
    if (!visible && pendingNav) {
      const timer = setTimeout(() => {
        router.push(pendingNav as never);
        setPendingNav(null);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [visible, pendingNav, router]);

  const navigate = (path: string) => {
    setPendingNav(path);
    onClose();
  };

  const handleSignOut = () => {
    onClose();
    setTimeout(() => {
      signOut();
      setTimeout(() => signIn(), 400);
    }, 300);
  };

  const displayName = user?.name ?? '';
  const initials = displayName
    ? displayName
        .split(' ')
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const menuItems: MenuItem[] = [
    {
      icon: User,
      label: 'Profile',
      sublabel: 'Edit your personal details',
      onPress: () => navigate('/profile'),
      color: '#3B82F6',
      bg: '#EFF6FF',
    },
    {
      icon: Crown,
      label: 'Active Subscription',
      sublabel: 'Manage your plan',
      onPress: () => navigate('/subscription-status'),
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
    {
      icon: ScrollText,
      label: 'Terms & Conditions',
      onPress: () => navigate('/terms-of-service'),
      color: '#8B5CF6',
      bg: '#EDE9FE',
    },
    {
      icon: Shield,
      label: 'Privacy Policy',
      onPress: () => navigate('/privacy-policy'),
      color: '#6B7280',
      bg: '#F3F4F6',
    },
    {
      icon: HelpCircle,
      label: 'Help',
      sublabel: 'FAQs & report an issue',
      onPress: () => navigate('/help'),
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      icon: Gift,
      label: 'Invite Friends',
      sublabel: 'Earn wallet rewards',
      onPress: () => navigate('/invite-friends'),
      color: '#EC4899',
      bg: '#FDF2F8',
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
      />

      {/* Sheet */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingBottom: insets.bottom + 16,
          transform: [{ translateY: slideAnim }],
          maxHeight: SCREEN_HEIGHT * 0.88,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 20,
        }}
      >
        {/* Handle */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' }} />
        </View>

        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderColor: '#F3F4F6',
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#0D4C3E',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827' }}>
              {displayName || 'Account'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>
              {user?.email ?? ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#F3F4F6',
            }}
          >
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={item.onPress}
                activeOpacity={0.6}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  backgroundColor: '#fff',
                  borderBottomWidth: i < menuItems.length - 1 ? 1 : 0,
                  borderColor: '#F3F4F6',
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: item.bg ?? '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <item.icon size={20} color={item.color ?? '#6B7280'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                    {item.label}
                  </Text>
                  {item.sublabel && (
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
                      {item.sublabel}
                    </Text>
                  )}
                </View>
                <ChevronRight size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign out */}
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.7}
            style={{
              marginTop: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FEF2F2',
              paddingVertical: 15,
              borderRadius: 16,
              gap: 8,
              borderWidth: 1,
              borderColor: '#FEE2E2',
            }}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontSize: 15, fontWeight: '700' }}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}
