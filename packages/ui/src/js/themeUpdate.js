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

import * as Leo from '@adobe/leonardo-contrast-colors'
import hljs from 'highlight.js/lib/core';
import * as d3 from './d3';
import {_theme} from './initialTheme';
import {
  getThemeName,
  getColorClassById,
  getContrastRatios,
  getAllColorKeys
} from './getThemeData';
import {createOutputColors} from './createOutputColors';
import {cvdColors} from './cvdColors'
import {createRatioChart} from './createRatioChart';
import {
  getConvertedColorCoodrindates,
  createColorWheelDots
} from './colorDisc';
import {createOutputParameters} from './createOutputParameters';
import {throttle} from './utils';

import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

function themeUpdate() {
  createOutputColors();

  let chartRatios = getContrastRatios();
  createRatioChart(chartRatios);

  // Create dots for color wheel
  // let allKeyColorsMerged = [].concat.apply([], allKeyColors);
  let colorWheelModeDropdown = document.getElementById('colorWheelMode');
  let colorWheelMode = colorWheelModeDropdown.value

  let allKeys = getAllColorKeys();
  let arr = getConvertedColorCoodrindates(allKeys, colorWheelMode);
  createColorWheelDots(arr);
}

function themeUpdateParams() {
  themeUpdate();
  createOutputParameters();
}

// Toggle disabled state of adaptive theme controls
function toggleControls() {
  let items = document.getElementsByClassName('themeColor_item');
  let brightnessSliderWrap = document.getElementById('brightnessSliderWrapper');
  let brightnessSlider = document.getElementById('themeBrightnessSlider');
  let contrastSliderWrap = document.getElementById('contrastSliderWrapper');
  let contrastSlider = document.getElementById('themeContrastSlider');
  let saturationSliderWrap = document.getElementById('saturationSliderWrapper');
  let saturationSlider = document.getElementById('themeSaturationSlider');
  let themeBaseLabel = document.getElementById('themeBaseLabel');
  let baseSelect = document.getElementById('themeBase');

  if(items.length > 0) {
    // if there are items, enable fields
    brightnessSliderWrap.classList.remove('is-disabled');
    contrastSliderWrap.classList.remove('is-disabled');
    saturationSliderWrap.classList.remove('is-disabled');
    themeBaseLabel.classList.remove('is-disabled');
    baseSelect.classList.remove('is-disabled');
    brightnessSlider.disabled = false;
    contrastSlider.disabled = false;
    saturationSlider.disabled = false;
    baseSelect.disabled = false;
  }
  else if(items.length == 0) {
    // disable fields
    brightnessSliderWrap.classList.add('is-disabled');
    contrastSliderWrap.classList.add('is-disabled');
    saturationSliderWrap.classList.add('is-disabled');
    themeBaseLabel.classList.add('is-disabled');
    baseSelect.classList.add('is-disabled');
    brightnessSlider.disabled = true;
    contrastSlider.disabled = true;
    saturationSlider.disabled = true;
    baseSelect.disabled = true;
    baseSelect.value = ' ';
  }
}

// Update theme when theme name is changed
document.getElementById('themeNameInput').addEventListener('input', throttle(themeUpdateParams, 50));
// Update theme when base color selection is changed
document.getElementById('themeBase').addEventListener('input', throttle(themeUpdateParams, 50));

window.themeUpdate = themeUpdate;
window.themeUpdateParams = themeUpdateParams;

module.exports = {
  themeUpdate,
  themeUpdateParams,
  toggleControls
}