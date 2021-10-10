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

import d3 from './d3';
import {filterNaN} from './utils';
import {getAllColorKeys} from './getThemeData';
import {_theme} from './initialTheme';
import {createHtmlElement, createSvgElement} from './createHtmlElement';
import {create3dChart} from './create3dChart';
import {
  convertToCartesian,
  removeElementsByClass
} from './utils';

function updateColorDots(mode, scaleType) {
  // Create dots for color wheel
  if(!mode) {
    let colorDotsModeDropdown = (scaleType === 'theme') ? document.getElementById('colorDotsMode') : document.getElementById(`${scaleType}ColorDotsMode`);
    let colorDotsMode = colorDotsModeDropdown.value;
    mode = colorDotsMode;
  }
  let colorWheelLightnessDropdown = (scaleType === 'theme') ? document.getElementById('colorWheelLightness') : document.getElementById(`${scaleType}ColorWheelLightness`);
  let colorWheelLightness = colorWheelLightnessDropdown.value;
  let colorWheelModeDropdown = (scaleType === 'theme') ? document.getElementById('chartsMode') : document.getElementById(`${scaleType}ChartsMode`);
  let colorWheelMode = colorWheelModeDropdown.value

  let allColors;
  if(mode === 'colorKeys' && scaleType === 'theme') allColors = getAllColorKeys();
  if(mode === 'colorScale' && scaleType === 'theme') {
    allColors = [];
    _theme.colors.forEach((color) => { allColors.push(color.backgroundColorScale[colorWheelLightness])});
  } else {
    // just show all key colors.
    // would the curve drawing happen here?
  }
  
  let arr = getConvertedColorCoodrindates(allColors, colorWheelMode);
  createColorWheelDots(arr);
}

function getColorWheelSize() {
  // let dynamicSize = getSmallestWindowDimension() - 200;
  let minSize = 200;
  let maxSize = 500;
  // let colorWheelSize = (dynamicSize > maxSize) ? maxSize : ((dynamicSize < minSize) ? minSize : dynamicSize);
  let windowDimensions = getSmallestWindowDimension();
  let colorWheelSize = (windowDimensions > maxSize) ? maxSize : ((windowDimensions < minSize) ? minSize : windowDimensions);
  return colorWheelSize;
}

function getConvertedColorCoodrindates(colorValues, mode) {
  // Cant seem to use the constant colorWheelSize or dotSize here, so we calculate it
  let size = getColorWheelSize();
  let dotSize = 16;
  let defaultAchromaticDotOffset = (size / 2) - (dotSize / 2);

  let arr = [];
  colorValues.map(color => {
    let c,h; 
    if(mode === 'HSL' || mode === 'RGB') {
      c = d3.hsl(color).s * 100;
      h = d3.hsl(color).h
    } 
    if(mode === 'HSLuv') {
      c = d3.hsluv(color).u;
      h = d3.hsluv(color).l
    }
    if(mode === 'HSV') {
      c = d3.hsv(color).s * 100;
      h = d3.hsv(color).h
    }
    if(mode === 'LCH' || mode === 'LAB') {
      c = d3.hcl(color).c;
      h = d3.hcl(color).h
    }
    if(mode === 'CAM02p' || mode === 'CAM02') {
      c = d3.jch(color).C;
      h = d3.jch(color).h
    }
    
    const conversion = convertToCartesian(c, h, 'clamp');
    let newX = shiftValue(conversion.x, size, dotSize);
    let newY = shiftValue(conversion.y, size, dotSize);

    if(isNaN(newX)) newX = defaultAchromaticDotOffset;
    if(isNaN(newY)) newY = defaultAchromaticDotOffset;

    arr.push({
      x: newX,
      y: newY,
      color: color
    });
  })
  return arr;
}


function createColorWheelDots(arr) {
  removeElementsByClass('colorDot');
  const c = document.getElementById("colorWheelCanvas");
  const existingLines = document.getElementById('colorWheelLines');
  if(existingLines) existingLines.parentNode.removeChild(existingLines);

  let size = getColorWheelSize();
  let center = (size / 2);

  const svg = createSvgElement({
    element: 'svg',
    id: 'colorWheelLines',
    attributes: {
      height: size,
      width: size
    },
    appendTo: 'colorWheel'
  })

  arr.map(obj => {
    createHtmlElement({
      element: 'div',
      className: 'colorDot',
      styles: {
        backgroundColor: obj.color,
        top: obj.y + 'px',
        left: obj.x + 'px'
      },
      appendTo: 'colorWheel'
    })

    // Create harmony lines
    createSvgElement({
      element: 'line',
      className: 'colorDot-HarmonyLine',
      attributes: {
        height: size,
        width: size,
        x1: center,
        y1: center,
        x2: obj.x + 10,
        y2: obj.y + 10,
      },
      styles: {
        stroke: 'rgb(255, 255, 255)',
        strokeWidth: 2.5,
        strokeLinecap: "round",
        filter: 'drop-shadow( 0 0 1px rgba(0, 0, 0, .5))'
      },
      appendTo: 'colorWheelLines'
    });
  })
}

function createColorWheel(mode, lightness, scaleType) {   
  console.log(scaleType) 
  const size = getColorWheelSize();
  const wheelId = (scaleType === 'theme') ? '#colorWheel' : `${scaleType}ColorWheel`;
  const canvasId = (scaleType === 'theme') ? 'colorWheelCanvas' : `${scaleType}ColorWheelCanvas`;

  console.log(document.getElementById(wheelId.replace('#', '')))
  let container = d3.select(wheelId);
  let canvas = container.append("canvas")
    .attr("height", size)
    .attr("width", size)
    .attr("id", canvasId);
  const context = canvas.node().getContext('2d');
  canvas.id = canvasId;

  var x = size / 2;
  var y = size / 2;
  var radius = size / 2;
  var counterClockwise = false;

  for(var angle=0; angle<=360; angle+=1){
    var shift = 0;
    var startAngle = (angle+shift-2)*Math.PI/180;
    var endAngle = (angle+shift) * Math.PI/180;
    context.beginPath();
    context.moveTo(x, y);
    context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
    context.closePath();
    var gradient = context.createRadialGradient(x, y, 0, x, y, radius);

    let colorStartHsl, colorMid1Hsl, colorMid2Hsl, colorMid3Hsl, colorStopHsl;

    if(mode === 'HSL' || mode === 'RGB') {
      let colorStart = d3.hsl(angle, 0, lightness/100);
      let colorMid1 = d3.hsl(angle, 0.25, lightness/100);
      let colorMid2 = d3.hsl(angle, 0.5, lightness/100);
      let colorMid3 = d3.hsl(angle, 0.75, lightness/100);
      let colorStop = d3.hsl(angle, 1, lightness/100);
      colorStartHsl = d3.hsl(colorStart).toString();
      colorMid1Hsl = d3.hsl(colorMid1).toString();
      colorMid2Hsl = d3.hsl(colorMid2).toString();
      colorMid3Hsl = d3.hsl(colorMid3).toString();
      colorStopHsl = d3.hsl(colorStop).toString();
    }
    else if(mode === 'HSV') {
      let colorStart = d3.hsv(angle, 0, lightness/100);
      let colorMid1 = d3.hsv(angle, 0.25, lightness/100);
      let colorMid2 = d3.hsv(angle, 0.5, lightness/100);
      let colorMid3 = d3.hsv(angle, 0.75, lightness/100);
      let colorStop = d3.hsv(angle, 1, lightness/100);
      colorStartHsl = d3.hsl(colorStart).toString();
      colorMid1Hsl = d3.hsl(colorMid1).toString();
      colorMid2Hsl = d3.hsl(colorMid2).toString();
      colorMid3Hsl = d3.hsl(colorMid3).toString();
      colorStopHsl = d3.hsl(colorStop).toString();
    }
    else if(mode === 'LCH' || mode === 'LAB') {
      let colorStart = d3.hcl(angle, 0, lightness);
      let colorMid1 = d3.hcl(angle, 25, lightness);
      let colorMid2 = d3.hcl(angle, 50, lightness);
      let colorMid3 = d3.hcl(angle, 75, lightness);
      let colorStop = d3.hcl(angle, 100, lightness);
      colorStartHsl = d3.hsl(colorStart).toString();
      colorMid1Hsl = d3.hsl(colorMid1).toString();
      colorMid2Hsl = d3.hsl(colorMid2).toString();
      colorMid3Hsl = d3.hsl(colorMid3).toString();
      colorStopHsl = d3.hsl(colorStop).toString();
    }
    else if(mode === 'HSLuv') {
      let colorStart = d3.hsluv(angle, 0, lightness);
      let colorMid1 = d3.hsluv(angle, 25, lightness);
      let colorMid2 = d3.hsluv(angle, 50, lightness);
      let colorMid3 = d3.hsluv(angle, 75, lightness);
      let colorStop = d3.hsluv(angle, 100, lightness);
      
      colorStartHsl = d3.hsl(colorStart).toString();
      colorMid1Hsl = d3.hsl(colorMid1).toString();
      colorMid2Hsl = d3.hsl(colorMid2).toString();
      colorMid3Hsl = d3.hsl(colorMid3).toString();
      colorStopHsl = d3.hsl(colorStop).toString();
    }
    else if(mode === 'CAM02' || mode === 'CAM02p') {
      let colorStart = d3.jch(lightness, 0, angle); 
      let colorMid1 = d3.jch(lightness, 25, angle);
      let colorMid2 = d3.jch(lightness, 50, angle);
      let colorMid3 = d3.jch(lightness, 75, angle);
      let colorStop = d3.jch(lightness, 100, angle);

      colorStartHsl = d3.hsl(colorStart).toString();
      colorMid1Hsl = d3.hsl(colorMid1).toString();
      colorMid2Hsl = d3.hsl(colorMid2).toString();
      colorMid3Hsl = d3.hsl(colorMid3).toString(); 
      colorStopHsl = d3.hsl(colorStop).toString();
    }

    gradient.addColorStop(0, colorStartHsl);
    gradient.addColorStop(0.25, colorMid1Hsl);
    gradient.addColorStop(0.5, colorMid2Hsl);
    gradient.addColorStop(0.75, colorMid3Hsl);
    gradient.addColorStop(1, colorStopHsl);

    context.fillStyle = gradient;
    context.fill();
  }
}


function getSmallestWindowDimension() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let adjustedWidth = windowWidth - 386;// subtract panel width and padding from measurement
  // let adjustedHeight = ((window.innerHeight - 232) / 2) - 64;// subtract heading, tabs height and padding from measurement
  let adjustedHeight = window.innerHeight - 234;// subtract heading, tabs height and padding from measurement
  let smallestDimension = (adjustedWidth < adjustedHeight) ? adjustedWidth : adjustedHeight;
  return smallestDimension;
}
getSmallestWindowDimension();


function shiftValue(v, colorWheelSize, dotSize) {
  v = filterNaN(v);

  const midPoint = colorWheelSize /2;
  const scaledValue = (v/100) * midPoint;

  const shiftedValue = scaledValue + midPoint;
  // subtract half of the width of the dots to centrally position it.
  const centeredVal = shiftedValue - (dotSize/2) - 2;
  return centeredVal;
}

function updateColorWheel(mode, lightness, dots, dotsMode, scaleType) {
  const canvasId = (scaleType === 'theme') ? 'colorWheelCanvas' : `${scaleType}ColorWheelCanvas`;
  let canvas = document.getElementById(canvasId);
  if(canvas) {
    canvas.parentNode.removeChild(canvas);
  }
  createColorWheel(mode, lightness, scaleType);
  updateColorDots(dotsMode, scaleType)
}


const colorWheelMode = document.getElementById('chartsMode');
const colorDotsMode = document.getElementById('colorDotsMode');
const colorWheelLightness = document.getElementById('colorWheelLightness');

// Not the best way to do this. Basically relying on the id's defined globally above
// as elements present only in the Theme html file. So all these event listeners
// are only applied to the theme... eventually I need these on every page with 
// a color wheel, but the functions are dependant upon a scaleType parameter,
// which until now I was able to easily, manually pass. Not sure how to 
// define this aside from manually declaring each specific ID.
if(colorWheelMode) {
  updateColorWheel(colorWheelMode.value, colorWheelLightness.value, true, null, 'theme');

  colorWheelMode.addEventListener('input', function(e) { 
    let mode = e.target.value;
    let colorDotsModeDropdown = document.getElementById('colorDotsMode');
    let dotsMode = colorDotsModeDropdown.value;
  
    updateColorWheel(mode, colorWheelLightness.value, true, 'theme');
    create3dChart(null, mode)
  });

  window.onresize = () => {
    updateColorWheel(colorWheelMode.value, colorWheelLightness.value, true, 'theme')
  };
  
  colorWheelLightness.addEventListener('input', function(e) { 
    let lightness = e.target.value;
    let colorDotsModeDropdown = document.getElementById('colorDotsMode');
    let dotsMode = colorDotsModeDropdown.value;
    let showDots = (dotsMode === 'colorScale') ? true : false;
  
    updateColorWheel(colorWheelMode.value, lightness, showDots, dotsMode, 'theme');
  });
  
  colorDotsMode.addEventListener('input', function(e) {
    let mode = e.target.value;
  
    updateColorDots(mode, 'theme');
  });
}

module.exports = {
  updateColorDots,
  getColorWheelSize,
  getConvertedColorCoodrindates,
  createColorWheelDots,
  createColorWheel,
  getSmallestWindowDimension,
  shiftValue,
  updateColorWheel
}