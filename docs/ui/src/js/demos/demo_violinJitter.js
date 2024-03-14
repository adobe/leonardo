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

function violinJitter(scaleType) {
  const colorClass = scaleType === 'sequential' ? _sequentialScale : _divergingScale;

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 260 - margin.left - margin.right,
    height = 260 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select(`#${scaleType}ViolinJitter`)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Read the data and compute summary statistics for each specie
  d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv').then(function (data) {
    // Build and Show the Y scale
    var y = d3
      .scaleLinear()
      .domain([3.5, 8]) // Note that here the Y scale is set manually
      .range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
    var x = d3.scaleBand().range([0, width]).domain(['setosa', 'versicolor', 'virginica']).padding(0.05); // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

    // Features of the histogram
    var histogram = d3
      .histogram()
      .domain(y.domain())
      .thresholds(y.ticks(20)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
      .value((d) => d);

    // Compute the binning for each group of the dataset
    var sumstat = d3
      .nest() // nest function allows to group the calculation per level of a factor
      .key(function (d) {
        return d.Species;
      })
      .rollup(function (d) {
        // For each key..
        input = d.map(function (g) {
          return g.Sepal_Length;
        }); // Keep the variable called Sepal_Length
        bins = histogram(input); // And compute the binning on it.
        return bins;
      })
      .entries(data);

    // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
    var maxNum = 0;
    for (i in sumstat) {
      allBins = sumstat[i].value;
      lengths = allBins.map(function (a) {
        return a.length;
      });
      longuest = d3.max(lengths);
      if (longuest > maxNum) {
        maxNum = longuest;
      }
    }

    // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
    var xNum = d3.scaleLinear().range([0, x.bandwidth()]).domain([-maxNum, maxNum]);

    // Color scale for dots
    var myColor = d3.scaleSequential().interpolator(d3.interpolateInferno).domain([3, 9]);

    // Add the shape to this svg!
    svg
      .selectAll('myViolin')
      .data(sumstat)
      .enter() // So now we are working group per group
      .append('g')
      .attr('transform', function (d) {
        return 'translate(' + x(d.key) + ' ,0)';
      }) // Translation on the right to be at the group position
      .append('path')
      .datum(function (d) {
        return d.value;
      }) // So now we are working bin per bin
      .style('stroke', 'none')
      .style('fill', 'grey')
      .attr(
        'd',
        d3
          .area()
          .x0(xNum(0))
          .x1(function (d) {
            return xNum(d.length);
          })
          .y(function (d) {
            return y(d.x0);
          })
          .curve(d3.curveCatmullRom) // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
      );

    // Add individual points with jitter
    var jitterWidth = 40;
    svg
      .selectAll('indPoints')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', function (d) {
        return x(d.Species) + x.bandwidth() / 2 - Math.random() * jitterWidth;
      })
      .attr('cy', function (d) {
        return y(d.Sepal_Length);
      })
      .attr('r', 5)
      .style('fill', function (d) {
        return myColor(d.Sepal_Length);
      })
      .attr('stroke', 'white');
  });
}

module.exports = {
  violinJitter
};
