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

import * as Leonardo from '@adobe/leonardo-contrast-colors';

import apcaLookup from './APCAlookup';

// expose functions so they can be ran in the console
window.createScale = Leonardo.createScale;
window.luminance = Leonardo.luminance;
window.contrast = Leonardo.contrast;
window.Color = Leonardo.Color;
window.Leonardo = Leonardo;
window.BackgroundColor = Leonardo.BackgroundColor;
window.Theme = Leonardo.Theme;
window.minPositive = Leonardo.minPositive;
window.ratioName = Leonardo.ratioName;

import loadIcons from 'loadicons';
loadIcons('./spectrum-css-icons.svg');
loadIcons('./spectrum-icons.svg');

import ClipboardJS from 'clipboard';

new ClipboardJS('.copyButton');
new ClipboardJS('.colorOutputBlock');

// import * as d3 from 'd3';

// Import d3 plugins and add them to the d3 namespace
// import * as d3cam02 from 'd3-cam02';
// import * as d3hsluv from 'd3-hsluv';
// import * as d3hsv from 'd3-hsv';
// import * as d33d from 'd3-3d';
// Object.assign(d3, d3cam02, d3hsluv, d3hsv, d33d);


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

var APCAminValue = '-113.6';
var APCAmaxValue = '112.5';

window.ratioInputs = [];
let newColors;
let pathName;
window.colorArgs = null;

// bgFieldInput.onchange = throttle(colorInput, 50);

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

    if(params.has('fontSizes') && params.has('fontWeights')) {
      let fontSizes = params.get('fontSizes');
      let fs = fontSizes.split(',');
      fs = fs.map(Number);

      let fontWeights = params.get('fontWeights');
      let fw = fontWeights.split(',');
      fw = fw.map(Number);

      for(let i=0; i<ratios.length; i++) {
        addRatio(ratios[i], fs[i], fw[i]);
      }
    } else {
      for(let i=0; i<ratios.length; i++) {
        addRatio(ratios[i]);
      }
    }

  }
  if(params.has('mode')) {
    document.querySelector('select[name="mode"]').value = params.get('mode');
  }
  if(params.has('method')) {
    document.getElementById('contrastMethod').value = params.get('method');
  }
  else {
    addColor('#6fa7ff');
    addRatio(3);
    addRatio(4.5);
  }

  // colorInput();
}
paramSetup();

// Add ratio inputs
function addRatio(v, fs, fw) {
  let s = '#cacaca';
  let methodPicker = document.getElementById('contrastMethod');
  let method = methodPicker.value;
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
  div.className = 'ratio-Item ratioGrid';
  div.id = randId + '-item';
  var inputWrapper = document.createElement('span');

  var sw = document.createElement('span');
  sw.className = 'ratio-Swatch';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = s;
  var ratioInput = document.createElement('input');
  ratioInput.className = 'spectrum-Textfield ratio-Field ratioGrid--ratio';
  ratioInput.type = "number";
  ratioInput.min = (method === 'APCA') ? APCAminValue : '-10';
  ratioInput.max = (method === 'APCA') ? APCAmaxValue : '21';
  ratioInput.step = '.01';
  ratioInput.placeholder = (method === 'WCAG') ? 4.5 : 60;
  ratioInput.id = randId;
  ratioInput.value = v;
  ratioInput.onkeydown = checkRatioStepModifiers;
  // ratioInput.oninput = debounce(colorInput, 100);
  ratioInput.oninput = syncRatioInputs;

  var fontSizeInput = document.createElement('input');
  fontSizeInput.className = 'spectrum-Textfield ratioGrid--fontSize';
  fontSizeInput.type = "number";
  fontSizeInput.min = '12';
  fontSizeInput.step = '1';
  fontSizeInput.id = randId + "-fontSize";
  fontSizeInput.value = fs;
  fontSizeInput.oninput = syncRatioInputs;

  var fontWeightInput = document.createElement('input');
  fontWeightInput.className = 'spectrum-Textfield ratioGrid--fontWeight';
  fontWeightInput.type = "number";
  fontWeightInput.step = '100';
  fontWeightInput.min = '100';
  fontWeightInput.max = '900';
  fontWeightInput.placeholder = '400';
  fontWeightInput.id = randId + "-fontWeight";
  fontWeightInput.value = fw;
  fontWeightInput.oninput = syncRatioInputs;
  // fontWeightInput.defaultValue = '400';

  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--quiet ratioGrid--actions';
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
  inputWrapper.appendChild(sw);
  inputWrapper.appendChild(ratioInput);
  div.appendChild(fontSizeInput);
  div.appendChild(fontWeightInput);
  div.appendChild(inputWrapper)
  div.appendChild(button);
  ratios.appendChild(div);
}

function syncRatioInputs(e) {
  let thisId = e.target.id;
  let val = e.target.value;
  let fontWeight;
  let fontSize;
  let targetContrast;

  // if input is a font size, only change the ratio input to match
  // required value for the combination of size + weight values
  // if input id contains -fontSize in the string = it's a font size input
  if(thisId.includes('-fontSize')) {
    fontSize = val;
    let baseId = thisId.replace('-fontSize', '');
    let fontWeightInput = document.getElementById(baseId + '-fontWeight');
    // If no font weight defined, default to 400, otherwise use the
    // font weight value for the lookup table
    if(!fontWeightInput.value) {
      fontWeight = '400';
      fontWeightInput.value = fontWeight;
    } else {
      fontWeight = `${fontWeightInput.value}`;
    }
    let ratioInput = document.getElementById(baseId);
    let node = apcaLookup[val];

    if(!node) {
      // Need to find closest ratios in lookup table
      // and if ratioInput.value is less than the lower of the
      // two values, it needs to be changed.

      targetContrast = ratioInput.value;
    } else {
      targetContrast = apcaLookup[val][fontWeight]
      ratioInput.value = targetContrast;
    }
  }

  // if input is a font weight, only change the ratio input to match
  // required value for the combination of size + weight values
  // if input id contains -fontWeight in the string = it's a font weight input
  else if (thisId.includes('-fontWeight')) {
    let baseId = thisId.replace('-fontWeight', '');
    let fontSizeInput = document.getElementById(baseId + '-fontSize');
    fontSize = fontSizeInput.value;
    fontWeight = val;

    let ratioInput = document.getElementById(baseId);
    targetContrast = apcaLookup[fontSize][val];

    if(targetContrast) {
      ratioInput.value = targetContrast;
    } else {
      targetContrast = ratioInput.value;
    }
  }

  // if input is a Ratio, increase the font size value based on
  // lookup table and current font weight. If no weight, default to 400
  else {
    let fontWeightInput = document.getElementById(thisId + '-fontWeight');
    let fontSizeInput = document.getElementById(thisId + '-fontSize');
    let fontWeight = (fontWeightInput.value) ? fontWeightInput.value : '400';
    targetContrast = val;
    
    if(!fontWeightInput.value) fontWeightInput.value = '400';
    let fontSize;
    for (const property in apcaLookup) {
      if(apcaLookup[property][fontWeight] === targetContrast) {
        fontSize = property; 
        fontSizeInput.value = fontSize;
      }
    }
  }

  // Then, run the colorinput funtion to update all values.
  // colorInput();
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
  // sw.oninput = throttle(colorInput, 50);

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
  // colorInput();
}

// When adding new colors in UI, run colorinput as well
window.addNewColor = function addNewColor() {
  addColor();
  // colorInput();
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
  let bulkValues = bulkInputs.value.replace(/\r\n/g,"\n").replace(/[,\/]/g,"\n").replace(" ", "").replace(/['\/]/g, "").replace(/["\/]/g, "").replace(" ", "").split("\n");
  for (let i=0; i<bulkValues.length; i++) {
    if (!bulkValues[i].startsWith('#')) {
      bulkValues[i] = '#' + bulkValues[i]
    }
  }
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
      let cr = Leonardo.contrast([d3.rgb(bulkValues[i]).r, d3.rgb(bulkValues[i]).g, d3.rgb(bulkValues[i]).b], [d3.rgb(bgInput).r, d3.rgb(bgInput).g, d3.rgb(bgInput).b]);
      addRatio(cr.toFixed(2));
    }
    bg.value = bgInput;
  }

  // Hide dialog
  cancelBulk();
  // Run colorinput
  // colorInput();

  // clear inputs on close
  bulkInputs.value = " ";
}
// Test with #a9e6dc,#7cd6c7,#5ec3bb,#48b1b2,#3b9da5,#308b9a,#22738a,#195b72,#134555
// Should return crs of 1.40, 1.71, 2.10, 2.56, 3.21, 3.97, 5.40, 7.55, 10.45

window.clearAllColors = function clearAllColors() {
  document.getElementById('keyColor-wrapper').innerHTML = ' ';
  // colorInput();
}

// Delete ratio input
function deleteRatio(e) {
  var id = e.target.parentNode.id;
  var self = document.getElementById(id);
  var sliderid = id.replace('-item', '') + '-sl';
  var slider = document.getElementById(sliderid);

  self.remove();
  slider.remove();
  // colorInput();
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


window.openPanelTab = function openPanelTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("paneltabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
  tablinks = document.getElementsByClassName("panel-Tabs-item");
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
document.getElementById("tabThemeConfigs").click();
document.getElementById("tabDemo").click();

function randomId() {
   return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}
exports.randomId = randomId;


function createDemo(c, z, fontSize, fontWeight, method) {
  var smallText = 'Small text demo';
  var largeText = 'Large text';
  var buttonText = 'Button';

  let wrap = document.getElementById('demoWrapper');
  let item = document.createElement('div');
  item.className = 'demoItem';
  let demo = document.createElement('div');

  if(method === 'WCAG') {
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
  }
  else if (method === 'APCA') {
    demo.className = 'demo';

    let labelString = `Sample text`;
    let label = document.createTextNode(labelString);
    let labelWrapper = document.createElement('p');
    labelWrapper.style.fontFamily = "Helvetica Neue, Helvetica, Arial";
    labelWrapper.style.fontSize = fontSize;
    labelWrapper.style.fontWeight = fontWeight;
    labelWrapper.style.color = c;
    labelWrapper.style.marginBottom = 0;
    labelWrapper.appendChild(label);
    demo.appendChild(labelWrapper);
    item.appendChild(demo);
    wrap.appendChild(item);
  }

  demoWrapper.style.backgroundColor = z;
}

function colorspaceOptions() {
  colorspace.options.length = 0;
  chart3dColorspace.options.length = 0;
  chart2dColorspace.options.length = 0;

  var opts = {
    'CAM02': 'CIECAM02',
    'LCH': 'Lch',
    'LAB': 'Lab',
    'HSL': 'HSL',
    'HSLuv': 'HSLuv',
    'HSV': 'HSV',
    'RGB': 'RGB'
  };
  var opts2 = {
    'CAM02': 'CIECAM02 (recommended)',
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
// function ramp(color, n) {
//   let container = d3.select('#colorScale');
//   let canvas = container.append("canvas")
//     .attr("height", n)
//     .attr("width", 1);
//   let context = canvas.node().getContext("2d");

//   canvas.style.width = "40px";
//   canvas.style.imageRendering = "pixelated";
//   for (let i = 0; i < n; ++i) {
//     // only do this for actual colors
//     if(color[i] !== undefined) {
//       context.fillStyle = color[i]; // color[i / (n - 1)]
//       context.fillRect(0, i, 1, 1);
//     }
//   }
//   return canvas;
// }
// Ramp function modified to be horizontal
function ramp(colors, dest) {
  // let container = document.getElementById('colorScale');
  let container = (!dest) ? document.getElementById('colorScale') : document.getElementById(dest);

  // let gradient = document.createElement('div');
  // gradient.className = 'gradient'

  container.style.backgroundImage = `linear-gradient(to right, ${colors})`;
  // container.appendChild(gradient)
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
      e.target.oninput(e);
      break;
    case 'ArrowUp':
      newValue = value + 1;
      e.target.value = newValue.toFixed(2);
      e.target.oninput(e);
      break;
    default:
  }
}

// Calculate Color and generate Scales
// window.colorInput = colorInput;
// function colorInput() {
//   document.getElementById('colorScale').innerHTML = '';
//   let spaceOpt = document.getElementById('chart3dColorspace').value;

//   var inputs = document.getElementsByClassName('keyColor-Item');
//   var background = document.getElementById('bgField').value;
//   let mode = document.querySelector('select[name="mode"]').value;

//   let methodPicker = document.getElementById('contrastMethod');
//   let method = methodPicker.value;

//   // Gather font information
//   let fontSizeInputs = document.getElementsByClassName('ratioGrid--fontSize');
//   let fontweightInputs = document.getElementsByClassName('ratioGrid--fontWeight');
//   let fontSizes = [];
//   let fontWeights = [];
//   // start loop at 1 because first entry will be the label
//   for(let i = 1; i < fontSizeInputs.length; i++) {
//     fontSizes.push(fontSizeInputs[i].value);
//   }
//   // start loop at 1 because first entry will be the label
//   for(let i = 1; i < fontweightInputs.length; i++) {
//     fontWeights.push(fontweightInputs[i].value);
//   }

//   // Clamp ratios convert decimal numbers to whole negatives and disallow
//   // inputs less than 1 and greater than -1.
//   for(let i=0; i<ratioFields.length; i++) {
//     ratioFields[i].min = (method === 'APCA') ? APCAminValue : '-10';
//     ratioFields[i].max = (method === 'APCA') ? APCAmaxValue : '21';

//     val = ratioFields[i].value;
//     if (val < 1 && val > -1) {
//       ratioFields[i].value = (10 / (val * 10)).toFixed(2) * -1;
//     } else { }
//   }

//   var rfIds = []
//   for (let i=0; i<ratioFields.length; i++) {
//     rfIds.push(ratioFields[i].id);
//   }
//   ratioInputs = [];
//   let inputColors = [];

//   // For each ratio input field, push the value into the args array for generateContrastColors
//   for(let i=0; i < ratioFields.length; i++) {
//     ratioInputs.push(ratioFields[i].value);
//   }
//   for(let i=0; i<inputs.length; i++) {
//     inputColors.push(inputs[i].value);
//   }

//   // Convert input value into a split array of hex values.
//   let tempArgs = [];
//   // remove any whitespace from inputColors
//   tempArgs.push(inputColors);
//   colorArgs = tempArgs.join("").split(',').filter(String);

//   let shift = 1;
//   let clamping = document.getElementById('sequentialClamp').checked;

//   // Generate scale data so we have access to all 3000 swatches to draw the gradient on the left
//   let scaleData = Leonardo.createScale({swatches: 3000, colorKeys: colorArgs, colorspace: mode, shift: shift});
//   let n = window.innerHeight - 282;

//   // let rampData = Leonardo.createScale({swatches: n, colorKeys: colorArgs, colorspace: mode, shift: shift});

//   let newColor = new Color({name: 'color', colorKeys: colorArgs, colorspace: mode, ratios: ratioInputs});  

//   // let rampData = newColor.colorScale;
//   let rampData = Leonardo.createScale({swatches: 30, colorKeys: colorArgs, colorspace: mode, shift: shift});

//   let theme = new Theme({colors: [newColor], backgroundColor: background, method: method});
//   newColors = theme.contrastColorValues;

//   // Create values for sliders
//   let Values = [];
//   let maxVal = 100;

//   for(let i=0; i < newColors.length; i++){
//     Values.push(maxVal * (d3.hsluv(newColors[i]).v / 100)) // wrong direction. Needs inversed.
//     // Values.push(maxVal * (d3.hsluv(newColors[i]).v / 100))
//   }
//   // Values.sort(function(a, b){return a-b});
//   // Values.sort(function(a, b){return a-b});

//   var values = [];
//   values = values.concat(0, Values, maxVal);
//   values.sort(function(a, b){return a+b});
//   var reverseShift = 1 / shift;

//   var sqrtValues = d3.scalePow()
//     .exponent(reverseShift)
//     .domain([1, maxVal])
//     .range([1, maxVal]);

//   sqrtValues = values.map(function(d) {
//     if(sqrtValues(d) < 0) {
//       return 0;
//     } else {
//       return sqrtValues(d);
//     }
//   })

//   for(let i=0; i<newColors.length; i++) {
//     // Calculate value of color and apply to slider position/value
//     var val = d3.hsluv(newColors[i]).v;

//     var newVal = sqrtValues[i+1];

//     val = newVal;
//     // Find corresponding input/slider id
//     var slider = document.getElementById(rfIds[i] + '-sl')
//     slider.value = val;

//     // apply color to subsequent swatch
//     var swatch = document.getElementById(rfIds[i] + '-sw')
//     swatch.style.backgroundColor = newColors[i];
//   }

//   // Generate Gradient as HTML Canvas element
//   let filteredColors = rampData;
//   ramp(filteredColors);

//   var backgroundR = d3.rgb(background).r;
//   var backgroundG = d3.rgb(background).g;
//   var backgroundB = d3.rgb(background).b;

//   var colorOutputWrapper = document.getElementById('colorOutputs');
//   colorOutputWrapper.innerHTML = '';
//   let wrap = document.getElementById('demoWrapper');
//   wrap.innerHTML = '';

//   for (let i = 0; i < newColors.length; i++) {
//     var colorOutput = document.createElement('div');
//     var colorOutputVal = newColors[i];
//     var colorOutputText = document.createTextNode(d3.rgb(colorOutputVal).hex());
//     var bg = d3.color(background).rgb();
//     var outputRatio = Leonardo.contrast([d3.rgb(newColors[i]).r, d3.rgb(newColors[i]).g, d3.rgb(newColors[i]).b], [bg.r, bg.g, bg.b]);
//     var ratioText = document.createTextNode(outputRatio.toFixed(2));
//     var s1 = document.createElement('span');
//     var s2 = document.createElement('span');

//     colorOutputWrapper.appendChild(colorOutput);
//     colorOutput.className = 'colorOutputBlock';
//     colorOutput.style.backgroundColor = colorOutputVal;
//     colorOutput.setAttribute('data-clipboard-text', colorOutputVal);
//     s1.appendChild(colorOutputText);
//     s1.className = 'colorOutputValue';
//     s2.appendChild(ratioText);
//     colorOutput.appendChild(s1);
//     colorOutput.appendChild(s2);

//     if (Leonardo.luminance(d3.rgb(newColors[i]).r, d3.rgb(newColors[i]).g, d3.rgb(newColors[i]).b) < 0.275) {
//       colorOutput.style.color = "#ffffff";
//     } else {
//       colorOutput.style.color = '#000000';
//     }

//     createDemo(newColors[i], background, fontSizes[i], fontWeights[i], method);
//   }

//   var copyColors = document.getElementById('copyAllColors');
//   copyColors.setAttribute('data-clipboard-text', newColors);

//   // update URL parameters
//   updateParams(inputColors, background.substr(1), ratioInputs, mode, method, fontSizes, fontWeights);

//   let data = chartData.createData(scaleData);
//   charts.showCharts('CAM02', data);
//   colorSpaceFeedback('CAM02'); // manually enter default of CAM02
// }
// window.onresize = colorInput;

// Passing variable parameters to URL
function updateParams(c, b, r, m, method, fs, fw) {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));
  let tabColor = document.getElementById("tabColor");

  params.set('colorKeys', c);
  params.set('base', b);
  params.set('ratios', r);
  params.set('fontSizes', fs);
  params.set('fontWeights', fw);
  params.set('mode', m);
  params.set('method', method);

  var cStrings = c.toString().replace(/[#\/]/g, '"#').replace(/[,\/]/g, '",');
  cStrings = cStrings + '"';

  window.history.replaceState({}, '', '?' + params); // update the page's URL.

  var p = document.getElementById('params');
  p.innerHTML = " ";
  var call = `new Color({ \n name: 'myColor',\n`;
  var pcol = 'colorKeys: [' + cStrings + '], ';
  var prat = 'ratios: [' + r + '], ';
  var pmod = ' colorspace: "' + m + '"';
  var pmethod = ` method: ${method}});`
  let text1 = document.createTextNode(call);
  let text2 = document.createTextNode(pcol);
  let text4 = document.createTextNode(prat);
  let text7 = document.createTextNode(pmod);
  let text8 = document.createTextNode(pmethod);
  p.appendChild(text1);
  p.appendChild(text2);
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
  // colorInput();
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
    // colorInput();
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

    NewContrast.push(Leonardo.contrast(rgbArray, baseRgbArray).toFixed(2));
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

  // colorInput();
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

// Type scale 
let typeScaleSampleWrapper = document.getElementById('typeScaleSampleWrapper');
let typeScaleBaseInput = document.getElementById('typeScaleBase');
let typeScaleRatioInput = document.getElementById('typeScaleRatio');
let typeScaleDecrementInput = document.getElementById('typeScaleDecrement');
let typeScaleIncrementInput = document.getElementById('typeScaleIncrement');
let typeScaleSampleText = document.getElementById('sampleText');

function createTypeScale() {
  typeScaleSampleWrapper.innerHTML = ' ';
  let base = Number(typeScaleBaseInput.value);
  let ratio = Number(typeScaleRatioInput.value);
  let decrement = Number(typeScaleDecrementInput.value);
  let increment = Number(typeScaleIncrementInput.value);

  let sizes = [];

  for(let i = 0; i < decrement; i ++) {
    let value = base / Math.pow(ratio, i+1);
    sizes.push(value)
  }
  for(let i = 0; i < increment; i ++) {
    let value = base * Math.pow(ratio, i);
    sizes.push(value)
  }

  // Sort them all.
  // sizes = sizes.sort((a,b) => a-b);
  sizes = sizes.sort((a,b) => b-a);

  for(let i = 0; i < sizes.length; i++) {
    let size = Math.round(sizes[i]);
    let sampleText = document.createTextNode(typeScaleSampleText.value);
    let text = document.createTextNode(`${size}px`);
    let div = document.createElement('div');
    let span = document.createElement('span');
    span.style.fontSize = `${size}px`;
    span.className = 'sampleTextItem';
    span.appendChild(sampleText);
    div.appendChild(text);
    div.appendChild(span);
    typeScaleSampleWrapper.appendChild(div);
  }
}
createTypeScale();

typeScaleBaseInput.addEventListener('input', createTypeScale);
typeScaleRatioInput.addEventListener('input', createTypeScale);
typeScaleDecrementInput.addEventListener('input', createTypeScale);
typeScaleIncrementInput.addEventListener('input', createTypeScale);
typeScaleSampleText.addEventListener('input', createTypeScale);

// Theme configs
let themeTitleInput = document.getElementById('themeTitleInput');
let themeTitle = document.getElementById('themeTitle');

function updateThemeTitle() {
  themeTitle.innerHTML = ' ';
  let title = themeTitleInput.value;
  if(title) themeTitle.innerHTML = title;
}
themeTitleInput.addEventListener('input', updateThemeTitle);
window.updateThemeTitle = updateThemeTitle;

// Temporary
window.minPositive = minPositive;
window.ratioName = ratioName;


/**
 * 
 * Merging "Color" tab with "Theme"
 * This will require placing theme functions into this file
 * These functions are below. They are intended to replace or
 * augment some of the functions above, in order to provide
 * a theme-building experience along with charts & models.
 * 
*/


window.addColorScale = addColorScale;
function addColorScale(c, k, s, r) {
  // for checking to see if items already exist
  let items = document.getElementsByClassName('themeColor_item');
  // create unique ID for color object
  let thisId = randomId();
  // generate color input objects:
  // gradient, inputs, etc.
  let wrapper = document.getElementById('themeColorWrapper');
  let emptyState = document.getElementById('themeColorEmptyState');
  // Remove empty state
  if(emptyState.classList.contains('is-hidden')) {
    // Do nothing
  } else {
    emptyState.classList.add('is-hidden');
  }

  // Create theme item
  let item = document.createElement('div');
  item.className = 'themeColor_item';
  item.id = thisId;

  // Create gradient
  let gradient = document.createElement('div');
  gradient.className = 'themeColor_gradient';
  let gradientId = thisId.concat('_gradient');
  gradient.id = gradientId;

  // Create form container
  let inputs = document.createElement('div');
  inputs.className = 'spectrum-Form spectrum-Form--row themeColor_configs';

  // Color Name Input
  let colorName = document.createElement('div');
  colorName.className = 'spectrum-Form-item';
  let colorNameLabel = document.createElement('label');
  colorNameLabel.className = 'spectrum-FieldLabel';
  colorNameLabel.for = thisId.concat('_colorName');
  let colorNameInput = document.createElement('input');
  colorNameInput.type = 'text';
  colorNameInput.className = 'spectrum-Textfield colorNameInput';
  colorNameInput.id = thisId.concat('_colorName');
  colorNameInput.name = thisId.concat('_colorName');

  // if first color item, just name it gray.
  if(c == undefined) {
    if(items.length == 0) {
      // if first color with undefined c argument:
      colorNameInput.value = 'Gray';
    }
    else {
      // if not first, c not defined, randomly assign color name:
      colorNameInput.value = predefinedColorNames[Math.floor(Math.random()*predefinedColorNames.length)];
    }
  }
  else {
    // if c defined argument, this should be color name.
    colorNameInput.value = c;
  }


  colorNameInput.oninput = throttle(themeUpdateParams, 10);
  colorNameLabel.innerHTML = 'Color scale name';
  colorName.appendChild(colorNameLabel);
  colorName.appendChild(colorNameInput);

  // Key Color Input
  let keyColors = document.createElement('div');
  keyColors.className = 'spectrum-Form-item';
  let keyColorsLabel = document.createElement('label');
  keyColorsLabel.className = 'spectrum-FieldLabel';
  keyColorsLabel.for = thisId.concat('_keyColors');
  let keyColorsInput = document.createElement('div');
  keyColorsInput.className = 'keyColorsWrapper';
  let keyColorsId = thisId.concat('_keyColors');
  keyColorsInput.id = keyColorsId;
  keyColorsLabel.innerHTML = 'Key colors';
  keyColors.appendChild(keyColorsLabel);
  keyColors.appendChild(keyColorsInput);

  // Key Colors Actions
  let addColors = document.createElement('div');
  addColors.className = 'spectrum-Form-item labelSpacer keyColorActions';
  let addButton = document.createElement('button');
  addButton.className = 'spectrum-ActionButton';
  let buttonId = thisId.concat('_addKeyColor');
  addButton.id = buttonId;
  addButton.title = "Add key color"
  addButton.addEventListener('click', themeAddColorUpdate);
  addButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-Add" />
  </svg>
  `;
  let bulkButton = document.createElement('button');
  bulkButton.className = 'spectrum-ActionButton';
  let bulkId = thisId.concat('_addBulk');
  bulkButton.title = "Add bulk key colors"
  bulkButton.id = bulkId;
  bulkButton.addEventListener('click', addBulk);
  bulkButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-BoxAdd" />
  </svg>
  `;
  let clearKeyColorsButton = document.createElement('button');
  clearKeyColorsButton.className = 'spectrum-ActionButton';
  let clearColorsId = thisId.concat('_clearAllColors');
  clearKeyColorsButton.title = "Clear all key colors"
  clearKeyColorsButton.id = clearColorsId;
  clearKeyColorsButton.addEventListener('click', clearAllColors);
  clearKeyColorsButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-CloseCircle" />
  </svg>
  `;

  addColors.appendChild(clearKeyColorsButton);
  addColors.appendChild(addButton);
  addColors.appendChild(bulkButton);

  // Interpolation mode
  let interp = document.createElement('div');
  interp.className = 'spectrum-Form-item';
  let interpLabel = document.createElement('label');
  interpLabel.className = 'spectrum-FieldLabel';
  interpLabel.for = thisId.concat('_mode');
  let interpLabelText = 'Colorspace interpolation';
  let interpDropdown = document.createElement('div');
  interpDropdown.className = 'spectrum-Dropdown';
  interpDropdown.id = thisId.concat('_modeDropdown');
  let interpSelect = document.createElement('select');
  interpSelect.className = 'spectrum-FieldButton spectrum-Dropdown-trigger';
  interpSelect.id = thisId.concat('_mode');
  interpSelect.name = thisId.concat('_mode');
  interpSelect.oninput = throttle(themeUpdateParams, 20);
  let interpDropdownIcon = document.createElement('span');
  interpDropdownIcon.className = 'spectrum-Dropdown-iconWrapper';
  interpDropdownIcon.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-UIIcon-ChevronDownMedium spectrum-Dropdown-icon">
    <use xlink:href="#spectrum-css-icon-ChevronDownMedium"></use>
  </svg>`;

  interpLabel.innerHTML = interpLabelText;
  interpDropdown.appendChild(interpSelect);
  interpDropdown.appendChild(interpDropdownIcon);
  interp.appendChild(interpLabel);
  interp.appendChild(interpDropdown);

  // Interpolation options
  interpSelect.options.length = 0;

  let opts = {
    'CAM02': 'CIECAM02',
    'LCH': 'Lch',
    'LAB': 'Lab',
    'HSL': 'HSL',
    'HSLuv': 'HSLuv',
    'HSV': 'HSV',
    'RGB': 'RGB'
  };

  for(let index in opts) { interpSelect.options[interpSelect.options.length] = new Option(opts[index], index); }
  if (s == undefined) {
    interpSelect.value = 'CAM02';
  }
  else {
    interpSelect.value = s;
  }

  // Actions
  let actions = document.createElement('div');
  actions.className = 'spectrum-ButtonGroup spectrum-Form-item labelSpacer';
  // edit.addEventListener('click', openEditColorScale) // TODO => create openEditColorScale function to open colors tab w/ settings of this object.
  let deleteColor = document.createElement('button');
  deleteColor.className = 'spectrum-ActionButton';
  deleteColor.title = 'Delete color scale'
  deleteColor.id = thisId.concat('_delete');
  deleteColor.innerHTML = `
  <!-- <span class="spectrum-ActionButton-label">Add Color</span> -->
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;
  deleteColor.addEventListener('click', themeDeleteItem);
  actions.appendChild(deleteColor);

  // Put it all together
  inputs.appendChild(colorName);
  inputs.appendChild(keyColors);
  inputs.appendChild(addColors)
  inputs.appendChild(interp);
  inputs.appendChild(actions);

  item.appendChild(gradient);
  item.appendChild(inputs);

  wrapper.appendChild(item);

  // Then run functions on the basic placeholder inputs
  // document.getElementById(buttonId).click();
  if (k == undefined) {
    document.getElementById(buttonId).click();
  }
  else {
    for (let i = 0; i < k.length; i++) {
      themeAddColor(k[i], buttonId);
    }
  }
  // generate the number of values equal to the width of the item
  // let rampData = new Leonardo.Color({name: c, colorKeys: ['#000000'], colorspace: 'LAB'});
  let rampData = Leonardo.createScale({swatches: 30, colorKeys: ['#000000'], colorspace: 'LAB'});

  let colors = rampData.colorScale;

  ramp(colors, gradientId);
  toggleControls();
  baseScaleOptions();

  // let select = document.getElementById('view');
  // let value = select.value;

  // if(value == 'viewScaleOnly') {
  //   inputs.classList.add('is-hidden');
  //   gradient.classList.add('is-large');
  // }

  // else if(value == 'viewScaleConfig') { }

  // else if (value == 'viewSwatch') {
  //   inputs.classList.add('is-hidden');
  // }


  document.getElementById(thisId.concat('_colorName')).addEventListener('input', baseScaleOptions);
  document.getElementById(thisId.concat('_delete')).addEventListener('click', themeDeleteItem);

}

window.addColorScaleUpdate = addColorScaleUpdate;
function addColorScaleUpdate(c, k, s, r) {
  addColorScale(c, k, s, r);
  themeInput();
  let config = getThemeData();
  let name = getThemeName();

  config = JSON.stringify(config);

  updateParams(name, config);
}

function themeAddColorUpdate(c, thisId = this.id) {
  themeAddColor(c, thisId = this.id);
  let config = getThemeData();
  let name = getThemeName();

  config = JSON.stringify(config);

  updateParams(name, config);
}
function themeAddColor(c, thisId = this.id) {
  // let thisId = this.id;
  let parent = thisId.replace('_addKeyColor', '');
  let destId = parent.concat('_keyColors');
  let dest = document.getElementById(destId);
  let div = document.createElement('div');

  let randId = randomId();
  div.className = 'keyColor';
  div.id = randId + '-item';
  let sw = document.createElement('input');
  sw.type = "color";
  sw.value = c;
  sw.oninput = throttle(themeUpdateParams, 50);

  sw.className = 'keyColor-Item';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = c;

  let button = document.createElement('button');
  button.className = 'spectrum-ActionButton';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  button.addEventListener('click', deleteColor);
  div.appendChild(sw);
  div.appendChild(button);
  dest.appendChild(div);
}

window.themeInput = themeInput;
function themeInput() {
  let inputThemeName = getThemeName();
  let themeName = (!inputThemeName) ? 'theme': inputThemeName;
  let items = document.getElementsByClassName('themeColor_item');
  let colorScales = [];
  let themeOutputs = document.getElementById('themeOutputs');
  themeOutputs.innerHTML = ' ';
  let themeConfigs = getThemeData();
  let paramsOutput = document.getElementById('themeParams');

  if (items.length == 0) {
    // If no items, clear parameters and URL
    themeConfigs.baseScale = undefined;
    themeConfigs.colorScales = undefined;
    themeConfigs.brightness = undefined;
    themeConfigs.contrast = undefined;
    clearParams();

    let emptyState = document.getElementById('themeColorEmptyState');
    emptyState.classList.remove('is-hidden');

    paramsOutput.innerHTML = ' ';
  }
  // Create color scale objects
  else if (items.length > 0) {
    let colorsArray = [];
    let colorConfigsArray = [];
    let colorNameArray = [];
    let backgroundColor = "#ffffff";
    let backgroundColorName = '#ffffff'

    for (let i = 0; i < items.length; i++) {
      let id = items[i].id;

      let thisElement = document.getElementById(id);
      let colorData = getColorItemData(id);
      let colorArgs = colorData.colorArgs;
      let mode = colorData.mode;
      let ratios = colorData.ratios;
      let name = colorData.colorName;

      let gradientId = id.concat('_gradient');
      let gradient = document.getElementById(gradientId);
      gradient.innerHTML = ' ';
      let n = window.innerWidth - 272;

      let colorClass;
      if(name === themeConfigs.baseScale) {
        let configs = {name: name, colorKeys: colorArgs, ratios: ratios, colorspace: mode};
        colorConfigsArray.push(`let ${name} = new BackgroundColor(${JSON.stringify(configs)});`);
        colorClass = new Leonardo.BackgroundColor(configs);
        colorNameArray.push(name);
        backgroundColor = colorClass;
        backgroundColorName = name;
        colorsArray.push(colorClass);
      } else {
        let configs = {name: name, colorKeys: colorArgs, ratios: ratios, colorspace: mode};
        colorConfigsArray.push(`let ${name} = new Color(${JSON.stringify(configs)});`);
        colorClass = new Leonardo.Color(configs);
        colorNameArray.push(name);
        colorsArray.push(colorClass);
      }
      let rampData = Leonardo.createScale({swatches: 30, colorKeys: colorArgs, colorspace: mode});
      // let colors = colorClass.colorScale;

      let colors = cvdColors(rampData);

      ramp(colors, gradientId);
    }

    let theme = new Leonardo.Theme({
      colors: colorsArray,
      backgroundColor: backgroundColor,
      lightness: Number(themeConfigs.brightness),
      contrast: Number(themeConfigs.contrast)
    }).contrastColors;

    // console.log(theme)

    // Loop again after generating theme.
    for (let i = 0; i < items.length; i++) {
      let id = items[i].id;
      let thisElement = document.getElementById(id);
      let gradientId = id.concat('_gradient');
      let gradient = document.getElementById(gradientId);
      let colorObjs = theme[i+1].values;
      let arr = [];

      for(let i = 0; i < colorObjs.length; i ++) {
        arr.push(cvdColors(colorObjs[i].value));
      }
      // themeSwatchRamp(arr, gradientId);
    }

    let themeColorArray = [];

    let varPrefix = '--';

    // Iterate each color from theme except 1st object (background)
    for (let i=0; i<theme.length; i++) {
      let wrapper = document.createElement('div');

      let swatchWrapper = document.createElement('div');
      swatchWrapper.className = 'themeOutputColor';

      // Iterate each color value
      if (theme[i].values) {
        let p = document.createElement('p');
        p.className = 'spectrum-Subheading';
        p.innerHTML = theme[i].name;

        wrapper.appendChild(p);

        for(let j=0; j<theme[i].values.length; j++) { // for each value object
          let key = theme[i].values[j].name; // output "name" of color
          let prop = varPrefix.concat(key);
          let originalValue = theme[i].values[j].value; // output value of color
          // transform original color based on preview mode
          let value = cvdColors(originalValue);

          // create CSS property
          document.documentElement.style
            .setProperty(prop, value);
          // create swatch
          let div = document.createElement('div');
          div.className = 'themeOutputSwatch';
          // copy text should be for value of original color, not of preview color.
          div.setAttribute('data-clipboard-text', originalValue);
          div.setAttribute('tabindex', '0');
          div.style.backgroundColor = value;


          swatchWrapper.appendChild(div);
          themeColorArray.push(originalValue);
        }
        wrapper.appendChild(swatchWrapper);
      }
      else if (theme[i].background) {
        let p = document.createElement('p');
        p.className = 'spectrum-Subheading';
        p.innerHTML = 'Background';

        wrapper.appendChild(p);

        // grab background color data
        let key = 'theme-background'; // "name" of color
        let prop = varPrefix.concat(key);
        let originalValue = theme[i].background; // output value of color
        // set global variable value. Probably shouldn't do it this way.
        currentBackgroundColor = originalValue;
        let value = cvdColors(originalValue);

        // create CSS property
        document.documentElement.style
          .setProperty(prop, value);
        // create swatch
        let div = document.createElement('div');
        div.className = 'themeOutputSwatch';
        div.setAttribute('tabindex', '0');
        div.setAttribute('data-clipboard-text', originalValue);
        div.style.backgroundColor = value;

        swatchWrapper.appendChild(div);
        wrapper.appendChild(swatchWrapper);

        themeColorArray.push(originalValue);
      }

      themeOutputs.appendChild(wrapper);
    }
    // Run toggle to ensure proper visibility shown based on view mode
    toggleConfigs();

    let copyThemeColors = document.getElementById('copyThemeColors');
    copyThemeColors.setAttribute('data-clipboard-text', themeColorArray);

    paramsOutput.innerHTML = `${colorConfigsArray.join(`\n`)}
let ${themeName} = new Theme({
  colors: [${colorNameArray}],
  backgroundColor: ${backgroundColorName},
  lightness: ${themeConfigs.brightness},
  contrast: ${themeConfigs.contrast}
});`
  }
}

// Create options for colors to use as base scale
function baseScaleOptions() {
  let baseSelect = document.getElementById('themeBase');
  baseSelect.options.length = 0;

  let colorNames = document.getElementsByClassName('colorNameInput');
  let opts = {};
  for (let i = 0; i < colorNames.length; i++) {
    let colorname = colorNames[i].value;
    opts[colorname] = colorname;
  }

  for(let index in opts) { baseSelect.options[baseSelect.options.length] = new Option(opts[index], index); }
}

function toggleControls() {
  let items = document.getElementsByClassName('themeColor_item');
  let brightnessSliderWrap = document.getElementById('brightnessSliderWrapper');
  let brightnessSlider = document.getElementById('themeBrightnessSlider');
  let contrastSliderWrap = document.getElementById('contrastSliderWrapper');
  let contrastSlider = document.getElementById('themeContrastSlider');
  let themeBaseLabel = document.getElementById('themeBaseLabel');
  let modeDropdown = document.getElementById('modeDropdown');
  let baseSelect = document.getElementById('themeBase');

  if(items.length > 0) {
    // if there are items, enable fields
    brightnessSliderWrap.classList.remove('is-disabled');
    contrastSliderWrap.classList.remove('is-disabled');
    themeBaseLabel.classList.remove('is-disabled');
    modeDropdown.classList.remove('is-disabled');
    brightnessSlider.disabled = false;
    contrastSlider.disabled = false;
    baseSelect.disabled = false;
  }
  else if(items.length == 0) {
    // disable fields
    brightnessSliderWrap.classList.add('is-disabled');
    contrastSliderWrap.classList.add('is-disabled');
    themeBaseLabel.classList.add('is-disabled');
    modeDropdown.classList.add('is-disabled');
    brightnessSlider.disabled = true;
    contrastSlider.disabled = true;
    baseSelect.disabled = true;
    baseSelect.value = ' ';
  }
}

function themeUpdateParams() {
  console.log('Need to port over update params')
}
function clearParams() {
  console.log('Need to port over clearing the params')
}

function themeDeleteItem(e) {
  let id = e.target.parentNode.parentNode.parentNode.id;
  let self = document.getElementById(id);

  self.remove();
  baseScaleOptions();
  toggleControls();

  themeUpdateParams();

  let items = document.getElementsByClassName('themeColor_item');
  if(items.length == 0) {
    clearParams();

    document.documentElement.style
      .setProperty('--theme-background', '#f5f5f5');
  }
}


/////////////////////////////////////
//   Functions for GETTING data    //
/////////////////////////////////////

// GET all contrast ratios
function getContrastRatios() {
  let ratioInputs = document.getElementsByClassName('ratio-Field');
  let ratios = [];
  for(let i = 0; i < ratioInputs.length; i++) {
    ratios.push(ratioInputs[i].value);
  }
  return ratios;
}

// GET Color Scale Data
function getColorItemData(id) {
  let thisElement = document.getElementById(id);
  // 1. find color name
  let colorNameInput = id.concat('_colorName');
  let colorName = document.getElementById(colorNameInput).value;
  // 2. find all key colors
  let colorKeys = thisElement.getElementsByClassName('keyColor-Item');
  let inputColors = [];
  let tempArgs = [];
  for(let i=0; i<colorKeys.length; i++) {
    inputColors.push(colorKeys[i].value);
  }
  // Convert input value into a split array of hex values.
  // remove any whitespace from inputColors
  tempArgs.push(inputColors);
  let colorArgs = tempArgs.join("").split(',').filter(String);

  // 3. find mode
  let modeId = id.concat('_mode');
  let modeSelect = document.getElementById(modeId);
  let mode = modeSelect.value;

  // 4. find ratios
  let rVals = getContrastRatios();
  let r = new Array(rVals);
  let rSplit = r.join("").split(',');
  let ratios = rSplit.map(x => parseFloat(x));
  // TODO: remove all values of NaN

  return {
    colorName: colorName,
    colorArgs: colorArgs,
    mode: mode,
    ratios: ratios
  }
}

function getThemeName() {
  let themeName = themeTitleInput.value;
  return themeName;
}

// GET Theme Data
function getThemeData() {
  // Get base scale
  let baseSelect = document.getElementById('themeBase');
  let baseSelectValue = baseSelect.value;

  // Get brightness
  let brightnessSlider = document.getElementById('themeBrightnessSlider');
  let brightness = brightnessSlider.value;

  // Get contrast
  let contrastSlider = document.getElementById('themeContrastSlider');
  let contrast = contrastSlider.value;

  // For each item
  let items = document.getElementsByClassName('themeColor_item');
  let colorScales = [];

  for (let i = 0; i < items.length; i++) {
    let id = items[i].id;
    let thisElement = document.getElementById(id);

    let colorData = getColorItemData(id);

    let colorObj = {
      name: colorData.colorName,
      colorKeys: colorData.colorArgs,
      colorspace: colorData.mode,
      ratios: colorData.ratios
    };

    colorScales.push(colorObj);
  }

  return {
    baseScale: baseSelectValue,
    colorScales: colorScales,
    brightness: brightness,
    contrast: contrast
  }
}


/**
 * Temporary random name generator.
 * Should be replaced with random colors with properly assigned name.
 */

let predefinedColorNames = [
  'Azure',
  'Forest',
  'Cerulean',
  'Blue',
  'Pink',
  'Red',
  'Indigo',
  'Purple',
  'Blue',
  'Green',
  'Crimson',
  'Salmon',
  'Orange',
  'Tangerine',
  'Yellow',
  'Brown',
  'Umber',
  'Ochre',
  'Periwinkle',
  'Sage',
  'Rose',
  'Lavender',
  'Lilac',
  'Mauve',
  'Mustard',
  'Seafoam',
  'Celery',
  'Teal',
  'Turquise',
  'Sky',
  'Gray',
  'Slate'
];

/////////////
function cvdColors(colors) {
  let cvdMode = cvdModeDropdown.value;

  // if not an array
  if (!Array.isArray(colors)) {
    if (cvdMode == 'Deuteranomaly') {
      colors = blinder.deuteranomaly(colors);
      showToast();
    }
    else if (cvdMode == 'Deuteranopia') {
      colors = blinder.deuteranopia(colors);
      showToast();
    }
    else if (cvdMode == 'Protanomaly') {
      colors = blinder.protanomaly(colors);
      showToast();
    }
    else if (cvdMode == 'Protanopia') {
      colors = blinder.protanopia(colors);
      showToast();
    }
    else if (cvdMode == 'Tritanomaly') {
      colors = blinder.tritanomaly(colors);
      showToast();
    }
    else if (cvdMode == 'Tritanopia') {
      colors = blinder.tritanopia(colors);
      showToast();
    }
    else if (cvdMode == 'Achromatomaly') {
      colors = blinder.achromatomaly(colors);
      showToast();
    }
    else if (cvdMode == 'Achromatopsia') {
      colors = blinder.achromatopsia(colors);
      showToast();
    }
    else {
      hideToast();
    }
    colors = d3.rgb(colors).formatRgb();
  }
  // must be an array.
  else {
    if (cvdMode == 'Deuteranomaly') {
      colors = colors.map(c => blinder.deuteranomaly(c));
    }
    else if (cvdMode == 'Deuteranopia') {
      colors = colors.map(c => blinder.deuteranopia(c));
    }
    else if (cvdMode == 'Protanomaly') {
      colors = colors.map(c => blinder.protanomaly(c));
    }
    else if (cvdMode == 'Protanopia') {
      colors = colors.map(c => blinder.protanopia(c));
    }
    else if (cvdMode == 'Tritanomaly') {
      colors = colors.map(c => blinder.tritanomaly(c));
    }
    else if (cvdMode == 'Tritanopia') {
      colors = colors.map(c => blinder.tritanopia(c));
    }
    else if (cvdMode == 'Achromatomaly') {
      colors = colors.map(c => blinder.achromatomaly(c));
    }
    else if (cvdMode == 'Achromatopsia') {
      colors = colors.map(c => blinder.achromatopsia(c));
    }
    else {
      // do nothing
    }
    colors = colors.map(c => d3.rgb(c).formatRgb());
  }

  return colors;
}

/**
 * Toasts
 */

window.showToast = showToast;
function showToast() {
  let toast = document.getElementById("toastCVDpreview");
  if (toast.classList.contains("is-visible")) {
    // do nothing
  }
  else {
    toast.classList.remove("spectrum-Exit");
    toast.classList.add("spectrum-Bounce");
    toast.classList.add("is-visible");
  }
}

window.hideToast = hideToast;
function hideToast() {
  let toast = document.getElementById("toastCVDpreview");
  toast.classList.remove("spectrum-Bounce");
  toast.classList.add("spectrum-Exit");
  toast.classList.remove("is-visible");
}

window.exitPreview = exitPreview;
function exitPreview() {
  cvdModeDropdown.value = "None";

  themeInput();
  hideToast();
}

window.neverShowToast = neverShowToast;
function neverShowToast() {
  let toast = document.getElementById("toastCVDpreview");
  toast.classList.remove("spectrum-Bounce");
  toast.classList.add("spectrum-Exit");
  toast.classList.remove("is-visible");
  toast.classList.add("hidden");
}
