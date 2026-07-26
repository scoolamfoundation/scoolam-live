'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  FileText,
  Crown,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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

function ItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
      <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-16 bg-gray-100 rounded-xl" />
        <div className="h-9 w-16 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get('tab') as 'infographics' | 'worksheets') ?? 'infographics';

  const [tab, setTab] = useState<'infographics' | 'worksheets'>(defaultTab);
  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    const [ir, wr] = await Promise.all([fetch('/api/infographics'), fetch('/api/worksheets')]);
    const [id, wd] = await Promise.all([ir.json(), wr.json()]);
    setInfographics(id.infographics ?? []);
    setWorksheets(wd.worksheets ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void fetchAll();
  }, []);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const deleteItem = async (type: 'infographics' | 'worksheets', id: number) => {
    if (!confirm('Delete this item?')) return;
    setDeleting(id);
    await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
    toast.success('Item deleted');
    await fetchAll();
    setDeleting(null);
  };

  const rawItems = tab === 'infographics' ? infographics : worksheets;
  const items = rawItems.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  const premiumCount = rawItems.filter((i) => i.is_premium).length;
  const freeCount = rawItems.filter((i) => !i.is_premium).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {rawItems.length} items · {premiumCount} premium · {freeCount} free
          </p>
        </div>
        <Link href={`/admin/library/${tab}/new`}>
          <Button className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2 shadow-sm">
            <Plus size={16} /> Add {tab === 'infographics' ? 'Infographic' : 'Worksheet'}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: rawItems.length, bg: 'bg-gray-50', text: 'text-gray-900' },
          { label: 'Free', value: freeCount, bg: 'bg-emerald-50', text: 'text-emerald-700' },
          { label: 'Premium', value: premiumCount, bg: 'bg-amber-50', text: 'text-amber-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100`}>
            <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['infographics', 'worksheets'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? 'bg-[#0D4C3E] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'infographics' ? <ImageIcon size={14} /> : <FileText size={14} />}
              {t === 'infographics' ? 'Infographics' : 'Worksheets'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-9 bg-white border-gray-200 h-10"
          />
        </div>
      </div>

      {/* Items */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <ItemSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-20">
          {tab === 'infographics' ? (
            <ImageIcon className="mx-auto text-gray-200 mb-4" size={52} />
          ) : (
            <FileText className="mx-auto text-gray-200 mb-4" size={52} />
          )}
          <p className="text-gray-500 text-lg font-semibold">No {tab} found</p>
          <Link href={`/admin/library/${tab}/new`}>
            <Button className="mt-5 bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2">
              <Plus size={14} /> Add First
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:border-gray-200 hover:shadow-md transition-all group"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                {tab === 'infographics' && (item as Infographic).thumbnail_url ? (
                  <img
                    src={(item as Infographic).thumbnail_url}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${tab === 'infographics' ? 'bg-purple-50' : 'bg-emerald-50'}`}
                  >
                    {tab === 'infographics' ? (
                      <ImageIcon size={22} className="text-purple-400" />
                    ) : (
                      <FileText size={22} className="text-emerald-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.is_premium ? (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 flex items-center gap-1">
                      <Crown size={10} /> Premium
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500">
                      Free
                    </span>
                  )}
                </div>
                <p className="font-bold text-gray-900 truncate">{item.title}</p>
                {item.description && (
                  <p className="text-sm text-gray-400 truncate mt-0.5">{item.description}</p>
                )}
                {item.file_url && (
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#0D4C3E] flex items-center gap-1 mt-1 w-fit hover:underline"
                  >
                    <ExternalLink size={11} /> View file
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/admin/library/${tab}/${item.id}`}>
                  <Button variant="outline" size="sm" className="gap-1 h-9">
                    <Pencil size={13} /> Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 h-9 text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => void deleteItem(tab, item.id)}
                  disabled={deleting === item.id}
                >
                  <Trash2 size={13} /> {deleting === item.id ? '…' : 'Del'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LibraryAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 pt-4">
          {[...Array(4)].map((_, i) => (
            <ItemSkeleton key={i} />
          ))}
        </div>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}
