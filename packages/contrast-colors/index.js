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

import * as d3 from 'd3';
import * as d3cam02 from 'd3-cam02';
import * as d3hsluv from 'd3-hsluv';
import * as d3hsv from 'd3-hsv';
Object.assign(d3, d3hsluv, d3hsv, d3cam02);

function cArray(c) {
  var L = d3.hsluv(c).l;
  var U = d3.hsluv(c).u;
  var V = d3.hsluv(c).v;

  return new Array(L, U, V);
}

function createScale({
  swatches,
  colorKeys,
  colorspace = 'LAB',
  shift = 1,
  fullScale = true
} = {}) {
  var domains = colorKeys
    .map(key => swatches - swatches * (d3.hsluv(key).v / 100))
    .sort((a, b) => a - b)
    .concat(swatches);

  domains.unshift(0);

  // Test logarithmic domain (for non-contrast-based scales)
  var sqrtDomains = d3.scalePow()
    .exponent(shift)
    .domain([1, swatches])
    .range([1, swatches]);

  sqrtDomains = domains.map((d) => {
    if (sqrtDomains(d) < 0) {
      return 0;
    }
    return sqrtDomains(d);
  });

  // Transform square root in order to smooth gradient
  domains = sqrtDomains;

  var sortedColor = colorKeys
    // Convert to HSLuv and keep track of original indices
    .map((c, i) => { return { colorKeys: cArray(c), index: i } })
    // Sort by lightness
    .sort((c1, c2) => c2.colorKeys[2] - c1.colorKeys[2])
    // Retrieve original RGB color
    .map(data => colorKeys[data.index]);

  var inverseSortedColor = colorKeys
    // Convert to HSLuv and keep track of original indices
    .map((c, i) => { return {colorKeys: cArray(c), index: i} })
    // Sort by lightness
    .sort((c1, c2) => c1.colorKeys[2] - c2.colorKeys[2])
    // Retrieve original RGB color
    .map(data => colorKeys[data.index]);

  let ColorsArray = [];

  let scale;
  if (colorspace == 'CAM02') {
    if (fullScale == true) {
      ColorsArray = ColorsArray.concat('#ffffff', sortedColor, '#000000');
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    ColorsArray = ColorsArray.map(d => d3.jab(d));

    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateJab);
  }
  else if (colorspace == 'LCH') {
    ColorsArray = ColorsArray.map(d => d3.hcl(d));
    if (fullScale == true) {
      ColorsArray = ColorsArray.concat(d3.hcl(NaN, 0, 100), sortedColor, d3.hcl(NaN, 0, 0));
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateHcl);
  }
  else if (colorspace == 'LAB') {
    if (fullScale == true) {
      ColorsArray = ColorsArray.concat('#ffffff', sortedColor, '#000000');
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    ColorsArray = ColorsArray.map(d => d3.lab(d));

    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateLab);
  }
  else if (colorspace == 'HSL') {
    if (fullScale == true) {
      ColorsArray = ColorsArray.concat('#ffffff', sortedColor, '#000000');
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    ColorsArray = ColorsArray.map(d => d3.hsl(d));
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateHsl);
  }
  else if (colorspace == 'HSLuv') {
    ColorsArray = ColorsArray.map(d => d3.hsluv(d));
    if (fullScale == true) {
      ColorsArray = ColorsArray.concat(d3.hsluv(NaN, NaN, 100), sortedColor, d3.hsluv(NaN, NaN, 0));
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateHsluv);
  }
  else if (colorspace == 'RGB') {
    if (fullScale == true) {
      ColorsArray = ColorsArray.concat('#ffffff', sortedColor, '#000000');
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    ColorsArray = ColorsArray.map(d => d3.rgb(d));
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateRgb);
  }
  else if (colorspace == 'HSV') {
    if (fullScale == true) {
      ColorsArray = ColorsArray.concat('#ffffff', sortedColor, '#000000');
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    ColorsArray = ColorsArray.map(d => d3.hsv(d));
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateHsv);
  }
  else {
    throw new Error(`Colorspace ${colorspace} not supported`)
  }

  var Colors = d3.range(swatches).map(d => scale(d));

  let colors = Colors.filter(el => el != null);

  // Return colors as hex values for interpolators.
  let colorsHex = [];
  for (let i=0; i<colors.length; i++) {
    colorsHex.push(d3.rgb(colors[i]).formatHex());
  }

  return {
    colorKeys: colorKeys,
    colorspace: colorspace,
    shift: shift,
    colors: colors,
    scale: scale,
    colorsHex: colorsHex
  };
}

function generateContrastColors({
  colorKeys,
  base,
  ratios,
  colorspace = 'LAB'
} = {}) {
  let swatches = 3000;

  let scaleData = createScale({swatches: swatches, colorKeys: colorKeys, colorspace: colorspace, shift: 1});

  var Contrasts = d3.range(swatches).map((d) => {
    var rgbArray = [d3.rgb(scaleData.scale(d)).r, d3.rgb(scaleData.scale(d)).g, d3.rgb(scaleData.scale(d)).b];
    var baseRgbArray = [d3.rgb(base).r, d3.rgb(base).g, d3.rgb(base).b];
    var ca = contrast(rgbArray, baseRgbArray).toFixed(2);

    return Number(ca);
  });

  let contrasts = Contrasts.filter(el => el != null);

  var baseLum = luminance(d3.rgb(base).r, d3.rgb(base).g, d3.rgb(base).b);

  let newColors = [];
  ratios = ratios.map(Number);

  // Return color matching target ratio, or closest number
  for (let i=0; i < ratios.length; i++){
    var r = binarySearch(contrasts, ratios[i], baseLum);
    newColors.push(d3.rgb(scaleData.colors[r]).hex());
  }

  return newColors;
}

function luminance(r, g, b) {
  var a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928
        ? v / 12.92
        : Math.pow( (v + 0.055) / 1.055, 2.4 );
  });
  return (a[0] * 0.2126) + (a[1] * 0.7152) + (a[2] * 0.0722);
}

// function percievedLum(r, g, b) {
//   return (0.299*r + 0.587*g + 0.114*b);
// }

// Separate files in a lib folder as well.
function contrast(color, base) {
  var colorLum = luminance(color[0], color[1], color[2]);
  var baseLum = luminance(base[0], base[1], base[2]);

  var cr1 = (colorLum + 0.05) / (baseLum + 0.05);
  var cr2 = (baseLum + 0.05) / (colorLum + 0.05);

  if (baseLum < 0.5) {
    if (cr1 >= 1) {
      return cr1;
    }
    else {
      return cr2 * -1;
    } // Return as whole negative number
  }
  else {
    if (cr1 < 1) {
      return cr2;
    }
    else {
      return cr1 * -1;
    } // Return as whole negative number
  }
}

// Binary search to find index of contrast ratio that is input
// Modified from https://medium.com/hackernoon/programming-with-js-binary-search-aaf86cef9cb3
function binarySearch(list, value, baseLum) {
  // initial values for start, middle and end
  let start = 0
  let stop = list.length - 1
  let middle = Math.floor((start + stop) / 2)

  var minContrast = Math.min(...list);
  var maxContrast = Math.max(...list);

  // While the middle is not what we're looking for and the list does not have a single item
  while (list[middle] !== value && start < stop) {
    // Value greater than since array is ordered descending
    if (baseLum > 0.5) {  // if base is light, ratios ordered ascending
      if (value < list[middle]) {
        stop = middle - 1
      }
      else {
        start = middle + 1
      }
    }
    else { // order descending
      if (value > list[middle]) {
        stop = middle - 1
      }
      else {
        start = middle + 1
      }
    }
    // recalculate middle on every iteration
    middle = Math.floor((start + stop) / 2)
  }

  // If no match, find closest item greater than value
  let closest = list.reduce((prev, curr) => curr > value ? curr : prev);

  // if the current middle item is what we're looking for return it's index, else closest
  return (list[middle] == !value) ? closest : middle // how it was originally expressed
}

exports.createScale = createScale;
exports.luminance = luminance;
exports.contrast = contrast;
exports.binarySearch = binarySearch;
exports.generateContrastColors = generateContrastColors;
