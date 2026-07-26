import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Download, FileText, ImageIcon, RefreshCw, Settings, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import SettingsSheet from '@/components/SettingsSheet';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

interface Infographic {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  file_url: string;
  is_premium: boolean;
}
interface Worksheet {
  id: number;
  title: string;
  description: string;
  file_url: string;
  is_premium: boolean;
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'infographics' | 'worksheets'>(
    tab === 'worksheets' ? 'worksheets' : 'infographics'
  );

  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loadingInfographics, setLoadingInfographics] = useState(true);
  const [loadingWorksheets, setLoadingWorksheets] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(true);

  const fetchInfographics = useCallback(async () => {
    setLoadingInfographics(true);
    try {
      const res = await fetch('/api/infographics');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setInfographics(data.infographics ?? []);
    } catch {
      setInfographics([]);
    } finally {
      setLoadingInfographics(false);
    }
  }, []);

  const fetchWorksheets = useCallback(async () => {
    setLoadingWorksheets(true);
    try {
      const res = await fetch('/api/worksheets');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setWorksheets(data.worksheets ?? []);
    } catch {
      setWorksheets([]);
    } finally {
      setLoadingWorksheets(false);
    }
  }, []);

  useEffect(() => {
    void fetchInfographics();
  }, [fetchInfographics]);
  useEffect(() => {
    void fetchWorksheets();
  }, [fetchWorksheets]);

  // Replace handleDownload with in-app viewer
  const openFile = (url: string, title: string) => {
    if (!url) {
      Alert.alert('Not Available', 'This file has not been uploaded yet.');
      return;
    }
    const isImage = /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url);
    const finalUrl = isImage
      ? url
      : `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    setViewerTitle(title);
    setViewerUrl(finalUrl);
    setWebViewLoading(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB', paddingTop: insets.top }}>
      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* ── In-App File Viewer Modal ── */}
      <Modal
        visible={!!viewerUrl}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setViewerUrl(null)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: insets.top + 8,
              paddingBottom: 12,
              backgroundColor: '#0D4C3E',
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setViewerUrl(null)}
              style={{
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
            <Text
              style={{ flex: 1, color: '#fff', fontWeight: '700', fontSize: 15 }}
              numberOfLines={1}
            >
              {viewerTitle}
            </Text>
            {webViewLoading && <ActivityIndicator color="#fff" size="small" />}
          </View>
          {viewerUrl ? (
            <WebView
              source={{ uri: viewerUrl }}
              style={{ flex: 1 }}
              onLoadStart={() => setWebViewLoading(true)}
              onLoadEnd={() => setWebViewLoading(false)}
              onError={() => {
                setWebViewLoading(false);
                Alert.alert('Error', 'Could not load file. Please try again.');
              }}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              javaScriptEnabled
              domStorageEnabled
            />
          ) : null}
          {webViewLoading && (
            <View
              style={{
                position: 'absolute',
                top: insets.top + 60,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F9FAFB',
              }}
            >
              <ActivityIndicator color="#0D4C3E" size="large" />
              <Text style={{ color: '#6B7280', marginTop: 14, fontSize: 14 }}>Loading file…</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 4,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827' }}>Library</Text>
          <Text style={{ color: '#6B7280', marginTop: 4 }}>
            Download resources for your studies
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

      {/* Tab bar */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          marginTop: 16,
          marginBottom: 8,
          backgroundColor: '#F3F4F6',
          borderRadius: 14,
          padding: 4,
        }}
      >
        {(['infographics', 'worksheets'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(t)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: 'center',
              backgroundColor: activeTab === t ? '#fff' : 'transparent',
              shadowColor: activeTab === t ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: activeTab === t ? 2 : 0,
            }}
          >
            <Text
              style={{
                fontWeight: '700',
                fontSize: 14,
                color: activeTab === t ? '#0D4C3E' : '#6B7280',
              }}
            >
              {t === 'infographics' ? 'Infographics' : 'Worksheets'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Infographics */}
      {activeTab === 'infographics' &&
        (loadingInfographics ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color="#0D4C3E" size="large" />
            <Text style={{ color: '#6B7280', marginTop: 12 }}>Loading infographics…</Text>
          </View>
        ) : infographics.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
            <ImageIcon size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 16 }}>
              No infographics yet.{'\n'}Check back soon!
            </Text>
            <TouchableOpacity
              onPress={fetchInfographics}
              style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={16} color="#0D4C3E" />
              <Text style={{ color: '#0D4C3E', fontWeight: '600' }}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: insets.bottom + 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}
            >
              {infographics.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => openFile(item.file_url || item.thumbnail_url, item.title)}
                  activeOpacity={0.85}
                  style={{
                    width: (width - 55) / 2,
                    marginBottom: 16,
                    borderRadius: 16,
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  {item.thumbnail_url ? (
                    <Image
                      source={{ uri: item.thumbnail_url }}
                      style={{ width: '100%', height: 130 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: '100%',
                        height: 130,
                        backgroundColor: '#E8F5F0',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <ImageIcon size={36} color="#0D4C3E" />
                    </View>
                  )}
                  <View style={{ padding: 10 }}>
                    <Text
                      style={{ fontWeight: '700', color: '#111827', fontSize: 13 }}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    {item.description ? (
                      <Text
                        style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    ) : null}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 10,
                        backgroundColor: '#E8F5F0',
                        paddingHorizontal: 10,
                        paddingVertical: 7,
                        borderRadius: 10,
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Download size={14} color="#0D4C3E" />
                      <Text style={{ fontSize: 12, color: '#0D4C3E', fontWeight: '700' }}>
                        View
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ))}

      {/* Worksheets */}
      {activeTab === 'worksheets' &&
        (loadingWorksheets ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color="#0D4C3E" size="large" />
            <Text style={{ color: '#6B7280', marginTop: 12 }}>Loading worksheets…</Text>
          </View>
        ) : worksheets.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
            <FileText size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 16 }}>
              No worksheets yet.{'\n'}Check back soon!
            </Text>
            <TouchableOpacity
              onPress={fetchWorksheets}
              style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={16} color="#0D4C3E" />
              <Text style={{ color: '#0D4C3E', fontWeight: '600' }}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: insets.bottom + 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            {worksheets.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => openFile(item.file_url, item.title)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
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
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: '#F0FDF4',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <FileText color="#22C55E" size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#111827', fontSize: 15 }}>
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text
                      style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                  ) : null}
                  <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>
                    Tap to view in-app
                  </Text>
                </View>
                <View style={{ backgroundColor: '#E8F5F0', padding: 8, borderRadius: 10 }}>
                  <Download size={18} color="#0D4C3E" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ))}
    </View>
  );
}
