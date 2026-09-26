'use client';

import { useRef, useCallback, useState, useEffect, useMemo, memo } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Pixel, Layer } from '@/lib/types';

const LayerRenderer = memo(function LayerRenderer({ layer, pixelSize }: { layer: Layer; pixelSize: number }) {
  if (!layer.visible) return null;
  return (
    <g opacity={layer.opacity}>
      {layer.data.map((rowData, r) =>
        rowData.map((pixel, c) => {
          if (!pixel) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * pixelSize}
              y={r * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={pixel.color}
              opacity={pixel.opacity}
            />
          );
        })
      )}
    </g>
  );
});

const GridLines = memo(function GridLines({
  rows, cols, pixelSize, color, opacity
}: { rows: number; cols: number; pixelSize: number; color: string; opacity: number }) {
  const width = cols * pixelSize;
  const height = rows * pixelSize;
  return (
    <g stroke={color} strokeOpacity={opacity} strokeWidth={0.5}>
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i * pixelSize} y1={0} x2={i * pixelSize} y2={height} />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * pixelSize} x2={width} y2={i * pixelSize} />
      ))}
    </g>
  );
});

export function Canvas() {
  const { state, dispatch } = useEditor();
  const { gridSettings, layers, activeLayerId, activeTool, activeColor, activeOpacity, symmetryMode, background, selection } = state;
  const { rows, cols, pixelSize, showGridLines, gridLineColor, gridLineOpacity, canvasBackground } = gridSettings;

  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ row: number; col: number } | null>(null);
  const lastCellRef = useRef<string | null>(null);

  const width = cols * pixelSize;
  const height = rows * pixelSize;

  const getCellFromEvent = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const col = Math.floor((x * scaleX) / pixelSize);
    const row = Math.floor((y * scaleY) / pixelSize);
    if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
    return { row, col };
  }, [width, height, pixelSize, rows, cols]);

  const getSymmetryTargets = useCallback((row: number, col: number) => {
    const targets = [{ row, col }];
    if (symmetryMode === 'horizontal' || symmetryMode === 'both') {
      targets.push({ row, col: cols - 1 - col });
    }
    if (symmetryMode === 'vertical' || symmetryMode === 'both') {
      targets.push({ row: rows - 1 - row, col });
    }
    if (symmetryMode === 'both') {
      targets.push({ row: rows - 1 - row, col: cols - 1 - col });
    }
    return targets;
  }, [symmetryMode, rows, cols]);

  const applyTool = useCallback((row: number, col: number) => {
    const cellKey = `${row},${col}`;
    if (lastCellRef.current === cellKey) return;
    lastCellRef.current = cellKey;

    switch (activeTool) {
      case 'brush': {
        const pixel: Pixel = { color: activeColor, opacity: activeOpacity };
        const targets = getSymmetryTargets(row, col);
        dispatch({
          type: 'SET_PIXELS',
          layerId: activeLayerId,
          pixels: targets.map(t => ({ ...t, pixel })),
        });
        break;
      }
      case 'eraser': {
        const targets = getSymmetryTargets(row, col);
        dispatch({
          type: 'SET_PIXELS',
          layerId: activeLayerId,
          pixels: targets.map(t => ({ ...t, pixel: null })),
        });
        break;
      }
      case 'fill': {
        dispatch({
          type: 'FLOOD_FILL',
          layerId: activeLayerId,
          row,
          col,
          color: activeColor,
          opacity: activeOpacity,
        });
        break;
      }
      case 'eyedropper': {
        const layer = layers.find(l => l.id === activeLayerId);
        const pixel = layer?.data[row]?.[col];
        if (pixel) {
          dispatch({ type: 'SET_COLOR', color: pixel.color });
          dispatch({ type: 'SET_OPACITY', opacity: pixel.opacity });
        }
        break;
      }
    }
  }, [activeTool, activeColor, activeOpacity, activeLayerId, getSymmetryTargets, dispatch, layers]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const cell = getCellFromEvent(e);
    if (!cell) return;

    if (activeTool === 'select') {
      setSelectionStart(cell);
      dispatch({ type: 'SET_SELECTION', selection: { startRow: cell.row, startCol: cell.col, endRow: cell.row, endCol: cell.col } });
    } else {
      setIsDrawing(true);
      lastCellRef.current = null;
      applyTool(cell.row, cell.col);
    }
  }, [getCellFromEvent, activeTool, applyTool, dispatch]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const cell = getCellFromEvent(e);
    if (!cell) return;

    if (activeTool === 'select' && selectionStart) {
      dispatch({
        type: 'SET_SELECTION',
        selection: { startRow: selectionStart.row, startCol: selectionStart.col, endRow: cell.row, endCol: cell.col },
      });
    } else if (isDrawing && (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'fill')) {
      applyTool(cell.row, cell.col);
    }
  }, [getCellFromEvent, isDrawing, activeTool, applyTool, selectionStart, dispatch]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setSelectionStart(null);
    lastCellRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const cursorMap: Record<string, string> = {
    brush: 'crosshair',
    eraser: 'crosshair',
    fill: 'crosshair',
    eyedropper: 'copy',
    select: 'crosshair',
  };

  const selectionOverlay = useMemo(() => {
    if (!selection) return null;
    return (
      <rect
        x={Math.min(selection.startCol, selection.endCol) * pixelSize}
        y={Math.min(selection.startRow, selection.endRow) * pixelSize}
        width={(Math.abs(selection.endCol - selection.startCol) + 1) * pixelSize}
        height={(Math.abs(selection.endRow - selection.startRow) + 1) * pixelSize}
        fill="none"
        stroke="#007AFF"
        strokeWidth={2}
        strokeDasharray="4 4"
        className="pointer-events-none"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="8" dur="0.4s" repeatCount="indefinite" />
      </rect>
    );
  }, [selection, pixelSize]);

  const symmetryLines = useMemo(() => {
    if (symmetryMode === 'none') return null;
    return (
      <g stroke="#007AFF" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="4 4">
        {(symmetryMode === 'horizontal' || symmetryMode === 'both') && (
          <line x1={width / 2} y1={0} x2={width / 2} y2={height} />
        )}
        {(symmetryMode === 'vertical' || symmetryMode === 'both') && (
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} />
        )}
      </g>
    );
  }, [symmetryMode, width, height]);

  return (
    <div className="flex-1 flex items-center justify-center overflow-auto bg-[#E8E8ED] p-8">
      <div className="relative rounded-xl shadow-lg overflow-hidden" style={{ maxWidth: '100%', maxHeight: '100%' }}>
        {background.image && (
          <img
            src={background.image}
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              opacity: background.opacity,
              objectFit: background.fit === 'tile' ? undefined : background.fit,
            }}
            draggable={false}
          />
        )}
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          style={{ cursor: cursorMap[activeTool] ?? 'default', display: 'block' }}
          className="select-none"
          role="application"
          aria-label="Pixel grid canvas"
          tabIndex={0}
        >
          <rect width={width} height={height} fill={canvasBackground} />

          {layers.map(layer => (
            <LayerRenderer key={layer.id} layer={layer} pixelSize={pixelSize} />
          ))}

          {showGridLines && (
            <GridLines
              rows={rows}
              cols={cols}
              pixelSize={pixelSize}
              color={gridLineColor}
              opacity={gridLineOpacity}
            />
          )}

          {selectionOverlay}
          {symmetryLines}
        </svg>
      </div>
    </div>
  );
}
