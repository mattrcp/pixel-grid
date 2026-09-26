'use client';

import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { FillMode } from '@/lib/types';

export function ColorPalettePanel() {
  const { state, dispatch } = useEditor();

  return (
    <Section title="Color">
      <ColorPicker
        label="Active"
        value={state.activeColor}
        onChange={v => dispatch({ type: 'SET_COLOR', color: v })}
      />

      <Slider
        label="Opacity"
        value={state.activeOpacity}
        min={0}
        max={1}
        step={0.05}
        onChange={v => dispatch({ type: 'SET_OPACITY', opacity: v })}
        displayValue={`${Math.round(state.activeOpacity * 100)}%`}
      />

      <div className="flex gap-1.5">
        {(['click', 'drag'] as FillMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => dispatch({ type: 'SET_FILL_MODE', mode })}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
              state.fillMode === mode
                ? 'bg-accent text-white shadow-sm'
                : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
            }`}
          >
            {mode === 'click' ? 'Click' : 'Drag'}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-secondary">Swatches</span>
          <button
            onClick={() => dispatch({ type: 'ADD_SAVED_COLOR', color: state.activeColor })}
            className="text-xs text-accent hover:text-accent/80 font-medium"
          >
            + Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {state.savedColors.map((color, i) => (
            <button
              key={`${color}-${i}`}
              onClick={() => dispatch({ type: 'SET_COLOR', color })}
              onContextMenu={e => {
                e.preventDefault();
                dispatch({ type: 'REMOVE_SAVED_COLOR', index: i });
              }}
              title={`${color} — right-click to remove`}
              className={`h-6 w-6 rounded-md border shadow-sm transition-transform hover:scale-110 ${
                state.activeColor === color ? 'border-accent ring-2 ring-accent/30' : 'border-black/[0.08]'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
