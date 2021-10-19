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
const DeltaE = require('delta-e');

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

function getColorDifference(color1, color2) {
  // pre-formatting and running through specific deltaE formula
  let c1 = chroma(color1).lab();
  let c2 = chroma(color2).lab();
  let c1Lab = { L: c1[0], A: c1[1] , B: c1[2] }
  let c2Lab = { L: c2[0], A: c2[1] , B: c2[2] }
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

  // Filter colors with lightness darker than 40,
  // as darker colors are less clearly identifiable.
  let filteredColors = [];
  for(let i=0; i< colors.length; i++) {
    if(chroma(orderedColors[i]).jch()[1] > 40 && chroma(orderedColors[i]).jch()[0] > 8) filteredColors.push(orderedColors[i]);
    else continue;
  }

  // Create new array, bucketing similar hues within sub-arrays
  let bucketedColors = [];
  for(let i = 0; i < filteredColors.length; i++) {
    const lastIndex = (i === 0) ? filteredColors.length - 1 : i -1;
    const currentColor = filteredColors[i];
    const lastColor = filteredColors[lastIndex];
    const hueDiff = chroma(currentColor).jch()[2] - chroma(lastColor).jch()[2];

    // console.color(currentColor)
    if(hueDiff < 0) hueDiff = hueDiff * -1;

    if(hueDiff > 15 || bucketedColors.length === 0) {
      const newArr = [];
      newArr.push(currentColor)
      bucketedColors.push(newArr)
      // console.log(`Adding new array with color ${currentColor}`)
    } 
    if(hueDiff < 15 && bucketedColors.length > 0) {
      for(let z=0; z<bucketedColors.length; z++) {
        const currentBucket = bucketedColors[z];
        const matchingArray = currentBucket.indexOf(lastColor);

        let colorDiffs = currentBucket.map((color) => {
          return getColorDifference(color, currentColor);
        });
        // let hueDiffs = currentBucket.map((color) => {
        //   return chroma(currentColor).jch()[2] - chroma(color).jch()[2];
        // });
        let minDiff = Math.min(...colorDiffs);
        if(minDiff > 15) {
          if (matchingArray >= 0 ) {
            currentBucket.push(currentColor)
          }
        }
      } 
    }
  }
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
  for(let i = 0; i < validOptions.length; i++) {
    if(!validOptions.includes(priority1)) console.warn(`${priority1} is not a valid option of ${validOptions}`);
    if(priority2) {
      if(!validOptions.includes(priority2)) console.warn(`${priority1} is not a valid option of ${validOptions}`);
    }
  }
  // for each color, convert to lch object
  let colorsJch = colors.map((color, i) => {
    let jch = chroma(color).jch();
    return {hue: jch[2], saturation: jch[1], lightness: jch[0], color, index: i}
  })

  let sorted;
  if(priority2) {
    // Sort by priority 1, then by priority 1
    sorted = colorsJch.sort((a, b) => (a[priority1] > b[priority1]) ? 1 : (a[priority1] === b[priority1]) ? ((a[priority2] > b[priority2]) ? 1 : -1) : -1 )
  } else {
    sorted = colorsJch.sort((a, b) => (a[priority1] > b[priority1]) ? 1 : -1 )
  }
  
  // Create random "starting point" for hues
  // Only useful in CVD scenario
  if(random) {
    if(priority1 === 'hue') {
      let randomIndex = getRandomInt(sorted.length);
      let firstHalf = sorted.splice(0, randomIndex);
      let secondHalf = sorted.splice(randomIndex);
      sorted = secondHalf.concat(firstHalf)
    }  
  }

  const orderedColors = sorted.map((object) => {return object.color});
  return orderedColors;
}

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
  removeElementsByClass,
  getColorDifference,
  groupCommonHues
}