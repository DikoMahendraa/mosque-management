'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  label,
  error,
  placeholder = 'Tulis konten di sini...',
  className,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [QuillComponent, setQuillComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    setMounted(true);
    import('react-quill').then((mod) => {
      setQuillComponent(() => mod.default);
    });
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean'],
    ],
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div
        className={cn(
          'rounded-xl border overflow-hidden',
          error ? 'border-red-300' : 'border-gray-200'
        )}
      >
        {mounted && QuillComponent ? (
          <QuillComponent
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            theme="snow"
            modules={modules}
            className="bg-white"
          />
        ) : (
          <div className="h-40 bg-gray-50 animate-pulse rounded-xl" />
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
