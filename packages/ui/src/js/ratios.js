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

import {getContrastRatios} from './getThemeData'
import {themeInput} from './themeUpdate';
import {randomId} from './utils';

function addRatio(v, fs, fw) {
  let s = '#cacaca';
  let methodPicker = document.getElementById('contrastMethod');
  let method = methodPicker.value;
  let ratioInputs = getContrastRatios();
  // increment by default
  if(v === undefined) {
    // find highest value
    var hi = Math.max(...ratioInputs);
    var lo = Math.min(...ratioInputs);

    if(hi < 20) {
      v = Number(hi + 1).toFixed(2);
    }
    if(hi == 21) {
      v = Number(hi - 1).toFixed(2);
    }
  }

  var ratios = document.getElementById('ratioInput-wrapper');
  var div = document.createElement('div');
  // var sliderWrapper = document.getElementById('colorSlider-wrapper');
  // var slider = document.createElement('input');

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
  ratioInput.placeholder = (method === 'WCAG') ? 4.5 : 60;
  ratioInput.id = randId;
  ratioInput.value = v;
  ratioInput.onkeydown = checkRatioStepModifiers;
  // ratioInput.oninput = debounce(colorInput, 100);
  ratioInput.oninput = syncRatioInputs;

  // var fontSizeInput = document.createElement('input');
  // fontSizeInput.className = 'spectrum-Textfield ratioGrid--fontSize';
  // fontSizeInput.type = "number";
  // fontSizeInput.min = '12';
  // fontSizeInput.step = '1';
  // fontSizeInput.id = randId + "-fontSize";
  // fontSizeInput.value = fs;
  // fontSizeInput.oninput = syncRatioInputs;

  // var fontWeightInput = document.createElement('input');
  // fontWeightInput.className = 'spectrum-Textfield ratioGrid--fontWeight';
  // fontWeightInput.type = "number";
  // fontWeightInput.step = '100';
  // fontWeightInput.min = '100';
  // fontWeightInput.max = '900';
  // fontWeightInput.placeholder = '400';
  // fontWeightInput.id = randId + "-fontWeight";
  // fontWeightInput.value = fw;
  // fontWeightInput.oninput = syncRatioInputs;
  // // fontWeightInput.defaultValue = '400';

  var luminosityInput = document.createElement('input');
  let luminosityInputWrapper = document.createElement('div');
  luminosityInputWrapper.className = 'spectrum-Textfield ratioGrid--luminosity';

  luminosityInput.className = 'spectrum-Textfield-input';
  luminosityInput.type = "number";
  luminosityInput.min = '0';
  luminosityInput.max = '100';
  luminosityInput.step = '1';
  luminosityInput.id = randId + "_luminosity";
  luminosityInput.oninput = syncRatioInputs;

  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet ratioGrid--actions';
  button.title = 'Delete contrast ratio';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  // slider.type = 'range';
  // slider.min = '0';
  // slider.max = '100';
  // slider.value = v;
  // slider.step = '.01';
  // slider.className = 'colorSlider'
  // slider.id = randId + "-sl";
  // slider.disabled = true;
  // sliderWrapper.appendChild(slider);

  button.onclick = deleteRatio;
  inputWrapper.appendChild(sw);
  ratioInputWrapper.appendChild(ratioInput);
  inputWrapper.appendChild(ratioInputWrapper);
  // div.appendChild(fontSizeInput);
  // div.appendChild(fontWeightInput);
  luminosityInputWrapper.appendChild(luminosityInput);
  div.appendChild(luminosityInputWrapper);
  div.appendChild(inputWrapper)
  div.appendChild(button);
  ratios.appendChild(div);

  // charts2d.createContrastRatioChart(data, 'contrastChart', 'line');
  // themeInput();
}

function addRatios(ratios) {
  ratios.forEach(ratio => {
    return addRatio(ratio)
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
  // colorInput();
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
  // Then, run the colorinput funtion to update all values.
  // colorInput();
  themeInput();
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

// Delete ratio input
function deleteRatio(e) {
  var id = e.target.parentNode.id;
  var self = document.getElementById(id);
  var sliderid = id.replace('-item', '') + '-sl';
  var slider = document.getElementById(sliderid);

  self.remove();
  slider.remove();
  // colorInput();
}

window.addRatio = addRatio;
window.sortRatios = sortRatios;

module.exports = {
  addRatio,
  addRatios,
  sort,
  sortRatios,
  syncRatioInputs,
  checkRatioStepModifiers,
  deleteRatio
}