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
import {Theme, Color, BackgroundColor} from '../index.js';

test('should generate theme for three colors', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca', '#323232'],
    colorspace: 'HSL',
    ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 90
  });
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#e1e1e1'},
    {
      name: 'gray',
      values: [
        {name: 'gray100', contrast: 1, value: '#e1e1e1'},
        {name: 'gray200', contrast: 1.2, value: '#cecece'},
        {name: 'gray300', contrast: 1.4, value: '#bfbfbf'},
        {name: 'gray400', contrast: 2, value: '#a0a0a0'},
        {name: 'gray500', contrast: 3, value: '#808080'},
        {name: 'gray600', contrast: 4.5, value: '#646464'},
        {name: 'gray700', contrast: 6, value: '#515151'},
        {name: 'gray800', contrast: 8, value: '#3f3f3f'},
        {name: 'gray900', contrast: 12, value: '#232323'},
        {name: 'gray1000', contrast: 21, value: '#000000'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 2, value: '#b28aff'},
        {name: 'blue200', contrast: 3, value: '#8f62ff'},
        {name: 'blue300', contrast: 4.5, value: '#6339ff'},
        {name: 'blue400', contrast: 8, value: '#1e0bcf'},
        {name: 'blue500', contrast: 12, value: '#221165'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 2, value: '#ff7474'},
        {name: 'red200', contrast: 3, value: '#ff1111'},
        {name: 'red300', contrast: 4.5, value: '#cc0000'},
        {name: 'red400', contrast: 8, value: '#850000'},
        {name: 'red500', contrast: 12, value: '#4f0000'}
      ]
    }
  ]);
});

test('should output theme as key-value pairs', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca', '#323232'],
    colorspace: 'HSL',
    ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 90
  });
  const themeColors = theme.contrastColorPairs;

  t.deepEqual(themeColors, {
    background: '#e1e1e1',
    gray100: '#e1e1e1',
    gray200: '#cecece',
    gray300: '#bfbfbf',
    gray400: '#a0a0a0',
    gray500: '#808080',
    gray600: '#646464',
    gray700: '#515151',
    gray800: '#3f3f3f',
    gray900: '#232323',
    gray1000: '#000000',
    blue100: '#b28aff',
    blue200: '#8f62ff',
    blue300: '#6339ff',
    blue400: '#1e0bcf',
    blue500: '#221165',
    red100: '#ff7474',
    red200: '#ff1111',
    red300: '#cc0000',
    red400: '#850000',
    red500: '#4f0000'
  });
});

test('should generate theme for three colors in LCH format', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca', '#323232'],
    colorspace: 'HSL',
    ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 90,
    output: 'LCH'
  });
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: 'lch(90%, 0, 0deg)'},
    {
      name: 'gray',
      values: [
        {name: 'gray100', contrast: 1, value: 'lch(90%, 0, 0deg)'},
        {name: 'gray200', contrast: 1.2, value: 'lch(83%, 0, 0deg)'},
        {name: 'gray300', contrast: 1.4, value: 'lch(77%, 0, 0deg)'},
        {name: 'gray400', contrast: 2, value: 'lch(66%, 0, 0deg)'},
        {name: 'gray500', contrast: 3, value: 'lch(54%, 0, 0deg)'},
        {name: 'gray600', contrast: 4.5, value: 'lch(42%, 0, 0deg)'},
        {name: 'gray700', contrast: 6, value: 'lch(34%, 0, 0deg)'},
        {name: 'gray800', contrast: 8, value: 'lch(27%, 0, 0deg)'},
        {name: 'gray900', contrast: 12, value: 'lch(14%, 0, 0deg)'},
        {name: 'gray1000', contrast: 21, value: 'lch(0%, 0, 0deg)'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 2, value: 'lch(66%, 66, 307deg)'},
        {name: 'blue200', contrast: 3, value: 'lch(54%, 90, 306deg)'},
        {name: 'blue300', contrast: 4.5, value: 'lch(42%, 113, 306deg)'},
        {name: 'blue400', contrast: 8, value: 'lch(27%, 111, 306deg)'},
        {name: 'blue500', contrast: 12, value: 'lch(14%, 57, 306deg)'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 2, value: 'lch(66%, 59, 26deg)'},
        {name: 'red200', contrast: 3, value: 'lch(54%, 101, 39deg)'},
        {name: 'red300', contrast: 4.5, value: 'lch(43%, 88, 40deg)'},
        {name: 'red400', contrast: 8, value: 'lch(27%, 63, 39deg)'},
        {name: 'red500', contrast: 12, value: 'lch(14%, 40, 32deg)'}
      ]
    }
  ]);
});

test('should generate theme for three colors with negative ratios', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca', '#323232'],
    colorspace: 'HSL',
    ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 90
  });
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#e1e1e1'},
    {
      name: 'gray',
      values: [
        {name: 'gray33', contrast: -1.8, value: '#ffffff'},
        {name: 'gray67', contrast: -1.2, value: '#f5f5f5'},
        {name: 'gray100', contrast: 1, value: '#e1e1e1'},
        {name: 'gray200', contrast: 1.2, value: '#cecece'},
        {name: 'gray300', contrast: 1.4, value: '#bfbfbf'},
        {name: 'gray400', contrast: 2, value: '#a0a0a0'},
        {name: 'gray500', contrast: 3, value: '#808080'},
        {name: 'gray600', contrast: 4.5, value: '#646464'},
        {name: 'gray700', contrast: 6, value: '#515151'},
        {name: 'gray800', contrast: 8, value: '#3f3f3f'},
        {name: 'gray900', contrast: 12, value: '#232323'},
        {name: 'gray1000', contrast: 21, value: '#000000'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 2, value: '#b28aff'},
        {name: 'blue200', contrast: 3, value: '#8f62ff'},
        {name: 'blue300', contrast: 4.5, value: '#6339ff'},
        {name: 'blue400', contrast: 8, value: '#1e0bcf'},
        {name: 'blue500', contrast: 12, value: '#221165'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 2, value: '#ff7474'},
        {name: 'red200', contrast: 3, value: '#ff1111'},
        {name: 'red300', contrast: 4.5, value: '#cc0000'},
        {name: 'red400', contrast: 8, value: '#850000'},
        {name: 'red500', contrast: 12, value: '#4f0000'}
      ]
    }
  ]);
});

test('should generate theme for three colors using variables as parameters', (t) => {
  const tempRatios = [2, 3, 4.5, 8, 12];
  const baseRatios = [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21];

  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca', '#323232'],
    colorspace: 'HSL',
    ratios: baseRatios
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: tempRatios
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: tempRatios
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 90
  });
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#e1e1e1'},
    {
      name: 'gray',
      values: [
        {name: 'gray100', contrast: 1, value: '#e1e1e1'},
        {name: 'gray200', contrast: 1.2, value: '#cecece'},
        {name: 'gray300', contrast: 1.4, value: '#bfbfbf'},
        {name: 'gray400', contrast: 2, value: '#a0a0a0'},
        {name: 'gray500', contrast: 3, value: '#808080'},
        {name: 'gray600', contrast: 4.5, value: '#646464'},
        {name: 'gray700', contrast: 6, value: '#515151'},
        {name: 'gray800', contrast: 8, value: '#3f3f3f'},
        {name: 'gray900', contrast: 12, value: '#232323'},
        {name: 'gray1000', contrast: 21, value: '#000000'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 2, value: '#b28aff'},
        {name: 'blue200', contrast: 3, value: '#8f62ff'},
        {name: 'blue300', contrast: 4.5, value: '#6339ff'},
        {name: 'blue400', contrast: 8, value: '#1e0bcf'},
        {name: 'blue500', contrast: 12, value: '#221165'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 2, value: '#ff7474'},
        {name: 'red200', contrast: 3, value: '#ff1111'},
        {name: 'red300', contrast: 4.5, value: '#cc0000'},
        {name: 'red400', contrast: 8, value: '#850000'},
        {name: 'red500', contrast: 12, value: '#4f0000'}
      ]
    }
  ]);
});

test('should increase contrast of existing theme', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca', '#323232'],
    colorspace: 'HSL',
    ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 90
  });
  theme.contrast = 1.4;
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#e1e1e1'},
    {
      name: 'gray',
      values: [
        {name: 'gray33', contrast: -2.12, value: '#ffffff'},
        {name: 'gray67', contrast: -1.28, value: '#fdfdfd'},
        {name: 'gray100', contrast: 1, value: '#e1e1e1'},
        {name: 'gray200', contrast: 1.28, value: '#c8c8c8'},
        {name: 'gray300', contrast: 1.56, value: '#b5b5b5'},
        {name: 'gray400', contrast: 2.4, value: '#919191'},
        {name: 'gray500', contrast: 3.8, value: '#6f6f6f'},
        {name: 'gray600', contrast: 5.9, value: '#525252'},
        {name: 'gray700', contrast: 8, value: '#3f3f3f'},
        {name: 'gray800', contrast: 10.8, value: '#2b2b2b'},
        {name: 'gray900', contrast: 16.4, value: '#000000'},
        {name: 'gray1000', contrast: 29, value: '#000000'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 2.4, value: '#a378ff'},
        {name: 'blue200', contrast: 3.8, value: '#774aff'},
        {name: 'blue300', contrast: 5.9, value: '#3418ff'},
        {name: 'blue400', contrast: 10.8, value: '#251183'},
        {name: 'blue500', contrast: 16.4, value: '#000000'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 2.4, value: '#ff5555'},
        {name: 'red200', contrast: 3.8, value: '#e10000'},
        {name: 'red300', contrast: 5.9, value: '#aa0000'},
        {name: 'red400', contrast: 10.8, value: '#5f0000'},
        {name: 'red500', contrast: 16.4, value: '#000000'}
      ]
    }
  ]);
});

test('should generate theme with increased contrast', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca', '#323232'],
    colorspace: 'HSL',
    ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 90,
    contrast: 1.4
  });
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#e1e1e1'},
    {
      name: 'gray',
      values: [
        {name: 'gray33', contrast: -2.12, value: '#ffffff'},
        {name: 'gray67', contrast: -1.28, value: '#fdfdfd'},
        {name: 'gray100', contrast: 1, value: '#e1e1e1'},
        {name: 'gray200', contrast: 1.28, value: '#c8c8c8'},
        {name: 'gray300', contrast: 1.56, value: '#b5b5b5'},
        {name: 'gray400', contrast: 2.4, value: '#919191'},
        {name: 'gray500', contrast: 3.8, value: '#6f6f6f'},
        {name: 'gray600', contrast: 5.9, value: '#525252'},
        {name: 'gray700', contrast: 8, value: '#3f3f3f'},
        {name: 'gray800', contrast: 10.8, value: '#2b2b2b'},
        {name: 'gray900', contrast: 16.4, value: '#000000'},
        {name: 'gray1000', contrast: 29, value: '#000000'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 2.4, value: '#a378ff'},
        {name: 'blue200', contrast: 3.8, value: '#774aff'},
        {name: 'blue300', contrast: 5.9, value: '#3418ff'},
        {name: 'blue400', contrast: 10.8, value: '#251183'},
        {name: 'blue500', contrast: 16.4, value: '#000000'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 2.4, value: '#ff5555'},
        {name: 'red200', contrast: 3.8, value: '#e10000'},
        {name: 'red300', contrast: 5.9, value: '#aa0000'},
        {name: 'red400', contrast: 10.8, value: '#5f0000'},
        {name: 'red500', contrast: 16.4, value: '#000000'}
      ]
    }
  ]);
});

test('should generate white theme with increased contrast', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca'],
    colorspace: 'HSL',
    ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 100,
    contrast: 2
  });
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#ffffff'},
    {
      name: 'gray',
      values: [
        {name: 'gray33', contrast: -2.6, value: '#ffffff'},
        {name: 'gray67', contrast: -1.4, value: '#ffffff'},
        {name: 'gray100', contrast: 1, value: '#fefefe'},
        {name: 'gray200', contrast: 1.4, value: '#dadada'},
        {name: 'gray300', contrast: 1.8, value: '#c1c1c1'},
        {name: 'gray400', contrast: 3, value: '#959595'},
        {name: 'gray500', contrast: 5, value: '#6f6f6f'},
        {name: 'gray600', contrast: 8, value: '#505050'},
        {name: 'gray700', contrast: 11, value: '#3c3c3c'},
        {name: 'gray800', contrast: 15, value: '#272727'},
        {name: 'gray900', contrast: 23, value: '#000000'},
        {name: 'gray1000', contrast: 41, value: '#000000'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 3, value: '#a77cff'},
        {name: 'blue200', contrast: 5, value: '#764aff'},
        {name: 'blue300', contrast: 8, value: '#2912ff'},
        {name: 'blue400', contrast: 15, value: '#241172'},
        {name: 'blue500', contrast: 23, value: '#000000'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 3, value: '#ff5d5d'},
        {name: 'red200', contrast: 5, value: '#e10000'},
        {name: 'red300', contrast: 8, value: '#a60000'},
        {name: 'red400', contrast: 15, value: '#560000'},
        {name: 'red500', contrast: 23, value: '#000000'}
      ]
    }
  ]);
});

test('should generate dark theme with increased contrast', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca'],
    colorspace: 'HSL',
    ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 20,
    contrast: 1.5
  });
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#303030'},
    {
      name: 'gray',
      values: [
        {name: 'gray33', contrast: -2.2, value: '#000000'},
        {name: 'gray67', contrast: -1.3, value: '#1b1b1b'},
        {name: 'gray100', contrast: 1, value: '#303030'},
        {name: 'gray200', contrast: 1.3, value: '#424242'},
        {name: 'gray300', contrast: 1.6, value: '#4f4f4f'},
        {name: 'gray400', contrast: 2.5, value: '#6c6c6c'},
        {name: 'gray500', contrast: 4, value: '#8d8d8d'},
        {name: 'gray600', contrast: 6.25, value: '#b2b2b2'},
        {name: 'gray700', contrast: 8.5, value: '#cfcfcf'},
        {name: 'gray800', contrast: 11.5, value: '#efefef'},
        {name: 'gray900', contrast: 17.5, value: '#ffffff'},
        {name: 'gray1000', contrast: 31, value: '#ffffff'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 2.5, value: '#7045ff'},
        {name: 'blue200', contrast: 4, value: '#9f73ff'},
        {name: 'blue300', contrast: 6.25, value: '#c4a2ff'},
        {name: 'blue400', contrast: 11.5, value: '#f4ecff'},
        {name: 'blue500', contrast: 17.5, value: '#ffffff'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 2.5, value: '#da0000'},
        {name: 'red200', contrast: 4, value: '#ff4b4b'},
        {name: 'red300', contrast: 6.25, value: '#ff9494'},
        {name: 'red400', contrast: 11.5, value: '#ffeaea'},
        {name: 'red500', contrast: 17.5, value: '#ffffff'}
      ]
    }
  ]);
});

test('should generate colors with user-defined names', (t) => {
  const grayRatios = {
    GRAY_1: -1.8,
    GRAY_2: -1.2,
    GRAY_3: 1,
    GRAY_4: 1.2,
    GRAY_5: 1.4,
    GRAY_6: 2,
    GRAY_7: 3,
    GRAY_8: 4.5,
    GRAY_9: 21
  };
  const blueRatios = {
    BLUE_LARGE_TEXT: 3,
    BLUE_TEXT: 4.5,
    BLUE_HIGH_CONTRAST: 8,
    BLUE_HIGHEST_CONTRAST: 12
  };
  const redRatios = {
    'red--largeText': 3,
    'red--text': 4.5,
    'red--highContrast': 8,
    'red--highestContrast': 12
  };

  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca'],
    colorspace: 'HSL',
    ratios: grayRatios
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: blueRatios
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: redRatios
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 20
  });
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#303030'},
    {
      name: 'gray',
      values: [
        {name: 'GRAY_1', contrast: -1.8, value: '#000000'},
        {name: 'GRAY_2', contrast: -1.2, value: '#222222'},
        {name: 'GRAY_3', contrast: 1, value: '#303030'},
        {name: 'GRAY_4', contrast: 1.2, value: '#3c3c3c'},
        {name: 'GRAY_5', contrast: 1.4, value: '#464646'},
        {name: 'GRAY_6', contrast: 2, value: '#5d5d5d'},
        {name: 'GRAY_7', contrast: 3, value: '#787878'},
        {name: 'GRAY_8', contrast: 4.5, value: '#969696'},
        {name: 'GRAY_9', contrast: 21, value: '#ffffff'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'BLUE_LARGE_TEXT', contrast: 3, value: '#8457ff'},
        {name: 'BLUE_TEXT', contrast: 4.5, value: '#a97fff'},
        {name: 'BLUE_HIGH_CONTRAST', contrast: 8, value: '#d8beff'},
        {name: 'BLUE_HIGHEST_CONTRAST', contrast: 12, value: '#f7f2ff'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red--largeText', contrast: 3, value: '#f20000'},
        {name: 'red--text', contrast: 4.5, value: '#ff6262'},
        {name: 'red--highContrast', contrast: 8, value: '#ffb7b7'},
        {name: 'red--highestContrast', contrast: 12, value: '#fff1f1'}
      ]
    }
  ]);
});

test('should generate colors with user-defined names as key-value pairs', (t) => {
  const grayRatios = {
    GRAY_1: -1.8,
    GRAY_2: -1.2,
    GRAY_3: 1,
    GRAY_4: 1.2,
    GRAY_5: 1.4,
    GRAY_6: 2,
    GRAY_7: 3,
    GRAY_8: 4.5,
    GRAY_9: 21
  };
  const blueRatios = {
    BLUE_LARGE_TEXT: 3,
    BLUE_TEXT: 4.5,
    BLUE_HIGH_CONTRAST: 8,
    BLUE_HIGHEST_CONTRAST: 12
  };
  const redRatios = {
    'red--largeText': 3,
    'red--text': 4.5,
    'red--highContrast': 8,
    'red--highestContrast': 12
  };

  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca'],
    colorspace: 'HSL',
    ratios: grayRatios
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: blueRatios
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: redRatios
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 20
  });
  const themeColors = theme.contrastColorPairs;

  t.deepEqual(themeColors, {
    background: '#303030',
    GRAY_1: '#000000',
    GRAY_2: '#222222',
    GRAY_3: '#303030',
    GRAY_4: '#3c3c3c',
    GRAY_5: '#464646',
    GRAY_6: '#5d5d5d',
    GRAY_7: '#787878',
    GRAY_8: '#969696',
    GRAY_9: '#ffffff',
    BLUE_LARGE_TEXT: '#8457ff',
    BLUE_TEXT: '#a97fff',
    BLUE_HIGH_CONTRAST: '#d8beff',
    BLUE_HIGHEST_CONTRAST: '#f7f2ff',
    'red--largeText': '#f20000',
    'red--text': '#ff6262',
    'red--highContrast': '#ffb7b7',
    'red--highestContrast': '#fff1f1'
  });
});

test('should generate colors with user-defined names and increased contrast', (t) => {
  const grayRatios = {
    GRAY_1: -2,
    GRAY_2: -1.2,
    GRAY_3: 1,
    GRAY_4: 1.2,
    GRAY_5: 1.4,
    GRAY_6: 2,
    GRAY_7: 3,
    GRAY_8: 4.5,
    GRAY_9: 21
  };
  const blueRatios = {
    BLUE_LARGE_TEXT: 3,
    BLUE_TEXT: 4.5,
    BLUE_HIGH_CONTRAST: 8,
    BLUE_HIGHEST_CONTRAST: 12
  };
  const redRatios = {
    'red--largeText': 3,
    'red--text': 4.5,
    'red--highContrast': 8,
    'red--highestContrast': 12
  };

  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca'],
    colorspace: 'HSL',
    ratios: grayRatios
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: blueRatios
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: redRatios
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 20,
    contrast: 1.2
  });
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#303030'},
    {
      name: 'gray',
      values: [
        {name: 'GRAY_1', contrast: -2.2, value: '#000000'},
        {name: 'GRAY_2', contrast: -1.24, value: '#1f1f1f'},
        {name: 'GRAY_3', contrast: 1, value: '#303030'},
        {name: 'GRAY_4', contrast: 1.24, value: '#3f3f3f'},
        {name: 'GRAY_5', contrast: 1.48, value: '#4a4a4a'},
        {name: 'GRAY_6', contrast: 2.2, value: '#636363'},
        {name: 'GRAY_7', contrast: 3.4, value: '#828282'},
        {name: 'GRAY_8', contrast: 5.2, value: '#a2a2a2'},
        {name: 'GRAY_9', contrast: 25, value: '#ffffff'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'BLUE_LARGE_TEXT', contrast: 3.4, value: '#9063ff'},
        {name: 'BLUE_TEXT', contrast: 5.2, value: '#b58eff'},
        {name: 'BLUE_HIGH_CONTRAST', contrast: 9.4, value: '#e4d2ff'},
        {name: 'BLUE_HIGHEST_CONTRAST', contrast: 14.2, value: '#ffffff'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red--largeText', contrast: 3.4, value: '#ff1919'},
        {name: 'red--text', contrast: 5.2, value: '#ff7979'},
        {name: 'red--highContrast', contrast: 9.4, value: '#ffcece'},
        {name: 'red--highestContrast', contrast: 14.2, value: '#ffffff'}
      ]
    }
  ]);
});

/**
 * Single-color theme tests with fixed backround color.
 * These tests are for the new method of generating contrast
 * colors for a single color scale with a non-scale-based
 * background. Replaces `new Color` function
 */

// Test simple generation in all color spaces
test('should generate 2 colors (CAM02 interpolation)', (t) => {
  const gray = new Color({
    name: 'gray',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    colorspace: 'CAM02',
    ratios: [3, 4.5]
  });
  const theme = new Theme({colors: [gray], backgroundColor: '#f5f5f5'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#548fe0', '#2b66f0']);
});

test('should generate 2 colors (LAB interpolation)', (t) => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'LAB'
  });
  const theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#7582ff', '#435eff']);
});

test('should generate 2 colors (LCH interpolation)', (t) => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'LCH'
  });
  const theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#0090ff', '#0064ff']);
});

test('should generate 2 colors (HSL interpolation)', (t) => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'HSL'
  });
  const theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#478bfe', '#2d61ff']);
});

test('should generate 2 colors (HSLuv interpolation)', (t) => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'HSLuv'
  });
  const theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#1896dc', '#066be8']);
});

test('should generate 2 colors (HSV interpolation)', (t) => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'HSV'
  });
  const theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#478bff', '#2d62ff']);
});

test('should generate 2 colors (RGB interpolation)', (t) => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'RGB'
  });
  const theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#5988ff', '#3360ff']);
});

test('should generate 2 colors on dark background', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'LCH'
  });
  const theme = new Theme({colors: [color], backgroundColor: '#323232'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#0073ff', '#009eff']);
});

// Check bidirectionality of contrast ratios (positive vs negative)
test('should generate 2 colors with bidirectional contrast (light background)', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#012676'],
    ratios: [-1.25, 4.5],
    colorspace: 'LCH'
  }); // positive & negative ratios
  const theme = new Theme({colors: [color], backgroundColor: '#D8D8D8'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#f1f0f6', '#58589a']);
});

test('should generate 2 colors with bidirectional contrast (dark background)', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#012676'],
    ratios: [-1.25, 4.5],
    colorspace: 'LCH'
  }); // positive & negative ratios
  const theme = new Theme({colors: [color], backgroundColor: '#323232'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#121c4e', '#9894c0']);
});

// Contrast gamuts
test('should generate black when ratio darker than available colors', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [21],
    colorspace: 'LCH'
  }); // positive & negative ratios
  const theme = new Theme({colors: [color], backgroundColor: '#d8d8d8'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#000000']);
});

test('should generate white when ratio lighter than available colors', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [21],
    colorspace: 'LCH'
  }); // positive & negative ratios
  const theme = new Theme({colors: [color], backgroundColor: '#323232'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#ffffff']);
});

test('should generate white when negative ratio lighter than available colors (light gray background)', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [-21],
    colorspace: 'LCH'
  });
  const theme = new Theme({colors: [color], backgroundColor: '#f5f5f5'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#ffffff']);
});
test('should generate white when negative ratio lighter than available colors (white background)', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [-21],
    colorspace: 'LCH'
  });
  const theme = new Theme({colors: [color], backgroundColor: '#ffffff'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#ffffff']);
});

test('should generate black when negative ratio darker than available colors (gray background)', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [-21],
    colorspace: 'LCH'
  }); // positive & negative ratios
  const theme = new Theme({colors: [color], backgroundColor: '#323232'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#000000']);
});

test('should generate black when negative ratio darker than available colors (black background)', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [-21],
    colorspace: 'LCH'
  }); // positive & negative ratios
  const theme = new Theme({colors: [color], backgroundColor: '#000000'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#000000']);
});

// Mid-Tone Backgrounds
test('should generate slightly lighter & darker grays on a darker midtone gray background', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#000000'],
    ratios: [1.2, -1.2],
    colorspace: 'LCH'
  }); // positive & negative ratios
  const theme = new Theme({colors: [color], backgroundColor: '#6b6b6b'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#787878', '#5f5f5f']);
});
test('should generate slightly lighter & darker grays on a lighter midtone gray background', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#000000'],
    ratios: [1.2, -1.2],
    colorspace: 'LCH'
  }); // positive & negative ratios
  const theme = new Theme({colors: [color], backgroundColor: '#787878'});
  const themeColors = theme.contrastColors;

  // t.deepEqual(themeColors, [ '#6b6b6b', '#858585' ]);
  t.deepEqual(themeColors, [
    {background: '#787878'},
    {
      name: 'Color',
      values: [
        {name: 'Color50', contrast: 1.2, value: '#6b6b6b'},
        {name: 'Color100', contrast: -1.2, value: '#858585'}
      ]
    }
  ]);
});
test('should generate slightly lighter & darker oranges on a darker midtone slate background', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#ff8602', '#ab3c00', '#ffd88b'],
    ratios: [1.2, -1.2],
    colorspace: 'LCH'
  }); // positive & negative ratios
  const theme = new Theme({colors: [color], backgroundColor: '#537a9c'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#b54500', '#d76102']);
});

test('should generate slightly lighter & darker oranges on a lighter midtone slate background', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#ff8602', '#ab3c00', '#ffd88b'],
    ratios: [1.2, -1.2],
    colorspace: 'LCH'
  }); // positive & negative ratios
  const theme = new Theme({colors: [color], backgroundColor: '#537b9d'});
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#b84601', '#d86202']);
});

// Output formats
test('should generate 2 colors in HEX format', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'CAM02'
  });
  const theme = new Theme({
    colors: [color],
    backgroundColor: '#f5f5f5',
    output: 'HEX'
  });
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['#548fe0', '#2b66f0']);
});
test('should generate 2 colors in RGB format', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'CAM02'
  });
  const theme = new Theme({
    colors: [color],
    backgroundColor: '#f5f5f5',
    output: 'RGB'
  });
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['rgb(84, 143, 224)', 'rgb(43, 102, 240)']);
});
test('should generate 2 colors in HSL format', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'CAM02'
  });
  const theme = new Theme({
    colors: [color],
    backgroundColor: '#f5f5f5',
    output: 'HSL'
  });
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['hsl(215deg, 69%, 60%)', 'hsl(222deg, 87%, 55%)']);
});
test('should generate 2 colors in HSV format', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'CAM02'
  });
  const theme = new Theme({
    colors: [color],
    backgroundColor: '#f5f5f5',
    output: 'HSV'
  });
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['hsv(215deg, 63%, 88%)', 'hsv(222deg, 82%, 94%)']);
});
test('should generate 2 colors in LAB format', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'CAM02'
  });
  const theme = new Theme({
    colors: [color],
    backgroundColor: '#f5f5f5',
    output: 'LAB'
  });
  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['lab(59%, 6, -47)', 'lab(47%, 31, -74)']);
});
test('should generate 2 colors in LCH format', (t) => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'CAM02'
  });
  const theme = new Theme({
    colors: [color],
    backgroundColor: '#f5f5f5',
    output: 'LCH'
  });

  const themeColors = theme.contrastColorValues;

  t.deepEqual(themeColors, ['lch(59%, 47, 277deg)', 'lch(47%, 81, 293deg)']);
});

// Add color to theme
test('should add a color to existing theme', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca', '#323232'],
    colorspace: 'HSL',
    ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 90
  });

  const yellow = new Color({
    name: 'yellow',
    colorKeys: ['#ffff00'],
    colorspace: 'HSL',
    ratios: [2, 3, 4.5, 8, 12]
  });
  theme.addColor = yellow;

  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#e1e1e1'},
    {
      name: 'gray',
      values: [
        {name: 'gray100', contrast: 1, value: '#e1e1e1'},
        {name: 'gray200', contrast: 1.2, value: '#cecece'},
        {name: 'gray300', contrast: 1.4, value: '#bfbfbf'},
        {name: 'gray400', contrast: 2, value: '#a0a0a0'},
        {name: 'gray500', contrast: 3, value: '#808080'},
        {name: 'gray600', contrast: 4.5, value: '#646464'},
        {name: 'gray700', contrast: 6, value: '#515151'},
        {name: 'gray800', contrast: 8, value: '#3f3f3f'},
        {name: 'gray900', contrast: 12, value: '#232323'},
        {name: 'gray1000', contrast: 21, value: '#000000'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 2, value: '#b28aff'},
        {name: 'blue200', contrast: 3, value: '#8f62ff'},
        {name: 'blue300', contrast: 4.5, value: '#6339ff'},
        {name: 'blue400', contrast: 8, value: '#1e0bcf'},
        {name: 'blue500', contrast: 12, value: '#221165'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 2, value: '#ff7474'},
        {name: 'red200', contrast: 3, value: '#ff1111'},
        {name: 'red300', contrast: 4.5, value: '#cc0000'},
        {name: 'red400', contrast: 8, value: '#850000'},
        {name: 'red500', contrast: 12, value: '#4f0000'}
      ]
    },
    {
      name: 'yellow',
      values: [
        {name: 'yellow100', contrast: 2, value: '#a5a500'},
        {name: 'yellow200', contrast: 3, value: '#858500'},
        {name: 'yellow300', contrast: 4.5, value: '#686800'},
        {name: 'yellow400', contrast: 8, value: '#414100'},
        {name: 'yellow500', contrast: 12, value: '#242400'}
      ]
    }
  ]);
});

test('should remove a color from existing theme', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca', '#323232'],
    colorspace: 'HSL',
    ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const yellow = new Color({
    name: 'yellow',
    colorKeys: ['#ffff00'],
    colorspace: 'HSL',
    ratios: [2, 3, 4.5, 8, 12]
  });
  const theme = new Theme({
    colors: [gray, blue, red, yellow],
    backgroundColor: gray,
    lightness: 90
  });
  theme.removeColor = yellow;

  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#e1e1e1'},
    {
      name: 'gray',
      values: [
        {name: 'gray100', contrast: 1, value: '#e1e1e1'},
        {name: 'gray200', contrast: 1.2, value: '#cecece'},
        {name: 'gray300', contrast: 1.4, value: '#bfbfbf'},
        {name: 'gray400', contrast: 2, value: '#a0a0a0'},
        {name: 'gray500', contrast: 3, value: '#808080'},
        {name: 'gray600', contrast: 4.5, value: '#646464'},
        {name: 'gray700', contrast: 6, value: '#515151'},
        {name: 'gray800', contrast: 8, value: '#3f3f3f'},
        {name: 'gray900', contrast: 12, value: '#232323'},
        {name: 'gray1000', contrast: 21, value: '#000000'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 2, value: '#b28aff'},
        {name: 'blue200', contrast: 3, value: '#8f62ff'},
        {name: 'blue300', contrast: 4.5, value: '#6339ff'},
        {name: 'blue400', contrast: 8, value: '#1e0bcf'},
        {name: 'blue500', contrast: 12, value: '#221165'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 2, value: '#ff7474'},
        {name: 'red200', contrast: 3, value: '#ff1111'},
        {name: 'red300', contrast: 4.5, value: '#cc0000'},
        {name: 'red400', contrast: 8, value: '#850000'},
        {name: 'red500', contrast: 12, value: '#4f0000'}
      ]
    }
  ]);
});

/**
 * APCA contrast test
 */

test('should use APCA to generate theme for three colors', (t) => {
  const gray = new BackgroundColor({
    name: 'gray',
    colorKeys: ['#cacaca', '#323232'],
    colorspace: 'HSL',
    ratios: [8, 60, 75, 90, 106]
  });
  const blue = new Color({
    name: 'blue',
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: [40, 60, 75, 90]
  });
  const red = new Color({
    name: 'red',
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: [40, 60, 75, 90]
  });
  const theme = new Theme({
    colors: [gray, blue, red],
    backgroundColor: gray,
    lightness: 100,
    formula: 'wcag3'
  });
  const themeColors = theme.contrastColors;

  t.deepEqual(themeColors, [
    {background: '#ffffff'},
    {
      name: 'gray',
      values: [
        {name: 'gray100', contrast: 8, value: '#ededed'},
        {name: 'gray200', contrast: 60, value: '#8e8e8e'},
        {name: 'gray300', contrast: 75, value: '#6e6e6e'},
        {name: 'gray400', contrast: 90, value: '#4b4b4b'},
        {name: 'gray500', contrast: 106, value: '#050505'}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: 'blue100', contrast: 40, value: '#c6a4ff'},
        {name: 'blue200', contrast: 60, value: '#9f73ff'},
        {name: 'blue300', contrast: 75, value: '#7145ff'},
        {name: 'blue400', contrast: 90, value: '#1a08dd'}
      ]
    },
    {
      name: 'red',
      values: [
        {name: 'red100', contrast: 40, value: '#ff9797'},
        {name: 'red200', contrast: 60, value: '#ff4444'},
        {name: 'red300', contrast: 75, value: '#d20000'},
        {name: 'red400', contrast: 90, value: '#8f0000'}
      ]
    }
  ]);
});

/**
 * Expected errors
 */
test('should generate no colors, missing colorKeys', (t) => {
  t.throws(() => {
    // eslint-disable-next-line no-unused-vars
    const color = new Color({name: 'Color', ratios: [3, 4.5]}); // no key colors
  });
});

test('should generate no colors, missing ratios', (t) => {
  t.throws(() => {
    const color = new Color({
      name: 'Color',
      colorKeys: ['#2451FF', '#C9FEFE', '#012676']
    }); // no ratios
    // eslint-disable-next-line no-unused-vars
    const theme = new Theme({colors: [color], background: '#ffffff'});
  });
});

test('should generate no colors, missing background', (t) => {
  t.throws(() => {
    const color = new Color({
      name: 'Color',
      colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
      ratios: [3, 4.5]
    });
    // eslint-disable-next-line no-unused-vars
    const theme = new Theme({colors: [color]}); // no base
  });
});

test('should throw error, missing hash on hex value', (t) => {
  t.throws(() => {
    // eslint-disable-next-line no-unused-vars
    const color = new Color({
      name: 'Color',
      colorKeys: ['#2451FF', 'blah', '#012676'],
      ratios: [3, 4.5]
    }); // third color missing hash #
  });
});

test('should throw error, incomplete hex value', (t) => {
  t.throws(() => {
    // eslint-disable-next-line no-unused-vars
    const color = new Color({
      name: 'Color',
      colorKeys: ['#2451FF', '#C9FEF', '#012676'],
      ratios: [3, 4.5]
    }); // third color missing final hex code
  });
});
