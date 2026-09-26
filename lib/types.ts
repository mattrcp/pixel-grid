export type Tool = 'brush' | 'eraser' | 'fill' | 'eyedropper' | 'select';

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'both';

export type ExportFormat = 'svg' | 'png' | 'css';

export type ExportScale = 1 | 2 | 4;

export type BackgroundFit = 'cover' | 'contain' | 'tile';

export type FillMode = 'click' | 'drag';

export interface Pixel {
  color: string;
  opacity: number;
}

export type GridData = (Pixel | null)[][];

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  data: GridData;
}

export interface GridSettings {
  rows: number;
  cols: number;
  pixelSize: number;
  showGridLines: boolean;
  gridLineColor: string;
  gridLineOpacity: number;
  canvasBackground: string;
}

export interface BackgroundSettings {
  image: string | null;
  opacity: number;
  fit: BackgroundFit;
}

export interface SelectionRect {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface GradientSettings {
  startColor: string;
  endColor: string;
  direction: 'horizontal' | 'vertical' | 'diagonal';
}

export interface ProjectData {
  name: string;
  gridSettings: GridSettings;
  layers: Layer[];
  activeLayerId: string;
  savedAt: string;
}

export interface EditorState {
  gridSettings: GridSettings;
  layers: Layer[];
  activeLayerId: string;
  activeTool: Tool;
  activeColor: string;
  activeOpacity: number;
  fillMode: FillMode;
  symmetryMode: SymmetryMode;
  savedColors: string[];
  background: BackgroundSettings;
  selection: SelectionRect | null;
  gradient: GradientSettings;
  optimizeSvg: boolean;
  exportScale: ExportScale;
  exportFormat: ExportFormat;
}

export type EditorAction =
  | { type: 'SET_PIXEL'; layerId: string; row: number; col: number; pixel: Pixel | null }
  | { type: 'SET_PIXELS'; layerId: string; pixels: { row: number; col: number; pixel: Pixel | null }[] }
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SET_COLOR'; color: string }
  | { type: 'SET_OPACITY'; opacity: number }
  | { type: 'SET_FILL_MODE'; mode: FillMode }
  | { type: 'SET_SYMMETRY'; mode: SymmetryMode }
  | { type: 'SET_GRID_SETTINGS'; settings: Partial<GridSettings> }
  | { type: 'SET_BACKGROUND'; background: Partial<BackgroundSettings> }
  | { type: 'SET_SELECTION'; selection: SelectionRect | null }
  | { type: 'SET_GRADIENT'; gradient: Partial<GradientSettings> }
  | { type: 'ADD_SAVED_COLOR'; color: string }
  | { type: 'REMOVE_SAVED_COLOR'; index: number }
  | { type: 'ADD_LAYER' }
  | { type: 'REMOVE_LAYER'; layerId: string }
  | { type: 'SET_ACTIVE_LAYER'; layerId: string }
  | { type: 'RENAME_LAYER'; layerId: string; name: string }
  | { type: 'TOGGLE_LAYER_VISIBILITY'; layerId: string }
  | { type: 'SET_LAYER_OPACITY'; layerId: string; opacity: number }
  | { type: 'REORDER_LAYERS'; layerIds: string[] }
  | { type: 'CLEAR_LAYER'; layerId: string }
  | { type: 'RESIZE_GRID'; rows: number; cols: number }
  | { type: 'SET_EXPORT_FORMAT'; format: ExportFormat }
  | { type: 'SET_EXPORT_SCALE'; scale: ExportScale }
  | { type: 'SET_OPTIMIZE_SVG'; optimize: boolean }
  | { type: 'LOAD_PROJECT'; state: EditorState }
  | { type: 'FLOOD_FILL'; layerId: string; row: number; col: number; color: string; opacity: number }
  | { type: 'APPLY_GRADIENT'; layerId: string; selection: SelectionRect; gradient: GradientSettings }
  | { type: 'DELETE_SELECTION'; layerId: string; selection: SelectionRect }
  | { type: 'MOVE_SELECTION'; layerId: string; selection: SelectionRect; deltaRow: number; deltaCol: number };
