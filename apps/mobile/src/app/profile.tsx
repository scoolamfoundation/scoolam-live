import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Check, Trash2 } from 'lucide-react-native';
import { useUser } from '@/utils/auth/useUser';
import { useRouter } from 'expo-router';
import { useAuth } from '@/utils/auth/useAuth';
import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';

const STATE_COUNTRY_MAP: Record<string, string> = {
  'Andhra Pradesh': 'India',
  'Arunachal Pradesh': 'India',
  Assam: 'India',
  Bihar: 'India',
  Chhattisgarh: 'India',
  Goa: 'India',
  Gujarat: 'India',
  Haryana: 'India',
  'Himachal Pradesh': 'India',
  Jharkhand: 'India',
  Karnataka: 'India',
  Kerala: 'India',
  'Madhya Pradesh': 'India',
  Maharashtra: 'India',
  Manipur: 'India',
  Meghalaya: 'India',
  Mizoram: 'India',
  Nagaland: 'India',
  Odisha: 'India',
  Punjab: 'India',
  Rajasthan: 'India',
  Sikkim: 'India',
  'Tamil Nadu': 'India',
  Telangana: 'India',
  Tripura: 'India',
  'Uttar Pradesh': 'India',
  Uttarakhand: 'India',
  'West Bengal': 'India',
  Delhi: 'India',
  California: 'USA',
  'New York': 'USA',
  Texas: 'USA',
  Florida: 'USA',
  England: 'UK',
  Scotland: 'UK',
  Wales: 'UK',
  Ontario: 'Canada',
  Quebec: 'Canada',
  'British Columbia': 'Canada',
};

const SUBJECTS = [
  'Biology',
  'Chemistry',
  'Physics',
  'Math',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Political Science',
];

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  state: string;
  country: string;
  favourite_subjects: string[];
}

const inputStyle = {
  borderWidth: 1.5 as const,
  borderColor: '#E5E7EB',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  color: '#111827',
  backgroundColor: '#F9FAFB',
  marginBottom: 16,
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  const { signOut, signIn } = useAuth();

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Start with cached user data so the form shows immediately — no blank loading state
  const [loadingProfile, setLoadingProfile] = useState(false);
  const saveAnim = useRef(new Animated.Value(1)).current;

  const [form, setForm] = useState<ProfileData>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    state: '',
    country: '',
    favourite_subjects: [],
  });

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) return; // silently keep cached data
      const data = await res.json();
      setForm({
        name: data.user.name ?? '',
        email: data.user.email ?? '',
        phone: data.user.phone ?? '',
        state: data.user.state ?? '',
        country: data.user.country ?? '',
        favourite_subjects: data.user.favourite_subjects ?? [],
      });
    } catch {
      // keep cached data from session
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onStateChange = (val: string) => {
    const country = STATE_COUNTRY_MAP[val] ?? form.country;
    setForm((f) => ({ ...f, state: val, country }));
  };

  const toggleSubject = (sub: string) => {
    setForm((f) => ({
      ...f,
      favourite_subjects: f.favourite_subjects.includes(sub)
        ? f.favourite_subjects.filter((s) => s !== sub)
        : [...f.favourite_subjects, sub],
    }));
  };

  const saveProfile = async () => {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    Animated.sequence([
      Animated.timing(saveAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(saveAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          state: form.state.trim(),
          country: form.country.trim(),
          favourite_subjects: form.favourite_subjects,
        }),
      });
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        const errMsg = errData.error ?? `Server error (${res.status})`;
        Alert.alert('Error', errMsg);
        return;
      }
      try {
        const data = await res.json();
        Alert.alert('Saved! ✅', 'Your profile has been updated.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } catch {
        Alert.alert('Saved! ✅', 'Your profile has been updated.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('Profile save error:', errMsg);
      Alert.alert(
        'Error',
        `Could not save profile. ${errMsg || 'Check your connection and try again.'}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Deactivate Account',
      'Your account will be deactivated. Your data is kept but you will lose access. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await fetch('/api/profile', { method: 'DELETE' });
              signOut();
              router.replace('/');
              setTimeout(() => signIn(), 400);
            } catch {
              Alert.alert('Error', 'Could not deactivate account.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const initials = form.name
    ? form.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ((user?.name ?? '?')[0]?.toUpperCase() ?? '?');

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: '#F9FAFB', paddingTop: insets.top }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderColor: '#F3F4F6',
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827' }}>Edit Profile</Text>
        </View>

        {loadingProfile ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#0D4C3E" size="large" />
            <Text style={{ color: '#9CA3AF', marginTop: 14 }}>Loading your profile…</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 22, paddingBottom: insets.bottom + 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar preview */}
            <View style={{ alignItems: 'center', marginBottom: 28 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#0D4C3E',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#0D4C3E',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>{initials}</Text>
              </View>
              <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}>
                Initials update as you type your name
              </Text>
            </View>

            {/* Full Name */}
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
              FULL NAME
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Your full name"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
            />

            {/* Phone */}
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
              PHONE NUMBER
            </Text>
            <TextInput
              value={form.phone}
              onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="+91 98765 43210"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={inputStyle}
            />

            {/* Email read-only */}
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
              EMAIL{' '}
              <Text style={{ color: '#9CA3AF', fontWeight: '400', fontSize: 11 }}>
                (cannot be changed)
              </Text>
            </Text>
            <View style={{ ...inputStyle, borderColor: '#F3F4F6', backgroundColor: '#F3F4F6' }}>
              <Text style={{ fontSize: 15, color: '#9CA3AF' }}>{form.email}</Text>
            </View>

            {/* State */}
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
              STATE / PROVINCE
            </Text>
            <TextInput
              value={form.state}
              onChangeText={onStateChange}
              placeholder="e.g. Maharashtra"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
            />

            {/* Country */}
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
              COUNTRY{' '}
              <Text style={{ color: '#0D4C3E', fontWeight: '400', fontSize: 11 }}>
                (auto-filled from state)
              </Text>
            </Text>
            <TextInput
              value={form.country}
              onChangeText={(v) => setForm((f) => ({ ...f, country: v }))}
              placeholder="e.g. India, USA"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
            />

            {/* Favourite Subjects */}
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#374151',
                marginBottom: 10,
                marginTop: 4,
              }}
            >
              FAVOURITE SUBJECTS
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {SUBJECTS.map((sub) => {
                const selected = form.favourite_subjects.includes(sub);
                return (
                  <TouchableOpacity
                    key={sub}
                    onPress={() => toggleSubject(sub)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1.5,
                      borderColor: selected ? '#0D4C3E' : '#E5E7EB',
                      backgroundColor: selected ? '#0D4C3E' : '#fff',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: selected ? '#fff' : '#4B5563',
                      }}
                    >
                      {sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Save Changes */}
            <Animated.View style={{ transform: [{ scale: saveAnim }] }}>
              <TouchableOpacity
                onPress={() => void saveProfile()}
                disabled={saving}
                style={{
                  backgroundColor: saving ? '#6B9E90' : '#0D4C3E',
                  paddingVertical: 16,
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Check size={18} color="#fff" />
                )}
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Danger Zone divider */}
            <View
              style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 28, gap: 10 }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: '#FEE2E2' }} />
              <Text style={{ color: '#FCA5A5', fontSize: 11, fontWeight: '700' }}>DANGER ZONE</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#FEE2E2' }} />
            </View>

            {/* Deactivate Account */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              disabled={deleting}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: '#FEE2E2',
                backgroundColor: '#FEF2F2',
                gap: 8,
              }}
            >
              {deleting ? (
                <ActivityIndicator color="#EF4444" size="small" />
              ) : (
                <Trash2 size={16} color="#EF4444" />
              )}
              <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '700' }}>
                {deleting ? 'Deactivating…' : 'Deactivate Account'}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 11,
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 16,
              }}
            >
              Your data is kept but you lose access.{'\n'}Contact support to re-enable.
            </Text>
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
