import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { BookOpen, Video, Award, CheckCircle, TrendingUp, Users } from 'lucide-react-native';
import { useAuth } from '@/utils/auth/useAuth';

const LOGO_URL =
  'https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png';

// Slide 1 Graphic — Daily Learning
function Slide1Graphic() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background circles */}
      <View
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: 'rgba(13,76,62,0.06)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 190,
          height: 190,
          borderRadius: 95,
          backgroundColor: 'rgba(13,76,62,0.08)',
        }}
      />

      {/* Center icon card */}
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 30,
          backgroundColor: '#0D4C3E',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#0D4C3E',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        <BookOpen size={52} color="#fff" />
      </View>

      {/* Floating cards */}
      <View
        style={{
          position: 'absolute',
          top: '12%',
          left: '8%',
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <View style={{ backgroundColor: '#D1FAE5', borderRadius: 10, padding: 6 }}>
          <CheckCircle size={18} color="#0D4C3E" />
        </View>
        <View>
          <Text style={{ fontSize: 11, color: '#6B7280' }}>Today's Goal</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>3 / 5 Done</Text>
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: '14%',
          right: '6%',
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <View style={{ backgroundColor: '#FEF3C7', borderRadius: 10, padding: 6 }}>
          <TrendingUp size={18} color="#D97706" />
        </View>
        <View>
          <Text style={{ fontSize: 11, color: '#6B7280' }}>Streak</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>🔥 7 Days</Text>
        </View>
      </View>
    </View>
  );
}

// Slide 2 Graphic — Interactive Learning
function Slide2Graphic() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: 'rgba(99,102,241,0.06)',
        }}
      />

      {/* Video card */}
      <View
        style={{
          width: 220,
          height: 130,
          borderRadius: 22,
          backgroundColor: '#0D4C3E',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#0D4C3E',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Video size={26} color="#fff" />
        </View>
        <Text style={{ color: '#fff', fontSize: 12, marginTop: 8, fontWeight: '600' }}>
          Watch • Quiz • Master
        </Text>
      </View>

      {/* MCQ pill */}
      <View
        style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          backgroundColor: '#fff',
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#0D4C3E' }}>📝 MCQ Quiz</Text>
        <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>10 Questions</Text>
      </View>

      {/* Score card */}
      <View
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '5%',
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <View style={{ backgroundColor: '#D1FAE5', borderRadius: 10, padding: 6 }}>
          <Award size={18} color="#059669" />
        </View>
        <View>
          <Text style={{ fontSize: 11, color: '#6B7280' }}>Score</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>8 / 10 ⭐</Text>
        </View>
      </View>
    </View>
  );
}

// Slide 3 Graphic — Community & Rank
function Slide3Graphic() {
  const ranks = [
    { name: 'Aarav', score: '980', color: '#F59E0B', medal: '🥇' },
    { name: 'Priya', score: '940', color: '#9CA3AF', medal: '🥈' },
    { name: 'You', score: '910', color: '#CD7C2F', medal: '🥉', highlight: true },
  ];
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}
    >
      {/* Background circle */}
      <View
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: 'rgba(245,158,11,0.06)',
        }}
      />

      {/* Badge — sits above the card in normal flow */}
      <View
        style={{
          backgroundColor: '#0D4C3E',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
          🎓 Join 10,000+ Students
        </Text>
      </View>

      {/* Leaderboard card */}
      <View
        style={{
          width: 240,
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: 18,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 6,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Users size={18} color="#0D4C3E" />
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827' }}>Leaderboard</Text>
        </View>
        {ranks.map((r, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: r.highlight ? '#F0FDF4' : 'transparent',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 8,
              marginBottom: 4,
              borderWidth: r.highlight ? 1 : 0,
              borderColor: '#D1FAE5',
            }}
          >
            <Text style={{ fontSize: 16, width: 28 }}>{r.medal}</Text>
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: r.highlight ? '800' : '600',
                color: r.highlight ? '#0D4C3E' : '#374151',
              }}
            >
              {r.name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: r.highlight ? '#0D4C3E' : '#6B7280',
              }}
            >
              {r.score} pts
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const SLIDES = [
  {
    id: '1',
    title: 'Your Daily Learning,\nSynchronised',
    subtitle: 'Track your progress and stay organized with your daily learning goals.',
    Graphic: Slide1Graphic,
    bg: '#F0FDF8',
  },
  {
    id: '2',
    title: 'Interactive Learning\nExperience',
    subtitle: 'Engage with videos, quizzes and worksheets designed for your success.',
    Graphic: Slide2Graphic,
    bg: '#F5F3FF',
  },
  {
    id: '3',
    title: 'Ready to Start your\nJourney?',
    subtitle: 'Join thousands of students and start your daily dose of learning with Scoolam.',
    Graphic: Slide3Graphic,
    bg: '#FFFBEB',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const { width, height } = useWindowDimensions(); // ← responsive hook

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    setActiveIndex(index);
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    router.replace('/');
    // Small delay to ensure navigation completes, then open sign-in
    setTimeout(() => {
      signIn();
    }, 300);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Logo */}
      <View
        style={{
          alignItems: 'center',
          paddingTop: insets.top + 10,
          paddingBottom: 6,
          backgroundColor: '#fff',
        }}
      >
        <View
          style={{
            width: Math.min(74, width * 0.19),
            height: Math.min(74, width * 0.19),
            borderRadius: Math.min(37, width * 0.095),
            backgroundColor: '#0D4C3E',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#0D4C3E',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Image
            source={{ uri: LOGO_URL }}
            style={{ width: Math.min(52, width * 0.13), height: Math.min(52, width * 0.13) }}
            contentFit="contain"
          />
        </View>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flexGrow: 0 }}
      >
        {SLIDES.map((slide) => {
          const { Graphic } = slide;
          return (
            <View key={slide.id} style={{ width, height: height * 0.62 }}>
              {/* Graphic area */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: slide.bg,
                  marginHorizontal: width * 0.065,
                  borderRadius: 32,
                  overflow: 'hidden',
                }}
              >
                <Graphic />
              </View>

              {/* Text */}
              <View style={{ paddingHorizontal: width * 0.08, paddingTop: 20 }}>
                <Text
                  style={{
                    fontSize: Math.min(26, width * 0.065),
                    fontWeight: '800',
                    color: '#0D4C3E',
                    marginBottom: 10,
                    lineHeight: Math.min(34, width * 0.085),
                  }}
                >
                  {slide.title}
                </Text>
                <Text
                  style={{
                    fontSize: Math.min(15, width * 0.038),
                    color: '#6B7280',
                    lineHeight: 23,
                  }}
                >
                  {slide.subtitle}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={{
          paddingHorizontal: width * 0.08,
          backgroundColor: '#fff',
          paddingBottom: insets.bottom + 20,
          paddingTop: 16,
        }}
      >
        {/* Dots */}
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={{
                height: 8,
                width: activeIndex === index ? 28 : 8,
                borderRadius: 4,
                backgroundColor: activeIndex === index ? '#0D4C3E' : '#E5E7EB',
                marginRight: 6,
              }}
            />
          ))}
        </View>

        {/* Get Started — only on last slide */}
        {activeIndex === SLIDES.length - 1 ? (
          <TouchableOpacity
            onPress={handleGetStarted}
            style={{
              backgroundColor: '#0D4C3E',
              paddingVertical: Math.min(18, height * 0.025),
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          // Empty spacer so layout doesn't jump
          <View style={{ height: 56 }} />
        )}
      </View>
    </View>
  );
}
