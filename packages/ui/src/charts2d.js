/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import * as d3 from 'd3';
import * as c3 from 'c3';

const chartWidth = 250;
const chartHeight = 200;

const fillRange = (start, end) => {
  return Array(end - start + 1).fill().map((item, index) => start + index);
};

/** Create chart for contrast ratios */
function createContrastRatioChart(ratios) {
  // manually add pound symbol for easier ux when running this function
  let dest = `contrastChart`; 
  let dataXcontrast = fillRange(0, ratios.length-1);
  let data = [
    {
      x: dataXcontrast,
      y: ratios.map(function(d) {return parseFloat(d);}) // convert to number
    }
  ];
  console.log(data)
  let xLabel = 'Swatches';
  let yLabel = 'Contrast ratio';

  let container = document.getElementById(dest);
  let subhead = document.createElement('h6');
  subhead.className = 'spectrum-Subheading';
  subhead.innerText = 'Contrast ratios';
  container.appendChild(subhead);

  let xy_chart = d3_xy_chart()
    .width(chartWidth)
    .height(chartHeight)
    .xlabel(xLabel)
    .ylabel(yLabel);

  let svg = d3.select(dest).append("svg")
    .datum(data)
    .call(xy_chart);

  function d3_xy_chart() {
    let width = chartWidth,
        height = chartHeight,
        xlabel = "X Axis Label",
        ylabel = "Y Axis Label";

    function chart(selection) {
      selection.each(function(datasets) {
          // If no min/max defined, base on min/max from data
          if (yMin == undefined) { yMin = d3.min(datasets, function(d) { return d3.min(d.y); }) }
          if (yMax == undefined) { yMax = d3.max(datasets, function(d) { return d3.max(d.y); }) }
          //
          // Create the plot.
          //
          let margin = {top: 8, right: 8, bottom: 20, left: 32};
          let innerwidth = width - margin.left - margin.right;
          let innerheight = height - margin.top - margin.bottom;

          let x_scale = d3.scaleLinear()
            .range([0, innerwidth])
            .domain([ d3.min(datasets, function(d) { return d3.min(d.x); }),
                      d3.max(datasets, function(d) { return d3.max(d.x); }) ]) ;

          let y_scale = d3.scaleLinear()
            .range([innerheight, 0])
            .domain([ yMin, yMax ]);
                      // d3.min(datasets, function(d) { return d3.min(d.y); }),
                      // d3.max(datasets, function(d) { return d3.max(d.y); }) ]) ;

          let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(d3.range(datasets.length)) ;

          let x_axis = d3.axisBottom(x_scale);

          let y_axis = d3.axisLeft(y_scale);

          let x_grid = d3.axisBottom(x_scale)
            .tickSize(-innerheight)
            .tickFormat("") ;

          let y_grid = d3.axisLeft(y_scale)
            .tickSize(-innerwidth)
            .tickFormat("") ;

          let draw_line = d3.line()
            .curve(d3.curveLinear)
            .x(function(d) { return x_scale(d[0]); })
            .y(function(d) { return y_scale(d[1]); }) ;

          let svg = d3.select(this)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;

          svg.append("g")
            .attr("class", "x grid")
            .attr("transform", "translate(0," + innerheight + ")")
            .call(x_grid) ;

          svg.append("g")
            .attr("class", "y grid")
            .call(y_grid) ;

          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + innerheight + ")")
            .call(x_axis)
            .append("text")
            .attr("dy", "-.71em")
            .attr("x", innerwidth)
            .style("text-anchor", "end")
            .text(xlabel) ;

          svg.append("g")
            .attr("class", "y axis")
            .call(y_axis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .style("text-anchor", "end")
            .text(ylabel) ;

          let data_lines = svg.selectAll(".d3_xy_chart_line")
            .data(datasets.map(function(d) {return d3.zip(d.x, d.y);}))
            .enter().append("g")
            .attr("class", "d3_xy_chart_line") ;

          data_lines.append("path")
            .attr("class", "line")
            .attr("d", function(d) {return draw_line(d); })
            .attr("stroke", function(_, i) {return color_scale(i);}) ;

          data_lines.append("text")
            .datum(function(d, i) { return {name: datasets[i].label, final: d[d.length-1]}; })
            .attr("transform", function(d) {
                return ( "translate(" + x_scale(d.final[0]) + "," +
                         y_scale(d.final[1]) + ")" ) ; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .attr("fill", function(_, i) { return color_scale(i); })
            .text(function(d) { return d.name; }) ;
        }) ;
    }

    chart.width = function(value) {
      if (!arguments.length) return width;
      width = value;
      return chart;
    };

    chart.height = function(value) {
      if (!arguments.length) return height;
      height = value;
      return chart;
    };

    chart.xlabel = function(value) {
      if (!arguments.length) return xlabel ;
      xlabel = value ;
      return chart ;
    };

    chart.ylabel = function(value) {
      if (!arguments.length) return ylabel ;
      ylabel = value ;
      return chart ;
    };

    return chart;
  }
}

exports.createContrastRatioChart = createContrastRatioChart;
