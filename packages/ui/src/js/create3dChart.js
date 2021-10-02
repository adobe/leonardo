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

import * as d3 from './d3';

import * as d33d from 'd3-3d';
Object.assign(d3, d33d);

import * as contrastColors from '@adobe/leonardo-contrast-colors';
import {_theme} from './initialTheme';
import {
  convertToCartesian,
  filterNaN
} from './utils'


function dragStart(){
  var coordinates= d3.mouse(this);
  var x = coordinates[0];
  var y = coordinates[1];
  mx = x;
  my = y;

  // mx = d3.event.x;
  // my = d3.event.y;
}

function dragged(){
  var coordinates= d3.mouse(this);
  var x = coordinates[0];
  var y = coordinates[1];

  mouseX = mouseX || 0;
  mouseY = mouseY || 0;
  beta = (x - mx + mouseX) * Math.PI / 600 ;
  alpha = (y - my + mouseY) * Math.PI / 600  * (-1);
  let data = [
    grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
    point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(colorPlot),
    yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
  ];
  processData(data, 0, colors);
}

function dragEnd(){
  var coordinates= d3.mouse(this);
  var x = coordinates[0];
  var y = coordinates[1];

  mouseX = x - mx + mouseX;
  mouseY = y - my + mouseY;
}

let dest = document.querySelector('.chart3D');

function create3dChartWidth() {
  let viewportWidth = window.innerWidth;
  let availableSpace = viewportWidth - 390 - 32;
  return availableSpace;
}

function create3dChartHeight() {
  let viewportHeight = window.innerHeight;
  let availableSpace =  viewportHeight - 58 - 44;
  return availableSpace;
}

const chartWidth = create3dChartWidth();
const chartHeight = create3dChartHeight();
let modelScale;
let yOrigin;
const viewportHeight = window.innerHeight;

modelScale = 40;
yOrigin = chartHeight/1.5;

let origin = [chartWidth/2, yOrigin], j = 10, scale = modelScale, scatter = [], yLine = [], xGrid = [], colorPlot = [], beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/10;
dest.style.width = chartWidth;
dest.style.height = chartHeight;

let svg = d3.select(dest)
  .call(
    d3.drag()
      .on('drag', dragged)
      .on('start', dragStart)
      .on('end', dragEnd)
    )
  .append('g');

let mx, my, mouseX, mouseY;

let grid3d = d3._3d()
    .shape('GRID', 20)
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

let point3d = d3._3d()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .z(function(d){ return d.z; })
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

let yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

function processData(data, tt, colors){
  /* ----------- GRID ----------- */

  let xGrid = svg.selectAll('path.grid').data(data[0], key);

  xGrid
    .enter()
    .append('path')
    .attr('class', '_3d grid')
    .merge(xGrid)
    .attr('d', grid3d.draw);

  xGrid.exit().remove();

  /* ----------- POINTS ----------- */

  let points = svg.selectAll('circle').data(data[1], key);

  points
    .enter()
    .append('circle')
    .attr('class', '_3d')
    .attr('opacity', 0)
    .attr('cx', posPointX)
    .attr('cy', posPointY)
    .merge(points)
    .transition().duration(tt)
    .attr('r', 5)
    .attr('fill', function(d) {
      let index = Number(d.id.replace('point_', '')) - 400;
      return colors[index];
    })
    .attr('opacity', 1)
    .attr('cx', posPointX)
    .attr('cy', posPointY);

  points.exit().remove();

  /* ----------- y-Scale ----------- */

  let yScale = svg.selectAll('path.yScale').data(data[2]);

  yScale
    .enter()
    .append('path')
    .attr('class', '_3d yScale')
    .merge(yScale)
    .attr('stroke', '#6e6e6e')
    .attr('stroke-width', .5)
    .attr('d', yScale3d.draw);

  yScale.exit().remove();

   /* ----------- y-Scale Text ----------- */

  let yText = svg.selectAll('text.yText').data(data[2][0]);

  yText
    .enter()
    .append('text')
    .attr('class', '_3d yText')
    .attr('dx', '.3em')
    .merge(yText)
    .each(function(d){
        d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
    })
    .attr('x', function(d){ return d.projected.x; })
    .attr('y', function(d){ return d.projected.y; });
    // .text(function(d){ return d[1]*10 <= 0 ? d[1]*-10 : ''; })
    // .text(function(d) {return d;})
    // .text('-');

  yText.exit().remove();

  d3.selectAll('._3d').sort(d3._3d().sort);
}

function posPointX(d){
  return d.projected.x;
}

function posPointY(d){
  return d.projected.y;
}


function init3dChart(colorData, colors) {
  let cnt = 0;
  let xGrid = [], scatter = [], yLine = [], colorPlot = [];
  let j = 10;
  // Taking J from origin argument...
  // z = -10; z < 10; z++ is what it's saying.
  for(let z = -j; z < j; z++){
    for(let x = -j; x < j; x++){
      xGrid.push([x, 1, z]);
      scatter.push({x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++});
    }
  }

  // Reset count so that the indexes match
  // with the colors being passed for the circles
  // cnt = 0;

  for(let j=0; j< colorData.length; j++) {
    let currentColor = colorData[j];
    for(let i=0; i< 100 ; i++) {
      colorPlot.push({x: currentColor.a[i]/10, y: currentColor.b[i]/10 * -1, z: currentColor.c[i]/10, id: 'point_' + cnt++});
    }
  }


  d3.range(-1, 11, 1).forEach(d => yLine.push([-j, -d, -j]));

  let data = [
    grid3d(xGrid),
    point3d(colorPlot),
    yScale3d([yLine])
  ];

  processData(data, 500, colors); // 500 is the duration
}


function create3dChart(color, mode = 'CAM02') {
  // Identify mode channels
  let data = [];
  let colors;
  // if no color defined, create all colors
  if(!color || color === undefined || color === null) {
    colors = [];
    _theme.colors.map((c) => {
      // Create data objects for each color scale
      let dataColors = c.backgroundColorScale;
      data.push(createColorData(dataColors, mode));
      dataColors.map((i) => {
        colors.push(i)
      })
    })
  } else {
    let dataColors = color.backgroundColorScale;
    data.push(createColorData(dataColors, mode));
    colors = [...dataColors];
  }

  init3dChart(data, colors);
}

function createColorData(color, mode) {
  const f = getChannelsAndFunction(mode);
  const method = (d) => d3[f.func](d);

  let dataA = color.map(function(d) {
    let channelValue = method(d)[f.c1];
    // Need to do some geometry for polar colorspaces
    if(mode === 'CAM02p' || mode === 'LCH' || mode === 'HSL' || mode === 'HSV' || mode === 'HSLuv') {
      let s = (mode === 'HSL' || mode === 'HSV') ? method(d)[f.c2] * 100 : method(d)[f.c2];
      let h = channelValue;
      return filterNaN(convertToCartesian(s, h).x);
    }
    else return filterNaN(channelValue);
  });
  let dataB = color.map(function(d) {
    let channelValue = method(d)[f.c3];
    if(mode === 'HSL' || mode === 'HSV') channelValue = channelValue * 100;
    return filterNaN(channelValue);
  });
  let dataC = color.map(function(d) {
    let channelValue = method(d)[f.c2];
    // Need to do some geometry for polar colorspaces
    if(mode === 'CAM02p' || mode === 'LCH' || mode === 'HSL' || mode === 'HSV' || mode === 'HSLuv') {
      let s = (mode === 'HSL' || mode === 'HSV') ? channelValue * 100 : channelValue;
      let h = method(d)[f.c1];
      return filterNaN(convertToCartesian(s, h).y);
    }
    return filterNaN(channelValue);
  });

  return {
    a: dataA,
    b: dataB,
    c: dataC
  }
}

function getChannelsAndFunction(mode) {
  let c1, c2, c3, func;
  if(mode === 'RGB') {
    func = 'rgb';
    c1 = 'r';
    c2 = 'g';
    c3 = 'b';
  }
  else if(mode === 'LAB') {
    func = 'lab';
    c1 = 'a';
    c2 = 'b';
    c3 = 'l';
  }
  else if(mode === 'LCH') {
    func = 'lch';
    c1 = 'h';
    c2 = 'c';
    c3 = 'l';
  }
  else if(mode === 'CAM02') {
    func = 'jab';
    c1 = 'a';
    c2 = 'b';
    c3 = 'J';
  }
  else if(mode === 'CAM02p') {
    func = 'jch';
    c1 = 'h';
    c2 = 'C';
    c3 = 'J';
  }
  else if(mode === 'HSL') {
    func = 'hsl';
    c1 = 'h';
    c2 = 's';
    c3 = 'l';
  }
  else if(mode === 'HSLuv') {
    func = 'hsluv';
    c1 = 'l';
    c2 = 'u';
    c3 = 'v';
  }
  else if(mode === 'HSV') {
    func = 'hsv';
    c1 = 'h';
    c2 = 's';
    c3 = 'v';
  }

  return {
    func: func,
    c1: c1,
    c2: c2,
    c3: c3
  }
}

// exports.init3dChart = init3dChart;
module.exports = {
  create3dChart
}
// exports.update3dChart = update3dChart;
// exports.updateCharts = updateCharts;
// exports.showCharts = showCharts;
// window.update3dChart = update3dChart;
// window.updateCharts = updateCharts;
// exports.showContrastChart = showContrastChart;
// exports.createChartHeader = createChartHeader;
// exports.createAllCharts = createAllCharts;
// exports.createChart = createChart;