/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import * as Leo from '@adobe/leonardo-contrast-colors';
import * as d3 from './d3';
import {
  addScaleKeyColor,
  addScaleKeyColorInput
} from './scaleKeyColors';
import {
  themeRamp,
  themeRampKeyColors,
  updateRamps
} from './ramps';
import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import {createInterpolationCharts} from './createInterpolationCharts';
import {createRGBchannelChart} from './createRGBchannelChart';
import {downloadSVGgradient} from './createSVGgradient';
import {
  createColorWheel,
  updateColorWheel,
  updateColorDots
} from './colorDisc';
import {
  throttle
} from './utils';
import {createSamples} from './createSamples';
import {createDemos} from './createDemos';

const chroma = require('chroma-js');

function dataVisColorScale(scaleType) {
  // let colorKeys;
  // Set up some sensible defaults
  if(scaleType === 'sequential') {
    // let defaultColors = ['#FFDD00', '#7AcA02', '#0CA9AC', '#005285', '#2E005C']
    // let defaultColors = ['#2E005C', '#005285', '#0CA9AC', '#7AcA02', '#FFDD00']
    // let defaultColors = ['#2E005C', '#FFDD00']
    let defaultColors = ['#5c3cec','#9eecff']
    _sequentialScale.colorKeys = defaultColors;
  }
  if(scaleType === 'diverging') {
    let defaultStartColors = ['#5c3cec','#9eecff'];
    let defaultEndColors = ['#5c3cec','#9eecff'];
    let defaultMiddleColor = '#f3f3f3';
    _divergingScale.startKeys = defaultStartColors;
    _divergingScale.endKeys = defaultEndColors;
    _divergingScale.middleKey = defaultMiddleColor;
  }
  let downloadGradient = document.getElementById(`${scaleType}_downloadGradient`);
  let chartsModeSelect = document.getElementById(`${scaleType}_chartsMode`);
  let interpolationMode = document.getElementById(`${scaleType}_mode`);
  let smoothWrapper = document.getElementById(`${scaleType}_smoothWrapper`);
  let smooth = document.getElementById(`${scaleType}_smooth`);
  let shift = document.getElementById(`${scaleType}Shift`);
  let correctLightness = document.getElementById(`${scaleType}_correctLightness`);
  let sampleNumber = document.getElementById(`${scaleType}Samples`);

  let samples = sampleNumber.value;

  const colorClass = (scaleType === 'sequential') ? _sequentialScale : _divergingScale;
  const colorKeys = colorClass.colorKeys;

  if(colorKeys.length >= 3) {
    smooth.disabled = false;
    smoothWrapper.classList.remove('is-disabled')
  } else {
    smooth.disabled = true;
    smoothWrapper.classList.add('is-disabled')
  }
  interpolationMode.value = colorClass.colorspace;

  let gradientId = `${scaleType}_gradient`;
  let buttonId = `${scaleType}_addKeyColor`;

  for (let i = 0; i < colorKeys.length; i++) {
    addScaleKeyColorInput(colorKeys[i], buttonId, scaleType, i);
  }

  let colors = colorClass.colors;

  // TEMPORARY for color wheel
  let mode = 'CAM02'
  let lightness = 50;
  
  let min = Math.min(...colorClass.luminosities);
  let max = Math.max(...colorClass.luminosities);
  themeRamp(colors, gradientId, '90');
  themeRampKeyColors(colorKeys, gradientId, scaleType);

  createRGBchannelChart(colors, `${scaleType}RGBchart`);
  createInterpolationCharts(colors, 'CAM02', scaleType);

  createSamples(samples, scaleType);
  createDemos(scaleType);

  createColorWheel(chartsModeSelect.value, 50, scaleType);
  updateColorDots(chartsModeSelect.value, scaleType);

  interpolationMode.addEventListener('change', (e) => {
    let colorspace = e.target.value;
    colorClass.colorspace = colorspace;
    // colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createSamples(sampleNumber.value, scaleType);
    updateColorDots(chartsModeSelect.value, scaleType);
    createDemos(scaleType);
  })

  smooth.addEventListener('change', (e) => {
    colorClass.smooth = e.target.checked;
    colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createInterpolationCharts(colors, chartsModeSelect.value, scaleType);
    updateColorDots(chartsModeSelect.value, scaleType);
    createSamples(sampleNumber.value, scaleType);
    createDemos(scaleType);
  })

  downloadGradient.addEventListener('click', (e) => {
    colors = colorClass.colors;

    downloadSVGgradient(colors, colorClass.colorspace, scaleType);
  })

  chartsModeSelect.addEventListener('change', (e) => {
    createInterpolationCharts(colors, e.target.value, scaleType);
    let lightness = (e.target.value === 'HSV') ? 100 : ((e.target.value === 'HSLuv') ? 60 : 50);

    updateColorWheel(e.target.value, lightness, true, null, scaleType)
  })

  shift.addEventListener('input', (e) => {
    colorClass.shift = e.target.value;
    colors = colorClass.colors;

    throttle(updateRamps(colorClass, scaleType, scaleType), 10);
    throttle(createInterpolationCharts(colors, chartsModeSelect.value, scaleType), 10);
    throttle(updateColorDots(chartsModeSelect.value, scaleType), 10);
    throttle(createSamples(sampleNumber.value, scaleType), 10);
    throttle(createDemos(scaleType), 10);
  })

  correctLightness.addEventListener('input', (e) => {
    colorClass.correctLightness = e.target.checked;
    colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createInterpolationCharts(colors, chartsModeSelect.value, scaleType);
    updateColorDots(chartsModeSelect.value, scaleType);

    createSamples(sampleNumber.value, scaleType);
    createDemos(scaleType);
  })

  document.getElementById(buttonId).addEventListener('click', (e) => {
    addScaleKeyColor(scaleType, e);
    updateColorDots(chartsModeSelect.value, scaleType);
    createSamples(sampleNumber.value, scaleType);
    createDemos(scaleType);
  });

  sampleNumber.addEventListener('input', (e) => {
    createSamples(e.target.value, scaleType);
  })
}

module.exports = {
  dataVisColorScale
}