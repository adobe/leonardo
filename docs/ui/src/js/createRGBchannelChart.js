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
import {filterNaN} from './utils';
import {createChart} from './createChart';

function createRGBchannelChart(colors, id = 'RGBchart') {
  let dest = document.getElementById(id);
  dest.innerHTML = ' ';

  if (id === 'RGBchart') {
    colors = [...colors];
    colors.push('#000000');
  } else if (id === 'sequentialRGBchart' || id === 'divergingRGBchart') {
    colors = colors.reverse();
  }

  // Create chart headers
  let RGBheader = document.createElement('h5');
  RGBheader.className = 'spectrum-Typography spectrum-Heading spectrum-Heading--sizeXXS';
  RGBheader.innerHTML = 'RGB channels';
  dest.appendChild(RGBheader);

  const fillRange = (start, end) => {
    return Array(end + 2 - (start + 2))
      .fill()
      .map((item, index) => start + index);
  };
  let dataX = fillRange(1, colors.length);
  let sortedDataX = id === 'RGBchart' ? dataX.sort((a, b) => a - b) : dataX.sort((a, b) => b - a);

  let data = [
    {
      x: sortedDataX,
      y: colors.map(function (d) {
        return filterNaN(d3.rgb(d).r);
      })
    },
    {
      x: sortedDataX,
      y: colors.map(function (d) {
        return filterNaN(d3.rgb(d).g);
      })
    },
    {
      x: sortedDataX,
      y: colors.map(function (d) {
        return filterNaN(d3.rgb(d).b);
      })
    }
  ];

  createChart(data, ' ', ' ', `#${id}`, 0, 255);
}

module.exports = {createRGBchannelChart};
