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

import d3 from '../d3';
import * as d3hexbin from 'd3-hexbin';
import {_divergingScale} from '../initialDivergingScale';
import {_sequentialScale} from '../initialSequentialScale';
Object.assign(d3, d3hexbin);

function hexbin(scaleType) {
  const colorClass = scaleType === 'sequential' ? _sequentialScale : _divergingScale;
  var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select(`${scaleType}Hexbin`)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // read data
  d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_for_density2d.csv').then(function (data) {
    // Add X axis
    const x = d3.scaleLinear().domain([5, 18]).range([0, width]);
    svg.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear().domain([5, 20]).range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    // Reformat the data: d3.hexbin() needs a specific format
    const inputForHexbinFun = [];
    data.forEach(function (d) {
      inputForHexbinFun.push([x(d.x), y(d.y)]); // Note that we had the transform value of X and Y !
    });

    // Prepare a color palette
    const color = d3
      .scaleLinear()
      .domain([0, 600]) // Number of points in the bin?
      .range(['transparent', '#69b3a2']);

    // Compute the hexbin data
    const hexbin = d3
      .hexbin()
      .radius(9) // size of the bin in px
      .extent([
        [0, 0],
        [width, height]
      ]);

    // Plot the hexbins
    svg.append('clipPath').attr('id', 'clip').append('rect').attr('width', width).attr('height', height);

    svg
      .append('g')
      .attr('clip-path', 'url(#clip)')
      .selectAll('path')
      .data(hexbin(inputForHexbinFun))
      .join('path')
      .attr('d', hexbin.hexagon())
      .attr('transform', function (d) {
        return `translate(${d.x}, ${d.y})`;
      })
      .attr('fill', function (d) {
        return color(d.length);
      })
      .attr('stroke', 'black')
      .attr('stroke-width', '0.1');
  });
}

module.exports = {
  hexbin
};
