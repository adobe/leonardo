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
import { convertColorValue } from './utils';
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
  }

  set colorKeys(colors) {
    this._colorKeys = colors;
    this._colors = null;
    this._colors = this._createColorScale();
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
  }

  get shift() {
    return this._shift;
  }

  get colors() {
    return this._colors;
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