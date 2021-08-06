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
  getMatchingRatioIndex,
  luminance,
  minPositive,
  ratioName,
} = require('./utils');

const { Color } = require('./color');
const { BackgroundColor } = require('./backgroundcolor');
const { Theme } = require('./theme');

extendChroma(chroma);

// console.color('#6fa7ff');
// console.log(chroma("#fff").hsluv());
// console.log('rgb');
// console.ramp(chroma.scale(['yellow', 'navy']))
// console.log('lab');
// console.ramp(chroma.scale(['yellow', 'navy']).mode('lab'))
// console.log('hsl');
// console.ramp(chroma.scale(['yellow', 'navy']).mode('hsl'))
// console.log('ciecam02');
// console.ramp(chroma.scale(['yellow', 'navy']).mode('jab'))
// console.log('hsluv');
// console.ramp(chroma.scale(['yellow', 'navy']).mode('hsluv'))
// const colors = new BackgroundColor({ name: 'Color', colorKeys: ['#6FA7FF', '#B5E6FF'], colorspace: 'HSLuv' }).backgroundColorScale;
// console.log(convertColorValue('#2c66f1', 'CAM02p'));

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
