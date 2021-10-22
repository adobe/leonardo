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
import * as Leo from '@adobe/leonardo-contrast-colors';
import * as d3 from './d3';
import {
  addScaleKeyColor,
  addScaleKeyColorInput
} from './scaleKeyColors';
import {
  themeRamp,
  themeRampKeyColors,
  updateRamps
} from './ramps';
import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import {createInterpolationCharts} from './createInterpolationCharts';
import {createRGBchannelChart} from './createRGBchannelChart';
import {downloadSVGgradient} from './createSVGgradient';
import {
  createColorWheel,
  updateColorWheel,
  updateColorDots
} from './colorWheel';
import {create3dModel} from './create3dModel';
import {
  throttle
} from './utils';
import {createSamples} from './createSamples';
import {createDemos} from './createDemos';
import {
  createSVGswatches,
  downloadSwatches
} from './createSVGswatches';

const chroma = require('chroma-js');

function dataVisColorScale(scaleType) {
  // let colorKeys;
  // Set up some sensible defaults
  if(scaleType === 'sequential') {
    // let defaultColors = ['#FFDD00', '#7AcA02', '#0CA9AC', '#005285', '#2E005C']
    // let defaultColors = ['#2E005C', '#005285', '#0CA9AC', '#7AcA02', '#FFDD00']
    // let defaultColors = ['#2E005C', '#FFDD00']
    let defaultColors = ['#5c3cec','#9eecff', '#46006B']
    _sequentialScale.colorKeys = defaultColors;
    _sequentialScale.smooth = true;
  }
  if(scaleType === 'diverging') {
    let defaultStartColors = ['#5c3cec','#9eecff'];
    let defaultEndColors = ['#5c3cec','#9eecff'];
    let defaultMiddleColor = '#f3f3f3';
    _divergingScale.startKeys = defaultStartColors;
    _divergingScale.endKeys = defaultEndColors;
    _divergingScale.middleKey = defaultMiddleColor;
  }
  let downloadGradient = document.getElementById(`${scaleType}_downloadGradient`);
  let chartsModeSelect = document.getElementById(`${scaleType}_chartsMode`);
  let interpolationMode = document.getElementById(`${scaleType}_mode`);
  let smoothWrapper = document.getElementById(`${scaleType}_smoothWrapper`);
  let smooth = document.getElementById(`${scaleType}_smooth`);
  let shift = document.getElementById(`${scaleType}Shift`);
  let correctLightness = document.getElementById(`${scaleType}_correctLightness`);
  let sampleNumber = document.getElementById(`${scaleType}Samples`);
  let sampleOutput = document.getElementById(`${scaleType}_format`);
  let quoteSwitch = document.getElementById(`${scaleType}paramStringQuotes`);
  let PlotDestId = `${scaleType}ModelWrapper`;


  let samples = sampleNumber.value;

  const colorClass = (scaleType === 'sequential') ? _sequentialScale : _divergingScale;
  const colorKeys = colorClass.colorKeys;

  // If class is preset to smooth, check the smooth switch in the UI
  if(colorClass.smooth === true) smooth.checked = true;

  if(colorKeys.length >= 3) {
    smooth.disabled = false;
    smoothWrapper.classList.remove('is-disabled')
  } else {
    smooth.disabled = true;
    smoothWrapper.classList.add('is-disabled')
  }
  interpolationMode.value = colorClass.colorspace;

  let gradientId = `${scaleType}_gradient`;
  let buttonId = `${scaleType}_addKeyColor`;
  let buttonStartId = `${scaleType}_addStartKeyColor`;
  let buttonEndId = `${scaleType}_addEndKeyColor`;

  if(scaleType === 'sequential')  {
    const hasColorKeys = Promise.resolve(colorKeys);
    hasColorKeys.then((values) => {
        for (let i = 0; i < values.length; i++) {
          addScaleKeyColorInput(values[i], buttonId, scaleType, i);
        }
      }
    )
  }
  if(scaleType === 'diverging') {
    console.log(colorClass)
    const hasStartKeys = Promise.resolve(colorClass.startKeys);
    const hasMiddleKey = Promise.resolve(colorClass.middleKey);
    const hasEndKeys = Promise.resolve(colorClass.endKeys);
    Promise.all([hasStartKeys, hasMiddleKey, hasEndKeys]).then((divergingKeys) => {
      const starts = divergingKeys[0];
      const middle = divergingKeys[1];
      const ends = divergingKeys[2];

      for (let i = 0; i < starts.length; i++) {
        console.log(starts[i])
        addScaleKeyColorInput(starts[i], buttonId, scaleType, i, 'start');
      }
      addScaleKeyColorInput(middle, buttonId, scaleType, 0, 'middle');
      for (let i = 0; i < ends.length; i++) {
        addScaleKeyColorInput(ends[i], buttonId, scaleType, i, 'end');
      }
    })
  }



  let colors = colorClass.colors;

  themeRamp(colors, gradientId, '90');
  themeRampKeyColors(colorKeys, gradientId, scaleType);

  createRGBchannelChart(colors, `${scaleType}RGBchart`);
  createInterpolationCharts(colors, 'CAM02', scaleType);
  create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType)

  createSamples(samples, scaleType);
  createDemos(scaleType);

  createColorWheel(chartsModeSelect.value, 50, scaleType);
  updateColorDots(chartsModeSelect.value, scaleType);

  interpolationMode.addEventListener('change', (e) => {
    let colorspace = e.target.value;
    colorClass.colorspace = colorspace;
    // colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createSamples(sampleNumber.value, scaleType);
    updateColorDots(chartsModeSelect.value, scaleType);
    createDemos(scaleType);
    create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType)
  })

  smooth.addEventListener('change', (e) => {
    colorClass.smooth = e.target.checked;
    colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createInterpolationCharts(colors, chartsModeSelect.value, scaleType);
    updateColorDots(chartsModeSelect.value, scaleType);
    createSamples(sampleNumber.value, scaleType);
    createDemos(scaleType);
    create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType)
  })

  downloadGradient.addEventListener('click', (e) => {
    // const stopsInput = document.getElementById(`${scaleType}GradientStops`);
    const stops = 100;
    // const originalSwatches = colorClass.swatches;
    colorClass.swatches = Number(stops);
    
    const gradientColors = colorClass.colors;
    setTimeout(() => {
      downloadSVGgradient(gradientColors, colorClass.colorspace, scaleType);
      colorClass.swatches = originalSwatches;  
    }, 500)
  })

  chartsModeSelect.addEventListener('change', (e) => {
    createInterpolationCharts(colors, e.target.value, scaleType);
    let lightness = (e.target.value === 'HSV') ? 100 : ((e.target.value === 'HSLuv') ? 60 : 50);

    updateColorWheel(e.target.value, lightness, true, null, scaleType)
    create3dModel(PlotDestId, [colorClass], e.target.value, scaleType)
  })

  shift.addEventListener('input', (e) => {
    colorClass.shift = e.target.value;
    colors = colorClass.colors;

    throttle(updateRamps(colorClass, scaleType, scaleType), 10);
    throttle(createInterpolationCharts(colors, chartsModeSelect.value, scaleType), 10);
    throttle(updateColorDots(chartsModeSelect.value, scaleType), 10);
    throttle(createSamples(sampleNumber.value, scaleType), 10);
    throttle(createDemos(scaleType), 10);
    throttle(create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType), 10)
  })

  correctLightness.addEventListener('input', (e) => {
    colorClass.correctLightness = e.target.checked;
    colors = colorClass.colors;

    updateRamps(colorClass, scaleType, scaleType);
    createInterpolationCharts(colors, chartsModeSelect.value, scaleType);
    updateColorDots(chartsModeSelect.value, scaleType);

    createSamples(sampleNumber.value, scaleType);
    createDemos(scaleType);
    create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType)

  })

  if(scaleType === 'sequential') {
    const hasButton = Promise.resolve(document.getElementById(buttonId))
    hasButton.then((value) => {
      value.addEventListener('click', (e) => {
        addScaleKeyColor(scaleType, e);
        updateColorDots(chartsModeSelect.value, scaleType);
        createSamples(sampleNumber.value, scaleType);
        createDemos(scaleType);
        create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType)

      });
    })  
  }
  if(scaleType === 'diverging') {
    console.log(buttonStartId)
    const hasStartButton = Promise.resolve(document.getElementById(buttonStartId))
    const hasEndButton = Promise.resolve(document.getElementById(buttonEndId))
    Promise.all([hasStartButton, hasEndButton]).then(() => {
      document.getElementById(buttonStartId).addEventListener('click', (e) => {
        addScaleKeyColor(scaleType, e);
        updateColorDots(chartsModeSelect.value, scaleType);
        createSamples(sampleNumber.value, scaleType);
        createDemos(scaleType);
        create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType)
      })
      document.getElementById(buttonEndId).addEventListener('click', (e) => {
        addScaleKeyColor(scaleType, e);
        updateColorDots(chartsModeSelect.value, scaleType);
        createSamples(sampleNumber.value, scaleType);
        createDemos(scaleType);
        create3dModel(PlotDestId, [colorClass], chartsModeSelect.value, scaleType)
      })
    })
  }

  sampleNumber.addEventListener('input', (e) => {
    createSamples(e.target.value, scaleType);
  })
  sampleOutput.addEventListener('input', () => {
    createSamples(sampleNumber.value, scaleType);
  })
  quoteSwitch.addEventListener('change', () => {
    createSamples(sampleNumber.value, scaleType);
  })
}

module.exports = {
  dataVisColorScale
}