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

import * as Leo from '@adobe/leonardo-contrast-colors';
import {_theme} from './initialTheme';
// import {updateParams} from './params';
import {getContrastRatioInputs} from './getThemeData';
import {randomId} from './utils';
import {themeUpdateParams, toggleControls} from './themeUpdate';
import {baseScaleOptions} from './createBaseScaleOptions';
import {showColorDetails} from './colorDetailsPanel';
import {themeRamp} from './ramps';
import {predefinedColorNames, getRandomColorName} from './predefinedColorNames';

function addColorScaleUpdate(c, k, s, r) {
  addColorScale(c, k, s, r);
  themeUpdateParams();
}

function addColorScale(newColor, addToTheme = true) {
  // if first color item, just name it gray.
  let colorNameValue;
  let colorNameOptions = predefinedColorNames;

  if (!newColor) {
    if (_theme.colors.length == 0) colorNameValue = 'Gray';
    else {
      colorNameValue = getRandomColorName();
    }
    let ratios = getContrastRatioInputs();
    if (ratios === undefined) ratios = [4.5];

    newColor = new Leo.BackgroundColor({
      name: colorNameValue,
      colorKeys: ['#000000'],
      colorspace: 'RGB',
      ratios: ratios,
      output: 'RGB'
    });
  } else {
    colorNameValue = newColor.name;
  }

  if (addToTheme) {
    _theme.addColor = newColor;
  }

  // create unique ID for color object
  let thisId = randomId();

  let wrapper = document.getElementById('themeColorWrapper');
  let emptyState = document.getElementById('themeColorEmptyState');
  // Remove empty state
  if (emptyState.classList.contains('is-hidden')) {
    // Do nothing
  } else {
    emptyState.classList.add('is-hidden');
  }

  // Create theme item
  let item = document.createElement('button');
  item.className = 'themeColor_item';
  item.id = thisId;
  item.tabIndex = -1;

  // Create color gradient swatch
  let gradientSwatch = document.createElement('div');
  let gradientSwatchId = thisId.concat('_gradientSwatch');
  gradientSwatch.id = gradientSwatchId;
  gradientSwatch.className = 'gradientSwatch';

  // Color Name Input
  let colorName = document.createElement('div');
  colorName.className = 'spectrum-Form-item spectrum-Form-item--row';
  let colorNameInputWrapper = document.createElement('div');
  colorNameInputWrapper.className = 'spectrum-Textfield spectrum-Textfield--quiet colorNameInput';
  let colorNameInput = document.createElement('input');
  colorNameInput.type = 'text';
  colorNameInput.className = 'spectrum-Textfield-input';
  colorNameInput.id = thisId.concat('_colorName');
  colorNameInput.name = thisId.concat('_colorName');
  colorNameInput.value = newColor.name;

  colorNameInput.addEventListener('focus', (e) => {
    colorNameValue = e.target.value;
  });
  colorNameInput.addEventListener('change', (e) => {
    let newValue = e.target.value;
    _theme.updateColor = {color: colorNameValue, name: newValue};

    baseScaleOptions();
    colorNameValue = newValue;
  });
  colorNameInputWrapper.appendChild(colorNameInput);
  colorName.appendChild(colorNameInputWrapper);

  // Actions
  let actions = document.createElement('div');
  actions.className = 'spectrum-ButtonGroup spectrum-Form-item spectrum-Form-item--row labelSpacer';
  let edit = document.createElement('button');
  edit.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  edit.id = `${thisId}-toggleConfig`;
  edit.title = 'Show / hide configurations';
  edit.innerHTML = `
  <!-- <span class="spectrum-ActionButton-label">Add from URL</span> -->
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-Edit" />
  </svg>`;
  edit.addEventListener('click', showColorDetails);
  let deleteColor = document.createElement('button');
  deleteColor.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  deleteColor.title = 'Delete color scale';
  deleteColor.id = thisId.concat('_delete');
  deleteColor.innerHTML = `
  <!-- <span class="spectrum-ActionButton-label">Add Color</span> -->
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  actions.appendChild(edit);
  actions.appendChild(deleteColor);

  colorName.appendChild(actions);
  item.appendChild(gradientSwatch);
  item.appendChild(colorName);

  wrapper.appendChild(item);

  let rampData = newColor.backgroundColorScale;
  let colors = rampData;

  themeRamp(colors, gradientSwatchId, '45');
  toggleControls();
  if (addToTheme) {
    baseScaleOptions();
  }

  document.getElementById(thisId.concat('_colorName')).addEventListener('input', baseScaleOptions);

  deleteColor.addEventListener('click', function (e) {
    themeDeleteItem(e);
    _theme.removeColor = newColor;

    themeUpdateParams();
  });
}

// Deletes a Color class from Theme
function themeDeleteItem(e) {
  let id = e.target.parentNode.parentNode.parentNode.id;
  let self = document.getElementById(id);

  self.remove();
  baseScaleOptions();
  let items = document.getElementsByClassName('themeColor_item');
  if (items.length == 0) {
    clearParams();

    document.documentElement.style.setProperty('--theme-background', '#f5f5f5');
  }
}

window.addColorScale = addColorScale;
window.addColorScaleUpdate = addColorScaleUpdate;
window.themeDeleteItem = themeDeleteItem;

module.exports = {
  addColorScale,
  addColorScaleUpdate,
  themeDeleteItem
};
