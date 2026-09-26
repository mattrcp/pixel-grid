'use client';

import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { SymmetryMode } from '@/lib/types';

const modes: { mode: SymmetryMode; label: string; icon: React.ReactNode }[] = [
  {
    mode: 'none',
    label: 'Off',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    ),
  },
  {
    mode: 'horizontal',
    label: 'H',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="3 3" />
        <rect x="4" y="8" width="5" height="8" rx="1" />
        <rect x="15" y="8" width="5" height="8" rx="1" />
      </svg>
    ),
  },
  {
    mode: 'vertical',
    label: 'V',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="3 3" />
        <rect x="8" y="4" width="8" height="5" rx="1" />
        <rect x="8" y="15" width="8" height="5" rx="1" />
      </svg>
    ),
  },
  {
    mode: 'both',
    label: 'Both',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="3 3" />
        <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="3 3" />
      </svg>
    ),
  },
];

export function SymmetryPanel() {
  const { state, dispatch } = useEditor();

  return (
    <Section title="Symmetry" defaultOpen={false}>
      <div className="flex gap-1">
        {modes.map(m => (
          <button
            key={m.mode}
            onClick={() => dispatch({ type: 'SET_SYMMETRY', mode: m.mode })}
            title={m.label}
            className={`flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-all ${
              state.symmetryMode === m.mode
                ? 'bg-accent text-white shadow-sm'
                : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
            }`}
          >
            {m.icon}
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
      </div>
    </Section>
  );
}
