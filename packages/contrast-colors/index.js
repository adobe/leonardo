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

function APCAvalidation(fontSize, fontWeight, level) {
  // Error or warning messages
  const doNotUse = 'Do not use this color for text.';
  const byline = 'Color may be used for Copyright or ByLine only.';
  const notBodyText = 'Do not use this color for body text (blocks or columns).';
  // Sizes < 48
  const doNotUseFontWeight = 'Do not use font weight 100';
  // Sizes 48+
  const avoidFontWeight = 'Avoid using font weight 100';
  if(fontWeight === 100 && fontSize < 48) {
    console.log(doNotUseFontWeight);
    throw new Warning(doNotUseFontWeight);
  }
  if(fontWeight === 100 && fontSize >= 48) {
    console.log(avoidFontWeight);
    throw new Warning(avoidFontWeight);
  }
  return fontSize, fontWeight;
  // const APCALookupTable = {
  //   '10px': ,
  //   '11px': ,
  //   '12px': ,
  //   '14px': ,
  //   '16px': ,
  //   '18px': ,
  //   '24px': ,
  //   '30px': ,
  //   '36px': ,
  //   '48px': ,
  //   '60px': ,
  //   '72px': ,
  //   '96px': ,
  //   '120px': ,
  // }
}
window.APCAvalidation = APCAvalidation;

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
  APCAvalidation
};
