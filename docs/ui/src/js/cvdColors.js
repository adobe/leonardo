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

import * as blinder from 'color-blind';

import d3 from './d3';
import {showToast, hideToast} from './toast';

function cvdColors(colors) {
  const original = colors;
  let cvdModeDropdown = document.getElementById('cvdMode');
  let cvdMode = cvdModeDropdown.value;

  // if not an array
  if (!Array.isArray(colors)) {
    if (cvdMode == 'Deuteranomaly') {
      colors = blinder.deuteranomaly(colors);
      showToast();
    } else if (cvdMode == 'Deuteranopia') {
      colors = blinder.deuteranopia(colors);
      showToast();
    } else if (cvdMode == 'Protanomaly') {
      colors = blinder.protanomaly(colors);
      showToast();
    } else if (cvdMode == 'Protanopia') {
      colors = blinder.protanopia(colors);
      showToast();
    } else if (cvdMode == 'Tritanomaly') {
      colors = blinder.tritanomaly(colors);
      showToast();
    } else if (cvdMode == 'Tritanopia') {
      colors = blinder.tritanopia(colors);
      showToast();
    } else if (cvdMode == 'Achromatomaly') {
      colors = blinder.achromatomaly(colors);
      showToast();
    } else if (cvdMode == 'Achromatopsia') {
      colors = blinder.achromatopsia(colors);
      showToast();
    } else {
      hideToast();
    }
    colors = d3.rgb(colors).formatRgb();
  }
  // must be an array.
  else {
    if (cvdMode == 'Deuteranomaly') {
      colors = colors.map((c) => blinder.deuteranomaly(c));
    } else if (cvdMode == 'Deuteranopia') {
      colors = colors.map((c) => blinder.deuteranopia(c));
    } else if (cvdMode == 'Protanomaly') {
      colors = colors.map((c) => blinder.protanomaly(c));
    } else if (cvdMode == 'Protanopia') {
      colors = colors.map((c) => blinder.protanopia(c));
    } else if (cvdMode == 'Tritanomaly') {
      colors = colors.map((c) => blinder.tritanomaly(c));
    } else if (cvdMode == 'Tritanopia') {
      colors = colors.map((c) => blinder.tritanopia(c));
    } else if (cvdMode == 'Achromatomaly') {
      colors = colors.map((c) => blinder.achromatomaly(c));
    } else if (cvdMode == 'Achromatopsia') {
      colors = colors.map((c) => blinder.achromatopsia(c));
    } else {
      // do nothing
    }
    colors = colors.map((c) => d3.rgb(c).formatRgb());
  }

  return colors;
}

module.exports = {cvdColors};
