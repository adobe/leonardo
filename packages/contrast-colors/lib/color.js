/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import chroma from 'chroma-js';
import {colorSpaces, createScale} from './utils.js';

class Color {
  constructor({name, colorKeys, colorspace = 'RGB', ratios, smooth = false, output = 'HEX', saturation = 100}) {
    this._name = name;
    this._colorKeys = colorKeys;
    this._modifiedKeys = colorKeys;
    this._colorspace = colorspace;
    this._ratios = ratios;
    this._smooth = smooth;
    this._output = output;
    this._saturation = saturation;

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
    this._colorScale = null;
  }

  // Setting and getting properties of the Color class
  set colorKeys(colorKeys) {
    this._colorKeys = colorKeys;
    this._updateColorSaturation();
  }

  get colorKeys() {
    return this._colorKeys;
  }

  set saturation(saturation) {
    this._saturation = saturation;
    this._updateColorSaturation();
  }

  get saturation() {
    return this._saturation;
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
    if (smooth === true || smooth === 'true') this._smooth = smooth;
    else this._smooth = false;

    this._generateColorScale();
  }

  get smooth() {
    return this._smooth;
  }

  set output(output) {
    this._output = output;
    this._colorScale = null;
  }

  get output() {
    return this._output;
  }

  get colorScale() {
    if (!this._colorScale) {
      this._generateColorScale();
    }
    return this._colorScale;
  }

  _updateColorSaturation() {
    let newColorKeys = [];
    this._colorKeys.forEach((key) => {
      let currentOklch = chroma(`${key}`).oklch();
      let currentSaturation = currentOklch[1];
      let newSaturation = currentSaturation * (this._saturation / 100);
      let newOklch = chroma.oklch(currentOklch[0], newSaturation, currentOklch[2]);
      let newColor = chroma.rgb(newOklch).hex();
      newColorKeys.push(newColor);
    });
    // set color keys with new modified array
    this._modifiedKeys = newColorKeys;

    this._generateColorScale();
  }

  _generateColorScale() {
    // This would create 3000 color values based on all parameters
    // and return an array of colors:
    this._colorScale = createScale({
      swatches: 3000,
      colorKeys: this._modifiedKeys,
      colorspace: this._colorspace,
      shift: 1,
      smooth: this._smooth,
      asFun: true
    });
  }
}
export {Color};
