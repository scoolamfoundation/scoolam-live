import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PlayCircle,
  BookOpen,
  FileText,
  Award,
  CheckCircle,
  Zap,
  TrendingUp,
  Flame,
  Crown,
  Lock,
  Settings,
  Bell,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { useUser } from '@/utils/auth/useUser';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubscriptionPaywall from '@/components/SubscriptionPaywall';
import SettingsSheet from '@/components/SettingsSheet';
import ProfileViewSheet from '@/components/ProfileViewSheet';

interface Stats {
  total_videos: number;
  total_correct: number;
  rank: number;
  rank_badge: 'gold' | 'silver' | 'bronze' | null;
  videos_watched: number;
  topics_attempted: number;
  streak_days: number;
}
interface Topic {
  id: number;
  title: string;
  category: string;
  total_questions: number;
  quiz_duration: number;
  thumbnail_url?: string;
  is_premium: boolean;
}
interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  quiz_duration: number;
  total_questions: number;
}

const CATEGORY_IMAGES: Record<string, string> = {
  Biology: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400',
  Chemistry: 'https://images.unsplash.com/photo-1532187875605-2fe358a71424?w=400',
  Physics: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
  Math: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
  English: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400',
  History: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400',
  Geography: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400',
};
const FALLBACK = 'https://images.unsplash.com/photo-1434031216660-c545dd7dc80a?w=400';

const BADGE_COLOR: Record<string, string> = {
  gold: '#F59E0B',
  silver: '#94A3B8',
  bronze: '#B45309',
};
const BADGE_EMOJI: Record<string, string> = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
};

const READ_KEY = 'scoolam_read_notifications';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [stats, setStats] = useState<Stats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userIsPremium, setUserIsPremium] = useState(false);
  const [paywallTopic, setPaywallTopic] = useState<Topic | null>(null);
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [notifUnread, setNotifUnread] = useState(0);
  const [profileViewOpen, setProfileViewOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [topicRes, statsRes, challengeRes, premiumRes, profileRes] = await Promise.all([
        fetch('/api/topics'),
        fetch('/api/stats'),
        fetch('/api/daily-challenge'),
        fetch('/api/user-premium'),
        fetch('/api/profile'),
      ]);
      if (topicRes.ok) {
        const td = await topicRes.json();
        setTopics(td.topics ?? []);
      }
      if (statsRes.ok) {
        const sd = await statsRes.json();
        setStats(sd as Stats);
      }
      if (challengeRes.ok) {
        const cd = await challengeRes.json();
        setDailyChallenges(cd.challenges ?? (cd.challenge ? [cd.challenge] : []));
      }
      if (premiumRes.ok) {
        const pd = await premiumRes.json();
        setUserIsPremium(pd.is_premium ?? false);
      }
      if (profileRes.ok) {
        const pd = await profileRes.json();
        if (pd.user?.name) setProfileName(pd.user.name);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadNotifCount = useCallback(async () => {
    try {
      const [notifRes, readRaw] = await Promise.all([
        fetch('/api/mobile-notifications'),
        AsyncStorage.getItem(READ_KEY),
      ]);
      if (notifRes.ok) {
        const data = (await notifRes.json()) as { notifications: Array<{ id: string }> };
        const readIds = new Set<string>(readRaw ? (JSON.parse(readRaw) as string[]) : []);
        const unread = (data.notifications ?? []).filter((n) => !readIds.has(n.id)).length;
        setNotifUnread(unread);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    void loadNotifCount();
  }, [loadNotifCount]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  // Use DB profile name (always fresh) over cached auth session name
  const displayName = profileName || user?.name || '';
  const initials = displayName
    ? displayName
        .split(' ')
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const recentTopics = topics.slice(0, 4);
  const badge = stats?.rank_badge ?? null;

  const statCards = [
    {
      label: 'Total Videos',
      value: loading ? '—' : String(stats?.total_videos ?? 0),
      icon: PlayCircle,
      color: '#3B82F6',
      extra: null,
    },
    {
      label: 'Correct Ans',
      value: loading ? '—' : String(stats?.total_correct ?? 0),
      icon: CheckCircle,
      color: '#10B981',
      extra: null,
    },
    {
      label: 'My Rank',
      value: loading ? '—' : stats?.rank ? `#${stats.rank}` : '#—',
      icon: Award,
      color: badge ? BADGE_COLOR[badge] : '#6B7280',
      extra: badge ? BADGE_EMOJI[badge] : null,
    },
  ];

  const handleTopicPress = (t: Topic) => {
    if (t.is_premium && !userIsPremium) {
      setPaywallTopic(t);
      return;
    }
    router.push({ pathname: '/video/[id]' as any, params: { id: String(t.id) } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <SubscriptionPaywall
        visible={!!paywallTopic}
        onClose={() => setPaywallTopic(null)}
        topicTitle={paywallTopic?.title}
      />
      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ProfileViewSheet visible={profileViewOpen} onClose={() => setProfileViewOpen(false)} />

      {/* Header */}
      <View
        style={{
          backgroundColor: '#0D4C3E',
          paddingTop: insets.top + 10,
          paddingBottom: 28,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Avatar — taps to open profile view sheet */}
            <TouchableOpacity onPress={() => setProfileViewOpen(true)} activeOpacity={0.8}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{initials}</Text>
              </View>
            </TouchableOpacity>
            <View>
              <Text style={{ color: '#A7C7C1', fontSize: 13 }}>Welcome back,</Text>
              {/* Tappable name — opens profile view sheet */}
              <TouchableOpacity
                onPress={() => setProfileViewOpen(true)}
                activeOpacity={0.75}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              >
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
                  {displayName || 'Learner'}
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  marginTop: 5,
                  alignSelf: 'flex-start',
                  backgroundColor: '#FCD34D',
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#78350F' }}>
                  {userIsPremium ? '👑 Premium Member' : 'Free Member'}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {userIsPremium && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: '#FCD34D',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 16,
                }}
              >
                <Crown size={12} color="#78350F" />
                <Text style={{ color: '#78350F', fontWeight: '800', fontSize: 11 }}>PRO</Text>
              </View>
            )}
            {(stats?.streak_days ?? 0) > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 20,
                }}
              >
                <Flame size={16} color="#FCD34D" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                  {stats?.streak_days}d
                </Text>
              </View>
            )}
            {/* Notification Bell */}
            <TouchableOpacity
              onPress={() => router.push('/notifications' as any)}
              activeOpacity={0.7}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} color="#fff" />
              {notifUnread > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: '#EF4444',
                    borderWidth: 1.5,
                    borderColor: '#0D4C3E',
                  }}
                />
              )}
            </TouchableOpacity>
            {/* Settings Gear */}
            <TouchableOpacity
              onPress={() => setSettingsOpen(true)}
              activeOpacity={0.7}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D4C3E" />
        }
      >
        {/* Stats */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginTop: 20,
          }}
        >
          {statCards.map((stat, i) => (
            <View
              key={i}
              style={{
                backgroundColor: '#fff',
                width: (width - 60) / 3,
                padding: 14,
                borderRadius: 20,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <stat.icon color={stat.color} size={22} />
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '800',
                  color: '#111827',
                  marginTop: 7,
                  textAlign: 'center',
                }}
              >
                {stat.extra ? `${stat.extra} ${stat.value}` : stat.value}
              </Text>
              <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 2, textAlign: 'center' }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Daily Challenge Carousel */}
        <View style={{ marginTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
              Daily Challenges
            </Text>
            {dailyChallenges.length > 1 && (
              <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                {dailyChallenges.length} available
              </Text>
            )}
          </View>

          {loading ? (
            <View
              style={{
                marginHorizontal: 20,
                backgroundColor: '#0D4C3E',
                borderRadius: 24,
                height: 160,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator color="#A7C7C1" />
            </View>
          ) : dailyChallenges.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              decelerationRate="fast"
              snapToInterval={width - 60}
              snapToAlignment="start"
              onScroll={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 60));
                setActiveChallengeIdx(idx);
              }}
              scrollEventThrottle={16}
            >
              {dailyChallenges.map((challenge, idx) => {
                const EMOJIS = ['⚡', '🧠', '🎯', '🔥', '🚀'];
                const BG_COLORS = ['#0D4C3E', '#1E3A5F', '#4A1942', '#1A3A2A', '#2D1B69'];
                const PILL_COLORS = ['#FCD34D', '#60A5FA', '#F472B6', '#34D399', '#A78BFA'];
                const bg = BG_COLORS[idx % BG_COLORS.length];
                const pill = PILL_COLORS[idx % PILL_COLORS.length];
                const emoji = EMOJIS[idx % EMOJIS.length];
                const onChallengePress = () =>
                  router.push({
                    pathname: '/daily-quiz/[id]' as any,
                    params: { id: String(challenge.id) },
                  });

                return (
                  <TouchableOpacity
                    key={challenge.id}
                    onPress={onChallengePress}
                    activeOpacity={0.88}
                    style={{
                      width: width - 60,
                      backgroundColor: bg,
                      borderRadius: 24,
                      padding: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          alignSelf: 'flex-start',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 20,
                          marginBottom: 10,
                        }}
                      >
                        <Zap size={11} color={pill} />
                        <Text style={{ color: pill, fontSize: 11, fontWeight: '700' }}>
                          CHALLENGE {idx + 1} OF {dailyChallenges.length}
                        </Text>
                      </View>

                      <Text
                        style={{ color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 22 }}
                        numberOfLines={2}
                      >
                        {challenge.title}
                      </Text>

                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>
                        {challenge.total_questions} questions · {challenge.quiz_duration}s each
                      </Text>

                      <View
                        style={{
                          backgroundColor: pill,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          marginTop: 14,
                          alignSelf: 'flex-start',
                        }}
                      >
                        <Text style={{ color: '#1F2937', fontWeight: '800', fontSize: 13 }}>
                          Start Challenge →
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 52, opacity: 0.9 }}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : topics.length > 0 ? (
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: '/quiz/[id]' as any, params: { id: String(topics[0].id) } })
              }
              activeOpacity={0.88}
              style={{
                marginHorizontal: 20,
                backgroundColor: '#0D4C3E',
                borderRadius: 24,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    alignSelf: 'flex-start',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                    marginBottom: 8,
                  }}
                >
                  <Zap size={12} color="#FCD34D" />
                  <Text style={{ color: '#FCD34D', fontSize: 11, fontWeight: '700' }}>
                    TODAY'S QUIZ
                  </Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 22 }}>
                  {topics[0].title}
                </Text>
                <Text style={{ color: '#A7C7C1', fontSize: 12, marginTop: 4 }}>
                  {topics[0].total_questions} questions · {topics[0].quiz_duration}s each
                </Text>
                <View
                  style={{
                    backgroundColor: '#fff',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    marginTop: 14,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ color: '#0D4C3E', fontWeight: '700', fontSize: 13 }}>
                    Start Now →
                  </Text>
                </View>
              </View>
              <Image
                source={{
                  uri: topics[0].thumbnail_url || CATEGORY_IMAGES[topics[0].category] || FALLBACK,
                }}
                style={{ width: 80, height: 80, borderRadius: 16 }}
                contentFit="cover"
              />
            </TouchableOpacity>
          ) : (
            <View
              style={{
                marginHorizontal: 20,
                backgroundColor: '#0D4C3E',
                borderRadius: 24,
                padding: 24,
                alignItems: 'center',
              }}
            >
              <Zap size={32} color="#A7C7C1" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginTop: 10 }}>
                No challenges yet
              </Text>
              <Text style={{ color: '#A7C7C1', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                Admin will add daily challenges soon!
              </Text>
            </View>
          )}

          {dailyChallenges.length > 1 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              {dailyChallenges.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === activeChallengeIdx ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === activeChallengeIdx ? '#0D4C3E' : '#D1D5DB',
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Progress Overview */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
              Learning Progress
            </Text>
            <TrendingUp size={18} color="#0D4C3E" />
          </View>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: '#F3F4F6',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 26, fontWeight: '800', color: '#3B82F6' }}>
                  {loading ? '—' : (stats?.videos_watched ?? 0)}
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>Videos Watched</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#F3F4F6' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 26, fontWeight: '800', color: '#10B981' }}>
                  {loading ? '—' : (stats?.topics_attempted ?? 0)}
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>MCQs Done</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#F3F4F6' }} />
              <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Flame size={14} color="#F59E0B" />
                  <Text style={{ fontSize: 26, fontWeight: '800', color: '#F59E0B' }}>
                    {loading ? '—' : (stats?.streak_days ?? 0)}
                  </Text>
                </View>
                <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>Day Streak</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Library Shortcuts */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
            Learning Library
          </Text>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: '/library' as any, params: { tab: 'infographics' } })
              }
              style={{
                flex: 1,
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 20,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#F3F4F6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor: '#EEF2FF',
                  padding: 12,
                  borderRadius: 14,
                  marginBottom: 10,
                }}
              >
                <BookOpen color="#6366F1" size={24} />
              </View>
              <Text style={{ fontWeight: '700', color: '#1F2937', fontSize: 13 }}>
                Infographics
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: '/library' as any, params: { tab: 'worksheets' } })
              }
              style={{
                flex: 1,
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 20,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#F3F4F6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor: '#F0FDF4',
                  padding: 12,
                  borderRadius: 14,
                  marginBottom: 10,
                }}
              >
                <FileText color="#22C55E" size={24} />
              </View>
              <Text style={{ fontWeight: '700', color: '#1F2937', fontSize: 13 }}>Worksheets</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Learning */}
        {recentTopics.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                Continue Learning
              </Text>
              <TouchableOpacity onPress={() => router.push('/topics' as any)}>
                <Text style={{ color: '#0D4C3E', fontWeight: '600', fontSize: 13 }}>View All</Text>
              </TouchableOpacity>
            </View>
            {recentTopics.map((t) => {
              const isLocked = t.is_premium && !userIsPremium;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => handleTopicPress(t)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    flexDirection: 'row',
                    padding: 12,
                    alignItems: 'center',
                    borderWidth: isLocked ? 1.5 : 1,
                    borderColor: isLocked ? '#FDE68A' : '#F3F4F6',
                    marginBottom: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: t.thumbnail_url || CATEGORY_IMAGES[t.category] || FALLBACK }}
                      style={{
                        width: 72,
                        height: 56,
                        borderRadius: 10,
                        opacity: isLocked ? 0.5 : 1,
                      }}
                      contentFit="cover"
                    />
                    {isLocked && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 10,
                          backgroundColor: 'rgba(0,0,0,0.35)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Lock size={16} color="#FCD34D" />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={{
                        fontWeight: '700',
                        color: isLocked ? '#6B7280' : '#1F2937',
                        fontSize: 14,
                      }}
                      numberOfLines={1}
                    >
                      {t.title}
                    </Text>
                    <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>
                      {t.category} · {t.total_questions}Q
                    </Text>
                    {isLocked && (
                      <Text
                        style={{ color: '#F59E0B', fontSize: 11, fontWeight: '700', marginTop: 3 }}
                      >
                        👑 Premium — Tap to Unlock
                      </Text>
                    )}
                  </View>
                  {isLocked ? (
                    <Crown color="#F59E0B" size={20} />
                  ) : (
                    <PlayCircle color="#0D4C3E" size={22} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
