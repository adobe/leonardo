/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import * as d3 from 'd3';
import {getSmallestWindowDimension} from './colorWheel';

function createChart(data, yLabel, xLabel, dest, yMin, yMax, finiteScale = false, visColors, scaleType) {
  let chartWidth, chartHeight;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let adjustedHeight = (windowHeight - 300) / 2;// subtract heading, tabs height and padding from measurement
  const maxWidth = 792;

  if(
      dest === '#interpolationChart' || 
      dest === '#interpolationChart2' || 
      dest === '#interpolationChart3' 
    ) {
    let adjustedWidth = windowWidth - (388 + 34) - 8;// subtract panel width and padding from measurement
    adjustedWidth = (adjustedWidth < maxWidth) ? adjustedWidth : maxWidth;

    chartWidth = adjustedWidth;
    adjustedHeight = (windowHeight - 332) / 3;
    chartHeight = (adjustedHeight < 170) ? 170 : adjustedHeight;
  }
  if(
    dest === `#${scaleType}InterpolationChart` ||
    dest === `#${scaleType}InterpolationChart2` ||
    dest === `#${scaleType}InterpolationChart3`
  ) {
    let adjustedWidth = windowWidth - (388 + 34) - 8;// subtract panel width and padding from measurement
    let newMaxWidth = 476;
    adjustedWidth = (adjustedWidth < newMaxWidth) ? adjustedWidth : newMaxWidth;

    chartWidth = adjustedWidth;
    adjustedHeight = (windowHeight - 332) / 3;
    // chartHeight = (adjustedHeight < 170) ? 170 : adjustedHeight;
    chartHeight = 196;
  }
  if(
    dest === '#paletteInterpolationChart' ||
    dest === '#paletteInterpolationChart2' ||
    dest === '#paletteInterpolationChart3'
  ) {
    let adjustedWidth = windowWidth - (388 + 32) - 8;// subtract panel width and padding from measurement
    adjustedWidth = (adjustedWidth < maxWidth) ? adjustedWidth : maxWidth;

    chartWidth = adjustedWidth;
    chartHeight = (windowHeight - 148) / 2;
  }
  if(
    dest === '#RGBchart'
  ) {
    let adjustedWidth = windowWidth - (388 + 32) - 8;// subtract panel width and padding from measurement
    adjustedWidth = (adjustedWidth < maxWidth) ? adjustedWidth : maxWidth;

    chartWidth = adjustedWidth;
    adjustedHeight = adjustedHeight * 1.5;
    chartHeight = (adjustedHeight < 340) ? 340 : adjustedHeight;
  } 
  if(
    dest === `#sequentialRGBchart` ||
    dest === '#divergingRGBchart'
  ) {
    chartWidth = 308;
    adjustedHeight = (windowHeight - 332) / 3;
    // chartHeight = (adjustedHeight < 170) ? 170 : adjustedHeight;
    chartHeight = 196;

  }
  if(dest === '#contrastChart' || dest === '#luminosityChart') {
    chartWidth = 356;
    chartHeight = 264;
  }


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
          let marginBottom;
          if(
            dest === '#interpolationChart' || 
            dest === '#interpolationChart2' || 
            dest === '#interpolationChart3' ||
            dest === `#${scaleType}InterpolationChart` ||
            dest === `#${scaleType}InterpolationChart2` ||
            dest === `#${scaleType}InterpolationChart3` ||
            dest === '#paletteInterpolationChart' ||
            dest === '#paletteInterpolationChart2' ||
            dest === '#paletteInterpolationChart3' ||
            dest === `#sequentialRGBchart` || dest === '#divergingRGBchart'
          ) marginBottom = 16;
          else marginBottom = 36;

          let marginLeft = (dest === `#sequentialRGBchart` || dest === '#divergingRGBchart') ? 0 : 36;

          let margin = {top: 8, right: 8, bottom: marginBottom, left: marginLeft};

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


          let color_scale;
          if(!visColors) { 
            color_scale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(d3.range(datasets.length)) ;
          } 
          // if(scaleType === 'diverging') {
          //   const fillRange = (start, end) => {
          //     return Array(end - start).fill().map((item, index) => start + index);
          //   };
          //   let domains = fillRange(1, colors.length);
          //   color_scale = d3.scaleThreshold()
          //     .range(visColors)
          //     .domain(domains);
          // }
          else {
            color_scale = () => { return visColors };
          }
          let x_axis = d3.axisBottom(x_scale);

          let y_axis = d3.axisLeft(y_scale);

          let x_grid = d3.axisBottom(x_scale)
            .tickSize(-innerheight)
            .tickSizeOuter(0)
            .tickFormat("") ;

            if(finiteScale) {
              x_axis.ticks(d3.max(datasets, function(d) { return d3.max(d.x); }) - 1);
              x_grid.ticks(d3.max(datasets, function(d) { return d3.max(d.x); }) - 1);
            }
  

          let y_grid = d3.axisLeft(y_scale)
            .tickSize(-innerwidth)
            .tickFormat("") ;

          let draw_line = d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x_scale(d[0]); })
            .y(function(d) { return y_scale(d[1]); }) ;

          let svg = d3.select(this)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;

          // If dest is RGB chart, don't show ticks
          if(dest !== '#RGBchart' || dest !== `#${scaleType}RGBchart`) {
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
              // .attr("dy", "-.71em")
              .attr("dy", "2.5em")
              .attr("x", (innerwidth/2))
              .style("text-anchor", "middle")
              .text(xlabel) ;

            svg.append("g")
              .attr("class", "y axis")
              .call(y_axis)
              .append("text")
              .attr("transform", "rotate(-90)")
              // .attr("y", 6)
              .attr("dy", "-2.25em")
              .attr('x', (-innerheight/2))
              .style("text-anchor", "middle")
              .text(ylabel) ;
          } 
          else {
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
              // .append("text")
              // .attr("dy", "-.71em")
              // .attr("dy", "2.75em")
              // .attr("x", (innerwidth/2))
              // .style("text-anchor", "middle")
              // .text(xlabel) ;

            svg.append("g")
              .attr("class", "y axis")
              .call(y_axis)
              // .append("text")
              // .attr("transform", "rotate(-90)")
              // .attr("y", 6)
              // .attr("dy", "-2em")
              // .attr('x', (-innerheight/2))
              // .style("text-anchor", "middle")
              // .text(ylabel) ;
          }


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


function createColorChart(data, yLabel, xLabel, dest, yMin, yMax, colors, scaleType) {
  let chartWidth, chartHeight;
  const windowWidth = window.innerWidth;

  // let adjustedWidth = smallestWidth / 2 - 16;
  
  let adjustedWidth, adjustedHeight;
  const maxWidth = 800;

  if(      
    dest === `#${scaleType}InterpolationChart` ||
    dest === `#${scaleType}InterpolationChart2` ||
    dest === `#${scaleType}InterpolationChart3`
  ) {
    adjustedWidth = windowWidth - (388 + 34);// subtract panel width and padding from measurement
    adjustedWidth = (adjustedWidth < maxWidth) ? adjustedWidth : maxWidth;
    adjustedHeight = (window.innerHeight - 300) / 2;// subtract heading, tabs height and padding from measurement

    chartWidth = adjustedWidth;
    chartHeight = adjustedHeight - 116;
  } else {
    // let adjustedWidth = windowWidth - (388 + 40);// subtract panel width and padding from measurement
    // adjustedWidth = (adjustedWidth < maxWidth) ? adjustedWidth : maxWidth;
    let width = window.innerWidth - 386 - 34;
    adjustedWidth = (width < maxWidth) ? width : maxWidth;
    adjustedHeight = (window.innerHeight / 3) - 80;// subtract heading, tabs height and padding from measurement
    
    chartWidth = adjustedWidth;
    chartHeight = adjustedHeight;
  }

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
        let marginBottom;
        if(
          dest === '#interpolationChart' || 
          dest === '#interpolationChart2' || 
          dest === '#interpolationChart3' ||
          dest === `#${scaleType}InterpolationChart` ||
          dest === `#${scaleType}InterpolationChart2` ||
          dest === `#${scaleType}InterpolationChart3` ||
          dest === '#paletteInterpolationChart' ||
          dest === '#paletteInterpolationChart2' ||
          dest === '#paletteInterpolationChart3'        
        ) marginBottom = 16;
        else marginBottom = 36;

        let margin = {top: 8, right: 8, bottom: marginBottom, left: 36};

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

        let color_scale = colors

        let x_axis = d3.axisBottom(x_scale);

        let y_axis = d3.axisLeft(y_scale);

        let x_grid = d3.axisBottom(x_scale)
          .tickSize(-innerheight)
          .tickFormat("") ;

        let y_grid = d3.axisLeft(y_scale)
          .tickSize(-innerwidth)
          .tickFormat("") ;

        let draw_line = d3.line()
          .curve(d3.curveBasis)
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

          svg.append("g")
            .attr("class", "y axis")
            .call(y_axis)

          let data_lines = svg.selectAll(".d3_xy_chart_line")
            .data(datasets.map(function(d) {return d3.zip(d.x, d.y);}))
            .enter().append("g")
            .attr("class", "d3_xy_chart_line") ;

          data_lines.append("path")
            .attr("class", "line")
            .attr("d", function(d) {return draw_line(d); })
            .attr("stroke", function(_, i) {return color_scale[i];}) ;

          data_lines.append("text")
            .datum(function(d, i) { return {name: datasets[i].label, final: d[d.length-1]}; })
            .attr("transform", function(d) {
                return ( "translate(" + x_scale(d.final[0]) + "," +
                         y_scale(d.final[1]) + ")" ) ; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .attr("fill", function(_, i) { return color_scale[i]; })
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

module.exports = {
  createChart,
  createColorChart
};