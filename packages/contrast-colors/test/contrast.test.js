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

import test from 'ava';
import {contrast} from '../index.js';

test('should provide negative contrast in light theme (-1.55...)', (t) => {
  const contrastValue = contrast([255, 255, 255], [207, 207, 207]); // white is UI color, gray is base. Should return negative whole number
  t.is(contrastValue, -1.5579550563651177);
});

test('should provide positive contrast in light theme (1.55...)', (t) => {
  const contrastValue = contrast([207, 207, 207], [255, 255, 255]); // gray is UI color, white is base. Should return positive whole number
  t.is(contrastValue, 1.5579550563651177);
});

test('should provide negative contrast in dark theme (-1.55...)', (t) => {
  const contrastValue = contrast([8, 8, 8], [50, 50, 50]); // darker gray is UI color, gray is base. Should return negative whole number
  t.is(contrastValue, -1.5620602707250844);
});

test('should provide positive contrast in dark theme (1.57...)', (t) => {
  const contrastValue = contrast([79, 79, 79], [50, 50, 50]); // lighter gray is UI color, gray is base. Should return negative whole number
  t.is(contrastValue, 1.5652458000121365);
});

test('should provide contrast when passing base value (5.64...)', (t) => {
  const contrastValue = contrast([79, 79, 79], [214, 214, 214], 0.86); // lighter gray is UI color, gray is base. Should return negative whole number
  t.is(contrastValue, 5.635834988986869);
});

/**
 * Test APCA colors
 */

test('should provide APCA contrast of ~ 75.6', (t) => {
  const contrastValue = contrast([18, 52, 176], [233, 228, 208], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number
  t.is(contrastValue, 75.57062523197818);
});

test('should provide APCA contrast of ~ 78.3', (t) => {
  const contrastValue = contrast([233, 228, 208], [18, 52, 176], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number
  t.is(contrastValue, 78.28508284557655);
});

test('should provide APCA contrast of ~ 38.7', (t) => {
  const contrastValue = contrast([255, 162, 0], [255, 255, 255], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number
  t.is(contrastValue, 38.67214116963013);
});

test('should provide APCA contrast of ~ -43.1 since bg lum is greater than 50%', (t) => {
  const contrastValue = contrast([255, 255, 255], [255, 162, 0], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number
  t.is(contrastValue, -43.12544505836451);
});

test('should provide APCA contrast of ~ 107.9', (t) => {
  const contrastValue = contrast([255, 255, 255], [0, 0, 0], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number
  t.is(contrastValue, 107.88473318309848);
});

test('should provide APCA contrast of ~ 106', (t) => {
  const contrastValue = contrast([0, 0, 0], [255, 255, 255], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number
  t.is(contrastValue, 106.04067321268862);
});

test('should provide APCA contrast less than APCA officially supports', (t) => {
  const contrastValue = contrast([238, 238, 238], [255, 255, 255], undefined, 'wcag3'); // Leonardo needs more than just 7.5+ for contrast values
  t.is(contrastValue, 7.567424744881627);
});
