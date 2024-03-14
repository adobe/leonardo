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

function heatmap(scaleType) {
  const colorClass = scaleType === 'sequential' ? _sequentialScale : _divergingScale;
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 250 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select(`#${scaleType}Heatmap`)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Labels of row and columns
  var myGroups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  var myVars = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10'];

  // Build X scales and axis:
  var x = d3.scaleBand().range([0, width]).domain(myGroups).padding(0.01);
  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

  // Build X scales and axis:
  var y = d3.scaleBand().range([height, 0]).domain(myVars).padding(0.01);
  svg.append('g').call(d3.axisLeft(y));

  colorClass.swatches = 100;
  var myColor = colorClass.colorFunction;

  d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv').then(function (data) {
    svg
      .selectAll()
      .data(data, function (d) {
        return d.group + ':' + d.variable;
      })
      .join('rect')
      .attr('x', function (d) {
        return x(d.group);
      })
      .attr('y', function (d) {
        return y(d.variable);
      })
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', function (d) {
        return myColor(d.value).hex();
      });
  });
}

module.exports = {
  heatmap
};
