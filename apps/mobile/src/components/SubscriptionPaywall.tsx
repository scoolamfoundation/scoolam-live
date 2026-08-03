import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Crown,
  Check,
  X,
  Lock,
  Zap,
  Star,
  RotateCcw,
  Apple,
  ShoppingBag,
} from 'lucide-react-native';
import { useAuth } from '@/utils/auth/useAuth';
import { useInAppPurchase } from '@/utils/iap';

interface AdminPlan {
  id: number;
  name: string;
  price: number;
  billing_period: string;
  features: string[];
  is_featured: boolean;
  sort_order: number;
  rc_package_identifier: string;
  apple_product_id: string;
  google_product_id: string;
}

const PLAN_COLORS = [
  { accent: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', pill: '#F3F4F6', pillText: '#374151' },
  { accent: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', pill: '#DBEAFE', pillText: '#1D4ED8' },
  { accent: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', pill: '#FEF3C7', pillText: '#92400E' },
  { accent: '#10B981', bg: '#F0FDF4', border: '#A7F3D0', pill: '#D1FAE5', pillText: '#065F46' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  topicTitle?: string;
  onPurchaseComplete?: () => void;
}

export default function SubscriptionPaywall({
  visible,
  onClose,
  topicTitle,
  onPurchaseComplete,
}: Props) {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const { offerings, isReady, purchasePackage, restorePurchases, isPurchasing } =
    useInAppPurchase();

  const [adminPlans, setAdminPlans] = useState<AdminPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);

  // Fetch admin plan metadata (features list, names, etc.)
  useEffect(() => {
    if (!visible) return;
    void (async () => {
      setLoadingPlans(true);
      try {
        const res = await fetch('/api/subscription-plans');
        if (res.ok) {
          const data = await res.json();
          setAdminPlans(data.plans ?? []);
          setSubscriptionsEnabled(data.subscriptions_enabled !== false);
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, [visible]);

  // Get RC packages from current offering
  const rcPackages = offerings?.current?.availablePackages ?? [];

  // Match RC package to admin plan by rc_package_identifier
  const getAdminPlan = useCallback(
    (pkg: any): AdminPlan | undefined => {
      const rcId: string = pkg.identifier ?? '';
      return adminPlans.find((p) => p.rc_package_identifier && p.rc_package_identifier === rcId);
    },
    [adminPlans]
  );

  const handlePurchase = async (pkg: any) => {
    if (!auth?.user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe to a plan.');
      return;
    }
    const result = await purchasePackage({ pkg });
    if (result?.success) {
      onPurchaseComplete?.();
      onClose();
      Alert.alert(
        '🎉 Welcome to Premium!',
        'Your subscription is now active. Enjoy unlimited access!'
      );
    } else if (result && !result.cancelled) {
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    }
  };

  const handleRestore = async () => {
    if (!auth?.user) {
      Alert.alert('Sign In Required', 'Please sign in to restore your purchases.');
      return;
    }
    setRestoring(true);
    const result = await restorePurchases();
    setRestoring(false);
    if (result?.success) {
      onPurchaseComplete?.();
      onClose();
      Alert.alert('✅ Restored!', 'Your previous subscription has been restored.');
    } else {
      Alert.alert('No Active Subscription', 'We could not find an active subscription to restore.');
    }
  };

  const loading = !isReady || loadingPlans;
  const hasPackages = rcPackages.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#0D4C3E' }}>
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: 28,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: insets.top + 12,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color="#fff" />
          </TouchableOpacity>

          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              backgroundColor: '#FCD34D',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              shadowColor: '#FCD34D',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
            }}
          >
            <Crown size={34} color="#78350F" />
          </View>

          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center' }}>
            Scoolam Pro
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 15,
              textAlign: 'center',
              marginTop: 8,
              lineHeight: 22,
              maxWidth: 280,
            }}
          >
            {topicTitle ? `"${topicTitle}" is premium content.` : 'Unlock unlimited learning.'}
            {'\n'}Upgrade to access all topics.
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 14,
              backgroundColor: 'rgba(255,255,255,0.12)',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Lock size={13} color="#FCD34D" />
            <Text style={{ color: '#FCD34D', fontSize: 12, fontWeight: '700' }}>
              PREMIUM CONTENT
            </Text>
          </View>
        </View>

        {/* Plans area */}
        <View
          style={{
            flex: 1,
            backgroundColor: '#F9FAFB',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}
        >
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Zap size={16} color="#0D4C3E" />
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>
                Choose a Plan
              </Text>
            </View>

            {loading ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator color="#0D4C3E" size="large" />
                <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 14 }}>
                  Loading plans…
                </Text>
              </View>
            ) : !subscriptionsEnabled ? (
              /* Subscriptions disabled by admin */
              <View
                style={{
                  backgroundColor: '#FEF3C7',
                  borderRadius: 20,
                  padding: 24,
                  alignItems: 'center',
                  marginVertical: 8,
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 12 }}>🔒</Text>
                <Text
                  style={{ fontSize: 16, fontWeight: '800', color: '#92400E', textAlign: 'center' }}
                >
                  Subscriptions Unavailable
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: '#B45309',
                    textAlign: 'center',
                    marginTop: 8,
                    lineHeight: 20,
                  }}
                >
                  Subscription plans are temporarily unavailable. Please check back later.
                </Text>
              </View>
            ) : !hasPackages ? (
              /* RC not set up yet — show admin plans as reference (no purchase) */
              <View style={{ gap: 14 }}>
                <View
                  style={{
                    backgroundColor: '#FEF3C7',
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 4,
                    flexDirection: 'row',
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>⚠️</Text>
                  <Text style={{ flex: 1, fontSize: 13, color: '#92400E', lineHeight: 19 }}>
                    In-app purchases are not configured yet. The admin needs to connect RevenueCat
                    in the dashboard.
                  </Text>
                </View>
                {adminPlans
                  .filter((p) => p.price > 0)
                  .map((plan, idx) => {
                    const colors = PLAN_COLORS[(idx + 1) % PLAN_COLORS.length];
                    return (
                      <View
                        key={plan.id}
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 22,
                          borderWidth: 1.5,
                          borderColor: colors.border,
                          padding: 18,
                          opacity: 0.7,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 17,
                            fontWeight: '800',
                            color: '#111827',
                            marginBottom: 4,
                          }}
                        >
                          {plan.name}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 12 }}>
                          {plan.billing_period === 'month'
                            ? 'Monthly'
                            : plan.billing_period === 'year'
                              ? 'Yearly'
                              : 'One-time'}
                        </Text>
                        {(plan.features ?? []).map((f, fi) => (
                          <View key={fi} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                            <Check size={14} color={colors.accent} style={{ marginTop: 2 }} />
                            <Text style={{ flex: 1, fontSize: 13, color: '#374151' }}>{f}</Text>
                          </View>
                        ))}
                        <View
                          style={{
                            marginTop: 14,
                            backgroundColor: '#F3F4F6',
                            borderRadius: 12,
                            paddingVertical: 13,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#9CA3AF', fontWeight: '700', fontSize: 14 }}>
                            Not Available Yet
                          </Text>
                        </View>
                      </View>
                    );
                  })}
              </View>
            ) : (
              /* RC packages available — show with native purchase */
              <View style={{ gap: 14 }}>
                {rcPackages.map((pkg: any, idx: number) => {
                  const adminPlan = getAdminPlan(pkg);
                  const colors = PLAN_COLORS[(idx + 1) % PLAN_COLORS.length];
                  const displayName = adminPlan?.name ?? pkg.product?.title ?? pkg.identifier;
                  const priceString: string = pkg.product?.priceString ?? '';
                  const isFeatured = adminPlan?.is_featured ?? false;
                  const features: string[] = adminPlan?.features ?? [];
                  const period: string = pkg.packageType ?? '';

                  const periodLabel =
                    period.includes('ANNUAL') || period.includes('YEAR')
                      ? 'Billed yearly'
                      : period.includes('MONTH')
                        ? 'Billed monthly'
                        : period.includes('WEEK')
                          ? 'Billed weekly'
                          : 'One-time';

                  return (
                    <View
                      key={pkg.identifier}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 22,
                        borderWidth: isFeatured ? 2.5 : 1.5,
                        borderColor: isFeatured ? colors.accent : colors.border,
                        overflow: 'hidden',
                        shadowColor: isFeatured ? colors.accent : '#000',
                        shadowOffset: { width: 0, height: isFeatured ? 8 : 2 },
                        shadowOpacity: isFeatured ? 0.2 : 0.06,
                        shadowRadius: isFeatured ? 16 : 6,
                        elevation: isFeatured ? 6 : 2,
                      }}
                    >
                      {isFeatured && (
                        <View
                          style={{
                            backgroundColor: colors.accent,
                            paddingVertical: 6,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <Star size={12} color="#fff" fill="#fff" />
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: '800',
                              letterSpacing: 0.8,
                            }}
                          >
                            MOST POPULAR
                          </Text>
                        </View>
                      )}

                      <View style={{ padding: 18 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 14,
                          }}
                        >
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>
                              {displayName}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                color: '#9CA3AF',
                                marginTop: 2,
                                fontWeight: '500',
                              }}
                            >
                              {periodLabel}
                            </Text>
                          </View>
                          <View
                            style={{
                              backgroundColor: colors.pill,
                              paddingHorizontal: 14,
                              paddingVertical: 8,
                              borderRadius: 14,
                            }}
                          >
                            <Text
                              style={{ fontSize: 17, fontWeight: '900', color: colors.pillText }}
                            >
                              {priceString}
                            </Text>
                          </View>
                        </View>

                        {features.length > 0 && (
                          <View style={{ gap: 8, marginBottom: 4 }}>
                            {features.map((feature, fi) => (
                              <View
                                key={fi}
                                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}
                              >
                                <View
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    backgroundColor: colors.bg,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: 1,
                                    flexShrink: 0,
                                  }}
                                >
                                  <Check size={12} color={colors.accent} />
                                </View>
                                <Text
                                  style={{
                                    flex: 1,
                                    fontSize: 13,
                                    color: '#374151',
                                    lineHeight: 19,
                                    fontWeight: '500',
                                  }}
                                >
                                  {feature}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}

                        <TouchableOpacity
                          onPress={() => void handlePurchase(pkg)}
                          disabled={isPurchasing}
                          style={{
                            marginTop: 16,
                            backgroundColor: isPurchasing ? '#9CA3AF' : colors.accent,
                            borderRadius: 14,
                            paddingVertical: 14,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8,
                          }}
                        >
                          {isPurchasing ? <ActivityIndicator color="#fff" size="small" /> : null}
                          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                            {isPurchasing ? 'Processing…' : `Subscribe for ${priceString}`}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Store badges */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 16,
                marginTop: 20,
                marginBottom: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Apple size={14} color="#9CA3AF" />
                <Text style={{ fontSize: 11, color: '#9CA3AF' }}>App Store</Text>
              </View>
              <Text style={{ color: '#E5E7EB' }}>•</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <ShoppingBag size={14} color="#9CA3AF" />
                <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Google Play</Text>
              </View>
            </View>

            {/* Restore purchases — required by App Store guidelines */}
            <TouchableOpacity
              onPress={() => void handleRestore()}
              disabled={restoring || isPurchasing}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 14,
                paddingVertical: 8,
              }}
            >
              {restoring ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <RotateCcw size={14} color="#6B7280" />
              )}
              <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '600' }}>
                {restoring ? 'Restoring…' : 'Restore Purchases'}
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: 11,
                marginTop: 12,
                lineHeight: 16,
              }}
            >
              Subscriptions auto-renew unless cancelled. Managed in{'\n'}your device's subscription
              settings.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
