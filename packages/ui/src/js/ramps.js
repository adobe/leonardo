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

  let domains, sqrtDomains;
  if(scaleType === 'sequential') {
    domains = _sequentialScale.domains;  
    let shift = Number(_sequentialScale.shift);
    let inverseShift = 1 / shift;
    let shiftShift = Math.pow(inverseShift, inverseShift)
    let domainPowScale = makePowScale( inverseShift );
    // let domainPowScale = (x) => {return Math.pow(x, inverseShift)}
    sqrtDomains = domains.map((d) => {return domainPowScale(d)})
  }
  else {
    domains = colorKeys.map(key => { return d3.hsluv(key).v})
    sqrtDomains = domains;
  }

  colorKeys.map((key, index) => {
    let lightness = (scaleType === 'sequential')  ? _sequentialScale.luminosities[index] : d3.hsluv(key).v;
    let lightnessPerc = lightness/100;
    // Adjust offset based on same percentage of the 
    // width of the dot, essentially framing the dot
    let dotOffset = (scaleType !== 'sequential') 
      ? 36 * lightnessPerc 
      : 36 * domains[index];

    let left = (scaleType === 'sequential' || scaleType === 'diverging') 
      ? domains[index] * 100
      : lightness;

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
  themeRampKeyColors(color.colorKeys, gradientId, scaleType);

  if(scaleType === 'theme') {
    // Update gradient swatch from panel view
    let gradientSwatchId = id.concat('_gradientSwatch');
    document.getElementById(gradientSwatchId).innerHTML = ' ';
    themeRamp(colors, gradientSwatchId, '45');

    createRGBchannelChart(colors);
  } else {
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