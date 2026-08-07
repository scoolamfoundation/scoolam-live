'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/RichTextEditor';

export default function AdminPrivacyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content-pages/privacy')
      .then((r) => r.json())
      .then((d) => {
        setContent(d.page?.content ?? '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content-pages/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Privacy Policy saved!');
    } catch {
      toast.error('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mt-1">
            Format and publish your Privacy Policy. Changes are reflected immediately on the public
            page.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink size={14} /> Preview Page
            </Button>
          </a>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? <EyeOff size={14} /> : <Eye size={14} />}
            {preview ? 'Edit' : 'Preview'}
          </Button>
          <Button
            className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-1.5"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-[#E8F5F0] border border-[#A7D4C8] rounded-xl p-4 mb-6 text-sm text-[#0D4C3E]">
        <strong>Formatting tips:</strong> Use <strong>H1</strong> for the main title (e.g. "Privacy
        Policy"), <strong>H2</strong> for sections (e.g. "Information We Collect"),
        <strong> H3</strong> for sub-sections. Use bullet lists for item groups. Bold key terms for
        clarity.
      </div>

      {/* Editor or Preview */}
      {preview ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div
            className="prose prose-sm max-w-none"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#1a1a1a',
            }}
            dangerouslySetInnerHTML={{
              __html:
                content ||
                '<p class="text-gray-400">No content yet. Click Edit to start writing.</p>',
            }}
          />
          <style jsx global>{`
            .prose h1 {
              font-size: 2rem;
              font-weight: 800;
              margin: 1.5rem 0 0.75rem;
              color: #0d4c3e;
              border-bottom: 2px solid #0d4c3e;
              padding-bottom: 0.5rem;
            }
            .prose h2 {
              font-size: 1.5rem;
              font-weight: 700;
              margin: 1.25rem 0 0.6rem;
              color: #0d4c3e;
            }
            .prose h3 {
              font-size: 1.2rem;
              font-weight: 700;
              margin: 1rem 0 0.5rem;
              color: #1a1a1a;
            }
            .prose p {
              margin: 0.75rem 0;
            }
            .prose ul,
            .prose ol {
              padding-left: 1.75rem;
              margin: 0.75rem 0;
            }
            .prose li {
              margin: 0.3rem 0;
            }
            .prose strong {
              font-weight: 700;
            }
            .prose em {
              font-style: italic;
            }
            .prose u {
              text-decoration: underline;
            }
            .prose hr {
              border: none;
              border-top: 2px solid #e5e7eb;
              margin: 1.5rem 0;
            }
          `}</style>
        </div>
      ) : (
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Start writing your Privacy Policy here. Use the toolbar above to format headings, bullet lists, bold text, and more..."
          minHeight={560}
        />
      )}

      {/* Sticky save */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreview((v) => !v)}
          className="gap-1.5"
        >
          {preview ? <EyeOff size={14} /> : <Eye size={14} />}
          {preview ? 'Edit Mode' : 'Preview Mode'}
        </Button>
        <Button
          className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-1.5 min-w-[120px]"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
