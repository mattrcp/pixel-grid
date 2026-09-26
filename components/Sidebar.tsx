'use client';

import { GridSettingsPanel } from '@/components/sidebar/GridSettings';
import { ColorPalettePanel } from '@/components/sidebar/ColorPalette';
import { ToolSelectorPanel } from '@/components/sidebar/ToolSelector';
import { SymmetryPanel } from '@/components/sidebar/SymmetryPanel';
import { LayerPanel } from '@/components/sidebar/LayerPanel';
import { GradientPanel } from '@/components/sidebar/GradientPanel';
import { BackgroundPanel } from '@/components/sidebar/BackgroundPanel';
import { ExportPanel } from '@/components/sidebar/ExportPanel';

export function Sidebar() {
  return (
    <aside className="w-[300px] min-w-[300px] h-screen flex flex-col bg-sidebar/95 backdrop-blur-xl border-r border-black/[0.06] overflow-y-auto scrollbar-thin">
      <div className="px-4 py-3 border-b border-black/[0.06]">
        <h1 className="text-sm font-semibold text-primary tracking-tight">Pixel Grid</h1>
        <p className="text-[10px] text-tertiary mt-0.5">SVG Generator</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ToolSelectorPanel />
        <GridSettingsPanel />
        <ColorPalettePanel />
        <SymmetryPanel />
        <GradientPanel />
        <LayerPanel />
        <BackgroundPanel />
        <ExportPanel />
      </div>

      <div className="px-4 py-2 border-t border-black/[0.06] text-[10px] text-tertiary">
        Pixel & Rice Studio
      </div>
    </aside>
  );
}
