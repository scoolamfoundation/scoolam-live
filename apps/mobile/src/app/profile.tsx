import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LogOut,
  ChevronRight,
  ChevronLeft,
  Bell,
  Shield,
  Book,
  Pencil,
  X,
  Check,
  Trash2,
} from 'lucide-react-native';
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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  const { signOut, signIn } = useAuth();

  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [localProfile, setLocalProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    state: '',
    country: '',
    favourite_subjects: [],
  });
  const [editForm, setEditForm] = useState<ProfileData>(localProfile);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const p: ProfileData = {
        name: data.user.name ?? '',
        email: data.user.email ?? '',
        phone: data.user.phone ?? '',
        state: data.user.state ?? '',
        country: data.user.country ?? '',
        favourite_subjects: data.user.favourite_subjects ?? [],
      };
      setLocalProfile(p);
    } catch {
      setLocalProfile({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: '',
        state: '',
        country: '',
        favourite_subjects: [],
      });
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const openEdit = () => {
    setEditForm({ ...localProfile });
    setEditVisible(true);
  };

  const onStateChange = (val: string) => {
    const country = STATE_COUNTRY_MAP[val] ?? editForm.country;
    setEditForm((f) => ({ ...f, state: val, country }));
  };

  const toggleSubject = (sub: string) => {
    setEditForm((f) => ({
      ...f,
      favourite_subjects: f.favourite_subjects.includes(sub)
        ? f.favourite_subjects.filter((s) => s !== sub)
        : [...f.favourite_subjects, sub],
    }));
  };

  const saveProfile = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          state: editForm.state.trim(),
          country: editForm.country.trim(),
          favourite_subjects: editForm.favourite_subjects,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setLocalProfile({ ...editForm, name: editForm.name.trim() });
      setEditVisible(false);
      // small delay so the modal finishes closing before the alert pops up
      setTimeout(() => {
        Alert.alert('Profile Updated', 'Your profile has been saved successfully! ✅');
      }, 400);
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Your account will be deactivated. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await fetch('/api/profile', { method: 'DELETE' });
            await signOut();
            router.replace('/');
          } catch {
            Alert.alert('Error', 'Could not delete account.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleSignOut = () => {
    signOut();
    router.replace('/');
    setTimeout(() => {
      signIn();
    }, 400);
  };

  const displayName = localProfile.name || user?.name || '';
  const initials = displayName
    ? displayName
        .split(' ')
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const menuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notification preferences coming soon.'),
    },
    {
      icon: Shield,
      label: 'Privacy Policy',
      onPress: () => router.push('/privacy-policy' as any),
    },
    {
      icon: Book,
      label: 'Terms of Service',
      onPress: () => router.push('/terms-of-service' as any),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB', paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
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
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>My Profile</Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 1 }}>
            Manage your account settings
          </Text>
        </View>
        <TouchableOpacity
          onPress={openEdit}
          style={{
            backgroundColor: '#E8F5F0',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Pencil size={13} color="#0D4C3E" />
          <Text style={{ fontWeight: '700', color: '#0D4C3E', fontSize: 13 }}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Avatar + info */}
        <View
          style={{
            paddingHorizontal: 28,
            paddingTop: 28,
            paddingBottom: 24,
            alignItems: 'center',
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderColor: '#F3F4F6',
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: '#0D4C3E',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>{initials}</Text>
          </View>

          {loadingProfile ? (
            <ActivityIndicator color="#0D4C3E" />
          ) : (
            <>
              <Text
                style={{ fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center' }}
              >
                {displayName || '—'}
              </Text>
              <Text style={{ color: '#6B7280', marginTop: 4, fontSize: 13 }}>
                {localProfile.email}
              </Text>
              {localProfile.phone ? (
                <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
                  {localProfile.phone}
                </Text>
              ) : null}
              {localProfile.state || localProfile.country ? (
                <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
                  {[localProfile.state, localProfile.country].filter(Boolean).join(', ')}
                </Text>
              ) : null}
              {localProfile.favourite_subjects.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 10,
                  }}
                >
                  {localProfile.favourite_subjects.map((s) => (
                    <View
                      key={s}
                      style={{
                        backgroundColor: '#E8F5F0',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: '#0D4C3E', fontWeight: '700' }}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Settings */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 12 }}>
            Settings
          </Text>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 18,
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
                  padding: 16,
                  borderBottomWidth: i < menuItems.length - 1 ? 1 : 0,
                  borderColor: '#F3F4F6',
                }}
              >
                <item.icon size={19} color="#4B5563" />
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 14,
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  {item.label}
                </Text>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              marginTop: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FEF2F2',
              paddingVertical: 16,
              borderRadius: 14,
              gap: 8,
            }}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '700' }}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            disabled={deleting}
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              gap: 6,
            }}
          >
            {deleting ? (
              <ActivityIndicator color="#9CA3AF" size="small" />
            ) : (
              <Trash2 size={15} color="#9CA3AF" />
            )}
            <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '600' }}>
              {deleting ? 'Deactivating…' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
      >
        <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View
              style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                maxHeight: '92%',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 22,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
                <Text style={{ fontSize: 19, fontWeight: '800', color: '#111827' }}>
                  Edit Profile
                </Text>
                <TouchableOpacity onPress={() => setEditVisible(false)}>
                  <X size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={{ padding: 22, paddingBottom: insets.bottom + 100 }}
                showsVerticalScrollIndicator={false}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#374151',
                    marginBottom: 6,
                    marginTop: 4,
                  }}
                >
                  FULL NAME
                </Text>
                <TextInput
                  value={editForm.name}
                  onChangeText={(v) => setEditForm((f) => ({ ...f, name: v }))}
                  placeholder="Your full name"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    borderWidth: 1.5,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: '#111827',
                    backgroundColor: '#F9FAFB',
                    marginBottom: 16,
                  }}
                />

                <Text
                  style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}
                >
                  PHONE NUMBER
                </Text>
                <TextInput
                  value={editForm.phone}
                  onChangeText={(v) => setEditForm((f) => ({ ...f, phone: v }))}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  style={{
                    borderWidth: 1.5,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: '#111827',
                    backgroundColor: '#F9FAFB',
                    marginBottom: 16,
                  }}
                />

                <Text
                  style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}
                >
                  EMAIL{' '}
                  <Text style={{ color: '#9CA3AF', fontWeight: '400' }}>(cannot be changed)</Text>
                </Text>
                <View
                  style={{
                    borderWidth: 1.5,
                    borderColor: '#F3F4F6',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: '#F3F4F6',
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ fontSize: 15, color: '#9CA3AF' }}>{localProfile.email}</Text>
                </View>

                <Text
                  style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}
                >
                  STATE / PROVINCE
                </Text>
                <TextInput
                  value={editForm.state}
                  onChangeText={onStateChange}
                  placeholder="e.g. Maharashtra, California"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    borderWidth: 1.5,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: '#111827',
                    backgroundColor: '#F9FAFB',
                    marginBottom: 16,
                  }}
                />

                <Text
                  style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}
                >
                  COUNTRY{' '}
                  <Text style={{ color: '#0D4C3E', fontWeight: '400' }}>
                    (auto-filled from state)
                  </Text>
                </Text>
                <TextInput
                  value={editForm.country}
                  onChangeText={(v) => setEditForm((f) => ({ ...f, country: v }))}
                  placeholder="e.g. India, USA"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    borderWidth: 1.5,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: '#111827',
                    backgroundColor: '#F9FAFB',
                    marginBottom: 20,
                  }}
                />

                <Text
                  style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 10 }}
                >
                  FAVOURITE SUBJECTS
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  {SUBJECTS.map((sub) => {
                    const selected = editForm.favourite_subjects.includes(sub);
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

                <TouchableOpacity
                  onPress={() => void saveProfile()}
                  disabled={saving}
                  style={{
                    backgroundColor: saving ? '#6B9E90' : '#0D4C3E',
                    paddingVertical: 16,
                    borderRadius: 14,
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
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingAnimatedView>
      </Modal>
    </View>
  );
}
