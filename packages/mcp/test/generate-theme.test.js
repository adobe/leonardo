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

import {describe, it} from 'node:test';
import assert from 'node:assert';
import {generateTheme} from '../src/tools/generate-theme.js';
import {checkContrast} from '../src/tools/check-contrast.js';
import {convertColor} from '../src/tools/convert-color.js';
import {createPalette} from '../src/tools/create-palette.js';

describe('generate-theme', () => {
  it('returns contrastColors with background and color entries', () => {
    const result = generateTheme({
      colors: [
        {
          name: 'blue',
          colorKeys: ['#5CDBFF', '#0000FF'],
          ratios: [3, 4.5]
        }
      ],
      backgroundColor: {
        name: 'gray',
        colorKeys: ['#cacaca'],
        ratios: [2, 3, 4.5, 8]
      },
      lightness: 97
    });
    assert(Array.isArray(result));
    assert(result.length >= 1);
    assert(result[0].background);
    const withValues = result.find((r) => r.name === 'blue' && r.values);
    assert(withValues);
    assert(withValues.values.length === 2);
    assert(typeof withValues.values[0].value === 'string');
  });
});

describe('check-contrast', () => {
  it('returns ratio and wcag2 pass/fail for #000 on #fff', () => {
    const result = checkContrast({foreground: '#000000', background: '#ffffff', method: 'wcag2'});
    assert(typeof result.ratio === 'number');
    assert(result.ratio > 15);
    assert(result.wcag2.aa === true);
    assert(result.wcag2.aaa === true);
  });
});

describe('convert-color', () => {
  it('converts hex to RGB string', () => {
    const result = convertColor({color: '#ff0000', format: 'RGB'});
    assert(result.value.toLowerCase().includes('rgb'));
    assert(result.value.includes('255'));
  });
});

describe('create-palette', () => {
  it('returns array of color strings', () => {
    const result = createPalette({
      colorKeys: ['#ff0000', '#0000ff'],
      steps: 5
    });
    assert(Array.isArray(result.colors));
    assert(result.colors.length === 5);
    assert(result.colors.every((c) => typeof c === 'string'));
  });
});
