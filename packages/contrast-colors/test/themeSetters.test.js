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

  expect(themeColors).toEqual(['rgb(119, 142, 193)', 'rgb(90, 108, 187)']);
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
        { name: 'gray100', contrast: 1, value: '#313131' },
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
        { name: 'gray100', contrast: 1, value: '#313131' },
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

/** Multiple color updates */