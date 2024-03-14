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
import {_divergingScale} from '../initialDivergingScale';
import {_sequentialScale} from '../initialSequentialScale';

function chord(scaleType, colors) {
  const colorClass = scaleType === 'sequential' ? _sequentialScale : _divergingScale;
  const originalSwatches = colorClass.swatches;
  colorClass.swatches = 4;

  const width = 250;
  const height = 250;
  const radius = 100;
  const outerRadius = radius + 10;

  // create the svg area
  var svg = d3
    .select(`#${scaleType}Chord`)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  // create a matrix
  var matrix = [
    [0, 5871, 8916, 2868],
    [1951, 0, 2060, 6171],
    [8010, 16145, 0, 8045],
    [1013, 990, 940, 0]
  ];

  // 4 groups, so create a vector of 4 colors
  if (!colors) colors = colorClass.colors;

  // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
  var res = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(matrix);

  // add the groups on the outer part of the circle
  svg
    .datum(res)
    .append('g')
    .selectAll('g')
    .data(function (d) {
      return d.groups;
    })
    .enter()
    .append('g')
    .append('path')
    .style('fill', function (d, i) {
      return colors[i];
    })
    .style('stroke', 'black')
    .attr('d', d3.arc().innerRadius(radius).outerRadius(outerRadius));

  // Add the links between groups
  svg
    .datum(res)
    .append('g')
    .selectAll('path')
    .data(function (d) {
      return d;
    })
    .enter()
    .append('path')
    .attr('d', d3.ribbon().radius(radius))
    .style('fill', function (d) {
      return colors[d.source.index];
    }) // colors depend on the source group. Change to target otherwise.
    .style('stroke', 'black');

  colorClass.swatches = originalSwatches;
}

module.exports = {
  chord
};
