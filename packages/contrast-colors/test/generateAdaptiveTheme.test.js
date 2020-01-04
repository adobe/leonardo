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

import { generateAdaptiveTheme } from '../index.js';

test('should generate full palette for three colors', function() {
  let theme = generateAdaptiveTheme(
    {
      colorKeys: ['#cacaca'],
      colorspace: ['HSL']
    },
    [
      {
        name: "gray",
        colorKeys: ['#cacaca'],
        colorspace: ['HSL'],
        ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
      },
      {
        name: "blue",
        colorKeys: ['0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12]
      },
      {
        name: "red",
        colorKeys: ['ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12]
      }
    ], 90);;

    expect(theme).toEqual([{gray100: "#e0e0e0"}, {gray200: "#cecece"}, {gray300: "#c0c0c0"}, {gray400: "#a0a0a0"}, {gray500: "#808080"}, {gray600: "#646464"}, {gray700: "#525252"}, {gray800: "#404040"}, {gray900: "#242424"}, {gray1000: "#000000"}, {blue100: "#000000"}, {blue200: "#000000"}, {blue300: "#000000"}, {blue400: "#000000"}, {blue500: "#000000"}, {red100: "#000000"}, {red200: "#000000"}, {red300: "#000000"}, {red400: "#000000"}, {red500: "#000000"}]);

});

test('should generate full palette for three colors using variables as parameters', function() {
  let tempRatios = [2, 3, 4.5, 8, 12];
  let gray = {
    colorKeys: ['#cacaca'],
    colorspace: ['HSL']
  };
  let blue = {
    name: "blue",
    colorKeys: ['0000ff'],
    colorspace: 'LAB',
    ratios: tempRatios
  };
  let red = {
    name: "red",
    colorKeys: ['ff0000'],
    colorspace: 'RGB',
    ratios: tempRatios
  };
  let grayUI = {
    name: "gray",
    colorKeys: gray.colorKeys,
    colorspace: gray.colorspace,
    ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  };
  let brightness = 90;

  let theme = generateAdaptiveTheme(gray, [grayUI, blue, red], brightness);;

  expect(theme).toEqual([{gray100: "#e0e0e0"}, {gray200: "#cecece"}, {gray300: "#c0c0c0"}, {gray400: "#a0a0a0"}, {gray500: "#808080"}, {gray600: "#646464"}, {gray700: "#525252"}, {gray800: "#404040"}, {gray900: "#242424"}, {gray1000: "#000000"}, {blue100: "#000000"}, {blue200: "#000000"}, {blue300: "#000000"}, {blue400: "#000000"}, {blue500: "#000000"}, {red100: "#000000"}, {red200: "#000000"}, {red300: "#000000"}, {red400: "#000000"}, {red500: "#000000"}]);

});
