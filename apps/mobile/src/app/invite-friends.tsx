import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Gift,
  Copy,
  Share2,
  Check,
  Wallet,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';

interface ReferralData {
  code: string;
  referral_link: string;
  wallet_balance: number;
  reward_amount: number;
  total_referrals: number;
  rewarded_referrals: number;
}

export default function InviteFriendsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{ success: boolean; message: string } | null>(
    null
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/referral');
      if (res.ok) {
        const d = (await res.json()) as ReferralData;
        setData(d);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const copyCode = () => {
    if (!data?.code) return;
    void Clipboard.setStringAsync(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (!data) return;
    try {
      await Share.share({
        message: `Join Scoolam and start learning! Use my referral code ${data.code} or click: ${data.referral_link}`,
        url: data.referral_link,
        title: 'Join Scoolam',
      });
    } catch {
      // user dismissed
    }
  };

  const applyReferralCode = async () => {
    if (!applyCode.trim()) {
      Alert.alert('Enter Code', 'Please enter a referral code to apply.');
      return;
    }
    setApplying(true);
    setApplyResult(null);
    try {
      const res = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: applyCode.trim().toUpperCase() }),
      });
      const d = (await res.json()) as { success?: boolean; error?: string; message?: string };
      if (res.ok && d.success) {
        setApplyResult({ success: true, message: d.message ?? 'Referral code applied!' });
        setApplyCode('');
        void load(); // refresh data
      } else {
        setApplyResult({ success: false, message: d.error ?? 'Invalid code' });
      }
    } catch {
      setApplyResult({ success: false, message: 'Could not apply code. Try again.' });
    } finally {
      setApplying(false);
    }
  };

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
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>Invite Friends</Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 1 }}>Earn wallet rewards</Text>
        </View>
      </View>

      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', paddingTop: 80 }}>
              <ActivityIndicator color="#0D4C3E" size="large" />
            </View>
          ) : (
            <>
              {/* Hero Banner */}
              <View
                style={{
                  backgroundColor: '#0D4C3E',
                  margin: 20,
                  borderRadius: 24,
                  padding: 24,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 24,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Gift size={36} color="#FCD34D" />
                </View>
                <Text
                  style={{ color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' }}
                >
                  Earn {data?.reward_amount ?? 50} {'\u20B9'} per Invite!
                </Text>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                    textAlign: 'center',
                    marginTop: 8,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  Share your referral code with friends. When they join, your wallet gets credited
                  automatically.
                </Text>
              </View>

              {/* Wallet Balance */}
              <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      backgroundColor: '#FEF3C7',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Wallet size={26} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '600' }}>
                      Wallet Balance
                    </Text>
                    <Text
                      style={{ fontSize: 28, fontWeight: '900', color: '#111827', marginTop: 2 }}
                    >
                      {'\u20B9'}
                      {Number(data?.wallet_balance ?? 0).toFixed(0)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Users size={14} color="#0D4C3E" />
                      <Text style={{ fontWeight: '700', color: '#0D4C3E', fontSize: 15 }}>
                        {data?.total_referrals ?? 0}
                      </Text>
                    </View>
                    <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>
                      Invites sent
                    </Text>
                  </View>
                </View>
              </View>

              {/* Referral Code */}
              <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 }}
                >
                  Your Referral Code
                </Text>
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 18,
                    padding: 20,
                    borderWidth: 1.5,
                    borderColor: '#E8F5F0',
                    borderStyle: 'dashed',
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 32,
                      fontWeight: '900',
                      color: '#0D4C3E',
                      letterSpacing: 6,
                    }}
                  >
                    {data?.code ?? '——'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                    <TouchableOpacity
                      onPress={copyCode}
                      activeOpacity={0.8}
                      style={{
                        flex: 1,
                        backgroundColor: codeCopied ? '#ECFDF5' : '#F3F4F6',
                        borderRadius: 12,
                        paddingVertical: 12,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {codeCopied ? (
                        <Check size={16} color="#059669" />
                      ) : (
                        <Copy size={16} color="#374151" />
                      )}
                      <Text
                        style={{
                          fontWeight: '700',
                          fontSize: 14,
                          color: codeCopied ? '#059669' : '#374151',
                        }}
                      >
                        {codeCopied ? 'Copied!' : 'Copy Code'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => void shareLink()}
                      activeOpacity={0.8}
                      style={{
                        flex: 1,
                        backgroundColor: '#0D4C3E',
                        borderRadius: 12,
                        paddingVertical: 12,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Share2 size={16} color="#fff" />
                      <Text style={{ fontWeight: '700', fontSize: 14, color: '#fff' }}>
                        Share Link
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Apply Referral Code */}
              <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 }}
                >
                  Got a Friend&apos;s Code?
                </Text>
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 18,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                  }}
                >
                  {applyResult ? (
                    <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                      <CheckCircle2 size={32} color={applyResult.success ? '#059669' : '#DC2626'} />
                      <Text
                        style={{
                          fontWeight: '700',
                          color: applyResult.success ? '#065F46' : '#991B1B',
                          fontSize: 15,
                          marginTop: 8,
                          textAlign: 'center',
                        }}
                      >
                        {applyResult.message}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setApplyResult(null)}
                        style={{ marginTop: 10 }}
                      >
                        <Text style={{ color: '#6B7280', fontSize: 13 }}>Try another code</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TextInput
                        value={applyCode}
                        onChangeText={(v) => setApplyCode(v.toUpperCase())}
                        placeholder="ENTER CODE"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="characters"
                        style={{
                          flex: 1,
                          borderWidth: 1.5,
                          borderColor: '#E5E7EB',
                          borderRadius: 12,
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          fontSize: 16,
                          fontWeight: '700',
                          color: '#0D4C3E',
                          backgroundColor: '#F9FAFB',
                          letterSpacing: 3,
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => void applyReferralCode()}
                        disabled={applying}
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: '#0D4C3E',
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {applying ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <ArrowRight size={20} color="#fff" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* How it works */}
              <View style={{ paddingHorizontal: 20 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 }}
                >
                  How It Works
                </Text>
                {[
                  {
                    step: '1',
                    label: 'Share your code',
                    desc: 'Share your unique referral code or link with friends',
                  },
                  {
                    step: '2',
                    label: 'Friend joins',
                    desc: 'Your friend signs up using your code',
                  },
                  {
                    step: '3',
                    label: 'You earn',
                    desc: `Get ${'\u20B9'}${data?.reward_amount ?? 50} credited to your wallet automatically`,
                  },
                  {
                    step: '4',
                    label: 'Redeem rewards',
                    desc: 'Use your wallet balance to pay for subscriptions',
                  },
                ].map((item) => (
                  <View
                    key={item.step}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: 14,
                      marginBottom: 16,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: '#0D4C3E',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                        {item.step}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: '#111827', fontSize: 15 }}>
                        {item.label}
                      </Text>
                      <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    </View>
  );
}
