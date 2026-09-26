'use client';

import { useState } from 'react';

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Section({ title, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-secondary hover:bg-black/[0.02] transition-colors"
      >
        {title}
        <svg
          className={`h-3 w-3 text-tertiary transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${open ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pb-3 pt-1 space-y-2.5">
          {children}
        </div>
      </div>
    </div>
  );
}
