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
const {
  colorSpaces,
  convertColorValue,
  createScale,
  uniq,
} = require('./utils');

class Color {
  constructor({ name, colorKeys, colorspace = 'RGB', ratios, smooth = false, output = 'HEX' }) {
    this._name = name;
    this._colorKeys = colorKeys;
    this._colorspace = colorspace;
    this._ratios = ratios;
    this._smooth = smooth;
    this._output = output;
    if (!this._name) {
      throw new Error('Color missing name');
    }
    if (!this._colorKeys) {
      throw new Error('Color Keys are undefined');
    }
    if (!colorSpaces[this._colorspace]) {
      throw new Error(`Colorspace “${colorspace}” not supported`);
    }
    if (!colorSpaces[this._output]) {
      throw new Error(`Output “${colorspace}” not supported`);
    }
    // validate color keys
    for (let i = 0; i < this._colorKeys.length; i++) {
      if (!chroma.valid(this._colorKeys[i])) {
        throw new Error(`Invalid Color Key “${this._colorKeys[i]}”`);
      }
    }

    // Run function to generate this array of colors:
    this._generateColorScale();
  }

  // Setting and getting properties of the Color class
  set colorKeys(colorKeys) {
    this._colorKeys = colorKeys;
    this._generateColorScale();
  }

  get colorKeys() {
    return this._colorKeys;
  }

  set colorspace(colorspace) {
    this._colorspace = colorspace;
    this._generateColorScale();
  }

  get colorspace() {
    return this._colorspace;
  }

  set ratios(ratios) {
    this._ratios = ratios;
  }

  get ratios() {
    return this._ratios;
  }

  set name(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set smooth(smooth) {
    this._smooth = smooth;
    this._generateColorScale();
  }

  get smooth() {
    return this._smooth;
  }

  set output(output) {
    this._output = output;
    this._generateColorScale();
  }

  get output() {
    return this._output;
  }

  get colorScale() {
    return this._colorScale;
  }

  _generateColorScale() {
    // This would create 3000 color values based on all parameters
    // and return an array of colors:
    const colorScale = createScale({ swatches: 3000, colorKeys: this._colorKeys, colorspace: this._colorspace, shift: 1, smooth: this._smooth });

    colorScale.map((color) => convertColorValue(color, this._output));

    // Remove duplicate color values
    this._colorScale = uniq(colorScale);

    return this._colorScale;
  }
}
module.exports = { Color };
