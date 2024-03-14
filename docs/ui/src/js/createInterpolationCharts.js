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
import {createColorChart, createChart} from './createChart';
import {filterNaN, getChannelsAndFunction} from './utils';
import chroma from 'chroma-js';

function createInterpolationCharts(colors, mode, scaleType = 'theme') {
  let d1id, d2id, d3id;
  // colors = colors.map((c) => {return chroma(c)})
  if (scaleType === 'theme') {
    d1id = 'interpolationChart';
    d2id = 'interpolationChart2';
    d3id = 'interpolationChart3';
  } else {
    d1id = `${scaleType}InterpolationChart`;
    d2id = `${scaleType}InterpolationChart2`;
    d3id = `${scaleType}InterpolationChart3`;
  }

  let dest = Promise.resolve(document.getElementById(d1id));
  let dest2 = Promise.resolve(document.getElementById(d2id));
  let dest3 = Promise.resolve(document.getElementById(d3id));

  Promise.all([dest, dest2, dest3]).then((values) => {
    let dest = values[0];
    let dest2 = values[1];
    let dest3 = values[2];

    dest.innerHTML = ' ';
    dest2.innerHTML = ' ';
    dest3.innerHTML = ' ';

    // Identify mode channels
    let colorData = getChannelsAndFunction(mode);

    // Create chart header
    let InterpolationHeader = document.createElement('h5');
    InterpolationHeader.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
    InterpolationHeader.innerHTML = `${colorData.c1Label}`;
    dest.appendChild(InterpolationHeader);
    let InterpolationHeader2 = document.createElement('h5');
    InterpolationHeader2.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
    InterpolationHeader2.innerHTML = `${colorData.c2Label}`;
    dest2.appendChild(InterpolationHeader2);
    let InterpolationHeader3 = document.createElement('h5');
    InterpolationHeader3.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
    InterpolationHeader3.innerHTML = `${colorData.c3Label}`;
    dest3.appendChild(InterpolationHeader3);

    const fillRange = (start, end) => {
      return Array(end - start)
        .fill()
        .map((item, index) => start + index);
    };
    let dataX = fillRange(1, colors.length);
    // Reorder data for color scales

    let dataYa = colors.map(function (d) {
      return filterNaN(chroma(d)[colorData.func]()[colorData.c1]);
      // return filterNaN(d3[func](d)[c1]);
    });
    let dataYb = colors.map(function (d) {
      return filterNaN(chroma(d)[colorData.func]()[colorData.c2]);
      // return filterNaN(d3[func](d)[c2]);
    });
    let dataYc = colors.map(function (d) {
      return filterNaN(chroma(d)[colorData.func]()[colorData.c3]);
      // return filterNaN(d3[func](d)[c3]);
    });

    if (scaleType === 'sequential') {
      dataX = dataX.sort((a, b) => {
        return a - b;
      });
      dataYa = dataYa.sort((a, b) => {
        return a - b;
      });
      dataYb = dataYb.sort((a, b) => {
        return a - b;
      });
      dataYc = dataYc.sort((a, b) => {
        return a - b;
      });
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

    let lightnessMax = mode === 'HSL' || mode === 'HSV' || mode === 'OKLCH' || mode === 'OKLAB' ? 1 : 100;

    createChart(dataA, ' ', ' ', `#${d1id}`, colorData.yMin, colorData.yMax, false, visColors, scaleType);
    createChart(dataB, ' ', ' ', `#${d2id}`, colorData.yMin2, colorData.yMax2, false, visColors, scaleType);
    createChart(dataC, ' ', ' ', `#${d3id}`, 0, lightnessMax, false, visColors, scaleType);
  });
}

module.exports = {createInterpolationCharts};
