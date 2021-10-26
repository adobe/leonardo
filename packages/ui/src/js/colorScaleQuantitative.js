/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {simulate} from '@bjornlu/colorblind';
import {
  throttle,
  capitalizeFirstLetter
} from './utils';
import {
  createColorWheel,
  updateColorWheel,
  updateColorDots
} from './colorWheel';
import {createDemos} from './createDemos';

const chroma = require('chroma-js');
const { extendChroma } = require('./chroma-plus');
const DeltaE = require('delta-e');

extendChroma(chroma);

const rangeInput = document.getElementById('qualitative_Threshold');
const button = document.getElementById('qualitative_Generate');
const testColorsInput = document.getElementById('qualitative_sampleColors');
const chartsModeSelect = document.getElementById('qualitative_chartsMode');
const minContrast = document.getElementById('qualitative_minContrast');
const protan = document.getElementById('check_Protanopia');
const deutan = document.getElementById('check_Deuteranopia');
const tritan = document.getElementById('check_Tritanopia');
const achroma = document.getElementById('check_Achromatopsia');

let newSafeColors;
let keepers = [];
window.keepers = keepers;

function colorScaleQualitative(scaleType = 'qualitative') {
  const testColors = testColorsInput.value
    .replaceAll(' ', '')
    .split(',');
  
  showColors(testColors, 'originalColors', true)
  createColorWheel(chartsModeSelect.value, 50, scaleType);
  button.click();
  createDemos(scaleType, keepers)
}

chartsModeSelect.addEventListener('change', () => {
  if(newSafeColors) {
    updateColorWheel(chartsModeSelect.value, 50, null, chartsModeSelect.value, 'qualitative', keepers)
    // updateColorDots(chartsModeSelect.value, 'qualitative', newSafeColors);
  }
})

function updateColors() {
  const scaleType = 'qualitative';

  clearKeepers();
  const testColors = testColorsInput.value
  .replaceAll(' ', '')
  .split(',');

  document.getElementById('cvdSafeColors').innerHTML = ' ';
  const newSafeColors = getLargestSetCvdColors(testColors);
  showColors(newSafeColors, 'cvdSafeColors');
  showSimulatedColors(newSafeColors, true);
  createDemos(scaleType, keepers);
}

rangeInput.addEventListener('input', function() {
  updateColors();
});

minContrast.addEventListener('input', function() {
  updateColors()
});

protan.addEventListener('input', function() {
  updateColors()
})
deutan.addEventListener('input', function() {
  updateColors()
})
tritan.addEventListener('input', function() {
  updateColors()
})
achroma.addEventListener('input', function() {
  updateColors()
})

button.addEventListener('click', function() {
  const scaleType = 'qualitative';
  document.getElementById('cvdSafeColors').innerHTML = ' ';
  const testColors = testColorsInput.value
  .replaceAll(' ', '')
  .split(',');

  // const keeperColors = document.getElementById('keepers');
  // const value = keeperColors.value;
  const arr = keepers;
  // let arr;
  // if(value.length === 7) {
  //   arr = new Array(value)
  // }
  // else { 
  //   arr = value.split(',')
  // }

  let valid = true;
  arr.map((item) => {
    if(item.length < 7) valid = false;
  })

  if(valid) {
    newSafeColors = getLargestSetCvdColors(testColors, arr);
    showColors(newSafeColors, 'cvdSafeColors');
    showSimulatedColors(newSafeColors, true);
  } else {
    newSafeColors = getLargestSetCvdColors(testColors);
    showColors(newSafeColors, 'cvdSafeColors');
    showSimulatedColors(newSafeColors, true);
  }
  updateColorDots(chartsModeSelect.value, scaleType, keepers);
  createDemos(scaleType, keepers);

})

function clearKeepers() {
  keepers = [];
  let wrapper = document.getElementById('qualitative_selectedColors');
  wrapper.classList.add('isEmpty');
  wrapper.innerHTML = 'Select generated colors to begin building your scale';

}

testColorsInput.addEventListener('input', function(e) {
  const testColors = e.target.value
    .replaceAll(' ', '')
    .split(',');

  throttle(showColors(testColors, 'originalColors', true), 10);
})


function getModes() {
  let modes = [];

  if(protan.checked) modes.push('protanopia');
  if(deutan.checked) modes.push('deuteranopia');
  if(tritan.checked) modes.push('tritanopia');
  if(achroma.checked) modes.push('achromatopsia');

  return modes;
}

/** 
 *  Not confident in Chroma.js deltaE function.
 *  Docs reference 1984 formula with 'adaptation'
 *  and link to internet archived content.
 * 
 *  Delta-E npmjs package has 2000 formula update
 *  of deltaE, along with 1976 and 1994 formulas.
 *  Docs include more links to research and details
 *  than Chroma.js, leading me to have more confidence
 *  in this package.
 * 
 *  Note: test differences in deltaE between these 
 *  packages with the following items:
 * 
 *  var color1 = {L: 36, A: 60, B: 41};
 *  var color2 = {L: 89, A: 0, B: 76}; 
 *  console.log(DeltaE.getDeltaE00(color1, color2));
 *  returns 61.16740074680422
 * 
 *  compared to :
 *  var color1 = chroma.lab(36, 60, 41);
 *  var color2 = chroma.lab(89, 0, 76);
 *  console.log(chroma.deltaE(color1, color2));
 *  returns 53.7220116450339
 * 
 *  Also, Chroma differs when passing RGB values to deltaE:
 *  var color1 = 'rgb(173, 2, 22)';
 *  var color2 = 'rgb(255, 222, 65)';
 *  console.log(chroma.deltaE(color1, color2));
 *  returns 76.046866524513779
 */



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
  let c1Lab = { L: c1[0], A: c1[1] , B: c1[2] }
  let c2Lab = { L: c2[0], A: c2[1] , B: c2[2] }
  // Use DeltaE 2000 formula (latest)
  return DeltaE.getDeltaE00(c1Lab, c2Lab);
}

/**
 *  Helper function to reformat colors as an object
 *  to pass through the simulator. Returns colors in RGB
 * 
 *  works as expected:
 *  console.log(simulateCvd('rgb(120, 50, 30)', 'protanopia'))
 *  returns {r: 62, g: 62, b: 30}
 */
function simulateCvd(color, deficiency) {
  if (!color) console.log(`${color} is invalid`)
  let cRgb = chroma(color).rgb();
  let c = { r: cRgb[0], g: cRgb[1], b: cRgb[2] }
  let sim = simulate(c, deficiency);
  let simRgb = chroma.rgb(sim.r, sim.g, sim.b).hex();
  return simRgb
}
// 
// return `rgb(${sim.r}, ${sim.g}, ${sim.b})`;
// console.log(simulateCvd('rgb(120, 50, 30)', 'protanopia'))

/**
 *  Helper function to test two colors for all CVD
 *  types. Returns true or false
 * 
 *  let testColor1 = '#e41a1c';
 *  let testColor2 = '#25547a';
 *  console.log(testCvd(testColor1, testColor2))
 *  // returns true
 *  
 *  let testColor1 = '#e41a1c';
 *  let testColor2 = '#cf2b22';
 *  console.log(testCvd(testColor1, testColor2))
 *  // returns false
 */

function testCvd(color1, color2, log) {
  // const minimumThreshold = 11;
  // Temporarily grab threshold from the UI
  let minimumThreshold = Number(rangeInput.value);

  // const modes = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
  const modes = getModes();
  let result = true;

  for(let i = 0; i < modes.length; i++) {
    let sim1 = simulateCvd(color1, modes[i]);
    let sim2 = simulateCvd(color2, modes[i]);
    let deltaE = getDifference(sim1, sim2);
    if(deltaE < minimumThreshold) {
      if(log) console.error(`${color1} conflicts with ${color2} in ${modes[i]}\nDeltaE: ${deltaE}`)
      result = false; 
      break;
    }
    else continue;
  }

  return result;
}

/** 
 *  Function for getting CVD safe colors from a set
 *  Grab a random color. Then loop through the array of colors.
 *  For each color, if it passes & then passes with all other colors, 
 *  put it in the safeColors array
 */
function getCvdSafeColors(colors, sample) {
  let set = orderColors(colors, 'hue', 'lightness');
  let ratios = minContrast.checked;
  if(ratios) set = eliminateLowContrastFromSet(set, '#ffffff', 3)
  
  let safeColors = [];
  if(sample) {
    if(sample.length > 1) {
      // test all sample colors against themselves first
      for(let i = 0; i < sample.length; i++) {
        // loop this color against all other colors
        let result = true;
        for(let j=0; j<sample.length; j++) {
          if(i === j) {continue}
          else {
            let test = testCvd(sample[i], sample[j], true) // true will log any conflicts
            if(test === false) {
              result = false;
              break;
            }
          }
        }
        if(result === true) {
          safeColors.push(sample[i])
        } else {
          console.warn(`Conflict: eliminating color ${sample[i]} from set`);
        }
      }
      // Remove duplicates
      safeColors = [...new Set(safeColors)];
    }
    if(sample.length === 1) {
      safeColors.push(sample[0])
    }
  }
  else {
    const randomIndex = getRandomInt(set.length);
    // Grab a random color to start with
    const randomColor = set[randomIndex];
    safeColors.push(randomColor);
  }

  let end = safeColors.length;
  
  for(let i = 0; i < set.length; i ++) {
    let result = true;
    // For each color of the setay, 
    // loop it against all colors of safeColors
    for (let j = 0; j < end; j++) {
      let test = testCvd(set[i], safeColors[j]);
      if(test === false) {result = false; break;}
      else continue;
    }
    if(result === true) {
      // safeColors = [...safeColors, set[i] ];
      safeColors.push(set[i]);
      end = end + 1;
    }
  }
  
  return safeColors;
}

let cache;
function getLargestSetCvdColors(set, sample) {

  let sets = [];
  for(let i = 0; i < 12; i++) {
    sets.push(getCvdSafeColors(set, sample)); 
  }

  let maxLengthArray = Math.max(...sets.map(a=>a.length));
  let indicies = sets.map(a=>a.length);
  let index = indicies.indexOf(maxLengthArray);

  let matchingIndicies = [];
  while (index != -1) {
    matchingIndicies.push(index);
    index = indicies.indexOf(maxLengthArray, index + 1);
  }
  for(let i=0; i < matchingIndicies.length; i++) {
    let currentIndex = matchingIndicies[i];
    if(arraysEqual(sets[currentIndex], cache)) {
      continue;
    } else {
      cache = sets[currentIndex];
      return sets[currentIndex];
    }
  }
}

/**
 *  Helper function to order colors
 *  by hue and lightness
 */
function orderColors(colors, priority1, priority2) {
  let validOptions = ['hue', 'saturation', 'lightness'];
  for(let i = 0; i < validOptions.length; i++) {
    if(!validOptions.includes(priority1)) console.warn(`${priority1} is not a valid option of ${validOptions}`);
    if(!validOptions.includes(priority2)) console.warn(`${priority1} is not a valid option of ${validOptions}`);
  }
  // for each color, convert to lch object
  let colorsLch = colors.map((color, i) => {
    let lch = chroma(color).jch();
    return {hue: lch[2], saturation: lch[1], lightness: lch[0], color, index: i}
  })
  // Sort by priority 1, then by priority 1
  let sorted = colorsLch.sort((a, b) => (a[priority1] > b[priority1]) ? 1 : (a[priority1] === b[priority1]) ? ((a[priority2] > b[priority2]) ? 1 : -1) : -1 )
  // Create random "starting point" for hues
  if(priority1 === 'hue') {
    let randomIndex = getRandomInt(sorted.length);
    let firstHalf = sorted.splice(0, randomIndex);
    let secondHalf = sorted.splice(randomIndex);
    sorted = secondHalf.concat(firstHalf)
  }  
  const orderedColors = sorted.map((object) => {return object.color});
  return orderedColors;
}


// SPECTRUM COLORS

// const testColors = ["#ffebe7","#ffddd6","#ffcdc3","#ffb7a9","#ff9b88","#ff7c65","#f75c46","#ea3829","#d31510","#b40000","#930000","#740000","#590000","#430000","#ffeccc","#ffdfad","#fdd291","#ffbb63","#ffa037","#f68511","#e46f00","#cb5d00","#b14c00","#953d00","#7a2f00","#612300","#491901","#351201","#fbf198","#f8e750","#f8d904","#e8c600","#d7b300","#c49f00","#b08c00","#9b7800","#856600","#705300","#5b4300","#483300","#362500","#281a00","#d8fba4","#c7f385","#b5e96d","#9cda4d","#84c833","#70b520","#5fa114","#508c0e","#437709","#376307","#2c4f05","#223d04","#192d03","#122002","#cdfcbf","#aef69d","#96ee85","#72e06a","#4ecf50","#27bb36","#07a721","#009112","#007c0f","#00670f","#00530d","#00400a","#003007","#002205","#dcf5e5","#c1efd4","#a5e7c4","#7cdbad","#55ca96","#35b881","#17a46f","#008f5d","#007a4d","#00653f","#005132","#093f27","#0d2e1d","#0b2015","#ccf7f6","#abf1f0","#8be8e7","#66d9d9","#43c8ca","#1cb4b9","#00a0a7","#008a94","#007680","#00616c","#044e58","#0d3c43","#0f2c31","#0d1f23","#caf6fe","#a4f0fe","#81e7fc","#53d8f8","#17c5f2","#05b0e0","#049cca","#0386b3","#02729d","#015e87","#004a73","#00395a","#002b42","#001f30","#e0f2ff","#cae8ff","#b5deff","#96cefd","#78bbfa","#59a7f6","#3892f3","#147af3","#0265dc","#0054b6","#004491","#003571","#002754","#001c3c","#edeeff","#e0e2ff","#d3d5ff","#c1c4ff","#acafff","#9599ff","#7e84fc","#686df4","#5258e4","#4046ca","#3236a8","#262986","#1b1e64","#141648","#f6ebff","#eeddff","#e6d0ff","#dbbbfe","#cca4fd","#bd8bfc","#ae72f9","#9d57f4","#893de7","#7326d3","#5d13b7","#470c94","#33106a","#230f49","#ffe9fc","#ffdafa","#fec7f8","#fbaef6","#f592f3","#ed74ed","#e055e2","#cd3ace","#b622b7","#9d039e","#800081","#640664","#470e46","#320d31","#ffeaf1","#ffdce8","#ffcadd","#ffb2ce","#ff95bd","#fa77aa","#ef5a98","#de3d82","#c82269","#ad0955","#8e0045","#700037","#54032a","#3c061d"]
// const testKeepers = ['#8be8e7','#9d57f4','#f75c46']
// #8be8e7,#27bb36,#c82269,#147af3,#33106a
// #437709,#ae72f9,#470c94,#ffa037,#f8d904

function showColors(arr, dest, panel = false) {
  let wrap = document.getElementById(dest);
  wrap.innerHTML = ' ';

  arr.map((color) => { 
    let swatch = document.createElement('div');
    const contrast = getContrast('#000000', color);
    swatch.className = (!panel) ? 'simulationSwatch' : 'panelSwatch';
    swatch.style.backgroundColor = color;
    swatch.style.color = (contrast < 4.5) ? '#ffffff' : '#000000';
    swatch.innerHTML = (!panel) ? `${color}` : ' ';

    if(dest === 'cvdSafeColors') {
      let button = document.createElement('button');
      button.className = (keepers.indexOf(color) >= 0) ?  'saveColorToKeepers showSvg' : 'saveColorToKeepers',
      button.style.color = (contrast < 4.5) ? '#ffffff' : '#000000';
      button.innerHTML = (keepers.indexOf(color) >= 0) 
      ? `<svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Locked">
        <use xlink:href="#spectrum-icon-18-LockClosed"></use>
      </svg>`  
      : `<svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
          <use xlink:href="#spectrum-icon-18-Add"></use>
        </svg>`
      button.addEventListener('click', (e) => {
        if(keepers.indexOf(color) < 0) {
          keepers.push(color);
          showColors(keepers, 'qualitative_selectedColors');
          updateColorDots(chartsModeSelect.value, 'qualitative', keepers);
          createDemos('qualitative', keepers);
          document.getElementById('qualitative_selectedColors').classList.remove('isEmpty');
        }
      })
      swatch.appendChild(button)
    }
    if(dest === 'qualitative_selectedColors') {
      let button = document.createElement('button')
      button.className = 'saveColorToKeepers',
      button.style.color = (contrast < 4.5) ? '#ffffff' : '#000000';
      button.innerHTML = `<svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
        <use xlink:href="#spectrum-icon-18-Delete"></use>
      </svg>`
      button.addEventListener('click', () => {
        const index = keepers.indexOf(color);
        if (index > -1) {
          keepers.splice(index, 1);
        }
        showColors(keepers, 'qualitative_selectedColors')
        updateColorDots(chartsModeSelect.value, 'qualitative', keepers);
        createDemos('qualitative', keepers);
        if(keepers.length < 1) {
          const selectedColors = document.getElementById('qualitative_selectedColors');
          selectedColors.classList.add('isEmpty');
          selectedColors.innerHTML = 'Select generated colors to begin building your scale';
        }
      })
      swatch.appendChild(button)
    }

    wrap.appendChild(swatch);
  });
}



/** Putting it all together in the UI as a test */

// test ordering
// const orderedColors = orderColors(testColors, 'hue', 'lightness');
// showColors(orderedColors, 'orderedColors')

// const safeColors = getCvdSafeColors(testColors);
const sampleSet = [
  '#0099ff',
  '#dfb200'
]
// const safeColors = getCvdSafeColors(testColors);
// showColors(safeColors, 'cvdSafeColors')


function showSimulatedColors(arr, sortBySimmilarity) {
  let wrap = document.getElementById('simulatedColors');
  wrap.innerHTML = ' ';
  // loop through each CVD type
  // let modes = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
  let modes = getModes();
  modes.forEach((mode, index) => {
    let label = document.createElement('h3');
    label.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
    label.innerHTML = `${capitalizeFirstLetter(mode)}`
    wrap.appendChild(label);
    let simColor = arr.map((color) => {return simulateCvd(color, mode)});
    let originalIndicies = Array.from(Array(arr.length - 1).keys());
    // if sort by similarity, order colors by hue
    if(sortBySimmilarity) {
      // for each color, convert to lch object
      let colorsLch = simColor.map((color, i) => {
        let lch = chroma(color).lch();
        return {hue: lch[2], saturation: lch[1], lightness: lch[0], color, index: i}
      })
      if(mode === 'achromatopsia') colorsLch.sort((a, b) => (a.lightness > b.lightness) ? 1 : -1 )
      // Sort by hue, then by saturation
      else colorsLch.sort((a, b) => (a.hue > b.hue) ? 1 : (a.hue === b.hue) ? ((a.saturation > b.saturation) ? 1 : -1) : -1 )
      // Redefine simColor with sorted colors
      simColor = colorsLch.map((object) => {return object.color});
      // Redefine original indicies so we can properly map original
      // color value to the newly sorted simultated colors
      originalIndicies = colorsLch.map((object) => {return object.index});
    }
    simColor.map((color, index) => { 
      let swatch = document.createElement('div');
      swatch.className = 'simulationSwatch';
      swatch.style.backgroundColor = color;
      let tinySwatch = document.createElement('div');
      tinySwatch.className = 'tinySwatch';
      tinySwatch.style.backgroundColor = arr[originalIndicies[index]];
      swatch.appendChild(tinySwatch);
      // swatch.innerHTML = arr[originalIndicies[index]]
      wrap.appendChild(swatch);
    });
  })
}
// showSimulatedColors(safeColors, true);

function arrayRemove(arr, values) { 
  const toRemove = new Set(values);
  return arr.filter((value) => {
    // return those elements not in the namesToDeleteSet
    return !toRemove.has(value);
  });
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


/** 
 *  DELETE LATER
 *  WCAG contrast crap
 */

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return (a[0] * 0.2126) + (a[1] * 0.7152) + (a[2] * 0.0722);
}

function getContrast(color, base, baseV = 1) { // defalut baseV of 1 is white background
  color = chroma(color).rgb();
  base = chroma(base).rgb();
  const colorLum = luminance(color[0], color[1], color[2]);
  const baseLum = luminance(base[0], base[1], base[2]);

  const cr1 = (colorLum + 0.05) / (baseLum + 0.05); // will return value >=1 if color is darker than background
  const cr2 = (baseLum + 0.05) / (colorLum + 0.05); // will return value >=1 if color is lighter than background

  if (baseV < 0.5) { // Dark themes
    // If color is darker than background, return cr1 which will be whole number
    if (cr1 >= 1) {
      return cr1;
    }
    // If color is lighter than background, return cr2 as negative whole number
    return -cr2;
  }
  // Light themes
  // If color is lighter than background, return cr2 which will be whole number
  if (cr1 < 1) {
    return cr2;
  }
  // If color is darker than background, return cr1 as negative whole number
  if (cr1 === 1) {
    return cr1;
  }
  return -cr1;
}

function eliminateLowContrastFromSet(set, background, ratio) {
  let lowContrastColors = [];
  for(let i = 0; i < set.length; i++) {
    let contrast = getContrast(set[i], background);
    if(contrast < ratio) lowContrastColors.push(set[i])
  }
  let newSet = arrayRemove(set, lowContrastColors);
  return newSet;
}

module.exports = {
  colorScaleQualitative,
  keepers
}