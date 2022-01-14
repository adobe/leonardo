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

import {createChart} from './createChart';
import {
  getContrastRatios, 
  getLuminosities
} from './getThemeData';

const lineTypeSelect = document.getElementById('chartLineType');
const lineType = lineTypeSelect.value;
let isStep = (lineType === 'step') ? true : false;

lineTypeSelect.addEventListener('change', (e) => {
  let val = e.target.value;
  isStep = (val === 'step') ? true : false;

  let chartRatios = Promise.resolve(getContrastRatios());
  chartRatios.then(function(resolve) {createRatioChart(resolve)});

  let chartLuminosities = Promise.resolve(getLuminosities());
  chartLuminosities.then(function(resolve) {createLuminosityChart(resolve)});
});

function createRatioChart(chartRatios) {
  let dest = document.getElementById('contrastChart');
  dest.innerHTML = ' ';

  const fillRange = (start, end) => {
    return Array(end - start + 1).fill().map((item, index) => start + index);
  };
  let dataXcontrast = fillRange(1, chartRatios.length);
  let dataContrast = [
    {
      x: dataXcontrast,
      y: chartRatios.map(function(d) {return parseFloat(d);}) // convert to number
    }
  ];
  let minRatio = Math.min(...chartRatios);
  let maxRatio = Math.max(...chartRatios);
  let yMin = (minRatio < 1) ? minRatio: 1;
  let yMax = (maxRatio < 7) ? 7 : ((maxRatio < 12) ? 12 : 21);
  
  createChart(dataContrast, 'Contrast ratio', 'Swatches', "#contrastChart", yMin, yMax, true, undefined, undefined, isStep);
}

function createLuminosityChart(chartLuminosities) {
  let dest = document.getElementById('luminosityChart');
  dest.innerHTML = ' ';

  const fillRange = (start, end) => {
    return Array(end - start + 1).fill().map((item, index) => start + index);
  };
  let dataXluminosity = fillRange(1, chartLuminosities.length);
  let dataLuminosity = [
    {
      x: dataXluminosity,
      y: chartLuminosities.map(function(d) {return parseFloat(d);}) // convert to number
    }
  ];
  // let minLum = Math.min(...chartLuminosities);
  // let maxLum = Math.max(...chartLuminosities);
  let yMin = 0;
  let yMax = 100;
  
  createChart(dataLuminosity, 'Luminosity', 'Swatches', "#luminosityChart", yMin, yMax, true, undefined, undefined, isStep);
}

module.exports = {
  createRatioChart,
  createLuminosityChart
};