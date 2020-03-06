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

import '@spectrum-css/vars/dist/spectrum-global.css';
import '@spectrum-css/vars/dist/spectrum-medium.css';
import '@spectrum-css/vars/dist/spectrum-light.css';

import '@spectrum-css/page/dist/index-vars.css';
import '@spectrum-css/typography/dist/index-vars.css';
import '@spectrum-css/icon/dist/index-vars.css';
import '@spectrum-css/link/dist/index-vars.css';
import '@spectrum-css/alert/dist/index-vars.css';
import '@spectrum-css/radio/dist/index-vars.css';
import '@spectrum-css/dialog/dist/index-vars.css';
import '@spectrum-css/button/dist/index-vars.css';
import '@spectrum-css/fieldgroup/dist/index-vars.css';
import '@spectrum-css/textfield/dist/index-vars.css';
import '@spectrum-css/dropdown/dist/index-vars.css';
import '@spectrum-css/fieldlabel/dist/index-vars.css';
import '@spectrum-css/checkbox/dist/index-vars.css';
import '@spectrum-css/buttongroup/dist/index-vars.css';
import '@spectrum-css/tooltip/dist/index-vars.css';
import '@spectrum-css/slider/dist/index-vars.css';
import '@spectrum-css/tabs/dist/index-vars.css';
import '@spectrum-css/illustratedmessage/dist/index-vars.css';

import './scss/colorinputs.scss';
import './scss/charts.scss';
import './scss/style.scss';

import '@adobe/focus-ring-polyfill';

import * as contrastColors from '@adobe/leonardo-contrast-colors';

// expose functions so they can be ran in the console
window.createScale = contrastColors.createScale;
window.luminance = contrastColors.luminance;
window.contrast = contrastColors.contrast;
window.generateContrastColors = contrastColors.generateContrastColors;
window.contrastColors = contrastColors;
window.generateBaseScale = contrastColors.generateBaseScale;
window.generateAdaptiveTheme = contrastColors.generateAdaptiveTheme;

import loadIcons from 'loadicons';
loadIcons('./spectrum-css-icons.svg');
loadIcons('./spectrum-icons.svg');

import ClipboardJS from 'clipboard';

new ClipboardJS('.copyButton');
new ClipboardJS('.colorOutputBlock');

import * as d3 from 'd3';

// Import d3 plugins and add them to the d3 namespace
import * as d3cam02 from 'd3-cam02';
import * as d3hsluv from 'd3-hsluv';
import * as d3hsv from 'd3-hsv';
import * as d33d from 'd3-3d';
Object.assign(d3, d3cam02, d3hsluv, d3hsv, d33d);

import * as charts from './charts.js';
import * as chartData from './data.js';

var bgFieldInput = document.getElementById('bgField');
var background = bgFieldInput.value;
// var colorBlock = document.getElementById('color');
var demoHeading = document.getElementById('demoHeading');
var demoWrapper = document.getElementById('demoWrapper');
var userColorBlock = document.getElementById('userColor');
var userBgBlock = document.getElementById('userBg');
var ratioInput = document.getElementById('ratio');
var colorOutputField = document.getElementById('colorOutput');

var colorspace = document.getElementById('mode');
let ratioFields = document.getElementsByClassName('ratio-Field');

window.ratioInputs = [];
let newColors;
let pathName;
window.colorArgs = null;

bgFieldInput.onchange = throttle(colorInput, 50);

function debounce(func, wait, immediate) {
  var timerId = null;

  return function debounced() {
    var context = this;
    var args = arguments;
    clearTimeout(timerId);

    if (immediate && !timerId) {
      func.apply(context, args);
    }

    timerId = setTimeout(function () {
      timerId = null;
      if (!immediate) func.apply(context, args);
    }, wait);
  };
}

function throttle(func, wait) {
  var timerId, lastRan;

  return function throttled() {
    var context = this;
    var args = arguments;

    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(timerId);
      timerId = setTimeout(function () {
        if ((Date.now() - lastRan) >= wait) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, (wait - (Date.now() - lastRan)) || 0);
    }
  };
}
exports.throttle = throttle;

function paramSetup() {
  colorspaceOptions();
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));
  pathName = url.pathname;

  // // If parameters exist, use parameter; else use default html input values
  if(params.has('colorKeys')) {
    let cr = params.get('colorKeys');
    let crs = cr.split(',');

    if(crs[0] == 0) {
      crs = ['#707070'];
    }

    for (let i=0; i<crs.length; i++) {
      addColor(crs[i]);
    }
  }
  if(params.has('base')) {
    document.getElementById('bgField').value = "#" + params.get('base');
  }
  if(params.has('ratios')) {
    // transform parameter values into array of numbers
    let rat = params.get('ratios');
    let ratios = rat.split(',');
    ratios = ratios.map(Number);

    if(ratios[0] == 0) { // if no parameter value, default to [3, 4.5]
      ratios = [3, 4.5];
    } else { }

    for(let i=0; i<ratios.length; i++) {
      addRatio(ratios[i]);
    }
  }
  if(params.has('mode')) {
    document.querySelector('select[name="mode"]').value = params.get('mode');
  }
  if (params.has('smooth')) {
    let checkSmooth = document.getElementById('checkSmooth');
    let bool = params.get('smooth');

    if(bool === 'true') {
      checkSmooth.checked = true;
    }
    else if (bool === 'false'){
      checkSmooth.checked = false;
    }
  }
  else {
    addColor('#6fa7ff');
    addRatio(3);
    addRatio(4.5);
    document.getElementById('checkSmooth').checked = true;
  }

  colorInput();
}
paramSetup();

// Add ratio inputs
function addRatio(v, s = '#cacaca') {
  // increment by default
  if(v == undefined) {
    // find highest value
    var hi = Math.max(...ratioInputs);
    var lo = Math.min(...ratioInputs);

    if(hi < 20) {
      v = Number(hi + 1).toFixed(2);
    }
    if(hi == 21) {
      v = Number(hi - 1).toFixed(2);
    }
  }

  var ratios = document.getElementById('ratioInput-wrapper');
  var div = document.createElement('div');
  var sliderWrapper = document.getElementById('colorSlider-wrapper');
  var slider = document.createElement('input');

  var randId = randomId();
  div.className = 'ratio-Item';
  div.id = randId + '-item';
  var sw = document.createElement('span');
  sw.className = 'ratio-Swatch';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = s;
  var input = document.createElement('input');
  input.className = 'spectrum-Textfield ratio-Field';
  input.type = "number";
  input.min = '-10';
  input.max = '21';
  input.step = '.01';
  input.placeholder = 4.5;
  input.id = randId;
  input.value = v;
  input.onkeydown = checkRatioStepModifiers;
  input.oninput = debounce(colorInput, 100);
  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--quiet';
  button.title = 'Delete contrast ratio';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = v;
  slider.step = '.01';
  slider.className = 'colorSlider'
  slider.id = randId + "-sl";
  slider.disabled = true;
  sliderWrapper.appendChild(slider);

  button.onclick = deleteRatio;
  div.appendChild(sw);
  div.appendChild(input);
  div.appendChild(button);
  ratios.appendChild(div);
}

function newColor(e) {
  var parent = e.target.parentNode.id;
  var id = parent.replace('-item', '');
  var self = document.getElementById(id);
  var v = self.value;
  var swId = parent.replace('-item', '-sw');
  var sw = document.getElementById(swId);

  if (v.startsWith("#") !== true && v.length == 6) {
    h = '#';
    v = h.concat(v);
    self.value = v;
  }

  sw.value = v;

  colorInput();
}

function addColor(s) {
  var colorInputs = document.getElementById('keyColor-wrapper');
  var div = document.createElement('div');

  var randId = randomId();
  div.className = 'keyColor';
  div.id = randId + '-item';
  // var sw = document.createElement('span');
  var sw = document.createElement('input');
  sw.type = "color";
  sw.value = s;
  sw.oninput = throttle(colorInput, 50);

  sw.className = 'keyColor-Item';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = s;

  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton';
  button.title = 'Delete key color';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  button.onclick = deleteColor;
  div.appendChild(sw);
  div.appendChild(button);
  colorInputs.appendChild(div);
}

// When adding new ratios in UI, run colorinput as well
window.addNewRatio = function addNewRatio() {
  addRatio();
  colorInput();
}

// When adding new colors in UI, run colorinput as well
window.addNewColor = function addNewColor() {
  addColor();
  colorInput();
}

window.addBulk = function addBulk() {
  document.getElementById('addBulkColorDialog').classList.add("is-open");
  document.getElementById('dialogOverlay').style.display = 'block';
  let bgInput = document.getElementById('bgField_2');
  let bg = document.getElementById('bgField');
  bgInput.value = bg.value;
}

window.cancelBulk = function cancelBulk() {
  document.getElementById('addBulkColorDialog').classList.remove("is-open");
  document.getElementById('dialogOverlay').style.display = 'none';
}

window.bulkColorInput = function bulkColorInput() {
  let bulkInputs = document.getElementById('bulkColors');
  let bulkValues = bulkInputs.value.replace(/\r\n/g,"\n").replace(/[,\/]/g,"\n").replace(" ", "").replace(/['\/]/g, "").replace(/["\/]/g, "").split("\n");
  let isSwatch = document.getElementById('importAsSwatch').checked;
  let bgInput = document.getElementById('bgField_2').value; // input in Dialog
  let bg = document.getElementById('bgField'); // input in UI

  // add key colors for each input
  for(let i=0; i<bulkValues.length; i++) {
    addColor(d3.color(bulkValues[i]).formatHex());
  }
  if (isSwatch) {
    // create ratio inputs for each contrast
    for (let i=0; i<bulkValues.length; i++) {
      let cr = contrastColors.contrast([d3.rgb(bulkValues[i]).r, d3.rgb(bulkValues[i]).g, d3.rgb(bulkValues[i]).b], [d3.rgb(bgInput).r, d3.rgb(bgInput).g, d3.rgb(bgInput).b]);
      addRatio(cr.toFixed(2));
    }
    bg.value = bgInput;
  }

  // Hide dialog
  cancelBulk();
  // Run colorinput
  colorInput();

  // clear inputs on close
  bulkInputs.value = " ";
}
// Test with #a9e6dc,#7cd6c7,#5ec3bb,#48b1b2,#3b9da5,#308b9a,#22738a,#195b72,#134555
// Should return crs of 1.40, 1.71, 2.10, 2.56, 3.21, 3.97, 5.40, 7.55, 10.45

window.clearAllColors = function clearAllColors() {
  document.getElementById('keyColor-wrapper').innerHTML = ' ';
  colorInput();
}

// Delete ratio input
function deleteRatio(e) {
  var id = e.target.parentNode.id;
  var self = document.getElementById(id);
  var sliderid = id.replace('-item', '') + '-sl';
  var slider = document.getElementById(sliderid);

  self.remove();
  slider.remove();
  colorInput();
}
function deleteColor(e) {
  var id = e.target.parentNode.id;
  var self = document.getElementById(id);

  self.remove();
  colorInput();
}
exports.deleteColor = deleteColor;

window.openTab = function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
  tablinks = document.getElementsByClassName("main-Tabs-item");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "flex";
  evt.currentTarget.className += " is-selected";
}

window.openAppTab = function openAppTab(evt, tabName) {
  // Declare all variables
  var i, appTabContent, apptablinks;

  // Get main tab containers and hide them
  appTabContent = document.getElementsByClassName("appTabContent");
  for (let i = 0; i < appTabContent.length; i++) {
    appTabContent[i].style.display = "none";
  }

  // Get all main tabs with class="spectrum-Tabs-item" and remove the class "active"
  apptablinks = document.getElementsByClassName("app-Tabs-item");
  for (let i = 0; i < apptablinks.length; i++) {
    apptablinks[i].className = apptablinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "grid";
  evt.currentTarget.className += " is-selected";
}

// Open default tabs
document.getElementById("tabDemo").click();

function randomId() {
   return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}
exports.randomId = randomId;

function createDemo(c, z) {
  var smallText = 'Small text demo';
  var largeText = 'Large text';
  var buttonText = 'Button';

  let wrap = document.getElementById('demoWrapper');
  let item = document.createElement('div');
  item.className = 'demoItem';
  let demo = document.createElement('div');
  demo.className = 'spectrum-Typography demo';
  let h = document.createElement('h4');
  h.className = 'spectrum-Heading2 demoHeading';
  let title = document.createTextNode(largeText);
  let p = document.createElement('p');
  p.className = 'spectrum-Body3 demoText';
  let text = document.createTextNode(smallText);
  let b = document.createElement('button');
  b.className = 'spectrum-Button demoButton';
  let bF = document.createElement('button');
  bF.className = 'spectrum-Button demoButton';
  let label = document.createTextNode(buttonText);
  let label2 = document.createTextNode(buttonText);

  h.appendChild(title);
  p.appendChild(text);
  b.appendChild(label);
  bF.appendChild(label2);
  demo.appendChild(h);
  demo.appendChild(p);
  demo.appendChild(b);
  demo.appendChild(bF);

  let demoIn = document.createElement('div');
  demoIn.className = 'spectrum-Typography demoInverted';
  let hIn = document.createElement('h4');
  hIn.className = 'spectrum-Heading2 demoHeading';
  let pIn = document.createElement('p');
  pIn.className = 'spectrum-Body3 demoText';
  let bIn = document.createElement('button');
  bIn.className = 'spectrum-Button demoButton';
  let bFIn = document.createElement('button');
  bFIn.className = 'spectrum-Button demoButton';
  let titleIn = document.createTextNode('Large text');
  let textIn = document.createTextNode(smallText);
  let labelIn = document.createTextNode(buttonText);
  let labelIn2 = document.createTextNode(buttonText);

  hIn.appendChild(titleIn);
  pIn.appendChild(textIn);
  bIn.appendChild(labelIn);
  bFIn.appendChild(labelIn2);
  demoIn.appendChild(hIn);
  demoIn.appendChild(pIn);
  demoIn.appendChild(bIn);
  demoIn.appendChild(bFIn);

  item.appendChild(demo);
  item.appendChild(demoIn);
  wrap.appendChild(item);

  demoIn.style.backgroundColor = c;
  demoIn.style.color = z;
  demo.style.color = c;
  p.style.color = c;
  h.style.color = c;
  b.style.color = c;
  bF.style.backgroundColor = c;
  bF.style.borderColor = c;
  bF.style.color = z;
  bFIn.style.color = c;
  bFIn.style.backgroundColor = z;
  bFIn.style.borderColor = z;
  b.style.borderColor = c;
  pIn.style.color = z;
  hIn.style.color = z;
  bIn.style.color = z;
  bIn.style.borderColor = z;

  demoWrapper.style.backgroundColor = z;
}

function colorspaceOptions() {
  colorspace.options.length = 0;
  chart3dColorspace.options.length = 0;
  chart2dColorspace.options.length = 0;

  var opts = {
    'CAM02': 'CIECAM02',
    'CAM02p': 'CIECAM02p',
    'LCH': 'Lch',
    'LAB': 'Lab',
    'HSL': 'HSL',
    'HSLuv': 'HSLuv',
    'HSV': 'HSV',
    'RGB': 'RGB'
  };
  var opts2 = {
    'CAM02': 'CIECAM02 (recommended)',
    'CAM02p': 'CIECAM02p',
    'LCH': 'Lch',
    'LAB': 'Lab',
    'HSL': 'HSL',
    'HSLuv': 'HSLuv',
    'HSV': 'HSV',
    'RGB': 'RGB'
  };

  for(var index in opts) {
    colorspace.options[colorspace.options.length] = new Option(opts[index], index);
    chart3dColorspace.options[chart3dColorspace.options.length] = new Option(opts2[index], index);
    chart2dColorspace.options[chart2dColorspace.options.length] = new Option(opts2[index], index);
  }
  chart3dColorspace.value = 'CAM02';
  chart2dColorspace.value = 'CAM02';
}

// Ramp function to create HTML canvas color scale
function ramp(color, n) {
  n = window.innerHeight - 284;
  let container = d3.select('#colorScale');
  let canvas = container.append("canvas")
    .attr("height", n)
    .attr("width", 1);
  let context = canvas.node().getContext("2d");

  canvas.style.width = "40px";
  canvas.style.imageRendering = "pixelated";
  for (let i = 0; i < n; ++i) {
    // only do this for actual colors
    if(color[i] !== undefined) {
      context.fillStyle = color[i]; // color[i / (n - 1)]
      context.fillRect(0, i, 1, 1);
    }
  }
  return canvas;
}

function checkRatioStepModifiers(e) {
  if (!e.shiftKey) return;
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  const value = Number(e.target.value);
  let newValue;
  switch (e.key) {
    case 'ArrowDown':
      newValue = value - 1;
      e.target.value = newValue.toFixed(2);
      e.target.oninput();
      break;
    case 'ArrowUp':
      newValue = value + 1;
      e.target.value = newValue.toFixed(2);
      e.target.oninput();
      break;
    default:
  }
}

// Calculate Color and generate Scales
window.colorInput = colorInput;
function colorInput() {
  document.getElementById('colorScale').innerHTML = '';
  let spaceOpt = document.getElementById('chart3dColorspace').value;

  var inputs = document.getElementsByClassName('keyColor-Item');
  var background = document.getElementById('bgField').value;
  let mode = document.querySelector('select[name="mode"]').value;

  // Clamp ratios convert decimal numbers to whole negatives and disallow
  // inputs less than 1 and greater than -1.
  for(let i=0; i<ratioFields.length; i++) {
    val = ratioFields[i].value;
    if (val < 1 && val > -1) {
      ratioFields[i].value = (10 / (val * 10)).toFixed(2) * -1;
    } else { }
  }

  var rfIds = []
  for (let i=0; i<ratioFields.length; i++) {
    rfIds.push(ratioFields[i].id);
  }
  ratioInputs = [];
  let inputColors = [];

  // For each ratio input field, push the value into the args array for generateContrastColors
  for(let i=0; i < ratioFields.length; i++) {
    ratioInputs.push(ratioFields[i].value);
  }
  for(let i=0; i<inputs.length; i++) {
    inputColors.push(inputs[i].value);
  }

  // Convert input value into a split array of hex values.
  let tempArgs = [];
  // remove any whitespace from inputColors
  tempArgs.push(inputColors);
  colorArgs = tempArgs.join("").split(',').filter(String);

  let shift = 1;
  let clamping = document.getElementById('sequentialClamp').checked;
  let checkSmooth = document.getElementById('checkSmooth');
  let smoothing = checkSmooth.checked;

  // Generate scale data so we have access to all 3000 swatches to draw the gradient on the left
  let scaleData = contrastColors.createScale({swatches: 3000, colorKeys: colorArgs, colorspace: mode, shift: shift, smooth: smoothing});
  let n = window.innerHeight - 282;

  let rampData = contrastColors.createScale({swatches: n, colorKeys: colorArgs, colorspace: mode, shift: shift, smooth: smoothing});

  newColors = contrastColors.generateContrastColors({colorKeys: colorArgs, base: background, ratios: ratioInputs, colorspace: mode, shift: shift, smooth: smoothing});

  // Create values for sliders
  let Values = [];
  let maxVal = 100;

  for(let i=0; i < newColors.length; i++){
    Values.push(maxVal * (d3.hsluv(newColors[i]).v / 100)) // wrong direction. Needs inversed.
    // Values.push(maxVal * (d3.hsluv(newColors[i]).v / 100))
  }
  // Values.sort(function(a, b){return a-b});
  // Values.sort(function(a, b){return a-b});

  var values = [];
  values = values.concat(0, Values, maxVal);
  values.sort(function(a, b){return a+b});
  var reverseShift = 1 / shift;

  var sqrtValues = d3.scalePow()
    .exponent(reverseShift)
    .domain([1, maxVal])
    .range([1, maxVal]);

  sqrtValues = values.map(function(d) {
    if(sqrtValues(d) < 0) {
      return 0;
    } else {
      return sqrtValues(d);
    }
  })

  for(let i=0; i<newColors.length; i++) {
    // Calculate value of color and apply to slider position/value
    var val = d3.hsluv(newColors[i]).v;

    var newVal = sqrtValues[i+1];

    val = newVal;
    // Find corresponding input/slider id
    var slider = document.getElementById(rfIds[i] + '-sl')
    slider.value = val;

    // apply color to subsequent swatch
    var swatch = document.getElementById(rfIds[i] + '-sw')
    swatch.style.backgroundColor = newColors[i];
  }

  // Generate Gradient as HTML Canvas element
  let filteredColors = rampData.colors;
  ramp(filteredColors, n);

  var backgroundR = d3.rgb(background).r;
  var backgroundG = d3.rgb(background).g;
  var backgroundB = d3.rgb(background).b;

  var colorOutputWrapper = document.getElementById('colorOutputs');
  colorOutputWrapper.innerHTML = '';
  let wrap = document.getElementById('demoWrapper');
  wrap.innerHTML = '';

  for (let i = 0; i < newColors.length; i++) {
    var colorOutput = document.createElement('div');
    var colorOutputVal = newColors[i];
    var colorOutputText = document.createTextNode(d3.rgb(colorOutputVal).hex());
    var bg = d3.color(background).rgb();
    var outputRatio = contrastColors.contrast([d3.rgb(newColors[i]).r, d3.rgb(newColors[i]).g, d3.rgb(newColors[i]).b], [bg.r, bg.g, bg.b]);
    var ratioText = document.createTextNode(outputRatio.toFixed(2));
    var s1 = document.createElement('span');
    var s2 = document.createElement('span');

    colorOutputWrapper.appendChild(colorOutput);
    colorOutput.className = 'colorOutputBlock';
    colorOutput.style.backgroundColor = colorOutputVal;
    colorOutput.setAttribute('data-clipboard-text', colorOutputVal);
    s1.appendChild(colorOutputText);
    s1.className = 'colorOutputValue';
    s2.appendChild(ratioText);
    colorOutput.appendChild(s1);
    colorOutput.appendChild(s2);

    if (contrastColors.luminance(d3.rgb(newColors[i]).r, d3.rgb(newColors[i]).g, d3.rgb(newColors[i]).b) < 0.275) {
      colorOutput.style.color = "#ffffff";
    } else {
      colorOutput.style.color = '#000000';
    }
    createDemo(newColors[i], background);
  }

  var copyColors = document.getElementById('copyAllColors');
  copyColors.setAttribute('data-clipboard-text', newColors);

  // update URL parameters
  updateParams(inputColors, background.substr(1), ratioInputs, mode, smoothing);

  let data = chartData.createData(scaleData.colors);
  console.log(data);
  charts.showCharts('CAM02', data);
  colorSpaceFeedback('CAM02'); // manually enter default of CAM02
}

window.onresize = colorInput;

// Passing variable parameters to URL
function updateParams(c, b, r, m, s) {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));
  let tabColor = document.getElementById("tabColor");

  params.set('colorKeys', c);
  params.set('base', b);
  params.set('ratios', r);
  params.set('mode', m);
  params.set('smooth', s)

  var cStrings = c.toString().replace(/[#\/]/g, '"#').replace(/[,\/]/g, '",');
  cStrings = cStrings + '"';

  window.history.replaceState({}, '', '?' + params); // update the page's URL.

  var p = document.getElementById('params');
  p.innerHTML = " ";
  var call = 'generateContrastColors({ ';
  var pcol = 'colorKeys: [' + cStrings + '], ';
  var pbas = 'base: "#'+ b + '", ';
  var prat = 'ratios: [' + r + '], ';
  var pmod = ' colorspace: "' + m + '";';
  var psmooth = 'smooth: ' + s + '})';
  let text1 = document.createTextNode(call);
  let text2 = document.createTextNode(pcol);
  let text3 = document.createTextNode(pbas);
  let text4 = document.createTextNode(prat);
  let text7 = document.createTextNode(pmod);
  let text8 = document.createTextNode(psmooth);
  p.appendChild(text1);
  p.appendChild(text2);
  p.appendChild(text3);
  p.appendChild(text4);
  p.appendChild(text7);
  p.appendChild(text8);
}

// Sort swatches in UI
function sort() {
  ratioInputs.sort(function(a, b){return a-b});

  // Update ratio inputs with new values
  for (let i=0; i<ratioInputs.length; i++) {
    ratioFields[i].value = ratioInputs[i];
  }
}

window.sortRatios = function sortRatios() {
  sort();
  colorInput();
}

function returnRatioCube(lum) {
  let a = 1.45;
  let b = 0.7375;
  let c = 2.5;

  let x = lum/100;
  let exp = ((x * -1 / a) + b);
  let y = Math.pow(exp, 3) * c;
  let r = y * 20 + 1;

  if (r > 1) {
    return r;
  }
  if (r < 1 && r >= 0) {
    return 1;
  }
}

function interpolateLumArray() {
  let lums = [];

  for(let i=0; i<newColors.length; i++) {
    lums.push(d3.hsluv(newColors[i]).v);
  }
  var startLum = Math.min(...lums);
  var endLum = Math.max(...lums);
  var interpolator = d3.interpolateNumber(startLum, endLum);

  for (let i=1; i<lums.length - 1; i++) {
    lums[i] = interpolator((i)/(lums.length));
  }

  lums.sort(function(a, b){return b-a});
  return lums;
}

// Redistribute contrast swatches
window.distributeCube = function distributeCube() {
  sort();

  setTimeout(function() {
    let lums = interpolateLumArray();

    for(let i=1; i<lums.length -1; i++) {
      ratioFields[i].value = returnRatioCube(lums[i]).toFixed(2);
    }
  }, 300)

  setTimeout(function() {
    colorInput();
  }, 450)
}

// Function to distribute swatches based on linear interpolation between HSLuv
// lightness values.
window.distributeLum = function distributeLum() {
  let lums = interpolateLumArray();
  var NewContrast = [];

  for(let i=1; i<newColors.length -1; i++) {
    // Re-assign V value as lums[i]
    var L = d3.hsluv(newColors[i]).l;
    var U = d3.hsluv(newColors[i]).u;
    var V = lums[i];
    var NewRGB = d3.hsluv(L, U, V);

    var rgbArray = [d3.rgb(NewRGB).r, d3.rgb(NewRGB).g, d3.rgb(NewRGB).b];
    var baseRgbArray = [d3.rgb(background).r, d3.rgb(background).g, d3.rgb(background).b];

    NewContrast.push(contrastColors.contrast(rgbArray, baseRgbArray).toFixed(2));
  }

  // Concatenate first and last contrast array with new contrast array (middle)
  let newRatios = [];
  newRatios = newRatios.concat(ratioInputs[0], NewContrast, ratioInputs[ratioInputs.length-1]);

  // Delete all ratios
  let ratioItems = document.getElementsByClassName('ratio-Item');
  while(ratioItems.length > 0){
    ratioItems[0].parentNode.removeChild(ratioItems[0]);
  }
  let sliders = document.getElementById('colorSlider-wrapper');
  sliders.innerHTML = ' ';

  // Add all new
  for(let i=0; i<newRatios.length; i++) {
    addRatio(newRatios[i]);
  }

  colorInput();
}

// Create alert feedback for each colorspace
function colorSpaceFeedback(spaceOpt) {
  let alertWrapper = document.getElementById('chart3dAlert');
  alertWrapper.innerHTML = ' ';
  let alert = document.createElement('div');
  alert.className = 'spectrum-Alert';
  if(spaceOpt == 'CAM02') {
    alert.classList.add('spectrum-Alert--info')
    alert.innerHTML =`
      <svg class="spectrum-Icon spectrum-UIIcon-InfoMedium spectrum-Alert-icon" focusable="false" aria-hidden="true">
        <use xlink:href="#spectrum-css-icon-InfoMedium" />
      </svg>
      <div class="spectrum-Alert-header">Recommended color space for color evaluation</div>
      <div class="spectrum-Alert-content">CIECAM02 is a perceptually uniform model of color. Irregularities seen in this space reflect perceived irregularities in color.
        <a href="https://en.wikipedia.org/wiki/CIECAM02" target="_blank" class="spectrum-Link">Learn more about CIECAM02</a>
      </div>`;
  }
  if(spaceOpt == 'LAB' || spaceOpt == 'LCH') {
    alert.classList.add('spectrum-Alert--info')
    alert.innerHTML =`
      <svg class="spectrum-Icon spectrum-UIIcon-InfoMedium spectrum-Alert-icon" focusable="false" aria-hidden="true">
        <use xlink:href="#spectrum-css-icon-InfoMedium" />
      </svg>
      <div class="spectrum-Alert-header">Acceptable color space for color evaluation</div>
      <div class="spectrum-Alert-content">Lab (Lch in cylindrical form) is a well-known and used color space based on human perception of color.
        <a href="https://en.wikipedia.org/wiki/CIELAB_color_space" target="_blank" class="spectrum-Link">Learn more about LAB & LCH </a>
      </div>`;
  }
  if(spaceOpt == 'HSL' || spaceOpt == 'HSV' || spaceOpt == 'HSLuv' || spaceOpt == 'RGB') {
    alert.classList.add('spectrum-Alert--warning')
    alert.innerHTML =`
      <svg class="spectrum-Icon spectrum-UIIcon-InfoMedium spectrum-Alert-icon" focusable="false" aria-hidden="true">
        <use xlink:href="#spectrum-css-icon-InfoMedium" />
      </svg>
      <div class="spectrum-Alert-header">This color space not recommended for evaluating color models</div>
      <div class="spectrum-Alert-content">Irregularities seen in this color space do not accurately represent perceptual irregularities in the color scale itself.
        <a href="https://en.wikipedia.org/wiki/HSL_and_HSV" target="_blank" class="spectrum-Link">Learn more about RGB color spaces</a>
      </div>`;
  }

  alertWrapper.appendChild(alert);
}
exports.colorSpaceFeedback = colorSpaceFeedback;
window.colorSpaceFeedback = colorSpaceFeedback;

function updateCharts(selectObject) {
  let spaceOpt = selectObject.value;
  let colorInterpSpace = document.querySelector('select[name="mode"]').value;

  charts.init3dChart();

  charts.showCharts(spaceOpt, colorInterpSpace);
  colorSpaceFeedback(spaceOpt);
}
window.updateCharts = updateCharts;
