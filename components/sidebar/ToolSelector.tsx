'use client';

import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { IconButton } from '@/components/ui/IconButton';
import { Tool } from '@/lib/types';

const tools: { tool: Tool; label: string; shortcut: string; icon: React.ReactNode }[] = [
  {
    tool: 'brush',
    label: 'Brush',
    shortcut: 'B',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
        <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
      </svg>
    ),
  },
  {
    tool: 'eraser',
    label: 'Eraser',
    shortcut: 'E',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
        <path d="M22 21H7" />
        <path d="m5 11 9 9" />
      </svg>
    ),
  },
  {
    tool: 'fill',
    label: 'Bucket Fill',
    shortcut: 'G',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" />
        <path d="m5 2 5 5" />
        <path d="M2 13h15" />
        <path d="M22 20a2 2 0 1 1-4 0c0-1.6 2-3 2-3s2 1.4 2 3Z" />
      </svg>
    ),
  },
  {
    tool: 'eyedropper',
    label: 'Eyedropper',
    shortcut: 'I',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 22 1-1h3l9-9" />
        <path d="M3 21v-3l9-9" />
        <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
      </svg>
    ),
  },
  {
    tool: 'select',
    label: 'Select',
    shortcut: 'S',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 4" />
      </svg>
    ),
  },
];

export function ToolSelectorPanel() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useEditor();

  return (
    <Section title="Tools">
      <div className="flex gap-1">
        {tools.map(t => (
          <IconButton
            key={t.tool}
            icon={t.icon}
            label={`${t.label} (${t.shortcut})`}
            active={state.activeTool === t.tool}
            onClick={() => dispatch({ type: 'SET_TOOL', tool: t.tool })}
          />
        ))}
      </div>
      <div className="flex gap-1.5 pt-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex-1 flex items-center justify-center gap-1 rounded-md bg-black/[0.04] px-2 py-1.5 text-xs font-medium text-secondary hover:bg-black/[0.08] disabled:opacity-30 disabled:hover:bg-black/[0.04] transition-all"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex-1 flex items-center justify-center gap-1 rounded-md bg-black/[0.04] px-2 py-1.5 text-xs font-medium text-secondary hover:bg-black/[0.08] disabled:opacity-30 disabled:hover:bg-black/[0.04] transition-all"
        >
          Redo
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>
      </div>
    </Section>
  );
}
