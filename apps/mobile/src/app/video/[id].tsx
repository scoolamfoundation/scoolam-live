import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Info, CheckSquare, Maximize2 } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import SubscriptionPaywall from '@/components/SubscriptionPaywall';

interface Topic {
  id: number;
  title: string;
  category: string;
  description: string;
  video_url: string;
  video_orientation: string;
  key_takeaways: string[];
  total_questions: number;
  quiz_duration: number;
  is_premium: boolean;
}

function VideoPlayerContent({ topic }: { topic: Topic }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const watchRecorded = useRef(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const isVertical = topic.video_orientation === 'vertical';

  // Responsive video heights
  const horizontalVideoHeight = Math.round(width * (9 / 16)) + insets.top;
  const verticalVideoHeight = Math.round(width * 0.7) + insets.top;

  const player = useVideoPlayer(
    topic.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4',
    (p) => {
      p.loop = false;
    }
  );

  useEffect(() => {
    const playSub = player.addListener('playToEnd', async () => {
      if (watchRecorded.current) return;
      watchRecorded.current = true;
      try {
        await fetch('/api/video-watch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic_id: topic.id }),
        });
      } catch {
        /* ignore */
      }
    });
    return () => {
      playSub.remove();
    };
  }, [player, topic.id]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Fullscreen modal for vertical (9:16) videos */}
      {isVertical && (
        <Modal visible={fullscreenOpen} animationType="fade" statusBarTranslucent>
          <View
            style={{
              flex: 1,
              backgroundColor: '#000',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <VideoView
              player={player}
              style={{ width: '100%', aspectRatio: 9 / 16, maxHeight: '100%' }}
              allowsFullscreen
              allowsPictureInPicture
            />
            <TouchableOpacity
              onPress={() => {
                setFullscreenOpen(false);
                player.pause();
              }}
              style={{
                position: 'absolute',
                top: insets.top + 12,
                right: 16,
                backgroundColor: 'rgba(0,0,0,0.6)',
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Video area */}
      {isVertical ? (
        <View
          style={{
            height: verticalVideoHeight,
            backgroundColor: '#111',
            paddingTop: insets.top,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setFullscreenOpen(true);
              player.play();
            }}
            activeOpacity={0.85}
            style={{ alignItems: 'center' }}
          >
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.4)',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 30, marginLeft: 4 }}>▶</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 }}>
              <Maximize2 size={14} color="#A7C7C1" />
              <Text style={{ color: '#A7C7C1', fontSize: 14, fontWeight: '600' }}>
                Watch Fullscreen (9:16)
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: insets.top + 10,
              left: 15,
              backgroundColor: 'rgba(0,0,0,0.45)',
              padding: 8,
              borderRadius: 20,
            }}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{ height: horizontalVideoHeight, backgroundColor: '#000', paddingTop: insets.top }}
        >
          <VideoView
            player={player}
            style={{ width: '100%', height: '100%' }}
            allowsFullscreen
            allowsPictureInPicture
          />
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: insets.top + 10,
              left: 15,
              backgroundColor: 'rgba(0,0,0,0.45)',
              padding: 8,
              borderRadius: 20,
            }}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        <View
          style={{
            backgroundColor: '#E8F5F0',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 8,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#0D4C3E' }}>
            {topic.category?.toUpperCase()}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: '#111827',
            marginTop: 12,
            lineHeight: 30,
          }}
        >
          {topic.title}
        </Text>

        {topic.description ? (
          <Text style={{ color: '#6B7280', marginTop: 8, lineHeight: 22 }}>
            {topic.description}
          </Text>
        ) : null}

        {topic.key_takeaways?.length > 0 && (
          <View
            style={{
              marginTop: 28,
              padding: 20,
              backgroundColor: '#F0FDF4',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#DCFCE7',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Info size={20} color="#0D4C3E" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0D4C3E', marginLeft: 8 }}>
                Key Takeaways
              </Text>
            </View>
            {topic.key_takeaways.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', marginTop: i > 0 ? 8 : 0 }}>
                <Text style={{ color: '#0D4C3E', fontWeight: '700', marginRight: 8 }}>•</Text>
                <Text style={{ color: '#166534', lineHeight: 22, flex: 1 }}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {topic.total_questions > 0 && (
          <View
            style={{
              marginTop: 20,
              backgroundColor: '#F9FAFB',
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <CheckSquare size={18} color="#0D4C3E" />
            <Text style={{ color: '#374151', fontSize: 14, fontWeight: '600' }}>
              {topic.total_questions} questions · {topic.quiz_duration}s per question
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          padding: 20,
          paddingBottom: insets.bottom + 10,
          borderTopWidth: 1,
          borderColor: '#F3F4F6',
        }}
      >
        <TouchableOpacity
          onPress={() => router.push(`/quiz/${topic.id}` as any)}
          style={{
            backgroundColor: '#0D4C3E',
            paddingVertical: 18,
            borderRadius: 15,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckSquare color="#fff" size={20} />
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            Test Your Knowledge
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [userIsPremium, setUserIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [topicRes, premiumRes] = await Promise.all([
          fetch(`/api/topics/${id}`),
          fetch('/api/user-premium'),
        ]);

        if (!topicRes.ok) throw new Error('Not found');
        const topicData = await topicRes.json();
        setTopic(topicData.topic);

        if (premiumRes.ok) {
          const premiumData = await premiumRes.json();
          setUserIsPremium(premiumData.is_premium ?? false);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
      >
        <ActivityIndicator color="#0D4C3E" size="large" />
      </View>
    );
  }

  if (error || !topic) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: 30,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Topic not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: '#0D4C3E',
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── PAYWALL: premium topic + non-premium user ──
  if (topic.is_premium && !userIsPremium) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D4C3E' }}>
        <SubscriptionPaywall
          visible={true}
          onClose={() => router.back()}
          topicTitle={topic.title}
        />
      </View>
    );
  }

  return <VideoPlayerContent topic={topic} />;
}
