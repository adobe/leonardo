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

import {themeUpdateParams} from './themeUpdate';

function sliderValue(e) {
  let id = e.target.id;
  let slider = document.getElementById(id);
  let labelId = id.replace('Slider', 'Value');
  let label = document.getElementById(labelId);
  label.innerHTML = slider.value;
}

function sliderInput() {
  let items = document.getElementsByClassName('themeColor_item');
  // If theme items are present, run themeInput
  if (items !== undefined) {
    themeUpdateParams();
  }
}

const sliderB = document.getElementById('themeBrightnessSlider');
const sliderC = document.getElementById('themeContrastSlider');
sliderB.addEventListener('input', sliderValue);
sliderC.addEventListener('input', sliderValue);

window.sliderValue = sliderValue;
window.sliderInput = sliderInput;

module.exports = {
  sliderValue,
  sliderInput
}