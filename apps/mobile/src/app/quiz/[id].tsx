import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, XCircle, Clock } from 'lucide-react-native';
import ChallengeComplete from '@/components/ChallengeComplete';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  reason: string;
  enabled: boolean;
}

interface TopicMeta {
  title: string;
  quiz_duration: number;
  total_questions: number;
  shuffle_questions: boolean;
}

type Phase = 'loading' | 'error' | 'answering' | 'reviewing' | 'finished';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>('loading');
  const [meta, setMeta] = useState<TopicMeta | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<boolean[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerBarAnim = useRef(new Animated.Value(1)).current;
  const timerBarAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const submittedRef = useRef(false);

  // Record quiz attempt when quiz finishes
  useEffect(() => {
    if (phase !== 'finished' || submittedRef.current) return;
    submittedRef.current = true;
    (async () => {
      try {
        await fetch('/api/quiz-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic_id: Number(id),
            score,
            total: questions.length,
          }),
        });
      } catch {
        // ignore silently
      }
    })();
  }, [phase, id, score, questions.length]);

  // Load quiz data
  const loadQuiz = useCallback(async () => {
    setPhase('loading');
    setScore(0);
    setCurrentIdx(0);
    setSelected(null);
    setTimedOut(false);
    setWrongAnswers([]);
    submittedRef.current = false; // reset for retake

    try {
      const res = await fetch(`/api/topics/${id}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();

      const t: TopicMeta = {
        title: data.topic.title,
        quiz_duration: data.topic.quiz_duration ?? 30,
        total_questions: data.topic.total_questions ?? 5,
        shuffle_questions: data.topic.shuffle_questions ?? true,
      };
      setMeta(t);

      let qs: Question[] = (data.questions ?? []).filter((q: Question) => q.enabled);
      if (t.shuffle_questions) qs = shuffle(qs);
      qs = qs.slice(0, t.total_questions);

      if (qs.length === 0) {
        setPhase('error');
        return;
      }

      setQuestions(qs);
      setWrongAnswers(new Array(qs.length).fill(false));
      setTimeLeft(t.quiz_duration);
      setPhase('answering');
    } catch {
      setPhase('error');
    }
  }, [id]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  // Timer logic
  useEffect(() => {
    if (phase !== 'answering' || !meta) return;

    // Animate timer bar
    timerBarAnim.setValue(1);
    timerBarAnimRef.current = Animated.timing(timerBarAnim, {
      toValue: 0,
      duration: meta.quiz_duration * 1000,
      useNativeDriver: false,
    });
    timerBarAnimRef.current.start();

    setTimeLeft(meta.quiz_duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimedOut(true);
          setPhase('reviewing');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerBarAnimRef.current?.stop();
    };
  }, [phase, currentIdx, meta, timerBarAnim]);

  const handleSelect = (optIdx: number) => {
    if (phase !== 'answering') return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerBarAnimRef.current?.stop();
    setSelected(optIdx);
    const isCorrect = optIdx === questions[currentIdx].correct_index;
    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setWrongAnswers((prev) => {
        const next = [...prev];
        next[currentIdx] = true;
        return next;
      });
    }
    setTimedOut(false);
    setPhase('reviewing');
  };

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      setPhase('finished');
    } else {
      setCurrentIdx(nextIdx);
      setSelected(null);
      setTimedOut(false);
      setPhase('answering');
    }
  };

  // ── LOADING ──
  if (phase === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#F9FAFB',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#6B7280', fontSize: 16 }}>Loading quiz…</Text>
      </View>
    );
  }

  // ── ERROR ──
  if (phase === 'error') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#F9FAFB',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 30,
        }}
      >
        <XCircle size={56} color="#EF4444" />
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#111827',
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          No questions available
        </Text>
        <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
          This quiz doesn't have any enabled questions yet.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 30,
            backgroundColor: '#0D4C3E',
            paddingVertical: 14,
            paddingHorizontal: 30,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── FINISHED ──
  if (phase === 'finished') {
    const handleRetakeWrong = () => {
      const wrongQs = questions.filter((_, i) => wrongAnswers[i]);
      if (wrongQs.length === 0) return;
      setQuestions(wrongQs);
      setWrongAnswers(new Array(wrongQs.length).fill(false));
      setScore(0);
      setCurrentIdx(0);
      setSelected(null);
      setTimedOut(false);
      submittedRef.current = false;
      if (meta) setTimeLeft(meta.quiz_duration);
      setPhase('answering');
    };

    return (
      <ChallengeComplete
        score={score}
        total={questions.length}
        title={meta?.title ?? 'Topic Quiz'}
        wrongAnswers={wrongAnswers}
        onRetake={handleRetakeWrong}
        onHome={() => router.replace('/(tabs)' as any)}
        mode="topic"
      />
    );
  }

  // ── ANSWERING / REVIEWING ──
  const q = questions[currentIdx];
  const isReviewing = phase === 'reviewing';

  const getOptionStyle = (oi: number) => {
    if (!isReviewing) {
      return {
        bg: '#fff',
        border: selected === oi ? '#0D4C3E' : '#E5E7EB',
        text: selected === oi ? '#0D4C3E' : '#374151',
      };
    }
    if (oi === q.correct_index) return { bg: '#F0FDF4', border: '#10B981', text: '#065F46' };
    if (oi === selected && oi !== q.correct_index)
      return { bg: '#FEF2F2', border: '#EF4444', text: '#B91C1C' };
    return { bg: '#fff', border: '#E5E7EB', text: '#9CA3AF' };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#fff',
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderColor: '#F3F4F6',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={{ fontWeight: '700', color: '#111827', fontSize: 15 }}>
          {currentIdx + 1} / {questions.length}
        </Text>
        {/* Timer */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: timeLeft <= 5 ? '#FEF2F2' : '#F3F4F6',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
          }}
        >
          <Clock size={14} color={timeLeft <= 5 ? '#EF4444' : '#6B7280'} />
          <Text
            style={{
              fontWeight: '700',
              color: timeLeft <= 5 ? '#EF4444' : '#374151',
              fontSize: 14,
            }}
          >
            {timeLeft}s
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ height: 3, backgroundColor: '#E5E7EB' }}>
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: '#0D4C3E',
            width: timerBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }}
        />
      </View>

      {/* Question progress dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10 }}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === currentIdx ? 20 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                i < currentIdx ? '#0D4C3E' : i === currentIdx ? '#0D4C3E' : '#E5E7EB',
            }}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {/* Timed-out banner */}
        {timedOut && (
          <View
            style={{
              backgroundColor: '#FEF3C7',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Clock size={18} color="#D97706" />
            <Text style={{ color: '#92400E', fontWeight: '600', fontSize: 14 }}>
              Time's up! The correct answer is shown below.
            </Text>
          </View>
        )}

        <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 13, letterSpacing: 0.5 }}>
          QUESTION {currentIdx + 1}
        </Text>
        <Text
          style={{
            fontSize: 21,
            fontWeight: '800',
            color: '#111827',
            marginTop: 10,
            lineHeight: 30,
          }}
        >
          {q.question}
        </Text>

        {/* Options */}
        <View style={{ marginTop: 24, gap: 12 }}>
          {q.options.map((opt, oi) => {
            const s = getOptionStyle(oi);
            return (
              <TouchableOpacity
                key={oi}
                onPress={() => handleSelect(oi)}
                disabled={isReviewing}
                activeOpacity={0.8}
                style={{
                  backgroundColor: s.bg,
                  borderWidth: 2,
                  borderColor: s.border,
                  borderRadius: 16,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: s.border,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor:
                      isReviewing && oi === q.correct_index
                        ? '#10B981'
                        : isReviewing && oi === selected && oi !== q.correct_index
                          ? '#EF4444'
                          : 'transparent',
                  }}
                >
                  {isReviewing && oi === q.correct_index && <CheckCircle2 size={16} color="#fff" />}
                  {isReviewing && oi === selected && oi !== q.correct_index && (
                    <XCircle size={16} color="#fff" />
                  )}
                  {!isReviewing && (
                    <Text style={{ fontSize: 12, fontWeight: '700', color: s.border }}>
                      {String.fromCharCode(65 + oi)}
                    </Text>
                  )}
                </View>
                <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: s.text }}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {isReviewing && q.reason?.trim() && (
          <View
            style={{
              marginTop: 24,
              backgroundColor: '#EFF6FF',
              borderRadius: 16,
              padding: 18,
              borderLeftWidth: 4,
              borderLeftColor: '#3B82F6',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E40AF', marginBottom: 6 }}>
              💡 Explanation
            </Text>
            <Text style={{ color: '#1E3A8A', lineHeight: 22, fontSize: 14 }}>{q.reason}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom button */}
      {isReviewing && (
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
            onPress={handleNext}
            style={{
              backgroundColor: '#0D4C3E',
              paddingVertical: 18,
              borderRadius: 15,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
              {currentIdx + 1 >= questions.length ? 'See Results' : 'Next Question →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
