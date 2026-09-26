import { Layer, GridSettings } from './types';

interface SvgRect {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
}

function layerToRects(layer: Layer): SvgRect[] {
  const rects: SvgRect[] = [];
  const { data } = layer;

  for (let r = 0; r < data.length; r++) {
    for (let c = 0; c < data[r].length; c++) {
      const pixel = data[r][c];
      if (!pixel) continue;

      rects.push({
        x: c,
        y: r,
        width: 1,
        height: 1,
        fill: pixel.color,
        opacity: pixel.opacity * layer.opacity,
      });
    }
  }

  return rects;
}

function mergeAdjacentRects(rects: SvgRect[]): SvgRect[] {
  if (rects.length === 0) return [];

  const byKey = new Map<string, SvgRect[]>();
  for (const rect of rects) {
    const key = `${rect.fill}-${rect.opacity}-${rect.y}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(rect);
  }

  const merged: SvgRect[] = [];
  for (const group of byKey.values()) {
    group.sort((a, b) => a.x - b.x);

    let current = { ...group[0] };
    for (let i = 1; i < group.length; i++) {
      if (group[i].x === current.x + current.width) {
        current.width += 1;
      } else {
        merged.push(current);
        current = { ...group[i] };
      }
    }
    merged.push(current);
  }

  return merged;
}

export function generateSvg(
  layers: Layer[],
  gridSettings: GridSettings,
  optimize: boolean
): string {
  const { rows, cols } = gridSettings;

  let allRects: SvgRect[] = [];

  const visibleLayers = layers.filter(l => l.visible);
  for (const layer of visibleLayers) {
    const rects = layerToRects(layer);
    allRects.push(...rects);
  }

  if (optimize) {
    allRects = mergeAdjacentRects(allRects);
  }

  const rectsStr = allRects
    .map(r => {
      const opacityAttr = r.opacity < 1 ? ` opacity="${r.opacity}"` : '';
      if (optimize) {
        return `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${r.fill}"${opacityAttr}/>`;
      }
      return `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${r.fill}"${opacityAttr} />`;
    })
    .join(optimize ? '' : '\n  ');

  if (optimize) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols} ${rows}">${rectsStr}</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols} ${rows}" width="${cols}" height="${rows}">
  ${rectsStr}
</svg>`;
}
