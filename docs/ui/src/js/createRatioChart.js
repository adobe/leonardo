/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import * as Leo from '@adobe/leonardo-contrast-colors';
import {createChart} from './createChart';
import {getThemeContrastRatios, getLuminosities} from './getThemeData';
import {_theme} from './initialTheme';

const chroma = require('chroma-js');
const {extendChroma} = require('./chroma-plus');
extendChroma(chroma);

const lineTypeSelect = document.getElementById('chartLineType');
const lineType = lineTypeSelect.value;
let isStep = lineType === 'step' ? true : false;

lineTypeSelect.addEventListener('change', (e) => {
  let val = e.target.value;
  isStep = val === 'step' ? true : false;

  let chartRatios = Promise.resolve(getThemeContrastRatios());
  chartRatios.then(function (resolve) {
    createRatioChart(resolve, isStep);
  });

  let chartLuminosities = Promise.resolve(getLuminosities());
  chartLuminosities.then(function (resolve) {
    createLuminosityChart(resolve, isStep);
  });
});

function createRatioChart(chartRatios, bool) {
  if (!bool) bool = isStep;
  let dest = document.getElementById('contrastChart');
  dest.innerHTML = ' ';
  let dest2 = document.getElementById('detailContrastChart');
  if (dest2) dest2.innerHTML = ' ';

  let wcagFormula = document.getElementById('themeWCAG').value;
  let lightness = Number(document.getElementById('themeBrightnessSlider').value);
  // Calculate highest possible contrast ratio (black or white) against background color
  const maxPossibleRatio = lightness > 50 ? Leo.contrast([0, 0, 0], chroma(_theme.contrastColors[0].background).rgb(), undefined, wcagFormula) : Leo.contrast([255, 255, 255], chroma(_theme.contrastColors[0].background).rgb(), undefined, wcagFormula);

  const fillRange = (start, end) => {
    return Array(end - start + 1)
      .fill()
      .map((item, index) => start + index);
  };
  let dataXcontrast = fillRange(1, chartRatios.length);
  let dataContrast = [
    {
      x: dataXcontrast,
      y: chartRatios.map(function (d) {
        let cappedRatio = d > maxPossibleRatio ? maxPossibleRatio : d;
        return parseFloat(cappedRatio);
      }) // convert to number
    }
  ];
  let minRatio = Math.min(...chartRatios);
  let yMin = wcagFormula === 'wcag3' ? 0 : minRatio < 1 ? minRatio : 1;
  let yMax = wcagFormula === 'wcag3' ? 106 : 21;

  createChart(dataContrast, 'Contrast ratio', 'Swatches', '#contrastChart', yMin, yMax, true, undefined, undefined, bool);
  // for color details view
  createChart(dataContrast, 'Contrast ratio', 'Swatches', '#detailContrastChart', yMin, yMax, true, undefined, undefined, bool);
}

function createLuminosityChart(chartLuminosities, bool) {
  if (!bool) bool = isStep;
  let dest = document.getElementById('luminosityChart');
  dest.innerHTML = ' ';
  let dest2 = document.getElementById('detailLightnessChart');
  if (dest2) dest2.innerHTML = ' ';

  const fillRange = (start, end) => {
    return Array(end - start + 1)
      .fill()
      .map((item, index) => start + index);
  };
  let dataXluminosity = fillRange(1, chartLuminosities.length);
  let dataLuminosity = [
    {
      x: dataXluminosity,
      y: chartLuminosities.map(function (d) {
        return parseFloat(d);
      }) // convert to number
    }
  ];

  let yMin = 0;
  let yMax = 100;

  createChart(dataLuminosity, 'Lightness', 'Swatches', '#luminosityChart', yMin, yMax, true, undefined, undefined, bool);
  // for color details view
  createChart(dataLuminosity, 'Lightness', 'Swatches', '#detailLightnessChart', yMin, yMax, true, undefined, undefined, bool);
}

module.exports = {
  createRatioChart,
  createLuminosityChart
};
