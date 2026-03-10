'use client';

import { useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Quote, Link2, Eraser, Heading2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
}

interface ToolbarButton {
  icon: React.ElementType;
  command: string;
  arg?: string;
  title: string;
}

const TOOLBAR: (ToolbarButton | 'divider')[] = [
  { icon: Heading2, command: 'formatBlock', arg: 'h2', title: 'Heading' },
  'divider',
  { icon: Bold, command: 'bold', title: 'Bold' },
  { icon: Italic, command: 'italic', title: 'Italic' },
  { icon: Underline, command: 'underline', title: 'Underline' },
  { icon: Strikethrough, command: 'strikeThrough', title: 'Strikethrough' },
  'divider',
  { icon: ListOrdered, command: 'insertOrderedList', title: 'Ordered List' },
  { icon: List, command: 'insertUnorderedList', title: 'Unordered List' },
  { icon: Quote, command: 'formatBlock', arg: 'blockquote', title: 'Blockquote' },
  'divider',
  { icon: Link2, command: 'createLink', title: 'Insert Link' },
  { icon: Eraser, command: 'removeFormat', title: 'Clear Format' },
];

export default function RichTextEditor({
  value,
  onChange,
  label,
  error,
  placeholder = 'Tulis konten di sini...',
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value → editor (only when not from internal input)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (el.innerHTML !== value) {
      el.innerHTML = value ?? '';
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    isInternalChange.current = true;
    onChange(el.innerHTML);
  }, [onChange]);

  const exec = useCallback((command: string, arg?: string) => {
    if (command === 'createLink') {
      const url = prompt('Masukkan URL:');
      if (url) document.execCommand('createLink', false, url);
    } else if (arg) {
      document.execCommand(command, false, arg);
    } else {
      document.execCommand(command, false);
    }
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div
        className={cn(
          'rounded-xl border overflow-hidden bg-white',
          error ? 'border-red-300' : 'border-gray-200',
          'focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100'
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-gray-50 px-2 py-1.5">
          {TOOLBAR.map((item, i) => {
            if (item === 'divider') {
              return <div key={i} className="mx-1 h-5 w-px bg-gray-200" />;
            }
            const Icon = item.icon;
            return (
              <button
                key={item.command + (item.arg ?? '')}
                type="button"
                title={item.title}
                onMouseDown={(e) => {
                  e.preventDefault();
                  exec(item.command, item.arg);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>

        {/* Editable area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          data-placeholder={placeholder}
          className={cn(
            'min-h-[140px] px-4 py-3 text-sm text-gray-800 outline-none',
            'prose prose-sm max-w-none',
            '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&:empty]:before:pointer-events-none'
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
