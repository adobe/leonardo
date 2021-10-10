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
import {addScaleKeyColorInput} from './scaleKeyColors';
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
const chroma = require('chroma-js');

function dataVisColorScale(scaleType) {
  let colorKeys;
  // Set up some sensible defaults
  if(scaleType === 'sequential') {
    colorKeys = ['#FFDD00', '#2E005C', '#009e5a']
    _sequentialScale.colorKeys = colorKeys;
  }
  let downloadGradient = document.getElementById(`${scaleType}_downloadGradient`);
  let chartsModeSelect = document.getElementById(`${scaleType}_chartsMode`);
  let interpolationMode = document.getElementById(`${scaleType}_mode`);
  let smooth = document.getElementById(`${scaleType}_smooth`);
  const colorClass = (scaleType === 'sequential') ? _sequentialScale : _divergingScale;

  let gradientId = `${scaleType}_gradient`;
  let buttonId = `${scaleType}_addKeyColor`;

  for (let i = 0; i < colorKeys.length; i++) {
    addScaleKeyColorInput(colorKeys[i], buttonId, scaleType, i);
  }

  let colors = colorClass.colors;
  let lums = colorClass.colorKeys.map(c => d3.hsluv(c).v );
  let min = Math.min(...lums);
  let max = Math.max(...lums);

  // TEMPORARY
  let mode = 'CAM02'
  let lightness = 50;
  
  themeRamp(colors, gradientId, '-90');
  themeRampKeyColors(colorKeys, gradientId, min, max);

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
    downloadSVGgradient(colorData);
  })

  chartsModeSelect.addEventListener('change', (e) => {
    createInterpolationCharts(colors, e.target.value, scaleType)
  })
}

module.exports = {
  dataVisColorScale
}