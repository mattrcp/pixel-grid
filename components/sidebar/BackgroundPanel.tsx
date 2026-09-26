'use client';

import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { Slider } from '@/components/ui/Slider';
import { BackgroundFit } from '@/lib/types';

export function BackgroundPanel() {
  const { state, dispatch } = useEditor();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      dispatch({ type: 'SET_BACKGROUND', background: { image: ev.target?.result as string } });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Section title="Background" defaultOpen={false}>
      <label className="flex items-center justify-center rounded-lg border-2 border-dashed border-black/[0.08] py-3 cursor-pointer hover:border-accent/30 hover:bg-accent/[0.02] transition-all">
        <span className="text-xs text-secondary">
          {state.background.image ? 'Change Image' : 'Upload Image'}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>

      {state.background.image && (
        <>
          <Slider
            label="Opacity"
            value={state.background.opacity}
            min={0}
            max={1}
            step={0.05}
            onChange={v => dispatch({ type: 'SET_BACKGROUND', background: { opacity: v } })}
            displayValue={`${Math.round(state.background.opacity * 100)}%`}
          />

          <div className="flex gap-1.5">
            {(['cover', 'contain', 'tile'] as BackgroundFit[]).map(fit => (
              <button
                key={fit}
                onClick={() => dispatch({ type: 'SET_BACKGROUND', background: { fit } })}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-all ${
                  state.background.fit === fit
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
                }`}
              >
                {fit}
              </button>
            ))}
          </div>

          <button
            onClick={() => dispatch({ type: 'SET_BACKGROUND', background: { image: null } })}
            className="w-full rounded-md bg-black/[0.04] px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            Remove Image
          </button>
        </>
      )}
    </Section>
  );
}
