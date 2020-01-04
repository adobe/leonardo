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

// Work around node and babel's difference of opinion on the read-onlyness of default
function assign(dest, ...src) {
  for (let obj of src) {
    for (let prop in obj) {
      if (prop !== 'default') {
        dest[prop] = obj[prop]
      }
    }
  }
}

assign(d3, d3hsluv, d3hsv, d3cam02);

// import { createScale } from '@adobe/leonardo-contrast-colors';
// TODO: Replace this with import for cArray and createScale

function cArray(c) {
  let L = d3.hsluv(c).l;
  let U = d3.hsluv(c).u;
  let V = d3.hsluv(c).v;

  return new Array(L, U, V);
}

function createScale({
  swatches,
  colorKeys,
  colorspace = 'LAB',
  shift = 1,
  fullScale = true
} = {}) {
  let domains = colorKeys
    .map(key => swatches - swatches * (d3.hsluv(key).v / 100))
    .sort((a, b) => a - b)
    .concat(swatches);

  domains.unshift(0);

  // Test logarithmic domain (for non-contrast-based scales)
  let sqrtDomains = d3.scalePow()
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

  let sortedColor = colorKeys
    // Convert to HSLuv and keep track of original indices
    .map((c, i) => { return { colorKeys: cArray(c), index: i } })
    // Sort by lightness
    .sort((c1, c2) => c2.colorKeys[2] - c1.colorKeys[2])
    // Retrieve original RGB color
    .map(data => colorKeys[data.index]);

  let inverseSortedColor = colorKeys
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
    throw new Error(`Colorspace ${colorspace} not supported`);
  }

  let Colors = d3.range(swatches).map(d => scale(d));

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

function removeDuplicates(originalArray, prop) {
  var newArray = [];
  var lookupObject  = {};

  for(var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for(i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
}

function generateBaseScale({
  colorKeys,
  colorspace = 'LAB'
} = {}) {
  // create massive scale
  let swatches = 1000;
  let scale = createScale({swatches: swatches, colorKeys: colorKeys, colorspace: colorspace, shift: 1});
  let newColors = scale.colorsHex;

  let colorObj = newColors
    // Convert to HSLuv and keep track of original indices
    .map((c, i) => { return { value: Number(cArray(c)[2].toFixed(0)), index: i } });

  let filteredArr = removeDuplicates(colorObj, "value")
    .map(data => newColors[data.index]);

  return filteredArr;
}

export { generateBaseScale };
