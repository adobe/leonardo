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

import {getAllColorNames, getColorClassByName} from './getThemeData.js';
import {createOutputColors} from './createOutputColors';
import {createOutputParameters} from './createOutputParameters';
import {_theme} from './initialTheme';

// Create options for colors to use as base scale
function baseScaleOptions() {
  let baseSelect = document.getElementById('themeBase');
  let colorNames = getAllColorNames();

  // Remove all existing options and start from scratch
  var i,
    L = baseSelect.options.length - 1;
  for (i = L; i >= 0; i--) {
    baseSelect.remove(i);
  }

  let opts = {};
  for (let i = 0; i < colorNames.length; i++) {
    let colorname = colorNames[i];
    opts[colorname] = colorname;
  }

  for (let index in opts) {
    baseSelect.options[baseSelect.options.length] = new Option(opts[index], index);
  }
}

let baseSelect = document.getElementById('themeBase');
baseSelect.addEventListener('change', function (e) {
  let colorName = `${e.target.value}`;
  let colorClass = getColorClassByName(colorName);
  _theme.backgroundColor = colorClass;

  createOutputColors();
  createOutputParameters();
});

module.exports = {
  baseScaleOptions
};
