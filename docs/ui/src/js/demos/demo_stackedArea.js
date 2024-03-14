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

function stackedArea(scaleType, colors) {
  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 30, bottom: 30, left: 55},
    width = 600 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select(`#${scaleType}StackedArea`)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Parse the Data
  d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv').then(function (data) {
    // List of groups = header of the csv files
    var keys = data.columns.slice(1);

    // Add X axis
    var x = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return d.year;
        })
      )
      .range([0, width]);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).ticks(5));

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 200000]).range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    // color palette
    var color = d3.scaleOrdinal().domain(keys).range(colors);

    //stack the data?
    var stackedData = d3.stack().keys(keys)(data);
    //console.log("This is the stack result: ", stackedData)

    // Show the areas
    svg
      .selectAll('mylayers')
      .data(stackedData)
      .enter()
      .append('path')
      .style('fill', function (d) {
        return color(d.key);
      })
      .attr(
        'd',
        d3
          .area()
          .x(function (d, i) {
            return x(d.data.year);
          })
          .y0(function (d) {
            return y(d[0]);
          })
          .y1(function (d) {
            return y(d[1]);
          })
      );
  });
}

module.exports = {
  stackedArea
};
