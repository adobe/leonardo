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
   removeDuplicates,
   round,
   findMatchingLuminosity,
   orderColorsByLuminosity
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
    // this._colorKeys = this._sortColorKeys(colorKeys);
    this._colorKeys = colorKeys;
    this._luminosities = this._getLuminosities();
    this._colorspace = colorspace;
    this._shift = shift;
    this._smooth = smooth;
    this._output = output;
    this._colors = this._createColorScale();
    // this._luminosities = this._getColorLuminosities();
    this._domains = this._getDomains();
  }

  set colorKeys(colors) {
    // this._colorKeys = this._sortColorKeys(colors);
    this._colorKeys = colors;
    this._colors = null;
    this._colorsReversed = null;
    this._colors = this._createColorScale();
    this._luminosities = this._getLuminosities();
    this._domains = this._getDomains()
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
        lum: chroma(c).hsluv()[2]
      }
    });
    lumsObj.sort((a, b) => (a.lum < b.lum) ? 1 : -1);

    return lumsObj.map((c) => c.lum);
  }

  // _sortColorKeys(colors) {
  //   let lumsObj = colors.map((c) => {
  //     return {
  //       color: c,
  //       lum: chroma(c).hsluv()[2]
  //     }
  //   });
  //   lumsObj.sort((a, b) => (a.lum < b.lum) ? 1 : -1)
  //   // keep the sorted luminosities
  //   this._luminosities = lumsObj.map((c) => c.lum);

  //   // return lumsObj.map((c) => c.color);
  //   return orderColorsByLuminosity(colors, 'toLight')
  // }

  _createColorScale() {
    if(this._colors) this._colors = null;
    if(this._colorsReversed) this._colorsReversed = null;

    let colorScale;
    let generousColorLength = 30;
    let initialColorScale = Leo.createScale({
      swatches: generousColorLength,
      colorKeys: this._colorKeys,
      colorspace: this._colorspace,
      shift: this._shift,
      smooth: this._smooth,
      fullScale: false,
      asFun: true
    });

    const minLum = Math.min(...this._luminosities);
    const maxLum = Math.max(...this._luminosities);
    const maxLumShifted = maxLum - minLum;

    const fillRange = (start, end) => {
      return Array(end - start).fill().map((item, index) => start + index);
    };
    let dataX = fillRange(0, generousColorLength);
    dataX = dataX.map((x) => (x === 0) ? 0 : x/(generousColorLength - 1))

    let newLums = dataX.map((i) => round((maxLumShifted * i) + minLum, 2));

    const newColors = findMatchingLuminosity(initialColorScale, generousColorLength, newLums, this._smooth);

    let filteredColors = newColors.filter(function(x) {
      return x !== undefined;
    });

    // const lastColorIndex = filteredColors.length-1;
    // Manually ensure first and last user-input key colors
    // are part of new key colors array being passed to the
    // new color scale.
    // NOTE: Not sure this actually is needed...
    // const first = (this._smooth) ? chroma(initialColorScale(0)): initialColorScale(0);
    // const last = (this._smooth) ? chroma(initialColorScale(generousColorLength)): initialColorScale(generousColorLength);
    // filteredColors
    //   .splice(0, 1, first.hex());
    // filteredColors
    //   .splice(lastColorIndex, 1)
    // filteredColors
    //   .splice((lastColorIndex), 1, last.hex())

    this._colorFunction = Leo.createScale({
      swatches: this._swatches,
      colorKeys: newColors,
      colorspace: this._colorspace,
      shift: this._shift,
      smooth: false,
      fullScale: false,
      asFun: true
    });

    colorScale = Leo.createScale({
      swatches: this._swatches,
      colorKeys: newColors,
      colorspace: this._colorspace,
      shift: this._shift,
      smooth: false,
      fullScale: false,
      asFun: false
    });

    let formattedColors = colorScale.map((c) => {return convertColorValue(c, this._output)});
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
      if(l === 0 || isNaN(perc)) return 0;
      else return perc;
    })
    let sqrtDomains = makePowScale(Number(inverseShift));

    let domains = percLums.map((d) => {return sqrtDomains(d)})
    
    domains.sort((a, b) => b - a)
    return domains;
  }
}

let _sequentialScale = new SequentialScale({
  swatches: 100,
  colorKeys: ['#000000', '#cacaca'],
  colorspace: 'CAM02p',
  smooth: false,
  shift: 1,
  output: 'RGB'
})


window._sequentialScale = _sequentialScale;

module.exports = {
  SequentialScale,
  _sequentialScale
}