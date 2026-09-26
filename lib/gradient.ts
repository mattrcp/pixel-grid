import { GradientSettings, Pixel, SelectionRect } from './types';

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function applyGradient(
  selection: SelectionRect,
  gradient: GradientSettings
): { row: number; col: number; pixel: Pixel }[] {
  const minRow = Math.min(selection.startRow, selection.endRow);
  const maxRow = Math.max(selection.startRow, selection.endRow);
  const minCol = Math.min(selection.startCol, selection.endCol);
  const maxCol = Math.max(selection.startCol, selection.endCol);

  const [r1, g1, b1] = hexToRgb(gradient.startColor);
  const [r2, g2, b2] = hexToRgb(gradient.endColor);

  const changes: { row: number; col: number; pixel: Pixel }[] = [];

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      let t: number;
      const rowRange = maxRow - minRow;
      const colRange = maxCol - minCol;

      switch (gradient.direction) {
        case 'horizontal':
          t = colRange === 0 ? 0 : (col - minCol) / colRange;
          break;
        case 'vertical':
          t = rowRange === 0 ? 0 : (row - minRow) / rowRange;
          break;
        case 'diagonal':
          const totalRange = rowRange + colRange;
          t = totalRange === 0 ? 0 : ((row - minRow) + (col - minCol)) / totalRange;
          break;
      }

      const color = rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
      changes.push({ row, col, pixel: { color, opacity: 1 } });
    }
  }

  return changes;
}
