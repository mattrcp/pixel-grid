import { Layer, GridSettings, ExportScale } from './types';

export function exportPng(
  layers: Layer[],
  gridSettings: GridSettings,
  scale: ExportScale
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { rows, cols } = gridSettings;
    const width = cols * scale;
    const height = rows * scale;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Cannot get canvas context'));

    const visibleLayers = layers.filter(l => l.visible);
    for (const layer of visibleLayers) {
      for (let r = 0; r < layer.data.length; r++) {
        for (let c = 0; c < layer.data[r].length; c++) {
          const pixel = layer.data[r][c];
          if (!pixel) continue;
          ctx.globalAlpha = pixel.opacity * layer.opacity;
          ctx.fillStyle = pixel.color;
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      }
    }

    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create PNG blob'));
    }, 'image/png');
  });
}
