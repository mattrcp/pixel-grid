'use client';

import { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { Slider } from '@/components/ui/Slider';
import { createRng, hashSeed, generateRandomSeed } from '@/lib/seeded-random';
import { Pixel } from '@/lib/types';

export function RandomFillPanel() {
  const { state, dispatch } = useEditor();
  const [seed, setSeed] = useState(() => generateRandomSeed());
  const [density, setDensity] = useState(0.3);
  const [useSwatches, setUseSwatches] = useState(true);

  const handleGenerate = () => {
    const { rows, cols } = state.gridSettings;
    const rng = createRng(hashSeed(seed));

    const colors = useSwatches && state.savedColors.length > 0
      ? state.savedColors
      : [state.activeColor];

    const pixels: { row: number; col: number; pixel: Pixel | null }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rng() < density) {
          const color = colors[Math.floor(rng() * colors.length)];
          const opacity = state.activeOpacity;
          pixels.push({ row: r, col: c, pixel: { color, opacity } });
        } else {
          pixels.push({ row: r, col: c, pixel: null });
        }
      }
    }

    dispatch({ type: 'SET_PIXELS', layerId: state.activeLayerId, pixels });
  };

  const handleNewSeed = () => {
    setSeed(generateRandomSeed());
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

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

      <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-xs text-secondary group-hover:text-primary transition-colors">Use swatch colors</span>
        <button
          role="switch"
          aria-checked={useSwatches}
          onClick={() => setUseSwatches(!useSwatches)}
          className={`relative h-[22px] w-[38px] rounded-full transition-colors duration-200 ${
            useSwatches ? 'bg-accent' : 'bg-black/[0.09]'
          }`}
        >
          <span
            className={`absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
              useSwatches ? 'translate-x-[16px]' : 'translate-x-0'
            }`}
          />
        </button>
      </label>

      {!useSwatches && (
        <p className="text-[10px] text-tertiary">Uses active color only</p>
      )}

      <div className="flex gap-1.5">
        <button
          onClick={handleGenerate}
          className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent/90 transition-all"
        >
          Generate
        </button>
        <button
          onClick={handleRegenerate}
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
