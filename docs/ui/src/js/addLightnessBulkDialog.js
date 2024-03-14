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
import * as Leo from '@adobe/leonardo-contrast-colors';

import {addRatioInputs, sortRatios} from './ratios';
import {round} from './utils';

function addLightnessBulk(e) {
  let dialog = document.getElementById('addBulkLightnessDialog');
  dialog.classList.add('is-open');

  document.getElementById('dialogOverlay').style.display = 'block';
}

function cancelLightnessBulk() {
  let dialog = document.getElementById('addBulkLightnessDialog');
  dialog.classList.remove('is-open');

  document.getElementById('dialogOverlay').style.display = 'none';
}

function bulkLightnessInput(e) {
  let bulkInputs = document.getElementById('bulkLightnessColors');
  let bulkValues = bulkInputs.value.replace(/\r\n/g, '\n').replace(/[,\/]/g, '\n').replace(' ', '').replace(/['\/]/g, '').replace(/["\/]/g, '').replace(' ', '').split('\n');
  for (let i = 0; i < bulkValues.length; i++) {
    if (!bulkValues[i].startsWith('#')) {
      bulkValues[i] = '#' + bulkValues[i];
    }
  }

  let themeBackgroundColorArray = [d3.rgb(_theme.backgroundColorValue).r, d3.rgb(_theme.backgroundColorValue).g, d3.rgb(_theme.backgroundColorValue).b];

  let contrasts = bulkValues.map((value) => {
    let colorArray = [d3.rgb(value).r, d3.rgb(value).g, d3.rgb(value).b];
    return round(Leo.contrast(colorArray, themeBackgroundColorArray), 2);
  });

  addRatioInputs(contrasts, bulkValues);
  sortRatios();

  // Hide dialog
  cancelLightnessBulk();
  // Run colorinput
  themeUpdateParams();

  // clear inputs on close
  bulkInputs.value = ' ';
}

window.addLightnessBulk = addLightnessBulk;
window.cancelLightnessBulk = cancelLightnessBulk;
window.bulkLightnessInput = bulkLightnessInput;

module.exports = {
  addLightnessBulk,
  bulkLightnessInput,
  cancelLightnessBulk
};
