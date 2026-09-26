'use client';

import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { Slider } from '@/components/ui/Slider';
import { IconButton } from '@/components/ui/IconButton';

export function LayerPanel() {
  const { state, dispatch } = useEditor();

  return (
    <Section title="Layers">
      <div className="flex gap-1.5 pb-1">
        <button
          onClick={() => dispatch({ type: 'ADD_LAYER' })}
          className="flex-1 rounded-md bg-black/[0.04] px-2 py-1.5 text-xs font-medium text-secondary hover:bg-black/[0.08] transition-all"
        >
          + Add Layer
        </button>
      </div>

      <div className="space-y-1 max-h-[200px] overflow-y-auto">
        {[...state.layers].reverse().map(layer => {
          const isActive = layer.id === state.activeLayerId;
          return (
            <div
              key={layer.id}
              onClick={() => dispatch({ type: 'SET_ACTIVE_LAYER', layerId: layer.id })}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-all ${
                isActive ? 'bg-accent/10 ring-1 ring-accent/20' : 'hover:bg-black/[0.03]'
              }`}
            >
              <IconButton
                size="sm"
                icon={
                  layer.visible ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )
                }
                label={layer.visible ? 'Hide layer' : 'Show layer'}
                onClick={() => dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', layerId: layer.id })}
              />

              <input
                type="text"
                value={layer.name}
                onChange={e => dispatch({ type: 'RENAME_LAYER', layerId: layer.id, name: e.target.value })}
                onClick={e => e.stopPropagation()}
                className={`flex-1 bg-transparent text-xs font-medium focus:outline-none ${
                  isActive ? 'text-accent' : 'text-primary'
                }`}
              />

              {state.layers.length > 1 && (
                <IconButton
                  size="sm"
                  variant="danger"
                  icon={
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  }
                  label="Delete layer"
                  onClick={() => dispatch({ type: 'REMOVE_LAYER', layerId: layer.id })}
                />
              )}
            </div>
          );
        })}
      </div>

      {state.layers.find(l => l.id === state.activeLayerId) && (
        <Slider
          label="Layer Opacity"
          value={state.layers.find(l => l.id === state.activeLayerId)!.opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={v => dispatch({ type: 'SET_LAYER_OPACITY', layerId: state.activeLayerId, opacity: v })}
          displayValue={`${Math.round((state.layers.find(l => l.id === state.activeLayerId)!.opacity) * 100)}%`}
        />
      )}

      <button
        onClick={() => dispatch({ type: 'CLEAR_LAYER', layerId: state.activeLayerId })}
        className="w-full rounded-md bg-black/[0.04] px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-all"
      >
        Clear Layer
      </button>
    </Section>
  );
}
