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

import * as d3 from './d3';
import {createColorChart, createChart} from './createChart';
import {filterNaN} from './utils';

function createInterpolationCharts(colors, mode, scaleType = 'theme') {
  let d1id, d2id, d3id;
  if(scaleType === 'theme') {
    d1id = 'interpolationChart'
    d2id = 'interpolationChart2'
    d3id = 'interpolationChart3'
  } else {
    d1id = `${scaleType}InterpolationChart`
    d2id = `${scaleType}InterpolationChart2`
    d3id = `${scaleType}InterpolationChart3`
  }

  let dest = document.getElementById(d1id);
  dest.innerHTML = ' ';
  let dest2 = document.getElementById(d2id);
  dest2.innerHTML = ' ';
  let dest3 = document.getElementById(d3id);
  dest3.innerHTML = ' ';

  // Identify mode channels
  let c1, c2, c3, func, yMin, yMax, yMin2, yMax2, c1Label, c2Label, yLabel;
  if(mode === 'RGB') {
    func = 'hsl';
    c1 = 'h';
    c1Label = `Hue (HSL - H)`;
    c2 = 's';
    c2Label = `Saturation (HSL - S)`;
    c3 = 'l';
    yMin = 0;
    yMax = 360;
    yMin2 = 0;
    yMax2 = 1;
  }
  if(mode === 'LAB') {
    func = 'lab';
    c1 = 'a';
    c1Label = `Redness / Greenness (${mode} - A)`;
    c2 = 'b';
    c2Label = `Blueness / Yellowness (${mode} - B)`;
    c3 = 'l';
  }
  if(mode === 'LCH') {
    func = 'lch';
    c1 = 'h';
    c1Label = `Hue (${mode} - H)`;
    c2 = 'c';
    c2Label = `Chroma (${mode} - C)`;
    c3 = 'l';
    yMin = 0;
    yMax = 360;
  }
  if(mode === 'CAM02') {
    func = 'jab';
    c1 = 'a';
    c1Label = `Redness / Greenness (${mode} - A)`;
    c2 = 'b';
    c2Label = `Blueness / Yellowness (${mode} - B)`;
    c3 = 'J';
  }
  if(mode === 'CAM02p') {
    func = 'jch';
    c1 = 'h';
    c1Label = `Hue (${mode} - H)`;
    c2 = 'C';
    c2Label = `Chroma (${mode} - C)`;
    c3 = 'J';
    yMin = 0;
    yMax = 360;
  }
  if(mode === 'HSL') {
    func = 'hsl';
    c1 = 'h';
    c1Label = `Hue (${mode} - H)`;
    c2 = 's';
    c2Label = `Saturation (${mode} - S)`;
    c3 = 'l';
    yMin = 0;
    yMax = 360;
    yMin2 = 0;
    yMax2 = 1;
  }
  if(mode === 'HSLuv') {
    func = 'hsluv';
    c1 = 'l';
    c1Label = `Hue (${mode} - H)`;
    c2 = 'u';
    c2Label = `Saturation (${mode} - S)`;
    c3 = 'v';
    yMin = 0;
    yMax = 360;
    yMin2 = 0;
    yMax2 = 100;
  }
  if(mode === 'HSV') {
    func = 'hsv';
    c1 = 'h';
    c1Label = `Hue (${mode} - H)`;
    c2 = 's';
    c2Label = `Saturation (${mode} - S)`;
    c3 = 'v';
    yMin = 0;
    yMax = 360;
    yMin2 = 0;
    yMax2 = 1;
  }
  // Create chart header
  let InterpolationHeader = document.createElement('h5');
  InterpolationHeader.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
  InterpolationHeader.innerHTML = `${c1Label}`;
  dest.appendChild(InterpolationHeader);
  let InterpolationHeader2 = document.createElement('h5');
  InterpolationHeader2.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
  InterpolationHeader2.innerHTML = `${c2Label}`;
  dest2.appendChild(InterpolationHeader2);
  let InterpolationHeader3 = document.createElement('h5');
  InterpolationHeader3.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
  InterpolationHeader3.innerHTML =  'Lightness';// `${c3Label}`;
  dest3.appendChild(InterpolationHeader3);

  const fillRange = (start, end) => {
    return Array(end - start).fill().map((item, index) => start + index);
  };
  let dataX = fillRange(1, colors.length);
  // Reorder data for color scales

  let dataYa = colors.map(function(d) {return filterNaN(d3[func](d)[c1]);});
  let dataYb = colors.map(function(d) {return filterNaN(d3[func](d)[c2]);});
  let dataYc = colors.map(function(d) {return filterNaN(d3[func](d)[c3]);});

  if(scaleType === 'sequential') {
    dataX = dataX.sort((a, b) => {return a - b;});
    dataYa = dataYa.sort((a, b) => {return a - b;});
    dataYb = dataYb.sort((a, b) => {return a - b;});
    dataYc = dataYc.sort((a, b) => {return a - b;});
  }

  let visColors = colors[50];

  let dataA = [
    {
      x: dataX,
      y: dataYa
    }
  ];
  let dataB = [
    {
      x: dataX,
      y: dataYb 
    }
  ];
  let dataC = [
    {
      x: dataX,
      y: dataYc 
    }
  ];

  if(scaleType === 'diverging') console.log(dataA, dataB, dataC)

  let lightnessMax = (mode === 'HSL' || mode === 'HSV') ? 1 : 100;

  createChart(dataA, ' ', ' ', `#${d1id}`, yMin, yMax, false, visColors, scaleType);
  createChart(dataB, ' ', ' ', `#${d2id}`, yMin2, yMax2, false, visColors, scaleType);
  createChart(dataC, ' ', ' ', `#${d3id}`, 0, lightnessMax, false, visColors, scaleType);
}

module.exports = {createInterpolationCharts}
