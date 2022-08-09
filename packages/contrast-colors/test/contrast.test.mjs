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

import { contrast } from "../index";

test('should provide negative contrast in light theme (-1.55...)', () => {
  const contrastValue = contrast([255, 255, 255], [207, 207, 207]); // white is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(-1.5579550563651177);
});

test('should provide positive contrast in light theme (1.55...)', () => {
  const contrastValue = contrast([207, 207, 207], [255, 255, 255]); // gray is UI color, white is base. Should return positive whole number

  expect(contrastValue).toBe(1.5579550563651177);
});

test('should provide negative contrast in dark theme (-1.55...)', () => {
  const contrastValue = contrast([8, 8, 8], [50, 50, 50]); // darker gray is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(-1.5620602707250844);
});

test('should provide positive contrast in dark theme (1.57...)', () => {
  const contrastValue = contrast([79, 79, 79], [50, 50, 50]); // lighter gray is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(1.5652458000121365);
});

test('should provide contrast when passing base value (5.64...)', () => {
  const contrastValue = contrast([79, 79, 79], [214, 214, 214], .86); // lighter gray is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(5.635834988986869);
});


/** 
 * Test APCA colors
 */

test('should provide APCA contrast of ~ 75.6', () => {
  const contrastValue = contrast([18, 52, 176], [233, 228, 208], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(75.57062523197818);
});

test('should provide APCA contrast of ~ 78.3', () => {
  const contrastValue = contrast([233, 228, 208], [18, 52, 176], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(78.28508284557655);
});

test('should provide APCA contrast of ~ 38.7', () => {
  const contrastValue = contrast([255, 162, 0], [255,255,255], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(38.67214116963013);
});

test('should provide APCA contrast of ~ -43.1 since bg lum is greater than 50%', () => {
  const contrastValue = contrast([255,255,255], [255, 162, 0], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(-43.12544505836451);
});

test('should provide APCA contrast of ~ 107.9', () => {
  const contrastValue = contrast([255,255,255], [0, 0, 0], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(107.88473318309848);
});

test('should provide APCA contrast of ~ 106', () => {
  const contrastValue = contrast([0, 0, 0], [255,255,255], undefined, 'wcag3'); // lighter gray is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(106.04067321268862);
});

test('should provide APCA contrast less than APCA officially supports', () => {
  const contrastValue = contrast([238, 238, 238], [255,255,255], undefined, 'wcag3'); // Leonardo needs more than just 7.5+ for contrast values

  expect(contrastValue).toBe(7.567424744881627);
});