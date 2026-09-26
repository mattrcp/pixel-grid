'use client';

import { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { Slider } from '@/components/ui/Slider';
import { Pixel } from '@/lib/types';

type FillRegion = 'full' | 'selection' | 'shape';
type ShapeType = 'rectangle' | 'circle' | 'triangle';
type ShapeFill = 'inside' | 'border' | 'outside';

function distToShape(
  r: number, c: number,
  shapeType: ShapeType,
  x: number, y: number, w: number, h: number
): number {
  switch (shapeType) {
    case 'rectangle': {
      const x2 = x + w - 1;
      const y2 = y + h - 1;
      if (r >= y && r <= y2 && c >= x && c <= x2) {
        return -Math.min(r - y, y2 - r, c - x, x2 - c);
      }
      const dr = r < y ? y - r : r > y2 ? r - y2 : 0;
      const dc = c < x ? x - c : c > x2 ? c - x2 : 0;
      return Math.max(dr, dc);
    }

    case 'circle': {
      const cx = x + (w - 1) / 2;
      const cy = y + (h - 1) / 2;
      const rx = (w - 1) / 2;
      const ry = (h - 1) / 2;
      if (rx <= 0 || ry <= 0) return Infinity;
      const ndx = (c - cx) / rx;
      const ndy = (r - cy) / ry;
      const nd = Math.sqrt(ndx * ndx + ndy * ndy);
      const avgR = (rx + ry) / 2;
      return (nd - 1) * avgR;
    }

    case 'triangle': {
      const topX = x + (w - 1) / 2;
      const topY = y;
      const blX = x;
      const blY = y + h - 1;
      const brX = x + w - 1;
      const brY = y + h - 1;

      const v0x = brX - blX, v0y = brY - blY;
      const v1x = topX - blX, v1y = topY - blY;
      const v2x = c - blX, v2y = r - blY;

      const dot00 = v0x * v0x + v0y * v0y;
      const dot01 = v0x * v1x + v0y * v1y;
      const dot02 = v0x * v2x + v0y * v2y;
      const dot11 = v1x * v1x + v1y * v1y;
      const dot12 = v1x * v2x + v1y * v2y;

      const inv = 1 / (dot00 * dot11 - dot01 * dot01);
      const u = (dot11 * dot02 - dot01 * dot12) * inv;
      const v = (dot00 * dot12 - dot01 * dot02) * inv;

      const inside = u >= 0 && v >= 0 && (u + v) <= 1;

      const edges: [number, number, number, number][] = [
        [blX, blY, brX, brY],
        [brX, brY, topX, topY],
        [topX, topY, blX, blY],
      ];
      let minDist = Infinity;
      for (const [ax, ay, bx, by] of edges) {
        const d = pointToSegDist(c, r, ax, ay, bx, by);
        if (d < minDist) minDist = d;
      }
      return inside ? -minDist : minDist;
    }
  }
}

function pointToSegDist(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): number {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt((px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2);
}

export function RandomFillPanel() {
  const { state, dispatch } = useEditor();
  const [density, setDensity] = useState(0.3);
  const [colorMode, setColorMode] = useState<'black' | 'color' | 'swatches'>('black');

  const [fillRegion, setFillRegion] = useState<FillRegion>('full');

  const [shapeType, setShapeType] = useState<ShapeType>('rectangle');
  const [shapeX, setShapeX] = useState(4);
  const [shapeY, setShapeY] = useState(4);
  const [shapeW, setShapeW] = useState(16);
  const [shapeH, setShapeH] = useState(16);
  const [shapeFill, setShapeFill] = useState<ShapeFill>('inside');
  const [borderWidth, setBorderWidth] = useState(2);

  const isInRegion = (r: number, c: number): boolean => {
    if (fillRegion === 'full') return true;

    if (fillRegion === 'selection') {
      const sel = state.selection;
      if (!sel) return true;
      const minR = Math.min(sel.startRow, sel.endRow);
      const maxR = Math.max(sel.startRow, sel.endRow);
      const minC = Math.min(sel.startCol, sel.endCol);
      const maxC = Math.max(sel.startCol, sel.endCol);
      return r >= minR && r <= maxR && c >= minC && c <= maxC;
    }

    if (fillRegion === 'shape') {
      const d = distToShape(r, c, shapeType, shapeX, shapeY, shapeW, shapeH);
      switch (shapeFill) {
        case 'inside': return d <= 0;
        case 'border': return Math.abs(d) <= borderWidth;
        case 'outside': return d > 0;
      }
    }

    return true;
  };

  const handleGenerate = () => {
    const { rows, cols } = state.gridSettings;
    const colors = colorMode === 'black'
      ? ['#000000']
      : colorMode === 'swatches' && state.savedColors.length > 0
        ? state.savedColors
        : [state.activeColor];

    const pixels: { row: number; col: number; pixel: Pixel | null }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!isInRegion(r, c)) continue;
        if (Math.random() < density) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          pixels.push({ row: r, col: c, pixel: { color, opacity: state.activeOpacity } });
        } else {
          pixels.push({ row: r, col: c, pixel: null });
        }
      }
    }

    dispatch({ type: 'SET_PIXELS', layerId: state.activeLayerId, pixels });
  };

  const maxDim = Math.max(state.gridSettings.rows, state.gridSettings.cols);

  return (
    <Section title="Random Fill" defaultOpen={false}>
      <Slider
        label="Density"
        value={density}
        min={0.05}
        max={1}
        step={0.05}
        onChange={setDensity}
        displayValue={`${Math.round(density * 100)}%`}
      />

      <div className="space-y-1">
        <label className="text-xs text-secondary">Color</label>
        <div className="flex gap-1">
          {([
            { value: 'black' as const, label: 'Black' },
            { value: 'color' as const, label: 'Active' },
            { value: 'swatches' as const, label: 'Swatches' },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setColorMode(opt.value)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                colorMode === opt.value
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Region */}
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
          <div className="space-y-1">
            <label className="text-xs text-secondary">Shape</label>
            <div className="flex gap-1">
              {([
                {
                  value: 'rectangle' as ShapeType,
                  label: 'Rect',
                  icon: (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="5" width="18" height="14" rx="1" />
                    </svg>
                  ),
                },
                {
                  value: 'circle' as ShapeType,
                  label: 'Circle',
                  icon: (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  ),
                },
                {
                  value: 'triangle' as ShapeType,
                  label: 'Tri',
                  icon: (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
                      <polygon points="12,3 22,21 2,21" />
                    </svg>
                  ),
                },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setShapeType(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                    shapeType === opt.value
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-tertiary">X</label>
              <input type="number" min={0} max={state.gridSettings.cols - 1} value={shapeX}
                onChange={e => setShapeX(Number(e.target.value) || 0)}
                className="h-6 w-full rounded border border-black/[0.08] bg-white px-1.5 text-[11px] text-primary focus:border-accent focus:outline-none" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-tertiary">Y</label>
              <input type="number" min={0} max={state.gridSettings.rows - 1} value={shapeY}
                onChange={e => setShapeY(Number(e.target.value) || 0)}
                className="h-6 w-full rounded border border-black/[0.08] bg-white px-1.5 text-[11px] text-primary focus:border-accent focus:outline-none" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-tertiary">W</label>
              <input type="number" min={1} max={state.gridSettings.cols} value={shapeW}
                onChange={e => setShapeW(Number(e.target.value) || 1)}
                className="h-6 w-full rounded border border-black/[0.08] bg-white px-1.5 text-[11px] text-primary focus:border-accent focus:outline-none" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-tertiary">H</label>
              <input type="number" min={1} max={state.gridSettings.rows} value={shapeH}
                onChange={e => setShapeH(Number(e.target.value) || 1)}
                className="h-6 w-full rounded border border-black/[0.08] bg-white px-1.5 text-[11px] text-primary focus:border-accent focus:outline-none" />
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

      <button
        onClick={handleGenerate}
        className="w-full rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent/90 transition-all"
      >
        Randomize
      </button>
    </Section>
  );
}
