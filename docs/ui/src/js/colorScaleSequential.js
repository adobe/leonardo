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
import {createInterpolationCharts} from './createInterpolationCharts';
import {createRGBchannelChart} from './createRGBchannelChart';
import {downloadSVGgradient} from './createSVGgradient';
import {createColorWheel, updateColorWheel, updateColorDots} from './colorWheel';
import {create3dModel} from './create3dModel';
import {createSamples} from './createSamples';
import {createDemos} from './createDemos';
import {createPanelReportTable} from './createPanelReportTable';

const chroma = require('chroma-js');

function colorScaleSequential(scaleType = 'sequential') {
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

  const colorClass = scaleType === 'sequential' ? _sequentialScale : _divergingScale;
  const colorKeys = colorClass.colorKeys;

  // If class is preset to smooth, check the smooth switch in the UI
  if (colorClass.smooth === true) smooth.checked = true;

  if (colorKeys.length >= 3) {
    smooth.disabled = false;
    smoothWrapper.classList.remove('is-disabled');
  } else {
    smooth.disabled = true;
    smoothWrapper.classList.add('is-disabled');
  }
  interpolationMode.value = colorClass.colorspace;

  let gradientId = `${scaleType}_gradient`;
  let buttonId = `${scaleType}_addKeyColor`;

  const hasColorKeys = Promise.resolve(colorKeys);
  hasColorKeys.then((values) => {
    for (let i = 0; i < values.length; i++) {
      addScaleKeyColorInput(values[i], buttonId, scaleType, i);
    }
  });

  let colors = colorClass.colors;

  themeRamp(colors, gradientId, '90');
  themeRampKeyColors(colorKeys, gradientId, scaleType);

  createRGBchannelChart(colors, `${scaleType}RGBchart`);
  createInterpolationCharts(colors, 'CAM02', scaleType);
  create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType);

  createSamples(samples, scaleType);
  createDemos(scaleType);

  createColorWheel(chartsModeSelect.value, 50, scaleType);
  updateColorDots(chartsModeSelect.value, scaleType);

  let bgInput = document.getElementById(`scales_bgColor`);
  bgInput.value = defaultBackgroundColor;

  const color2 = colors[0];
  const color1 = colors[colors.length - 1];
  createPanelReportTable([color1, color2], defaultBackgroundColor, scaleType, 'AA');

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

    createPanelReportTable([color1, color2], value, scaleType, level);
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
    createDemos(scaleType);
    create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType);
  });

  smooth.addEventListener('change', (e) => {
    colorClass.smooth = e.target.checked;
    colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createInterpolationCharts(colors, chartsModeSelect.value, scaleType);
    updateColorDots(chartsModeSelect.value, scaleType);
    createSamples(sampleNumber.value, scaleType);
    createDemos(scaleType);
    create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType);
  });

  downloadGradient.addEventListener('click', (e) => {
    const stops = 100;
    colorClass.swatches = Number(stops);

    const gradientColors = colorClass.colors;
    let scaleName = document.getElementById(`${scaleType}_name`).value;
    let filename = `${scaleName}_${scaleType}`;

    setTimeout(() => {
      downloadSVGgradient(gradientColors, colorClass.colorspace, filename);
      colorClass.swatches = originalSwatches;
    }, 500);
  });

  chartsModeSelect.addEventListener('change', (e) => {
    createInterpolationCharts(colors, e.target.value, scaleType);
    let lightness = e.target.value === 'HSV' ? 100 : e.target.value === 'HSLuv' ? 60 : 50;

    updateColorWheel(e.target.value, lightness, true, null, scaleType);
    create3dModel(PlotDestId, [colorClass], e.target.value, scaleType);
  });

  const hasButton = Promise.resolve(document.getElementById(buttonId));
  hasButton.then((value) => {
    value.addEventListener('click', (e) => {
      addScaleKeyColor(scaleType, e);
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
  colorScaleSequential
};
