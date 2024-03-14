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

import {addScaleKeyColor, addScaleKeyColorInput} from './scaleKeyColors';
import {themeRamp, themeRampKeyColors, updateRamps} from './ramps';
import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import {createPaletteInterpolationCharts} from './createPaletteCharts';
import {createRGBchannelChart} from './createRGBchannelChart';
import {downloadSVGgradient} from './createSVGgradient';
import {createColorWheel, updateColorWheel, updateColorDots} from './colorWheel';
import {create3dModel} from './create3dModel';
import {createSamples} from './createSamples';
import {createDemos} from './createDemos';
import {createPanelReportTable} from './createPanelReportTable';

const chroma = require('chroma-js');

function colorScaleDiverging(scaleType = 'diverging') {
  /**
   * Have to keep this manual changing of the diverging scale because the initial scale
   *  does not output the colors properly. Unclear why, but for now this will work.
   */
  let defaultMiddleColor = '#FFFFE0';
  _divergingScale.middleKey = defaultMiddleColor;
  _divergingScale.distributeLightness = 'polynomial';

  let defaultBackgroundColor;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.matches) {
    //dark mode
    defaultBackgroundColor = '#1d1d1d';
    document.getElementById('main_sequential').classList.add('spectrum--darkest');
  } else {
    //light mode
    defaultBackgroundColor = '#f8f8f8';
    document.getElementById('main_sequential').classList.add('spectrum--light');
  }

  let downloadGradient = document.getElementById(`${scaleType}_downloadGradient`);
  let chartsModeSelect = document.getElementById(`${scaleType}_chartsMode`);
  let interpolationMode = document.getElementById(`${scaleType}_mode`);
  let smoothWrapper = document.getElementById(`${scaleType}_smoothWrapper`);
  let smooth = document.getElementById(`${scaleType}_smooth`);
  let sampleNumber = document.getElementById(`${scaleType}Samples`);
  let sampleOutput = document.getElementById(`${scaleType}_format`);
  let quoteSwitch = document.getElementById(`${scaleType}paramStringQuotes`);
  let PlotDestId = `${scaleType}ModelWrapper`;

  let samples = sampleNumber.value;

  const colorClass = _divergingScale;
  const colorKeys = colorClass.colorKeys;

  // If class is preset to smooth, check the smooth switch in the UI
  if (colorClass.smooth === true) smooth.checked = true;

  interpolationMode.value = colorClass.colorspace;

  let gradientId = `${scaleType}_gradient`;
  let buttonId = `${scaleType}_addKeyColor`;
  let buttonStartId = `${scaleType}_addStartKeyColor`;
  let buttonEndId = `${scaleType}_addEndKeyColor`;

  const hasStartKeys = Promise.resolve(colorClass.startKeys);
  const hasMiddleKey = Promise.resolve(colorClass.middleKey);
  const hasEndKeys = Promise.resolve(colorClass.endKeys);
  Promise.all([hasStartKeys, hasMiddleKey, hasEndKeys]).then((divergingKeys) => {
    const starts = divergingKeys[0];
    const middle = divergingKeys[1];
    const ends = divergingKeys[2];

    for (let i = 0; i < starts.length; i++) {
      addScaleKeyColorInput(starts[i], buttonId, scaleType, i, 'start');
    }
    addScaleKeyColorInput(middle, buttonId, scaleType, 0, 'middle');
    for (let i = 0; i < ends.length; i++) {
      addScaleKeyColorInput(ends[i], buttonId, scaleType, i, 'end');
    }
  });

  let colors = colorClass.colors;

  themeRamp(colors, gradientId, '90');
  themeRampKeyColors(colorKeys, gradientId, scaleType);

  createRGBchannelChart(colors, `${scaleType}RGBchart`);
  createPaletteInterpolationCharts([colorClass.startScale.colorsReversed, colorClass.endScale.colors], chartsModeSelect.value, scaleType);
  create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType);

  createSamples(samples, scaleType);
  createDemos(scaleType);

  createColorWheel(chartsModeSelect.value, 50, scaleType);
  updateColorDots(chartsModeSelect.value, scaleType);

  let bgInput = document.getElementById(`scales_bgColor`);
  bgInput.value = defaultBackgroundColor;

  const color2 = colors[0];
  const color1 = colors[colors.length - 1];
  const color3 = colorClass.middleKey;
  createPanelReportTable([color1, color3, color2], defaultBackgroundColor, scaleType, 'AA');

  bgInput.addEventListener('input', (e) => {
    // change <main> background
    let value = e.target.value;
    let wrapper = document.getElementById(`main_${scaleType}`);
    wrapper.style.backgroundColor = value;
    // toggle class based on lightness
    let lightness = chroma(value).jch()[0];
    if (lightness < 50) {
      wrapper.classList.remove('spectrum--light');
      wrapper.classList.add('spectrum--darkest');
    } else {
      wrapper.classList.remove('spectrum--darkest');
      wrapper.classList.add('spectrum--light');
    }
    let level = document.getElementById(`scales_complianceLevel`).value;

    createPanelReportTable([color1, color3, color2], value, scaleType, level);
  });

  const compliancePicker = document.getElementById(`scales_complianceLevel`);
  compliancePicker.addEventListener('change', (e) => {
    let level = e.target.value;
    createPanelReportTable(null, null, scaleType, level);
  });

  interpolationMode.addEventListener('change', (e) => {
    let colorspace = e.target.value;
    colorClass.colorspace = colorspace;

    updateRamps(colorClass, scaleType, scaleType);
    createSamples(sampleNumber.value, scaleType);
    updateColorDots(chartsModeSelect.value, scaleType);
    createPaletteInterpolationCharts([colorClass.startScale.colorsReversed, colorClass.endScale.colors], chartsModeSelect.value, scaleType);
    createDemos(scaleType);
    create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType);
  });

  smooth.addEventListener('change', (e) => {
    colorClass.smooth = e.target.checked;
    colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createPaletteInterpolationCharts([colorClass.startScale.colorsReversed, colorClass.endScale.colors], chartsModeSelect.value, scaleType);
    updateColorDots(chartsModeSelect.value, scaleType);
    createSamples(sampleNumber.value, scaleType);
    createDemos(scaleType);
    create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType);
  });

  downloadGradient.addEventListener('click', (e) => {
    const originalSwatches = colorClass.swatches;
    const stops = 100;
    colorClass.swatches = Number(stops);

    let scaleName = document.getElementById(`${scaleType}_name`).value;
    let filename = `${scaleName}_${scaleType}`;

    const gradientColors = colorClass.colors;
    setTimeout(() => {
      downloadSVGgradient(gradientColors, colorClass.colorspace, filename);
      colorClass.swatches = originalSwatches;
    }, 500);
  });

  chartsModeSelect.addEventListener('change', (e) => {
    createPaletteInterpolationCharts([colorClass.startScale.colorsReversed, colorClass.endScale.colors], chartsModeSelect.value, scaleType);
    let lightness = e.target.value === 'HSV' ? 100 : e.target.value === 'HSLuv' ? 60 : 50;

    updateColorWheel(e.target.value, lightness, true, null, scaleType);
    create3dModel(PlotDestId, [colorClass], e.target.value, scaleType);
  });

  const hasStartButton = Promise.resolve(document.getElementById(buttonStartId));
  const hasEndButton = Promise.resolve(document.getElementById(buttonEndId));
  Promise.all([hasStartButton, hasEndButton]).then(() => {
    document.getElementById(buttonStartId).addEventListener('click', (e) => {
      addScaleKeyColor(scaleType, e, 'start');
      updateColorDots(chartsModeSelect.value, scaleType);
      createSamples(sampleNumber.value, scaleType);
      createDemos(scaleType);
      create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType);
    });
    document.getElementById(buttonEndId).addEventListener('click', (e) => {
      addScaleKeyColor(scaleType, e, 'end');
      updateColorDots(chartsModeSelect.value, scaleType);
      createSamples(sampleNumber.value, scaleType);
      createDemos(scaleType);
      create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType);
    });
  });

  sampleNumber.addEventListener('input', (e) => {
    createSamples(e.target.value, scaleType);
  });
  sampleOutput.addEventListener('input', () => {
    createSamples(sampleNumber.value, scaleType);
  });
  quoteSwitch.addEventListener('change', () => {
    createSamples(sampleNumber.value, scaleType);
  });
}

module.exports = {
  colorScaleDiverging
};
