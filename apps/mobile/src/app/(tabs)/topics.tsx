import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, ChevronRight, BookOpen, Lock, Crown, Settings } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import SubscriptionPaywall from '@/components/SubscriptionPaywall';
import SettingsSheet from '@/components/SettingsSheet';

const CATEGORY_IMAGES: Record<string, string> = {
  Biology: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400',
  Chemistry: 'https://images.unsplash.com/photo-1532187875605-2fe358a71424?w=400',
  Physics: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
  Math: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
  English: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400',
  History: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400',
  Geography: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400',
};
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1434031216660-c545dd7dc80a?w=400';

interface Topic {
  id: number;
  title: string;
  category: string;
  description: string;
  video_url: string;
  total_questions: number;
  quiz_duration: number;
  thumbnail_url?: string;
  is_premium: boolean;
}

export default function TopicsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const appState = useRef(AppState.currentState);
  const [activeCategory, setActiveCategory] = useState('All');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userIsPremium, setUserIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paywallTopic, setPaywallTopic] = useState<Topic | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [topicsRes, premiumRes] = await Promise.all([
        fetch('/api/topics'),
        fetch('/api/user-premium'),
      ]);
      if (!topicsRes.ok) throw new Error('Failed');
      const data = await topicsRes.json();
      setTopics(data.topics ?? []);

      if (premiumRes.ok) {
        const premiumData = await premiumRes.json();
        setUserIsPremium(premiumData.is_premium ?? false);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Refresh data whenever the app comes back to the foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        void load();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [load]);

  const handleTopicPress = (item: Topic) => {
    if (item.is_premium && !userIsPremium) {
      setPaywallTopic(item);
      return;
    }
    router.push({ pathname: '/video/[id]' as any, params: { id: String(item.id) } });
  };

  const categories = ['All', ...Array.from(new Set(topics.map((t) => t.category).filter(Boolean)))];
  const filtered =
    activeCategory === 'All' ? topics : topics.filter((t) => t.category === activeCategory);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB', paddingTop: insets.top }}>
      {/* Paywall modal */}
      <SubscriptionPaywall
        visible={!!paywallTopic}
        onClose={() => setPaywallTopic(null)}
        topicTitle={paywallTopic?.title}
      />
      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827' }}>Learning Topics</Text>
          <Text style={{ color: '#6B7280', marginTop: 4 }}>
            {userIsPremium
              ? 'Full access — all topics unlocked 🎉'
              : 'Pick a topic to start learning'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setSettingsOpen(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#E8F5F0',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 4,
          }}
        >
          <Settings size={20} color="#0D4C3E" />
        </TouchableOpacity>
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 6, gap: 10 }}
        style={{ flexGrow: 0, flexShrink: 0 }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.7}
              style={{
                backgroundColor: isActive ? '#0D4C3E' : '#fff',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 25,
                borderWidth: 1.5,
                borderColor: isActive ? '#0D4C3E' : '#E5E7EB',
                elevation: 2,
              }}
            >
              <Text
                style={{ color: isActive ? '#fff' : '#4B5563', fontWeight: '700', fontSize: 14 }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#0D4C3E" size="large" />
          <Text style={{ color: '#6B7280', marginTop: 12 }}>Loading topics…</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
            Could not load topics.{'\n'}Please check your connection.
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <BookOpen size={48} color="#D1D5DB" />
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 16 }}>
            {topics.length === 0
              ? 'No topics added yet.\nCheck back soon!'
              : 'No topics in this category.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isLocked = item.is_premium && !userIsPremium;
            return (
              <TouchableOpacity
                onPress={() => handleTopicPress(item)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  marginBottom: 15,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                  borderWidth: isLocked ? 1.5 : 0,
                  borderColor: isLocked ? '#FDE68A' : 'transparent',
                }}
              >
                {/* Thumbnail */}
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{
                      uri: item.thumbnail_url || CATEGORY_IMAGES[item.category] || FALLBACK_IMAGE,
                    }}
                    style={{
                      width: '100%',
                      height: 160,
                      opacity: isLocked ? 0.55 : 1,
                    }}
                    contentFit="cover"
                  />
                  {/* Premium overlay */}
                  {isLocked && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(13,20,10,0.45)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: '#FCD34D',
                          width: 52,
                          height: 52,
                          borderRadius: 26,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#FCD34D',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.5,
                          shadowRadius: 10,
                        }}
                      >
                        <Lock size={24} color="#78350F" />
                      </View>
                    </View>
                  )}
                  {/* Premium badge top-right */}
                  {item.is_premium && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: '#FCD34D',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 20,
                      }}
                    >
                      <Crown size={11} color="#78350F" />
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#78350F' }}>
                        PREMIUM
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ padding: 15 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: '#E8F5F0',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#0D4C3E' }}>
                        {item.category}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        {item.total_questions}Q · {item.quiz_duration}s
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: isLocked ? '#6B7280' : '#111827',
                      marginTop: 8,
                    }}
                  >
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text
                      style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  ) : null}
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 }}
                  >
                    {isLocked ? (
                      <>
                        <Crown size={14} color="#F59E0B" />
                        <Text style={{ color: '#F59E0B', fontWeight: '700', fontSize: 14 }}>
                          Upgrade to Unlock
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={{ color: '#0D4C3E', fontWeight: '600', fontSize: 14 }}>
                          Watch Video
                        </Text>
                        <ChevronRight size={16} color="#0D4C3E" />
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
