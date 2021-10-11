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
import {_theme} from './initialTheme';
import {_sequentialScale} from './initialColorScales';
import {createRGBchannelChart} from './createRGBchannelChart';
import {createInterpolationCharts} from './createInterpolationCharts';
import {
  makePowScale
} from './utils'

function themeRamp(colors, dest, angle) {
  if(!angle) angle = '90';
  angle = `${angle}deg`;
  let container = document.getElementById(dest);
  let gradient = document.createElement('div');
  gradient.className = 'gradient'

  gradient.style.backgroundImage = `linear-gradient(${angle}, ${colors})`;
  container.appendChild(gradient)
}

function themeRampKeyColors(colorKeys, dest, scaleType) {
  let container = document.getElementById(dest);

  let domains;
  if(scaleType === 'sequential') {
    domains = _sequentialScale.domains;  
  }
  else domains = colorKeys.map(key => { return d3.hsluv(key).v})

  colorKeys.map((key, index) => {
    let lightness = d3.hsluv(key).v;
    
    let lightnessPerc = 100/lightness;
    // Adjust offset based on same percentage of the 
    // width of the dot, essentially framing the dot
    // min/max positions within the ramp itself
    let dotOffset = 36 / lightnessPerc;
    let left = (scaleType === 'sequential' || scaleType === 'diverging') ? domains[index] * 100 : lightness;

    let leftPosition = `calc(${Math.round(left)}% - ${Math.round(dotOffset)}px)`;
    let dot = document.createElement('div');
    dot.className = 'themeRampDot';
    dot.style.backgroundColor = key;
    dot.style.left = leftPosition;
    container.appendChild(dot);
  })
}

function updateRamps(color, id, scaleType = 'theme') {
  let colors, angle, min, max;
  if(scaleType === 'theme') {
    colors = color.backgroundColorScale; 
    angle = '90';
  }
  else {
    colors = color.colors;
    angle = '-90';
    let lums = color.colorKeys.map(c => d3.hsluv(c).v );
    min = Math.min(...lums);
    max = Math.max(...lums);
  }

  let gradientId = id.concat('_gradient');
  document.getElementById(gradientId).innerHTML = ' ';
  themeRamp(colors, gradientId, angle);

  if(scaleType === 'theme') {
    // Create key color dots
    themeRampKeyColors(color.colorKeys, gradientId, scaleType);
    // Update gradient swatch from panel view
    let gradientSwatchId = id.concat('_gradientSwatch');
    document.getElementById(gradientSwatchId).innerHTML = ' ';
    themeRamp(colors, gradientSwatchId, '45');

    createRGBchannelChart(colors);
  } else {
    themeRampKeyColors(color.colorKeys, gradientId, scaleType);

    createRGBchannelChart(colors, `${id}RGBchart`);
  }


  let chartsModeSelect;
  if(scaleType === 'theme') chartsModeSelect = document.getElementById('chartsMode');
  else chartsModeSelect = document.getElementById(`${id}_chartsMode`);

  let chartsMode = chartsModeSelect.value;
  createInterpolationCharts(colors, chartsMode, scaleType);

  let panelOutputId = (scaleType === 'theme') ? 'panelColorScaleOutput' : `${scaleType}ColorScaleOutput` ;
  let panelOutputContent = document.getElementById(panelOutputId);
  panelOutputContent.innerHTML = ' ';
  panelOutputContent.innerHTML = colors;
}

function createAllColorRamps() {
  let dest = colorScalesWrapper;
  _theme.colors.map((color) => {
    let rampData = color.backgroundColorScale;
    let colors = rampData;
  
    themeRamp(colors, dest)
    // colors = cvdColors(colors);
  })
}

module.exports = {
  themeRamp,
  themeRampKeyColors,
  createAllColorRamps,
  updateRamps
}