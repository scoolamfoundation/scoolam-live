'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  Check,
  Image as ImageIcon,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useUpload from '@/utils/useUpload';
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

export default function TopicEditorPage() {
  const params = useParams();
  const topicId = params.id as string;
  const isNew = topicId === 'new';
  const router = useRouter();

  // --- Topic fields ---
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoOrientation, setVideoOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(['']);
  const [quizDuration, setQuizDuration] = useState(30);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [questions, setQuestions] = useState<LocalQuestion[]>([emptyQuestion()]);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [upload, { loading: uploading }] = useUpload();
  const [uploadThumb, { loading: uploadingThumb }] = useUpload();
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  // Fetch categories from API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          const names: string[] = (data.categories ?? []).map((c: { name: string }) => c.name);
          setCategories(names);
          if (isNew && names.length > 0) setCategory(names[0] ?? '');
        }
      } catch {
        setCategories([
          'Biology',
          'Chemistry',
          'Physics',
          'Math',
          'English',
          'History',
          'Geography',
        ]);
      }
    })();
  }, [isNew]);

  // Fetch existing topic
  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/topics/${topicId}`);
      if (!res.ok) {
        toast.error('Topic not found');
        router.push('/admin');
        return;
      }
      const data = await res.json();
      const t = data.topic;
      setTitle(t.title ?? '');
      setCategory((t.category as string | undefined) ?? '');
      setDescription(t.description ?? '');
      setVideoUrl(t.video_url ?? '');
      setThumbnailUrl(t.thumbnail_url ?? '');
      setVideoOrientation((t.video_orientation as 'horizontal' | 'vertical') ?? 'horizontal');
      setKeyTakeaways(t.key_takeaways?.length ? t.key_takeaways : ['']);
      setQuizDuration(t.quiz_duration ?? 30);
      setTotalQuestions(t.total_questions ?? 5);
      setShuffleQuestions(t.shuffle_questions ?? true);
      setIsPremium(t.is_premium ?? false);
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
  }, [topicId, isNew, router]);

  const addNewCategory = async () => {
    const name = newCategoryInput.trim();
    if (!name) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('exists');
      setCategories((prev) => [...prev, name].sort());
      setCategory(name);
      setNewCategoryInput('');
      setAddingCategory(false);
      toast.success(`Category "${name}" added!`);
    } catch {
      toast.error('Category already exists or could not be added.');
    }
  };

  // --- Key takeaways helpers ---
  const updateTakeaway = (i: number, val: string) =>
    setKeyTakeaways((prev) => prev.map((t, idx) => (idx === i ? val : t)));
  const addTakeaway = () => setKeyTakeaways((prev) => [...prev, '']);
  const removeTakeaway = (i: number) =>
    setKeyTakeaways((prev) => prev.filter((_, idx) => idx !== i));

  // --- Question helpers ---
  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
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

  // --- Video upload ---
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload({ file });
    if ('error' in result) {
      toast.error(result.error);
      return;
    }
    setVideoUrl(result.url);
    toast.success('Video uploaded!');
  };

  // --- Thumbnail upload ---
  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadThumb({ file });
    if ('error' in result) {
      toast.error(result.error);
      return;
    }
    setThumbnailUrl(result.url);
    toast.success('Thumbnail uploaded!');
  };

  // --- Save ---
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const topicPayload = {
        title: title.trim(),
        category,
        description: description.trim(),
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        video_orientation: videoOrientation,
        key_takeaways: keyTakeaways.filter((t) => t.trim()),
        quiz_duration: quizDuration,
        total_questions: totalQuestions,
        shuffle_questions: shuffleQuestions,
        is_premium: isPremium,
      };

      let savedTopicId: number;

      if (isNew) {
        const res = await fetch('/api/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(topicPayload),
        });
        if (!res.ok) throw new Error('Failed to create topic');
        const data = await res.json();
        savedTopicId = data.topic.id;
      } else {
        const res = await fetch(`/api/topics/${topicId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(topicPayload),
        });
        if (!res.ok) throw new Error('Failed to update topic');
        savedTopicId = parseInt(topicId);
      }

      // Manage questions
      for (const q of questions) {
        if (q._deleted && q.id) {
          await fetch(`/api/questions/${q.id}`, { method: 'DELETE' });
        } else if (!q._deleted && q.id) {
          await fetch(`/api/questions/${q.id}`, {
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
          await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic_id: savedTopicId,
              question: q.question,
              options: q.options,
              correct_index: q.correct_index,
              reason: q.reason,
              enabled: q.enabled,
            }),
          });
        }
      }

      toast.success(isNew ? 'Topic created!' : 'Topic saved!');
      router.push('/admin');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading topic...</div>
      </div>
    );
  }

  const activeQuestions = questions.filter((q) => !q._deleted);

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'New Topic' : 'Edit Topic'}</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details below and save.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin')} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="bg-[#0D4C3E] hover:bg-[#0a3d32] min-w-[100px]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Topic'}
          </Button>
        </div>
      </div>

      {/* Section 1: Basic Info */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg mb-5">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Topic Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Photosynthesis Deep Dive"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Category *</Label>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4C3E]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setAddingCategory((v) => !v)}
                type="button"
              >
                <Plus size={14} /> New
              </Button>
            </div>
            {addingCategory && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="e.g. Economics"
                  onKeyDown={(e) => e.key === 'Enter' && void addNewCategory()}
                  autoFocus
                />
                <Button
                  size="sm"
                  className="bg-[#0D4C3E] hover:bg-[#0a3d32] shrink-0"
                  onClick={() => void addNewCategory()}
                  type="button"
                >
                  Add
                </Button>
              </div>
            )}
          </div>
          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the topic..."
              rows={3}
            />
          </div>

          {/* Premium toggle */}
          <div
            className={`flex items-center justify-between rounded-xl p-4 border-2 transition-colors ${isPremium ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPremium ? 'bg-amber-100' : 'bg-gray-100'}`}
              >
                <Crown size={18} className={isPremium ? 'text-amber-600' : 'text-gray-400'} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {isPremium ? '🔒 Premium Content' : '🆓 Free Content'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isPremium
                    ? 'Only premium subscribers can access this topic'
                    : 'All users (including free tier) can access this topic'}
                </p>
              </div>
            </div>
            <Switch checked={isPremium} onCheckedChange={setIsPremium} />
          </div>
        </div>
      </section>

      {/* Section 2: Thumbnail */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg mb-2">Topic Thumbnail</h2>
        <p className="text-sm text-gray-400 mb-4">
          This image appears on the Topics screen in the app.
        </p>
        {thumbnailUrl ? (
          <div className="space-y-3">
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-full h-44 object-cover rounded-xl"
            />
            <div className="flex gap-2">
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="text-xs text-gray-400"
                placeholder="Or paste an image URL"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setThumbnailUrl('');
                  if (thumbRef.current) thumbRef.current.value = '';
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-[#0D4C3E] transition-colors"
              onClick={() => thumbRef.current?.click()}
            >
              <ImageIcon className="mx-auto text-gray-300 mb-3" size={36} />
              <p className="font-semibold text-gray-600">
                {uploadingThumb ? 'Uploading…' : 'Click to upload thumbnail'}
              </p>
              <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP supported</p>
            </div>
            <div className="mt-4">
              <Label className="mb-1.5 block text-sm text-gray-500">Or paste an image URL</Label>
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </>
        )}
        <input
          ref={thumbRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleThumbUpload}
        />
      </section>

      {/* Section 3: Video */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg mb-5">Video</h2>
        {videoUrl ? (
          <div className="space-y-3">
            <video src={videoUrl} controls className="w-full rounded-xl max-h-48 bg-black" />
            <div className="flex gap-2">
              <Input value={videoUrl} readOnly className="text-xs text-gray-400" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setVideoUrl('');
                  if (fileRef.current) fileRef.current.value = '';
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-[#0D4C3E] transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="font-semibold text-gray-600">
              {uploading ? 'Uploading…' : 'Click to upload video'}
            </p>
            <p className="text-sm text-gray-400 mt-1">MP4, MOV, WebM supported</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoUpload}
        />
        {!videoUrl && (
          <div className="mt-4">
            <Label className="mb-1.5 block text-sm text-gray-500">Or paste a video URL</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}
        <div className="mt-4">
          <Label className="mb-2 block">Video Orientation</Label>
          <div className="flex gap-3">
            {(['horizontal', 'vertical'] as const).map((orient) => (
              <button
                key={orient}
                onClick={() => setVideoOrientation(orient)}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${videoOrientation === orient ? 'border-[#0D4C3E] bg-[#E8F5F0]' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div
                  className={`rounded-md bg-gray-200 ${orient === 'horizontal' ? 'w-14 h-9' : 'w-9 h-14'} flex items-center justify-center`}
                >
                  <span className="text-gray-500 text-xs font-bold">
                    {orient === 'horizontal' ? '16:9' : '9:16'}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold capitalize ${videoOrientation === orient ? 'text-[#0D4C3E]' : 'text-gray-500'}`}
                >
                  {orient}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {videoOrientation === 'vertical'
              ? 'Vertical (9:16) — opens fullscreen on mobile'
              : 'Horizontal (16:9) — standard embedded player'}
          </p>
        </div>
      </section>

      {/* Section 4: Key Takeaways */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg mb-5">Key Takeaways</h2>
        <div className="space-y-2">
          {keyTakeaways.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[#0D4C3E] font-bold text-lg leading-none mt-0.5">•</span>
              <Input
                value={t}
                onChange={(e) => updateTakeaway(i, e.target.value)}
                placeholder={`Takeaway ${i + 1}`}
                className="flex-1"
              />
              {keyTakeaways.length > 1 && (
                <button
                  onClick={() => removeTakeaway(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-4 gap-1" onClick={addTakeaway}>
          <Plus size={14} /> Add Takeaway
        </Button>
      </section>

      {/* Section 5: Quiz Settings */}
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
            <p className="text-xs text-gray-400 mt-1">Timer countdown for each question</p>
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
            <p className="text-xs text-gray-400 mt-1">Max drawn from enabled questions</p>
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

      {/* Section 6: MCQs */}
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
                      <span className="text-xs text-gray-500">
                        {q.enabled ? 'Enabled' : 'Disabled'}
                      </span>
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
                        placeholder="Enter the question..."
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
                      <p className="text-xs text-gray-400 mt-1.5">
                        Click the circle to mark the correct answer
                      </p>
                    </div>
                    <div>
                      <Label className="mb-1.5 block">
                        Explanation / Reason{' '}
                        <span className="text-gray-400 font-normal">(shown after answering)</span>
                      </Label>
                      <Textarea
                        value={q.reason}
                        onChange={(e) => updateQ(q._key, { reason: e.target.value })}
                        placeholder="Explain why this is the correct answer..."
                        rows={4}
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
      </section>

      {/* Sticky bottom save */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 z-10">
        <Button variant="outline" onClick={() => router.push('/admin')} disabled={saving}>
          Cancel
        </Button>
        <Button
          className="bg-[#0D4C3E] hover:bg-[#0a3d32] min-w-[120px]"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : isNew ? 'Create Topic' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
