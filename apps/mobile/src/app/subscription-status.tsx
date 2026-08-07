import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Crown, CheckCircle2, Lock, Zap, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import SubscriptionPaywall from '@/components/SubscriptionPaywall';
import { useRequireAuth } from '@/utils/auth/useAuth';

interface Plan {
  id: number;
  name: string;
  price: number;
  billing_period: string;
  features: string[];
  is_featured: boolean;
}

export default function SubscriptionStatusScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Block unauthenticated access
  useRequireAuth();

  const [isPremium, setIsPremium] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      const [premiumRes, plansRes] = await Promise.all([
        fetch('/api/user-premium'),
        fetch('/api/subscription-plans'),
      ]);
      if (premiumRes.ok) {
        const d = (await premiumRes.json()) as { is_premium: boolean };
        setIsPremium(d.is_premium ?? false);
      }
      if (plansRes.ok) {
        const d = (await plansRes.json()) as { plans: Plan[] };
        setPlans(d.plans ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>Subscription</Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 1 }}>Manage your plan</Text>
        </View>
      </View>

      <SubscriptionPaywall visible={paywallVisible} onClose={() => setPaywallVisible(false)} />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator color="#0D4C3E" size="large" />
          </View>
        ) : (
          <>
            {/* Current Status */}
            <View
              style={{
                backgroundColor: isPremium ? '#0D4C3E' : '#F9FAFB',
                borderRadius: 24,
                padding: 24,
                alignItems: 'center',
                marginBottom: 24,
                borderWidth: isPremium ? 0 : 1,
                borderColor: '#F3F4F6',
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: isPremium ? 'rgba(255,255,255,0.15)' : '#FEF3C7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                {isPremium ? (
                  <Crown size={32} color="#FCD34D" />
                ) : (
                  <Lock size={32} color="#D97706" />
                )}
              </View>
              <Text
                style={{ fontSize: 20, fontWeight: '800', color: isPremium ? '#fff' : '#111827' }}
              >
                {isPremium ? '👑 Premium Active' : 'Free Plan'}
              </Text>
              <Text
                style={{
                  color: isPremium ? 'rgba(255,255,255,0.65)' : '#6B7280',
                  textAlign: 'center',
                  marginTop: 8,
                  fontSize: 14,
                }}
              >
                {isPremium
                  ? 'You have full access to all premium content and features.'
                  : 'Upgrade to Premium for unlimited access to all topics and features.'}
              </Text>
              {!isPremium && (
                <TouchableOpacity
                  onPress={() => setPaywallVisible(true)}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#0D4C3E',
                    borderRadius: 14,
                    paddingVertical: 14,
                    paddingHorizontal: 28,
                    marginTop: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Zap size={16} color="#FCD34D" />
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                    Upgrade Now
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Plans */}
            {plans.length > 0 && (
              <>
                <Text
                  style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 14 }}
                >
                  Available Plans
                </Text>
                {plans.map((plan) => (
                  <View
                    key={plan.id}
                    style={{
                      backgroundColor: plan.is_featured ? '#0D4C3E' : '#fff',
                      borderRadius: 20,
                      padding: 20,
                      marginBottom: 14,
                      borderWidth: plan.is_featured ? 0 : 1,
                      borderColor: '#F3F4F6',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: plan.is_featured ? 0.15 : 0.05,
                      shadowRadius: 8,
                      elevation: plan.is_featured ? 4 : 2,
                    }}
                  >
                    {plan.is_featured && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                          backgroundColor: '#FCD34D',
                          alignSelf: 'flex-start',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 20,
                          marginBottom: 12,
                        }}
                      >
                        <Star size={11} color="#78350F" />
                        <Text style={{ color: '#78350F', fontWeight: '800', fontSize: 11 }}>
                          POPULAR
                        </Text>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: '800',
                            color: plan.is_featured ? '#fff' : '#111827',
                          }}
                        >
                          {plan.name}
                        </Text>
                        <Text
                          style={{
                            color: plan.is_featured ? 'rgba(255,255,255,0.6)' : '#6B7280',
                            fontSize: 13,
                            marginTop: 2,
                          }}
                        >
                          per {plan.billing_period}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 26,
                          fontWeight: '900',
                          color: plan.is_featured ? '#FCD34D' : '#0D4C3E',
                        }}
                      >
                        ${plan.price}
                      </Text>
                    </View>
                    {Array.isArray(plan.features) && plan.features.length > 0 && (
                      <View style={{ marginTop: 14, gap: 6 }}>
                        {(plan.features as string[]).map((f, i) => (
                          <View
                            key={i}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                          >
                            <CheckCircle2
                              size={15}
                              color={plan.is_featured ? '#A7F3D0' : '#0D4C3E'}
                            />
                            <Text
                              style={{
                                color: plan.is_featured ? 'rgba(255,255,255,0.85)' : '#374151',
                                fontSize: 13,
                              }}
                            >
                              {f}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {!isPremium && (
                      <TouchableOpacity
                        onPress={() => setPaywallVisible(true)}
                        activeOpacity={0.85}
                        style={{
                          backgroundColor: plan.is_featured ? '#FCD34D' : '#0D4C3E',
                          borderRadius: 12,
                          paddingVertical: 12,
                          alignItems: 'center',
                          marginTop: 16,
                        }}
                      >
                        <Text
                          style={{
                            color: plan.is_featured ? '#78350F' : '#fff',
                            fontWeight: '800',
                            fontSize: 14,
                          }}
                        >
                          Get {plan.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
