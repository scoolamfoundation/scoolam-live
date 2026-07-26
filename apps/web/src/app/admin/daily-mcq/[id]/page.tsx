'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronDown, ChevronUp, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LocalQuestion {
  _key: string;
  id?: number;
  question: string;
  options: [string, string, string, string];
  correct_index: number;
  reason: string;
  enabled: boolean;
  _deleted?: boolean;
  _expanded: boolean;
}

let keyCounter = 0;
const newKey = () => `q-${++keyCounter}`;

const emptyQuestion = (): LocalQuestion => ({
  _key: newKey(),
  question: '',
  options: ['', '', '', ''],
  correct_index: 0,
  reason: '',
  enabled: true,
  _expanded: true,
});

export default function DailyMCQEditorPage() {
  const params = useParams();
  const challengeId = params.id as string;
  const isNew = challengeId === 'new';
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quizDuration, setQuizDuration] = useState(30);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<LocalQuestion[]>([emptyQuestion()]);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/daily-challenge/${challengeId}`);
      if (!res.ok) {
        toast.error('Challenge not found');
        router.push('/admin/daily-mcq');
        return;
      }
      const data = await res.json();
      const c = data.challenge;
      setTitle(c.title ?? '');
      setDescription(c.description ?? '');
      setQuizDuration(c.quiz_duration ?? 30);
      setTotalQuestions(c.total_questions ?? 5);
      setShuffleQuestions(c.shuffle_questions ?? true);
      setIsActive(c.is_active ?? true);
      setQuestions(
        (data.questions ?? []).map((q: Record<string, unknown>) => ({
          _key: newKey(),
          id: q.id as number,
          question: q.question as string,
          options: (q.options ?? ['', '', '', '']) as [string, string, string, string],
          correct_index: q.correct_index as number,
          reason: (q.reason ?? '') as string,
          enabled: (q.enabled ?? true) as boolean,
          _expanded: false,
        }))
      );
      setLoading(false);
    })();
  }, [challengeId, isNew, router]);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  const removeQuestion = (key: string) =>
    setQuestions((prev) =>
      prev.map((q) => (q._key === key ? { ...q, _deleted: true, _expanded: false } : q))
    );
  const toggleExpand = (key: string) =>
    setQuestions((prev) =>
      prev.map((q) => (q._key === key ? { ...q, _expanded: !q._expanded } : q))
    );
  const updateQ = (key: string, patch: Partial<LocalQuestion>) =>
    setQuestions((prev) => prev.map((q) => (q._key === key ? { ...q, ...patch } : q)));
  const updateOption = (key: string, optIdx: number, val: string) =>
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._key !== key) return q;
        const opts = [...q.options] as [string, string, string, string];
        opts[optIdx] = val;
        return { ...q, options: opts };
      })
    );

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        quiz_duration: quizDuration,
        total_questions: totalQuestions,
        shuffle_questions: shuffleQuestions,
        is_active: isActive,
      };

      let savedId: number;

      if (isNew) {
        const res = await fetch('/api/daily-challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create');
        const data = await res.json();
        savedId = data.challenge.id;
      } else {
        const res = await fetch(`/api/daily-challenge/${challengeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update');
        savedId = parseInt(challengeId);
      }

      // Save questions
      for (const q of questions) {
        if (q._deleted && q.id) {
          await fetch(`/api/daily-challenge-questions/${q.id}`, { method: 'DELETE' });
        } else if (!q._deleted && q.id) {
          await fetch(`/api/daily-challenge-questions/${q.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: q.question,
              options: q.options,
              correct_index: q.correct_index,
              reason: q.reason,
              enabled: q.enabled,
            }),
          });
        } else if (!q._deleted && !q.id && q.question.trim()) {
          await fetch('/api/daily-challenge-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challenge_id: savedId,
              question: q.question,
              options: q.options,
              correct_index: q.correct_index,
              reason: q.reason,
              enabled: q.enabled,
            }),
          });
        }
      }

      toast.success(isNew ? 'Challenge created!' : 'Challenge saved!');
      router.push('/admin/daily-mcq');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
  }

  const activeQuestions = questions.filter((q) => !q._deleted);

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D4C3E] flex items-center justify-center">
            <Zap size={20} className="text-yellow-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'New Daily Challenge' : 'Edit Daily Challenge'}
            </h1>
            <p className="text-gray-400 text-sm">Shown as "Your Daily Challenge" on home screen</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/daily-mcq')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#0D4C3E] hover:bg-[#0a3d32]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Section 1: Basic Info */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg mb-5">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Challenge Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Biology Basics Daily Quiz"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description…"
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
            <div>
              <p className="font-semibold text-gray-700">Active on Home Screen</p>
              <p className="text-xs text-gray-400">Show this challenge to users</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
      </section>

      {/* Section 2: Quiz Settings */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg mb-5">Quiz Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label className="mb-1.5 block">Seconds per question</Label>
            <Input
              type="number"
              min={5}
              max={300}
              value={quizDuration}
              onChange={(e) => setQuizDuration(Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Total questions to show</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between col-span-full border border-gray-100 rounded-xl p-4">
            <div>
              <p className="font-semibold text-gray-700">Shuffle Questions</p>
              <p className="text-xs text-gray-400">Randomize order for each attempt</p>
            </div>
            <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
          </div>
        </div>
      </section>

      {/* Section 3: Questions */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">MCQ Questions</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {activeQuestions.length} question{activeQuestions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={addQuestion}>
            <Plus size={14} /> Add Question
          </Button>
        </div>

        {activeQuestions.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            No questions yet. Add your first MCQ above.
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, qIdx) => {
            if (q._deleted) return null;
            const visibleIdx = questions.filter((x, xi) => !x._deleted && xi <= qIdx).length;
            return (
              <div key={q._key} className="border border-gray-200 rounded-xl overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer select-none"
                  onClick={() => toggleExpand(q._key)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-gray-400 shrink-0">Q{visibleIdx}</span>
                    <p className="text-sm font-semibold text-gray-700 truncate">
                      {q.question || 'Untitled question'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-gray-500">{q.enabled ? 'On' : 'Off'}</span>
                      <Switch
                        checked={q.enabled}
                        onCheckedChange={(v) => updateQ(q._key, { enabled: v })}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(q._key);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                    {q._expanded ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {q._expanded && (
                  <div className="p-4 space-y-4">
                    <div>
                      <Label className="mb-1.5 block">Question Text</Label>
                      <Textarea
                        value={q.question}
                        onChange={(e) => updateQ(q._key, { question: e.target.value })}
                        placeholder="Enter the question…"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">
                        Answer Options{' '}
                        <span className="text-gray-400 font-normal">(select correct one)</span>
                      </Label>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-3">
                            <button
                              onClick={() => updateQ(q._key, { correct_index: oi })}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${q.correct_index === oi ? 'border-[#0D4C3E] bg-[#0D4C3E]' : 'border-gray-300 hover:border-[#0D4C3E]'}`}
                            >
                              {q.correct_index === oi && <Check size={12} className="text-white" />}
                            </button>
                            <Input
                              value={opt}
                              onChange={(e) => updateOption(q._key, oi, e.target.value)}
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-1.5 block">
                        Explanation{' '}
                        <span className="text-gray-400 font-normal">(shown after answering)</span>
                      </Label>
                      <Textarea
                        value={q.reason}
                        onChange={(e) => updateQ(q._key, { reason: e.target.value })}
                        placeholder="Explain why this is the correct answer…"
                        rows={3}
                        maxLength={3000}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {q.reason.trim().split(/\s+/).filter(Boolean).length} / 500 words
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {activeQuestions.length > 0 && (
          <Button variant="outline" size="sm" className="mt-4 gap-1 w-full" onClick={addQuestion}>
            <Plus size={14} /> Add Another Question
          </Button>
        )}
        <div ref={bottomRef} />
      </section>

      {/* Sticky bottom save */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 z-10">
        <Button variant="outline" onClick={() => router.push('/admin/daily-mcq')} disabled={saving}>
          Cancel
        </Button>
        <Button
          className="bg-[#0D4C3E] hover:bg-[#0a3d32] min-w-[120px]"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : isNew ? 'Create Challenge' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
