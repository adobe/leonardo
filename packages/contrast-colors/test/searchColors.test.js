/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
/* global test, expect */

import { Color } from "../index";
import { searchColors, convertColorValue } from "../utils";

test('should return blue color of 3.12:1 against white', () => {
  const color = new Color({ 
    name: 'blue', 
    colorKeys: ['#0000ff'], 
    colorspace: 'LAB', 
    ratios: [3.12] 
  });
  const bgRgbArray = [255, 255, 255];
  const baseV = 100;

  const contrastColors = searchColors(color, bgRgbArray, baseV, color.ratios).map((clr) => convertColorValue(clr, 'RGB'));

  expect(contrastColors).toEqual(['rgb(163, 121, 255)']);
});

test('should return blue color of 3.12:1 against black', () => {
  const color = new Color({ 
    name: 'blue', 
    colorKeys: ['#0000ff'], 
    colorspace: 'LAB', 
    ratios: [3.12] 
  });
  const bgRgbArray = [0, 0, 0];
  const baseV = 0;

  const contrastColors = searchColors(color, bgRgbArray, baseV, color.ratios).map((clr) => convertColorValue(clr, 'RGB'));

  expect(contrastColors).toEqual(['rgb(80, 43, 255)']); // 3.13
});

test('should return blue colors of 3:1 and 4.5:1 against white', () => {
  const color = new Color({ 
    name: 'blue', 
    colorKeys: ['#0000ff'], 
    colorspace: 'LAB', 
    ratios: [3, 4.5] 
  });
  const bgRgbArray = [255, 255, 255];
  const baseV = 100;

  const contrastColors = searchColors(color, bgRgbArray, baseV, color.ratios).map((clr) => convertColorValue(clr, 'RGB'));

  expect(contrastColors).toEqual(['rgb(167, 124, 255)', 'rgb(129, 84, 255)']); // 3.01 & 4.52
});

test('should return blue colors of 3:1 and 4.5:1 against black', () => {
  const color = new Color({ 
    name: 'blue', 
    colorKeys: ['#0000ff'], 
    colorspace: 'LAB', 
    ratios: [3, 4.5] 
  });
  const bgRgbArray = [0, 0, 0];
  const baseV = 0;

  const contrastColors = searchColors(color, bgRgbArray, baseV, color.ratios).map((clr) => convertColorValue(clr, 'RGB'));

  expect(contrastColors).toEqual(['rgb(73, 38, 255)', 'rgb(126, 81, 255)']); // 3 & 4.51
});

test('should return blue color of -1.3 against light gray', () => {
  const color = new Color({ 
    name: 'blue', 
    colorKeys: ['#0000ff'], 
    colorspace: 'LAB', 
    ratios: [-1.3] 
  });
  const bgRgbArray = [166, 166, 166];
  const baseV = 65;

  const contrastColors = searchColors(color, bgRgbArray, baseV, color.ratios).map((clr) => convertColorValue(clr, 'RGB'));

  expect(contrastColors).toEqual(['rgb(207, 176, 255)']); // 1.31
});

test('should return blue color of -2 against dark gray', () => {
  const color = new Color({ 
    name: 'blue', 
    colorKeys: ['#0000ff'], 
    colorspace: 'LAB', 
    ratios: [-2] 
  });
  const bgRgbArray = [99, 99, 99];
  const baseV = 40;

  const contrastColors = searchColors(color, bgRgbArray, baseV, color.ratios).map((clr) => convertColorValue(clr, 'RGB'));

  expect(contrastColors).toEqual(['rgb(167, 125, 255)']); // 2.01
});