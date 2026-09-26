'use client';

import { useState } from 'react';
import { PixelRipple } from '@/components/PixelRipple';

export default function RipplePage() {
  const [color, setColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#0a0a0a');
  const [transparent, setTransparent] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [duration, setDuration] = useState(800);
  const [trailLength, setTrailLength] = useState(8);
  const [showControls, setShowControls] = useState(true);

  return (
    <>
      <PixelRipple
        color={color}
        backgroundColor={transparent ? 'transparent' : bgColor}
        fontSize={fontSize}
        duration={duration}
        trailLength={trailLength}
      />

      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed top-4 right-4 z-50 h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-xl text-white/60 hover:text-white hover:bg-white/20 transition-all text-xs"
        title="Toggle controls"
      >
        {showControls ? '×' : '⚙'}
      </button>

      {showControls && (
        <div className="fixed top-4 right-14 z-50 w-[220px] rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 p-4 space-y-3 text-white">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">Pixel Ripple</h2>

          <div className="space-y-1">
            <label className="text-[11px] text-white/40">Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-6 w-6 rounded cursor-pointer bg-transparent border-0" />
              <span className="text-[11px] font-mono text-white/60">{color}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-white/40">Background</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} disabled={transparent} className="h-6 w-6 rounded cursor-pointer bg-transparent border-0 disabled:opacity-30" />
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={transparent} onChange={e => setTransparent(e.target.checked)} className="rounded" />
                <span className="text-[11px] text-white/60">Transparent</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-[11px] text-white/40">Font Size</label>
              <span className="text-[11px] font-mono text-white/40">{fontSize}px</span>
            </div>
            <input type="range" min={8} max={24} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-white/60" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-[11px] text-white/40">Duration</label>
              <span className="text-[11px] font-mono text-white/40">{duration}ms</span>
            </div>
            <input type="range" min={300} max={2000} step={100} value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full accent-white/60" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-[11px] text-white/40">Trail Length</label>
              <span className="text-[11px] font-mono text-white/40">{trailLength}</span>
            </div>
            <input type="range" min={2} max={20} value={trailLength} onChange={e => setTrailLength(Number(e.target.value))} className="w-full accent-white/60" />
          </div>

          <p className="text-[10px] text-white/20 pt-1">Click to ripple. Move to trail.</p>
        </div>
      )}
    </>
  );
}
