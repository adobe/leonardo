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

test('should generate theme for three colors', function() {
  let theme = generateAdaptiveTheme(
    {
      colorKeys: ['#cacaca'],
      colorspace: 'HSL'
    },
    [
      {
        name: "gray",
        colorKeys: ['#cacaca'],
        colorspace: 'HSL',
        ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
      },
      {
        name: "blue",
        colorKeys: ['#0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12]
      },
      {
        name: "red",
        colorKeys: ['#ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12]
      }
    ]);
    let themeLight = theme(90);;

    expect(themeLight).toEqual([
      {gray100: "#e0e0e0"},
      {gray200: "#cecece"},
      {gray300: "#c0c0c0"},
      {gray400: "#a0a0a0"},
      {gray500: "#808080"},
      {gray600: "#646464"},
      {gray700: "#525252"},
      {gray800: "#404040"},
      {gray900: "#242424"},
      {gray1000: "#000000"},
      {blue100: "#b18cff"},
      {blue200: "#8d63ff"},
      {blue300: "#623aff"},
      {blue400: "#1c0ad1"},
      {blue500: "#211068"},
      {red100: "#ff7474"},
      {red200: "#ff1313"},
      {red300: "#cc0000"},
      {red400: "#860000"},
      {red500: "#500000"}]);

});

test('should generate theme for three colors with negative ratios', function() {
  let theme = generateAdaptiveTheme(
    {
      colorKeys: ['#cacaca'],
      colorspace: 'HSL'
    },
    [
      {
        name: "gray",
        colorKeys: ['#cacaca'],
        colorspace: 'HSL',
        ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
      },
      {
        name: "blue",
        colorKeys: ['#0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12]
      },
      {
        name: "red",
        colorKeys: ['#ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12]
      }
    ]);
    let themeLight = theme(90);;

    expect(themeLight).toEqual([{gray33: "#ffffff"}, {gray67: "#f5f5f5"}, {gray100: "#e0e0e0"}, {gray200: "#cecece"}, {gray300: "#c0c0c0"}, {gray400: "#a0a0a0"}, {gray500: "#808080"}, {gray600: "#646464"}, {gray700: "#525252"}, {gray800: "#404040"}, {gray900: "#242424"}, {gray1000: "#000000"}, {blue100: "#b18cff"}, {blue200: "#8d63ff"}, {blue300: "#623aff"}, {blue400: "#1c0ad1"}, {blue500: "#211068"}, {red100: "#ff7474"}, {red200: "#ff1313"}, {red300: "#cc0000"}, {red400: "#860000"}, {red500: "#500000"}]);

});

test('should generate theme for three colors using variables as parameters', function() {
  let tempRatios = [2, 3, 4.5, 8, 12];
  let baseRatios = [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21];
  let gray = {
    colorKeys: ['#cacaca'],
    colorspace: 'HSL'
  };
  let blue = {
    name: "blue",
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: tempRatios
  };
  let red = {
    name: "red",
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: tempRatios
  };
  let grayUI = {
    name: "gray",
    colorKeys: gray.colorKeys,
    colorspace: gray.colorspace,
    ratios: baseRatios
  };
  let brightness = 90;

  let theme = generateAdaptiveTheme(gray, [grayUI, blue, red]);
  let themeLight = theme(90);;

  expect(themeLight).toEqual([
    {gray100: "#e0e0e0"},
    {gray200: "#cecece"},
    {gray300: "#c0c0c0"},
    {gray400: "#a0a0a0"},
    {gray500: "#808080"},
    {gray600: "#646464"},
    {gray700: "#525252"},
    {gray800: "#404040"},
    {gray900: "#242424"},
    {gray1000: "#000000"},
    {blue100: "#b18cff"},
    {blue200: "#8d63ff"},
    {blue300: "#623aff"},
    {blue400: "#1c0ad1"},
    {blue500: "#211068"},
    {red100: "#ff7474"},
    {red200: "#ff1313"},
    {red300: "#cc0000"},
    {red400: "#860000"},
    {red500: "#500000"}]);

});

test('should generate theme with increased contrast', function() {
  let theme = generateAdaptiveTheme(
    {
      colorKeys: ['#cacaca'],
      colorspace: 'HSL'
    },
    [
      {
        name: "gray",
        colorKeys: ['#cacaca'],
        colorspace: 'HSL',
        ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
      },
      {
        name: "blue",
        colorKeys: ['#0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12]
      },
      {
        name: "red",
        colorKeys: ['#ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12]
      }
    ]);
    let themeLight = theme(90, 1.4);;

    expect(themeLight).toEqual([{gray33: "#ffffff"}, {gray67: "#fdfdfd"}, {gray100: "#e0e0e0"}, {gray200: "#c9c9c9"}, {gray300: "#b5b5b5"}, {gray400: "#929292"}, {gray500: "#707070"}, {gray600: "#525252"}, {gray700: "#404040"}, {gray800: "#2c2c2c"}, {gray900: "#000000"}, {gray1000: "#000000"}, {blue100: "#a179ff"}, {blue200: "#764bff"}, {blue300: "#3418ff"}, {blue400: "#231086"}, {blue500: "#000000"}, {red100: "#ff5555"}, {red200: "#e10000"}, {red300: "#aa0000"}, {red400: "#5f0000"}, {red500: "#000000"}]);

});

test('should generate white theme with increased contrast', function() {
  let theme = generateAdaptiveTheme(
    {
      colorKeys: ['#cacaca'],
      colorspace: 'HSL'
    },
    [
      {
        name: "gray",
        colorKeys: ['#cacaca'],
        colorspace: 'HSL',
        ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
      },
      {
        name: "blue",
        colorKeys: ['#0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12]
      },
      {
        name: "red",
        colorKeys: ['#ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12]
      }
    ]);
    let themeLight = theme(100, 2);;

    expect(themeLight).toEqual([{gray33: "#ffffff"}, {gray67: "#ffffff"}, {gray100: "#fefefe"}, {gray200: "#d9d9d9"}, {gray300: "#c1c1c1"}, {gray400: "#949494"}, {gray500: "#6f6f6f"}, {gray600: "#505050"}, {gray700: "#3b3b3b"}, {gray800: "#272727"}, {gray900: "#000000"}, {gray1000: "#000000"}, {blue100: "#a47cff"}, {blue200: "#744aff"}, {blue300: "#2610ff"}, {blue400: "#221073"}, {blue500: "#000000"}, {red100: "#ff5c5c"}, {red200: "#e00000"}, {red300: "#a60000"}, {red400: "#560000"}, {red500: "#000000"}]);

});

test('should generate dark theme with increased contrast', function() {
  let theme = generateAdaptiveTheme(
    {
      colorKeys: ['#cacaca'],
      colorspace: 'HSL'
    },
    [
      {
        name: "gray",
        colorKeys: ['#cacaca'],
        colorspace: 'HSL',
        ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
      },
      {
        name: "blue",
        colorKeys: ['#0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12]
      },
      {
        name: "red",
        colorKeys: ['#ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12]
      }
    ]);
    let themeLight = theme(20, 1.5);;

    expect(themeLight).toEqual([{gray33: "#000000"}, {gray67: "#1c1c1c"}, {gray100: "#303030"}, {gray200: "#414141"}, {gray300: "#4f4f4f"}, {gray400: "#6b6b6b"}, {gray500: "#8e8e8e"}, {gray600: "#b3b3b3"}, {gray700: "#d0d0d0"}, {gray800: "#efefef"}, {gray900: "#ffffff"}, {gray1000: "#ffffff"}, {blue100: "#6f45ff"}, {blue200: "#9d73ff"}, {blue300: "#c3a3ff"}, {blue400: "#f4edff"}, {blue500: "#ffffff"}, {red100: "#da0000"}, {red200: "#ff4b4b"}, {red300: "#ff9494"}, {red400: "#ffebeb"}, {red500: "#ffffff"}]);

});
