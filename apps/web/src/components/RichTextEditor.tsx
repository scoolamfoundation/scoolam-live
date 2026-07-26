'use client';
import { useEffect, useRef, useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const TOOLBAR = [
  { cmd: 'bold', label: '<strong>B</strong>', title: 'Bold' },
  { cmd: 'italic', label: '<em>I</em>', title: 'Italic' },
  { cmd: 'underline', label: '<u>U</u>', title: 'Underline' },
  { cmd: 'strikeThrough', label: '<s>S</s>', title: 'Strikethrough' },
  { type: 'sep' },
  { cmd: 'formatBlock', value: 'H1', label: 'H1', title: 'Heading 1' },
  { cmd: 'formatBlock', value: 'H2', label: 'H2', title: 'Heading 2' },
  { cmd: 'formatBlock', value: 'H3', label: 'H3', title: 'Heading 3' },
  { cmd: 'formatBlock', value: 'P', label: 'P', title: 'Paragraph' },
  { type: 'sep' },
  { cmd: 'insertUnorderedList', label: '• List', title: 'Bullet List' },
  { cmd: 'insertOrderedList', label: '1. List', title: 'Numbered List' },
  { type: 'sep' },
  { cmd: 'justifyLeft', label: '⬛⬛⬜⬜', title: 'Align Left' },
  { cmd: 'justifyCenter', label: '⬜⬛⬛⬜', title: 'Align Center' },
  { cmd: 'justifyRight', label: '⬜⬜⬛⬛', title: 'Align Right' },
  { type: 'sep' },
  { cmd: 'indent', label: '→ Indent', title: 'Indent' },
  { cmd: 'outdent', label: '← Outdent', title: 'Outdent' },
  { type: 'sep' },
  { cmd: 'insertHorizontalRule', label: '─ Rule', title: 'Horizontal Rule' },
  { cmd: 'removeFormat', label: '✕ Clear', title: 'Clear Formatting' },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = 480,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUserInput = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;
    if (!isUserInput.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    isUserInput.current = false;
  }, [value]);

  const execCmd = useCallback(
    (cmd: string, val?: string) => {
      editorRef.current?.focus();
      document.execCommand(cmd, false, val);
      if (editorRef.current) {
        isUserInput.current = true;
        onChange(editorRef.current.innerHTML);
      }
    },
    [onChange]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isUserInput.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, text);
      if (editorRef.current) {
        isUserInput.current = true;
        onChange(editorRef.current.innerHTML);
      }
    },
    [onChange]
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center">
        {TOOLBAR.map((item, i) => {
          if (item.type === 'sep') return <span key={i} className="w-px h-6 bg-gray-300 mx-1" />;
          return (
            <button
              key={i}
              type="button"
              title={item.title}
              onMouseDown={(e) => {
                e.preventDefault();
                execCmd(item.cmd!, item.value);
              }}
              className="px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-200 transition-all whitespace-nowrap"
              dangerouslySetInnerHTML={{ __html: item.label! }}
            />
          );
        })}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="prose prose-sm max-w-none p-6 focus:outline-none"
        style={{
          minHeight,
          fontFamily: 'Georgia, serif',
          fontSize: '15px',
          lineHeight: '1.8',
          color: '#1a1a1a',
        }}
      />

      <style jsx global>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
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
        .prose blockquote {
          border-left: 4px solid #0d4c3e;
          margin: 1rem 0;
          padding: 0.5rem 1rem;
          background: #f0faf7;
          color: #374151;
        }
      `}</style>
    </div>
  );
}
