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
