'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors resize-none',
            'focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200',
            className
          )}
          rows={props.rows ?? 4}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
