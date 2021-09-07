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
import '@spectrum-css/switch/dist/index-vars.css';
import '@spectrum-css/buttongroup/dist/index-vars.css';
import '@spectrum-css/tooltip/dist/index-vars.css';
import '@spectrum-css/slider/dist/index-vars.css';
import '@spectrum-css/tabs/dist/index-vars.css';
import '@spectrum-css/toast/dist/index-vars.css';
import '@spectrum-css/illustratedmessage/dist/index-vars.css';

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

new ClipboardJS('.copyButton');
new ClipboardJS('.themeOutputSwatch');

// window.generateAdaptiveTheme = contrastColors.generateAdaptiveTheme;

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
  console.log(id)
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
        addColorScale(colorName, keyColors, colorSpace, ratios);
      })
    } else {
      addColorScale('Gray', ['#000000'], 'CIECAM02', [3, 4.5]);
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
    addColorScale('Gray', ['#000000'], 'CAM02');
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
function addColorScale(c, k, s) {
  // for checking to see if items already exist
  let items = document.getElementsByClassName('themeColor_item');
  // if first color item, just name it gray.
  if(!c) {
    if(items.length == 0) {
      // if first color with undefined c argument:
      c = 'Gray'
    }
    else {
      // if not first, c not defined, randomly assign color name:
      c = predefinedColorNames[Math.floor(Math.random()*predefinedColorNames.length)];
    }
  }
  if (s == undefined) {
    s = 'CAM02';
  }
  if (k == undefined) {
    k = ['#000000']
  }
  let r = getContrastRatios();
  if (r === undefined) {
    r = [4.5];
  }

  let newColor = new Leo.Color({
    name: c,
    colorKeys: k,
    colorspace: s,
    ratios: r
  })
  _theme.addColor = newColor;

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
  inputs.className = `spectrum-Form spectrum-Form--row themeColor_configs is-hidden`;
  inputs.id = `${thisId}-themeColor_configs`

  // Color Name Input
  let colorName = document.createElement('div');
  colorName.className = 'spectrum-Form-item spectrum-Form-item--row';
  let colorNameInput = document.createElement('input');
  colorNameInput.type = 'text';
  colorNameInput.className = 'spectrum-Textfield spectrum-Textfield--quiet colorNameInput';
  colorNameInput.id = thisId.concat('_colorName');
  colorNameInput.name = thisId.concat('_colorName');
  colorNameInput.value = c;

  colorNameInput.oninput = throttle(themeUpdateParams, 10);

  // colorNameLabel.innerHTML = 'Color scale name';
  // colorName.appendChild(colorNameLabel);
  colorName.appendChild(colorNameInput);

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
  addButton.className = 'spectrum-ActionButton spectrum-ActionButton--quiet';
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
  bulkButton.className = 'spectrum-ActionButton spectrum-ActionButton--quiet';
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
  clearKeyColorsButton.className = 'spectrum-ActionButton spectrum-ActionButton--quiet';
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
  interpLabel.className = 'spectrum-FieldLabel spectrum-FieldLabel--left';
  interpLabel.for = thisId.concat('_mode');
  let interpLabelText = 'Color space';
  let interpDropdown = document.createElement('div');
  interpDropdown.className = 'spectrum-Dropdown';
  interpDropdown.id = thisId.concat('_modeDropdown');
  let interpSelect = document.createElement('select');
  interpSelect.className = 'spectrum-FieldButton spectrum-Dropdown-trigger';
  interpSelect.id = thisId.concat('_mode');
  interpSelect.name = thisId.concat('_mode');
  interpSelect.oninput = throttle(themeUpdateParams, 20);
  interpSelect.addEventListener('change', (e) => {
    _theme.updateColor = {color: c, colorspace: e.target.value}
  })

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
  interpSelect.value = s;

  // Smoothing
  let smoothFormItem = document.createElement('div');
  smoothFormItem.className = 'spectrum-Form-item';
  let smoothWrapper = document.createElement('div');
  smoothWrapper.className = 'spectrum-Switch';
  let smoothInput = document.createElement('input');
  smoothInput.type = 'checkbox';
  smoothInput.className = 'spectrum-Switch-input';
  smoothInput.id = thisId.concat('_smooth');
  smoothInput.oninput = throttle(themeUpdateParams, 20);
  smoothInput.addEventListener('input', (e) => {
    let checked = e.target.checked;
    _theme.updateColor = {color: c, smooth: checked}
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

  // Ratios
  // let ratios = document.createElement('div');
  // ratios.className = 'spectrum-Form-item';
  // let ratiosLabel = document.createElement('label');
  // ratiosLabel.className = 'spectrum-FieldLabel';
  // ratiosLabel.innerHTML = 'Contrast ratios';
  // ratiosLabel.for = thisId.concat('_ratios');
  // let ratiosInput = document.createElement('input');
  // ratiosInput.type = 'text';
  // ratiosInput.className = 'spectrum-Textfield';
  // ratiosInput.id = thisId.concat('_ratios');
  // ratiosInput.name = thisId.concat('_ratios');
  // ratiosInput.oninput = throttle(themeUpdateParams, 10);
  // ratios.appendChild(ratiosLabel);
  // ratios.appendChild(ratiosInput);
  // ratiosInput.value = r.toString();

  // Actions
  let actions = document.createElement('div');
  actions.className = 'spectrum-ButtonGroup spectrum-Form-item labelSpacer';
  let edit = document.createElement('button');
  edit.className = 'spectrum-ActionButton spectrum-ActionButton--quiet';
  edit.id = `${thisId}-toggleConfig`;
  edit.title = "Show / hide configurations"
  edit.innerHTML = `
  <!-- <span class="spectrum-ActionButton-label">Add from URL</span> -->
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-ChevronLeft" />
  </svg>`
  edit.addEventListener('click', toggleCardConfigs);
  // edit.addEventListener('click', openEditColorScale) // TODO => create openEditColorScale function to open colors tab w/ settings of this object.
  let deleteColor = document.createElement('button');
  deleteColor.className = 'spectrum-ActionButton spectrum-ActionButton--quiet';
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

  // Put it all together
  // inputs.appendChild(colorName);

  inputs.appendChild(keyColors);
  inputs.appendChild(keyColorsInput);
  
  inputs.appendChild(interp);
  inputs.appendChild(smoothFormItem);


  // inputs.appendChild(ratios);
  // inputs.appendChild(actions);

  item.appendChild(colorName);
  item.appendChild(gradient);
  item.appendChild(inputs);

  wrapper.appendChild(item);

  // Then run functions on the basic placeholder inputs
  for (let i = 0; i < k.length; i++) {
    themeAddColor(k[i], buttonId);
  }
  
  // generate the number of values equal to the width of the item
  let n = window.innerWidth - 272;
  // let rampData = new Leo.Color({name: c, colorKeys: ['#000000'], colorspace: 'LAB'});
  let rampData = Leo.createScale({swatches: 30, colorKeys: ['#000000'], colorspace: 'LAB'});

  let colors = rampData.colorScale;

  themeRamp(colors, gradientId);
  toggleControls();
  baseScaleOptions();

  document.getElementById(thisId.concat('_colorName')).addEventListener('input', baseScaleOptions);
  // document.getElementById(thisId.concat('_delete')).addEventListener('click', themeDeleteItem);

  deleteColor.addEventListener('click', themeDeleteItem);
  deleteColor.addEventListener('click', function(){ return _theme.removeColor = newColor});
  
  console.log(_theme)
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

function themeRamp(colors, dest) {
  let container = document.getElementById(dest);
  let gradient = document.createElement('div');
  gradient.className = 'gradient'

  gradient.style.backgroundImage = `linear-gradient(to right, ${colors})`;
  container.appendChild(gradient)
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

function themeAddColorUpdate(c, thisId = this.id) {
  themeAddColor(c, thisId = this.id);
  let config = getThemeData();
  let name = getThemeName();

  config = JSON.stringify(config);

  // TODO: uncomment and get this working
  // updateParams(name, config);
}

// Deletes a Color class from Theme
function themeDeleteItem(e) {
  let id = e.target.parentNode.parentNode.parentNode.id;
  let self = document.getElementById(id);
  console.log(`Deleting color ${id}`)

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

function themeEditItem(e) {
  let id = e.target.parentNode.parentNode.parentNode.id;
  let thisElement = document.getElementById(id);

  let c = getColorItemData(id).colorArgs;
  let b = 'ffffff'; // get generated background color...
  let m = getColorItemData(id).mode;
  let r = getColorItemData(id).ratios;

  // take the configs and craft a URL for editing the palette
  let location = window.location.origin;
  let url = new URL(location);
  let params = new URLSearchParams(url.search.slice(1));

  params.set('colorKeys', c);
  params.set('base', b);
  params.set('ratios', r);
  params.set('mode', m);

  // window.history.replaceState({}, '', '?' + params); // update the page's URL.

  // open new tab with url based on color scale's parameters
  let newURL = location.toString().concat('/?').concat(params);
  window.open(newURL, "_blank");

  // Now how do we apply this *back* to the theme itself?...
  // I don't think this is possible without some serious magic from a real engineer.
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
  let themeBaseDropdown = document.getElementById('themeBaseDropdown');
  let baseSelect = document.getElementById('themeBase');

  if(items.length > 0) {
    // if there are items, enable fields
    brightnessSliderWrap.classList.remove('is-disabled');
    contrastSliderWrap.classList.remove('is-disabled');
    themeBaseLabel.classList.remove('is-disabled');
    themeBaseDropdown.classList.remove('is-disabled');
    brightnessSlider.disabled = false;
    contrastSlider.disabled = false;
    baseSelect.disabled = false;
  }
  else if(items.length == 0) {
    // disable fields
    brightnessSliderWrap.classList.add('is-disabled');
    contrastSliderWrap.classList.add('is-disabled');
    themeBaseLabel.classList.add('is-disabled');
    themeBaseDropdown.classList.add('is-disabled');
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

  let allRatios = [];

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
      let smooth = colorData.smooth;

      allRatios.push(colorData.ratios);

      let gradientId = id.concat('_gradient');
      let gradient = document.getElementById(gradientId);
      gradient.innerHTML = ' ';
      let n = window.innerWidth - 272;

      let colorClass;
      if(name === themeConfigs.baseScale) {
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
      // let colors = colorClass.colorScale;

      colors = cvdColors(colors);

      themeRamp(colors, gradientId);
    }

    // if(colorsArray !== themeClass.colors) {
    //   themeClass.colors = colorsArray;
    // }
    // if(backgroundColor !== themeClass.backgroundColor) {
    //   themeClass.colors = colorsArray;
    // }
    // if(Number(themeConfigs.brightness) !== themeClass.lightness) {
    //   themeClass.lightness = Number(themeConfigs.brightness);
    // }
    // if(Number(themeConfigs.contrast) !== themeClass.contrast) {
    //   themeClass.contrast = Number(themeConfigs.contrast);
    // }

    let themeClass = new Leo.Theme({
      colors: colorsArray,
      backgroundColor: backgroundColor,
      lightness: Number(themeConfigs.brightness),
      contrast: Number(themeConfigs.contrast)
    });

    let theme = themeClass.contrastColors;
    
    const themeBackgroundColor = theme[0].background;
    const themeBackgroundColorArray = [d3.rgb(themeBackgroundColor).r, d3.rgb(themeBackgroundColor).g, d3.rgb(themeBackgroundColor).b]
    const backgroundLum = d3.hsluv(themeBackgroundColor).v;
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
      themeSwatchRamp(arr, gradientId);
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
        p.className = 'spectrum-Subheading';
        p.innerHTML = 'Background';
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
      lightness: ${themeConfigs.brightness},
      contrast: ${themeConfigs.contrast}
    });`;
    const highlightedCode = hljs.highlight(paramOutputString, {language: 'javascript'}).value
    paramsOutput.innerHTML = highlightedCode;

    // TODO: Need to merge the allRatios array into a single array of unique values.
    // Although currently it will merely be a duplication of the same array of ratios,
    // which is why this solution is sufficient for the time being.
    let chartRatios = allRatios[0].map(ratio => {
      return Number(ratio);
    });

    // charts2d.createContrastRatioChart(chartRatios);
    createRatioChart(chartRatios);
  }
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

window.themeUpdateParams = themeUpdateParams;
function themeUpdateParams() {
  themeInput();
  let config = getThemeData();
  let name = getThemeName();

  config = JSON.stringify(config);

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
    themeAddColor(d3.color(bulkValues[i]).formatHex(), itemId);
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

  // 4. Find smoothing
  let smoothId = id.concat('_smooth');
  let smoothSwitch = document.getElementById(smoothId);
  let smooth = smoothSwitch.checked;

  // 4. find ratios
  // let ratiosId = id.concat('_ratios');
  // let ratiosInput = document.getElementById(ratiosId);
  // let rVals = ratiosInput.value;
  // let r = new Array(rVals);
  // let rSplit = r.join("").split(',');
  // let ratios = rSplit.map(x => parseFloat(x));
  let ratios = getContrastRatios();
  // TODO: remove all values of NaN

  return {
    colorName: colorName,
    colorArgs: colorArgs,
    mode: mode,
    smooth: smooth,
    ratios: ratios
  }
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
document.getElementById("tabThemeConfigs").click();

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


// When adding new ratios in UI, run colorinput as well
window.addNewRatio = function addNewRatio() {
  addRatio();
}


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
  luminosityInput.className = 'spectrum-Textfield ratioGrid--luminosity';
  luminosityInput.type = "number";
  luminosityInput.min = '0';
  luminosityInput.max = '100';
  luminosityInput.step = '1';
  luminosityInput.id = randId + "_luminosity";
  luminosityInput.oninput = syncRatioInputs;

  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--quiet ratioGrid--actions';
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
  inputWrapper.appendChild(ratioInput);
  // div.appendChild(fontSizeInput);
  // div.appendChild(fontWeightInput);
  div.appendChild(luminosityInput);
  div.appendChild(inputWrapper)
  div.appendChild(button);
  ratios.appendChild(div);

  // charts2d.createContrastRatioChart(data, 'contrastChart', 'line');
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
function toggleCardConfigs(e) {
  let element = e.target.id;
  let button = document.getElementById(element);
  let svgs = button.getElementsByTagName('svg');

  let id = element.replace('-toggleConfig', '');
  let configs = document.getElementById(`${id}-themeColor_configs`);

  if(!configs.classList.contains('is-hidden')) {
    for (let svg of svgs) {
      svg.style.transform = 'rotate(0deg)';
    }
    configs.classList.add('is-hidden');
  } else {
    for (let svg of svgs) {
      svg.style.transform = 'rotate(-90deg)';
    }
    configs.classList.remove('is-hidden');
  }
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