'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Trash2,
  PlayCircle,
  HelpCircle,
  Tag,
  X,
  Crown,
  BookOpen,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Topic {
  id: number;
  title: string;
  category: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  total_questions: number;
  quiz_duration: number;
  shuffle_questions: boolean;
  is_premium: boolean;
}
interface Category {
  id: number;
  name: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Biology: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Chemistry: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Physics: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  Math: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  English: { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-500' },
  History: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Geography: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
};
const DEFAULT_COLOR = { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

function TopicSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
      </div>
      <div className="flex gap-2 shrink-0">
        <div className="h-9 w-16 bg-gray-100 rounded-xl" />
        <div className="h-9 w-20 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterPremium, setFilterPremium] = useState<'all' | 'free' | 'premium'>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [catInput, setCatInput] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [deletingCat, setDeletingCat] = useState<number | null>(null);

  const fetchTopics = async () => {
    setLoading(true);
    const res = await fetch('/api/topics');
    const data = await res.json();
    setTopics(data.topics ?? []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories');
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories ?? []);
    }
  };

  useEffect(() => {
    void fetchTopics();
    void fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this topic and all its questions?')) return;
    setDeleting(id);
    await fetch(`/api/topics/${id}`, { method: 'DELETE' });
    toast.success('Topic deleted');
    await fetchTopics();
    setDeleting(null);
  };

  const handleAddCategory = async () => {
    const name = catInput.trim();
    if (!name) return;
    setAddingCat(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('exists');
      setCatInput('');
      await fetchCategories();
      toast.success(`Category "${name}" added!`);
    } catch {
      toast.error('Category already exists.');
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setDeletingCat(id);
    await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchCategories();
    setDeletingCat(null);
  };

  const filtered = topics.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterPremium === 'all' ||
      (filterPremium === 'premium' && t.is_premium) ||
      (filterPremium === 'free' && !t.is_premium);
    return matchSearch && matchFilter;
  });

  const premiumCount = topics.filter((t) => t.is_premium).length;
  const freeCount = topics.filter((t) => !t.is_premium).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {topics.length} topics · {premiumCount} premium · {freeCount} free
          </p>
        </div>
        <Link href="/admin/topics/new">
          <Button className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2 shadow-sm">
            <Plus size={16} /> New Topic
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Topics',
            value: topics.length,
            color: 'text-gray-900',
            icon: BookOpen,
            bg: 'bg-gray-50',
          },
          {
            label: 'Free Topics',
            value: freeCount,
            color: 'text-emerald-700',
            icon: BookOpen,
            bg: 'bg-emerald-50',
          },
          {
            label: 'Premium Topics',
            value: premiumCount,
            color: 'text-amber-700',
            icon: Crown,
            bg: 'bg-amber-50',
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics or categories…"
            className="pl-10 bg-white border-gray-200"
          />
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['all', 'free', 'premium'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterPremium(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                filterPremium === f
                  ? 'bg-[#0D4C3E] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Topics list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <TopicSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-20">
          <BookOpen className="mx-auto text-gray-200 mb-4" size={52} />
          <p className="text-gray-500 text-lg font-semibold">No topics found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
          {topics.length === 0 && (
            <Link href="/admin/topics/new">
              <Button className="mt-6 bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2">
                <Plus size={16} /> Create First Topic
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((topic) => {
            const color = CATEGORY_COLORS[topic.category] ?? DEFAULT_COLOR;
            return (
              <div
                key={topic.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:border-gray-200 hover:shadow-md transition-all group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {topic.thumbnail_url ? (
                    <img src={topic.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full ${color.bg} flex items-center justify-center`}>
                      <PlayCircle size={22} className={color.text} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${color.bg} ${color.text}`}
                    >
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${color.dot} mr-1.5 mb-px`}
                      />
                      {topic.category}
                    </span>
                    {topic.is_premium && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 flex items-center gap-1">
                        <Crown size={10} /> Premium
                      </span>
                    )}
                    {!topic.is_premium && (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500">
                        Free
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-gray-900 truncate">{topic.title}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {topic.video_url && (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <PlayCircle size={12} /> Video
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <HelpCircle size={12} /> {topic.total_questions}Q · {topic.quiz_duration}s
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/topics/${topic.id}`}>
                    <Button variant="outline" size="sm" className="gap-1 h-9">
                      <Pencil size={13} /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-9 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={() => void handleDelete(topic.id)}
                    disabled={deleting === topic.id}
                  >
                    <Trash2 size={13} /> {deleting === topic.id ? '…' : 'Delete'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Categories section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#E8F5F0] flex items-center justify-center">
            <Tag size={16} className="text-[#0D4C3E]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Categories</h2>
            <p className="text-xs text-gray-400">{categories.length} active categories</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 mb-4">
          <Input
            value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
            placeholder="New category name…"
            onKeyDown={(e) => e.key === 'Enter' && void handleAddCategory()}
            className="max-w-xs"
          />
          <Button
            className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-1 shrink-0"
            onClick={() => void handleAddCategory()}
            disabled={addingCat || !catInput.trim()}
          >
            <Plus size={14} /> Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const color = CATEGORY_COLORS[cat.name] ?? DEFAULT_COLOR;
            return (
              <div
                key={cat.id}
                className={`flex items-center gap-1.5 ${color.bg} border border-transparent px-3 py-1.5 rounded-xl`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
                <span className={`font-semibold text-sm ${color.text}`}>{cat.name}</span>
                <button
                  onClick={() => void handleDeleteCategory(cat.id, cat.name)}
                  disabled={deletingCat === cat.id}
                  className="text-gray-300 hover:text-red-400 transition-colors ml-0.5"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="text-gray-400 text-sm">No categories yet. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
