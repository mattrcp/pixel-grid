'use client';

import { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import { createRng, hashSeed, generateRandomSeed } from '@/lib/seeded-random';
import { Pixel } from '@/lib/types';

type FillRegion = 'full' | 'selection' | 'shape';
type ShapeFill = 'inside' | 'border' | 'outside';

export function RandomFillPanel() {
  const { state, dispatch } = useEditor();
  const [seed, setSeed] = useState(() => generateRandomSeed());
  const [density, setDensity] = useState(0.3);
  const [useSwatches, setUseSwatches] = useState(true);

  // Region
  const [fillRegion, setFillRegion] = useState<FillRegion>('full');

  // Shape settings
  const [shapeX, setShapeX] = useState(4);
  const [shapeY, setShapeY] = useState(4);
  const [shapeW, setShapeW] = useState(16);
  const [shapeH, setShapeH] = useState(16);
  const [shapeFill, setShapeFill] = useState<ShapeFill>('inside');
  const [borderWidth, setBorderWidth] = useState(2);

  const getColors = (rng: () => number) => {
    const colors = useSwatches && state.savedColors.length > 0
      ? state.savedColors
      : [state.activeColor];
    return () => colors[Math.floor(rng() * colors.length)];
  };

  const isInRegion = (r: number, c: number, rows: number, cols: number): boolean => {
    if (fillRegion === 'full') return true;

    if (fillRegion === 'selection') {
      const sel = state.selection;
      if (!sel) return true; // fallback to full if no selection
      const minR = Math.min(sel.startRow, sel.endRow);
      const maxR = Math.max(sel.startRow, sel.endRow);
      const minC = Math.min(sel.startCol, sel.endCol);
      const maxC = Math.max(sel.startCol, sel.endCol);
      return r >= minR && r <= maxR && c >= minC && c <= maxC;
    }

    if (fillRegion === 'shape') {
      const x1 = shapeX;
      const y1 = shapeY;
      const x2 = shapeX + shapeW - 1;
      const y2 = shapeY + shapeH - 1;

      const isInside = r >= y1 && r <= y2 && c >= x1 && c <= x2;

      const distToEdge = Math.min(
        r - y1, y2 - r,
        c - x1, x2 - c
      );
      const isOnBorder = isInside && distToEdge < borderWidth;

      const distOutside = Math.max(
        y1 - r, r - y2,
        x1 - c, c - x2,
        0
      );
      const isNearOutside = !isInside && distOutside > 0 && distOutside <= borderWidth;

      switch (shapeFill) {
        case 'inside':
          return isInside;
        case 'border':
          return isOnBorder || isNearOutside;
        case 'outside':
          return !isInside;
      }
    }

    return true;
  };

  const handleGenerate = () => {
    const { rows, cols } = state.gridSettings;
    const rng = createRng(hashSeed(seed));
    const pickColor = getColors(rng);

    const pixels: { row: number; col: number; pixel: Pixel | null }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const inRegion = isInRegion(r, c, rows, cols);
        if (inRegion && rng() < density) {
          pixels.push({ row: r, col: c, pixel: { color: pickColor(), opacity: state.activeOpacity } });
        } else if (inRegion) {
          pixels.push({ row: r, col: c, pixel: null });
        }
        // skip cells outside region — leave them untouched
        if (!inRegion) {
          // still advance rng to keep deterministic
          rng();
        }
      }
    }

    dispatch({ type: 'SET_PIXELS', layerId: state.activeLayerId, pixels });
  };

  const handleNewSeed = () => {
    setSeed(generateRandomSeed());
  };

  const maxDim = Math.max(state.gridSettings.rows, state.gridSettings.cols);

  return (
    <Section title="Random Fill" defaultOpen={false}>
      <div className="space-y-1">
        <label className="text-xs text-secondary">Seed</label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={seed}
            onChange={e => setSeed(e.target.value)}
            className="flex-1 h-7 rounded-md border border-black/[0.08] bg-white px-2 text-xs font-mono text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
          <button
            onClick={handleNewSeed}
            title="New random seed"
            className="h-7 w-7 flex items-center justify-center rounded-md bg-black/[0.04] text-secondary hover:bg-black/[0.08] transition-all"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>
      </div>

      <Slider
        label="Density"
        value={density}
        min={0.05}
        max={1}
        step={0.05}
        onChange={setDensity}
        displayValue={`${Math.round(density * 100)}%`}
      />

      <Toggle
        label="Use swatch colors"
        checked={useSwatches}
        onChange={setUseSwatches}
      />

      {!useSwatches && (
        <p className="text-[10px] text-tertiary">Uses active color only</p>
      )}

      {/* Region selector */}
      <div className="space-y-1">
        <label className="text-xs text-secondary">Region</label>
        <div className="flex gap-1">
          {([
            { value: 'full' as FillRegion, label: 'Full' },
            { value: 'selection' as FillRegion, label: 'Selection' },
            { value: 'shape' as FillRegion, label: 'Shape' },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setFillRegion(opt.value)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                fillRegion === opt.value
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {fillRegion === 'selection' && !state.selection && (
        <p className="text-[10px] text-amber-600">Use Select tool (S) to define area first</p>
      )}

      {/* Shape controls */}
      {fillRegion === 'shape' && (
        <div className="space-y-2 pt-1 border-t border-black/[0.04]">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-tertiary">X</label>
              <input
                type="number"
                min={0}
                max={state.gridSettings.cols - 1}
                value={shapeX}
                onChange={e => setShapeX(Number(e.target.value) || 0)}
                className="h-6 w-full rounded border border-black/[0.08] bg-white px-1.5 text-[11px] text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-tertiary">Y</label>
              <input
                type="number"
                min={0}
                max={state.gridSettings.rows - 1}
                value={shapeY}
                onChange={e => setShapeY(Number(e.target.value) || 0)}
                className="h-6 w-full rounded border border-black/[0.08] bg-white px-1.5 text-[11px] text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-tertiary">W</label>
              <input
                type="number"
                min={1}
                max={state.gridSettings.cols}
                value={shapeW}
                onChange={e => setShapeW(Number(e.target.value) || 1)}
                className="h-6 w-full rounded border border-black/[0.08] bg-white px-1.5 text-[11px] text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-tertiary">H</label>
              <input
                type="number"
                min={1}
                max={state.gridSettings.rows}
                value={shapeH}
                onChange={e => setShapeH(Number(e.target.value) || 1)}
                className="h-6 w-full rounded border border-black/[0.08] bg-white px-1.5 text-[11px] text-primary focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-secondary">Fill area</label>
            <div className="flex gap-1">
              {([
                { value: 'inside' as ShapeFill, label: 'Inside' },
                { value: 'border' as ShapeFill, label: 'Border' },
                { value: 'outside' as ShapeFill, label: 'Outside' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setShapeFill(opt.value)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                    shapeFill === opt.value
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {shapeFill === 'border' && (
            <Slider
              label="Border width"
              value={borderWidth}
              min={1}
              max={Math.floor(maxDim / 2)}
              step={1}
              onChange={setBorderWidth}
              displayValue={`${borderWidth}px`}
            />
          )}
        </div>
      )}

      <div className="flex gap-1.5">
        <button
          onClick={handleGenerate}
          className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent/90 transition-all"
        >
          Generate
        </button>
        <button
          onClick={handleGenerate}
          className="rounded-lg bg-black/[0.04] px-3 py-2 text-xs font-medium text-secondary hover:bg-black/[0.08] transition-all"
          title="Same seed, regenerate"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
      </div>

      <p className="text-[10px] text-tertiary">Same seed + settings = same pattern</p>
    </Section>
  );
}
