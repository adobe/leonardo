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
import '@spectrum-css/vars/dist/spectrum-darkest.css';

import '@spectrum-css/page/dist/index-vars.css';
import '@spectrum-css/icon/dist/index-vars.css';
import '@spectrum-css/link/dist/index-vars.css';
import '@spectrum-css/alert/dist/index-vars.css';
import '@spectrum-css/radio/dist/index-vars.css';
import '@spectrum-css/sidenav/dist/index-vars.css';
import '@spectrum-css/dialog/dist/index-vars.css';
import '@spectrum-css/button/dist/index-vars.css';
import '@spectrum-css/actionbutton/dist/index-vars.css';
import '@spectrum-css/actiongroup/dist/index-vars.css';
import '@spectrum-css/divider/dist/index-vars.css';
import '@spectrum-css/fieldgroup/dist/index-vars.css';
import '@spectrum-css/textfield/dist/index-vars.css';
import '@spectrum-css/picker/dist/index-vars.css';
import '@spectrum-css/fieldlabel/dist/index-vars.css';
import '@spectrum-css/checkbox/dist/index-vars.css';
import '@spectrum-css/switch/dist/index-vars.css';
import '@spectrum-css/buttongroup/dist/index-vars.css';
import '@spectrum-css/tooltip/dist/index-vars.css';
import '@spectrum-css/slider/dist/index-vars.css';
import '@spectrum-css/tabs/dist/index-vars.css';
import '@spectrum-css/toast/dist/index-vars.css';
import '@spectrum-css/illustratedmessage/dist/index-vars.css';
import '@spectrum-css/typography/dist/index-vars.css';

import './scss/colorinputs.scss';
import './scss/charts.scss';
import './scss/style.scss';

import '@adobe/focus-ring-polyfill';

import * as Leo from '@adobe/leonardo-contrast-colors';

import * as blinder from 'color-blind';
import * as charts2d from './charts2d.js';
import * as charts from './charts';
import * as chartData from './data.js';


import * as d3 from 'd3';

// Import d3 plugins and add them to the d3 namespace
import * as d3cam02 from 'd3-cam02';
import * as d3hsluv from 'd3-hsluv';
import * as d3hsv from 'd3-hsv';
import * as d33d from 'd3-3d';
Object.assign(d3, d3cam02, d3hsluv, d3hsv, d33d);


import hljs from 'highlight.js/lib/core';
// import hljs from 'highlight.js/lib/common';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

import loadIcons from 'loadicons';
loadIcons('./spectrum-css-icons.svg');
loadIcons('./spectrum-icons.svg');

// import {randomId, throttle, deleteColor} from './index.js'
import ClipboardJS from 'clipboard';
import { getContrast } from '@adobe/leonardo-contrast-colors/utils';

new ClipboardJS('.copyButton');
new ClipboardJS('.themeOutputSwatch');

window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', event => {
  if (event.matches) {
    //dark mode
    document.querySelector('body').classList.remove('spectrum--light');
    document.querySelector('body').classList.add('spectrum--darkest');
  } else {
    //light mode
    document.querySelector('body').classList.add('spectrum--light');
    document.querySelector('body').classList.remove('spectrum--darkest');
  }
})
const mq = window.matchMedia('(prefers-color-scheme: dark)');
if (mq.matches) {
  //dark mode
  document.querySelector('body').classList.add('spectrum--darkest');
} else {
  //light mode
  document.querySelector('body').classList.add('spectrum--light');
}

const tempGray = new Leo.Color({
  name: 'Gray',
  colorKeys: ['#cacaca'],
  colorspace: 'RGB',
  ratios: [3, 4.5]
});
const tempBackground = new Leo.BackgroundColor({
  name: 'Gray',
  colorKeys: ['#cacaca'],
  colorspace: 'RGB',
  ratios: [3, 4.5]
});
let _theme = new Leo.Theme({
  colors: [ tempGray ],
  backgroundColor: tempBackground,
  lightness: 98,
  contrast: 1
})
// Initialize with temporary theme object to modify later.
// console.log(testTheme)

var currentBackgroundColor;
window.ratioInputs = [];

let cvdModeDropdown = document.getElementById('cvdMode');

function randomId() {
   return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
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

function deleteColor(e) {
  var id = e.target.parentNode.id;
  // console.log(id)
  var self = document.getElementById(id);

  self.remove();

  themeUpdateParams();
}

function paramSetup() {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));
  let pathName = url.pathname;

  if(params.has('name')) {
    let themeNameInput = document.getElementById('themeName');
    themeNameInput.value = params.get('name').toString();
  }
  if(params.has('config') && params.get('config') !== undefined) {
    let configParam = params.get('config');
    let config = JSON.parse(configParam);
    let colorScales = config.colorScales;
    let baseScale = config.baseScale;
    let brightness = config.brightness;
    let contrast;
    if(!config.contrast) {
      contrast = 1;
    } else {
      contrast = config.contrast;
    }

    // for(let i = 0; i < colorScales.length; i++) {
    //   let colorName = colorScales[i].name;
    //   let keyColors = colorScales[i].colorKeys;
    //   let colorSpace = colorScales[i].colorspace;
    //   let ratios = colorScales[i].ratios;
    //   // Create color scale item
    //   addColorScale(colorName, keyColors, colorSpace, ratios);
    // }

    if(colorScales.length > 0) {
      colorScales.map(color => {
        let colorName = color.name;
        let keyColors = color.colorKeys;
        let colorSpace = color.colorspace;
        let ratios = color.ratios;
        // Create color scale item
        let newColor = new Leo.Color({
          name: colorName,
          colorKeys: keyColors,
          colorspace: colorSpace,
          ratios: ratios
        })

        addColorScale(newColor);
      })
    } else {
      // addColorScale('Gray', ['#000000'], 'CIECAM02', [3, 4.5]);
    }

    let slider = document.getElementById('themeBrightnessSlider');
    let sliderVal = document.getElementById('themeBrightnessValue');
    slider.value = brightness;
    sliderVal.innerHTML = brightness;

    let contrastSlider = document.getElementById('themeContrastSlider');
    let contrastSliderVal = document.getElementById('themeContrastValue');
    contrastSlider.value = contrast;
    contrastSliderVal.innerHTML = contrast;

    let themeBase = document.getElementById('themeBase');
    themeBase.value = baseScale;
  }
  else if(!params.has('config') || params.get('config') === undefined) {
    addRatios([3, 4.5]);
    // addColorScale('Gray', ['#000000'], 'CAM02');
    let length = _theme.colors.length;
    for(let i=0; i<length; i++) {
      addColorScale(_theme.colors[i]);
    }
  }

  sliderInput();
  // themeInput();
}
paramSetup();

/* ---------------------------  */
/*     CREATE THEME SCRIPTS     */
/* ---------------------------
1. Generate Color Scale object
2. For each color scale object, function for color inputs.
3. AddColor function (per object)
4. Delete object
5. Add object (run generate color)
6. Param setup
7. Param input (read if has params )
8. Function output
9. Colors output (for each object, output colors in panel)
10. Toggle configs visibility
11. Brightness slider value sync
12. Base color input options based on color objects available
13. Add color from Leonardo URL
14.
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

window.addColorScale = addColorScale;
function addColorScale(newColor) {
  // if first color item, just name it gray.
  if(!newColor) {
    let colorName;
    if(_theme.colors.length == 0) colorName = 'Gray';
    else colorName = predefinedColorNames[Math.floor(Math.random()*predefinedColorNames.length)];
    let ratios = getContrastRatios();
    if (ratios === undefined) ratios = [4.5]

    newColor = new Leo.Color({
      name: colorName,
      colorKeys: ['#000000'],
      colorspace: 'CAM02',
      ratios: ratios
    })
  }

  _theme.addColor = newColor;

  // create unique ID for color object
  let thisId = randomId();

  let wrapper = document.getElementById('themeColorWrapper');
  let emptyState = document.getElementById('themeColorEmptyState');
  // Remove empty state
  if(emptyState.classList.contains('is-hidden')) {
    // Do nothing
  } else {
    emptyState.classList.add('is-hidden');
  }

  // Create theme item
  let item = document.createElement('button');
  item.className = 'themeColor_item';
  item.id = thisId;

  // Create color gradient swatch
  let gradientSwatch = document.createElement('div');
  let gradientSwatchId = thisId.concat('_gradientSwatch');
  gradientSwatch.id = gradientSwatchId;
  gradientSwatch.className = 'gradientSwatch';

  // Color Name Input
  let colorName = document.createElement('div');
  colorName.className = 'spectrum-Form-item spectrum-Form-item--row';
  let colorNameInputWrapper = document.createElement('div');
  colorNameInputWrapper.className = 'spectrum-Textfield spectrum-Textfield--quiet';
  let colorNameInput = document.createElement('input');
  colorNameInput.type = 'text';
  colorNameInput.className = 'spectrum-Textfield-input colorNameInput';
  colorNameInput.id = thisId.concat('_colorName');
  colorNameInput.name = thisId.concat('_colorName');
  colorNameInput.value = newColor.name;

  colorNameInput.onblur = throttle(themeUpdateParams, 10);
  colorNameInput.addEventListener('change', (e) => {
    _theme.updateColor = {color: c, name: e.target.value}
  });
  colorNameInputWrapper.appendChild(colorNameInput)
  colorName.appendChild(colorNameInputWrapper);

  // Actions
  let actions = document.createElement('div');
  actions.className = 'spectrum-ButtonGroup spectrum-Form-item spectrum-Form-item--row labelSpacer';
  let edit = document.createElement('button');
  edit.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  edit.id = `${thisId}-toggleConfig`;
  edit.title = "Show / hide configurations"
  edit.innerHTML = `
  <!-- <span class="spectrum-ActionButton-label">Add from URL</span> -->
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-Properties" />
  </svg>`
  edit.addEventListener('click', showColorDetails);
  // edit.addEventListener('click', openEditColorScale) // TODO => create openEditColorScale function to open colors tab w/ settings of this object.
  let deleteColor = document.createElement('button');
  deleteColor.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  deleteColor.title = 'Delete color scale'
  deleteColor.id = thisId.concat('_delete');
  deleteColor.innerHTML = `
  <!-- <span class="spectrum-ActionButton-label">Add Color</span> -->
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;
  actions.appendChild(edit);
  actions.appendChild(deleteColor);

  colorName.appendChild(actions);
  item.appendChild(gradientSwatch);
  item.appendChild(colorName);

  wrapper.appendChild(item);

  let rampData = Leo.createScale({swatches: 30, colorKeys: newColor.colorKeys, colorspace: newColor.colorspace});
  let colors = rampData;

  themeRamp(colors, gradientSwatchId, '200');
  toggleControls();
  baseScaleOptions();

  document.getElementById(thisId.concat('_colorName')).addEventListener('input', baseScaleOptions);
  // document.getElementById(thisId.concat('_delete')).addEventListener('click', themeDeleteItem);

  // deleteColor.addEventListener('click', );
  deleteColor.addEventListener('click', function(e){ 
    themeDeleteItem(e);
    _theme.removeColor = newColor;
  });
  // console.log(_theme)
}

window.addColorScaleUpdate = addColorScaleUpdate;
function addColorScaleUpdate(c, k, s, r) {
  // if (!c) c = 'nameIsMissingSomewhere';
  addColorScale(c, k, s, r);
  themeInput();
  let config = getThemeData();
  let name = getThemeName();

  config = JSON.stringify(config);

  // TODO: Uncomment this and get it working.
  // updateParams(name, config);
}

// Update theme when theme name is changed
document.getElementById('themeNameInput').addEventListener('input', throttle(themeUpdateParams, 50));
// Update theme when base color selection is changed
document.getElementById('themeBase').addEventListener('input', throttle(themeUpdateParams, 50));

function themeRamp(colors, dest, angle) {
  if(!angle) angle = '270';
  angle = `${angle}deg`;
  let container = document.getElementById(dest);
  let gradient = document.createElement('div');
  gradient.className = 'gradient'

  gradient.style.backgroundImage = `linear-gradient(${angle}, ${colors})`;
  container.appendChild(gradient)
}

function themeRampKeyColors(colorKeys, dest) {
  let container = document.getElementById(dest);

  colorKeys.map(key => {
    let lightness = d3.hsluv(key).v;
    let lightnessPerc = 100/lightness;
    // Adjust offset based on same percentage of the 
    // width of the dot, essentially framing the dot
    // min/max positions within the ramp itself
    let dotOffset = 32 / lightnessPerc;
    let leftPosition = `calc(${Math.round(lightness)}% - ${Math.round(dotOffset)}px)`;
    let dot = document.createElement('div');
    dot.className = 'themeRampDot';
    dot.style.backgroundColor = key;
    dot.style.left = leftPosition;
    container.appendChild(dot);
  })
}

function themeSwatchRamp(colors, dest) {
  let container = document.getElementById(dest);
  let wrapper = document.createElement('div');
  wrapper.className = 'gradientColorSwatchWrapper is-hidden';

  for(let i = 0; i < colors.length; i++) {
    let swatch = document.createElement('div');
    swatch.className = 'gradientColorSwatch';
    swatch.style.backgroundColor = colors[i];

    wrapper.appendChild(swatch);
  }
  container.appendChild(wrapper);
}

// Recreation of addColor function, specifying items needed for theme UI
function addKeyColorInput(c, thisId = this.id, currentColorName, index) {
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

  let currentColor = _theme.colors.filter(entry => {return entry.name === currentColorName});
  currentColor = currentColor[0];

  sw.oninput = (e) => {
    // Replace current indexed value from color keys with new value from color input field
    let currentKeys = currentColor.colorKeys;
    currentKeys.splice(index, 1, e.target.value)
    _theme.updateColor = {color: currentColorName, colorKeys: currentKeys}

    updateRamps(currentColor, parent)
    updateColorDots();
    // throttle(themeUpdateParams, 50)
  };

  sw.className = 'keyColor-Item';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = c;

  let button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  // button.addEventListener('click', deleteColor);
  button.addEventListener('click',  function(e) {
    // Remove current indexed value from color keys
    let currentKeys = currentColor.colorKeys;
    currentKeys.splice(index, 1)
    _theme.updateColor = {color: currentColorName, colorKeys: currentKeys}

    var id = e.target.parentNode.id;
    // console.log(id)
    var self = document.getElementById(id);
    updateRamps(currentColor, parent)
    updateColorDots();

    self.remove();
    // throttle(themeUpdateParams, 50)
  });

  div.appendChild(sw);
  div.appendChild(button);
  dest.appendChild(div);
}


function addKeyColor(e) {
  let thisId = e.target.id;
  let parentId = thisId.replace('_addKeyColor', '');

  let currentColorNameInput = parentId.concat('_colorName2');
  let currentColorName = document.getElementById(currentColorNameInput).value;

  let currentColor = _theme.colors.filter(entry => {return entry.name === currentColorName});
  currentColor = currentColor[0];
  let currentKeys = [...currentColor.colorKeys];

  let lastIndex = currentColor.colorKeys.length;
  if(!lastIndex) lastIndex = 0;
  let lastColor = (lastIndex > 0) ? d3.hsluv(currentColor.colorKeys[lastIndex - 1]) : d3.hsluv(currentColor.colorKeys[0]);
  let lastColorLightness = lastColor.v;
  let fCtintHalf = (100 - lastColorLightness) / 2;
  let fCshadeHalf = lastColorLightness / 2;
  let c = ( lastColorLightness >= 50) ? d3.hsluv(lastColor.l, lastColor.u, fCshadeHalf) :  d3.hsluv(lastColor.l, lastColor.u, fCtintHalf);
  c = d3.rgb(c).formatHex();
  // console.log(d3.rgb(lastColor).formatHex())
  currentKeys.push(c)

  // Update color class arguments via the theme class
  _theme.updateColor = {color: currentColorName, colorKeys: currentKeys}
  addKeyColorInput(c, thisId, currentColorName, lastIndex);

  console.log(currentColor.colorKeys)
  // Update gradient
  updateRamps(currentColor, parentId);
  updateColorDots();
}

function updateRamps(color, id) {
  // Upate ramp in color detail view
  let rampData = Leo.createScale({swatches: 30, colorKeys: color.colorKeys, colorspace: color.colorspace, smooth: color.smooth});
  let colors = rampData;
  let gradientId = id.concat('_gradient');
  document.getElementById(gradientId).innerHTML = ' ';
  themeRamp(colors, gradientId);
  
  // Create key color dots
  themeRampKeyColors(color.colorKeys, gradientId);

  // Update gradient swatch from panel view
  let gradientSwatchId = id.concat('_gradientSwatch');
  document.getElementById(gradientSwatchId).innerHTML = ' ';
  themeRamp(colors, gradientSwatchId, '200');

  createRGBchannelChart(rampData);

  let chartsModeSelect = document.getElementById('chartsMode');
  let chartsMode = chartsModeSelect.value;
  createInterpolationCharts(rampData, chartsMode)
}

function updateColorDots() {
  // Create dots for color wheel
  let colorWheelModeDropdown = document.getElementById('colorWheelMode');
  let colorWheelMode = colorWheelModeDropdown.value

  let allKeys = getAllColorKeys();
  let arr = getConvertedColorCoodrindates(allKeys, colorWheelMode);
  createColorWheelDots(arr);
}

// Deletes a Color class from Theme
function themeDeleteItem(e) {
  let id = e.target.parentNode.parentNode.parentNode.id;
  let self = document.getElementById(id);
  // console.log(`Deleting color ${id}`)

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

// function themeEditColor(e) {
//   let id = e.target.parentNode.parentNode.parentNode.id;
//   let thisElement = document.getElementById(id);

//   let data = getColorItemClass(id)
//   console.log(data)
// }
function themeEditColor(Color) {
  console.log(Color)
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
  let baseSelect = document.getElementById('themeBase');

  if(items.length > 0) {
    // if there are items, enable fields
    brightnessSliderWrap.classList.remove('is-disabled');
    contrastSliderWrap.classList.remove('is-disabled');
    themeBaseLabel.classList.remove('is-disabled');
    baseSelect.classList.remove('is-disabled');
    brightnessSlider.disabled = false;
    contrastSlider.disabled = false;
    baseSelect.disabled = false;
  }
  else if(items.length == 0) {
    // disable fields
    brightnessSliderWrap.classList.add('is-disabled');
    contrastSliderWrap.classList.add('is-disabled');
    themeBaseLabel.classList.add('is-disabled');
    baseSelect.classList.add('is-disabled');
    brightnessSlider.disabled = true;
    contrastSlider.disabled = true;
    baseSelect.disabled = true;
    baseSelect.value = ' ';
  }
}

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

var themeName = document.getElementById('themeName');

// Theme input function should be reserved for theme-level outputs
// such as displaying output colors, function parameters, and doc title
window.themeInput = themeInput;
function themeInput() {
  let inputThemeName = getThemeName();
  let themeName = (!inputThemeName) ? 'theme': inputThemeName;
  let items = document.getElementsByClassName('themeColor_item');
  // console.log(`Items are ${items.length}`)
  // console.log(`Colors are ${_theme.colors.length}`)
  let themeOutputs = document.getElementById('themeOutputs');
  themeOutputs.innerHTML = ' ';

  let paramsOutput = document.getElementById('themeParams');

  let allKeyColors = [];

  let colorsArray = [];
  let colorConfigsArray = [];
  let colorNameArray = [];
  let backgroundColor = "#ffffff";
  let backgroundColorName = '#ffffff'

  for (let i = 0; i < items.length; i++) {
    let id = items[i].id;

    let thisElement = document.getElementById(id);
    let colorData = getColorItemClass(id);

    let colorArgs = colorData.colorKeys;
    let mode = colorData.colorspace;
    let ratios = colorData.ratios;
    let name = colorData.name;
    let smooth = colorData.smooth;

    allKeyColors.push(colorArgs);

    let colorClass;
    if(name === _theme.backgroundColor.name) {
      let configs = {name: name, colorKeys: colorArgs, ratios: ratios, colorspace: mode};
      colorConfigsArray.push(`let ${name} = new BackgroundColor(${JSON.stringify(configs)});`);
      colorClass = new Leo.BackgroundColor(configs);
      colorNameArray.push(name);
      backgroundColor = colorClass;
      backgroundColorName = name;
      colorsArray.push(colorClass);
    } else {
      let configs = {name: name, colorKeys: colorArgs, ratios: ratios, colorspace: mode};
      colorConfigsArray.push(`let ${name} = new Color(${JSON.stringify(configs)});`);
      colorClass = new Leo.Color(configs);
      colorNameArray.push(name);
      colorsArray.push(colorClass);
    }
    let colors = Leo.createScale({swatches: 30, colorKeys: colorArgs, colorspace: mode, smooth: smooth});

    colors = cvdColors(colors);

  }

  let theme = _theme.contrastColors;
  
  const themeBackgroundColor = theme[0].background;
  const themeBackgroundColorArray = [d3.rgb(themeBackgroundColor).r, d3.rgb(themeBackgroundColor).g, d3.rgb(themeBackgroundColor).b]
  const backgroundLum = d3.hsluv(themeBackgroundColor).v;

  // Loop again after generating theme.
  for (let i = 0; i < items.length; i++) {
    let id = items[i].id;
    let thisElement = document.getElementById(id);
    // let gradientId = id.concat('_gradient');
    // let gradient = document.getElementById(gradientId);
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
      p.className = 'spectrum-Detail spectrum-Detail--sizeS';
      p.style.color = (backgroundLum > 50) ? '#000000' : '#ffffff';
      p.innerHTML = theme[i].name;

      wrapper.appendChild(p);

      for(let j=0; j<theme[i].values.length; j++) { // for each value object
        let key = theme[i].values[j].name; // output "name" of color
        let prop = varPrefix.concat(key);
        let originalValue = theme[i].values[j].value; // output value of color
        // transform original color based on preview mode
        let value = cvdColors(originalValue);

        // get the ratio to print inside the swatch
        let contrast = theme[i].values[j].contrast;
        // console.log(originalValue, themeBackgroundColor)
        let colorArray = [d3.rgb(originalValue).r, d3.rgb(originalValue).g, d3.rgb(originalValue).b]
        let actualContrast = Leo.contrast(colorArray, themeBackgroundColorArray);
        let contrastRounded = (Math.round(actualContrast * 100))/100;
        let contrastText = document.createTextNode(contrastRounded);
        let contrastTextSpan = document.createElement('span');
        contrastTextSpan.className = 'themeOutputSwatch_contrast';
        contrastTextSpan.appendChild(contrastText);
        contrastTextSpan.style.color = (d3.hsluv(originalValue).v > 50) ? '#000000' : '#ffffff';

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
        div.style.borderColor = (backgroundLum > 50 && contrast < 3) ?  'rgba(0, 0, 0, 0.2)' : ((backgroundLum <= 50 && contrast < 3) ? ' rgba(255, 255, 255, 0.4)' : 'transparent');
        div.appendChild(contrastTextSpan);

        swatchWrapper.appendChild(div);
        themeColorArray.push(originalValue);
      }
      wrapper.appendChild(swatchWrapper);
    }
    else if (theme[i].background) {
      let p = document.createElement('p');
      p.className = 'spectrum-Detail spectrum-Detail--sizeS';
      p.innerHTML = 'Background color';
      p.style.color = (backgroundLum > 50) ? '#000000' : '#ffffff';

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
      div.style.borderColor = (backgroundLum > 50) ?  'rgba(0, 0, 0, 0.2)' : ((backgroundLum <= 50) ? ' rgba(255, 255, 255, 0.4)' : 'transparent');

      swatchWrapper.appendChild(div);
      wrapper.appendChild(swatchWrapper);

      themeColorArray.push(originalValue);
    }

    themeOutputs.appendChild(wrapper);
  }
  // Run toggle to ensure proper visibility shown based on view mode
  // toggleConfigs();

  let copyThemeColors = document.getElementById('copyThemeColors');
  copyThemeColors.setAttribute('data-clipboard-text', themeColorArray);

  let paramOutputString = `${colorConfigsArray.join(`\n`)}
  let ${themeName} = new Theme({
    colors: [${colorNameArray}],
    backgroundColor: ${backgroundColorName},
    lightness: ${_theme.brightness},
    contrast: ${_theme.contrast}
  });`;
  const highlightedCode = hljs.highlight(paramOutputString, {language: 'javascript'}).value
  paramsOutput.innerHTML = highlightedCode;


  let chartRatios = getContrastRatios();
  createRatioChart(chartRatios);

  // Create dots for color wheel
  // let allKeyColorsMerged = [].concat.apply([], allKeyColors);
  let colorWheelModeDropdown = document.getElementById('colorWheelMode');
  let colorWheelMode = colorWheelModeDropdown.value

  let allKeys = getAllColorKeys();
  let arr = getConvertedColorCoodrindates(allKeys, colorWheelMode);
  createColorWheelDots(arr);

  // console.log(arr)
  // }
}


// Temporary for debugging
window.getTheme = getTheme;
function getTheme(param) {
  return _theme[`${param}`];
}

function createRatioChart(chartRatios) {
  let dest = document.getElementById('contrastChart');
  dest.innerHTML = ' ';

  const fillRange = (start, end) => {
    return Array(end - start + 1).fill().map((item, index) => start + index);
  };
  let dataXcontrast = fillRange(1, chartRatios.length);
  let dataContrast = [
    {
      x: dataXcontrast,
      y: chartRatios.map(function(d) {return parseFloat(d);}) // convert to number
    }
  ];
  let minRatio = Math.min(...chartRatios);
  let maxRatio = Math.max(...chartRatios);
  let yMin = (minRatio < 1) ? minRatio: 1;
  let yMax = (maxRatio < 7) ? 7 : ((maxRatio < 12) ? 12 : 21);
  charts.createChart(dataContrast, 'Contrast ratio', 'Swatches (sorted)', "#contrastChart", yMin, yMax, true);
}


function createRGBchannelChart(colors) {
  let dest = document.getElementById('RGBchart');
  dest.innerHTML = ' ';
  colors = [...colors];
  colors.push('#000000');

  // Create chart headers
  let RGBheader = document.createElement('h5');
  RGBheader.className = 'spectrum-Typography spectrum-Heading spectrum-Heading--sizeXXS';
  RGBheader.innerHTML = "RGB channels";
  dest.appendChild(RGBheader);

  const fillRange = (start, end) => {
    return Array(end - start + 1).fill().map((item, index) => start + index);
  };
  let dataX = fillRange(1, colors.length);
  let sortedDataX = dataX.sort((a, b) => b-a);

  let data = [
    {
      x: sortedDataX,
      y: colors.map(function(d) {return d3.rgb(d).r;}) 
    },
    {
      x: sortedDataX,
      y: colors.map(function(d) {return d3.rgb(d).g;}) 
    },
    {
      x: sortedDataX,
      y: colors.map(function(d) {return d3.rgb(d).b;}) 
    }
  ];

  charts.createChart(data, ' ', ' ', "#RGBchart", 0, 255);
}

function createInterpolationCharts(colors, mode) {
  let dest = document.getElementById('interpolationChart');
  dest.innerHTML = ' ';
  let dest2 = document.getElementById('interpolationChart2');
  dest2.innerHTML = ' ';

  // Identify mode channels
  let c1, c2, c3, func, yMin, yMax, c1Label, c2Label, yLabel;
  if(mode === 'RGB') {
    func = 'hsl';
    c1 = 'h';
    c1Label = `Hue (HSL - H)`;
    c2 = 's';
    c2Label = `Saturation (HSL - S)`;
    // c3 = 'l';
    yMin = 0;
    yMax = 360;
  }
  if(mode === 'LAB') {
    func = 'lab';
    c1 = 'a';
    c1Label = `Redness / Greenness (${mode} - A)`;
    c2 = 'b';
    c2Label = `Blueness / Yellowness (${mode} - B)`;
    // c3 = 'l';
  }
  if(mode === 'LCH') {
    func = 'lch';
    c1 = 'h';
    c1Label = `Hue (${mode} - H)`;
    c2 = 'c';
    c2Label = `Chroma (${mode} - C)`;
    // c3 = 'l';
    yMin = 0;
    yMax = 360;
  }
  if(mode === 'CAM02') {
    func = 'jab';
    c1 = 'a';
    c1Label = `Redness / Greenness (${mode} - A)`;
    c2 = 'b';
    c2Label = `Blueness / Yellowness (${mode} - B)`;
    // c3 = 'J';
  }
  if(mode === 'CAM02p') {
    func = 'jch';
    c1 = 'h';
    c1Label = `Hue (${mode} - H)`;
    c2 = 'c';
    c2Label = `Chroma (${mode} - C)`;
    // c3 = 'J';
    yMin = 0;
    yMax = 360;
  }
  if(mode === 'HSL') {
    func = 'hsl';
    c1 = 'h';
    c1Label = `Hue (${mode} - H)`;
    c2 = 's';
    c2Label = `Saturation (${mode} - S)`;
    // c3 = 'l';
    yMin = 0;
    yMax = 360;
  }
  if(mode === 'HSLuv') {
    func = 'hsluv';
    c1 = 'l';
    c1Label = `Hue (${mode} - H)`;
    c2 = 'u';
    c2Label = `Saturation (${mode} - S)`;
    // c3 = 'v';
    yMin = 0;
    yMax = 360;
  }
  if(mode === 'HSV') {
    func = 'hsv';
    c1 = 'h';
    c1Label = `Hue (${mode} - H)`;
    c2 = 's';
    c2Label = `Saturation (${mode} - S)`;
    // c3 = 'v';
    yMin = 0;
    yMax = 360;
  }
  // Create chart header
  let InterpolationHeader = document.createElement('h5');
  InterpolationHeader.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
  InterpolationHeader.innerHTML = `${c1Label}`;
  dest.appendChild(InterpolationHeader);
  let InterpolationHeader2 = document.createElement('h5');
  InterpolationHeader2.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
  InterpolationHeader2.innerHTML = `${c2Label}`;
  dest2.appendChild(InterpolationHeader2);

  const fillRange = (start, end) => {
    return Array(end - start).fill().map((item, index) => start + index);
  };
  let dataX = fillRange(1, colors.length);
  let sortedDataX = dataX.sort((a, b) => b-a);

  let dataA = [
    {
      x: sortedDataX,
      y: colors.map(function(d) {return filterNaN(d3[func](d)[c1]);}) 
    }
  ];
  let dataB = [
    {
      x: sortedDataX,
      y: colors.map(function(d) {return filterNaN(d3[func](d)[c2]);}) 
    }
  ];
  
  charts.createChart(dataA, ' ', ' ', "#interpolationChart", yMin, yMax);
  charts.createChart(dataB, ' ', ' ', "#interpolationChart2", yMin, yMax);
}


window.themeUpdateParams = themeUpdateParams;
function themeUpdateParams() {
  themeInput();
  // let config = getThemeData();
  // let name = getThemeName();

  // config = JSON.stringify(config);

  // TODO: uncomment and get this working
  // updateParams(name, config);
}

let sliderB = document.getElementById('themeBrightnessSlider');
let sliderC = document.getElementById('themeContrastSlider');
sliderB.addEventListener('input', sliderValue);
sliderC.addEventListener('input', sliderValue);

window.sliderValue = sliderValue;
function sliderValue(e) {
  let id = e.target.id;
  let slider = document.getElementById(id);
  let labelId = id.replace('Slider', 'Value');
  let label = document.getElementById(labelId);
  label.innerHTML = slider.value;
}

window.sliderInput = sliderInput;
function sliderInput() {
  let items = document.getElementsByClassName('themeColor_item');
  // If theme items are present, run themeInput
  if (items !== undefined) {
    themeUpdateParams();
  }
}

window.addBulk = addBulk;
function addBulk(e) {
  let id = e.target.parentNode.parentNode.parentNode.id;
  let button = document.getElementById('bulkAddButton');
  button.addEventListener('click', bulkItemColorInput);

  let dialog = document.getElementsByClassName('addBulkColorDialog');
  for(let i = 0; i < dialog.length; i++) {
    dialog[i].classList.add("is-open");
    dialog[i].id = id.concat('_dialog');
  }
  document.getElementById('dialogOverlay').style.display = 'block';
}

window.cancelBulk = cancelBulk;
function cancelBulk() {
  let dialog = document.getElementsByClassName('addBulkColorDialog');
  for(let i = 0; i < dialog.length; i++) {
    dialog[i].classList.remove("is-open");
    dialog[i].id = ' ';
  }
  document.getElementById('dialogOverlay').style.display = 'none';
}

window.addFromURLDialog = addFromURLDialog;
function addFromURLDialog() {
  let button = document.getElementById('addFromURLButton');
  button.addEventListener('click', addFromURL);

  let dialog = document.getElementById('addFromURLDialog');
  dialog.classList.add("is-open");

  document.getElementById('dialogOverlay').style.display = 'block';
}
window.cancelURL = cancelURL;
function cancelURL() {
  let dialog = document.getElementById('addFromURLDialog');
  dialog.classList.remove("is-open");

  document.getElementById('dialogOverlay').style.display = 'none';
}

window.bulkItemColorInput = function bulkItemColorInput(e) {
  let id = e.target.parentNode.parentNode.id;
  let itemId = id.replace('_dialog', '');
  let keyInputId = itemId.concat('_keyColors');
  let buttonId = itemId.concat('_addKeyColor');
  let keyInputs = document.getElementById(keyInputId);

  let bulkInputs = document.getElementById('bulkColors');
  let bulkValues = bulkInputs.value.replace(/\r\n/g,"\n").replace(/[,\/]/g,"\n").replace(" ", "").replace(/['\/]/g, "").replace(/["\/]/g, "").replace(" ", "").split("\n");
  for (let i=0; i<bulkValues.length; i++) {
    if (!bulkValues[i].startsWith('#')) {
      bulkValues[i] = '#' + bulkValues[i]
    }
  }
  // let isSwatch = document.getElementById('importAsSwatch').checked;
  let bgInput = currentBackgroundColor;

  // add key colors for each input
  for(let i=0; i<bulkValues.length; i++) {
    addKeyColorInput(d3.color(bulkValues[i]).formatHex(), itemId);
  }
  // if (isSwatch) {
  //   // create ratio inputs for each contrast
  //   for (let i=0; i<bulkValues.length; i++) {
  //     let cr = contrastColors.contrast([d3.rgb(bulkValues[i]).r, d3.rgb(bulkValues[i]).g, d3.rgb(bulkValues[i]).b], [d3.rgb(bgInput).r, d3.rgb(bgInput).g, d3.rgb(bgInput).b]);
  //     addRatio(cr.toFixed(2));
  //   }
  //   bg.value = bgInput;
  // }

  // Hide dialog
  cancelBulk();
  // Run colorinput
  themeUpdateParams();

  // clear inputs on close
  bulkInputs.value = " ";
}

window.clearAllColors = clearAllColors;
function clearAllColors(e) {
  let targetId = e.target.id;
  let keyColorsId = targetId.replace('_clearAllColors', '_keyColors');
  document.getElementById(keyColorsId).innerHTML = ' ';
  themeInput();
}

window.addFromURL = addFromURL;
function addFromURL() {
  let input = document.getElementById('addFromURLinput');
  let value = input.value;

  let url = new URL(value);
  let params = new URLSearchParams(url.search.slice(1));
  let pathName = url.pathname;

  let crs, ratios, mode;
  let cName = predefinedColorNames[Math.floor(Math.random()*predefinedColorNames.length)];

  // // If parameters exist, use parameter; else use default html input values
  if(params.has('colorKeys')) {
    let cr = params.get('colorKeys');
    crs = cr.split(',');
  }

  if(params.has('ratios')) {
    // transform parameter values into array of numbers
    let rat = params.get('ratios');
    ratios = rat.split(',');
    ratios = ratios.map(Number);

    if(ratios[0] == 0) { // if no parameter value, default to [3, 4.5]
      ratios = [3, 4.5];
    } else { }
  }
  if(params.has('mode')) {
    mode = params.get('mode');
  }
  else {
    // do nothing
  }
  addColorScaleUpdate(cName, crs, mode, ratios);

  cancelURL();
  // Run colorinput
  // throttle(themeInput, 10);
  // Clear out value when done
  input.value = ' ';
}

window.toggleConfigs = toggleConfigs;
function toggleConfigs() {
  let select = document.getElementById('view');
  // let value = select.value;
  let configs = document.getElementsByClassName('themeColor_configs');
  let gradient = document.getElementsByClassName('themeColor_gradient');
  let swatches = document.getElementsByClassName('gradientColorSwatchWrapper');

  if(value == 'viewScaleOnly') {
    for (let i = 0; i < configs.length; i ++) {
      if (!configs[i].classList.contains('is-hidden')) {
        configs[i].classList.add('is-hidden');
      }
      if (!gradient[i].classList.contains('is-large')) {
        gradient[i].classList.add('is-large');
      }
      if (gradient[i].classList.contains('is-hidden')) {
        gradient[i].classList.remove('is-hidden');
      }
      if (!swatches[i].classList.contains('is-hidden')) {
        swatches[i].classList.add('is-hidden');
      }
      if (swatches[i].classList.contains('is-large')) {
        swatches[i].classList.remove('is-large');
      }
    }
  }
  else if(value == 'viewScaleConfig') {
    for (let i = 0; i < configs.length; i ++) {
      if (configs[i].classList.contains('is-hidden')) {
        configs[i].classList.remove('is-hidden');
      }
      if (gradient[i].classList.contains('is-large')) {
        gradient[i].classList.remove('is-large');
      }
      if (gradient[i].classList.contains('is-hidden')) {
        gradient[i].classList.remove('is-hidden');
      }
      if (!swatches[i].classList.contains('is-hidden')) {
        swatches[i].classList.add('is-hidden');
      }
      if (swatches[i].classList.contains('is-large')) {
        swatches[i].classList.remove('is-large');
      }
    }
  }
  else if (value == 'viewSwatch') {
    for (let i = 0; i < configs.length; i ++) {
      if (!configs[i].classList.contains('is-hidden')) {
        configs[i].classList.add('is-hidden');
      }
      if (!gradient[i].classList.contains('is-large')) {
        gradient[i].classList.add('is-large');
      }
      if (!gradient[i].classList.contains('is-hidden')) {
        gradient[i].classList.add('is-hidden');
      }
      if (swatches[i].classList.contains('is-hidden')) {
        swatches[i].classList.remove('is-hidden');
      }
      if (!swatches[i].classList.contains('is-large')) {
        swatches[i].classList.add('is-large');
      }
    }
  }
}

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

// Passing variable parameters to URL
function updateParams(n, t) {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));
  let tabColor = document.getElementById("tabColor");

  params.set('name', n);         // Theme name
  params.set('config', t);       // Configurations

  window.history.replaceState({}, '', '?' + params); // update the page's URL.
}

function clearParams() {
  let uri = window.location.toString();
  let cleanURL = uri.substring(0, uri.indexOf("?"));

  window.history.replaceState({}, document.title, cleanURL);
}


/////////////////////////////////////
//   Functions for GETTING data    //
/////////////////////////////////////

// GET Color Scale Data
function getColorItemClass(id) {
  let thisElement = document.getElementById(id);
  // 1. find color name from id
  let colorNameInput = id.concat('_colorName');
  let colorName = document.getElementById(colorNameInput).value;

  // 2. Scrape information from the color class of the same name
  let currentColor = _theme.colors.filter(color => {return color.name === colorName})
  currentColor = currentColor[0];

  // let colorArgs = currentColor.colorKeys;
  // let mode = currentColor.colorspace;
  // let smooth = currentColor.smooth;
  // let ratios = currentColor.ratios;

  // return {
  //   colorName: colorName,
  //   colorArgs: colorArgs,
  //   mode: mode,
  //   smooth: smooth,
  //   ratios: ratios
  // }
  return currentColor;
}

// GET all contrast ratios
function getContrastRatios() {
  let ratioInputs = document.getElementsByClassName('ratio-Field');
  let ratios = [];
  for(let i = 0; i < ratioInputs.length; i++) {
    ratios.push(ratioInputs[i].value);
  }
  return ratios;
}

function getThemeName() {
  // Get name
  let themeNameInput = document.getElementById('themeNameInput');
  let themeName = themeNameInput.value;
  return themeName;
}


// GET Theme Data
function getThemeData() {
  // Get base scale
  // let baseSelect = document.getElementById('themeBase');
  // let baseSelectValue = baseSelect.value;

  // // Get brightness
  // let brightnessSlider = document.getElementById('themeBrightnessSlider');
  // let brightness = brightnessSlider.value;

  // // Get contrast
  // let contrastSlider = document.getElementById('themeContrastSlider');
  // let contrast = contrastSlider.value;

  // // For each item
  // let items = document.getElementsByClassName('themeColor_item');
  // let colorScales = [];

  // for (let i = 0; i < items.length; i++) {
  //   let id = items[i].id;
  //   let thisElement = document.getElementById(id);

  //   let colorData = getColorItemClass(id);

  //   let colorObj = {
  //     name: colorData.name,
  //     colorKeys: colorData.colorKeys,
  //     colorspace: colorData.colorspace,
  //     ratios: colorData.ratios
  //   };

  //   colorScales.push(colorObj);
  // }

  // UPDATED to pull data from theme object
  let baseSelectValue = _theme.backgroundColor.name;
  let colorScales = _theme.colors;
  let brightness = _theme.lightness;
  let contrast = _theme.contrast;

  return {
    baseScale: baseSelectValue,
    colorScales: colorScales,
    brightness: brightness,
    contrast: contrast
  }
}


// Type scale 
let typeScaleSampleWrapper = document.getElementById('typeScaleSampleWrapper');
let typeScaleBaseInput = document.getElementById('typeScaleBase');
let typeScaleRatioInput = document.getElementById('typeScaleRatio');
let typeScaleDecrementInput = document.getElementById('typeScaleDecrement');
let typeScaleIncrementInput = document.getElementById('typeScaleIncrement');
let typeScaleSampleText = document.getElementById('sampleText');
let fontWeightInput = document.getElementById('fontWeight');

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
    let span1 = document.createElement('span');
    let span = document.createElement('span');
    span1.className = 'typeScaleFontSize'
    span.style.fontFamily = 'Helvetica, Arial, sans-serif';
    span.style.fontSize = `${size}px`;
    span.style.fontWeight = `${fontWeightInput.value}`
    span.className = 'sampleTextItem';
    span.appendChild(sampleText);
    span1.appendChild(text)
    div.appendChild(span1);
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
fontWeightInput.addEventListener('input', createTypeScale);

// Theme configs
let themeTitleInput = document.getElementById('themeNameInput');
let themeTitle = document.getElementById('themeTitle');

function updateThemeTitle() {
  themeTitle.innerHTML = ' ';
  let title = themeTitleInput.value;
  if(title) themeTitle.innerHTML = title;
}
themeTitleInput.addEventListener('input', updateThemeTitle);
window.updateThemeTitle = updateThemeTitle;


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
document.getElementById("tabPanelColorScales").click();

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
document.getElementById("tabOutput").click();

window.openDetailTab = function openDetailTab(evt, tabName, colors) {
    // Declare all variables
    var i, tabcontent, tablinks;
    let thisId = evt.target.id;
    if(!tabName) tabName = thisId.concat('Content')

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabDetailContent");
    for (let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
    tablinks = document.getElementsByClassName("detail-Tabs-item");
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "flex";
    evt.currentTarget.className += " is-selected";

    if(tabName === 'tabModelContent') {
      // chartData.createData(colors);
      // charts.init3dChart()
    };
}

window.openAppTab = function openAppTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("AppTab");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
  tablinks = document.getElementsByClassName("app-Tabs-item");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "grid";
  evt.currentTarget.className += " is-selected";
}
document.getElementById("tabHome").click();

// Add event listener so that homepage CTA button initaites themes tab
document.getElementById('homeCTA').addEventListener('click', function() {
  document.getElementById('tabTheme').click();
})

window.openSideNavItem = function openSideNavItem(evt, contentName) {
  // Declare all variables
  var i, sidenavcontent, sidenavlinks;

  // Get all elements with class="sideNavContent" and hide them
  sidenavcontent = document.getElementsByClassName("sideNavContent");
  for (let i = 0; i < sidenavcontent.length; i++) {
    sidenavcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-SideNav-item" and remove the class "is-selected"
  sidenavlinks = document.getElementsByClassName("spectrum-SideNav-item");
  for (let i = 0; i < sidenavlinks.length; i++) {
    sidenavlinks[i].className = sidenavlinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(contentName).style.display = "flex";
  evt.currentTarget.parentNode.className += " is-selected";
}
document.getElementById("welcome").click();


window.openColorTab = function openColorTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("colorTabsWrapper");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
  tablinks = document.getElementsByClassName("color-Tabs-item");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "flex";
  evt.currentTarget.className += " is-selected";
}
document.getElementById("tabColorWheel").click();


// When adding new ratios in UI, run colorinput as well
window.addNewRatio = function addNewRatio() {
  addRatio();
}


// Add ratio inputs
function addRatio(v, fs, fw) {
  let s = '#cacaca';
  let methodPicker = document.getElementById('contrastMethod');
  let method = methodPicker.value;
  let ratioInputs = getContrastRatios();
  // increment by default
  if(v === undefined) {
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
  // var sliderWrapper = document.getElementById('colorSlider-wrapper');
  // var slider = document.createElement('input');

  var randId = randomId();
  div.className = 'ratio-Item ratioGrid';
  div.id = randId + '-item';
  var inputWrapper = document.createElement('span');

  var sw = document.createElement('span');
  sw.className = 'ratio-Swatch';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = s;
  var ratioInput = document.createElement('input');
  let ratioInputWrapper = document.createElement('div');
  ratioInputWrapper.className = 'spectrum-Textfield ratioGrid--ratio';
  ratioInput.className = 'spectrum-Textfield-input ratio-Field';
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

  // var fontSizeInput = document.createElement('input');
  // fontSizeInput.className = 'spectrum-Textfield ratioGrid--fontSize';
  // fontSizeInput.type = "number";
  // fontSizeInput.min = '12';
  // fontSizeInput.step = '1';
  // fontSizeInput.id = randId + "-fontSize";
  // fontSizeInput.value = fs;
  // fontSizeInput.oninput = syncRatioInputs;

  // var fontWeightInput = document.createElement('input');
  // fontWeightInput.className = 'spectrum-Textfield ratioGrid--fontWeight';
  // fontWeightInput.type = "number";
  // fontWeightInput.step = '100';
  // fontWeightInput.min = '100';
  // fontWeightInput.max = '900';
  // fontWeightInput.placeholder = '400';
  // fontWeightInput.id = randId + "-fontWeight";
  // fontWeightInput.value = fw;
  // fontWeightInput.oninput = syncRatioInputs;
  // // fontWeightInput.defaultValue = '400';

  var luminosityInput = document.createElement('input');
  let luminosityInputWrapper = document.createElement('div');
  luminosityInputWrapper.className = 'spectrum-Textfield ratioGrid--luminosity';

  luminosityInput.className = 'spectrum-Textfield-input';
  luminosityInput.type = "number";
  luminosityInput.min = '0';
  luminosityInput.max = '100';
  luminosityInput.step = '1';
  luminosityInput.id = randId + "_luminosity";
  luminosityInput.oninput = syncRatioInputs;

  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet ratioGrid--actions';
  button.title = 'Delete contrast ratio';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  // slider.type = 'range';
  // slider.min = '0';
  // slider.max = '100';
  // slider.value = v;
  // slider.step = '.01';
  // slider.className = 'colorSlider'
  // slider.id = randId + "-sl";
  // slider.disabled = true;
  // sliderWrapper.appendChild(slider);

  button.onclick = deleteRatio;
  inputWrapper.appendChild(sw);
  ratioInputWrapper.appendChild(ratioInput);
  inputWrapper.appendChild(ratioInputWrapper);
  // div.appendChild(fontSizeInput);
  // div.appendChild(fontWeightInput);
  luminosityInputWrapper.appendChild(luminosityInput);
  div.appendChild(luminosityInputWrapper);
  div.appendChild(inputWrapper)
  div.appendChild(button);
  ratios.appendChild(div);

  // charts2d.createContrastRatioChart(data, 'contrastChart', 'line');
  themeInput();
}

function addRatios(ratios) {
  ratios.forEach(ratio => {
    return addRatio(ratio)
  })
}

// function syncRatioInputs(e) {
//   let thisId = e.target.id;
//   let val = e.target.value;
//   // let fontWeight;
//   // let fontSize;
//   let targetContrast;
//   let luminosity;

//   // if input is a font size, only change the ratio input to match
//   // required value for the combination of size + weight values
//   // if input id contains -fontSize in the string = it's a font size input
//   if(thisId.includes('-fontSize')) {
//     fontSize = val;
//     let baseId = thisId.replace('-fontSize', '');
//     let fontWeightInput = document.getElementById(baseId + '-fontWeight');
//     // If no font weight defined, default to 400, otherwise use the
//     // font weight value for the lookup table
//     if(!fontWeightInput.value) {
//       fontWeight = '400';
//       fontWeightInput.value = fontWeight;
//     } else {
//       fontWeight = `${fontWeightInput.value}`;
//     }
//     let ratioInput = document.getElementById(baseId);
//     let node = apcaLookup[val];

//     if(!node) {
//       // Need to find closest ratios in lookup table
//       // and if ratioInput.value is less than the lower of the
//       // two values, it needs to be changed.

//       targetContrast = ratioInput.value;
//     } else {
//       targetContrast = apcaLookup[val][fontWeight]
//       ratioInput.value = targetContrast;
//     }
//   }

//   // if input is a font weight, only change the ratio input to match
//   // required value for the combination of size + weight values
//   // if input id contains -fontWeight in the string = it's a font weight input
//   else if (thisId.includes('-fontWeight')) {
//     let baseId = thisId.replace('-fontWeight', '');
//     let fontSizeInput = document.getElementById(baseId + '-fontSize');
//     fontSize = fontSizeInput.value;
//     fontWeight = val;

//     let ratioInput = document.getElementById(baseId);
//     targetContrast = apcaLookup[fontSize][val];

//     if(targetContrast) {
//       ratioInput.value = targetContrast;
//     } else {
//       targetContrast = ratioInput.value;
//     }
//   }
//   // if input is a Ratio, increase the font size value based on
//   // lookup table and current font weight. If no weight, default to 400
//   else {
//     let fontWeightInput = document.getElementById(thisId + '-fontWeight');
//     let fontSizeInput = document.getElementById(thisId + '-fontSize');
//     let fontWeight = (fontWeightInput.value) ? fontWeightInput.value : '400';
//     targetContrast = val;
    
//     if(!fontWeightInput.value) fontWeightInput.value = '400';
//     let fontSize;
//     for (const property in apcaLookup) {
//       if(apcaLookup[property][fontWeight] === targetContrast) {
//         fontSize = property; 
//         fontSizeInput.value = fontSize;
//       }
//     }
//   }

//   // Then, run the colorinput funtion to update all values.
//   // colorInput();
// }

function syncRatioInputs(e) {
  let thisId = e.target.id;
  let val = e.target.value;
  let targetContrast;
  let luminosity;
  
  if (thisId.includes('_luminosity')) {
    let baseId = thisId.replace('_luminosity', '');
    let ratioInput = document.getElementById(baseId);
    luminosity = val;
    
    ratioInput.val = '3'
  }

  // if input is a Ratio, increase the font size value based on
  // lookup table and current font weight. If no weight, default to 400
  else {
    let luminosityInputId = `${thisId}_luminosity`;
    let luminosityInput = document.getElementById(luminosityInputId);
    luminosityInput.val = 100;
    targetContrast = val;
  }
  // Then, run the colorinput funtion to update all values.
  // colorInput();
  themeInput();
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

// Collapse / expand color scale cards
// function showColorDetails(e) {
//   let element = e.target.id;
//   let button = document.getElementById(element);
//   let svgs = button.getElementsByTagName('svg');

//   let id = element.replace('-toggleConfig', '');
//   let configs = document.getElementById(`${id}-themeColor_configs`);

//   if(!configs.classList.contains('is-hidden')) {
//     for (let svg of svgs) {
//       svg.style.transform = 'rotate(0deg)';
//     }
//     configs.classList.add('is-hidden');
//   } else {
//     for (let svg of svgs) {
//       svg.style.transform = 'rotate(-90deg)';
//     }
//     configs.classList.remove('is-hidden');
//   }
// }
function showColorDetails(e) {
  let element = e.target.id;
  let button = document.getElementById(element);
  let id = element.replace('-toggleConfig', '');

  let colorData = getColorItemClass(id);

  // Clear main container
  let contentArea = document.getElementById('colorDetails');
  // contentArea.innerHTML = ' ';
  contentArea.style.display = 'flex';
  // Clear config panel, just to be safe
  let configPanel = document.getElementById('colorConfigPanel');
  configPanel.innerHTML = ' ';
  configPanel.style.display = 'flex';

  let configPanelItem = document.createElement('div');
  configPanelItem.className = 'spectrum-Panel-Item';

  // create unique ID for color object
  let thisId = id;
  // generate color input objects:
  // gradient, inputs, etc.
  let wrapper = contentArea;

  // Create back button
  let panelHeader = document.createElement('div');
  panelHeader.className = 'spectrum-Panel-Item';
  let backButton = document.createElement('button');
  backButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  backButton.title = 'Back to all colors'
  backButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-ChevronLeft" />
  </svg>
  `;
  backButton.onclick = () => {
    contentArea.innerHTML = ' ';
    contentArea.style.display = 'none';
    configPanel.innerHTML = ' ';
    configPanel.style.display = 'none';
    // themeUpdateParams()
  }
  let backLabel = document.createElement('span')
  backLabel.className = 'spectrum-Heading spectrum-Heading--sizeXS panelBackButtonLabel';
  backLabel.innerHTML = 'Back to all colors';

  panelHeader.appendChild(backButton);
  panelHeader.appendChild(backLabel);

  // Create gradient
  let gradient = document.createElement('div');
  gradient.className = 'themeColor_gradient';
  let gradientId = thisId.concat('_gradient');
  gradient.id = gradientId;

  // Create form container
  let inputs = document.createElement('div');
  inputs.className = `spectrum-Form spectrum-Form--row themeColor_configs`;
  inputs.id = `${thisId}-themeColor_configs`

  // Field label
  let colorNameLabel = document.createElement('label');
  colorNameLabel.className = 'spectrum-Fieldlabel spectrum-Fieldlabel--sizeM';
  colorNameLabel.innerHTML = 'Color name'
  // Color Name Input
  let colorName = document.createElement('div');
  colorName.className = 'spectrum-Form-item';
  let colorNameInput = document.createElement('input');
  let colorNameWrapper = document.createElement('div');
  colorNameWrapper.className = 'spectrum-Textfield spectrum-Textfield--sizeM';
  colorNameInput.type = 'text';
  colorNameInput.className = 'spectrum-Textfield-input colorNameInput';
  colorNameInput.id = thisId.concat('_colorName2');
  colorNameInput.name = thisId.concat('_colorName2');
  colorNameInput.value = colorData.name;

  // colorNameInput.oninput = throttle(themeUpdateParams, 10);
  colorNameInput.oninput = () => {
    let paletteNameInput = document.getElementById(thisId.concat('_colorName'));
    paletteNameInput.value = e.target.value;
    // _theme.updateColor = {color: currentColor, name: e.target.value}
  };

  // colorNameLabel.innerHTML = 'Color scale name';
  // colorName.appendChild(colorNameLabel);
  colorNameWrapper.appendChild(colorNameInput);
  colorName.appendChild(colorNameLabel);
  colorName.appendChild(colorNameWrapper);

  // Key Color Input
  let keyColors = document.createElement('div');
  keyColors.className = 'themeColor_subheading';
  let keyColorsLabel = document.createElement('h4');
  keyColorsLabel.className = 'spectrum-Heading6';
  keyColorsLabel.for = thisId.concat('_keyColors');

  let keyColorsInput = document.createElement('div');
  keyColorsInput.className = 'keyColorsWrapper';
  let keyColorsId = thisId.concat('_keyColors');
  keyColorsInput.id = keyColorsId;
  keyColorsLabel.innerHTML = 'Key colors';
  keyColors.appendChild(keyColorsLabel);

  // Key Colors Actions
  let addColors = document.createElement('div');
  addColors.className = 'keyColorActions';
  let addButton = document.createElement('button');
  addButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  let buttonId = thisId.concat('_addKeyColor');
  addButton.id = buttonId;
  addButton.title = "Add key color"
  addButton.addEventListener('click', addKeyColor);
  addButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-Add" />
  </svg>
  `;
  let bulkButton = document.createElement('button');
  bulkButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
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
  clearKeyColorsButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
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
  keyColors.appendChild(addColors);

  // Interpolation mode
  let interp = document.createElement('div');
  interp.className = 'spectrum-Form-item spectrum-Form-item--row';
  let interpLabel = document.createElement('label');
  interpLabel.className = 'spectrum-FieldLabel spectrum-Fieldlabel--sizeM spectrum-FieldLabel--left';
  interpLabel.for = thisId.concat('_mode');
  let interpLabelText = 'Color space';
  // let interpDropdown = document.createElement('div');
  // interpDropdown.className = 'spectrum-Picker spectrum-Picker--sizeM';
  // interpDropdown.id = thisId.concat('_modeDropdown');
  let interpSelect = document.createElement('select');
  interpSelect.className = 'spectrum-Picker spectrum-Picker--sizeM pickerMode';
  interpSelect.id = thisId.concat('_mode');
  interpSelect.name = thisId.concat('_mode');
  interpSelect.oninput = throttle(themeUpdateParams, 20);
  interpSelect.addEventListener('change', (e) => {
    _theme.updateColor = {color: colorData.name, colorspace: e.target.value}
    updateRamps(colorData, thisId)
  })

  let interpDropdownIcon = document.createElement('span');
  interpDropdownIcon.className = 'spectrum-Picker-iconWrapper';
  interpDropdownIcon.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Picker-icon spectrum-UIIcon-ChevronDownMedium spectrum-Picker-icon">
    <use xlink:href="#spectrum-css-icon-ChevronDownMedium"></use>
  </svg>`;

  interpLabel.innerHTML = interpLabelText;
  // interpDropdown.appendChild(interpSelect);
  interpSelect.appendChild(interpDropdownIcon);
  interp.appendChild(interpLabel);
  interp.appendChild(interpSelect);

  // Interpolation options
  interpSelect.options.length = 0;

  let opts = {
    'CAM02': 'Jab',
    'CAM02p': 'JCh',
    'LCH': 'Lch',
    'LAB': 'Lab',
    'HSL': 'HSL',
    'HSLuv': 'HSLuv',
    'HSV': 'HSV',
    'RGB': 'RGB'
  };

  for(let index in opts) { interpSelect.options[interpSelect.options.length] = new Option(opts[index], index); }
  interpSelect.value = colorData.colorspace;

  // Smoothing
  let smoothFormItem = document.createElement('div');
  smoothFormItem.className = 'spectrum-Form-item';
  let smoothWrapper = document.createElement('div');
  smoothWrapper.className = 'spectrum-Switch';
  let smoothInput = document.createElement('input');
  smoothInput.type = 'checkbox';
  smoothInput.className = 'spectrum-Switch-input';
  smoothInput.id = thisId.concat('_smooth');
  // smoothInput.oninput = throttle(themeUpdateParams, 20);
  smoothInput.addEventListener('input', (e) => {
    let checked = e.target.checked;
    const boolean = checked.toString();
    _theme.updateColor = {color: colorData.name, smooth: boolean}
    updateRamps(colorData, thisId)
  })
  let smoothSwitch = document.createElement('span');
  smoothSwitch.className = 'spectrum-Switch-switch';
  let smoothLabel = document.createElement('label');
  smoothLabel.className = 'spectrum-Switch-label';
  smoothLabel.htmlFor = thisId.concat('_smooth');
  smoothLabel.innerHTML = 'Smooth';
  smoothWrapper.appendChild(smoothInput);
  smoothWrapper.appendChild(smoothSwitch);
  smoothWrapper.appendChild(smoothLabel);
  smoothFormItem.appendChild(smoothWrapper);

  // Actions
  let actions = document.createElement('div');
  actions.className = 'spectrum-ButtonGroup';
  let deleteColor = document.createElement('button');
  deleteColor.className = 'spectrum-Button spectrum-Button--sizeM spectrum-Button--warning';
  deleteColor.title = 'Delete color scale'
  deleteColor.id = thisId.concat('_delete');
  deleteColor.innerHTML = 'Delete color scale'
  let deletePanel = document.createElement('div');
  deletePanel.className = 'spectrum-Panel-Item';
  // deleteColor.innerHTML = `
  // <!-- <span class="spectrum-ActionButton-label">Add Color</span> -->
  // <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
  //   <use xlink:href="#spectrum-icon-18-Delete" />
  // </svg>`;
  deletePanel.appendChild(deleteColor);

  colorName.appendChild(actions);

  // Title
  let title = document.createElement('h2');
  title.className = 'spectrum-Typography spectrum-Heading spectrum-Heading--sizeXS'
  title.innerHTML = 'Color scale'

  // Tabs
  let tabs = document.createElement('div');
  tabs.className = 'spectrum-Tabs spectrum-Tabs--horizontal spectrum-Tabs--quiet';
  let tabItem1 = document.createElement('div');
  tabItem1.className = 'spectrum-Tabs-item detail-Tabs-item';
  tabItem1.id = 'tabInterpCharts';
  let tabItem1Label = document.createElement('label');
  tabItem1Label.className = 'spectrum-Tabs-itemLabel';
  tabItem1Label.innerHTML = 'Charts';

  let tabItem2 = document.createElement('div');
  tabItem2.className = 'spectrum-Tabs-item detail-Tabs-item';
  tabItem2.id = 'tabRGBChannels';
  let tabItem2Label = document.createElement('label');
  tabItem2Label.className = 'spectrum-Tabs-itemLabel';
  tabItem2Label.innerHTML = 'RGB Channels';

  let tabItem3 = document.createElement('div');
  tabItem3.className = 'spectrum-Tabs-item detail-Tabs-item';
  tabItem3.id = 'tabModel';
  let tabItem3Label = document.createElement('label');
  tabItem3Label.className = 'spectrum-Tabs-itemLabel';
  tabItem3Label.innerHTML = '3d model';

  let tabContent1 = document.createElement('div');
  tabContent1.id = 'tabInterpChartsContent';
  tabContent1.className = 'tabDetailContent';

  let tabContent2 = document.createElement('div');
  tabContent2.id = 'tabRGBChannelsContent';
  tabContent2.className = 'tabDetailContent';

  let tabContent3 = document.createElement('div');
  tabContent3.id = 'tabModelContent';
  tabContent3.className = 'tabDetailContent';

  // Chart colorspace preview picker
  let chartsMode = document.createElement('div');
  chartsMode.className = 'spectrum-Form-item spectrum-Form-item--row';
  let chartsModeLabel = document.createElement('label');
  chartsModeLabel.className = 'spectrum-FieldLabel spectrum-Fieldlabel--sizeM spectrum-FieldLabel--left';
  chartsModeLabel.for = 'chartsMode';
  let chartsModeLabelText = 'Charts mode';
  let chartsModeSelect = document.createElement('select');
  chartsModeSelect.className = 'spectrum-Picker spectrum-Picker--sizeM pickerMode';
  chartsModeSelect.id = 'chartsMode';
  chartsModeSelect.name = 'chartsMode';
  // chartsModeSelect.oninput = throttle(themeUpdateParams, 20);
  chartsModeSelect.addEventListener('change', (e) => {
    createInterpolationCharts(colors, e.target.value)
  })

  let chartsModeDropdownIcon = document.createElement('span');
  chartsModeDropdownIcon.className = 'spectrum-Picker-iconWrapper';
  chartsModeDropdownIcon.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Picker-icon spectrum-UIIcon-ChevronDownMedium spectrum-Picker-icon">
    <use xlink:href="#spectrum-css-icon-ChevronDownMedium"></use>
  </svg>`;

  chartsModeLabel.innerHTML = chartsModeLabelText;
  // chartsModeDropdown.appendChild(chartsModeSelect);
  chartsModeSelect.appendChild(chartsModeDropdownIcon);
  chartsMode.appendChild(chartsModeLabel);
  chartsMode.appendChild(chartsModeSelect);

  // Interpolation options
  chartsModeSelect.options.length = 0;

  for(let index in opts) { chartsModeSelect.options[chartsModeSelect.options.length] = new Option(opts[index], index); }
  chartsModeSelect.value = 'CAM02';


  // Put the tabs together
  tabItem1.appendChild(tabItem1Label);
  tabItem2.appendChild(tabItem2Label);
  tabItem3.appendChild(tabItem3Label);
  tabs.appendChild(tabItem1);
  tabs.appendChild(tabItem2);
  tabs.appendChild(tabItem3);
  tabs.appendChild(chartsMode);

  // Put it all together
  inputs.appendChild(keyColors);
  inputs.appendChild(keyColorsInput);
  
  inputs.appendChild(interp);
  inputs.appendChild(smoothFormItem);

  configPanelItem.appendChild(colorName);
  configPanelItem.appendChild(inputs);
  configPanel.appendChild(panelHeader);
  configPanel.appendChild(configPanelItem);
  configPanel.appendChild(deletePanel);

  // Content area needs to be appended with items
  wrapper.appendChild(title);
  wrapper.appendChild(gradient);
  // Create divs for charts
  let chart1 = document.createElement('div');
  chart1.id = 'interpolationChart';
  let chart2 = document.createElement('div');
  chart2.id = 'interpolationChart2';
  let chart3 = document.createElement('div');
  chart3.id = 'RGBchart';

  tabContent1.appendChild(chart1);
  tabContent1.appendChild(chart2);
  tabContent2.appendChild(chart3);

  wrapper.appendChild(tabs)
  wrapper.appendChild(tabContent1);
  wrapper.appendChild(tabContent2);
  wrapper.appendChild(tabContent3);

  // Then run functions on the basic placeholder inputs
  let colorKeys = colorData.colorKeys;
  for (let i = 0; i < colorKeys.length; i++) {
    addKeyColorInput(colorKeys[i], buttonId, colorData.name, i);
  }

  let rampData = Leo.createScale({swatches: 30, colorKeys: colorKeys, colorspace: colorData.colorspace, smooth: colorData.smooth});

  let colors = rampData;

  themeRamp(colors, gradientId);
  themeRampKeyColors(colorKeys, gradientId);
  createRGBchannelChart(colors);
  createInterpolationCharts(colors, 'CAM02')
  // charts.createAllCharts(colorData.colorspace, colors);
  
  toggleControls();
  baseScaleOptions();

  document.getElementById(thisId.concat('_colorName')).addEventListener('input', baseScaleOptions);
  // document.getElementById(thisId.concat('_delete')).addEventListener('click', themeDeleteItem);
  // document.getElementById('tabChartContent').click();
  document.getElementById('tabInterpCharts').addEventListener('click', (e) => {openDetailTab(e, 'tabInterpChartsContent')});
  document.getElementById('tabRGBChannels').addEventListener('click', (e) => {openDetailTab(e, 'tabRGBChannelsContent')});
  document.getElementById('tabModel').addEventListener('click', (e) => {openDetailTab(e, 'tabModelContent', colors)});
  document.getElementById('tabInterpCharts').click();

  deleteColor.addEventListener('click', themeDeleteItem);
  deleteColor.addEventListener('click', function(){ return _theme.removeColor = newColor});
  // console.log(_theme)
}

window.toggleTooltip = toggleTooltip;
function toggleTooltip(targetId) {
  let tooltip = document.getElementById(targetId);
  if(!tooltip.classList.contains('is-open')) {
    tooltip.classList.add('is-open');
  } else {
    tooltip.classList.remove('is-open');
  }
}


/** Color wheel functions */
function getSmallestWindowDimension() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let adjustedWidth = windowWidth - 386;// subtract panel width and padding from measurement
  let adjustedHeight = windowHeight - 80;// subtract heading, tabs height and padding from measurement
  let smallestDimension = (adjustedWidth < adjustedHeight) ? adjustedWidth : adjustedHeight;
  return smallestDimension;
}
getSmallestWindowDimension();

function getColorWheelSize() {
  let dynamicSize = getSmallestWindowDimension() - 200;
  let minSize = 300;
  let maxSize = 800;
  let colorWheelSize = (dynamicSize > maxSize) ? maxSize : ((dynamicSize < minSize) ? minSize : dynamicSize);
  return colorWheelSize;
}

// function convertToCartesian(c, h) {
//   let radians = 180/Math.PI;
//   let xAxis = c * Math.cos(h / radians);
//   let yAxis = c * Math.sin(h / radians);

//   return{
//     x: xAxis,
//     y: yAxis
//   };
// }

function convertToCartesian(s, h) {
  if(s > 100) s = 100;
  // convert degrees to radians
  let hRad = (h * Math.PI) / 180;
  let xAxis = s * Math.cos(hRad);
  let yAxis = s * Math.sin(hRad);

  return{
    x: xAxis,
    y: yAxis
  };
}

function filterNaN(x) {
  if(isNaN(x)) {
    return 0;
  } else {
    return x;
  }
}

function shiftValue(v, colorWheelSize, dotSize) {
  v = filterNaN(v);

  const midPoint = colorWheelSize /2;
  const scaledValue = (v/100) * midPoint;

  const shiftedValue = scaledValue + midPoint;
  // subtract half of the width of the dots to centrally position it.
  const centeredVal = shiftedValue - (dotSize/2) - 2;
  return centeredVal;
}


function getConvertedColorCoodrindates(colorValues, mode) {
  // Cant seem to use the constant colorWheelSize or dotSize here, so we calculate it
  let size = getColorWheelSize();
  let dotSize = 16;
  let defaultAchromaticDotOffset = (size / 2) - (dotSize / 2);

  let arr = [];
  colorValues.map(color => {
    let c,h; 
    if(mode === 'hsl') {
      c = d3.hsl(color).s * 100;
      h = d3.hsl(color).h
    } 
    if(mode === 'hsluv') {
      c = d3.hsluv(color).u;
      h = d3.hsluv(color).l
    }
    if(mode === 'hsv') {
      c = d3.hsv(color).s * 100;
      h = d3.hsv(color).h
    }
    if(mode === 'lch') {
      c = d3.hcl(color).c;
      h = d3.hcl(color).h
    }
    if(mode === 'jch') {
      c = d3.jch(color).C;
      h = d3.jch(color).h
    }
    
    const conversion = convertToCartesian(c, h);
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

function removeElementsByClass(className){
  const elements = document.getElementsByClassName(className);
  while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
  }
}

function createColorWheelDots(arr) {
  let container = document.getElementById('colorWheel');
  removeElementsByClass('colorDot');

  arr.map(obj => {
    let dot = document.createElement('div');
    dot.className = 'colorDot';
    dot.style.backgroundColor = obj.color;
    dot.style.top = obj.y;
    dot.style.left = obj.x;
    container.appendChild(dot)
  })
}

function createColorWheel(mode, lightness) {    
  const size = getColorWheelSize();

  let container = d3.select('#colorWheel');
  let canvas = container.append("canvas")
    .attr("height", size)
    .attr("width", size)
    .attr("id", 'colorWheelCanvas');
  const context = canvas.node().getContext('2d');

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

    if(mode === 'hsl') {
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
    else if(mode === 'hsv') {
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
    else if(mode === 'lch') {
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
    else if(mode === 'hsluv') {
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
    else if(mode === 'jch') {
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

const colorWheelMode = document.getElementById('colorWheelMode');
const colorWheelLightness = document.getElementById('colorWheelLightness');


function updateColorWheel(mode, lightness, dots) {
  let canvas = document.getElementById('colorWheelCanvas');
  if(canvas) {
    canvas.parentNode.removeChild(canvas);
  }
  createColorWheel(mode, lightness);

  // Flag for if we want to regenerate all the dots too.
  if(dots) {
    let allKeys = getAllColorKeys();
    let arr = getConvertedColorCoodrindates(allKeys, mode);
    createColorWheelDots(arr);  
  }
}

updateColorWheel(colorWheelMode.value, colorWheelLightness.value, true);

window.onresize = () => {
  updateColorWheel(colorWheelMode.value, colorWheelLightness.value, true)
};

colorWheelMode.addEventListener('input', function(e) { 
  let mode = e.target.value;
  updateColorWheel(mode, colorWheelLightness.value, true);
});

colorWheelLightness.addEventListener('input', function(e) { 
  let lightness = e.target.value;
  updateColorWheel(colorWheelMode.value, lightness);
});

function getAllColorKeys() {
  let colorKeys = [];
  let scales = _theme.colors;
  scales.map(scale => {
    let keys = scale.colorKeys;
    keys.forEach(key => {
      colorKeys.push(key)
    })
  });

  return colorKeys;
}

