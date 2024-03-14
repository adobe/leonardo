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

function scatter(scaleType) {
  const colorClass = scaleType === 'sequential' ? _sequentialScale : _divergingScale;

  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 30, bottom: 30, left: 60},
    width = 350 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  var myColor = colorClass.colorFunction;

  // append the svg object to the body of the page
  var svg = d3
    .select(`#${scaleType}Scatter`)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  //Read the data
  d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv').then(function (data) {
    // Add X axis
    var x = d3.scaleLinear().domain([0, 4000]).range([0, width]);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 500000]).range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    // Add dots
    svg
      .append('g')
      .selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', function (d) {
        return x(d.GrLivArea);
      })
      .attr('cy', function (d) {
        return y(d.SalePrice);
      })
      .attr('r', 1.5)
      .style('fill', function (d) {
        return myColor(d.SalePrice / 5000);
      });
  });
}

module.exports = {
  scatter
};
