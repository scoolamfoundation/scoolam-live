import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  BookOpen,
  Clock,
  Zap,
  ChevronLeft,
  CheckCheck,
  Trash2,
  Ticket,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppNotification {
  id: string;
  type: 'new_topic' | 'ticket_updated' | 'pending_quiz' | 'daily_challenge';
  title: string;
  body: string;
  created_at: string;
  data?: Record<string, unknown>;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  new_topic: { icon: BookOpen, color: '#3B82F6', bg: '#EFF6FF' },
  ticket_updated: { icon: Ticket, color: '#10B981', bg: '#ECFDF5' },
  pending_quiz: { icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
  daily_challenge: { icon: Zap, color: '#8B5CF6', bg: '#EDE9FE' },
};

const READ_KEY = 'scoolam_read_notifications';
const CLEARED_KEY = 'scoolam_cleared_notifications';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [clearedIds, setClearedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStoredIds = async () => {
    try {
      const [rawRead, rawCleared] = await Promise.all([
        AsyncStorage.getItem(READ_KEY),
        AsyncStorage.getItem(CLEARED_KEY),
      ]);
      if (rawRead) setReadIds(new Set(JSON.parse(rawRead) as string[]));
      if (rawCleared) setClearedIds(new Set(JSON.parse(rawCleared) as string[]));
    } catch {
      // ignore
    }
  };

  const markRead = async (ids: string[]) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      AsyncStorage.setItem(READ_KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/mobile-notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStoredIds();
    void fetchNotifications();
  }, [fetchNotifications]);

  // Auto mark all as read when page opens
  useEffect(() => {
    if (notifications.length > 0) {
      void markRead(notifications.map((n) => n.id));
    }
  }, [notifications]);

  const handleNotificationPress = (n: AppNotification) => {
    void markRead([n.id]);
    const { data } = n;
    if (!data) return;
    if (n.type === 'new_topic' && data.topic_id) {
      router.push({ pathname: '/video/[id]' as never, params: { id: String(data.topic_id) } });
    } else if (n.type === 'pending_quiz' && data.topic_id) {
      router.push({ pathname: '/quiz/[id]' as never, params: { id: String(data.topic_id) } });
    } else if (n.type === 'daily_challenge' && data.challenge_id) {
      router.push({
        pathname: '/daily-quiz/[id]' as never,
        params: { id: String(data.challenge_id) },
      });
    } else if (n.type === 'ticket_updated') {
      router.push('/help' as never);
    }
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    void markRead(allIds);
  };

  const handleClearAll = () => {
    Alert.alert('Clear Notifications', 'Remove all notifications from this list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => {
          const allIds = notifications.map((n) => n.id);
          setClearedIds((prev) => {
            const next = new Set(prev);
            allIds.forEach((id) => next.add(id));
            AsyncStorage.setItem(CLEARED_KEY, JSON.stringify([...next])).catch(() => {});
            return next;
          });
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    void fetchNotifications();
  };

  const visibleNotifications = notifications.filter((n) => !clearedIds.has(n.id));
  const unreadCount = visibleNotifications.filter((n) => !readIds.has(n.id)).length;

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
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>Notifications</Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 1 }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </Text>
        </View>
        <Bell size={22} color="#0D4C3E" />
      </View>

      {/* Action Bar */}
      {visibleNotifications.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderColor: '#F3F4F6',
          }}
        >
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 10,
              backgroundColor: '#E8F5F0',
            }}
          >
            <CheckCheck size={14} color="#0D4C3E" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0D4C3E' }}>Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearAll}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 10,
              backgroundColor: '#FEF2F2',
            }}
          >
            <Trash2 size={14} color="#EF4444" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#EF4444' }}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0D4C3E" size="large" />
          <Text style={{ color: '#6B7280', marginTop: 12 }}>Loading notifications…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D4C3E" />
          }
        >
          {visibleNotifications.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#E8F5F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <Bell size={36} color="#0D4C3E" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
                All caught up!
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                You have no notifications.{'\n'}Check back after learning more topics!
              </Text>
            </View>
          ) : (
            visibleNotifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type] ?? {
                icon: Bell,
                color: '#6B7280',
                bg: '#F3F4F6',
              };
              const Icon = cfg.icon;
              const isUnread = !readIds.has(n.id);

              return (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => handleNotificationPress(n)}
                  activeOpacity={0.75}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    backgroundColor: '#fff',
                    borderRadius: 18,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: isUnread ? 1.5 : 1,
                    borderColor: isUnread ? `${cfg.color}40` : '#F3F4F6',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor: cfg.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} color={cfg.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 3,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827', flex: 1 }}>
                        {n.title}
                      </Text>
                      {isUnread && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: cfg.color,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </View>
                    <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 19 }}>{n.body}</Text>
                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>
                      {timeAgo(n.created_at)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}
