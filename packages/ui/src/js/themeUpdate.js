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

import * as Leo from '@adobe/leonardo-contrast-colors'
import hljs from 'highlight.js/lib/core';
import * as d3 from './d3';
import {_theme} from './initialTheme';
import {
  getThemeName,
  getColorItemClass,
  getContrastRatios,
  getAllColorKeys
} from './getThemeData';
import {cvdColors} from './cvdColors'
import {createRatioChart} from './createRatioChart';
import {
  getConvertedColorCoodrindates,
  createColorWheelDots
} from './colorDisc';
import {throttle} from './utils';

import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

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
      let currentBackgroundColor = originalValue;
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

function themeUpdateParams() {
  themeInput();
  // let config = getThemeData();
  // let name = getThemeName();

  // config = JSON.stringify(config);

  // TODO: uncomment and get this working
  // updateParams(name, config);
}

// Toggle disabled state of adaptive theme controls
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


// Update theme when theme name is changed
document.getElementById('themeNameInput').addEventListener('input', throttle(themeUpdateParams, 50));
// Update theme when base color selection is changed
document.getElementById('themeBase').addEventListener('input', throttle(themeUpdateParams, 50));

window.themeInput = themeInput;
window.themeUpdateParams = themeUpdateParams;

module.exports = {
  themeInput,
  themeUpdateParams,
  toggleControls
}