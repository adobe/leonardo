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

import * as Leo from '@adobe/leonardo-contrast-colors';
import {convertColorValue, makePowScale, round, findMatchingLuminosity, orderColorsByLuminosity} from './utils';
const chroma = require('chroma-js');
const {extendChroma} = require('./chroma-plus');

extendChroma(chroma);

class SequentialScale {
  constructor({swatches, colorKeys, colorspace, smooth, distributeLightness = 'linear', shift, output}) {
    (this._swatches = swatches), (this._colorKeys = colorKeys);
    this._luminosities = this._getLuminosities();
    this._colorspace = colorspace;
    this._shift = shift;
    this._smooth = smooth;
    this._distributeLightness = distributeLightness;
    this._output = output;
    this._colors = this._createColorScale();
    this._domains = this._getDomains();
  }

  set colorKeys(colors) {
    this._colorKeys = colors;
    this._colors = null;
    this._colorsReversed = null;
    this._colors = this._createColorScale();
    this._luminosities = this._getLuminosities();
    this._domains = this._getDomains();
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
    this._colors = null;
    this._colorsReversed = null;
    this._colors = this._createColorScale();
  }

  get colorspace() {
    return this._colorspace;
  }

  set smooth(smooth) {
    this._smooth = smooth;
    this._colors = null;
    this._colorsReversed = null;
    this._colors = this._createColorScale();
  }

  get smooth() {
    return this._smooth;
  }

  set distributeLightness(setting) {
    this._distributeLightness = setting;
    this._colors = null;
    this._colorsReversed = null;
    this._colors = this._createColorScale();
    this._domains = null;
    this._domains = this._getDomains();
  }

  set output(output) {
    this._output = output;
    this._colors = null;
    this._colorsReversed = null;
    this._colors = this._createColorScale();
  }

  get output() {
    return this._output;
  }

  set shift(shift) {
    this._shift = Number(shift);
    this._colors = null;
    this._colorsReversed = null;
    this._colors = this._createColorScale();
    this._domains = this._getDomains();
  }

  get shift() {
    return Number(this._shift);
  }

  set swatches(swatches) {
    this._swatches = swatches;
    this._colors = null;
    this._colorsReversed = null;
    this._colors = this._createColorScale();
  }

  get swatches() {
    return this._swatches;
  }

  get colors() {
    return this._colors;
  }

  get colorsReversed() {
    return this._colorsReversed;
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

  _getLuminosities() {
    let lumsObj = this._colorKeys.map((c) => {
      return {
        color: c,
        lum: chroma(c).jch()[0]
      };
    });
    lumsObj.sort((a, b) => (a.lum < b.lum ? 1 : -1));

    return lumsObj.map((c) => c.lum);
  }

  _createColorScale() {
    if (this._colors) this._colors = null;
    if (this._colorsReversed) this._colorsReversed = null;

    let colorScale;
    let generousColorLength = this._distributeLightness === 'parabolic' || this._distributeLightness === 'polynomial' ? 100 : 12;
    let initialColorScale = Leo.createScale({
      swatches: generousColorLength,
      colorKeys: this._colorKeys,
      colorspace: this._colorspace,
      shift: this._shift,
      distributeLightness: this._distributeLightness,
      smooth: this._smooth,
      fullScale: false,
      asFun: true
    });

    const minLum = Math.min(...this._luminosities);
    const maxLum = Math.max(...this._luminosities);
    const maxLumShifted = maxLum - minLum;

    const fillRange = (start, end) => {
      return Array(end - start)
        .fill()
        .map((item, index) => start + index);
    };
    let dataX = fillRange(0, generousColorLength);
    dataX = dataX.map((x) => (x === 0 ? 0 : x / (generousColorLength - 1)));

    let newLums = dataX.map((i) => round(maxLumShifted * i + minLum, 2));

    let newColors = findMatchingLuminosity(initialColorScale, generousColorLength, newLums, this._smooth);

    newColors = [...new Set(newColors)];
    const lastColorIndex = newColors.length - 1;
    // Manually ensure first and last user-input key colors
    // are part of new key colors array being passed to the
    // new color scale.
    const first = this._smooth ? chroma(initialColorScale(0)) : initialColorScale(0);
    const last = this._smooth ? chroma(initialColorScale(generousColorLength)) : initialColorScale(generousColorLength);
    newColors.splice(0, 1, first.hex());
    newColors.splice(lastColorIndex, 1);
    newColors.splice(lastColorIndex, 1, last.hex());

    this._colorFunction = Leo.createScale({
      swatches: this._swatches,
      colorKeys: newColors,
      colorspace: this._colorspace,
      shift: this._shift,
      smooth: false,
      distributeLightness: this._distributeLightness,
      fullScale: false,
      asFun: true
    });

    colorScale = Leo.createScale({
      swatches: this._swatches,
      colorKeys: newColors,
      colorspace: this._colorspace,
      shift: this._shift,
      smooth: false,
      distributeLightness: this._distributeLightness,
      fullScale: false,
      asFun: false
    });

    let formattedColors = colorScale.map((c) => {
      return convertColorValue(c, this._output);
    });
    this._colorsReversed = orderColorsByLuminosity(formattedColors, 'toLight');

    let reversedColor = orderColorsByLuminosity(formattedColors, 'toDark');
    return reversedColor;
  }

  _getDomains() {
    const lums = this._luminosities;

    const min = Math.min(...lums);
    const max = Math.max(...lums);
    const inverseShift = 1 / Number(this._shift);
    const percLums = lums.map((l) => {
      let perc = (l - min) / (max - min);
      if (l === 0 || isNaN(perc)) return 0;
      else return perc;
    });
    let sqrtDomains = makePowScale(Number(inverseShift));
    let domains;

    if (this._distributeLightness === 'parabolic') {
      const parabola = (x) => {
        return Math.pow(x, 2);
      };
      let percDomains = percLums.map((d) => {
        return sqrtDomains(d);
      });
      let newDomains = percDomains.map((d) => {
        return parabola(d);
      });
      domains = newDomains;
    }
    if (this._distributeLightness === 'polynomial') {
      // Equation based on polynomial mapping of lightness values in CIECAM02
      // New polynomial from more expansive analysis of RgBu lightness
      // Inverse of actual function in order to present dots in proper location.
      // See Leo.createScale for distribute lightness formula (square root of the one below)
      const polynomial = (x) => {
        return Math.sqrt((Math.pow(x, 2.25) + Math.pow(x, 4)) / 2);
      };

      const percDomains = percLums.map((d) => {
        return sqrtDomains(d);
      });
      let newDomains = percDomains.map((d) => {
        return polynomial(sqrtDomains(d));
      });
      domains = newDomains;
    }
    if (this._distributeLightness === 'linear') {
      domains = percLums.map((d) => {
        return sqrtDomains(d);
      });
    }

    domains.sort((a, b) => b - a);
    return domains;
  }
}

let _sequentialScale = new SequentialScale({
  swatches: 100,
  colorKeys: ['#002f61', '#ffff00'],
  colorspace: 'CAM02p',
  smooth: false,
  distributeLightness: 'linear',
  shift: 1,
  output: 'RGB'
});

window._sequentialScale = _sequentialScale;

module.exports = {
  SequentialScale,
  _sequentialScale
};
