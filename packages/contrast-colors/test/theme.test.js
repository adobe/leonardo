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
const { Theme, Color, BackgroundColor } = require('../index');

test('should generate theme for three colors', () => {
  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca', '#323232'], colorspace: 'HSL', ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21] });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12] });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12] });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 90 });
  const themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { background: '#e1e1e1' },
    {
      name: 'gray',
      values: [
        { name: 'gray100', contrast: 1, value: '#e1e1e1' },
        { name: 'gray200', contrast: 1.2, value: '#cecece' },
        { name: 'gray300', contrast: 1.4, value: '#bfbfbf' },
        { name: 'gray400', contrast: 2, value: '#a0a0a0' },
        { name: 'gray500', contrast: 3, value: '#808080' },
        { name: 'gray600', contrast: 4.5, value: '#646464' },
        { name: 'gray700', contrast: 6, value: '#515151' },
        { name: 'gray800', contrast: 8, value: '#3f3f3f' },
        { name: 'gray900', contrast: 12, value: '#232323' },
        { name: 'gray1000', contrast: 21, value: '#000000' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'blue100', contrast: 2, value: '#b08bff' },
        { name: 'blue200', contrast: 3, value: '#8d63ff' },
        { name: 'blue300', contrast: 4.5, value: '#623aff' },
        { name: 'blue400', contrast: 8, value: '#1c0ad0' },
        { name: 'blue500', contrast: 12, value: '#211068' },
      ],
    },
    {
      name: 'red',
      values: [
        { name: 'red100', contrast: 2, value: '#ff7474' },
        { name: 'red200', contrast: 3, value: '#ff1212' },
        { name: 'red300', contrast: 4.5, value: '#cc0000' },
        { name: 'red400', contrast: 8, value: '#850000' },
        { name: 'red500', contrast: 12, value: '#4f0000' },
      ],
    },
  ]);
});

test('should generate theme for three colors in LCH format', () => {
  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca', '#323232'], colorspace: 'HSL', ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21] });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12] });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12] });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 90, output: 'LCH' });
  const themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { background: 'lch(90%, 0, 0deg)' },
    {
      name: 'gray',
      values: [
        { name: 'gray100', contrast: 1, value: 'lch(90%, 0, 0deg)' },
        { name: 'gray200', contrast: 1.2, value: 'lch(83%, 0, 0deg)' },
        { name: 'gray300', contrast: 1.4, value: 'lch(77%, 0, 0deg)' },
        { name: 'gray400', contrast: 2, value: 'lch(66%, 0, 0deg)' },
        { name: 'gray500', contrast: 3, value: 'lch(54%, 0, 0deg)' },
        { name: 'gray600', contrast: 4.5, value: 'lch(42%, 0, 0deg)' },
        { name: 'gray700', contrast: 6, value: 'lch(34%, 0, 0deg)' },
        { name: 'gray800', contrast: 8, value: 'lch(27%, 0, 0deg)' },
        { name: 'gray900', contrast: 12, value: 'lch(14%, 0, 0deg)' },
        { name: 'gray1000', contrast: 21, value: 'lch(0%, 0, 0deg)' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'blue100', contrast: 2, value: 'lch(65%, 63, 302deg)' },
        { name: 'blue200', contrast: 3, value: 'lch(53%, 86, 301deg)' },
        { name: 'blue300', contrast: 4.5, value: 'lch(41%, 109, 301deg)' },
        { name: 'blue400', contrast: 8, value: 'lch(25%, 109, 301deg)' },
        { name: 'blue500', contrast: 12, value: 'lch(13%, 57, 301deg)' },
      ],
    },
    {
      name: 'red',
      values: [
        { name: 'red100', contrast: 2, value: 'lch(66%, 61, 27deg)' },
        { name: 'red200', contrast: 3, value: 'lch(55%, 103, 39deg)' },
        { name: 'red300', contrast: 4.5, value: 'lch(43%, 90, 41deg)' },
        { name: 'red400', contrast: 8, value: 'lch(27%, 65, 39deg)' },
        { name: 'red500', contrast: 12, value: 'lch(14%, 41, 33deg)' },
      ],
    },
  ]);
});

test('should generate theme for three colors with negative ratios', () => {
  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca', '#323232'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21] });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12] });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12] });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 90 });
  const themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { background: '#e1e1e1' },
    {
      name: 'gray',
      values: [
        { name: 'gray33', contrast: -1.8, value: '#ffffff' },
        { name: 'gray67', contrast: -1.2, value: '#f5f5f5' },
        { name: 'gray100', contrast: 1, value: '#e1e1e1' },
        { name: 'gray200', contrast: 1.2, value: '#cecece' },
        { name: 'gray300', contrast: 1.4, value: '#bfbfbf' },
        { name: 'gray400', contrast: 2, value: '#a0a0a0' },
        { name: 'gray500', contrast: 3, value: '#808080' },
        { name: 'gray600', contrast: 4.5, value: '#646464' },
        { name: 'gray700', contrast: 6, value: '#515151' },
        { name: 'gray800', contrast: 8, value: '#3f3f3f' },
        { name: 'gray900', contrast: 12, value: '#232323' },
        { name: 'gray1000', contrast: 21, value: '#000000' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'blue100', contrast: 2, value: '#b08bff' },
        { name: 'blue200', contrast: 3, value: '#8d63ff' },
        { name: 'blue300', contrast: 4.5, value: '#623aff' },
        { name: 'blue400', contrast: 8, value: '#1c0ad0' },
        { name: 'blue500', contrast: 12, value: '#211068' },
      ],
    },
    {
      name: 'red',
      values: [
        { name: 'red100', contrast: 2, value: '#ff7474' },
        { name: 'red200', contrast: 3, value: '#ff1212' },
        { name: 'red300', contrast: 4.5, value: '#cc0000' },
        { name: 'red400', contrast: 8, value: '#850000' },
        { name: 'red500', contrast: 12, value: '#4f0000' },
      ],
    },
  ]);
});

test('should generate theme for three colors using variables as parameters', () => {
  const tempRatios = [2, 3, 4.5, 8, 12];
  const baseRatios = [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21];

  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca', '#323232'], colorspace: 'HSL', ratios: baseRatios });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: tempRatios });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: tempRatios });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 90 });
  const themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { background: '#e1e1e1' },
    {
      name: 'gray',
      values: [
        { name: 'gray100', contrast: 1, value: '#e1e1e1' },
        { name: 'gray200', contrast: 1.2, value: '#cecece' },
        { name: 'gray300', contrast: 1.4, value: '#bfbfbf' },
        { name: 'gray400', contrast: 2, value: '#a0a0a0' },
        { name: 'gray500', contrast: 3, value: '#808080' },
        { name: 'gray600', contrast: 4.5, value: '#646464' },
        { name: 'gray700', contrast: 6, value: '#515151' },
        { name: 'gray800', contrast: 8, value: '#3f3f3f' },
        { name: 'gray900', contrast: 12, value: '#232323' },
        { name: 'gray1000', contrast: 21, value: '#000000' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'blue100', contrast: 2, value: '#b08bff' },
        { name: 'blue200', contrast: 3, value: '#8d63ff' },
        { name: 'blue300', contrast: 4.5, value: '#623aff' },
        { name: 'blue400', contrast: 8, value: '#1c0ad0' },
        { name: 'blue500', contrast: 12, value: '#211068' },
      ],
    },
    {
      name: 'red',
      values: [
        { name: 'red100', contrast: 2, value: '#ff7474' },
        { name: 'red200', contrast: 3, value: '#ff1212' },
        { name: 'red300', contrast: 4.5, value: '#cc0000' },
        { name: 'red400', contrast: 8, value: '#850000' },
        { name: 'red500', contrast: 12, value: '#4f0000' },
      ],
    },
  ]);
});

test('should generate theme with increased contrast', () => {
  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca', '#323232'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21] });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12] });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12] });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 90, contrast: 1.4 });
  const themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { background: '#e1e1e1' },
    {
      name: 'gray',
      values: [
        { name: 'gray33', contrast: -2.12, value: '#ffffff' },
        { name: 'gray67', contrast: -1.28, value: '#fdfdfd' },
        { name: 'gray100', contrast: 1, value: '#e1e1e1' },
        { name: 'gray200', contrast: 1.28, value: '#c8c8c8' },
        { name: 'gray300', contrast: 1.56, value: '#b5b5b5' },
        { name: 'gray400', contrast: 2.4, value: '#919191' },
        { name: 'gray500', contrast: 3.8, value: '#6f6f6f' },
        { name: 'gray600', contrast: 5.9, value: '#525252' },
        { name: 'gray700', contrast: 8, value: '#3f3f3f' },
        { name: 'gray800', contrast: 10.8, value: '#2b2b2b' },
        { name: 'gray900', contrast: 16.4, value: '#000000' },
        { name: 'gray1000', contrast: 29, value: '#000000' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'blue100', contrast: 2.4, value: '#a179ff' },
        { name: 'blue200', contrast: 3.8, value: '#764bff' },
        { name: 'blue300', contrast: 5.9, value: '#3418ff' },
        { name: 'blue400', contrast: 10.8, value: '#231085' },
        { name: 'blue500', contrast: 16.4, value: '#000000' },
      ],
    },
    {
      name: 'red',
      values: [
        { name: 'red100', contrast: 2.4, value: '#ff5555' },
        { name: 'red200', contrast: 3.8, value: '#e10000' },
        { name: 'red300', contrast: 5.9, value: '#aa0000' },
        { name: 'red400', contrast: 10.8, value: '#5f0000' },
        { name: 'red500', contrast: 16.4, value: '#000000' },
      ],
    },
  ]);
});

test('should generate white theme with increased contrast', () => {
  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21] });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12] });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12] });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 100, contrast: 2 });
  const themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { background: '#ffffff' },
    {
      name: 'gray',
      values: [
        { name: 'gray33', contrast: -2.6, value: '#ffffff' },
        { name: 'gray67', contrast: -1.4, value: '#ffffff' },
        { name: 'gray100', contrast: 1, value: '#ffffff' },
        { name: 'gray200', contrast: 1.4, value: '#dadada' },
        { name: 'gray300', contrast: 1.8, value: '#c1c1c1' },
        { name: 'gray400', contrast: 3, value: '#959595' },
        { name: 'gray500', contrast: 5, value: '#6f6f6f' },
        { name: 'gray600', contrast: 8, value: '#505050' },
        { name: 'gray700', contrast: 11, value: '#3c3c3c' },
        { name: 'gray800', contrast: 15, value: '#262626' },
        { name: 'gray900', contrast: 23, value: '#000000' },
        { name: 'gray1000', contrast: 41, value: '#000000' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'blue100', contrast: 3, value: '#a57dff' },
        { name: 'blue200', contrast: 5, value: '#754aff' },
        { name: 'blue300', contrast: 8, value: '#2912ff' },
        { name: 'blue400', contrast: 15, value: '#221075' },
        { name: 'blue500', contrast: 23, value: '#000000' },
      ],
    },
    {
      name: 'red',
      values: [
        { name: 'red100', contrast: 3, value: '#ff5d5d' },
        { name: 'red200', contrast: 5, value: '#e10000' },
        { name: 'red300', contrast: 8, value: '#a60000' },
        { name: 'red400', contrast: 15, value: '#560000' },
        { name: 'red500', contrast: 23, value: '#000000' },
      ],
    },
  ]);
});

test('should generate dark theme with increased contrast', () => {
  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21] });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12] });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12] });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 20, contrast: 1.5 });
  const themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { background: '#303030' },
    {
      name: 'gray',
      values: [
        { name: 'gray33', contrast: -2.2, value: '#000000' },
        { name: 'gray67', contrast: -1.3, value: '#1b1b1b' },
        { name: 'gray100', contrast: 1, value: '#303030' },
        { name: 'gray200', contrast: 1.3, value: '#424242' },
        { name: 'gray300', contrast: 1.6, value: '#4f4f4f' },
        { name: 'gray400', contrast: 2.5, value: '#6c6c6c' },
        { name: 'gray500', contrast: 4, value: '#8e8e8e' },
        { name: 'gray600', contrast: 6.25, value: '#b3b3b3' },
        { name: 'gray700', contrast: 8.5, value: '#d0d0d0' },
        { name: 'gray800', contrast: 11.5, value: '#f0f0f0' },
        { name: 'gray900', contrast: 17.5, value: '#ffffff' },
        { name: 'gray1000', contrast: 31, value: '#ffffff' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'blue100', contrast: 2.5, value: '#6f45ff' },
        { name: 'blue200', contrast: 4, value: '#9d74ff' },
        { name: 'blue300', contrast: 6.25, value: '#c3a3ff' },
        { name: 'blue400', contrast: 11.5, value: '#f4edff' },
        { name: 'blue500', contrast: 17.5, value: '#ffffff' },
      ],
    },
    {
      name: 'red',
      values: [
        { name: 'red100', contrast: 2.5, value: '#da0000' },
        { name: 'red200', contrast: 4, value: '#ff4b4b' },
        { name: 'red300', contrast: 6.25, value: '#ff9595' },
        { name: 'red400', contrast: 11.5, value: '#ffebeb' },
        { name: 'red500', contrast: 17.5, value: '#ffffff' },
      ],
    },
  ]);
});

test('should generate colors with user-defined names', () => {
  const grayRatios = {
    GRAY_1: -1.8,
    GRAY_2: -1.2,
    GRAY_3: 1,
    GRAY_4: 1.2,
    GRAY_5: 1.4,
    GRAY_6: 2,
    GRAY_7: 3,
    GRAY_8: 4.5,
    GRAY_9: 21,
  };
  const blueRatios = {
    BLUE_LARGE_TEXT: 3,
    BLUE_TEXT: 4.5,
    BLUE_HIGH_CONTRAST: 8,
    BLUE_HIGHEST_CONTRAST: 12,
  };
  const redRatios = {
    'red--largeText': 3,
    'red--text': 4.5,
    'red--highContrast': 8,
    'red--highestContrast': 12,
  };

  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: grayRatios });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: blueRatios });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: redRatios });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 20 });
  const themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { background: '#303030' },
    {
      name: 'gray',
      values: [
        { name: 'GRAY_1', contrast: -1.8, value: '#000000' },
        { name: 'GRAY_2', contrast: -1.2, value: '#222222' },
        { name: 'GRAY_3', contrast: 1, value: '#303030' },
        { name: 'GRAY_4', contrast: 1.2, value: '#3c3c3c' },
        { name: 'GRAY_5', contrast: 1.4, value: '#464646' },
        { name: 'GRAY_6', contrast: 2, value: '#5d5d5d' },
        { name: 'GRAY_7', contrast: 3, value: '#797979' },
        { name: 'GRAY_8', contrast: 4.5, value: '#979797' },
        { name: 'GRAY_9', contrast: 21, value: '#ffffff' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'BLUE_LARGE_TEXT', contrast: 3, value: '#8258ff' },
        { name: 'BLUE_TEXT', contrast: 4.5, value: '#a780ff' },
        { name: 'BLUE_HIGH_CONTRAST', contrast: 8, value: '#d6bfff' },
        { name: 'BLUE_HIGHEST_CONTRAST', contrast: 12, value: '#f7f2ff' },
      ],
    },
    {
      name: 'red',
      values: [
        { name: 'red--largeText', contrast: 3, value: '#f20000' },
        { name: 'red--text', contrast: 4.5, value: '#ff6262' },
        { name: 'red--highContrast', contrast: 8, value: '#ffb8b8' },
        { name: 'red--highestContrast', contrast: 12, value: '#fff1f1' },
      ],
    },
  ]);
});

test('should generate colors with user-defined names and increased contrast', () => {
  const grayRatios = {
    GRAY_1: -2,
    GRAY_2: -1.2,
    GRAY_3: 1,
    GRAY_4: 1.2,
    GRAY_5: 1.4,
    GRAY_6: 2,
    GRAY_7: 3,
    GRAY_8: 4.5,
    GRAY_9: 21,
  };
  const blueRatios = {
    BLUE_LARGE_TEXT: 3,
    BLUE_TEXT: 4.5,
    BLUE_HIGH_CONTRAST: 8,
    BLUE_HIGHEST_CONTRAST: 12,
  };
  const redRatios = {
    'red--largeText': 3,
    'red--text': 4.5,
    'red--highContrast': 8,
    'red--highestContrast': 12,
  };

  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: grayRatios });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: blueRatios });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: redRatios });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 20, contrast: 1.2 });
  const themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { background: '#303030' },
    {
      name: 'gray',
      values: [
        { name: 'GRAY_1', contrast: -2.2, value: '#000000' },
        { name: 'GRAY_2', contrast: -1.24, value: '#1f1f1f' },
        { name: 'GRAY_3', contrast: 1, value: '#303030' },
        { name: 'GRAY_4', contrast: 1.24, value: '#3f3f3f' },
        { name: 'GRAY_5', contrast: 1.48, value: '#4a4a4a' },
        { name: 'GRAY_6', contrast: 2.2, value: '#636363' },
        { name: 'GRAY_7', contrast: 3.4, value: '#828282' },
        { name: 'GRAY_8', contrast: 5.2, value: '#a3a3a3' },
        { name: 'GRAY_9', contrast: 25, value: '#ffffff' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'BLUE_LARGE_TEXT', contrast: 3.4, value: '#8e64ff' },
        { name: 'BLUE_TEXT', contrast: 5.2, value: '#b38fff' },
        { name: 'BLUE_HIGH_CONTRAST', contrast: 9.4, value: '#e4d2ff' },
        { name: 'BLUE_HIGHEST_CONTRAST', contrast: 14.2, value: '#ffffff' },
      ],
    },
    {
      name: 'red',
      values: [
        { name: 'red--largeText', contrast: 3.4, value: '#ff1a1a' },
        { name: 'red--text', contrast: 5.2, value: '#ff7a7a' },
        { name: 'red--highContrast', contrast: 9.4, value: '#ffcece' },
        { name: 'red--highestContrast', contrast: 14.2, value: '#ffffff' },
      ],
    },
  ]);
});

/**
 * Single-color theme tests with fixed backround color.
 * These tests are for the new method of generating contrast
 * colors for a single color scale with a non-scale-based
 * background. Replaces `new Color` function
 */

// Test simple generation in all color spaces
test('should generate 2 colors (CAM02 interpolation)', () => {
  const gray = new Color({
    name: 'gray',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    colorspace: 'CAM02',
    ratios: [3, 4.5],
  });
  const theme = new Theme({ colors: [gray], backgroundColor: '#f5f5f5' });
  const themeColors = theme.contrastColorValues;
  theme.output = 'HEX';

  expect(themeColors).toEqual(['#538fe0', '#2c66f1']);
});

test('should generate 2 colors (LAB interpolation)', () => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'LAB',
  });
  const theme = new Theme({ colors: [indigo], backgroundColor: '#f5f5f5' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#7383ff', '#435eff']);
});

test('should generate 2 colors (LCH interpolation)', () => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'LCH',
  });
  const theme = new Theme({ colors: [indigo], backgroundColor: '#f5f5f5' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#008fff', '#0064ff']);
});

test('should generate 2 colors (HSL interpolation)', () => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'HSL',
  });
  const theme = new Theme({ colors: [indigo], backgroundColor: '#f5f5f5' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#478bfe', '#2d61ff']);
});

test('should generate 2 colors (HSLuv interpolation)', () => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'HSLuv',
  });
  const theme = new Theme({ colors: [indigo], backgroundColor: '#f5f5f5' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#1895dc', '#066aea']);
});

test('should generate 2 colors (HSV interpolation)', () => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'HSV',
  });
  const theme = new Theme({ colors: [indigo], backgroundColor: '#f5f5f5' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#468bff', '#2d61ff']);
});

test('should generate 2 colors (RGB interpolation)', () => {
  const indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'RGB',
  });
  const theme = new Theme({ colors: [indigo], backgroundColor: '#f5f5f5' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#5988ff', '#3360ff']);
});

test('should generate 2 colors on dark background', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [3, 4.5],
    colorspace: 'LCH',
  });
  const theme = new Theme({ colors: [color], backgroundColor: '#323232' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#0074ff', '#009fff']);
});

// Check bidirectionality of contrast ratios (positive vs negative)
test('should generate 2 colors with bidirectional contrast (light background)', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#012676'],
    ratios: [-1.25, 4.5],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#D8D8D8' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#f0eff6', '#56589a']);
});

test('should generate 2 colors with bidirectional contrast (dark background)', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#012676'],
    base: '#323232',
    ratios: [-1.25, 4.5],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#323232' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#101c51', '#9795c1']);
});

// Contrast gamuts
test('should generate black when ratio darker than available colors', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    base: '#d8d8d8',
    ratios: [21],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#d8d8d8' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#000000']);
});

test('should generate white when ratio lighter than available colors', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [21],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#323232' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#ffffff']);
});

test('should generate white when negative ratio lighter than available colors (light gray background)', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [-21],
    colorspace: 'LCH',
  });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#ffffff']);
});
test('should generate white when negative ratio lighter than available colors (white background)', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [-21],
    colorspace: 'LCH',
  });
  const theme = new Theme({ colors: [color], backgroundColor: '#ffffff' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#ffffff']);
});

test('should generate black when negative ratio darker than available colors (gray background)', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [-21],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#323232' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#000000']);
});

test('should generate black when negative ratio darker than available colors (black background)', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    ratios: [-21],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#000000' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#000000']);
});

// Mid-Tone Backgrounds
test('should generate slightly lighter & darker grays on a darker midtone gray background', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#000000'],
    ratios: [1.2, -1.2],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#6b6b6b' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#787878', '#5f5f5f']);
});
test('should generate slightly lighter & darker grays on a lighter midtone gray background', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#000000'],
    ratios: [1.2, -1.2],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#787878' });
  const themeColors = theme.contrastColors;

  // expect(themeColors).toEqual([ '#6b6b6b', '#858585' ]);
  expect(themeColors).toEqual([
    { background: '#787878' },
    {
      name: 'Color',
      values: [
        { name: 'Color50', contrast: 1.2, value: '#858585' },
        { name: 'Color100', contrast: -1.2, value: '#6c6c6c' },
      ],
    },
  ]);
});
test('should generate slightly lighter & darker oranges on a darker midtone slate background', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#ff8602', '#ab3c00', '#ffd88b'],
    ratios: [1.2, -1.2],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#537a9c' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#d76102', '#b74601']);
});

test('should generate slightly lighter & darker oranges on a lighter midtone slate background', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#ff8602', '#ab3c00', '#ffd88b'],
    ratios: [1.2, -1.2],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#537b9d' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#d86202', '#b84701']);
});

// Output formats
test('should generate 2 colors in HEX format', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5' });
  theme.output = 'HEX';
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#508df0', '#2b64f8']);
});
test('should generate 2 colors in RGB format', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5' });
  theme.output = 'RGB';
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['rgb(80, 141, 240)', 'rgb(43, 100, 248)']);
});
test('should generate 2 colors in HSL format', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5' });
  theme.output = 'HSL';
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['hsl(217deg, 84%, 63%)', 'hsl(223deg, 94%, 57%)']);
});
test('should generate 2 colors in HSV format', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5', output: 'HSV' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['hsv(217deg, 67%, 94%)', 'hsv(223deg, 83%, 97%)']);
});
test('should generate 2 colors in LAB format', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5', output: 'LAB' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['lab(59%, 12, -56)', 'lab(47%, 36, -79)']);
});
test('should generate 2 colors in LCH format', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5', output: 'LCH' });

  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['lch(59%, 57, 282deg)', 'lch(47%, 86, 294deg)']);
});

// Expected errors
test('should generate no colors, missing colorKeys', () => {
  expect(
    () => {
      // eslint-disable-next-line no-unused-vars
      const color = new Color({ name: 'Color', ratios: [3, 4.5] }); // no key colors
    },
  ).toThrow();
});

test('should generate no colors, missing ratios', () => {
  expect(
    () => {
      const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'] }); // no ratios
      // eslint-disable-next-line no-unused-vars
      const theme = new Theme({ colors: [color], background: '#ffffff' });
    },
  ).toThrow();
});

test('should generate no colors, missing background', () => {
  expect(
    () => {
      const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5] });
      // eslint-disable-next-line no-unused-vars
      const theme = new Theme({ colors: [color] }); // no base
    },
  ).toThrow();
});

test('should throw error, missing hash on hex value', () => {
  expect(
    () => {
      // eslint-disable-next-line no-unused-vars
      const color = new Color({ name: 'Color', colorKeys: ['#2451FF', 'blah', '#012676'], ratios: [3, 4.5] }); // third color missing hash #
    },
  ).toThrow();
});

test('should throw error, incomplete hex value', () => {
  expect(
    () => {
      // eslint-disable-next-line no-unused-vars
      const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEF', '#012676'], ratios: [3, 4.5] }); // third color missing final hex code
    },
  ).toThrow();
});
