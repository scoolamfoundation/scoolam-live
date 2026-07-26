import { Suspense } from 'react';

async function TermsContent() {
  let content = '';
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_CREATE_APP_URL || 'http://localhost:3000'}/api/content-pages/terms`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      content = data.page?.content ?? '';
    }
  } catch {
    content = '';
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-[#0D4C3E] py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#A7D4C8] text-sm font-semibold uppercase tracking-widest mb-2">
            Legal
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Terms of Service</h1>
          <p className="text-[#A7D4C8] mt-2 text-sm">
            Please read these terms carefully before using Scoolam.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {content ? (
            <>
              <div
                className="prose prose-sm max-w-none"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '15px',
                  lineHeight: '1.85',
                  color: '#1a1a1a',
                }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
              <style>{`
                .prose h1 { font-size: 2rem; font-weight: 800; margin: 1.5rem 0 0.75rem; color: #0D4C3E; border-bottom: 2px solid #0D4C3E; padding-bottom: 0.5rem; }
                .prose h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.6rem; color: #0D4C3E; }
                .prose h3 { font-size: 1.2rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: #1a1a1a; }
                .prose p { margin: 0.75rem 0; }
                .prose ul, .prose ol { padding-left: 1.75rem; margin: 0.75rem 0; }
                .prose li { margin: 0.35rem 0; }
                .prose strong { font-weight: 700; }
                .prose em { font-style: italic; }
                .prose u { text-decoration: underline; }
                .prose hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5rem 0; }
                .prose blockquote { border-left: 4px solid #0D4C3E; margin: 1rem 0; padding: 0.5rem 1rem; background: #f0faf7; color: #374151; border-radius: 0 8px 8px 0; }
              `}</style>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">Terms of Service</p>
              <p className="text-gray-400 text-sm mt-1">
                Content will be available soon. Please check back later.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          © {new Date().getFullYear()} Scoolam. All rights reserved.
        </p>
      </div>
    </main>
  );
}

export default function TermsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </main>
      }
    >
      <TermsContent />
    </Suspense>
  );
}
