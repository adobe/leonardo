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

const panelsOffset = 402; // should be 722 ...not 752

function createChart(data, yLabel, xLabel, dest, yMin, yMax, finiteScale = false, visColors, scaleType, stepped = false) {
  let chartWidth, chartHeight;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let adjustedHeight = (windowHeight - 300) / 2; // subtract heading, tabs height and padding from measurement
  let adjustedWidth;
  const maxWidth = 792;

  if (dest === '#interpolationChart' || dest === '#interpolationChart2' || dest === '#interpolationChart3') {
    let availableWidth = windowWidth - panelsOffset; // subtract panel width and padding from measurement
    let newMaxWidth = 548; //476
    adjustedWidth = availableWidth < newMaxWidth ? availableWidth : newMaxWidth;

    chartWidth = adjustedWidth;
    adjustedHeight = (windowHeight - 332) / 3;
    chartHeight = 178;
  }
  if (dest === `#${scaleType}InterpolationChart` || dest === `#${scaleType}InterpolationChart2` || dest === `#${scaleType}InterpolationChart3`) {
    let availableWidth = windowWidth - (388 + 34) - 8; // subtract panel width and padding from measurement
    let newMaxWidth = 476;
    adjustedWidth = availableWidth < newMaxWidth ? availableWidth : newMaxWidth;

    chartWidth = adjustedWidth;
    adjustedHeight = (windowHeight - 332) / 3;
    chartHeight = 196;
  }
  if (dest === `#sequentialRGBchart` || dest === '#divergingRGBchart') {
    chartWidth = 368;
    adjustedHeight = (windowHeight - 332) / 3;
    chartHeight = 196; // 196
  }
  if (dest === '#RGBchart') {
    chartWidth = 368;
    adjustedHeight = (windowHeight - 332) / 3;
    chartHeight = 216;
  }
  if (dest === '#contrastChart' || dest === '#detailContrastChart' || dest === '#luminosityChart' || dest === '#detailLightnessChart') {
    adjustedWidth = windowWidth - panelsOffset;
    chartWidth = adjustedWidth < maxWidth ? adjustedWidth : maxWidth;
  }
  if (dest === '#contrastChart' || dest === '#luminosityChart') {
    if (windowHeight < 900) chartHeight = windowHeight / 2 - 174;
    else chartHeight = 300;
  }
  if (dest === '#detailContrastChart' || dest === '#detailLightnessChart') {
    chartHeight = 240;
  }

  let xy_chart = d3_xy_chart().width(chartWidth).height(chartHeight).xlabel(xLabel).ylabel(yLabel);

  let svg = d3.select(dest).append('svg').datum(data).call(xy_chart);

  function d3_xy_chart() {
    let width = chartWidth,
      height = chartHeight,
      xlabel = 'X Axis Label',
      ylabel = 'Y Axis Label';

    function chart(selection) {
      selection.each(function (datasets) {
        // If no min/max defined, base on min/max from data
        if (yMin == undefined) {
          yMin = d3.min(datasets, function (d) {
            return d3.min(d.y);
          });
        }
        if (yMax == undefined) {
          yMax = d3.max(datasets, function (d) {
            return d3.max(d.y);
          });
        }
        //
        // Create the plot.
        //
        let marginBottom = 16;
        let marginLeft = dest === `#sequentialRGBchart` || dest === '#divergingRGBchart' || dest === '#RGBchart' ? 0 : 36;

        let margin = {
          top: 8,
          right: 8,
          bottom: marginBottom,
          left: marginLeft
        };

        let innerwidth = width - margin.left - margin.right;
        let innerheight = height - margin.top - margin.bottom;

        let x_scale = d3
          .scaleLinear()
          .range([0, innerwidth])
          .domain([
            d3.min(datasets, function (d) {
              return d3.min(d.x);
            }),
            d3.max(datasets, function (d) {
              return d3.max(d.x);
            })
          ]);

        let y_scale = d3.scaleLinear().range([innerheight, 0]).domain([yMin, yMax]);

        let color_scale;
        if (!visColors) {
          color_scale = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(datasets.length));
        } else {
          color_scale = () => {
            return visColors;
          };
        }
        let x_axis = d3.axisBottom(x_scale);

        let y_axis = d3.axisLeft(y_scale);

        let x_grid = d3.axisBottom(x_scale).tickSize(-innerheight).tickSizeOuter(0).tickFormat('');

        if (finiteScale) {
          x_axis.ticks(
            d3.max(datasets, function (d) {
              return d3.max(d.x);
            }) - 1
          );
          x_grid.ticks(
            d3.max(datasets, function (d) {
              return d3.max(d.x);
            }) - 1
          );
        }

        let y_grid = d3.axisLeft(y_scale).tickSize(-innerwidth).tickFormat('');

        let draw_line;
        if (stepped)
          draw_line = d3
            .line()
            .curve(d3.curveStep)
            .x(function (d) {
              return x_scale(d[0]);
            })
            .y(function (d) {
              return y_scale(d[1]);
            });
        else
          draw_line = d3
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

        // If dest is RGB chart, don't show ticks
        if (dest !== '#RGBchart' || dest !== `#${scaleType}RGBchart`) {
          svg
            .append('g')
            .attr('class', 'x grid')
            .attr('transform', 'translate(0,' + innerheight + ')')
            .call(x_grid);

          svg.append('g').attr('class', 'y grid').call(y_grid);

          svg
            .append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + innerheight + ')')
            .call(x_axis)
            .append('text')
            .attr('dy', '2.5em')
            .attr('x', innerwidth / 2)
            .style('text-anchor', 'middle')
            .text(xlabel);

          svg
            .append('g')
            .attr('class', 'y axis')
            .call(y_axis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('dy', '-2.25em')
            .attr('x', -innerheight / 2)
            .style('text-anchor', 'middle')
            .text(ylabel);
        } else {
          svg
            .append('g')
            .attr('class', 'x grid')
            .attr('transform', 'translate(0,' + innerheight + ')')
            .call(x_grid);

          svg.append('g').attr('class', 'y grid').call(y_grid);

          svg
            .append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + innerheight + ')')
            .call(x_axis);

          svg.append('g').attr('class', 'y axis').call(y_axis);
        }

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
          .attr('stroke', function (_, i) {
            return color_scale(i);
          });

        data_lines
          .append('text')
          .datum(function (d, i) {
            return {name: datasets[i].label, final: d[d.length - 1]};
          })
          .attr('transform', function (d) {
            return 'translate(' + x_scale(d.final[0]) + ',' + y_scale(d.final[1]) + ')';
          })
          .attr('x', 3)
          .attr('dy', '.35em')
          .attr('fill', function (_, i) {
            return color_scale(i);
          })
          .text(function (d) {
            return d.name;
          });
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

function createColorChart(data, yLabel, xLabel, dest, yMin, yMax, colors, scaleType) {
  let chartWidth, chartHeight;
  const windowWidth = window.innerWidth;

  let adjustedWidth, adjustedHeight;
  const maxWidth = 800;
  const minWidth = 200;
  const windowHeight = window.innerHeight;

  if (dest === `#${scaleType}InterpolationChart` || dest === `#${scaleType}InterpolationChart2` || dest === `#${scaleType}InterpolationChart3`) {
    let adjustedWidth = windowWidth - (388 + 34) - 8; // subtract panel width and padding from measurement
    let newMaxWidth = 476;
    adjustedWidth = adjustedWidth < newMaxWidth ? adjustedWidth : newMaxWidth;

    chartWidth = adjustedWidth;
    adjustedHeight = (windowHeight - 332) / 3;
    chartHeight = 196;
  } else {
    let newMaxWidth = 600;
    let adjustedWidth = windowWidth - 320 - panelsOffset - 48; // subtract panel width and padding from measurement
    let newAdjustedWidth = adjustedWidth < newMaxWidth ? adjustedWidth : newMaxWidth;

    let minHeight = 196;
    let dynamicHeight = window.innerHeight / 3 - 80; // subtract heading, tabs height and padding from measurement
    adjustedHeight = dynamicHeight < minHeight ? minHeight : dynamicHeight;

    chartWidth = newAdjustedWidth;
    chartHeight = adjustedHeight;
  }

  // Prevent negative values from being passed to the SVG attributes
  // by setting a min width for hte charts.
  if (chartWidth < minWidth) chartWidth = minWidth;

  let xy_chart = d3_xy_chart().width(chartWidth).height(chartHeight).xlabel(xLabel).ylabel(yLabel);

  let svg = d3.select(dest).append('svg').datum(data).call(xy_chart);

  function d3_xy_chart() {
    let width = chartWidth,
      height = chartHeight,
      xlabel = 'X Axis Label',
      ylabel = 'Y Axis Label';

    function chart(selection) {
      selection.each(function (datasets) {
        // If no min/max defined, base on min/max from data
        if (yMin == undefined) {
          yMin = d3.min(datasets, function (d) {
            return d3.min(d.y);
          });
        }
        if (yMax == undefined) {
          yMax = d3.max(datasets, function (d) {
            return d3.max(d.y);
          });
        }
        //
        // Create the plot.
        //
        let marginBottom;
        if (
          dest === '#interpolationChart' ||
          dest === '#interpolationChart2' ||
          dest === '#interpolationChart3' ||
          dest === `#${scaleType}InterpolationChart` ||
          dest === `#${scaleType}InterpolationChart2` ||
          dest === `#${scaleType}InterpolationChart3` ||
          dest === '#paletteInterpolationChart' ||
          dest === '#paletteInterpolationChart2' ||
          dest === '#paletteInterpolationChart3'
        )
          marginBottom = 16;
        else marginBottom = 36;

        let margin = {top: 8, right: 8, bottom: marginBottom, left: 36};

        let innerwidth = width - margin.left - margin.right;
        let innerheight = height - margin.top - margin.bottom;

        let x_scale = d3
          .scaleLinear()
          .range([0, innerwidth])
          .domain([
            d3.min(datasets, function (d) {
              return d3.min(d.x);
            }),
            d3.max(datasets, function (d) {
              return d3.max(d.x);
            })
          ]);

        let y_scale = d3.scaleLinear().range([innerheight, 0]).domain([yMin, yMax]);

        let color_scale = colors;

        let x_axis = d3.axisBottom(x_scale);

        let y_axis = d3.axisLeft(y_scale);

        let x_grid = d3.axisBottom(x_scale).tickSize(-innerheight).tickFormat('');

        let y_grid = d3.axisLeft(y_scale).tickSize(-innerwidth).tickFormat('');

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

        svg
          .append('g')
          .attr('class', 'x grid')
          .attr('transform', 'translate(0,' + innerheight + ')')
          .call(x_grid);

        svg.append('g').attr('class', 'y grid').call(y_grid);

        svg
          .append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + innerheight + ')')
          .call(x_axis);

        svg.append('g').attr('class', 'y axis').call(y_axis);

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
          .attr('stroke', function (_, i) {
            return color_scale[i];
          });

        data_lines
          .append('text')
          .datum(function (d, i) {
            return {name: datasets[i].label, final: d[d.length - 1]};
          })
          .attr('transform', function (d) {
            return 'translate(' + x_scale(d.final[0]) + ',' + y_scale(d.final[1]) + ')';
          })
          .attr('x', 3)
          .attr('dy', '.35em')
          .attr('fill', function (_, i) {
            return color_scale[i];
          })
          .text(function (d) {
            return d.name;
          });
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
  createChart,
  createColorChart
};
