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
  createScale,
  getContrast,
  getMatchingRatioIndex,
  ratioName,
  convertColorValue,
  luminance,
  minPositive,
} = require('./utils');

const { Color } = require('./color');
const { BackgroundColor } = require('./backgroundcolor');
const { Theme } = require('./theme');

extendChroma(chroma);
// const { rgb2jch, jch2rgb, rgb2cat, cat2rgb, rgb2jab, jab2rgb } = require('./ciecam02');

// chroma.Color.prototype.jch = function () {
//   return rgb2jch(this._rgb.slice(0, 3).map((c) => c / 255));
// };

// chroma.jch = (...args) => new chroma.Color(...jch2rgb(args).map((c) => Math.floor(c * 255)), 'rgb');
// chroma.Color.prototype.cat = function () {
//   return rgb2cat(this._rgb.slice(0, 3).map((c) => c / 255));
// };

// chroma.cat = (...args) => new chroma.Color(...cat2rgb(args).map((c) => Math.floor(c * 255)), 'rgb');
// chroma.Color.prototype.jab = function () {
//   return rgb2jab(this._rgb.slice(0, 3).map((c) => c / 255));
// };

// chroma.jab = (...args) => new chroma.Color(...jab2rgb(args).map((c) => Math.floor(c * 255)), 'rgb');

// chroma.Color.prototype.luv = function () {
//   return hsluv.rgbToHsluv(this._rgb.slice(0, 3).map((c) => c / 255));
// };
// chroma.luv = (...args) => new chroma.Color(...hsluv.hsluvToRgb(args).map((c) => Math.floor(c * 255)), 'rgb');

// const oldInterpol = chroma.interpolate;
// const RGB2 = {
//   jch: rgb2jch,
//   cat: rgb2cat,
//   jab: rgb2jab,
//   luv: hsluv.rgbToHsluv,
// };
// chroma.interpolate = (col1, col2, f = 0.5, mode = 'lrgb') => {
//   if (mode === 'luv') {
//     if (typeof col1 !== 'object') col1 = new Color(col1);
//     if (typeof col2 !== 'object') col2 = new Color(col2);
//     const xyz1 = RGB2[mode](col1.gl());
//     const xyz2 = RGB2[mode](col2.gl());
//     if (!xyz1[1]) {
//       xyz1[0] = xyz2[0];
//     }
//     if (!xyz2[1]) {
//       xyz2[0] = xyz1[0];
//     }
//     const X = xyz1[0] + (xyz2[0] - xyz1[0]) * f;
//     const Y = xyz1[1] + (xyz2[1] - xyz1[1]) * f;
//     const Z = xyz1[2] + (xyz2[2] - xyz1[2]) * f;
//     return chroma[mode](X, Y, Z).alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
//   }
//   if (RGB2[mode]) {
//     if (typeof col1 !== 'object') col1 = new Color(col1);
//     if (typeof col2 !== 'object') col2 = new Color(col2);
//     const xyz1 = RGB2[mode](col1.gl());
//     const xyz2 = RGB2[mode](col2.gl());
//     const X = xyz1[0] + (xyz2[0] - xyz1[0]) * f;
//     const Y = xyz1[1] + (xyz2[1] - xyz1[1]) * f;
//     const Z = xyz1[2] + (xyz2[2] - xyz1[2]) * f;
//     return chroma[mode](X, Y, Z).alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
//   }
//   return oldInterpol(col1, col2, f, mode);
// };
// console.log(hsluv.rgbToHsluv([1, 1, 1]));
// console.log(rgb2jch([1, .8, 0]));
// console.log(chroma.hsl(330, 1, 0.6).hex());
// console.log(chroma.jch(4.063318657831071, 22.988922374245643, 357.81908831867526).hex());
// console.ramp(chroma.scale(['#fff', '#6fa7ff', '#000']))
// console.ramp(chroma.scale(['#fff', '#6fa7ff', '#000']).mode('hsl'))
// console.ramp(chroma.scale(['#fff', '#6fa7ff', '#000']).mode('jch'))
// console.ramp(chroma.scale(['#fff', '#6fa7ff', '#000']).mode('cat'))
// console.ramp(chroma.scale(['#fff', '#6fa7ff', '#000']).mode('jab'))
// console.ramp(chroma.scale(['#fff', '#6fa7ff', '#000']).mode('luv'))
console.color('#6fa7ff');
console.log('rgb');
console.ramp(chroma.scale(['yellow', 'navy']))
console.log('lab');
console.ramp(chroma.scale(['yellow', 'navy']).mode('lab'))
console.log('hsl');
console.ramp(chroma.scale(['yellow', 'navy']).mode('hsl'))
console.log('ciecam02');
console.ramp(chroma.scale(['yellow', 'navy']).mode('jab'))
console.log('hsluv');
console.ramp(chroma.scale(['yellow', 'navy']).mode('luv'))

module.exports = {
  Color,
  BackgroundColor,
  Theme,
  createScale,
  luminance,
  contrast: getContrast,
  getMatchingRatioIndex,
  minPositive,
  ratioName,
  convertColorValue,
};
