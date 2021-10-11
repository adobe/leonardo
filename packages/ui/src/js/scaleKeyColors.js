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

import {
  randomId,
  removeElementsByClass
} from './utils';
import {updateRamps} from './ramps';
const chroma = require('chroma-js');
const { extendChroma } = require('./chroma-plus');


function addScaleKeyColorInput(c, thisId = this.id, scaleType, index) {
  let currentColor;
  if(scaleType === 'sequential') currentColor = _sequentialScale;
  let parent = thisId.replace('_addKeyColor', '');
  let destId = parent.concat('_keyColors');
  let dest = document.getElementById(destId);
  let div = document.createElement('div');

  let randId = randomId();
  div.className = `keyColor keyColor-${scaleType}`;
  div.id = randId + '-item';
  let sw = document.createElement('input');
  sw.type = "color";
  sw.value = c;

  sw.oninput = (e) => {
    // Replace current indexed value from color keys with new value from color input field
    let currentKeys = currentColor.colorKeys;
    c = e.target.value;
    currentKeys.splice(index, 1, c)
    if(scaleType === 'sequential') _sequentialScale.colorKeys = currentKeys

    updateRamps(currentColor, parent, scaleType)
  };

  sw.className = 'keyColor-Item';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = c;

  let button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  button.addEventListener('click',  function(e) {
    // Trying something new...
    replaceScaleKeyInputsFromClass(thisId, scaleType, index);
  });

  div.appendChild(sw);
  div.appendChild(button);
  dest.appendChild(div);
}

function replaceScaleKeyInputsFromClass(id, scaleType, index) {
  let parentId = id.replace('_addKeyColor', '');
  // let inputs = document.getElementsByClassName(`keyColor-${scaleType}`);
  removeElementsByClass(`keyColor-${scaleType}`)

  let currentColor;
  if(scaleType === 'sequential') currentColor = _sequentialScale;

  let colorKeys = currentColor.colorKeys;
  colorKeys.splice(index, 1);
  // reassign new array to color class
  currentColor.colorKeys = colorKeys;

  colorKeys.forEach((key, i) => {
    addScaleKeyColorInput(key, id, scaleType, i)
  })
  // Update gradient
  updateRamps(currentColor, parentId, scaleType);
  // updateColorDots();
}

function addScaleKeyColor(scaleType, e) {
  let thisId = e.target.id;
  let parentId = thisId.replace('_addKeyColor', '');

  let currentColor = (scaleType === 'sequential') ? _sequentialScale : null ; // TODO: replace with _diverging when available
  let currentKeys = currentColor.colorKeys;

  let lastIndex = currentKeys.length;
  if(!lastIndex) lastIndex = 0;
  let lastColor = (lastIndex > 0) ? chroma(currentKeys[lastIndex - 1]).hsluv() : chroma(currentKeys[0]).hsluv();
  let lastColorLightness = lastColor[2];
  let fCtintHalf = (100 - lastColorLightness) / 2;
  let fCshadeHalf = lastColorLightness / 2;

  let c = ( lastColorLightness >= 50) ? chroma.hsluv(lastColor[0], lastColor[1], fCshadeHalf) : chroma.hsluv(lastColor[0], lastColor[1], fCtintHalf);
  c = c.hex();
  // console.log(d3.rgb(lastColor).formatHex())
  currentKeys.push(c)

  // Update color class arguments via the theme class
  currentColor.colorKeys = currentKeys;
  removeElementsByClass(`keyColor-${scaleType}`)

  currentColor.colorKeys.forEach((key, i) => {
    addScaleKeyColorInput(key, thisId, scaleType, i)
  })

  // Update gradient
  updateRamps(currentColor, parentId, scaleType);
  // updateColorDots();
}

// function clearAllColors(e) {
//   let targetId = e.target.id;
//   let parentId = targetId.replace('_clearAllColors', '');
//   let keyColorsId = targetId.replace('_clearAllColors', '_keyColors');
//   document.getElementById(keyColorsId).innerHTML = ' ';
  
//   let color = getColorClassById(parentId);
//   _theme.updateColor = {color: color.name, colorKeys: ['#cacaca']}

//   updateRamps();
//   // themeUpdate();
// }

// window.clearAllColors = clearAllColors;

module.exports = {
  addScaleKeyColor,
  addScaleKeyColorInput,
  // clearAllColors
}