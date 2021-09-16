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

import * as Leo from '@adobe/leonardo-contrast-colors';
import * as d3 from './d3';
import {createRGBchannelChart} from './createRGBchannelChart';
import {createInterpolationCharts} from './createInterpolationCharts';

function themeRamp(colors, dest, angle) {
  if(!angle) angle = '270';
  angle = `${angle}deg`;
  let container = document.getElementById(dest);
  let gradient = document.createElement('div');
  gradient.className = 'gradient'

  gradient.style.backgroundImage = `linear-gradient(${angle}, ${colors})`;
  container.appendChild(gradient)
}

function themeRampKeyColors(colorKeys, dest) {
  let container = document.getElementById(dest);

  colorKeys.map(key => {
    let lightness = d3.hsluv(key).v;
    let lightnessPerc = 100/lightness;
    // Adjust offset based on same percentage of the 
    // width of the dot, essentially framing the dot
    // min/max positions within the ramp itself
    let dotOffset = 32 / lightnessPerc;
    let leftPosition = `calc(${Math.round(lightness)}% - ${Math.round(dotOffset)}px)`;
    let dot = document.createElement('div');
    dot.className = 'themeRampDot';
    dot.style.backgroundColor = key;
    dot.style.left = leftPosition;
    container.appendChild(dot);
  })
}

function updateRamps(color, id) {
  // Upate ramp in color detail view
  let rampData = Leo.createScale({swatches: 30, colorKeys: color.colorKeys, colorspace: color.colorspace, smooth: color.smooth});
  let colors = rampData;
  let gradientId = id.concat('_gradient');
  document.getElementById(gradientId).innerHTML = ' ';
  themeRamp(colors, gradientId);
  
  // Create key color dots
  themeRampKeyColors(color.colorKeys, gradientId);

  // Update gradient swatch from panel view
  let gradientSwatchId = id.concat('_gradientSwatch');
  document.getElementById(gradientSwatchId).innerHTML = ' ';
  themeRamp(colors, gradientSwatchId, '200');

  createRGBchannelChart(rampData);

  let chartsModeSelect = document.getElementById('chartsMode');
  let chartsMode = chartsModeSelect.value;
  createInterpolationCharts(rampData, chartsMode)
}

module.exports = {
  themeRamp,
  themeRampKeyColors,
  updateRamps
}