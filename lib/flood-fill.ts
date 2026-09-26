import { GridData, Pixel } from './types';

export function floodFill(
  grid: GridData,
  startRow: number,
  startCol: number,
  newColor: string,
  newOpacity: number
): { row: number; col: number; pixel: Pixel }[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  if (startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols) return [];

  const targetPixel = grid[startRow][startCol];
  const targetColor = targetPixel?.color ?? null;
  const targetOpacity = targetPixel?.opacity ?? 0;

  if (targetColor === newColor && targetOpacity === newOpacity) return [];

  const changes: { row: number; col: number; pixel: Pixel }[] = [];
  const visited = new Set<string>();
  const stack: [number, number][] = [[startRow, startCol]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const key = `${r},${c}`;

    if (visited.has(key)) continue;
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;

    const pixel = grid[r][c];
    const pixelColor = pixel?.color ?? null;
    const pixelOpacity = pixel?.opacity ?? 0;

    if (pixelColor !== targetColor || pixelOpacity !== targetOpacity) continue;

    visited.add(key);
    changes.push({ row: r, col: c, pixel: { color: newColor, opacity: newOpacity } });

    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }

  return changes;
}
