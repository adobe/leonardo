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
import {randomId} from './utils';
import {updateRamps} from './ramps';
import {updateColorDots} from './colorWheel';
import {themeUpdateParams} from './themeUpdate';
import {throttle} from './utils';
import {getColorClassById} from './getThemeData';
import {create3dModel} from './create3dModel';
import {_theme} from './initialTheme';
import {createDetailOutputColors} from './createOutputColors';

function addKeyColorInput(c, thisId = this.id, currentColorName, index) {
  let parent = thisId.replace('_addKeyColor', '');
  let destId = parent.concat('_keyColors');
  let dest = document.getElementById(destId);
  let div = document.createElement('div');

  let randId = randomId();
  div.className = 'keyColor';
  div.id = randId + '-item';
  let sw = document.createElement('input');
  sw.type = 'color';
  sw.value = c;

  const currentColorIndex = _theme.colors.map((e) => e.name).indexOf(currentColorName);
  const chartsModeSelect = document.getElementById('chartsMode');
  const currentColor = _theme.colors[currentColorIndex];

  sw.oninput = (e) => {
    // Replace current indexed value from color keys with new value from color input field
    let currentKeys = currentColor.colorKeys;
    let currentColorName = _theme.colors[currentColorIndex].name;
    currentKeys.splice(index, 1, e.target.value);

    _theme.updateColor = {color: currentColorName, colorKeys: currentKeys};

    throttle(updateRamps(currentColor, parent), 10);
    throttle(createDetailOutputColors(currentColorName), 10);

    setTimeout(function () {
      updateColorDots(chartsModeSelect.value, 'colorScale', currentKeys, parent);
    }, 500);
  };

  const updateModel = () => {
    create3dModel('tabModelContent', [currentColor], chartsModeSelect.value);
  };

  sw.addEventListener('input', throttle(updateModel, 50));

  sw.className = 'keyColor-Item';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = c;

  let button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  button.addEventListener('click', function (e) {
    // Remove current indexed value from color keys
    let currentColor = _theme.colors[currentColorIndex];
    let currentKeys = currentColor.colorKeys;
    currentKeys.splice(index, 1);
    _theme.updateColor = {color: currentColorName, colorKeys: currentKeys};

    updateRamps(currentColor, parent);

    let contentArea = document.getElementById('colorDetails');

    let configPanel = document.getElementById('colorConfigPanel');

    contentArea.innerHTML = ' ';
    contentArea.style.display = 'none';
    configPanel.innerHTML = ' ';
    configPanel.style.display = 'none';

    let triggerId = parent.concat('-toggleConfig');
    let trigger = document.getElementById(triggerId);
    trigger.click();

    createDetailOutputColors(currentColor.name);
  });

  div.appendChild(sw);
  div.appendChild(button);
  dest.appendChild(div);
}

function addKeyColor(e) {
  let thisId = e.target.id;
  let parentId = thisId.replace('_addKeyColor', '');

  let currentColorNameInput = parentId.concat('_colorName2');
  let currentColorName = document.getElementById(currentColorNameInput).value;

  let currentColor = _theme.colors.filter((entry) => {
    return entry.name === currentColorName;
  });
  currentColor = currentColor[0];
  let currentKeys = [...currentColor.colorKeys];

  let lastIndex = currentColor.colorKeys.length;
  if (!lastIndex) lastIndex = 0;
  let lastColor = lastIndex > 0 ? d3.hsluv(currentColor.colorKeys[lastIndex - 1]) : d3.hsluv(currentColor.colorKeys[0]);
  let lastColorLightness = lastColor.v;
  let fCtintHalf = (100 - lastColorLightness) / 3 + lastColorLightness;
  let fCshadeHalf = lastColorLightness / 2;
  let c = lastColorLightness >= 50 ? d3.hsluv(lastColor.l, lastColor.u, fCshadeHalf) : d3.hsluv(lastColor.l, lastColor.u, fCtintHalf);
  c = d3.rgb(c).formatHex();
  currentKeys.push(c);

  // Update color class arguments via the theme class
  _theme.updateColor = {color: currentColorName, colorKeys: currentKeys};
  addKeyColorInput(c, thisId, currentColorName, lastIndex);

  // Update gradient
  updateRamps(currentColor, parentId);
  updateColorDots(null, 'theme');
  createDetailOutputColors(currentColorName);
}

function deleteColor(e) {
  var id = e.target.parentNode.id;
  var self = document.getElementById(id);

  self.remove();

  themeUpdateParams();
}

function clearAllColors(e) {
  let targetId = e.target.id;
  let parentId = targetId.replace('_clearAllColors', '');
  let keyColorsId = targetId.replace('_clearAllColors', '_keyColors');
  document.getElementById(keyColorsId).innerHTML = ' ';

  const currentColor = getColorClassById(parentId);
  addKeyColorInput('#000000', parentId, currentColor.name, 0);
  _theme.updateColor = {color: currentColor.name, colorKeys: ['#000000']};

  updateRamps(currentColor, parentId);
  updateColorDots(null, 'theme');
  themeUpdateParams();
}

window.clearAllColors = clearAllColors;

module.exports = {
  addKeyColor,
  deleteColor,
  addKeyColorInput,
  clearAllColors
};
