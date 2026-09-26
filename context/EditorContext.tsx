'use client';

import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { EditorState, EditorAction, GridData, Layer } from '@/lib/types';
import { floodFill } from '@/lib/flood-fill';
import { applyGradient } from '@/lib/gradient';

function createEmptyGrid(rows: number, cols: number): GridData {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
}

function createLayer(rows: number, cols: number, name: string): Layer {
  return {
    id: crypto.randomUUID(),
    name,
    visible: true,
    opacity: 1,
    data: createEmptyGrid(rows, cols),
  };
}

function resizeLayerData(layer: Layer, newRows: number, newCols: number): Layer {
  const newData = createEmptyGrid(newRows, newCols);
  const copyRows = Math.min(layer.data.length, newRows);
  const copyCols = Math.min(layer.data[0]?.length ?? 0, newCols);
  for (let r = 0; r < copyRows; r++) {
    for (let c = 0; c < copyCols; c++) {
      newData[r][c] = layer.data[r][c];
    }
  }
  return { ...layer, data: newData };
}

const defaultLayer = createLayer(32, 32, 'Layer 1');

const initialState: EditorState = {
  gridSettings: {
    rows: 32,
    cols: 32,
    pixelSize: 16,
    showGridLines: true,
    gridLineColor: '#000000',
    gridLineOpacity: 0.1,
    canvasBackground: '#FFFFFF',
  },
  layers: [defaultLayer],
  activeLayerId: defaultLayer.id,
  activeTool: 'brush',
  activeColor: '#000000',
  activeOpacity: 1,
  fillMode: 'drag',
  symmetryMode: 'none',
  savedColors: ['#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'],
  background: { image: null, opacity: 0.5, fit: 'cover' },
  selection: null,
  gradient: { startColor: '#000000', endColor: '#FFFFFF', direction: 'horizontal' },
  optimizeSvg: true,
  exportScale: 1,
  exportFormat: 'svg',
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_PIXEL': {
      return {
        ...state,
        layers: state.layers.map(layer => {
          if (layer.id !== action.layerId) return layer;
          const newData = layer.data.map(row => [...row]);
          if (action.row >= 0 && action.row < newData.length && action.col >= 0 && action.col < (newData[0]?.length ?? 0)) {
            newData[action.row][action.col] = action.pixel;
          }
          return { ...layer, data: newData };
        }),
      };
    }
    case 'SET_PIXELS': {
      return {
        ...state,
        layers: state.layers.map(layer => {
          if (layer.id !== action.layerId) return layer;
          const newData = layer.data.map(row => [...row]);
          for (const { row, col, pixel } of action.pixels) {
            if (row >= 0 && row < newData.length && col >= 0 && col < (newData[0]?.length ?? 0)) {
              newData[row][col] = pixel;
            }
          }
          return { ...layer, data: newData };
        }),
      };
    }
    case 'FLOOD_FILL': {
      const layer = state.layers.find(l => l.id === action.layerId);
      if (!layer) return state;
      const changes = floodFill(layer.data, action.row, action.col, action.color, action.opacity);
      if (changes.length === 0) return state;
      return {
        ...state,
        layers: state.layers.map(l => {
          if (l.id !== action.layerId) return l;
          const newData = l.data.map(row => [...row]);
          for (const { row, col, pixel } of changes) {
            newData[row][col] = pixel;
          }
          return { ...l, data: newData };
        }),
      };
    }
    case 'APPLY_GRADIENT': {
      const changes = applyGradient(action.selection, action.gradient);
      return {
        ...state,
        layers: state.layers.map(l => {
          if (l.id !== action.layerId) return l;
          const newData = l.data.map(row => [...row]);
          for (const { row, col, pixel } of changes) {
            if (row >= 0 && row < newData.length && col >= 0 && col < (newData[0]?.length ?? 0)) {
              newData[row][col] = pixel;
            }
          }
          return { ...l, data: newData };
        }),
        selection: null,
      };
    }
    case 'DELETE_SELECTION': {
      const { selection } = action;
      const minR = Math.min(selection.startRow, selection.endRow);
      const maxR = Math.max(selection.startRow, selection.endRow);
      const minC = Math.min(selection.startCol, selection.endCol);
      const maxC = Math.max(selection.startCol, selection.endCol);
      return {
        ...state,
        layers: state.layers.map(l => {
          if (l.id !== action.layerId) return l;
          const newData = l.data.map(row => [...row]);
          for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              if (r >= 0 && r < newData.length && c >= 0 && c < (newData[0]?.length ?? 0)) {
                newData[r][c] = null;
              }
            }
          }
          return { ...l, data: newData };
        }),
        selection: null,
      };
    }
    case 'MOVE_SELECTION': {
      const { selection, deltaRow, deltaCol } = action;
      const minR = Math.min(selection.startRow, selection.endRow);
      const maxR = Math.max(selection.startRow, selection.endRow);
      const minC = Math.min(selection.startCol, selection.endCol);
      const maxC = Math.max(selection.startCol, selection.endCol);
      return {
        ...state,
        layers: state.layers.map(l => {
          if (l.id !== action.layerId) return l;
          const newData = l.data.map(row => [...row]);
          const copied: { row: number; col: number; pixel: typeof newData[0][0] }[] = [];
          for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              if (r >= 0 && r < newData.length && c >= 0 && c < (newData[0]?.length ?? 0)) {
                copied.push({ row: r, col: c, pixel: newData[r][c] });
                newData[r][c] = null;
              }
            }
          }
          for (const { row, col, pixel } of copied) {
            const nr = row + deltaRow;
            const nc = col + deltaCol;
            if (nr >= 0 && nr < newData.length && nc >= 0 && nc < (newData[0]?.length ?? 0)) {
              newData[nr][nc] = pixel;
            }
          }
          return { ...l, data: newData };
        }),
        selection: {
          startRow: selection.startRow + deltaRow,
          startCol: selection.startCol + deltaCol,
          endRow: selection.endRow + deltaRow,
          endCol: selection.endCol + deltaCol,
        },
      };
    }
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool, selection: action.tool !== 'select' ? null : state.selection };
    case 'SET_COLOR':
      return { ...state, activeColor: action.color };
    case 'SET_OPACITY':
      return { ...state, activeOpacity: action.opacity };
    case 'SET_FILL_MODE':
      return { ...state, fillMode: action.mode };
    case 'SET_SYMMETRY':
      return { ...state, symmetryMode: action.mode };
    case 'SET_GRID_SETTINGS':
      return { ...state, gridSettings: { ...state.gridSettings, ...action.settings } };
    case 'SET_BACKGROUND':
      return { ...state, background: { ...state.background, ...action.background } };
    case 'SET_SELECTION':
      return { ...state, selection: action.selection };
    case 'SET_GRADIENT':
      return { ...state, gradient: { ...state.gradient, ...action.gradient } };
    case 'ADD_SAVED_COLOR':
      return { ...state, savedColors: [...state.savedColors, action.color] };
    case 'REMOVE_SAVED_COLOR':
      return { ...state, savedColors: state.savedColors.filter((_, i) => i !== action.index) };
    case 'ADD_LAYER': {
      const num = state.layers.length + 1;
      const newLayer = createLayer(state.gridSettings.rows, state.gridSettings.cols, `Layer ${num}`);
      return { ...state, layers: [...state.layers, newLayer], activeLayerId: newLayer.id };
    }
    case 'REMOVE_LAYER': {
      if (state.layers.length <= 1) return state;
      const filtered = state.layers.filter(l => l.id !== action.layerId);
      const newActiveId = state.activeLayerId === action.layerId ? filtered[0].id : state.activeLayerId;
      return { ...state, layers: filtered, activeLayerId: newActiveId };
    }
    case 'SET_ACTIVE_LAYER':
      return { ...state, activeLayerId: action.layerId };
    case 'RENAME_LAYER':
      return {
        ...state,
        layers: state.layers.map(l => l.id === action.layerId ? { ...l, name: action.name } : l),
      };
    case 'TOGGLE_LAYER_VISIBILITY':
      return {
        ...state,
        layers: state.layers.map(l => l.id === action.layerId ? { ...l, visible: !l.visible } : l),
      };
    case 'SET_LAYER_OPACITY':
      return {
        ...state,
        layers: state.layers.map(l => l.id === action.layerId ? { ...l, opacity: action.opacity } : l),
      };
    case 'REORDER_LAYERS': {
      const map = new Map(state.layers.map(l => [l.id, l]));
      const reordered = action.layerIds.map(id => map.get(id)!).filter(Boolean);
      return { ...state, layers: reordered };
    }
    case 'CLEAR_LAYER':
      return {
        ...state,
        layers: state.layers.map(l =>
          l.id === action.layerId
            ? { ...l, data: createEmptyGrid(state.gridSettings.rows, state.gridSettings.cols) }
            : l
        ),
      };
    case 'RESIZE_GRID': {
      return {
        ...state,
        gridSettings: { ...state.gridSettings, rows: action.rows, cols: action.cols },
        layers: state.layers.map(l => resizeLayerData(l, action.rows, action.cols)),
      };
    }
    case 'SET_EXPORT_FORMAT':
      return { ...state, exportFormat: action.format };
    case 'SET_EXPORT_SCALE':
      return { ...state, exportScale: action.scale };
    case 'SET_OPTIMIZE_SVG':
      return { ...state, optimizeSvg: action.optimize };
    case 'LOAD_PROJECT':
      return { ...action.state };
    default:
      return state;
  }
}

interface EditorContextValue {
  state: EditorState;
  dispatch: (action: EditorAction) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EditorState>(initialState);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyRef = useRef<EditorState[]>([initialState]);
  const indexRef = useRef(0);
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStateRef = useRef<EditorState | null>(null);
  const lastActionTypeRef = useRef<string>('');

  const flushPendingHistory = useCallback(() => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
    if (pendingStateRef.current) {
      historyRef.current = [...historyRef.current.slice(0, indexRef.current + 1), pendingStateRef.current];
      indexRef.current = historyRef.current.length - 1;
      if (historyRef.current.length > 100) {
        historyRef.current = historyRef.current.slice(-100);
        indexRef.current = historyRef.current.length - 1;
      }
      pendingStateRef.current = null;
      setHistoryIndex(indexRef.current);
    }
  }, []);

  const pushHistory = useCallback((newState: EditorState, actionType: string) => {
    const isContinuousDraw = (actionType === 'SET_PIXEL' || actionType === 'SET_PIXELS') &&
      (lastActionTypeRef.current === 'SET_PIXEL' || lastActionTypeRef.current === 'SET_PIXELS');

    lastActionTypeRef.current = actionType;

    if (isContinuousDraw) {
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
      pendingStateRef.current = newState;
      batchTimeoutRef.current = setTimeout(() => {
        flushPendingHistory();
      }, 300);
    } else {
      flushPendingHistory();
      historyRef.current = [...historyRef.current.slice(0, indexRef.current + 1), newState];
      indexRef.current = historyRef.current.length - 1;
      if (historyRef.current.length > 100) {
        historyRef.current = historyRef.current.slice(-100);
        indexRef.current = historyRef.current.length - 1;
      }
      pendingStateRef.current = null;
      setHistoryIndex(indexRef.current);
    }
  }, [flushPendingHistory]);

  const dispatch = useCallback((action: EditorAction) => {
    setState(prev => {
      const next = editorReducer(prev, action);
      if (next !== prev) {
        pushHistory(next, action.type);
      }
      return next;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    flushPendingHistory();
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      setHistoryIndex(indexRef.current);
      setState(historyRef.current[indexRef.current]);
    }
  }, [flushPendingHistory]);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current += 1;
      setHistoryIndex(indexRef.current);
      setState(historyRef.current[indexRef.current]);
    }
  }, []);

  return (
    <EditorContext.Provider value={{
      state,
      dispatch,
      undo,
      redo,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < historyRef.current.length - 1,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}
