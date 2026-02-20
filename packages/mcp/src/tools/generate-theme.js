/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {Theme, Color, BackgroundColor} from '@adobe/leonardo-contrast-colors';

/**
 * @param {{
 *   colors: Array<{ name: string, colorKeys: string[], ratios: number[] | Record<string, number>, colorspace?: string }>;
 *   backgroundColor: { name: string, colorKeys: string[], ratios: number[] | Record<string, number>, colorspace?: string };
 *   lightness: number;
 *   contrast?: number;
 *   saturation?: number;
 *   output?: string;
 *   formula?: 'wcag2' | 'wcag3';
 * }} args
 * @returns {import('@adobe/leonardo-contrast-colors').Theme['contrastColors']}
 */
export function generateTheme(args) {
  const {colors: colorDefs, backgroundColor: bgDef, lightness, contrast = 1, saturation = 100, output = 'HEX', formula = 'wcag2'} = args;

  const bg = new BackgroundColor({
    name: bgDef.name,
    colorKeys: bgDef.colorKeys,
    ratios: bgDef.ratios,
    colorSpace: bgDef.colorspace || bgDef.colorSpace || 'RGB'
  });

  const colorInstances = colorDefs.map((def) => {
    return new Color({
      name: def.name,
      colorKeys: def.colorKeys,
      ratios: def.ratios,
      colorSpace: def.colorspace || def.colorSpace || 'RGB'
    });
  });

  const theme = new Theme({
    colors: [bg, ...colorInstances],
    backgroundColor: bg,
    lightness,
    contrast,
    saturation,
    output,
    formula
  });

  return theme.contrastColors;
}
