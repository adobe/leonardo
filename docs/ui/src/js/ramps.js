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

import * as d3 from './d3';
import {_theme} from './initialTheme';
import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import {createRGBchannelChart} from './createRGBchannelChart';
import {createInterpolationCharts} from './createInterpolationCharts';
import {createPaletteInterpolationCharts} from './createPaletteCharts';
import {makePowScale, orderColorsByLuminosity} from './utils';

function themeRamp(colors, dest, angle) {
  if (!angle) angle = '90';
  angle = `${angle}deg`;
  let container = document.getElementById(dest);
  let gradient = document.createElement('div');
  gradient.className = 'gradient';

  gradient.style.backgroundImage = `linear-gradient(${angle}, ${colors})`;
  container.appendChild(gradient);
}

function themeRampKeyColors(colorKeys, dest, scaleType) {
  let container = document.getElementById(dest);
  let domains, sqrtDomains;
  let dotSize = 12;

  let colorClass = scaleType === 'sequential' ? _sequentialScale : _divergingScale;
  if (scaleType === 'sequential') {
    domains = colorClass.domains;
    let shift = Number(colorClass.shift);
    let inverseShift = 1 / shift;
    let domainPowScale = makePowScale(inverseShift);
    sqrtDomains = domains.map((d) => {
      return domainPowScale(d);
    });
    domains = sqrtDomains;
  }
  if (scaleType === 'diverging' || scaleType === 'sequential') {
    domains = colorClass.domains;
  } else {
    domains = colorKeys.map((key) => {
      return d3.hsluv(key).v;
    });
    sqrtDomains = domains;
  }

  let sortedColorKeys = scaleType === 'diverging' ? colorKeys : orderColorsByLuminosity(colorKeys, 'toLight');

  sortedColorKeys.map((key, index) => {
    let lightness = scaleType === 'sequential' ? colorClass.luminosities[index] / 100 : d3.hsluv(key).v;

    // Adjust offset based on same percentage of the
    // width of the dot, essentially framing the dot
    let dotOffset = scaleType === 'theme' || !scaleType ? (dotSize * lightness) / 100 : dotSize * domains[index];

    let left = scaleType === 'sequential' || scaleType === 'diverging' ? domains[index] * 100 : lightness;

    let leftPosition = `calc(${Math.round(left)}% - ${Math.round(dotOffset)}px)`;
    let dot = document.createElement('div');
    dot.className = 'themeRampDot';
    dot.title = `Key color: ${key}`;
    dot.style.left = leftPosition;
    container.appendChild(dot);
  });
}

function updateRamps(color, id, scaleType = 'theme') {
  let colors, min, max;
  let angle = '90';
  if (scaleType === 'theme') {
    colors = color.backgroundColorScale;
  } else {
    colors = color.colors;
    let lums = color.colorKeys.map((c) => d3.hsluv(c).v);
    min = Math.min(...lums);
    max = Math.max(...lums);
  }

  if (scaleType === 'diverging') id = scaleType;

  let gradientId = id.concat('_gradient');
  document.getElementById(gradientId).innerHTML = ' ';
  themeRamp(colors, gradientId, angle);
  themeRampKeyColors(color.colorKeys, gradientId, scaleType);

  if (scaleType === 'theme') {
    // Update gradient swatch from panel view
    let gradientSwatchId = id.concat('_gradientSwatch');
    document.getElementById(gradientSwatchId).innerHTML = ' ';
    themeRamp(colors, gradientSwatchId, '45');

    createRGBchannelChart(colors);
  } else {
    createRGBchannelChart(colors, `${id}RGBchart`);
  }

  let chartsModeSelect;
  if (scaleType === 'theme') chartsModeSelect = document.getElementById('chartsMode');
  else chartsModeSelect = document.getElementById(`${id}_chartsMode`);

  let chartsMode = chartsModeSelect.value;
  if (scaleType === 'diverging') {
    createPaletteInterpolationCharts([color.startScale.colorsReversed, color.endScale.colors], chartsMode, scaleType);
  } else {
    createInterpolationCharts(colors, chartsMode, scaleType);
  }

  let panelOutputId = scaleType === 'theme' ? 'panelColorScaleOutput' : `${scaleType}ColorScaleOutput`;
  if (scaleType !== 'theme') {
    let panelOutputContent = document.getElementById(panelOutputId);
    panelOutputContent.innerHTML = ' ';
    const formattedColorsString = colors.toString().replaceAll(',', ', ');
    panelOutputContent.innerHTML = formattedColorsString;
  }
}

function createAllColorRamps() {
  let dest = colorScalesWrapper;
  _theme.colors.map((color) => {
    let rampData = color.backgroundColorScale;
    let colors = rampData;

    themeRamp(colors, dest);
  });
}

module.exports = {
  themeRamp,
  themeRampKeyColors,
  createAllColorRamps,
  updateRamps
};
