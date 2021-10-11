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
import {_sequentialScale} from './initialColorScales';
import {createInterpolationCharts} from './createInterpolationCharts';
import {createRGBchannelChart} from './createRGBchannelChart';
import {downloadSVGgradient} from './createSVGgradient';
import {
  createColorWheel,
  createColorWheelDots
} from './colorDisc';
import {
  makePowScale
} from './utils';

const chroma = require('chroma-js');

function dataVisColorScale(scaleType) {
  // let colorKeys;
  // Set up some sensible defaults
  if(scaleType === 'sequential') {
    // let defaultColors = ['#FFDD00', '#7AcA02', '#0CA9AC', '#005285', '#2E005C']
    // let defaultColors = ['#2E005C', '#005285', '#0CA9AC', '#7AcA02', '#FFDD00']
    let defaultColors = ['#2E005C', '#FFDD00']
    _sequentialScale.colorKeys = defaultColors;
  }
  let downloadGradient = document.getElementById(`${scaleType}_downloadGradient`);
  let chartsModeSelect = document.getElementById(`${scaleType}_chartsMode`);
  let interpolationMode = document.getElementById(`${scaleType}_mode`);
  let smoothWrapper = document.getElementById(`${scaleType}_smoothWrapper`);
  let smooth = document.getElementById(`${scaleType}_smooth`);
  let shift = document.getElementById(`${scaleType}Shift`);
  let correctLightness = document.getElementById(`${scaleType}_correctLightness`);

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
  themeRamp(colors, gradientId, '-90');
  themeRampKeyColors(colorKeys, gradientId, scaleType);

  createRGBchannelChart(colors, `${scaleType}RGBchart`);
  createInterpolationCharts(colors, 'CAM02', scaleType);

  let panelOutputContent = document.getElementById(`${scaleType}ColorScaleOutput`);
  panelOutputContent.innerHTML = colors.toString().replaceAll(',', ', ');

  // TODO: not working -- setContext is failing for some unknown reason.
  // setTimeout(() => {
  //   createColorWheel(mode, lightness, scaleType);
  //   createColorWheelDots();
  // }, 1000); 

  interpolationMode.addEventListener('change', (e) => {
    let colorspace = e.target.value;
    colorClass.colorspace = colorspace;
    // colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
  })

  smooth.addEventListener('change', (e) => {
    colorClass.smooth = e.target.checked;
    colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createInterpolationCharts(colors, chartsModeSelect.value, scaleType)
  })

  downloadGradient.addEventListener('click', (e) => {
    // TODO: Need to reverse the order of the colors array
    // so that the SVG gradient is generated in the same direction
    // as the UI gradient.
    downloadSVGgradient(colors, colorClass.colorspace, scaleType);
  })

  chartsModeSelect.addEventListener('change', (e) => {
    createInterpolationCharts(colors, e.target.value, scaleType)
  })

  shift.addEventListener('input', (e) => {
    colorClass.shift = e.target.value;
    colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createInterpolationCharts(colors, chartsModeSelect.value, scaleType)
  })

  correctLightness.addEventListener('input', (e) => {
    colorClass.correctLightness = e.target.checked;
    colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createInterpolationCharts(colors, chartsModeSelect.value, scaleType)
  })

  document.getElementById(buttonId).addEventListener('click', (e) => {
    addScaleKeyColor(scaleType, e);
  });
}

module.exports = {
  dataVisColorScale
}