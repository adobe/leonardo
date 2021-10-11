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
import * as d3 from './d3';
const chroma = require('chroma-js');
const { extendChroma } = require('./chroma-plus');

extendChroma(chroma);

function randomId() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
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
     timerId = setTimeout(function () {
       if ((Date.now() - lastRan) >= wait) {
         func.apply(context, args);
         lastRan = Date.now();
       }
     }, (wait - (Date.now() - lastRan)) || 0);
   }
 };
}

function camelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function convertToCartesian(s, h, clamp) {
  if(clamp) {
    if(s > 100) s = 100;
  }
  // convert degrees to radians
  let hRad = (h * Math.PI) / 180;
  let xAxis = s * Math.cos(hRad);
  let yAxis = s * Math.sin(hRad);

  return{
    x: xAxis,
    y: yAxis
  };
}

function filterNaN(x) {
  if(isNaN(x) || x === undefined) {
    return 0;
  } else {
    return x;
  }
}

function removeElementsByClass(className){
  const elements = document.getElementsByClassName(className);
  while(elements.length > 0){
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
  RGB: 'rgb',
};
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
      return { r: rgb[0], g: rgb[1], b: rgb[2] };
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
    if (space in { lab: 1, lch: 1, jab: 1, jch: 1 }) {
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

  keys1.forEach((i) => { lookupObject[originalArray[i][prop]] = originalArray[i]; });

  const keys2 = Object.keys(lookupObject);
  keys2.forEach((i) => newArray.push(lookupObject[i]));
  return newArray;
}

function findMatchingLuminosity(colorScale, colorLen, luminosities, smooth) {
  const colorSearch = (x) => {
    const first = (smooth) ?  chroma(colorScale(0)).hsluv()[2] : colorScale(0).hsluv()[2];
    const last = (smooth) ?  chroma(colorScale(colorLen)).hsluv()[2] : colorScale(colorLen).hsluv()[2];

    const dir = first < last ? 1 : -1;
    const ε = 0.01;
    x += 0.005 * Math.sign(x);
    let step = colorLen / 2;
    let dot = step;
    let val = (smooth) ?  chroma(colorScale(dot)).hsluv()[2] : colorScale(dot).hsluv()[2];
    let counter = 100;
    while (Math.abs(val - x) > ε && counter) {
      counter--;
      step /= 2;
      if (val < x) {
        dot += step * dir;
      } else {
        dot -= step * dir;
      }
      val = (smooth) ?  chroma(colorScale(dot)).hsluv()[2] : colorScale(dot).hsluv()[2];
    }
    return round(dot, 3);
  };
  const outputColors = [];
  luminosities.forEach((lum) => {
    if(smooth) {
      let findColor = colorScale(colorSearch(+lum))
      outputColors.push(chroma(findColor).hex())
    } else {
      outputColors.push(colorScale(colorSearch(+lum)).hex())
    }
  });
  return outputColors;
};


module.exports = {
  randomId,
  throttle,
  convertToCartesian,
  filterNaN,
  camelCase,
  makePowScale,
  removeDuplicates,
  round,
  convertColorValue,
  findMatchingLuminosity,
  lerp,
  removeElementsByClass
}