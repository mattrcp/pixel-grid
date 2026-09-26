'use client';

import { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Section } from '@/components/ui/Section';
import { Toggle } from '@/components/ui/Toggle';
import { ExportFormat, ExportScale } from '@/lib/types';
import { generateSvg } from '@/lib/svg-export';
import { exportPng } from '@/lib/png-export';
import { generateCssBackground } from '@/lib/css-export';
import { saveProject, getProjectList, loadProject, exportProjectJson, importProjectJson, deleteProject } from '@/lib/storage';

export function ExportPanel() {
  const { state, dispatch } = useEditor();
  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState<string[]>(() => getProjectList().map(p => p.name));
  const [showProjects, setShowProjects] = useState(false);

  const handleExport = async () => {
    switch (state.exportFormat) {
      case 'svg': {
        const svg = generateSvg(state.layers, state.gridSettings, state.optimizeSvg);
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        downloadBlob(blob, 'pixel-grid.svg');
        break;
      }
      case 'png': {
        const blob = await exportPng(state.layers, state.gridSettings, state.exportScale);
        downloadBlob(blob, `pixel-grid@${state.exportScale}x.png`);
        break;
      }
      case 'css': {
        const css = generateCssBackground(state.layers, state.gridSettings);
        navigator.clipboard.writeText(css);
        break;
      }
    }
  };

  const handleCopySvg = () => {
    const svg = generateSvg(state.layers, state.gridSettings, state.optimizeSvg);
    navigator.clipboard.writeText(svg);
  };

  const handleSave = () => {
    if (!projectName.trim()) return;
    saveProject(projectName, state);
    setSavedProjects(getProjectList().map(p => p.name));
  };

  const handleLoad = (name: string) => {
    const project = loadProject(name);
    if (!project) return;
    dispatch({
      type: 'LOAD_PROJECT',
      state: {
        ...state,
        gridSettings: project.gridSettings,
        layers: project.layers,
        activeLayerId: project.activeLayerId,
      },
    });
    setShowProjects(false);
  };

  const handleDelete = (name: string) => {
    deleteProject(name);
    setSavedProjects(getProjectList().map(p => p.name));
  };

  const handleExportJson = () => {
    const json = exportProjectJson(state);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, 'pixel-grid-project.json');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const project = importProjectJson(ev.target?.result as string);
      if (project) {
        dispatch({
          type: 'LOAD_PROJECT',
          state: {
            ...state,
            gridSettings: project.gridSettings,
            layers: project.layers,
            activeLayerId: project.activeLayerId,
          },
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Section title="Export">
      <div className="flex gap-1.5">
        {(['svg', 'png', 'css'] as ExportFormat[]).map(fmt => (
          <button
            key={fmt}
            onClick={() => dispatch({ type: 'SET_EXPORT_FORMAT', format: fmt })}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold uppercase transition-all ${
              state.exportFormat === fmt
                ? 'bg-accent text-white shadow-sm'
                : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
            }`}
          >
            {fmt}
          </button>
        ))}
      </div>

      {state.exportFormat === 'png' && (
        <div className="flex gap-1.5">
          {([1, 2, 4] as ExportScale[]).map(scale => (
            <button
              key={scale}
              onClick={() => dispatch({ type: 'SET_EXPORT_SCALE', scale })}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                state.exportScale === scale
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-black/[0.04] text-secondary hover:bg-black/[0.08]'
              }`}
            >
              {scale}x
            </button>
          ))}
        </div>
      )}

      {(state.exportFormat === 'svg' || state.exportFormat === 'css') && (
        <Toggle
          label="Optimize SVG"
          checked={state.optimizeSvg}
          onChange={v => dispatch({ type: 'SET_OPTIMIZE_SVG', optimize: v })}
        />
      )}

      <div className="flex gap-1.5">
        <button
          onClick={handleExport}
          className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent/90 transition-all"
        >
          {state.exportFormat === 'css' ? 'Copy CSS' : 'Download'}
        </button>
        {state.exportFormat !== 'css' && (
          <button
            onClick={handleCopySvg}
            className="rounded-lg bg-black/[0.04] px-3 py-2 text-xs font-medium text-secondary hover:bg-black/[0.08] transition-all"
          >
            Copy SVG
          </button>
        )}
      </div>

      <div className="border-t border-black/[0.06] pt-2.5 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Projects</span>

        <div className="flex gap-1.5">
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="Project name..."
            className="flex-1 h-7 rounded-md border border-black/[0.08] bg-white px-2 text-xs text-primary placeholder:text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
          <button
            onClick={handleSave}
            disabled={!projectName.trim()}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-30 transition-all"
          >
            Save
          </button>
        </div>

        {savedProjects.length > 0 && (
          <div>
            <button
              onClick={() => setShowProjects(!showProjects)}
              className="text-xs text-accent hover:text-accent/80 font-medium"
            >
              {showProjects ? 'Hide' : 'Load'} ({savedProjects.length})
            </button>
            {showProjects && (
              <div className="mt-1.5 space-y-1 max-h-[120px] overflow-y-auto">
                {savedProjects.map(name => (
                  <div key={name} className="flex items-center gap-1.5 rounded-md bg-black/[0.02] px-2 py-1">
                    <button
                      onClick={() => handleLoad(name)}
                      className="flex-1 text-left text-xs text-primary hover:text-accent truncate"
                    >
                      {name}
                    </button>
                    <button
                      onClick={() => handleDelete(name)}
                      className="text-xs text-destructive/60 hover:text-destructive"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-1.5">
          <button
            onClick={handleExportJson}
            className="flex-1 rounded-md bg-black/[0.04] px-2 py-1.5 text-xs font-medium text-secondary hover:bg-black/[0.08] transition-all"
          >
            Export JSON
          </button>
          <label className="flex-1 rounded-md bg-black/[0.04] px-2 py-1.5 text-xs font-medium text-secondary hover:bg-black/[0.08] transition-all text-center cursor-pointer">
            Import JSON
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </div>
    </Section>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
