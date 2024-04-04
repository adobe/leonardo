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

import {addColorScaleUpdate} from './colorScale';
import {sanitizeQueryString} from './utils';

function addFromURLDialog() {
  let button = document.getElementById('addFromURLButton');
  button.addEventListener('click', addFromURL);

  let dialog = document.getElementById('addFromURLDialog');
  dialog.classList.add('is-open');

  document.getElementById('dialogOverlay').style.display = 'block';
}

function cancelURL() {
  let dialog = document.getElementById('addFromURLDialog');
  dialog.classList.remove('is-open');

  document.getElementById('dialogOverlay').style.display = 'none';
}

function addFromURL() {
  let input = document.getElementById('addFromURLinput');
  let value = input.value;

  let url = new URL(value);
  let params = new URLSearchParams(sanitizeQueryString(url.search.slice(1)));
  let pathName = url.pathname;

  let crs, ratios, mode;
  let cName = predefinedColorNames[Math.floor(Math.random() * predefinedColorNames.length)];

  // // If parameters exist, use parameter; else use default html input values
  if (params.has('colorKeys')) {
    let cr = params.get('colorKeys');
    crs = cr.split(',');
  }

  if (params.has('ratios')) {
    // transform parameter values into array of numbers
    let rat = params.get('ratios');
    ratios = rat.split(',');
    ratios = ratios.map(Number);

    if (ratios[0] == 0) {
      // if no parameter value, default to [3, 4.5]
      ratios = [3, 4.5];
    } else {
    }
  }
  if (params.has('mode')) {
    mode = params.get('mode');
  } else {
    // do nothing
  }
  addColorScaleUpdate(cName, crs, mode, ratios);

  cancelURL();
  // Run colorinput
  // throttle(themeUpdate, 10);
  // Clear out value when done
  input.value = ' ';
}

window.addFromURLDialog = addFromURLDialog;
window.cancelURL = cancelURL;
window.addFromURL = addFromURL;

module.exports = {
  addFromURL,
  addFromURLDialog,
  cancelURL
};
