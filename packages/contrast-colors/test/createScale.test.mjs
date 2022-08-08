/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
/* global test, expect */

import { createScale } from "../index";

test('should generate 8 colors in Lab', () => {
  const scale = createScale({ swatches: 8, colorKeys: ['#CCFFA9', '#FEFEC5', '#5F0198'], colorspace: 'LAB', shift: 1, fullScale: true });

  expect(scale).toEqual(
    [
      '#ffffff',
      '#c6eba9',
      '#b6bda8',
      '#a48fa5',
      '#8e62a1',
      '#73329c',
      '#470d6e',
      '#000000'
    ],
  );
});

test('should generate 8 colors in OKlab', () => {
  const scale = createScale({ swatches: 8, colorKeys: ['#CCFFA9', '#FEFEC5', '#5F0198'], colorspace: 'OKLAB', shift: 1, fullScale: true });

  expect(scale).toEqual(
    [
      '#ffffff',
      '#c3ecac',
      '#adc0ae',
      '#9795ac',
      '#8169a7',
      '#6c399f',
      '#3d0064',
      '#000000'
    ],
  );
});

test('should generate 8 colors in OKLCh', () => {
  const scale = createScale({ swatches: 8, colorKeys: ['#CCFFA9', '#FEFEC5', '#5F0198'], colorspace: 'OKLCH', shift: 1, fullScale: true });

  expect(scale).toEqual(
    [
      '#ffffff',
      '#a1f5ac',
      '#00d8c0',
      '#00aed5',
      '#0079d9',
      '#503cbd',
      '#440077',
      '#000000'
    ],
  );
});
