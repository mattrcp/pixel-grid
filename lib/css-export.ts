import { Layer, GridSettings } from './types';
import { generateSvg } from './svg-export';

export function generateCssBackground(
  layers: Layer[],
  gridSettings: GridSettings
): string {
  const svg = generateSvg(layers, gridSettings, true);
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  return `background-image: url("data:image/svg+xml,${encoded}");
background-repeat: repeat;
background-size: ${gridSettings.cols}px ${gridSettings.rows}px;`;
}
