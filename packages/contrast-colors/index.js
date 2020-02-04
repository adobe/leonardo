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

function cArray(c) {
  let L = d3.hsluv(c).l;
  let U = d3.hsluv(c).u;
  let V = d3.hsluv(c).v;

  return new Array(L, U, V);
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

function generateContrastColors({
  colorKeys,
  base,
  ratios,
  colorspace = 'LAB'
} = {}) {
  if (!base) {
    throw new Error(`Base is undefined`);
  }
  if (!colorKeys) {
    throw new Error(`Color Keys are undefined`);
  }
  for (let i=0; i<colorKeys.length; i++) {
    if (colorKeys[i].length < 6) {
      throw new Error('Color Key must be greater than 6 and include hash # if hex.');
    }
    else if (colorKeys[i].length == 6 && colorKeys[i].charAt(0) != 0) {
      throw new Error('Color Key missing hash #');
    }
  }
  if (!ratios) {
    throw new Error(`Ratios are undefined`);
  }

  let swatches = 3000;

  let scaleData = createScale({swatches: swatches, colorKeys: colorKeys, colorspace: colorspace, shift: 1});
  let baseV = (d3.hsluv(base).v) / 100;

  let Contrasts = d3.range(swatches).map((d) => {
    let rgbArray = [d3.rgb(scaleData.scale(d)).r, d3.rgb(scaleData.scale(d)).g, d3.rgb(scaleData.scale(d)).b];
    let baseRgbArray = [d3.rgb(base).r, d3.rgb(base).g, d3.rgb(base).b];
    let ca = contrast(rgbArray, baseRgbArray, baseV).toFixed(2);

    return Number(ca);
  });

  let contrasts = Contrasts.filter(el => el != null);

  let newColors = [];
  ratios = ratios.map(Number);

  // Return color matching target ratio, or closest number
  for (let i=0; i < ratios.length; i++){
    let r = binarySearch(contrasts, ratios[i], baseV);
    newColors.push(d3.rgb(scaleData.colors[r]).hex());
  }

  return newColors;
}

function luminance(r, g, b) {
  let a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928
        ? v / 12.92
        : Math.pow( (v + 0.055) / 1.055, 2.4 );
  });
  return (a[0] * 0.2126) + (a[1] * 0.7152) + (a[2] * 0.0722);
}

function contrast(color, base, baseV) {
  let colorLum = luminance(color[0], color[1], color[2]);
  let baseLum = luminance(base[0], base[1], base[2]);

  let cr1 = (colorLum + 0.05) / (baseLum + 0.05);
  let cr2 = (baseLum + 0.05) / (colorLum + 0.05);

  if (baseV < 0.5) {
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

function minPositive(r) {
  if (!r) { throw new Error('Array undefined');}
  if (!Array.isArray(r)) { throw new Error('Passed object is not an array');}
  let arr = [];

  for(let i=0; i < r.length; i++) {
    if(r[i] >= 1) {
      arr.push(r[i]);
    }
  }
  return Math.min(...arr);
}

function ratioName(r) {
  if (!r) { throw new Error('Ratios undefined');}
  r = r.sort(function(a, b){return a - b}); // sort ratio array in case unordered

  let min = minPositive(r);
  let minIndex = r.indexOf(min);
  let nArr = []; // names array

  let rNeg = r.slice(0, minIndex);
  let rPos = r.slice(minIndex, r.length);

  // Name the negative values
  for (let i=0; i < rNeg.length; i++) {
    let d = 1/(rNeg.length + 1);
    let m = d * 100;
    let nVal = m * (i + 1);
    nArr.push(Number(nVal.toFixed()));
  }
  // Name the positive values
  for (let i=0; i < rPos.length; i++) {
    nArr.push((i+1)*100);
  }
  nArr.sort(function(a, b){return a - b}); // just for safe measure

  return nArr;
}

function generateAdaptiveTheme({colorScales, baseScale, brightness, contrast = 1}) {
  if (!baseScale) {
    throw new Error('baseScale is undefined');
  }
  let found = false;
  for(let i = 0; i < colorScales.length; i++) {
    if (colorScales[i].name !== baseScale) {
      found = true;
    }
  }
  if (found = false) {
    throw new Error('baseScale must match the name of a colorScales object');
  }

  if (!colorScales) {
    throw new Error('colorScales are undefined');
  }
  if (!Array.isArray(colorScales)) {
    throw new Error('colorScales must be an array of objects');
  }

  if (brightness === undefined) {
    return function(brightness, contrast) {
      return generateAdaptiveTheme({baseScale: baseScale, colorScales: colorScales, brightness: brightness, contrast: contrast});
    }
  }
  else {
    // Find color object matching base scale
    let baseIndex = colorScales.findIndex( x => x.name === baseScale );
    let baseKeys = colorScales[baseIndex].colorKeys;
    let baseMode = colorScales[baseIndex].colorspace;

    // define params to pass as bscale
    let bscale = generateBaseScale({colorKeys: baseKeys, colorspace: baseMode}); // base parameter to create base scale (0-100)
    let bval = bscale[brightness];
    let baseObj = {
      background: bval
    };

    let arr = [];
    arr.push(baseObj);

    for (let i = 0; i < colorScales.length; i++) {
      if (!colorScales[i].name) {
        throw new Error('Color missing name');
      }
      let name = colorScales[i].name;
      let ratios = colorScales[i].ratios;
      let newArr = [];
      let colorObj = {
        name: name,
        values: newArr
      };

      ratios = ratios.map(function(d) {
        let r;
        if(d > 1) {
          r = ((d-1) * contrast) + 1;
        }
        else if(d < -1) {
          r = ((d+1) * contrast) - 1;
        }
        else {
          r = 1;
        }
        return Number(r.toFixed(2));
      });

      let outputColors = generateContrastColors({
        colorKeys: colorScales[i].colorKeys,
        colorspace: colorScales[i].colorspace,
        ratios: ratios,
        base: bval});

      for (let i=0; i < outputColors.length; i++) {
        let rVal = ratioName(ratios)[i];
        let n = name.concat(rVal);

        let obj = {
          name: n,
          contrast: ratios[i],
          value: outputColors[i]
        };
        newArr.push(obj)
      }
      arr.push(colorObj);
    }

    return arr;
  }
}

// Binary search to find index of contrast ratio that is input
// Modified from https://medium.com/hackernoon/programming-with-js-binary-search-aaf86cef9cb3
function binarySearch(list, value, baseLum) {
  // initial values for start, middle and end
  let start = 0
  let stop = list.length - 1
  let middle = Math.floor((start + stop) / 2)

  let minContrast = Math.min(...list);
  let maxContrast = Math.max(...list);

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

export {
  createScale,
  luminance,
  contrast,
  binarySearch,
  generateBaseScale,
  generateContrastColors,
  minPositive,
  ratioName,
  generateAdaptiveTheme
};
