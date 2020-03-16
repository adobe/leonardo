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

import {catmullRom2bezier, prepareCurve} from './curve';

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

d3.interpolateJch = (start, end) => {
  // constant, linear, and colorInterpolate are taken from d3-interpolate
  // the colorInterpolate function is `nogamma` in the d3-interpolate's color.js
  const constant = x => () => x;
  const linear = (a, d) => t => a + t * d;
  const colorInterpolate = (a, b) => {
    const d = b - a;
    return d ? linear(a, d) : constant(isNaN(a) ? b : a);
  }

  start = d3.jch(start);
  end = d3.jch(end);

  const zero = Math.abs(start.h - end.h);
  const plus = Math.abs(start.h - (end.h + 360));
  const minus = Math.abs(start.h - (end.h - 360));
  if (plus < zero && plus < minus) {
    end.h += 360;
  }
  if (minus < zero && minus < plus) {
    end.h -= 360;
  }

  const startc = d3.hcl(start + '').c;
  const endc = d3.hcl(end + '').c;
  if (!startc) {
    start.h = end.h;
  }
  if (!endc) {
    end.h = start.h;
  }

  const J = colorInterpolate(start.J, end.J),
        C = colorInterpolate(start.C, end.C),
        h = colorInterpolate(start.h, end.h),
        opacity = colorInterpolate(start.opacity, end.opacity);

  return t => {
    start.J = J(t);
    start.C = C(t);
    start.h = h(t);
    start.opacity = opacity(t);
    return start + '';
  };
}

function smoothScale(ColorsArray, domains, space) {
  const points = space.channels.map(() => []);
  ColorsArray.forEach((color, i) =>
    points.forEach((point, j) =>
      point.push(domains[i], color[space.channels[j]])
    )
  );
  if (space.name == "hcl") {
    const point = points[1];
    for (let i = 1; i < point.length; i += 2) {
      if (isNaN(point[i])) {
        point[i] = 0;
      }
    }
  }
  points.forEach(point => {
    const nans = [];
    // leading NaNs
    for (let i = 1; i < point.length; i += 2) {
      if (isNaN(point[i])) {
        nans.push(i);
      } else {
        nans.forEach(j => point[j] = point[i]);
        nans.length = 0;
        break;
      }
    }
    // all are grey case
    if (nans.length) {
      // hue is not important except for JCh
      const safeJChHue = d3.jch("#ccc").h;
      nans.forEach(j => point[j] = safeJChHue);
    }
    nans.length = 0;
    // trailing NaNs
    for (let i = point.length - 1; i > 0; i -= 2) {
      if (isNaN(point[i])) {
        nans.push(i);
      } else {
        nans.forEach(j => point[j] = point[i]);
        break;
      }
    }
    // other NaNs
    for (let i = 1; i < point.length; i += 2) {
      if (isNaN(point[i])) {
        point.splice(i - 1, 2);
        i -= 2;
      }
    }
    // force hue to go on the shortest route
    if (space.name in {hcl: 1, hsl: 1, hsluv: 1, hsv: 1, jch: 1}) {
      let prev = point[1];
      let addon = 0;
      for (let i = 3; i < point.length; i += 2) {
        const p = point[i] + addon;
        const zero = Math.abs(prev - p);
        const plus = Math.abs(prev - (p + 360));
        const minus = Math.abs(prev - (p - 360));
        if (plus < zero && plus < minus) {
          addon += 360;
        }
        if (minus < zero && minus < plus) {
          addon -= 360;
        }
        point[i] += addon;
        prev = point[i];
      }
    }
  })
  const prep = points.map(point =>
    catmullRom2bezier(point).map(curve =>
      prepareCurve(...curve)
    )
  );
  return d => {
    const ch = prep.map(p => {
      for (let i = 0; i < p.length; i++) {
        const res = p[i](d);
        if (res != null) {
          return res;
        }
      }
    });

    if (space.name == 'jch' && ch[1] < 0) {
      ch[1] = 0;
    }

    return d3[space.name](...ch) + "";
  };
}

assign(d3, d3hsluv, d3hsv, d3cam02);

const colorSpaces = {
  CAM02: {
    name: 'jab',
    channels: ['J', 'a', 'b'],
    interpolator: d3.interpolateJab
  },
  CAM02p: {
    name: 'jch',
    channels: ['J', 'C', 'h'],
    interpolator: d3.interpolateJch
  },
  LCH: {
    name: 'hcl',
    channels: ['h', 'c', 'l'],
    interpolator: d3.interpolateHcl,
    white: d3.hcl(NaN, 0, 100),
    black: d3.hcl(NaN, 0, 0)
  },
  LAB: {
    name: 'lab',
    channels: ['l', 'a', 'b'],
    interpolator: d3.interpolateLab
  },
  HSL: {
    name: 'hsl',
    channels: ['h', 's', 'l'],
    interpolator: d3.interpolateHsl
  },
  HSLuv: {
    name: 'hsluv',
    channels: ['l', 'u', 'v'],
    interpolator: d3.interpolateHsluv,
    white: d3.hsluv(NaN, NaN, 100),
    black: d3.hsluv(NaN, NaN, 0)
  },
  RGB: {
    name: 'rgb',
    channels: ['r', 'g', 'b'],
    interpolator: d3.interpolateRgb
  },
  HSV: {
    name: 'hsv',
    channels: ['h', 's', 'v'],
    interpolator: d3.interpolateHsv
  }
};

function cArray(c) {
  const color = d3.hsluv(c);
  const L = color.l;
  const U = color.u;
  const V = color.v;

  return [L, U, V];
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

function normalizePercent(min, max, input) {
  let range = max - min;
  let correctedStartValue = input - min;
  let percentage = (correctedStartValue * 100) / range;
  return percentage / 100;
}

function createScale({
  swatches,
  colorKeys,
  colorspace = 'LAB',
  shift = 1,
  fullScale = true,
  smooth = false,
  correctLightness = true
} = {}) {
  const space = colorSpaces[colorspace];
  if (!space) {
    throw new Error(`Colorspace “${colorspace}” not supported`);
  }

  let domains;
  let ColorsArray = [];
  let scale;

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


  if (fullScale) {
    domains = colorKeys
     .map(key => swatches - swatches * (d3.hsluv(key).v / 100))
     .sort((a, b) => a - b)
     .concat(Number(swatches));

    domains.unshift(0);

    ColorsArray = [space.white || '#fff', ...sortedColor, space.black || '#000'];
  }
  else if (!fullScale) {
    let tempDomains = colorKeys
     .map(key => swatches - swatches * (d3.hsluv(key).v / 100))
     .sort((a, b) => a - b);

    let min = Math.min(...tempDomains);
    let max = Math.max(...tempDomains);

    domains = tempDomains.map(key => normalizePercent(min, max, key) * swatches);

    ColorsArray = sortedColor;
  }

  if(!correctLightness) {
    domains = [];
    for (let i=0; i < ColorsArray.length; i++) {
      let p = 1 / (ColorsArray.length - 1);
      let c = i * p;
      domains.push(c * swatches);
    }
  }

  const stringColors = ColorsArray;
  ColorsArray = ColorsArray.map(d => d3[space.name](d));
  if (space.name == 'hcl') {
    // special case for HCL if C is NaN we should treat it as 0
    ColorsArray.forEach(c => c.c = isNaN(c.c) ? 0 : c.c);
  }
  if (space.name == 'jch') {
    // JCh has some “random” hue for grey colors.
    // Replacing it to NaN, so we can apply the same method of dealing with them.
    for (let i = 0; i < stringColors.length; i++) {
      const color = d3.hcl(stringColors[i]);
      if (!color.c) {
        ColorsArray[i].h = NaN;
      }
    }
  }

  // Test logarithmic domain (for non-contrast-based scales)
  let sqrtDomains = d3.scalePow()
    .exponent(shift)
    .domain([0, swatches])
    .range([0, swatches]);

  sqrtDomains = domains.map((d) => {
    if (sqrtDomains(d) < 0) {
      return 0;
    }
    return sqrtDomains(d);
  });

  // Transform square root in order to smooth gradient
  domains = sqrtDomains;

  if (smooth) {
    scale = smoothScale(ColorsArray, domains, space);
  } else {
    scale = d3.scaleLinear()
      .domain(domains)
      .range(ColorsArray)
      .interpolate(space.interpolator);
  }

  let Colors = [];

  if(fullScale) {
    // Colors = d3.range(swatches).map(d => scale(d));
    let inc = 1 / (swatches - 1);
    for(let i = 0; i < swatches; i++) {
      let currentInc = inc * i;
      let color = scale(currentInc * swatches);
      Colors.push(color);
    }
  }
  else if (!fullScale) {
    let inc = 1 / (swatches - 1);
    for(let i = 0; i < swatches; i++) {
      let currentInc = inc * i;
      let color = scale(currentInc * swatches);
      Colors.push(color);
    }
  }

  let colors = Colors.filter(el => el != null);

  // Return colors as hex values for interpolators.
  let colorsHex = [];
  for (let i = 0; i < colors.length; i++) {
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
  colorspace = 'LAB',
  smooth
} = {}) {
  // create massive scale
  let swatches = 1000;
  let scale = createScale({swatches: swatches, colorKeys: colorKeys, colorspace: colorspace, shift: 1, smooth: smooth});
  let newColors = scale.colorsHex;

  let colorObj = newColors
    // Convert to HSLuv and keep track of original indices
    .map((c, i) => { return { value: Math.round(cArray(c)[2]), index: i } });

  let filteredArr = removeDuplicates(colorObj, "value")
    .map(data => newColors[data.index]);

  return filteredArr;
}

function generateContrastColors({
  colorKeys,
  base,
  ratios,
  colorspace = 'LAB',
  smooth = false
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

  let scaleData = createScale({swatches: swatches, colorKeys: colorKeys, colorspace: colorspace, shift: 1, smooth: smooth});
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
    let smooth = colorScales[baseIndex].smooth;

    // define params to pass as bscale
    let bscale = generateBaseScale({colorKeys: baseKeys, colorspace: baseMode, smooth: smooth}); // base parameter to create base scale (0-100)
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
      let smooth = colorScales[i].smooth;
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
        base: bval,
        smooth: smooth
      });

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


function generateSequentialColors(
  {
    swatches,
    colorKeys,
    colorspace = 'LAB',
    shift = 1,
    fullScale = true,
    correctLightness = true,
    smooth = false
  } = {}) {

  if (swatches === undefined) {
    return function(swatches) {
      // return generateAdaptiveTheme({baseScale: baseScale, colorScales: colorScales, brightness: brightness, contrast: contrast});
      return generateSequentialColors({swatches: swatches, colorKeys: colorKeys, colorspace: colorspace, shift: shift, fullScale: fullScale, correctLightness: correctLightness, smooth: smooth});
    }
  }
  else {
    let sequenceData = createScale({swatches: swatches, colorKeys: colorKeys, colorspace: colorspace, shift: shift, fullScale: fullScale, correctLightness: correctLightness, smooth: smooth});
    let colorRange = sequenceData.colors;

    let fillDomain = [];
    for(let i=0; i<swatches; i++) {
      // fill domain from 0 to 1 with percentage values of the swatches
      fillDomain.push(sequenceData.colors.length * (i / (swatches)));
    }

    let sequentialScale = d3.scaleLinear()
        .range(sequenceData.colors)
        .domain(fillDomain);

    let newColors = d3.range(swatches).map(function(d) {
      let c = sequentialScale(d);
      return d3.rgb(c).formatHex();
    });

    return newColors;
  }
}

export {
  createScale,
  luminance,
  contrast,
  binarySearch,
  generateBaseScale,
  generateContrastColors,
  generateSequentialColors,
  minPositive,
  ratioName,
  generateAdaptiveTheme
};
