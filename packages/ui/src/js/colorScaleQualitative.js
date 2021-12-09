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
import * as Leo from '@adobe/leonardo-contrast-colors';
import {_qualitativeScale} from './initialQualitativeScale';
import {
  throttle,
  capitalizeFirstLetter,
  cssColorToRgb
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
const rangeLabel = document.getElementById('qualitative_ThresholdValue');
const button = document.getElementById('qualitative_Generate');
const testColorsInput = document.getElementById('qualitative_sampleColors');
const chartsModeSelect = document.getElementById('qualitative_chartsMode');
const outputModeSelect = document.getElementById('qualitative_format');
const quoteSwitch = document.getElementById(`qualitativeparamStringQuotes`);
const backgroundInput = document.getElementById('qualitative_bgColor');

const minContrast = document.getElementById('qualitative_minContrast');
const protan = document.getElementById('check_Protanopia');
const deutan = document.getElementById('check_Deuteranopia');
const tritan = document.getElementById('check_Tritanopia');
const achroma = document.getElementById('check_Achromatopsia');

let newSafeColors; // Equals the array of generated CVD colors (regardless of keepers)
window._qualitativeScale = _qualitativeScale;

function colorScaleQualitative(scaleType = 'qualitative') {
  const testColors = _qualitativeScale.sampleColors;
  testColorsInput.value = _qualitativeScale.sampleColors;
  backgroundInput.value = '#ffffff';
  
  showColors(testColors, 'originalColors', true)
  createColorWheel(chartsModeSelect.value, 50, scaleType);
  button.click();
  createDemos(scaleType, _qualitativeScale.keeperColors);
  createOutput();
}

chartsModeSelect.addEventListener('change', () => {
  if(newSafeColors) {
    updateColorWheel(chartsModeSelect.value, 50, null, chartsModeSelect.value, 'qualitative', _qualitativeScale.keeperColors)
    // updateColorDots(chartsModeSelect.value, 'qualitative', newSafeColors);
  }
})

function updateColors() {
  const scaleType = 'qualitative';

  clearKeepers();
  const testColors = _qualitativeScale.sampleColors

  document.getElementById('cvdSafeColors').innerHTML = ' ';
  // newSafeColors = getLargestSetCvdColors(testColors);

  // TEMPORARY
  newSafeColors = getCvdSafeColors(testColors);

  showColors(newSafeColors, 'cvdSafeColors');
  showSimulatedColors(newSafeColors, true);
  createDemos(scaleType, _qualitativeScale.keeperColors);

  createOutput();
}

testColorsInput.addEventListener('input', throttle(inputUpdate, 10))

function inputUpdate(e) {
  const newTestColors = e.target.value.replaceAll(' ', '').split(',');
  _qualitativeScale.sampleColors = newTestColors;

  showColors(newTestColors, 'originalColors', true)

  setTimeout(() => {
    updateColors();
  }, 100)
}

rangeInput.addEventListener('input', function(e) {
  updateColors();
  const val = e.target.value;

  rangeLabel.innerHTML = val;
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
backgroundInput.addEventListener('input', function(e) {
  updateColors()
})

button.addEventListener('click', function() {
  const scaleType = 'qualitative';
  document.getElementById('cvdSafeColors').innerHTML = ' ';
  const testColors = _qualitativeScale.sampleColors;

  let valid = true;
  _qualitativeScale.keeperColors.map((item) => {
    if(item.length < 7) valid = false;
  })

  if(valid) {
    newSafeColors = getLargestSetCvdColors(testColors, _qualitativeScale.keeperColors);
    showColors(newSafeColors, 'cvdSafeColors');
    showSimulatedColors(newSafeColors, true);
  } else {
    newSafeColors = getLargestSetCvdColors(testColors);
    showColors(newSafeColors, 'cvdSafeColors');
    showSimulatedColors(newSafeColors, true);
  }
  updateColorDots(chartsModeSelect.value, scaleType, _qualitativeScale.keeperColors);
  createDemos(scaleType, _qualitativeScale.keeperColors);
  createOutput();
})

function clearKeepers() {
  _qualitativeScale.keeperColors = [];
  let wrapper = document.getElementById('qualitative_selectedColors');
  wrapper.classList.add('isEmpty');
  wrapper.innerHTML = 'Select generated colors to begin building your scale';
}

function getModes() {
  let modes = [];

  if(protan.checked) modes.push('protanopia');
  if(deutan.checked) modes.push('deuteranopia');
  if(tritan.checked) modes.push('tritanopia');
  if(achroma.checked) modes.push('achromatopsia');

  _qualitativeScale.cvdSupport = modes;
  return modes;
}

function createOutput() {
  const scaleType = 'qualitative';
  // const outputFormatPicker = document.getElementById(`${scaleType}_format`);
  // const output = outputFormatPicker.value;
  const output = _qualitativeScale.output;
  const quoteSwitch = document.getElementById(`${scaleType}paramStringQuotes`);
  const quotes = quoteSwitch.checked;
  // const colorFunction = colorClass.colorFunction;
  // reassign new swatch value
  const panelOutputContent = document.getElementById(`${scaleType}ColorScaleOutput`);
  panelOutputContent.innerHTML = ' ';

  const sampleColors = _qualitativeScale.keeperColors;

  _qualitativeScale.keeperColors = (_qualitativeScale.output === 'HEX' || _qualitativeScale.output === 'RGB') ? sampleColors: sampleColors.map((c) => {return cssColorToRgb(c)});

  let colorvalueString = 
    (quotes) 
    ? sampleColors
      .map((c) => {
        return `"${c}"`
      })
      .toString() 
      .replaceAll(',', ', ')
    : sampleColors.toString().replaceAll(',', ', ');;
  panelOutputContent.innerHTML = colorvalueString;
}

outputModeSelect.addEventListener('change', (e) => {
  let format = e.target.value;
  _qualitativeScale.output = format;

  createOutput();
})
quoteSwitch.addEventListener('change', createOutput)

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
  if (!color) console.warn(`${color} is invalid`)
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
  let background = backgroundInput.value;

  if(ratios) set = eliminateLowContrastFromSet(set, background, 3)
  
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
  for(let i = 0; i < 18; i++) {
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
    } if(!sets[currentIndex]) {
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


function showColors(arr, dest, panel = false) {
  let wrap = document.getElementById(dest);
  wrap.innerHTML = ' ';

  if(!arr) {
    let swatch = document.createElement('div');
    swatch.className = 'emptyColorsGroup';
    swatch.innerHTML = 'No colors available.';
    wrap.appendChild(swatch)
  }
  else {
    arr.map((color) => { 
      let swatch = document.createElement('div');
      const contrast = Leo.contrast('#000000', color);
      swatch.className = (!panel) ? 'simulationSwatch' : 'panelSwatch';
      swatch.style.backgroundColor = color;
      swatch.style.color = (contrast < 4.5) ? '#ffffff' : '#000000';
      swatch.innerHTML = (!panel) ? `${color}` : ' ';
  
      if(dest === 'cvdSafeColors') {
        let button = document.createElement('button');
        button.className = (_qualitativeScale.keeperColors.indexOf(color) >= 0) ?  'saveColorToKeepers showSvg' : 'saveColorToKeepers',
        button.style.color = (contrast < 4.5) ? '#ffffff' : '#000000';
        button.innerHTML = (_qualitativeScale.keeperColors.indexOf(color) >= 0) 
        ? `<svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Locked">
          <use xlink:href="#spectrum-icon-18-LockClosed"></use>
        </svg>`  
        : `<svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
            <use xlink:href="#spectrum-icon-18-Add"></use>
          </svg>`
        button.addEventListener('click', (e) => {
          if(_qualitativeScale.keeperColors.indexOf(color) < 0) {
            _qualitativeScale.keeperColors.push(color);
            showColors(_qualitativeScale.keeperColors, 'qualitative_selectedColors');
            updateColorDots(chartsModeSelect.value, 'qualitative', _qualitativeScale.keeperColors);
            createDemos('qualitative', _qualitativeScale.keeperColors);
            document.getElementById('qualitative_selectedColors').classList.remove('isEmpty');
            createOutput();
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
          const index = _qualitativeScale.keeperColors.indexOf(color);
          if (index > -1) {
            _qualitativeScale.keeperColors.splice(index, 1);
          }
          showColors(_qualitativeScale.keeperColors, 'qualitative_selectedColors')
          updateColorDots(chartsModeSelect.value, 'qualitative', _qualitativeScale.keeperColors);
          createDemos('qualitative', _qualitativeScale.keeperColors);
          createOutput();
          if(_qualitativeScale.keeperColors.length < 1) {
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
}

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

// function shuffle(array) {
//   let currentIndex = array.length,  randomIndex;

//   // While there remain elements to shuffle...
//   while (currentIndex != 0) {

//     // Pick a remaining element...
//     randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex--;

//     // And swap it with the current element.
//     [array[currentIndex], array[randomIndex]] = [
//       array[randomIndex], array[currentIndex]];
//   }

//   return array;
// }

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

function eliminateLowContrastFromSet(set, background, ratio) {
  let lowContrastColors = [];
  const backgroundArray = chroma(background).rgb();
  for(let i = 0; i < set.length; i++) {
    let colorArray = chroma(set[i]).rgb();
    let contrast = Leo.contrast(colorArray, backgroundArray);
    if(contrast < ratio) lowContrastColors.push(set[i])
  }
  let newSet = arrayRemove(set, lowContrastColors);
  return newSet;
}

module.exports = {
  colorScaleQualitative
}