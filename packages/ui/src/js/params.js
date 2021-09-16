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

import {addColorScale} from './colorScale';
import {addRatios} from './ratios';
import {sliderInput} from './sliderInput';
import {_theme} from './initialTheme';

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

module.exports = { 
  paramSetup,
  updateParams,
  clearParams
};
