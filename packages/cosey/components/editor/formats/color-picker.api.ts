import { zip } from 'lodash-es';
import { defaultPresetColors } from '../../../utils';
import { generate } from '../../../utils';

export const colorNames = [
  'red',
  'volcano',
  'orange',
  'gold',
  'yellow',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
  'magenta',
] as const;

const levels = [2, 4, 6, 8] as const;

// 中性色是一行「白 → 黑」的灰阶，取 Ant Design 中性色板（略去与 #141414 几乎无差别的 #1f1f1f）。
// 这里写死色阶而不是用算法插值，因为 sRGB 线性混合在感知上并不均匀，暗部会挤在一起。
// 数量需与 colorNames 一致，保证每列都能取到自己的中性色。
export const neutralColors = [
  '#ffffff',
  '#fafafa',
  '#f5f5f5',
  '#f0f0f0',
  '#d9d9d9',
  '#bfbfbf',
  '#8c8c8c',
  '#595959',
  '#434343',
  '#262626',
  '#141414',
  '#000000',
];

export const colorPalettes = zip(
  ...colorNames.map((name, i) => {
    const baseColor = defaultPresetColors[name];
    const colors = generate(baseColor);

    return levels
      .map((level) => {
        return colors[level];
      })
      .concat(neutralColors[i]);
  }),
) as string[][];
