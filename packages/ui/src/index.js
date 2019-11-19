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

// var colorField = document.getElementById('colorField1');


import '@spectrum-css/vars/dist/spectrum-global.css';
import '@spectrum-css/vars/dist/spectrum-medium.css';
import '@spectrum-css/vars/dist/spectrum-light.css';

import '@spectrum-css/page/dist/index-vars.css';
import '@spectrum-css/typography/dist/index-vars.css';
import '@spectrum-css/icon/dist/index-vars.css';
import '@spectrum-css/radio/dist/index-vars.css';
import '@spectrum-css/button/dist/index-vars.css';
import '@spectrum-css/fieldgroup/dist/index-vars.css';
import '@spectrum-css/textfield/dist/index-vars.css';
import '@spectrum-css/dropdown/dist/index-vars.css';
import '@spectrum-css/fieldlabel/dist/index-vars.css';
import '@spectrum-css/checkbox/dist/index-vars.css';
import '@spectrum-css/buttongroup/dist/index-vars.css';
import '@spectrum-css/tooltip/dist/index-vars.css';
import '@spectrum-css/slider/dist/index-vars.css';
import '@spectrum-css/tabs/dist/vars.css';
import '@spectrum-css/tabs/dist/index.css';

import './scss/colorinputs.scss';
import './scss/style.scss';

import '@adobe/focus-ring-polyfill';

import contrastColors from '@adobe/leonardo-contrast-colors';

// import loadIcons from 'loadicons';
// loadIcons('lib/@spectrum-css/icon/dist/spectrum-css-icons.svg');
// loadIcons('lib/@adobe/spectrum-css-workflow-icons/dist/spectrum-icons.svg');

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

var background = document.getElementById('bgField').value;
// var colorBlock = document.getElementById('color');
var demoHeading = document.getElementById('demoHeading');
var demoWrapper = document.getElementById('demoWrapper');
var userColorBlock = document.getElementById('userColor');
var userBgBlock = document.getElementById('userBg');
var ratioInput = document.getElementById('ratio');
var colorOutputField = document.getElementById('colorOutput');

var colorspace = document.getElementById('mode');
var chart3dColorspace = document.getElementById('chart3dColorspace');
let ratioFields = document.getElementsByClassName('ratioField');

let ratioInputs = [];
let newColors;
let pathName;
window.colorArgs = null;

function paramSetup() {
  colorspaceOptions();
  paletteTypeOptions();
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));
  pathName = url.pathname;

  // // If parameters exist, use parameter; else use default html input values
  if(params.has('colorKeys')) {
    // document.getElementById('inputColors').value = "#" + params.get('color');
    // document.getElementById('variableColors').value = params.get('color');
    let cr = params.get('colorKeys');
    let crs = cr.split(',');

    if(crs[0] == 0) {
      crs = ['#707070'];
    } else { }

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
  else {
    addRatio(3);
    addRatio(4.5);
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

  var ratios = document.getElementById('ratios');
  var div = document.createElement('div');
  var sliderWrapper = document.getElementById('sliderWrapper');
  var slider = document.createElement('input');

  var randId = randomId();
  div.className = 'color-Item';
  div.id = randId + '-item';
  var sw = document.createElement('span');
  sw.className = 'spectrum-Textfield-swatch';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = s;
  var input = document.createElement('input');
  input.className = 'spectrum-Textfield ratioField';
  input.type = "number";
  input.min = '-10';
  input.max = '21';
  input.step = '.01';
  input.placeholder = 4.5;
  input.id = randId;
  input.value = v;
  input.oninput = colorInput;
  // input.onfocus = showSlider;
  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--quiet';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = v;
  slider.step = '.01';
  slider.className = 'slider'
  slider.id = randId + "-sl";
  slider.disabled = true;
  sliderWrapper.appendChild(slider);

  button.onclick = deleteRatio;
  div.appendChild(sw);
  div.appendChild(input);
  div.appendChild(button);
  ratios.appendChild(div);
}

function copyColorsFeedback() {
  id = document.getElementById('copyAllColors');
  id.innerHTML = `<span class="spectrum-ActionButton-label">Copied!</span>`;

  setTimeout(function() {id.innerHTML = `<span class="spectrum-ActionButton-label">Copy</span>`;}, 3000);
}
function copyFunctionFeedback() {
  id = document.getElementById('copyParams');
  id.innerHTML = `<span class="spectrum-ActionButton-label">Copied!</span>`;

  setTimeout(function() {id.innerHTML = `<span class="spectrum-ActionButton-label">Copy</span>`;}, 3000);
}

function updateVal(e) {
  var parent = e.target.parentNode.id;
  var id = parent.replace('-item', '');
  var sw = parent.replace('-item', '-sw');
  var input = document.getElementById(id);
  v = document.getElementById(sw).value

  input.value = v;
  colorInput();
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
  var colorInputs = document.getElementById('colorInputWrapper');
  var div = document.createElement('div');

  var randId = randomId();
  div.className = 'color-Item';
  div.id = randId + '-item';
  // var sw = document.createElement('span');
  var sw = document.createElement('input');
  sw.type = "color";
  sw.value = s;
  sw.oninput = colorInput;

  sw.className = 'colorInput inputColorField';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = s;

  let input = document.createElement('input');
  input.className = 'spectrum-Textfield inputColorField';
  input.type = "text";
  input.placeholder = '#ff00ff';
  input.id = randId;
  input.value = s;
  input.onchange = newColor;
  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  button.onclick = deleteColor;
  div.appendChild(sw);
  // div.appendChild(input);
  div.appendChild(button);
  colorInputs.appendChild(div);
}


// When adding new ratios in UI, run colorinput as well
window.addNewRatio = function addNewRatio() {
  addRatio();
  colorInput();
}

window.addNewColor = function addNewColor() {
  addColor();
  colorInput();
}

window.addBulk = function addBulk() {
  document.getElementById('bulkColors').style.display = 'block';
}

function bulkColorInput() {
  let bulkInputs = document.getElementById('bulkColors');
  let bulkValues = bulkInputs.value.replace(/\r\n/g,"\n").replace(/[,\/]/g,"\n").replace(" ", "").replace(/['\/]/g, "").replace(/["\/]/g, "").split("\n");

  // console.log(bulkValues);
  for(let i=0; i<bulkValues.length; i++) {
    addColor(d3.color(bulkValues[i]).formatHex());
  }
  bulkInputs.style.display = 'none';

  colorInput();
}
document.getElementById('bulkColors').addEventListener('blur', bulkColorInput)

window.clearAllColors = function clearAllColors() {
  document.getElementById('colorInputWrapper').innerHTML = ' ';
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

// Open default tabs
// document.getElementById("tabColorScale").click();
document.getElementById("tabDemo").click();


function randomId() {
   return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

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

  var opts = {
    'LCH': 'Lch',
    'LAB': 'Lab',
    'CAM02': 'CIECAM02',
    'HSL': 'HSL',
    'HSLuv': 'HSLuv',
    'HSV': 'HSV',
    'RGB': 'RGB'
  };

  for(var index in opts) {
    colorspace.options[colorspace.options.length] = new Option(opts[index], index);
    chart3dColorspace.options[colorspace.options.length] = new Option(opts[index], index);
  }
  chart3dColorspace.value = 'CAM02';
}

function paletteTypeOptions() {
  var paletteType = document.getElementById('paletteType');
  paletteType.options.length = 0;

  var opts = {
    'Contrast': 'Contrast Based',
    'Sequential': 'Sequential'
  };

  for(var index in opts) {
    paletteType.options[paletteType.options.length] = new Option(opts[index], index);
  }

  paletteType.value = 'Contrast';
}

function changePalette() {
  var paletteType = document.getElementById('paletteType').value;
  var wrapSequence = document.getElementById('sequentialWrapper');
  var wrapRatio = document.getElementById('ratiosWrapper');
  var sliders = document.getElementById('sliderWrapper');

  if (paletteType == 'Contrast') {
    wrapSequence.style.display = 'none';
    wrapRatio.style.display = 'flex';
    sliders.style.display = 'flex';
  }
  if (paletteType == 'Sequential') {
    wrapSequence.style.display = 'flex';
    wrapRatio.style.display = 'none';
    sliders.style.display = 'none';
  }

  colorInput();
}

function update3dChart() {
  let spaceOpt = document.getElementById('chart3dColorspace').value;

  charts.init3dChart();
}

// Calculate Color and generate Scales
window.colorInput = colorInput;
function colorInput() {
  document.getElementById('colors').innerHTML = '';
  document.getElementById('chart1').innerHTML = ' ';
  document.getElementById('chart2').innerHTML = ' ';
  document.getElementById('chart3').innerHTML = ' ';
  document.getElementById('contrastChart').innerHTML = ' ';
  let spaceOpt = document.getElementById('chart3dColorspace').value;
  var paletteType = document.getElementById('paletteType').value;
  var swatchAmmount = document.getElementById('swatchAmmount').value;
  var shiftInputValue = document.getElementById('shiftInputValue');
  shiftInputValue.innerHTML = ' ';

  var inputs = document.getElementsByClassName('inputColorField');
  // var inputColors = inputs.split(" ");
  var background = document.getElementById('bgField').value;
  let mode = document.querySelector('select[name="mode"]').value;

  var chartModeLabel = document.getElementById('colorspaceLabel');
  chartModeLabel.innerHTML = mode;

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

  let shift = document.getElementById('shiftInput').value;
  shiftInputValue.innerHTML = shift;
  let clamping = document.getElementById('sequentialClamp').checked;

  // Generate scale data so we have access to all 3000 swatches to draw the gradient on the left
  let scaleData = contrastColors.createScale({swatches: 3000, colorKeys: colorArgs, colorspace: mode, shift: shift});
  if (paletteType == 'Contrast') {
    newColors = contrastColors.generateContrastColors({colorKeys: colorArgs, base: background, ratios: ratioInputs, colorspace: mode, shift: shift});
  }
  // if (paletteType == 'Sequential') {
  //   generateSequentialColors({swatches: swatchAmmount, colorKeys: colorArgs, colorspace: mode, shift: shift, clamp: clamping});
  // }

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

  // Generate Gradient
  // if (paletteType == 'Sequential') {
  //   var gradientColors = createScale({swatches: 3000, colorKeys: colorArgs, colorspace: mode, shift: shift});
  //
  //   for (var i = 0; i < gradientColors.length; i++) {
  //     var container = document.getElementById('colors');
  //     var div = document.createElement('div');
  //     div.className = 'block';
  //     div.style.backgroundColor = gradientColors[i];
  //
  //     container.appendChild(div);
  //   }
  // } else {
    for (let i = 0; i < scaleData.colors.length; i++) {
      var container = document.getElementById('colors');
      var div = document.createElement('div');
      div.className = 'block';
      div.style.backgroundColor = scaleData.colors[i];

      container.appendChild(div);
    }
  // }


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
  updateParams(inputColors, background.substr(1), ratioInputs, mode);

  createData();
  charts.showCharts();
  charts.init3dChart();
}


// Passing variable parameters to URL
function updateParams(c, b, r, m) {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));

  params.set('colorKeys', c);
  params.set('base', b);
  params.set('ratios', r);
  params.set('mode', m);

  var cStrings = c.toString().replace(/[#\/]/g, '"#').replace(/[,\/]/g, '",');
  cStrings = cStrings + '"';

  // retain pathname if present
  if(pathName == '/') {
    window.history.replaceState({}, '', '/?' + params); // update the page's URL.
  } else {
    window.history.replaceState({}, '', pathName + '/?' + params); // update the page's URL.
  }

  var p = document.getElementById('params');
  p.innerHTML = " ";
  var call = 'generateContrastColors({ ';
  var pcol = 'colorKeys: [' + cStrings + '], ';
  var pbas = 'base: "#'+ b + '", ';
  var prat = 'ratios: [' + r + '], ';
  var pmod = ' colorspace: "' + m + '"});';
  let text1 = document.createTextNode(call);
  let text2 = document.createTextNode(pcol);
  let text3 = document.createTextNode(pbas);
  let text4 = document.createTextNode(prat);
  let text7 = document.createTextNode(pmod);
  p.appendChild(text1);
  p.appendChild(text2);
  p.appendChild(text3);
  p.appendChild(text4);
  p.appendChild(text7);
}

// Create data based on colorspace
function createData() {
  let CAM_J = [];
  let CAM_A = [];
  let CAM_B = [];
  let LAB_L = [];
  let LAB_A = [];
  let LAB_B = [];
  let LCH_L = [];
  let LCH_C = [];
  let LCH_H = [];
  let HSL_H = [];
  let HSL_S = [];
  let HSL_L = [];
  let HSV_H = [];
  let HSV_S = [];
  let HSV_L = [];
  let HSLuv_L = [];
  let HSLuv_U = [];
  let HSLuv_V = [];
  let RGB_R = [];
  let RGB_G = [];
  let RGB_B = [];

  for(let i=4; i<colors.length -8; i++) { // Clip array to eliminate NaN values
    CAM_J.push(d3.jab(colors[i]).J);
    CAM_A.push(d3.jab(colors[i]).a);
    CAM_B.push(d3.jab(colors[i]).b);
    LAB_L.push(d3.lab(colors[i]).l);
    LAB_A.push(d3.lab(colors[i]).a);
    LAB_B.push(d3.lab(colors[i]).b);
    LCH_L.push(d3.hcl(colors[i]).l);
    LCH_C.push(d3.hcl(colors[i]).c);
    LCH_H.push(d3.hcl(colors[i]).h);
    RGB_R.push(d3.rgb(colors[i]).r);
    RGB_G.push(d3.rgb(colors[i]).g);
    RGB_B.push(d3.rgb(colors[i]).b);
    HSL_H.push(d3.hsl(colors[i]).h);
    HSL_S.push(d3.hsl(colors[i]).s);
    HSL_L.push(d3.hsl(colors[i]).l);
    HSV_H.push(d3.hsl(colors[i]).h);
    HSV_S.push(d3.hsl(colors[i]).s);
    HSV_L.push(d3.hsl(colors[i]).l);
    HSLuv_L.push(d3.hsluv(colors[i]).l);
    HSLuv_U.push(d3.hsluv(colors[i]).u);
    HSLuv_V.push(d3.hsluv(colors[i]).v);
  }

  window.CAMArrayJ = [];
  window.CAMArrayA = [];
  window.CAMArrayB = [];
  window.LABArrayL = [];
  window.LABArrayA = [];
  window.LABArrayB = [];
  window.LCHArrayL = [];
  window.LCHArrayC = [];
  window.LCHArrayH = [];
  window.RGBArrayR = [];
  window.RGBArrayG = [];
  window.RGBArrayB = [];
  window.HSLArrayH = [];
  window.HSLArrayS = [];
  window.HSLArrayL = [];
  window.HSVArrayH = [];
  window.HSVArrayS = [];
  window.HSVArrayL = [];
  window.HSLuvArrayL = [];
  window.HSLuvArrayU = [];
  window.HSLuvArrayV = [];

  // Shorten the numbers in the array for chart purposes
  var maxVal = 50;
  var delta = Math.floor( CAM_J.length / maxVal );

  for (let i = 0; i < CAM_J.length; i=i+delta) {
    CAMArrayJ.push(CAM_J[i]);
  }
  for (let i = 0; i < CAM_A.length; i=i+delta) {
    CAMArrayA.push(CAM_A[i]);
  }
  for (let i = 0; i < CAM_B.length; i=i+delta) {
    CAMArrayB.push(CAM_B[i]);
  }
  for (let i = 0; i < LAB_L.length; i=i+delta) {
    LABArrayL.push(LAB_L[i]);
  }
  for (let i = 0; i < LAB_A.length; i=i+delta) {
    LABArrayA.push(LAB_A[i]);
  }
  for (let i = 0; i < LAB_B.length; i=i+delta) {
    LABArrayB.push(LAB_B[i]);
  }
  for (let i = 0; i < LCH_L.length; i=i+delta) {
    LCHArrayL.push(LCH_L[i]);
  }
  for (let i = 0; i < LCH_C.length; i=i+delta) {
    LCHArrayC.push(LCH_C[i]);
  }
  for (let i = 0; i < LCH_H.length; i=i+delta) {
    LCHArrayH.push(LCH_H[i]);
  }
  for (let i = 0; i < RGB_R.length; i=i+delta) {
    RGBArrayR.push(RGB_R[i]);
  }
  for (let i = 0; i < RGB_G.length; i=i+delta) {
    RGBArrayG.push(RGB_G[i]);
  }
  for (let i = 0; i < RGB_B.length; i=i+delta) {
    RGBArrayB.push(RGB_B[i]);
  }
  for (let i = 0; i < HSL_H.length; i=i+delta) {
    HSLArrayH.push(HSL_H[i]);
  }
  for (let i = 0; i < HSL_S.length; i=i+delta) {
    HSLArrayS.push(HSL_S[i]);
  }
  for (let i = 0; i < HSL_L.length; i=i+delta) {
    HSLArrayL.push(HSL_L[i]);
  }
  for (let i = 0; i < HSV_H.length; i=i+delta) {
    HSVArrayH.push(HSV_H[i]);
  }
  for (let i = 0; i < HSV_S.length; i=i+delta) {
    HSVArrayS.push(HSV_S[i]);
  }
  for (let i = 0; i < HSV_L.length; i=i+delta) {
    HSVArrayL.push(HSV_L[i]);
  }
  for (let i = 0; i < HSLuv_L.length; i=i+delta) {
    HSLuvArrayL.push(HSLuv_L[i]);
  }
  for (let i = 0; i < HSLuv_U.length; i=i+delta) {
    HSLuvArrayU.push(HSLuv_U[i]);
  }
  for (let i = 0; i < HSLuv_V.length; i=i+delta) {
    HSLuvArrayV.push(HSLuv_V[i]);
  }

  const fillRange = (start, end) => {
    return Array(end - start + 1).fill().map((item, index) => start + index);
  };

  let dataX = fillRange(0, CAMArrayJ.length - 1);
  let dataXcyl = fillRange(0, LCHArrayL.length - 1);
  let dataXcontrast = fillRange(0, ratioInputs.length - 1);

  window.labFullData = [
    {
      x: LABArrayL,
      y: LABArrayA,
      z: LABArrayB
    }
  ];

  window.camDataJ = [
    {
      x: dataX,
      y: CAMArrayJ
    }
  ];
  window.camDataA = [
    {
      x: dataX,
      y: CAMArrayA
    }
  ];
  window.camDataB = [
    {
      x: dataX,
      y: CAMArrayB
    }
  ];
  window.camDataAB = [
    {
      x: CAMArrayA,
      y: CAMArrayB
    }
  ];
  window.labDataL = [
    {
      x: dataX,
      y: LABArrayL
    }
  ];
  window.labDataA = [
    {
      x: dataX,
      y: LABArrayA
    }
  ];
  window.labDataB = [
    {
      x: dataX,
      y: LABArrayB
    }
  ];
  window.labDataAB = [
    {
      x: LABArrayA,
      y: LABArrayB
    }
  ];
  window.lchDataL = [
    {
      x: dataX,
      y: LCHArrayL
    }
  ];
  window.lchDataC = [
    {
      x: dataX,
      y: LCHArrayC
    }
  ];
  window.lchDataH = [
    {
      x: dataXcyl,
      y: LCHArrayH
    }
  ];
  window.lchDataCH = [
    {
      x: LCHArrayC,
      y: LCHArrayH
    }
  ];
  window.rgbDataR = [
    {
      x: RGBArrayR,
      y: RGBArrayG
    }
  ];
  window.rgbDataG = [
    {
      x: RGBArrayG,
      y: RGBArrayB
    }
  ];
  window.rgbDataB = [
    {
      x: RGBArrayB,
      y: RGBArrayR
    }
  ];
  window.hslDataH = [
    {
      x: dataXcyl,
      y: HSLArrayH
    }
  ];
  window.hslDataS = [
    {
      x: dataX,
      y: HSLArrayS
    }
  ];
  window.hslDataL = [
    {
      x: dataX,
      y: HSLArrayL
    }
  ];
  window.hslDataHS = [
    {
      x: HSLArrayH,
      y: HSLArrayS
    }
  ];
  window.hsvDataH = [
    {
      x: dataXcyl,
      y: HSVArrayH
    }
  ];
  window.hsvDataS = [
    {
      x: dataX,
      y: HSVArrayS
    }
  ];
  window.hsvDataL = [
    {
      x: dataX,
      y: HSVArrayL
    }
  ];
  window.hsvDataHS = [
    {
      x: HSVArrayH,
      y: HSVArrayS
    }
  ];
  window.hsluvDataL = [
    {
      x: dataX,
      y: HSLuvArrayL
    }
  ];
  window.hsluvDataU = [
    {
      x: dataX,
      y: HSLuvArrayU
    }
  ];
  window.hsluvDataV = [
    {
      x: dataX,
      y: HSLuvArrayV
    }
  ];
  window.hsluvDataLU = [
    {
      x: HSLuvArrayL,
      y: HSLuvArrayU
    }
  ];
  window.contrastData = [
    {
      x: dataXcontrast,
      y: ratioInputs
    }
  ]
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

// Exponential curve for approximating perceptually balanced swatch distribution
function returnRatioExp(lum) {
  // var a = 22.11002659220650;
  // var b = -0.03236668196111;

  // Test update
  var a = 21.2;
  var b = -0.035;
  var c = 0.25;

  var r = a * Math.exp(b * lum) + c;
  if (r > 1) {
    return r;
  }
  if (r < 1 && r >= 0) {
    return 1;
  }
}

// Inverse tangental curve for approximating perceptually balanced swatch distribution
// with smaller difference between swatches in darker values
function returnRatioTan(lum) {
  // var a = -8.25;
  // var b = 0.0685;
  // var c = 1.65;
  // var d = 12.25;

  // Test tangent curve for general use
  var a = -11;
  var b = 0.0475;
  var c = 0.5;
  var d = 15.45;

  // Test tangent curve for diverging palettes
  // var a = -11;
  // var b = 0.04;
  // var c = 0.65;
  // var d = 14.875;

  var r = a * Math.atan(b * lum - c) + d;

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
function distributeExp() {
  sort();

  // colorInput(); // for some reason without this, dist function needs called 2x to get proper output.
  let lums = interpolateLumArray();

  for(let i=1; i<lums.length -1; i++) {
    ratioFields[i].value = returnRatioExp(lums[i]).toFixed(2);
  }

  colorInput();
}

// Redistribute contrast swatches
// TODO: It's still broken.
window.distributeTan = function distributeTan() {
  sort();

  setTimeout(function() {
    let lums = interpolateLumArray();

    for(let i=1; i<lums.length -1; i++) {
      ratioFields[i].value = returnRatioTan(lums[i]).toFixed(2);
    }
  }, 300)

  setTimeout(function() {
    colorInput();
  }, 450)
}

// Function to distribute swatches based on linear interpolation between HSLuv
// lightness values.
function distributeLum() {
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

    NewContrast.push(contrast(rgbArray, baseRgbArray).toFixed(2));
  }

  // Concatenate first and last contrast array with new contrast array (middle)
  let newRatios = [];
  newRatios = newRatios.concat(ratioInputs[0], NewContrast, ratioInputs[ratioInputs.length-1]);

  // Delete all ratios
  ratioItems = document.getElementsByClassName('color-Item');
  while(ratioItems.length > 0){
    ratioItems[0].parentNode.removeChild(ratioItems[0]);
  }
  var sliders = document.getElementById('sliderWrapper');
  sliders.innerHTML = ' ';

  // Add all new
  for(let i=0; i<newRatios.length; i++) {
    addRatio(newRatios[i]);
  }

  colorInput();
}

