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
import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import {createRGBchannelChart} from './createRGBchannelChart';
import {createInterpolationCharts} from './createInterpolationCharts';
import {createPaletteInterpolationCharts} from './createPaletteCharts';
import {create3dModel} from './create3dModel';
import {
  makePowScale,
  orderColorsByLuminosity
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
  console.log('updating theme ramp key colors')
  let domains, sqrtDomains;
  let colorClass = (scaleType === 'sequential') ? _sequentialScale : _divergingScale;
  if(scaleType === 'sequential') {
    domains = colorClass.domains;  
    // domains = colorKeys.map(key => { return d3.hsluv(key).v})
    let shift = Number(colorClass.shift);
    let inverseShift = 1 / shift;
    let shiftShift = Math.pow(inverseShift, inverseShift)
    let domainPowScale = makePowScale( inverseShift );
    // let domainPowScale = (x) => {return Math.pow(x, inverseShift)}
    sqrtDomains = domains.map((d) => {return domainPowScale(d)})
    domains = sqrtDomains;
  }
  if(scaleType === 'diverging' || scaleType === 'sequential') {
    domains = colorClass.domains;  
    // const distributeLightness = colorClass.distributeLightness;
    // console.log(distributeLightness)
    // if(distributeLightness === 'parabolic') {
    //   const parabola = (x) => {return (Math.sqrt(x, 2))} 
    //   // let percDomains = sqrtDomains.map((d) => {return d})
    //   let newDomains = sqrtDomains.map((d) => {return parabola(d)})
    //   domains = newDomains;
    //   console.log(newDomains)
    // }
    // if(distributeLightness === 'polynomial') {
    //   // Equation based on polynomial mapping of lightness values in CIECAM02 
    //   // of the RgBu diverging color scale.
    //   const polynomial = (x) => { return 2.53906249999454 * Math.pow(x,4) - 6.08506944443434 * Math.pow(x,3) + 5.11197916665992 * Math.pow(x,2) - 2.56537698412552 * x + 0.999702380952327; }
    //   // let percDomains = sqrtDomains.map((d) => {return d})
    //   let newDomains = sqrtDomains.map((d) => {return polynomial(d)})
    //   domains = newDomains;
    // } else {
      // domains = sqrtDomains;
    // }
  }
  else {
    domains = colorKeys.map(key => { return d3.hsluv(key).v})
    sqrtDomains = domains;
  }

  let sortedColorKeys = (scaleType==='diverging') ? colorKeys: orderColorsByLuminosity(colorKeys, 'toLight');

  sortedColorKeys.map((key, index) => {
    let lightness = (scaleType === 'sequential') 
      ? colorClass.luminosities[index] / 100 
      : d3.hsluv(key).v;

    // Adjust offset based on same percentage of the 
    // width of the dot, essentially framing the dot
    let dotOffset = (scaleType === 'theme' || !scaleType) 
      ? 36 * lightness/100 
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
  let colors, min, max;
  let angle = '90';
  if(scaleType === 'theme') {
    colors = color.backgroundColorScale; 
  }
  else {
    colors = color.colors;
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
    // let chartsModeSelect = document.getElementById('chartsMode');
    // create3dModel('tabModelContent', [color], chartsModeSelect.value);

  } else {
    createRGBchannelChart(colors, `${id}RGBchart`);
  }


  let chartsModeSelect;
  if(scaleType === 'theme') chartsModeSelect = document.getElementById('chartsMode');
  else chartsModeSelect = document.getElementById(`${id}_chartsMode`);

  let chartsMode = chartsModeSelect.value;
  if(scaleType === 'diverging') {
    createPaletteInterpolationCharts([color.startScale.colorsReversed, color.endScale.colors], chartsMode, scaleType);
  }
  else {
    createInterpolationCharts(colors, chartsMode, scaleType);
  }

  let panelOutputId = (scaleType === 'theme') ? 'panelColorScaleOutput' : `${scaleType}ColorScaleOutput` ;
  let panelOutputContent = document.getElementById(panelOutputId);
  panelOutputContent.innerHTML = ' ';
  const formattedColorsString = colors.toString().replaceAll(',', ', ');
  panelOutputContent.innerHTML = formattedColorsString;
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