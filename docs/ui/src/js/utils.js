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
import * as d3 from './d3';
import {simulate} from '@bjornlu/colorblind';
const blinder = require('color-blind');

const chroma = require('chroma-js');
const {extendChroma} = require('./chroma-plus');
const DeltaE = require('delta-e');

extendChroma(chroma);

window.chroma = chroma;

function randomId() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(2, 10);
}

function throttle(func, wait) {
  var timerId, lastRan;

  return function throttled() {
    var context = this;
    var args = arguments;

    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(timerId);
      timerId = setTimeout(
        function () {
          if (Date.now() - lastRan >= wait) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        },
        wait - (Date.now() - lastRan) || 0
      );
    }
  };
}

function camelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

function convertToCartesian(s, h, clamp) {
  if (clamp) {
    if (s > 100) s = 100;
  }
  // convert degrees to radians
  let hRad = (h * Math.PI) / 180;
  let xAxis = s * Math.cos(hRad);
  let yAxis = s * Math.sin(hRad);

  return {
    x: xAxis,
    y: yAxis
  };
}

function filterNaN(x) {
  if (isNaN(x) || x === undefined) {
    return 0;
  } else {
    return x;
  }
}

function removeElementsByClass(className, parent) {
  let elements;
  if (!parent) elements = document.getElementsByClassName(className);
  else elements = parent.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function round(x, n = 0) {
  const ten = 10 ** n;
  return Math.round(x * ten) / ten;
}

const lerp = (x, y, a) => x * (1 - a) + y * a;

// Helper function for rounding color values to whole numbers
// Copied directly from contrast-colors. For some reason it would
// not import properly.
const colorSpaces = {
  CAM02: 'jab',
  CAM02p: 'jch',
  HEX: 'hex',
  HSL: 'hsl',
  HSLuv: 'hsluv',
  HSV: 'hsv',
  LAB: 'lab',
  LCH: 'lch', // named per correct color definition order
  RGB: 'rgb'
};

function cssColorToRgb(colorString) {
  let colorStringArr, newColor, inputFormat;

  if (colorString.match(/^hsl\(/)) {
    inputFormat = 'hsl';
  }
  if (colorString.match(/^hsv\(/)) {
    inputFormat = 'hsv';
  }
  if (colorString.match(/^lab\(/)) {
    inputFormat = 'lab';
  }
  if (colorString.match(/^lch\(/)) {
    inputFormat = 'lch';
  }
  if (colorString.match(/^jab\(/)) {
    inputFormat = 'jab';
  }
  if (colorString.match(/^jch\(/)) {
    inputFormat = 'jch';
  }
  if (colorString.match(/^hsluv\(/)) {
    inputFormat = 'hsluv';
  }

  if (!colorString) {
    console.warn(`Cannot convert css color of ${colorString}`);
  } else {
    let colorStringNums = colorString
      .match(/\(.*?\)/g)
      .toString()
      .replace('(', '')
      .replace(')', '')
      .replaceAll('%', '')
      .replace('deg', '')
      .trim(); // find numbers only
    colorStringArr = colorStringNums.split(','); // split numbers into array
    colorStringArr = colorStringArr.map((c) => {
      return filterNaN(Number(c));
    });
    let c1 = colorStringArr[0];
    let c2 = inputFormat === 'hsl' ? colorStringArr[1] / 100 : colorStringArr[1];
    let c3 = inputFormat === 'hsl' ? colorStringArr[2] / 100 : colorStringArr[2];
    newColor = chroma(c1, c2, c3, inputFormat);

    return newColor.hex();
  }
}

window.bulkConvertColorValue = bulkConvertColorValue;
function bulkConvertColorValue(colors, format, object = false) {
  let formatted = [];
  for (let i = 0; i < colors.length; i++) {
    formatted.push(convertColorValue(colors[i], format, object));
  }
  return formatted;
}

window.getAllChannelValues = getAllChannelValues;
function getAllChannelValues(colors, format, key) {
  const array = bulkConvertColorValue(colors, format, true);
  let permittedValues = array.map((value) => value[key]);
  return permittedValues;
}

window.convertColorValue = convertColorValue;
function convertColorValue(color, format, object = false) {
  if (!color) {
    throw new Error(`Cannot convert color value of “${color}”`);
  }
  if (!colorSpaces[format]) {
    throw new Error(`Cannot convert to colorspace “${format}”`);
  }

  const space = colorSpaces[format];
  const colorObj = chroma(String(color))[space]();
  if (format === 'HSL') {
    colorObj.pop();
  }
  if (format === 'HEX') {
    if (object) {
      const rgb = chroma(String(color)).rgb();
      return {r: rgb[0], g: rgb[1], b: rgb[2]};
    }
    return colorObj;
  }

  const colorObject = {};
  let newColorObj = colorObj.map(filterNaN);

  newColorObj = newColorObj.map((ch, i) => {
    let rnd = round(ch);
    let j = i;
    if (space === 'hsluv') {
      j += 2;
    }
    let letter = space.charAt(j);
    if (space === 'jch' && letter === 'c') {
      letter = 'C';
    }
    colorObject[letter === 'j' ? 'J' : letter] = rnd;
    if (space in {lab: 1, lch: 1, jab: 1, jch: 1}) {
      if (!object) {
        if (letter === 'l' || letter === 'j') {
          rnd += '%';
        }
        if (letter === 'h') {
          rnd += 'deg';
        }
      }
    } else if (space !== 'hsluv') {
      if (letter === 's' || letter === 'l' || letter === 'v') {
        colorObject[letter] = round(ch, 2);
        if (!object) {
          rnd = round(ch * 100);
          rnd += '%';
        }
      } else if (letter === 'h' && !object) {
        rnd += 'deg';
      }
    }
    return rnd;
  });

  const stringName = space;
  const stringValue = `${stringName}(${newColorObj.join(', ')})`;

  if (object) {
    return colorObject;
  }
  return stringValue;
}

function makePowScale(exp = 1, domains = [0, 1], range = [0, 1]) {
  const m = (range[1] - range[0]) / (domains[1] ** exp - domains[0] ** exp);
  const c = range[0] - m * domains[0] ** exp;
  return (x) => m * x ** exp + c;
}

function removeDuplicates(originalArray, prop) {
  const newArray = [];
  const lookupObject = {};
  const keys1 = Object.keys(originalArray);

  keys1.forEach((i) => {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  });

  const keys2 = Object.keys(lookupObject);
  keys2.forEach((i) => newArray.push(lookupObject[i]));
  return newArray;
}

function findMatchingLuminosity(colorScale, colorLen, luminosities, smooth) {
  const colorSearch = (x) => {
    const first = smooth ? chroma(colorScale(0)).hsluv()[2] : colorScale(0).hsluv()[2];
    const last = smooth ? chroma(colorScale(colorLen)).hsluv()[2] : colorScale(colorLen).hsluv()[2];

    const dir = first < last ? 1 : -1;
    const ε = 0.01;
    x += 0.005 * Math.sign(x);
    let step = colorLen / 2;
    let dot = step;
    let val = smooth ? chroma(colorScale(dot)).hsluv()[2] : colorScale(dot).hsluv()[2];
    let counter = 100;
    while (Math.abs(val - x) > ε && counter) {
      counter--;
      step /= 2;
      if (val < x) {
        dot += step * dir;
      } else {
        dot -= step * dir;
      }
      val = smooth ? chroma(colorScale(dot)).hsluv()[2] : colorScale(dot).hsluv()[2];
    }
    return round(dot, 3);
  };
  const outputColors = [];
  luminosities.forEach((lum) => {
    if (smooth) {
      let findColor = colorScale(colorSearch(+lum));
      outputColors.push(chroma(findColor).hex());
    } else {
      outputColors.push(colorScale(colorSearch(+lum)).hex());
    }
  });

  return outputColors;
}

function getColorDifference(color1, color2) {
  // pre-formatting and running through specific deltaE formula
  let c1 = chroma(color1).lab();
  let c2 = chroma(color2).lab();
  let c1Lab = {L: c1[0], A: c1[1], B: c1[2]};
  let c2Lab = {L: c2[0], A: c2[1], B: c2[2]};
  // Use DeltaE 2000 formula (latest)
  return DeltaE.getDeltaE00(c1Lab, c2Lab);
}

function groupCommonHues(colors) {
  // colors are in put as an array of Chroma.js colors.
  // Then, find the colors that are similar, and place them
  // into a sub-array.
  // EXAMPLE: ['yellow', 'lightyellow', 'blue', 'green', 'lightgreen']
  // should become: [ ['yellow', 'lightyellow'], ['blue'], ['green', 'lightgreen'] ]

  // First, resort colors by hue
  let orderedColors = orderColors(colors, 'hue', 'saturation');
  // Acceptable difference in hues
  const hueGroupThreshold = 22; // 10
  const hueThreshold = 22; // 10
  const colorDifferenceMin = 16;
  const colorDifferenceMax = 100;
  // Filter colors with lightness darker than 8,
  // and chroma greater than 40
  // as darker colors are less clearly identifiable.
  const minChroma = 30;
  const minLuma = 8;
  let filteredColors = [];
  for (let i = 0; i < colors.length; i++) {
    if (chroma(orderedColors[i]).lch()[1] > minChroma && chroma(orderedColors[i]).lch()[0] > minLuma) filteredColors.push(orderedColors[i]);
    else continue;
  }

  // Create new array, bucketing similar hues within sub-arrays
  let bucketedColors = [];
  for (let i = 0; i < filteredColors.length; i++) {
    const lastIndex = i === 0 ? filteredColors.length - 1 : i - 1;
    const currentColor = filteredColors[i];
    const lastColor = filteredColors[lastIndex];
    const hueDiff = chroma(currentColor).jch()[2] - chroma(lastColor).jch()[2];

    if (hueDiff < 0) hueDiff = hueDiff * -1;

    if (hueDiff >= hueGroupThreshold || bucketedColors.length === 0) {
      const newArr = [];
      newArr.push(currentColor);
      bucketedColors.push(newArr);
      // console.log(`Adding new array with color ${currentColor}`)
    }
    // Find the right bucket to place the color if it's within the hue threshold
    if (hueDiff < hueGroupThreshold && bucketedColors.length > 0) {
      // Loop the bucketed colors
      for (let z = 0; z < bucketedColors.length; z++) {
        const currentBucket = bucketedColors[z];

        let colorDiffs = currentBucket.map((color) => {
          return getColorDifference(color, currentColor);
        });
        let hueDiffs = currentBucket.map((color) => {
          return chroma(currentColor).jch()[2] - chroma(color).jch()[2];
        });

        let minHueDiff = Math.min(...hueDiffs);
        let minDiff = Math.min(...colorDiffs);
        let maxDiff = Math.max(...colorDiffs);

        // if minimum color difference of currentColor, when compared to all colors of
        // the current bucket..
        if (minDiff > colorDifferenceMin && maxDiff < colorDifferenceMax && minHueDiff <= hueThreshold) {
          currentBucket.push(currentColor);
        }
      }
    }
  }
  // // FOR DEBUGGING ONLY
  // for(let i = 0; i < bucketedColors.length; i++) {
  //   let bucket = bucketedColors[i];
  //   console.log('BUCKETED COLORS:')
  //   bucket.forEach((color) => {console.color(color)})
  // }
  return bucketedColors;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
/**
 *  Helper function to order colors
 *  by hue and lightness
 */
function orderColors(colors, priority1, priority2, random = false) {
  let validOptions = ['hue', 'saturation', 'lightness'];
  for (let i = 0; i < validOptions.length; i++) {
    if (!validOptions.includes(priority1)) console.warn(`${priority1} is not a valid option of ${validOptions}`);
    if (priority2) {
      if (!validOptions.includes(priority2)) console.warn(`${priority1} is not a valid option of ${validOptions}`);
    }
  }
  // for each color, convert to lch object
  let colorsJch = colors.map((color, i) => {
    let jch = chroma(color).jch();
    return {
      hue: Math.floor(jch[2]),
      saturation: Math.floor(jch[1]),
      lightness: Math.floor(jch[0]),
      color,
      index: i
    };
  });

  let sorted;
  if (priority2) {
    // Sort by priority 1, then by priority 1
    sorted = colorsJch.sort((a, b) => (a[priority1] > b[priority1] ? 1 : a[priority1] === b[priority1] ? (a[priority2] > b[priority2] ? 1 : -1) : -1));
  } else {
    sorted = colorsJch.sort((a, b) => (a[priority1] > b[priority1] ? 1 : -1));
  }

  // Create random "starting point" for hues
  // Only useful in CVD scenario
  if (random) {
    if (priority1 === 'hue') {
      let randomIndex = getRandomInt(sorted.length);
      let firstHalf = sorted.splice(0, randomIndex);
      let secondHalf = sorted.splice(randomIndex);
      sorted = secondHalf.concat(firstHalf);
    }
  }

  const orderedColors = sorted.map((object) => {
    return object.color;
  });
  return orderedColors;
}

function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

function createColorData(color, mode) {
  const f = getChannelsAndFunction(mode);
  const method = (d) => d3[f.func](d);

  let dataA = color.map(function (d) {
    let channelValue = method(d)[f.c1];
    // Need to do some geometry for polar colorspaces
    if (mode === 'CAM02p' || mode === 'LCH' || mode === 'HSL' || mode === 'HSV' || mode === 'HSLuv') {
      let s = mode === 'HSL' || mode === 'HSV' ? method(d)[f.c2] * 100 : method(d)[f.c2];
      let h = channelValue;
      return filterNaN(convertToCartesian(s, h).x);
    } else return filterNaN(channelValue);
  });
  let dataB = color.map(function (d) {
    let channelValue = method(d)[f.c3];
    if (mode === 'HSL' || mode === 'HSV') channelValue = channelValue * 100;
    return filterNaN(channelValue);
  });
  let dataC = color.map(function (d) {
    let channelValue = method(d)[f.c2];
    // Need to do some geometry for polar colorspaces
    if (mode === 'CAM02p' || mode === 'LCH' || mode === 'HSL' || mode === 'HSV' || mode === 'HSLuv') {
      let s = mode === 'HSL' || mode === 'HSV' ? channelValue * 100 : channelValue;
      let h = method(d)[f.c1];
      return filterNaN(convertToCartesian(s, h).y);
    }
    return filterNaN(channelValue);
  });

  return {
    a: dataA,
    b: dataB,
    c: dataC
  };
}

function getChannelsAndFunction(mode) {
  let c1, c2, c3, func, yMin, yMax, yMin2, yMax2, c1Label, c2Label, c3Label;
  if (mode === 'RGB') {
    func = 'hsl';
    c1 = 0;
    c1Label = `Hue (HSL - H)`;
    c2 = 1;
    c2Label = `Saturation (HSL - S)`;
    c3 = 2;
    c3Label = `Lightness (${mode} - L)`;
    yMin = 0;
    yMax = 360;
    yMin2 = 0;
    yMax2 = 1;
  }
  if (mode === 'LAB') {
    func = 'lab';
    c1 = 1;
    c1Label = `Redness / Greenness (${mode} - A)`;
    c2 = 2;
    c2Label = `Blueness / Yellowness (${mode} - B)`;
    c3 = 0;
    c3Label = `Lightness (${mode} - L)`;
  }
  if (mode === 'LCH') {
    func = 'lch';
    c1 = 2;
    c1Label = `Hue (${mode} - H)`;
    c2 = 1;
    c2Label = `Chroma (${mode} - C)`;
    c3 = 0;
    c3Label = `Lightness (${mode} - L)`;
    yMin = 0;
    yMax = 360;
  }
  if (mode === 'OKLAB') {
    func = 'oklab';
    c1 = 1;
    c1Label = `Redness / Greenness (${mode} - A)`;
    c2 = 2;
    c2Label = `Blueness / Yellowness (${mode} - B)`;
    c3 = 0;
    c3Label = `Lightness (${mode} - L)`;
  }
  if (mode === 'OKLCH') {
    func = 'oklch';
    c1 = 2;
    c1Label = `Hue (${mode} - H)`;
    c2 = 1;
    c2Label = `Chroma (${mode} - C)`;
    c3 = 0;
    c3Label = `Lightness (${mode} - L)`;
    yMin = 0;
    yMax = 360;
    yMax2 = 0.322;
  }
  if (mode === 'CAM02') {
    func = 'jab';
    c1 = 1;
    c1Label = `Redness / Greenness (${mode} - A)`;
    c2 = 2;
    c2Label = `Blueness / Yellowness (${mode} - B)`;
    c3 = 0;
    c3Label = `Lightness (${mode} - J)`;
  }
  if (mode === 'CAM02p') {
    func = 'jch';
    c1 = 2;
    c1Label = `Hue (CAM02 (Ch) - H)`;
    c2 = 1;
    c2Label = `Chroma (CAM02 (Ch) - C)`;
    c3 = 0;
    c3Label = `Lightness (${mode} - J)`;
    yMin = 0;
    yMax = 360;
  }
  if (mode === 'HSL') {
    func = 'hsl';
    c1 = 0;
    c1Label = `Hue (${mode} - H)`;
    c2 = 1;
    c2Label = `Saturation (${mode} - S)`;
    c3 = 2;
    c3Label = `Lightness (${mode} - L)`;
    yMin = 0;
    yMax = 360;
    yMin2 = 0;
    yMax2 = 1;
  }
  if (mode === 'HSLuv') {
    func = 'hsluv';
    c1 = 0;
    c1Label = `Hue (${mode} - H)`;
    c2 = 1;
    c2Label = `Saturation (${mode} - S)`;
    c3 = 2;
    c3Label = `Lightness (${mode} - L)`;
    yMin = 0;
    yMax = 360;
    yMin2 = 0;
    yMax2 = 100;
  }
  if (mode === 'HSV') {
    func = 'hsv';
    c1 = 0;
    c1Label = `Hue (${mode} - H)`;
    c2 = 1;
    c2Label = `Saturation (${mode} - S)`;
    c3 = 2;
    c3Label = `Value (${mode} - V)`;
    yMin = 0;
    yMax = 360;
    yMin2 = 0;
    yMax2 = 1;
  }

  return {
    func: func,
    c1: c1,
    c2: c2,
    c3: c3,
    c1Label: c1Label,
    c2Label: c2Label,
    c3Label: c3Label,
    yMin: yMin,
    yMax: yMax,
    yMin2: yMin2,
    yMax2: yMax2
  };
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function orderColorsByLuminosity(colors, direction = 'toLight') {
  // 'toLight' or 'toDark'
  let luminosities = colors.map((color, index) => {
    return {
      color: color,
      luminosity: d3.hsluv(color).v
    };
  });
  if (direction === 'toLight') {
    luminosities.sort((a, b) => (a.luminosity < b.luminosity ? 1 : -1));
    return luminosities.map((c) => c.color);
  }
  if (direction === 'toDark') {
    luminosities.sort((a, b) => (a.luminosity < b.luminosity ? -1 : 1));
    return luminosities.map((c) => c.color);
  } else {
    console.warn(`Direction must be of value 'toLight' or 'toDark'`);
  }
}

// Artificially create a semi-chromatic tone based on the
// hue of the lightest color key (each scale) and the
// luminosity of the midpoint. This helps to create
// a transition between each scale at the midpoint, rather
// than a sharp midpoint.
function createEquiLuminantKey(middleKey, colorKeys) {
  let luminance = d3.jch(middleKey).J;
  let sorted = orderColorsByLuminosity(colorKeys, 'toLight');
  let lightestColor = sorted[0];
  let hue = d3.jch(lightestColor).h;
  let chroma = 8;
  let newColor = d3.jch(luminance, chroma, hue).formatHex();

  return newColor;
}

/**
 *  Helper function to reformat colors as an object
 *  to pass through the simulator. Returns colors in RGB
 *
 *  works as expected:
 *  console.log(simulateCvd('rgb(120, 50, 30)', 'protanopia'))
 *  returns {r: 62, g: 62, b: 30}
 */
function simulateCvd(color, deficiency, lib = 'color-blind') {
  if (!color) console.warn(`${color} is invalid`);
  let cRgb = chroma(color).rgb();
  let c = {r: cRgb[0], g: cRgb[1], b: cRgb[2]};
  let sim, simRgb;
  /* Added conditions so that I can easily swap between CVD simulation
   * libraries. This is helpful to see any discrepancies between
   * the resulting simulation colors.
   *
   * Note: color-blind library is closer in alignment with Sim Daltonism,
   * color-blindness.com and other online simulators.
   */
  if (lib === 'bjornlu') {
    sim = simulate(c, deficiency);
    simRgb = chroma.rgb(sim.r, sim.g, sim.b).hex();
  } else if (lib === 'color-blind') {
    if (deficiency === 'deuteranopia') sim = blinder.deuteranopia(chroma(color).hex());
    if (deficiency === 'protanopia') sim = blinder.protanopia(chroma(color).hex());
    if (deficiency === 'tritanopia') sim = blinder.tritanopia(chroma(color).hex());
    if (deficiency === 'achromatopsia') sim = blinder.achromatopsia(chroma(color).hex());
    simRgb = sim;
  }

  return simRgb;
}

/**
 *  Note: returns unexpected result.
 *  Should be 61.16740074680422
 *  when passing:
 *  let colorRgb1 = 'rgb(173, 2, 22)';
 *  let colorRgb2 = 'rgb(255, 222, 65)';
 *  console.log(getDifference(colorRgb1, colorRgb2));
 *  Returns 62.725336807388025
 *
 *  May be chroma.js Lab conversion rounding
 *  as those RGB values do not come to whole numbers
 *  in Lab color space.
 */
function getDifference(color1, color2) {
  // pre-formatting and running through specific deltaE formula
  let c1 = chroma(color1).lab();
  let c2 = chroma(color2).lab();
  let c1Lab = {L: c1[0], A: c1[1], B: c1[2]};
  let c2Lab = {L: c2[0], A: c2[1], B: c2[2]};
  // Use DeltaE 2000 formula (latest)
  return DeltaE.getDeltaE00(c1Lab, c2Lab);
}

/**
 * Function for blending a translucent color with its background
 * This is an appropriate method for identifying resulting color
 * value to calculate contrast from
 */
function alphaBlend(color1, color2) {
  color1 = chroma(color1);
  color2 = chroma(color2);
  let c1 = color1.rgba();
  let c2 = color2.rgb();

  let r1, g1, b1, a1;
  let r2, g2, b2;

  r1 = c1[0];
  g1 = c1[1];
  b1 = c1[2];
  a1 = c1[3];

  r2 = c2[0];
  g2 = c2[1];
  b2 = c2[2];

  let r3 = r2 + (r1 - r2) * a1;
  let g3 = g2 + (g1 - g2) * a1;
  let b3 = b2 + (b1 - b2) * a1;

  let c3 = [r3, g3, b3];

  return chroma(c3);
}

function colorToGrayScale(color) {
  let c = chroma(color).lch();
  let newC = chroma.lch(c[0], 0, c[2]);

  return newC.hex();
}

function getLightness(color) {
  let c = chroma(color).lch();
  return c[0];
}

function colorPickerInput(e) {
  if (e !== undefined) {
    let id = e.target.id;
    let inputId = id.replace('_picker', 'Input');
    let value = e.target.value;
    let color = chroma(value);
    let input = document.getElementById(inputId);
    input.value = chroma(color).hex();
    input.dispatchEvent(new Event('input'));
  }
}

module.exports = {
  randomId,
  throttle,
  convertToCartesian,
  filterNaN,
  camelCase,
  makePowScale,
  removeDuplicates,
  createEquiLuminantKey,
  round,
  convertColorValue,
  bulkConvertColorValue,
  getAllChannelValues,
  findMatchingLuminosity,
  lerp,
  getLightness,
  colorToGrayScale,
  cssColorToRgb,
  removeElementsByClass,
  getColorDifference,
  groupCommonHues,
  capitalizeFirstLetter,
  createColorData,
  orderColors,
  alphaBlend,
  simulateCvd,
  getDifference,
  getChannelsAndFunction,
  orderColorsByLuminosity,
  shuffleArray,
  colorPickerInput
};
