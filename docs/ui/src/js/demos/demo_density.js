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
// import * as d3hexbin from 'd3-hexbin';
import {_divergingScale} from '../initialDivergingScale';
import {_sequentialScale} from '../initialSequentialScale';
// Object.assign(d3, d3hexbin);

function density(scaleType) {
  const colorClass = scaleType === 'sequential' ? _sequentialScale : _divergingScale;

  // set the dimensions and margins of the graph
  const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select(`${scaleType}Hexbin`)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // read data
  d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_for_density2d.csv').then(function (data) {
    // Add X axis
    const x = d3
      .scaleLinear()
      .domain([5, 20])
      .range([margin.left, width - margin.right]);
    svg.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(x));

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([5, 25])
      .range([height - margin.bottom, margin.top]);
    svg.append('g').call(d3.axisLeft(y));

    // Prepare a color palette
    const color = d3
      .scaleLinear()
      .domain([0, 1]) // Points per square pixel.
      .range(['white', '#69b3a2']);

    // compute the density data
    const densityData = d3
      .contourDensity()
      .x(function (d) {
        return x(d.x);
      })
      .y(function (d) {
        return y(d.y);
      })
      .size([width, height])
      .bandwidth(20)(data);

    // show the shape!
    svg
      .insert('g', 'g')
      .selectAll('path')
      .data(densityData)
      .enter()
      .append('path')
      .attr('d', d3.geoPath())
      .attr('fill', function (d) {
        return color(d.value);
      });
  });
}

module.exports = {
  density
};
