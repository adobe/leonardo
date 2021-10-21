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

import * as Leo from '@adobe/leonardo-contrast-colors';
import * as d3 from './d3';
import {SequentialScale} from './initialSequentialScale';
import {
   convertColorValue,
   makePowScale,
   removeDuplicates,
   round,
   findMatchingLuminosity
 } from './utils';
const chroma = require('chroma-js');
const { extendChroma } = require('./chroma-plus');

class DivergingScale {
  constructor({ 
    swatches,
    startKeys,
    endKeys,
    middleKey = "#f5f5f5",
    colorspace,
    smooth,
    shift,
    output,
    correctLightness
   }) {
    this._startKeys = [...startKeys, middleKey];
    this._endKeys = [...endKeys, middleKey];
    this._middleKey = middleKey;
    this._colorKeys = this._combineColorKeys();
    this._colorspace = colorspace;
    this._shift = shift;
    this._smooth = smooth;
    this._output = output;
    this._correctLightness = correctLightness;
    this._swatches = swatches,
    // this._luminosities = this._getLuminosities();
    // this._domains = this._getDomains();

    this._startScale = new SequentialScale({
      swatches: this._swatches,
      colorKeys: this._startKeys,
      colorspace: this._colorspace,
      smooth: this._smooth,
      shift: this._shift,
      correctLightness: this._correctLightness,
      output: this._output
    });

    this._endScale = new SequentialScale({
      swatches: this._swatches,
      colorKeys: this._endKeys,
      colorspace: this._colorspace,
      smooth: this._smooth,
      shift: this._shift,
      correctLightness: this._correctLightness,
      output: this._output
    });

    this._colors = this._createColorScale();
  }

  set startKeys(colors) {
    console.log(`Start keys set from ${this._startKeys} to ${colors}`)
    this._startKeys = colors;
    this._colors = null;
    this._colors = this._createColorScale();
  }

  get startKeys() {
    return this._startKeys;
  }

  get startScale() {
    return this._startScale;
  }

  set endKeys(colors) {
    this._endKeys = colors;
    this._colors = null;
    this._colors = this._createColorScale();
  }

  get endKeys() {
    return this._endKeys;
  }

  get endScale() {
    return this._endScale;
  }

  set middleKey(color) {
    this._middleKey = color;
    this._colors = null;
    this._colors = this._createColorScale();
  }

  get middleKey() {
    return this._middleKey;
  }

  get colorKeys() {
    return this._colorKeys;
  }

  set samples(samples) {
    this._samples = samples;
  }

  get samples() {
    return this._samples;
  }
  
  set colorspace(colorspace) {
    this._colorspace = colorspace;
    this._startScale.colorspace = colorspace;
    this._endScale.colorspace = colorspace;

    this._colors = null;
    this._colors = this._createColorScale();
  }

  get colorspace() {
    return this._colorspace;
  }

  set smooth(smooth) {
    this._smooth = smooth;
    this._startScale.smooth = smooth;
    this._endScale.smooth = smooth;

    this._colors = null;
    this._colors = this._createColorScale();
  }

  get smooth() {
    return this._smooth;
  }

  set output(output) {
    this._output = output;
    if(this._startScale) this._startScale.output = output;
    if(this._endScale) this._endScale.output = output;

    this._colors = this._combineColors();
    if(this._startScale) this._startScale.output = 'HEX';
    if(this._endScale) this._endScale.output = 'HEX';
  }

  get output() {
    return this._output;
  }

  set shift(shift) {
    this._shift = Number(shift);
    this._startScale.shift = shift;
    this._endScale.shift = shift;

    this._colors = null;
    this._colors = this._createColorScale();
    this._domains = this._getDomains();
  }

  get shift() {
    return Number(this._shift);
  }

  set swatches(swatches) {
    this._swatches = swatches;
    if(this._startScale) this._startScale.swatches = swatches/2;
    if(this._endScale) this._endScale.swatches = swatches/2;
    if(this._startScale && this._endScale) {
      this._colors = null;
      this._colors = this._createColorScale();  
    }
  }

  get swatches() {
    return this._swatches;
  }

  get colors() {
    return this._colors;
  }

  set luminosities(luminosities) {
    this._luminosities = luminosities
  }
  get luminosities() {
    return this._luminosities;
  }

  get domains() {
    return this._domains;
  }

  get colorFunction() {
    return this._colorFunction;
  }

  set correctLightness(boolean) {
    this._correctLightness = boolean;
    this._startScale.correctLightness = boolean;
    this._endScale.correctLightness = boolean;

    this._colors = null;
    this._colors = this._createColorScale();
  }

  get colors() {
    return this._colors;
  }

  _createColorScale() {
    let newColors = this._combineColors();

    this.luminosities = this._getLuminosities();

    this._colorFunction = Leo.createScale({
      swatches: this._swatches,
      colorKeys: newColors,
      colorspace: this._colorspace,
      // shift: this._shift,
      smooth: false,
      fullScale: false,
      asFun: true
    });

    newColors.map((c) => {
      return convertColorValue(c, this._output)
    })

    return newColors
  }

  _getLuminosities() {
    return [...this._startScale.luminosities, d3.hsluv(this._middleKey).v, ...this._endScale.luminosities];
  }

  _combineColorKeys() {
    let filteredStart = Array.from(this._startKeys);
    const startIndex = filteredStart.indexOf(this._middleKey);
    if (startIndex > -1) {
      filteredStart.splice(startIndex, 1);
    }
    let filteredEnd = Array.from(this._endKeys);
    const endIndex = filteredEnd.indexOf(this._middleKey);
    if (endIndex > -1) {
      filteredEnd.splice(startIndex, 1);
    }

    return [...filteredStart, this._middleKey, ...filteredEnd]
  }

  _combineColors() {
    const startColors = this._startScale.colors;
    const endColors = this._endScale.colors;
    let endColorsReversed = [];
    for(let i = endColors.length - 1; i >= 0; i --) {
      endColorsReversed.push(endColors[i]);
    }
    let newUnfilteredColors = [...startColors, ...endColorsReversed];
    let newColors = [...new Set(newUnfilteredColors)];
    return newColors;
  }

}
let _divergingScale = new DivergingScale({
  swatches: 100,
  startKeys: ['#19beaa', '#004d4b'],
  endKeys: ['#d37222', '#700036'],
  middleKey: '#f3f3f3',
  colorspace: 'CAM02p',
  smooth: false,
  shift: 1,
  correctLightness: true,
  output: 'RGB'
});

window._divergingScale = _divergingScale;

module.exports = {
  _divergingScale
}