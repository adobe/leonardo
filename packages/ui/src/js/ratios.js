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

import {getContrastRatios} from './getThemeData';
import {_theme} from './initialTheme';
import {createOutputColors} from './createOutputColors';
import {createOutputParameters} from './createOutputParameters';
import {createRatioChart} from './createRatioChart';
import {randomId} from './utils';

function addRatio() {
  // Gather all existing ratios from _theme
  let themeRatios = getContrastRatios();
  // find highest value
  var hi = Math.max(...themeRatios);
  // Assign an incremented value for the new ratio
  let value;
  if(hi < 20) value = Number(hi + 1).toFixed(2);
  if(hi == 21) value = Number(hi - 1).toFixed(2);
  // Add new value to array of existing ratios
  themeRatios.push(value);
  themeRatios = themeRatios.map((r) => {return Number(r)});
  // Pass new array to function that updates all ratio values in the _theme
  ratioUpdateValues(themeRatios);

  // createHtmlElement
  createRatioInput(value);
  // Update the rest of the components dependent upon the ratios
  ratioUpdate(themeRatios);
}


function createRatioInput(v) {
  let s = '#cacaca';
  let methodPicker = document.getElementById('contrastMethod');
  let method = methodPicker.value;

  var ratios = document.getElementById('ratioInput-wrapper');
  var div = document.createElement('div');

  var randId = randomId();
  div.className = 'ratio-Item ratioGrid';
  div.id = randId + '-item';
  var inputWrapper = document.createElement('span');

  var sw = document.createElement('span');
  sw.className = 'ratio-Swatch';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = s;
  var ratioInput = document.createElement('input');
  let ratioInputWrapper = document.createElement('div');
  ratioInputWrapper.className = 'spectrum-Textfield ratioGrid--ratio';
  ratioInput.className = 'spectrum-Textfield-input ratio-Field';
  ratioInput.type = "number";
  ratioInput.min = (method === 'APCA') ? APCAminValue : '-10';
  ratioInput.max = (method === 'APCA') ? APCAmaxValue : '21';
  ratioInput.step = '.01';
  let ratioInputDefaultValue = (method === 'WCAG') ? 4.5 : 60;
  ratioInput.placeholder = ratioInputDefaultValue
  ratioInput.id = randId;
  ratioInput.value = v;
  ratioInput.onkeydown = checkRatioStepModifiers;

  ratioInput.oninput = syncRatioInputs;

  var luminosityInput = document.createElement('input');
  let luminosityInputWrapper = document.createElement('div');
  luminosityInputWrapper.className = 'spectrum-Textfield ratioGrid--luminosity';

  luminosityInput.className = 'spectrum-Textfield-input luminosity-Field';
  luminosityInput.type = "number";
  luminosityInput.min = '0';
  luminosityInput.max = '100';
  luminosityInput.step = '1';
  luminosityInput.id = randId + "_luminosity";
  luminosityInput.oninput = syncRatioInputs;

  // Customize swatch names input
  var swatchNameInput = document.createElement('input');
  let swatchNameInputWrapper = document.createElement('div');
  swatchNameInputWrapper.className = 'spectrum-Textfield ratioGrid--swatchName';

  swatchNameInput.className = 'spectrum-Textfield-input swatchName-Field';
  swatchNameInput.type = "text";
  swatchNameInput.id = randId + "_swatchName";
  // swatchNameInput.oninput = syncRatioInputs;

  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet ratioGrid--actions';
  button.title = 'Delete contrast ratio';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  button.onclick = deleteRatio;
  inputWrapper.appendChild(sw);
  ratioInputWrapper.appendChild(ratioInput);
  inputWrapper.appendChild(ratioInputWrapper);

  luminosityInputWrapper.appendChild(luminosityInput);
  div.appendChild(luminosityInputWrapper);
  swatchNameInputWrapper.appendChild(swatchNameInput);
  div.appendChild(swatchNameInputWrapper);
  div.appendChild(inputWrapper)
  div.appendChild(button);
  ratios.appendChild(div);
}

function addRatioInputs(ratios) {
  ratios.forEach(ratio => {
    return createRatioInput(ratio)
  })
}

// Sort swatches in UI
function sort() {
  ratioInputs.sort(function(a, b){return a-b});

  // Update ratio inputs with new values
  for (let i=0; i<ratioInputs.length; i++) {
    ratioFields[i].value = ratioInputs[i];
  }
}

function sortRatios() {
  sort();
  ratioUpdate();
}

function syncRatioInputs(e) {
  let thisId = e.target.id;
  let val = e.target.value;
  let targetContrast;
  let luminosity;
  
  if (thisId.includes('_luminosity')) {
    let baseId = thisId.replace('_luminosity', '');
    let ratioInput = document.getElementById(baseId);
    luminosity = val;
    
    ratioInput.val = '3'
  }

  // if input is a Ratio, increase the font size value based on
  // lookup table and current font weight. If no weight, default to 400
  else {
    let luminosityInputId = `${thisId}_luminosity`;
    let luminosityInput = document.getElementById(luminosityInputId);
    luminosityInput.val = 100;
    targetContrast = val;
  }

  let themeRatios = getContrastRatios();
  const index = themeRatios.indexOf(targetContrast);
  if (index > -1) {
    themeRatios[index] = targetContrast;
  }

  ratioUpdateValues();
  ratioUpdate();
  ratioUpdate();
}

function checkRatioStepModifiers(e) {
  if (!e.shiftKey) return;
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  const value = Number(e.target.value);
  let newValue;
  switch (e.key) {
    case 'ArrowDown':
      newValue = value - 1;
      e.target.value = newValue.toFixed(2);
      e.target.oninput(e);
      break;
    case 'ArrowUp':
      newValue = value + 1;
      e.target.value = newValue.toFixed(2);
      e.target.oninput(e);
      break;
    default:
  }
}

// Delete ratio
function deleteRatio(e) {
  let id = e.target.parentNode.id;
  let inputId = id.replace('-item', '');
  let input = document.getElementById(inputId);
  let value = input.value;
  let self = document.getElementById(id);
  // var sliderid = id.replace('-item', '') + '-sl';
  // var slider = document.getElementById(sliderid);

  self.remove();
  // slider.remove();
  let themeRatios = getContrastRatios();
  const index = themeRatios.indexOf(value);
  if (index > -1) {
    themeRatios.splice(index, 1);
  }

  ratioUpdateValues();
  ratioUpdate();
}

function ratioUpdate(chartRatios = getContrastRatios()) {
  createOutputColors();
  createRatioChart(chartRatios);
  createOutputParameters();
}

function ratioUpdateValues(themeRatios = getContrastRatios()) {
  themeRatios = themeRatios.map((r) => {return Number(r)});

  _theme.colors.forEach((c) => {
    _theme.updateColor = {color: c.name, ratios: themeRatios}
  })
}

window.addRatio = addRatio;
window.sortRatios = sortRatios;

module.exports = {
  addRatio,
  createRatioInput,
  addRatioInputs,
  sort,
  sortRatios,
  syncRatioInputs,
  checkRatioStepModifiers,
  deleteRatio
}