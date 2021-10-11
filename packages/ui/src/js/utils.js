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


module.exports = {
  randomId,
  throttle,
  convertToCartesian,
  filterNaN,
  camelCase,
  makePowScale,
  round,
  convertColorValue,
  lerp,
  removeElementsByClass
}