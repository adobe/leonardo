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

import * as d3 from './d3';
import {_theme} from './initialTheme';
import {createScale} from '@adobe/leonardo-contrast-colors';
import {createColorChart} from './createChart';
import {filterNaN} from './utils';

function createPaletteInterpolationCharts(colors, mode) {
  let dest = document.getElementById('paletteInterpolationChart');
  dest.innerHTML = ' ';
  let dest2 = document.getElementById('paletteInterpolationChart2');
  dest2.innerHTML = ' ';
  let dest3 = document.getElementById('paletteInterpolationChart3');
  dest3.innerHTML = ' ';

  // Identify mode channels
  let c1, c2, c3, func, yMin, yMax, yMin2, yMax2, c1Label, c2Label, yLabel;
  let c3Label = 'Lightness';

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
    // yMin2 = 0;
    // yMax2 = 100;
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
    // yMin2 = 0;
    // yMax2 = 100;
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
  InterpolationHeader3.innerHTML = `${c3Label}`;
  dest3.appendChild(InterpolationHeader3);

  const fillRange = (start, end) => {
    return Array(end - start).fill().map((item, index) => start + index);
  };

  let dataA = colors.map((color) => {
    let dataX = fillRange(1, color.length + 1);
    let sortedDataX = dataX.sort((a, b) => b-a);
  
    return {
      x: sortedDataX,
      y: color.map(function(d) {return filterNaN(d3[func](d)[c1])})
    }
  })
  let dataB = colors.map((color) => {
    let dataX = fillRange(1, color.length + 1);
    let sortedDataX = dataX.sort((a, b) => b-a);
  
    return {
      x: sortedDataX,
      y: color.map(function(d) {return filterNaN(d3[func](d)[c2])})
    }
  })
  let dataC = colors.map((color) => {
    let dataX = fillRange(1, color.length + 1);
    let sortedDataX = dataX.sort((a, b) => b-a);
  
    return {
      x: sortedDataX,
      y: color.map(function(d) {return filterNaN(d3[func](d)[c3])})
    }
  })

  let visColors = colors.map((color) => {
    return color[14];
  })

  let lightnessMax = (mode === 'HSL' || mode === 'HSV') ? 1 : 100;
  
  createColorChart(dataA, ' ', ' ', "#paletteInterpolationChart", yMin, yMax, visColors);
  createColorChart(dataB, ' ', ' ', "#paletteInterpolationChart2", yMin2, yMax2, visColors);
  createColorChart(dataC, ' ', ' ', "#paletteInterpolationChart3", 0, lightnessMax, visColors);
}

const modePicker = document.getElementById('chartsMode');

function createPaletteCharts(mode) {
  // let mode = modePicker.value;
  // if(mode === undefined) mode = 'CAM02'; // provide default
  const colorClasses = _theme.colors;
  let colors = colorClasses.map((c) => {
    return createScale({swatches: 31, colorKeys: c.colorKeys, colorspace: c.colorspace, smooth: c.smooth});
  });

  // Artificially add black because it's missing...
  let colorsCorrected = colors.map((color) => {
    return [...color, '#000000']
  })
  
  createPaletteInterpolationCharts(colorsCorrected, mode)
}

window.onresize = () => {
  createPaletteCharts(modePicker.value)
};

modePicker.addEventListener('change', (e) => { createPaletteCharts(e.target.value) });

module.exports = {createPaletteCharts}
