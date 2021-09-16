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

// Create options for colors to use as base scale
function baseScaleOptions() {
  let baseSelect = document.getElementById('themeBase');
  baseSelect.options.length = 0;

  let colorNames = document.getElementsByClassName('colorNameInput');
  let opts = {};
  for (let i = 0; i < colorNames.length; i++) {
    let colorname = colorNames[i].value;
    opts[colorname] = colorname;
  }

  for(let index in opts) { baseSelect.options[baseSelect.options.length] = new Option(opts[index], index); }
}

module.exports = {
  baseScaleOptions
}