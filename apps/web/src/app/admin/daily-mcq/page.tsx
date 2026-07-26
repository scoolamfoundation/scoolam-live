'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Challenge {
  id: number;
  title: string;
  description: string;
  quiz_duration: number;
  total_questions: number;
  is_active: boolean;
  question_count: number;
}

export default function DailyMCQAdminPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/daily-challenges');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setChallenges(data.challenges ?? []);
    } catch {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleActive = async (c: Challenge) => {
    setToggling(c.id);
    try {
      const res = await fetch(`/api/daily-challenge/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !c.is_active }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(c.is_active ? 'Challenge deactivated' : 'Challenge activated!');
      await load();
    } catch {
      toast.error('Failed to update');
    } finally {
      setToggling(null);
    }
  };

  const deleteChallenge = async (id: number) => {
    if (!confirm('Delete this daily challenge and all its questions?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/daily-challenge/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      await load();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily MCQ Challenges</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create daily challenges shown on the app home screen. Only <strong>active</strong>{' '}
            challenges appear to users.
          </p>
        </div>
        <Link href="/admin/daily-mcq/new">
          <Button className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2">
            <Plus size={16} /> New Challenge
          </Button>
        </Link>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <Zap size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Only the <strong>most recently activated</strong> challenge is shown to users as "Your
          Daily Challenge". Deactivate old challenges before activating a new one.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Zap className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 text-lg font-semibold">No daily challenges yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Create your first challenge to show on the app home screen.
            </p>
            <Link href="/admin/daily-mcq/new">
              <Button className="mt-5 bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2">
                <Plus size={14} /> Create First Challenge
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {challenges.map((c) => (
            <Card
              key={c.id}
              className={`border-gray-100 hover:shadow-md transition-shadow ${c.is_active ? 'ring-2 ring-[#0D4C3E]/30' : ''}`}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    c.is_active ? 'bg-[#0D4C3E]' : 'bg-gray-100'
                  }`}
                >
                  <Zap size={18} className={c.is_active ? 'text-yellow-300' : 'text-gray-400'} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 truncate">{c.title}</p>
                    {c.is_active && (
                      <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {c.question_count ?? 0} questions · {c.total_questions} shown ·{' '}
                    {c.quiz_duration}s each
                  </p>
                  {c.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{c.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Active toggle */}
                  <button
                    onClick={() => void toggleActive(c)}
                    disabled={toggling === c.id}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      c.is_active
                        ? 'border-green-200 text-green-700 hover:bg-green-50'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                    title={c.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {c.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    {c.is_active ? 'Active' : 'Inactive'}
                  </button>

                  <Link href={`/admin/daily-mcq/${c.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Pencil size={13} /> Edit
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => void deleteChallenge(c.id)}
                    disabled={deleting === c.id}
                  >
                    <Trash2 size={13} /> {deleting === c.id ? '…' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
