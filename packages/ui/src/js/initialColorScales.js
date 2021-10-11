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
import {
   convertColorValue,
   makePowScale,
 } from './utils';
const chroma = require('chroma-js');
const { extendChroma } = require('./chroma-plus');

extendChroma(chroma);

class SequentialScale {
  constructor({ 
    swatches,
    colorKeys,
    colorspace,
    smooth,
    shift,
    output
   }) {
    this._swatches = swatches,
    this._colorKeys = colorKeys;
    this._colorspace = colorspace;
    this._shift = shift;
    this._smooth = smooth;
    this._output = output;
    this._colors = this._createColorScale();
    this._luminosities = this._getColorLuminosities();
    this._domains = this._getDomains();
  }

  set colorKeys(colors) {
    this._colorKeys = colors;
    this._colors = null;
    this._colors = this._createColorScale();
    this._luminosities = this._getColorLuminosities();
    this._domains = this._getDomains()
  }

  get colorKeys() {
    return this._colorKeys;
  }
  
  set colorspace(colorspace) {
    this._colorspace = colorspace;
    this._colors = null;
    this._colors = this._createColorScale();
  }

  get colorspace() {
    return this._colorspace;
  }

  set smooth(smooth) {
    this._smooth = smooth;
    this._colors = null;
    this._colors = this._createColorScale();
  }

  get smooth() {
    return this._smooth;
  }

  set output(output) {
    this._output = output;
    this._colors = null;
    this._colors = this._createColorScale();
  }

  get output() {
    return this._output;
  }

  set shift(shift) {
    this._shift = shift;
    this._colors = null;
    this._colors = this._createColorScale();
    this._domains = this._getDomains();
  }

  get shift() {
    return Number(this._shift);
  }

  set swatches(swatches) {
    this._swatches = swatches;
    this._colors = null;
    this._colors = this._createColorScale();
  }

  get swatches() {
    return this._swatches;
  }

  get colors() {
    return this._colors;
  }

  get luminosities() {
    return this._luminosities;
  }

  get domains() {
    return this._domains;
  }

  _createColorScale() {
    let colorScale = Leo.createScale({
      swatches: this._swatches,
      colorKeys: this._colorKeys,
      colorspace: this._colorspace,
      shift: this._shift,
      smooth: this._smooth,
      fullScale: false,
      asFun: false
    });
    let formattedColors = colorScale.map((c) => {return convertColorValue(c, this._output)});

    return formattedColors;
  }

  _getColorLuminosities() {
    return this._colorKeys.map((c) => {return d3.hsluv(c).v})
  }

  _getDomains() {
    const lums = this._colorKeys.map((c) => {return d3.hsluv(c).v});

    const min = Math.min(...lums);
    const max = Math.max(...lums);  
    const inverseShift = 1 / Number(this._shift);
    const percLums = lums.map((l) => {
      let perc = (l - min) / (max - min);
      if(l === 0 || isNaN(perc)) return 0;
      else return perc;
    })
    let sqrtDomains = makePowScale(Number(Number(this._shift)));

    let domains = percLums.map((d) => {return sqrtDomains(d)})
    domains.sort((a, b) => a - b)

    return domains;
  }

}

let _sequentialScale = new SequentialScale({
  swatches: 100,
  colorKeys: ['#cacaca'],
  colorspace: 'CAM02',
  smooth: false,
  shift: 1,
  output: 'RGB'
})

window._sequentialScale = _sequentialScale;

module.exports = {
  _sequentialScale
}