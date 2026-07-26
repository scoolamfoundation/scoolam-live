import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RotateCcw, Home, Share2, Download, Star } from 'lucide-react-native';
import { useAuth } from '@/utils/auth/useAuth';
import { useRouter } from 'expo-router';

export type MedalTier = 'gold' | 'silver' | 'bronze' | 'participation';

interface ChallengeCompleteProps {
  score: number;
  total: number;
  title: string;
  wrongAnswers: boolean[];
  onRetake: () => void;
  onHome: () => void;
  mode?: 'daily' | 'topic';
}

function getMedal(pct: number): MedalTier {
  if (pct >= 80) return 'gold';
  if (pct >= 60) return 'silver';
  if (pct >= 40) return 'bronze';
  return 'participation';
}

function getStars(pct: number): number {
  if (pct === 100) return 5;
  if (pct >= 80) return 4;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  return 1;
}

const MEDAL_CONFIG = {
  gold: {
    emoji: '🥇',
    label: 'Gold',
    bg1: '#B45309',
    light: '#FEF3C7',
    ribbon: '#F59E0B',
    ribbonDark: '#92400E',
    congratsMsg: 'Outstanding Performance!',
    subMsg: 'You have mastered this challenge with excellence.',
  },
  silver: {
    emoji: '🥈',
    label: 'Silver',
    bg1: '#374151',
    light: '#F3F4F6',
    ribbon: '#9CA3AF',
    ribbonDark: '#374151',
    congratsMsg: 'Great Achievement!',
    subMsg: 'A solid performance — keep pushing for gold!',
  },
  bronze: {
    emoji: '🥉',
    label: 'Bronze',
    bg1: '#78350F',
    light: '#FEF3C7',
    ribbon: '#C2713F',
    ribbonDark: '#78350F',
    congratsMsg: 'Well Done!',
    subMsg: 'You completed the challenge. Practice makes perfect!',
  },
  participation: {
    emoji: '⭐',
    label: 'Participation',
    bg1: '#0D4C3E',
    light: '#ECFDF5',
    ribbon: '#10B981',
    ribbonDark: '#065F46',
    congratsMsg: 'Challenge Completed!',
    subMsg: 'Every attempt builds your knowledge. Keep going!',
  },
} as const;

const SPARKLES = [
  { top: 18, left: 28, size: 12 },
  { top: 42, left: 62, size: 18 },
  { top: 62, left: 92, size: 10 },
  { top: 26, left: 222, size: 16 },
  { top: 55, left: 270, size: 14 },
  { top: 70, left: 312, size: 10 },
];

export default function ChallengeComplete({
  score,
  total,
  title,
  wrongAnswers,
  onRetake,
  onHome,
  mode = 'daily',
}: ChallengeCompleteProps) {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const router = useRouter();

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const medal = getMedal(pct);
  const stars = getStars(pct);
  const config = MEDAL_CONFIG[medal];
  const hasWrong = wrongAnswers.some(Boolean);

  // Stable animated values via refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const starAnimsRef = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  useEffect(() => {
    const animValues = starAnimsRef.current;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
      Animated.stagger(
        80,
        animValues.map((a) =>
          Animated.spring(a, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true })
        )
      ).start();
    });
  }, [fadeAnim, scaleAnim, slideAnim]);

  const userName = auth?.user?.name || 'Learner';
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = async () => {
    const baseUrl = process.env.EXPO_PUBLIC_BASE_URL ?? 'https://www.scoolam.com';
    const certUrl = `${baseUrl}/certificate?name=${encodeURIComponent(userName)}&title=${encodeURIComponent(title)}&score=${score}&total=${total}&pct=${pct}&medal=${medal}&date=${encodeURIComponent(dateStr)}&mode=${mode}`;
    try {
      await Share.share({
        title: 'My Scoolam Achievement 🎓',
        message:
          `${config.emoji} I just ${pct === 100 ? 'aced' : 'completed'} "${title}" on Scoolam!\n\n` +
          `🏅 ${config.label} Medal  •  ${score}/${total} (${pct}%)\n` +
          `📅 ${dateStr}\n\n` +
          `View my certificate: ${certUrl}\n\nDownload Scoolam and test your knowledge!`,
      });
    } catch {
      /* dismissed */
    }
  };

  const handleDownload = () => {
    router.push({
      pathname: '/certificate-view' as any,
      params: {
        name: userName,
        title,
        score: String(score),
        total: String(total),
        pct: String(pct),
        medal,
        date: dateStr,
        mode,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: config.bg1 }}>
      {/* ── HERO TOP ── */}
      <View
        style={{
          backgroundColor: config.bg1,
          paddingTop: insets.top + 16,
          paddingBottom: 64,
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative sparkles */}
        {SPARKLES.map((sp, i) => (
          <Text
            key={i}
            style={{
              position: 'absolute',
              color: 'rgba(255,255,255,0.22)',
              fontSize: sp.size,
              top: sp.top,
              left: sp.left,
            }}
          >
            ✦
          </Text>
        ))}

        {/* Mode badge */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 5,
            marginBottom: 18,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
            {mode === 'daily' ? '⚡ DAILY CHALLENGE' : '📚 TOPIC QUIZ'}
          </Text>
        </View>

        {/* Medal circle */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'rgba(255,255,255,0.18)',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: 'rgba(255,255,255,0.35)',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 62 }}>{config.emoji}</Text>
        </Animated.View>

        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 }}>
          Challenge Complete!
        </Text>
        <Text
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 13,
            marginTop: 4,
            textAlign: 'center',
            paddingHorizontal: 30,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Stars row */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 14 }}>
          {starAnimsRef.current.map((anim, i) => (
            <Animated.View key={i} style={{ transform: [{ scale: anim }] }}>
              <Star
                size={28}
                color={i < stars ? '#FDE68A' : 'rgba(255,255,255,0.25)'}
                fill={i < stars ? '#FDE68A' : 'transparent'}
              />
            </Animated.View>
          ))}
        </View>

        <Text
          style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8, fontWeight: '600' }}
        >
          {stars}/5 stars • {config.label} Medal
        </Text>
      </View>

      {/* ── CERTIFICATE CARD ── */}
      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }],
          flex: 1,
          backgroundColor: '#F2F4F7',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          marginTop: -32,
          overflow: 'hidden',
        }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Certificate */}
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 24,
              borderRadius: 24,
              backgroundColor: '#fff',
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            {/* Ribbon */}
            <View
              style={{ backgroundColor: config.ribbon, paddingVertical: 13, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 2.5 }}>
                ✦ CERTIFICATE OF ACHIEVEMENT ✦
              </Text>
            </View>

            {/* Certificate body */}
            <View style={{ padding: 28, alignItems: 'center' }}>
              <Text
                style={{ fontSize: 22, fontWeight: '900', color: '#0D4C3E', letterSpacing: -1 }}
              >
                Scoolam
              </Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: 3, marginTop: 1 }}>
                LEARNING PLATFORM
              </Text>

              <View
                style={{
                  width: 56,
                  height: 2,
                  backgroundColor: config.ribbon,
                  borderRadius: 2,
                  marginVertical: 18,
                }}
              />

              <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '500' }}>
                This is to certify that
              </Text>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: '900',
                  color: '#111827',
                  marginTop: 6,
                  letterSpacing: -0.5,
                  textAlign: 'center',
                }}
              >
                {userName}
              </Text>

              <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 16, textAlign: 'center' }}>
                has successfully completed
              </Text>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '800',
                  color: '#0D4C3E',
                  marginTop: 6,
                  textAlign: 'center',
                  lineHeight: 25,
                  paddingHorizontal: 10,
                }}
              >
                {title}
              </Text>

              {/* Score stats */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 22,
                  backgroundColor: config.light,
                  borderRadius: 16,
                  padding: 16,
                  width: '100%',
                  justifyContent: 'space-around',
                }}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 26, fontWeight: '900', color: config.ribbonDark }}>
                    {score}/{total}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#6B7280',
                      fontWeight: '700',
                      marginTop: 2,
                      letterSpacing: 1,
                    }}
                  >
                    SCORE
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 26, fontWeight: '900', color: config.ribbonDark }}>
                    {pct}%
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#6B7280',
                      fontWeight: '700',
                      marginTop: 2,
                      letterSpacing: 1,
                    }}
                  >
                    ACCURACY
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 26 }}>{config.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#6B7280',
                      fontWeight: '700',
                      marginTop: 2,
                      letterSpacing: 1,
                    }}
                  >
                    {config.label.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Mini stars */}
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 16 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    color={i < stars ? config.ribbon : '#E5E7EB'}
                    fill={i < stars ? config.ribbon : 'transparent'}
                  />
                ))}
              </View>

              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '800',
                  color: config.ribbonDark,
                  marginTop: 14,
                  textAlign: 'center',
                }}
              >
                {config.congratsMsg}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                  marginTop: 4,
                  textAlign: 'center',
                  lineHeight: 18,
                  paddingHorizontal: 10,
                }}
              >
                {config.subMsg}
              </Text>

              {/* Footer */}
              <View
                style={{
                  width: '100%',
                  borderTopWidth: 1,
                  borderColor: '#F3F4F6',
                  marginTop: 22,
                  paddingTop: 14,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 11, color: '#9CA3AF' }}>📅 {dateStr}</Text>
                <Text style={{ fontSize: 11, color: '#9CA3AF' }}>scoolam.com</Text>
              </View>
            </View>

            {/* Bottom accent */}
            <View style={{ height: 6, backgroundColor: config.ribbon }} />
          </View>

          {/* ── ACTION BUTTONS ── */}
          <View style={{ marginHorizontal: 20, marginTop: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => void handleShare()}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: config.ribbon,
                  paddingVertical: 16,
                  borderRadius: 16,
                }}
              >
                <Share2 size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDownload}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: '#fff',
                  paddingVertical: 16,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: config.ribbon,
                }}
              >
                <Download size={18} color={config.ribbon} />
                <Text style={{ color: config.ribbon, fontWeight: '700', fontSize: 15 }}>
                  Certificate
                </Text>
              </TouchableOpacity>
            </View>

            {hasWrong && (
              <TouchableOpacity
                onPress={onRetake}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: '#0D4C3E',
                  paddingVertical: 16,
                  borderRadius: 16,
                }}
              >
                <RotateCcw size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  Retake Wrong Answers ({wrongAnswers.filter(Boolean).length})
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onHome}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#E5E7EB',
                paddingVertical: 16,
                borderRadius: 16,
              }}
            >
              <Home size={18} color="#374151" />
              <Text style={{ color: '#374151', fontWeight: '700', fontSize: 15 }}>
                Back to Home
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
