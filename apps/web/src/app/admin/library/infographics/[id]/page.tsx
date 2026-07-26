'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import useUpload from '@/utils/useUpload';
import { toast } from 'sonner';

export default function InfographicEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [upload, { loading: uploading }] = useUpload();
  const thumbRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/infographics/${id}`);
      if (!res.ok) {
        toast.error('Not found');
        router.push('/admin/library');
        return;
      }
      const data = await res.json();
      const i = data.infographic;
      setTitle(i.title ?? '');
      setDescription(i.description ?? '');
      setThumbnailUrl(i.thumbnail_url ?? '');
      setFileUrl(i.file_url ?? '');
      setIsPremium(i.is_premium ?? false);
      setLoading(false);
    })();
  }, [id, isNew, router]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumb' | 'file') => {
    const f = e.target.files?.[0];
    if (!f) return;
    const result = await upload({ file: f });
    if ('error' in result) {
      toast.error(result.error);
      return;
    }
    if (type === 'thumb') setThumbnailUrl(result.url);
    else setFileUrl(result.url);
    toast.success('Uploaded!');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description,
        thumbnail_url: thumbnailUrl,
        file_url: fileUrl,
        is_premium: isPremium,
      };
      const res = isNew
        ? await fetch('/api/infographics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/infographics/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error('Save failed');
      toast.success(isNew ? 'Infographic created!' : 'Saved!');
      router.push('/admin/library');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'New Infographic' : 'Edit Infographic'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/library')} disabled={saving}>
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

      <div className="space-y-5">
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800">Details</h2>
          <div>
            <Label className="mb-1.5 block">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Photosynthesis Cycle"
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
              <p className="font-semibold text-gray-700">Premium</p>
              <p className="text-xs text-gray-400">Restricted to premium users</p>
            </div>
            <Switch checked={isPremium} onCheckedChange={setIsPremium} />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800">Thumbnail Image</h2>
          {thumbnailUrl ? (
            <div className="space-y-2">
              <img
                src={thumbnailUrl}
                className="w-full max-h-48 object-cover rounded-xl"
                alt="thumbnail"
              />
              <Button variant="outline" size="sm" onClick={() => setThumbnailUrl('')}>
                Remove
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#0D4C3E] transition-colors"
              onClick={() => thumbRef.current?.click()}
            >
              <Upload className="mx-auto text-gray-300 mb-2" size={28} />
              <p className="text-gray-500 font-medium">
                {uploading ? 'Uploading…' : 'Click to upload thumbnail'}
              </p>
            </div>
          )}
          <input
            ref={thumbRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleUpload(e, 'thumb')}
          />
          {!thumbnailUrl && (
            <Input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="Or paste image URL…"
            />
          )}
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800">Infographic File (PDF / Image)</h2>
          {fileUrl ? (
            <div className="flex gap-2 items-center">
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#0D4C3E] text-sm underline truncate flex-1"
              >
                {fileUrl}
              </a>
              <Button variant="outline" size="sm" onClick={() => setFileUrl('')}>
                Remove
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#0D4C3E] transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mx-auto text-gray-300 mb-2" size={28} />
              <p className="text-gray-500 font-medium">
                {uploading ? 'Uploading…' : 'Click to upload file'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG supported</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => void handleUpload(e, 'file')}
          />
          {!fileUrl && (
            <Input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="Or paste file URL…"
            />
          )}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 z-10">
        <Button variant="outline" onClick={() => router.push('/admin/library')} disabled={saving}>
          Cancel
        </Button>
        <Button
          className="bg-[#0D4C3E] hover:bg-[#0a3d32] min-w-[120px]"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : isNew ? 'Create' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
