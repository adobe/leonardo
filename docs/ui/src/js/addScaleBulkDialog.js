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
import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import {addScaleKeyColorInput} from './scaleKeyColors';
import {updateRamps} from './ramps';
import {create3dModel} from './create3dModel';
import {createSamples} from './createSamples';
import {createDemos} from './createDemos';
import {createPanelReportTable} from './createPanelReportTable';

function addScaleBulk(e) {
  // id is scaleType
  let id = e.target.id.replace('_addBulk', '');

  // console.log(id)
  let colorNameInputId = id.concat('_name');
  let colorNameInput = document.getElementById(colorNameInputId);
  let colorName = colorNameInput.value;

  let button = document.getElementById('bulkAddButton');
  button.addEventListener('click', bulkScaleItemColorInput);

  let dialog = document.getElementsByClassName('addBulkColorDialog');
  for (let i = 0; i < dialog.length; i++) {
    document.getElementById('addBulkDialog_ScaleName').innerHTML = colorName;
    dialog[i].classList.add('is-open');
    dialog[i].id = id.concat('_dialog');
  }
  document.getElementById('dialogOverlay').style.display = 'block';
}

function cancelScaleBulk() {
  let dialog = document.getElementsByClassName('addBulkColorDialog');
  for (let i = 0; i < dialog.length; i++) {
    dialog[i].classList.remove('is-open');
    dialog[i].id = ' ';
  }
  document.getElementById('dialogOverlay').style.display = 'none';
}

function bulkScaleItemColorInput(e) {
  let id = e.target.parentNode.parentNode.parentNode.id;
  let itemId = id.replace('_dialog', '');
  // console.log(itemId)
  const currentColor = itemId === 'sequential' ? _sequentialScale : itemId === 'divergingScale' ? _divergingScale : _qualitativeScale;

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

    addScaleKeyColorInput(colorVal, itemId, itemId, i);

    newKeys.push(colorVal);
  }

  currentColor.colorKeys = newKeys;
  // addScaleKeyColorInput(c, thisId, currentColorName, lastIndex);

  // Update gradient
  let scaleType = itemId;
  const colorClass = currentColor;
  let chartsModeId = scaleType === 'sequential' ? 'sequential_chartsMode' : 'diverging_chartsMode';
  const chartsModeSelect = document.getElementById(chartsModeId);
  let PlotDestId = `${scaleType}ModelWrapper`;
  let sampleInputId = `${scaleType}Samples`;
  const sampleNumber = document.getElementById(sampleInputId).value;
  let bgInput = document.getElementById(`scales_bgColor`);
  let bg = bgInput.value;
  let levelSelect = document.getElementById('scales_complianceLevel');
  let level = levelSelect.value;
  let colors = colorClass.samples; // samples are the ouptut, colors are the full scale
  const color2 = colors[0];
  const color1 = colors[colors.length - 1];

  updateRamps(colorClass, scaleType, scaleType);
  createSamples(sampleNumber.value, scaleType);
  createDemos(scaleType);
  create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType);
  createPanelReportTable([color1, color2], bg, scaleType, level);

  // Hide dialog
  cancelScaleBulk();

  // clear inputs on close
  bulkInputs.value = ' ';
}

window.addScaleBulk = addScaleBulk;
window.cancelScaleBulk = cancelScaleBulk;
window.bulkScaleItemColorInput = bulkScaleItemColorInput;

module.exports = {
  addScaleBulk,
  bulkScaleItemColorInput,
  cancelScaleBulk
};
