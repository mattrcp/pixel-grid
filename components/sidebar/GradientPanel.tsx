'use client';

import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { ColorPicker } from '@/components/ui/ColorPicker';

const directions = [
  { value: 'horizontal' as const, label: 'H' },
  { value: 'vertical' as const, label: 'V' },
  { value: 'diagonal' as const, label: 'D' },
];

export function GradientPanel() {
  const { state, dispatch } = useEditor();

  const canApply = state.selection !== null;

  const handleApply = () => {
    if (!state.selection) return;
    dispatch({
      type: 'APPLY_GRADIENT',
      layerId: state.activeLayerId,
      selection: state.selection,
      gradient: state.gradient,
    });
  };

  return (
    <Section title="Gradient" defaultOpen={false}>
      <ColorPicker
        label="Start"
        value={state.gradient.startColor}
        onChange={v => dispatch({ type: 'SET_GRADIENT', gradient: { startColor: v } })}
      />
      <ColorPicker
        label="End"
        value={state.gradient.endColor}
        onChange={v => dispatch({ type: 'SET_GRADIENT', gradient: { endColor: v } })}
      />

      <div className="flex gap-1.5">
        {directions.map(d => (
          <button
            key={d.value}
            onClick={() => dispatch({ type: 'SET_GRADIENT', gradient: { direction: d.value } })}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
              state.gradient.direction === d.value
                ? 'bg-accent text-white shadow-sm'
                : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleApply}
        disabled={!canApply}
        className="w-full rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent/90 disabled:opacity-30 transition-all"
      >
        {canApply ? 'Apply Gradient' : 'Select area first (S)'}
      </button>
    </Section>
  );
}
