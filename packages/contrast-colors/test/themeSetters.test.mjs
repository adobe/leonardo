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
import { Theme, Color, BackgroundColor } from "../index";

// Output formats
test('should set theme output to HEX', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5', output: 'RGB' });
  theme.output = 'HEX';
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#548fe0', '#2b66f0']);
});
test('should set theme output to RGB', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5', output: 'RGB' });
  theme.output = 'RGB';
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['rgb(84, 143, 224)', 'rgb(43, 102, 240)']);
});
test('should set theme output to HSL', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5', output: 'RGB' });
  theme.output = 'HSL';
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['hsl(215deg, 69%, 60%)', 'hsl(222deg, 87%, 55%)']);
});
test('should set theme output to HSV', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5', output: 'RGB' });
  theme.output = 'HSV';
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['hsv(215deg, 63%, 88%)', 'hsv(222deg, 82%, 94%)']);
});
test('should set theme output to LAB', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5', output: 'RGB' });
  theme.output = 'LAB';
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['lab(59%, 6, -47)', 'lab(47%, 31, -74)']);
});
test('should set theme output to LCH', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5', output: 'RGB' });
  theme.output = 'LCH';
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['lch(59%, 47, 277deg)', 'lch(47%, 81, 293deg)']);
});

// Saturation
test('should set theme saturation to 60%', () => {
  const color = new Color({ name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'CAM02' });
  const theme = new Theme({ colors: [color], backgroundColor: '#f5f5f5', output: 'RGB'  });
  theme.saturation = 60;
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['rgb(119, 142, 193)', 'rgb(90, 107, 187)']);
});

/** Single color updates */
test('should set colorspace for one color in theme to CAM02', () => {
  const gray = new Color({
    name: 'gray',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    colorspace: 'RGB',
    ratios: [3, 4.5],
  });
  gray.colorspace = 'CAM02';

  const theme = new Theme({ colors: [gray], backgroundColor: '#f5f5f5' });
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#548fe0', '#2b66f0']);
});

test('should remove a color by its class', () => {
  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21] });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12] });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12] });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 20, contrast: 1.5 });

  theme.removeColor = red;
  
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
        { name: 'gray500', contrast: 4, value: '#8d8d8d' },
        { name: 'gray600', contrast: 6.25, value: '#b2b2b2' },
        { name: 'gray700', contrast: 8.5, value: '#cfcfcf' },
        { name: 'gray800', contrast: 11.5, value: '#efefef' },
        { name: 'gray900', contrast: 17.5, value: '#ffffff' },
        { name: 'gray1000', contrast: 31, value: '#ffffff' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'blue100', contrast: 2.5, value: '#7045ff' },
        { name: 'blue200', contrast: 4, value: '#9f73ff' },
        { name: 'blue300', contrast: 6.25, value: '#c4a2ff' },
        { name: 'blue400', contrast: 11.5, value: '#f4ecff' },
        { name: 'blue500', contrast: 17.5, value: '#ffffff' },
      ],
    },
  ]);
});


test('should remove a color by its name', () => {
  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21] });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12] });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12] });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 20, contrast: 1.5 });

  theme.removeColor = {name: 'red'};

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
        { name: 'gray500', contrast: 4, value: '#8d8d8d' },
        { name: 'gray600', contrast: 6.25, value: '#b2b2b2' },
        { name: 'gray700', contrast: 8.5, value: '#cfcfcf' },
        { name: 'gray800', contrast: 11.5, value: '#efefef' },
        { name: 'gray900', contrast: 17.5, value: '#ffffff' },
        { name: 'gray1000', contrast: 31, value: '#ffffff' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'blue100', contrast: 2.5, value: '#7045ff' },
        { name: 'blue200', contrast: 4, value: '#9f73ff' },
        { name: 'blue300', contrast: 6.25, value: '#c4a2ff' },
        { name: 'blue400', contrast: 11.5, value: '#f4ecff' },
        { name: 'blue500', contrast: 17.5, value: '#ffffff' },
      ],
    },
  ]);
});


test('should set contrast multiple times', () => {
  const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21] });
  const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12] });
  const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12] });
  const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 100, contrast: 1 });

  theme.contrast = 3;
  theme.contrast = 1.2;
  theme.contrast = 0.875;
  theme.contrast = 1.4
  theme.contrast = 2;

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
        { name: 'gray800', contrast: 15, value: '#272727' },
        { name: 'gray900', contrast: 23, value: '#000000' },
        { name: 'gray1000', contrast: 41, value: '#000000' },
      ],
    },
    {
      name: 'blue',
      values: [
        { name: 'blue100', contrast: 3, value: '#a77cff' },
        { name: 'blue200', contrast: 5, value: '#764aff' },
        { name: 'blue300', contrast: 8, value: '#2912ff' },
        { name: 'blue400', contrast: 15, value: '#241172' },
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


test('should update predefined color keys', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#cacaca'],
    ratios: [1.2, -1.2],
    colorspace: 'LCH',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#537b9d' });

  theme.updateColor = {color: 'Color', colorKeys: ['#ff8602', '#ab3c00', '#ffd88b']}
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#d66201', '#b74700']);
});

test('should update predefined color keys as object return', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#ff8602', '#ab3c00', '#ffd88b'],
    ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21],
    colorspace: 'RGB',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#e1e1e1' });
  theme.updateColor = {color: 'Color', colorKeys: ['#ff00ff']}
  theme.updateColor = {color: 'Color', colorKeys: ['#000000']}

  const themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { background: '#e1e1e1' },
    {
      name: 'Color',
      values: [
        { name: 'Color100', contrast: 1, value: '#e1e1e1' },
        { name: 'Color200', contrast: 1.2, value: '#cecece' },
        { name: 'Color300', contrast: 1.4, value: '#bfbfbf' },
        { name: 'Color400', contrast: 2, value: '#a0a0a0' },
        { name: 'Color500', contrast: 3, value: '#808080' },
        { name: 'Color600', contrast: 4.5, value: '#646464' },
        { name: 'Color700', contrast: 6, value: '#515151' },
        { name: 'Color800', contrast: 8, value: '#3f3f3f' },
        { name: 'Color900', contrast: 12, value: '#232323' },
        { name: 'Color1000', contrast: 21, value: '#000000' },
      ],
    },
  ]);
});

test('should update predefined colors interpolation', () => {
  const color = new Color({
    name: 'Color',
    colorKeys: ['#ff8602', '#ab3c00', '#ffd88b'],
    ratios: [1.2, -1.2],
    colorspace: 'RGB',
  }); // positive & negative ratios
  const theme = new Theme({ colors: [color], backgroundColor: '#537b9d' });

  theme.updateColor = {color: 'Color', colorspace: 'LCH'}
  const themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual(['#d86202', '#b84601']);
});