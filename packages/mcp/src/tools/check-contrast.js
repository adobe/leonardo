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

import {contrast, convertColorValue} from '@adobe/leonardo-contrast-colors';

/**
 * @param {{ foreground: string, background: string, method?: 'wcag2' | 'wcag3' }} args
 * @returns {{ ratio: number, method: string, wcag2?: { aa: boolean, aaa: boolean }, wcag3?: { lc: number } }}
 */
export function checkContrast(args) {
  const {foreground, background, method = 'wcag2'} = args;

  const fgObj = convertColorValue(foreground, 'HEX', true);
  const bgObj = convertColorValue(background, 'HEX', true);
  const fgRgb = [fgObj.r, fgObj.g, fgObj.b];
  const bgRgb = [bgObj.r, bgObj.g, bgObj.b];

  const ratio = contrast(fgRgb, bgRgb, undefined, method);

  const out = {
    ratio: Math.round(ratio * 100) / 100,
    method
  };

  if (method === 'wcag2') {
    const absRatio = Math.abs(ratio);
    out.wcag2 = {
      aa: absRatio >= 4.5,
      aaa: absRatio >= 7,
      largeText: absRatio >= 3
    };
  } else {
    out.wcag3 = {lc: ratio};
  }

  return out;
}
