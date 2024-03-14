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

import {createOutputColors, createDetailOutputColors} from './createOutputColors';
import {createOutputParameters} from './createOutputParameters';
import {getThemeContrastRatios, getLuminosities} from './getThemeData';
import {createRatioChart, createLuminosityChart} from './createRatioChart';
import {_theme} from './initialTheme';
import {dispatchRatioInputEvents} from './ratios';
import {round, throttle} from './utils';

function sliderValue(e) {
  let id = e.target.id;
  let slider = document.getElementById(id);
  let labelId = id.replace('Slider', 'Value');
  let label = document.getElementById(labelId);
  let labelValue = labelId.includes('Contrast') ? `${round(slider.value * 100)}%` : `${slider.value}%`;
  label.innerHTML = labelValue;
}

function sliderInput(e) {
  let value = e.target.value;
  let id = e.target.id;
  let property = id === 'themeBrightnessSlider' ? 'lightness' : id === 'themeContrastSlider' ? 'contrast' : id === 'themeSaturationSlider' ? 'saturation' : undefined;

  const updateThemeClass = Promise.resolve((_theme[property] = Number(value)));
  updateThemeClass.then(() => {
    createOutputColors();
    createOutputParameters();

    if (document.getElementById('detailJustifiedWrapper')) {
      const currentColorId = document.querySelector('[id$="_colorName2"]').id;
      const currentColorName = document.getElementById(currentColorId).value;
      createDetailOutputColors(currentColorName);
    }

    const lineTypeSelect = document.getElementById('chartLineType');
    const lineType = lineTypeSelect.value;
    let isStep = lineType === 'step' ? true : false;

    let chartLuminosities = Promise.resolve(getLuminosities());
    chartLuminosities.then(function (resolve) {
      createLuminosityChart(resolve, isStep);
    });

    let chartRatios = Promise.resolve(getThemeContrastRatios());
    chartRatios.then(function (resolve) {
      createRatioChart(resolve, isStep);
    });
  });
}

const sliderB = document.getElementById('themeBrightnessSlider');
const sliderC = document.getElementById('themeContrastSlider');
const sliderD = document.getElementById('themeSaturationSlider');
sliderB.addEventListener('input', sliderValue);
sliderB.addEventListener('input', throttle(sliderInput, 10));
sliderB.addEventListener('change', throttle(dispatchRatioInputEvents, 20));

sliderC.addEventListener('input', sliderValue);
sliderC.addEventListener('input', throttle(sliderInput, 10));

sliderD.addEventListener('input', sliderValue);
sliderD.addEventListener('input', throttle(sliderInput, 10));

window.sliderValue = sliderValue;
window.sliderInput = sliderInput;

module.exports = {
  sliderValue,
  sliderInput
};
