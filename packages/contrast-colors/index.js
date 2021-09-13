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

const chroma = require('chroma-js');
const { extendChroma } = require('./chroma-plus');
const {
  convertColorValue,
  createScale,
  getContrast,
  luminance,
  minPositive,
  ratioName,
} = require('./utils');

const { Color } = require('./color');
const { BackgroundColor } = require('./backgroundcolor');
const { Theme } = require('./theme');

extendChroma(chroma);

// console.color('#6fa7ff');
// console.ramp(chroma.scale(['yellow', 'navy']).mode('hsl'))
// const gray = new BackgroundColor({ name: 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: [1] });
// const blue = new Color({ name: 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12] });
// const red = new Color({ name: 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12] });
// const theme = new Theme({ colors: [gray, blue, red], backgroundColor: gray, lightness: 20, contrast: 1.5 });
// theme.contrastColorValues.forEach((value) => console.color(value));

// theme.saturation = 0;
// console.log('============== New colors:')
// theme.contrastColorValues.forEach((value) => console.color(value));

module.exports = {
  Color,
  BackgroundColor,
  Theme,
  createScale,
  luminance,
  contrast: getContrast,
  minPositive,
  ratioName,
  convertColorValue,
};
