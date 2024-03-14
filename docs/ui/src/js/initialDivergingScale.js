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
import * as d3 from './d3';
import {SequentialScale} from './initialSequentialScale';
import {convertColorValue, round, orderColorsByLuminosity} from './utils';
const chroma = require('chroma-js');
const {extendChroma} = require('./chroma-plus');
extendChroma(chroma);

class DivergingScale {
  constructor({swatches, startKeys, endKeys, middleKey, colorspace, smooth, distributeLightness = 'polynomial', shift = 1, output}) {
    this._startKeys = startKeys;
    this._endKeys = endKeys;
    this._middleKey = middleKey;
    this._colorKeys = this._combineColorKeys();
    this._distributeLightness = distributeLightness;
    this._colorspace = colorspace;
    this._shift = shift;
    this._smooth = smooth;
    this._output = output;
    (this._swatches = swatches),
      (this._scaleSwatches = swatches / 2),
      (this._startScale = new SequentialScale({
        swatches: this._scaleSwatches,
        colorKeys: this._startKeys,
        colorspace: this._colorspace,
        distributeLightness: this._distributeLightness,
        smooth: this._smooth,
        shift: this._shift,
        output: this._output
      }));

    this._endScale = new SequentialScale({
      swatches: this._scaleSwatches,
      colorKeys: this._endKeys,
      colorspace: this._colorspace,
      distributeLightness: this._distributeLightness,
      smooth: this._smooth,
      shift: this._shift,
      output: this._output
    });

    this._domains = this._getDomains();
    this._colors = this._createColorScale();
  }

  set startKeys(colors) {
    this._startKeys = colors;
    this._startScale.colorKeys = [...colors, this._middleKey];

    this._colorKeys = null;
    this._colorKeys = this._combineColorKeys();

    this._colors = null;
    this._colors = this._createColorScale();

    this._domains = this._getDomains();
  }

  get startKeys() {
    return this._startKeys;
  }

  get startScale() {
    return this._startScale;
  }

  set endKeys(colors) {
    this._endKeys = colors;
    this._endScale.colorKeys = [...colors, this._middleKey];
    this._colorKeys = null;
    this._colorKeys = this._combineColorKeys();

    this._colors = null;
    this._colors = this._createColorScale();

    this._domains = this._getDomains();
  }

  get endKeys() {
    return this._endKeys;
  }

  get endScale() {
    return this._endScale;
  }

  set middleKey(color) {
    this._middleKey = color;
    this._startScale.colorKeys = [...this._startKeys, color];
    this._endScale.colorKeys = [...this._endKeys, color];

    this._colorKeys = null;
    this._colorKeys = this._combineColorKeys();

    this._colors = null;
    this._colors = this._createColorScale();

    this._domains = this._getDomains();
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

  set distributeLightness(setting) {
    this._distributeLightness = setting;
    this._startScale.distributeLightness = setting;
    this._endScale.distributeLightness = setting;

    this._colors = null;
    this._colors = this._createColorScale();
    this._domains = this._getDomains();
  }

  get distributeLightness() {
    return this._distributeLightness;
  }

  set output(output) {
    this._output = output;

    let newColors = this._combineColors();
    this._colors = newColors.map((c) => {
      return convertColorValue(c, output);
    });
  }

  get output() {
    return this._output;
  }

  set shift(shift) {
    this._shift = Number(shift);
    this._startScale.shift = Number(shift);
    this._endScale.shift = Number(shift);

    this._colors = null;
    this._colors = this._createColorScale();
    this._domains = this._getDomains();
  }

  get shift() {
    return Number(this._shift);
  }

  set swatches(swatches) {
    this._swatches = swatches;
    this._scaleSwatches = swatches / 2;
    if (this._startScale) this._startScale.swatches = this._scaleSwatches;
    if (this._endScale) this._endScale.swatches = this._scaleSwatches;

    this._colors = this._createColorScale();
  }

  get swatches() {
    return this._swatches;
  }

  get colors() {
    return this._colors;
  }

  set luminosities(luminosities) {
    this._luminosities = luminosities;
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
      sortColor: false,

      distributeLightness: 'linear',
      fullScale: false,
      asFun: true
    });

    newColors.map((c) => {
      return convertColorValue(c, this._output);
    });

    return newColors;
  }

  _getLuminosities() {
    return [...this._startScale.luminosities, d3.hsluv(this._middleKey).v, ...this._endScale.luminosities];
  }

  _combineColorKeys() {
    const startKeys = this._startKeys;
    const endKeys = this._endKeys;
    const sortedStartKeys = orderColorsByLuminosity(startKeys, 'toDark');
    const sortedEndKeys = orderColorsByLuminosity(endKeys, 'toLight');

    return [...sortedStartKeys, this._middleKey, ...sortedEndKeys];
  }

  _combineColors() {
    const startColorScale = this._startScale.colors;
    const startColors = [];
    // For all but the last color
    for (let i = 0; i < startColorScale.length - 1; i++) {
      startColors.push(startColorScale[i]);
    }
    const endColorScaleReversed = this._endScale.colorsReversed;
    const endColors = [];
    // For all but the first color
    for (let i = 1; i < startColorScale.length; i++) {
      endColors.push(endColorScaleReversed[i]);
    }

    let newUnfilteredColors = [...startColors, this._middleKey, ...endColors];
    let newColors = [...new Set(newUnfilteredColors)];

    return newColors;
  }

  _getDomains() {
    // We know the middle key must always be at the midpoint of the domains.
    // Start key domains will be before, end key domains will be after.
    let startDomains = this._startScale.domains.sort(function (a, b) {
      return a - b;
    });
    startDomains = startDomains.map((d) => {
      return round(d / 2, 2);
    });
    let endDomains = this._endScale.domains;
    endDomains = endDomains.map((d) => {
      return 1 - d;
    }); // reverse domain
    endDomains = endDomains.map((d) => {
      return round((d + 1) / 2, 2);
    });
    let combined = [...startDomains, ...endDomains];
    let domains = [...new Set(combined)];

    let clampedDomains = domains.map((d) => {
      return round(d, 2);
    });
    return domains;
  }
}

let _divergingScale = new DivergingScale({
  swatches: 50,
  startKeys: ['#580000', '#DD8629'],
  endKeys: ['#3EA8A6', '#003233'],
  middleKey: '#FFFFE0',
  colorspace: 'CAM02',
  distributeLightness: 'polynomial', // 'linear' | 'parabolic' | 'polynomial'
  smooth: false,
  output: 'RGB'
});

window._divergingScale = _divergingScale;

module.exports = {
  _divergingScale
};
