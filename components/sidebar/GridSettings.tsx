'use client';

import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import { ColorPicker } from '@/components/ui/ColorPicker';

const presets = [
  { label: '8x8', rows: 8, cols: 8 },
  { label: '16x16', rows: 16, cols: 16 },
  { label: '32x32', rows: 32, cols: 32 },
  { label: '64x64', rows: 64, cols: 64 },
];

export function GridSettingsPanel() {
  const { state, dispatch } = useEditor();
  const { gridSettings } = state;

  return (
    <Section title="Grid">
      <div className="flex gap-1.5">
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => dispatch({ type: 'RESIZE_GRID', rows: p.rows, cols: p.cols })}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
              gridSettings.rows === p.rows && gridSettings.cols === p.cols
                ? 'bg-accent text-white shadow-sm'
                : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-secondary">Rows</label>
          <input
            type="number"
            min={1}
            max={128}
            value={gridSettings.rows}
            onChange={e => dispatch({ type: 'RESIZE_GRID', rows: Number(e.target.value) || 1, cols: gridSettings.cols })}
            className="h-7 w-full rounded-md border border-black/[0.08] bg-white px-2 text-xs text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs text-secondary">Cols</label>
          <input
            type="number"
            min={1}
            max={128}
            value={gridSettings.cols}
            onChange={e => dispatch({ type: 'RESIZE_GRID', rows: gridSettings.rows, cols: Number(e.target.value) || 1 })}
            className="h-7 w-full rounded-md border border-black/[0.08] bg-white px-2 text-xs text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        </div>
      </div>

      <Slider
        label="Pixel Size"
        value={gridSettings.pixelSize}
        min={4}
        max={48}
        step={2}
        onChange={v => dispatch({ type: 'SET_GRID_SETTINGS', settings: { pixelSize: v } })}
        displayValue={`${gridSettings.pixelSize}px`}
      />

      <Toggle
        label="Grid Lines"
        checked={gridSettings.showGridLines}
        onChange={v => dispatch({ type: 'SET_GRID_SETTINGS', settings: { showGridLines: v } })}
      />

      {gridSettings.showGridLines && (
        <>
          <ColorPicker
            label="Line Color"
            value={gridSettings.gridLineColor}
            onChange={v => dispatch({ type: 'SET_GRID_SETTINGS', settings: { gridLineColor: v } })}
          />
          <Slider
            label="Line Opacity"
            value={gridSettings.gridLineOpacity}
            min={0}
            max={1}
            step={0.05}
            onChange={v => dispatch({ type: 'SET_GRID_SETTINGS', settings: { gridLineOpacity: v } })}
            displayValue={`${Math.round(gridSettings.gridLineOpacity * 100)}%`}
          />
        </>
      )}

      <ColorPicker
        label="Canvas BG"
        value={gridSettings.canvasBackground}
        onChange={v => dispatch({ type: 'SET_GRID_SETTINGS', settings: { canvasBackground: v } })}
      />

      <button
        onClick={() => {
          state.layers.forEach(l => dispatch({ type: 'CLEAR_LAYER', layerId: l.id }));
        }}
        className="w-full rounded-md bg-black/[0.04] px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-all"
      >
        Clear Grid
      </button>
    </Section>
  );
}
