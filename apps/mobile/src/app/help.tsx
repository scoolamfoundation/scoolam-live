import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Send,
  CheckCircle2,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';

interface HelpTopic {
  id: number;
  title: string;
  content: string;
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [topics, setTopics] = useState<HelpTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Report form
  const [showReport, setShowReport] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadTopics = useCallback(async () => {
    try {
      const res = await fetch('/api/help-topics');
      if (res.ok) {
        const d = (await res.json()) as { topics: HelpTopic[] };
        setTopics(d.topics ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  const submitReport = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Missing Info', 'Please fill in both subject and description.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), description: description.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
        setSubject('');
        setDescription('');
        setTimeout(() => {
          setSubmitted(false);
          setShowReport(false);
        }, 3000);
      } else {
        const d = (await res.json()) as { error?: string };
        Alert.alert('Error', d.error ?? 'Failed to submit. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Could not submit report. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>Help & Support</Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 1 }}>
            FAQs and contact support
          </Text>
        </View>
      </View>

      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* FAQ Section */}
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 14 }}>
            Frequently Asked Questions
          </Text>

          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <ActivityIndicator color="#0D4C3E" size="large" />
              <Text style={{ color: '#9CA3AF', marginTop: 12 }}>Loading help topics…</Text>
            </View>
          ) : topics.length === 0 ? (
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 18,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#F3F4F6',
              }}
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📚</Text>
              <Text style={{ fontWeight: '700', color: '#374151', fontSize: 15 }}>
                No help topics yet
              </Text>
              <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 4, fontSize: 13 }}>
                Our team is preparing help content. In the meantime, use the report form below.
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 18,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#F3F4F6',
              }}
            >
              {topics.map((topic, i) => (
                <View key={topic.id}>
                  {i > 0 && <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />}
                  <TouchableOpacity
                    onPress={() => setExpanded(expanded === topic.id ? null : topic.id)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      gap: 12,
                    }}
                  >
                    <Text style={{ flex: 1, fontWeight: '700', color: '#111827', fontSize: 14 }}>
                      {topic.title}
                    </Text>
                    {expanded === topic.id ? (
                      <ChevronUp size={18} color="#0D4C3E" />
                    ) : (
                      <ChevronDown size={18} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                  {expanded === topic.id && topic.content && (
                    <View
                      style={{
                        paddingHorizontal: 16,
                        paddingBottom: 16,
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <Text style={{ color: '#4B5563', fontSize: 14, lineHeight: 22 }}>
                        {topic.content}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '600' }}>
              CONTACT SUPPORT
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          </View>

          {/* Report Issue Button */}
          {!showReport ? (
            <TouchableOpacity
              onPress={() => setShowReport(true)}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#0D4C3E',
                borderRadius: 18,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                  Report an Issue
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 }}>
                  Tell us what went wrong and we&apos;ll fix it
                </Text>
              </View>
            </TouchableOpacity>
          ) : submitted ? (
            <View
              style={{
                backgroundColor: '#ECFDF5',
                borderRadius: 18,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#A7F3D0',
              }}
            >
              <CheckCircle2 size={40} color="#059669" />
              <Text style={{ fontWeight: '800', color: '#065F46', fontSize: 16, marginTop: 12 }}>
                Report Submitted!
              </Text>
              <Text style={{ color: '#047857', textAlign: 'center', marginTop: 6, fontSize: 13 }}>
                Our team will review your issue and get back to you soon.
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 18,
                padding: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827' }}>
                  Report an Issue
                </Text>
                <TouchableOpacity onPress={() => setShowReport(false)}>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
                SUBJECT
              </Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g. Video not playing"
                placeholderTextColor="#9CA3AF"
                style={{
                  borderWidth: 1.5,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: '#111827',
                  backgroundColor: '#F9FAFB',
                  marginBottom: 14,
                }}
              />

              <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
                DESCRIPTION
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the issue in detail…"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{
                  borderWidth: 1.5,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: '#111827',
                  backgroundColor: '#F9FAFB',
                  minHeight: 100,
                  marginBottom: 16,
                }}
              />

              <TouchableOpacity
                onPress={() => void submitReport()}
                disabled={submitting}
                activeOpacity={0.85}
                style={{
                  backgroundColor: submitting ? '#6B9E90' : '#0D4C3E',
                  borderRadius: 14,
                  paddingVertical: 15,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Send size={16} color="#fff" />
                )}
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                  {submitting ? 'Submitting…' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    </View>
  );
}
