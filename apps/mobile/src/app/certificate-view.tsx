import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Share } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CertificateViewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    title: string;
    score: string;
    total: string;
    pct: string;
    medal: string;
    date: string;
    mode: string;
  }>();
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL ?? 'https://scoolam.cloud';

  const certUrl = `${BASE_URL}/certificate?name=${encodeURIComponent(params.name ?? '')}&title=${encodeURIComponent(params.title ?? '')}&score=${params.score ?? 0}&total=${params.total ?? 0}&pct=${params.pct ?? 0}&medal=${params.medal ?? 'participation'}&date=${encodeURIComponent(params.date ?? '')}&mode=${params.mode ?? 'topic'}`;

  const handleShare = async () => {
    const medalEmojis: Record<string, string> = {
      gold: '🥇',
      silver: '🥈',
      bronze: '🥉',
      participation: '⭐',
    };
    const emoji = medalEmojis[params.medal ?? 'participation'] ?? '⭐';
    try {
      await Share.share({
        title: 'My Scoolam Achievement 🎓',
        message:
          `${emoji} I just completed "${params.title}" on Scoolam!\n\n` +
          `🏅 ${params.pct}% Score  •  ${params.score}/${params.total}\n` +
          `📅 ${params.date}\n\n` +
          `View my certificate: ${certUrl}\n\nDownload Scoolam and test your knowledge!`,
      });
    } catch {
      /* dismissed */
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0D4C3E', paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#0D4C3E',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>Certificate</Text>
        <TouchableOpacity
          onPress={() => void handleShare()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Share2 size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 4:5 aspect ratio certificate container */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#0D4C3E',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <View
          style={{
            width: '100%',
            aspectRatio: 4 / 5,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {loading && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                backgroundColor: '#fff',
              }}
            >
              <ActivityIndicator color="#0D4C3E" size="large" />
              <Text style={{ color: '#6B7280', marginTop: 12, fontSize: 14 }}>
                Loading certificate…
              </Text>
            </View>
          )}
          <WebView
            source={{ uri: certUrl }}
            onLoadEnd={() => setLoading(false)}
            style={{ flex: 1 }}
            scrollEnabled={false}
          />
        </View>

        {/* Share button below certificate */}
        <TouchableOpacity
          onPress={() => void handleShare()}
          style={{
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#fff',
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 14,
          }}
        >
          <Share2 size={18} color="#0D4C3E" />
          <Text style={{ color: '#0D4C3E', fontWeight: '700', fontSize: 15 }}>
            Share Certificate
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
