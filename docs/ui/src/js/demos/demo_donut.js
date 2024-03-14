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

function donut(scaleType, colors) {
  // set the dimensions and margins of the graph
  var width = 250;
  let height = 250;
  let margin = 80;

  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  var radius = Math.min(width, height) / 2 - margin;

  // append the svg object to the div called 'my_dataviz'
  var svg = d3
    .select(`#${scaleType}Donut`)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  // Create dummy data
  var data = {
    a: 9,
    b: 18,
    c: 24,
    d: 8,
    e: 7,
    f: 5,
    g: 2,
    h: 3,
    i: 3
  };

  // set the color scale
  var color = d3.scaleOrdinal().domain(data).range(colors);

  // Compute the position of each group on the pie:
  var pie = d3.pie().value(function (d) {
    return d.value;
  });
  var data_ready = pie(d3.entries(data));

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll('whatever')
    .data(data_ready)
    .enter()
    .append('path')
    .attr(
      'd',
      d3
        .arc()
        .innerRadius(100) // This is the size of the donut hole
        .outerRadius(radius)
    )
    .attr('fill', function (d) {
      return color(d.data.key);
    })
    .attr('stroke', 'black')
    .style('stroke-width', '1px');
}

module.exports = {
  donut
};
