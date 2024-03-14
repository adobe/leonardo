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

import * as d3 from 'd3';

function polarColorPath(data, size, scaleType) {
  const chartWidth = size;
  const chartHeight = size;
  const dest = scaleType === 'theme' ? '#colorWheelPaths' : `#${scaleType}ColorWheelPaths`;
  const yMin = 0;
  const yMax = chartHeight; // might be wrong variable...

  let xy_chart = d3_xy_chart().width(chartWidth).height(chartHeight).xlabel('xLabel').ylabel('yLabel');

  let svg = d3.select(dest).append('svg').datum(data).call(xy_chart);

  function d3_xy_chart() {
    let width = chartWidth,
      height = chartHeight,
      xlabel = 'X Axis Label',
      ylabel = 'Y Axis Label';

    function chart(selection) {
      selection.each(function (datasets) {
        // Convert datasets to appropriate format
        const originalData = datasets;
        let dataX = [];
        let dataY = [];
        let dataColor = [];
        originalData.map((d) => {
          dataX.push(d.x);
          dataY.push(d.y);
          dataColor.push(d.color);
        });

        datasets = [
          {
            x: dataX,
            y: dataY,
            color: dataColor
          }
        ];

        let margin = {top: 0, right: 0, bottom: 0, left: 0};

        let innerwidth = width - margin.left - margin.right;
        let innerheight = height - margin.top - margin.bottom;

        let x_scale = d3.scaleLinear().range([0, innerwidth]).domain([yMin, yMax]);

        let y_scale = d3.scaleLinear().range([innerheight, 0]).domain([yMin, yMax]);

        let color = '#ffffff';

        let draw_line = d3
          .line()
          .curve(d3.curveBasis)
          .x(function (d) {
            return x_scale(d[0]);
          })
          .y(function (d) {
            return y_scale(d[1]);
          });

        let svg = d3
          .select(this)
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        let data_lines = svg
          .selectAll('.d3_xy_chart_line')
          .data(
            datasets.map(function (d) {
              return d3.zip(d.x, d.y);
            })
          )
          .enter()
          .append('g')
          .attr('class', 'd3_xy_chart_line');

        data_lines
          .append('path')
          .attr('class', 'line')
          .attr('d', function (d) {
            return draw_line(d);
          })
          .attr('stroke', color)
          .attr('filter', 'drop-shadow( 0 0 1px rgba(0, 0, 0, .5))');
      });
    }

    chart.width = function (value) {
      if (!arguments.length) return width;
      width = value;
      return chart;
    };

    chart.height = function (value) {
      if (!arguments.length) return height;
      height = value;
      return chart;
    };

    chart.xlabel = function (value) {
      if (!arguments.length) return xlabel;
      xlabel = value;
      return chart;
    };

    chart.ylabel = function (value) {
      if (!arguments.length) return ylabel;
      ylabel = value;
      return chart;
    };

    return chart;
  }
}

module.exports = {
  polarColorPath
};
