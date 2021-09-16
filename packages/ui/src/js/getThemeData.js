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

import {_theme} from './initialTheme';

function getColorItemClass(id) {
  let thisElement = document.getElementById(id);
  // 1. find color name from id
  let colorNameInput = id.concat('_colorName');
  let colorName = document.getElementById(colorNameInput).value;

  // 2. Scrape information from the color class of the same name
  let currentColor = _theme.colors.filter(color => {return color.name === colorName})
  currentColor = currentColor[0];

  return currentColor;
}

// GET all contrast ratios
function getContrastRatios() {
  let ratioInputs = document.getElementsByClassName('ratio-Field');
  let ratios = [];
  for(let i = 0; i < ratioInputs.length; i++) {
    ratios.push(ratioInputs[i].value);
  }
  return ratios;
}

function getThemeName() {
  // Get name
  let themeNameInput = document.getElementById('themeNameInput');
  let themeName = themeNameInput.value;
  return themeName;
}

// GET Theme Data
function getThemeData() {
  let baseSelectValue = _theme.backgroundColor.name;
  let colorScales = _theme.colors;
  let brightness = _theme.lightness;
  let contrast = _theme.contrast;

  return {
    baseScale: baseSelectValue,
    colorScales: colorScales,
    brightness: brightness,
    contrast: contrast
  }
}

function getAllColorKeys() {
  let scales = _theme.colors;
  if(scales) {
    let colorKeys = [];
    scales.map(scale => {
      let keys = scale.colorKeys;
      keys.forEach(key => {
        colorKeys.push(key)
      })
    });
  
    return colorKeys;
  }
  else throw new Error('No color scales defined')
}

module.exports = {
  getColorItemClass,
  getContrastRatios,
  getThemeName,
  getThemeData,
  getAllColorKeys
}