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

import d3 from './d3';
import {addKeyColorInput} from './keyColors';
import {getColorClassById} from './getThemeData';
import {updateRamps} from './ramps';
import {updateColorDots} from './colorWheel';

function addBulk(e) {
  let id = e.target.parentNode.parentNode.parentNode.id.replace('-themeColor_configs', '');

  let button = document.getElementById('bulkAddButton');
  button.addEventListener('click', bulkItemColorInput);

  let dialog = document.getElementsByClassName('addBulkColorDialog');
  for (let i = 0; i < dialog.length; i++) {
    let colorName = getColorClassById(id).name;
    document.getElementById('addBulkDialog_ScaleName').innerHTML = colorName;
    dialog[i].classList.add('is-open');
    dialog[i].id = id.concat('_dialog');
  }
  document.getElementById('dialogOverlay').style.display = 'block';
}

function cancelBulk() {
  let dialog = document.getElementsByClassName('addBulkColorDialog');
  for (let i = 0; i < dialog.length; i++) {
    dialog[i].classList.remove('is-open');
    dialog[i].id = ' ';
  }
  document.getElementById('dialogOverlay').style.display = 'none';
}

function bulkItemColorInput(e) {
  let id = e.target.parentNode.parentNode.parentNode.id;
  let itemId = id.replace('_dialog', '');
  const currentColor = getColorClassById(itemId);
  const currentColorName = currentColor.name;
  const currentKeys = currentColor.colorKeys;

  let bulkInputs = document.getElementById('bulkColors');
  let bulkValues = bulkInputs.value.replace(/\r\n/g, '\n').replace(/[,\/]/g, '\n').replace(' ', '').replace(/['\/]/g, '').replace(/["\/]/g, '').replace(' ', '').split('\n');
  for (let i = 0; i < bulkValues.length; i++) {
    if (!bulkValues[i].startsWith('#')) {
      bulkValues[i] = '#' + bulkValues[i];
    }
  }

  let newKeys = [...currentKeys];
  // add key colors for each input
  for (let i = 0; i < bulkValues.length; i++) {
    let colorVal = d3.color(bulkValues[i]).formatHex();
    addKeyColorInput(colorVal, itemId);
    newKeys.push(colorVal);
  }

  _theme.updateColor = {color: currentColorName, colorKeys: newKeys};

  // Update gradient
  updateRamps(currentColor, itemId);
  updateColorDots(null, 'theme');

  // Hide dialog
  cancelBulk();
  // Run colorinput
  themeUpdateParams();

  // clear inputs on close
  bulkInputs.value = ' ';
}

window.addBulk = addBulk;
window.cancelBulk = cancelBulk;
window.bulkItemColorInput = bulkItemColorInput;

module.exports = {
  addBulk,
  bulkItemColorInput,
  cancelBulk
};
