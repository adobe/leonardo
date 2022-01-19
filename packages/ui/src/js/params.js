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

import * as Leo from '@adobe/leonardo-contrast-colors';
import {addColorScale} from './colorScale';
import {
  addRatioInputs,
  sortRatios
} from './ratios';
import {sliderInput} from './sliderInput';
import {baseScaleOptions} from './createBaseScaleOptions';
import {round} from './utils';
import {
  _theme,
  tempGray
} from './initialTheme';

function paramSetup() {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));
  let pathName = url.pathname;
  let themeBase = document.getElementById('themeBase');
  let RATIOS;
  let RATIOCOLORS;

  let themeNameInput = document.getElementById('themeNameInput');
  if(params.has('name')) {
    themeNameInput.value = params.get('name').toString();
  }
  updateThemeTitle();

  if(params.has('config') && params.get('config') !== undefined) {
    let configParam = params.get('config');
    let config = JSON.parse(configParam);
    let colorScales = config.colorScales;
    let baseScale = config.baseScale;
    let lightness = (config.lightness) ? config.lightness : config.brightness;
    let contrast;
    if(!config.contrast) {
      contrast = 1;
    } else {
      contrast = config.contrast;
    }

    if(colorScales.length > 0) {
      _theme.removeColor = tempGray;

      colorScales.map(color => {
        let colorName = color.name;
        let keyColors = color.colorKeys;
        let colorSpace = color.colorspace;
        let ratios = color.ratios;
        let smooth = color.smooth;

        // Create color scale item
        let newColor = new Leo.BackgroundColor({
          name: colorName,
          colorKeys: keyColors,
          colorspace: colorSpace,
          ratios: ratios,
          smooth: smooth
        })

        addColorScale(newColor);
      })

      RATIOS = Promise.resolve([...colorScales[0].ratios]);
      RATIOCOLORS = Promise.resolve(_theme.contrastColors[1].values.map((c) => {return c.value}));
      // let sampleColors = _theme.contrastColors[2].values.map((c) => {return c.value});
      // addRatioInputs(colorScales[2].ratios, sampleColors)
    } else {
      // addColorScale('Gray', ['#000000'], 'CIECAM02', [3, 4.5]);
    }

    let slider = document.getElementById('themeBrightnessSlider');
    let sliderVal = document.getElementById('themeBrightnessValue');
    slider.value = lightness;
    sliderVal.innerHTML = lightness;
    _theme.lightness = lightness;

    let contrastSlider = document.getElementById('themeContrastSlider');
    let contrastSliderVal = document.getElementById('themeContrastValue');
    contrastSlider.value = contrast;
    contrastSliderVal.innerHTML = `${round(contrast * 100)}%`;
    _theme.contrast = contrast;
  
    // generate the options for the base scale,
    // then select the option defined in parameters
    baseScaleOptions();
    themeBase.value = baseScale;

    Promise.all([RATIOS, RATIOCOLORS]).then((values) => {
      addRatioInputs(values[0], values[1])
    }).then(() => {
      setTimeout(() => {
        sortRatios();
      }, 500)
    });
  }
  else if(params.has('colorKeys')) {
    let colorKeys = Promise.resolve(params.get('colorKeys').split(','));
    let colorspace = Promise.resolve(params.get('mode'));
    let ratios = Promise.resolve(params.get('ratios').split(',').map((r) => {return Number(r)}));

    Promise.all([colorKeys, colorspace, ratios]).then(
      (values) => {
        RATIOS = values[2]
        let newColor = new Leo.BackgroundColor({
          name: 'RANDOM NAME!',
          colorKeys: values[0],
          colorspace: values[1],
          ratios: values[2],
          smooth: false
        })
        let length = _theme.colors.length;
        for(let i=0; i<length; i++) {
          // Add default color
          addColorScale(_theme.colors[i], false);
        }
        addColorScale(newColor);
        baseScaleOptions();
        themeBase.value = _theme.backgroundColor.name;
      }
    ).then(() => {
      // Update default gray to input ratios
      _theme.updateParams = {name: _theme.colors[0].name, ratios: RATIOS};
    }).then(() => {
      setTimeout(() => {
        RATIOCOLORS = Promise.resolve(_theme.contrastColors[1].values.map((c) => {return c.value}));
        RATIOCOLORS.then((resolve) => {
          console.log(resolve)
          addRatioInputs(RATIOS, resolve)
        });
      }, 100)
    }).then(() => {
      setTimeout(() => {
        sortRatios();
      }, 500)
    })

  }
  else if(!params.has('config') || params.get('config') === undefined || !params.has('colorKeys')) {
    addRatioInputs([
      3., 
      4.5
    ], [
      '#8a8a8a', 
      '#747474'
    ]);
    // addColorScale('Gray', ['#000000'], 'CAM02');
    let length = _theme.colors.length;
    for(let i=0; i<length; i++) {
      // add color scale to UI from the default theme,
      // but do not add it to _theme, since they are already
      // coming from the _theme class to begin with.
      addColorScale(_theme.colors[i], false);
    }

    // generate the options for the base scale,
    // then select the option defined from the initial theme
    baseScaleOptions();
    themeBase.value = _theme.backgroundColor.name;
  }

  setTimeout(() => {
    themeUpdate();
  }, 200)
  clearParams();
}


function clearParams() {
  let uri = window.location.toString();
  let cleanURL = uri.substring(0, uri.indexOf("?"));

  window.history.replaceState({}, document.title, cleanURL);
}

module.exports = { 
  paramSetup,
  clearParams
};
