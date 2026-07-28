import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Pencil, MapPin, Phone, BookOpen, Crown } from 'lucide-react-native';
import { useUser } from '@/utils/auth/useUser';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  state: string;
  country: string;
  favourite_subjects: string[];
  is_premium: boolean;
}

interface ProfileViewSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileViewSheet({ visible, onClose }: ProfileViewSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.user?.name ?? user?.name ?? '',
          email: data.user?.email ?? user?.email ?? '',
          phone: data.user?.phone ?? '',
          state: data.user?.state ?? '',
          country: data.user?.country ?? '',
          favourite_subjects: data.user?.favourite_subjects ?? [],
          is_premium: data.user?.is_premium ?? false,
        });
      }
    } catch {
      // fallback to session user
      setProfile({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: '',
        state: '',
        country: '',
        favourite_subjects: [],
        is_premium: false,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (visible) {
      void fetchProfile();
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
  }, [visible, slideAnim, fetchProfile]);

  const handleEditPress = () => {
    onClose();
    setTimeout(() => {
      router.push('/profile' as never);
    }, 300);
  };

  const displayName = profile?.name || user?.name || '';
  const initials = displayName
    ? displayName
        .split(' ')
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const location = [profile?.state, profile?.country].filter(Boolean).join(', ');

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
          paddingBottom: insets.bottom + 20,
          transform: [{ translateY: slideAnim }],
          maxHeight: SCREEN_HEIGHT * 0.82,
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

        {/* Header row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: '#F3F4F6',
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827' }}>My Profile</Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={17} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 }}
        >
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator color="#0D4C3E" size="large" />
              <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 14 }}>
                Loading profile…
              </Text>
            </View>
          ) : (
            <>
              {/* Avatar + name block */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <View
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 44,
                    backgroundColor: '#0D4C3E',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    shadowColor: '#0D4C3E',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>{initials}</Text>
                </View>

                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: '800',
                    color: '#111827',
                    textAlign: 'center',
                  }}
                >
                  {displayName || '—'}
                </Text>

                <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 3 }}>
                  {profile?.email || user?.email || ''}
                </Text>

                {/* Premium badge */}
                <View
                  style={{
                    marginTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: profile?.is_premium ? '#FEF3C7' : '#F3F4F6',
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 20,
                  }}
                >
                  {profile?.is_premium && <Crown size={12} color="#D97706" />}
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: profile?.is_premium ? '#92400E' : '#6B7280',
                    }}
                  >
                    {profile?.is_premium ? 'Premium Member' : 'Free Member'}
                  </Text>
                </View>
              </View>

              {/* Info cards */}
              <View
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  overflow: 'hidden',
                  marginBottom: 16,
                }}
              >
                {profile?.phone ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 14,
                      borderBottomWidth: 1,
                      borderColor: '#F3F4F6',
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: '#E8F5F0',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Phone size={16} color="#0D4C3E" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600' }}>
                        PHONE
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                        {profile.phone}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {location ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 14,
                      borderBottomWidth: profile?.favourite_subjects?.length ? 1 : 0,
                      borderColor: '#F3F4F6',
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: '#EFF6FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MapPin size={16} color="#3B82F6" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600' }}>
                        LOCATION
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                        {location}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {profile?.favourite_subjects?.length ? (
                  <View
                    style={{
                      padding: 14,
                      gap: 10,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: '#FDF2F8',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 2,
                      }}
                    >
                      <BookOpen size={16} color="#EC4899" />
                    </View>
                    {profile.favourite_subjects.map((s) => (
                      <View
                        key={s}
                        style={{
                          backgroundColor: '#E8F5F0',
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 20,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#0D4C3E', fontWeight: '700' }}>
                          {s}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Empty state if no extra info */}
                {!profile?.phone && !location && !profile?.favourite_subjects?.length && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                      No additional info yet.{'\n'}Tap Edit Profile to add details.
                    </Text>
                  </View>
                )}
              </View>

              {/* Edit button */}
              <TouchableOpacity
                onPress={handleEditPress}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: '#0D4C3E',
                  paddingVertical: 15,
                  borderRadius: 16,
                }}
              >
                <Pencil size={17} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}
