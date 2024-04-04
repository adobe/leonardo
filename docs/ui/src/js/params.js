/*
Copyright 2024 Adobe. All rights reserved.
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
import {addRatioInputs, sortRatios} from './ratios';
import {getRandomColorName, getClosestColorName} from './predefinedColorNames';
import {baseScaleOptions} from './createBaseScaleOptions';
import {round, sanitizeQueryString} from './utils';
import {_theme, tempGray} from './initialTheme';

function paramSetup() {
  let setFirstColorSmoothing = false;
  let url = new URL(window.location);
  let params = new URLSearchParams(sanitizeQueryString(url.search.slice(1)));
  let themeBase = document.getElementById('themeBase');
  let RATIOS;
  let RATIOCOLORS;

  let themeNameInput = document.getElementById('themeNameInput');
  if (params.has('name')) {
    themeNameInput.value = params.get('name').toString();
    let characters = params.get('name').toString().length;
    themeNameInput.style.width = `${characters + 4}ch`;
  } else {
    themeNameInput.value = 'Untitled';
    let characters = 'Untitled'.length;
    themeNameInput.style.width = `${characters + 4}ch`;
  }
  // updateThemeTitle();

  if (params.has('config') && params.get('config') !== undefined) {
    let configParam = params.get('config');
    let config = JSON.parse(configParam);
    let colorScales = config.colorScales;
    let baseScale = config.baseScale;
    let lightness = config.lightness ? config.lightness : config.brightness;

    let contrast;
    let formula;
    if (!config.formula) {
      formula = 'wcag2';
    } else {
      formula = config.formula;
    }
    _theme.formula = formula;

    if (!config.contrast) {
      contrast = 1;
    } else {
      contrast = config.contrast;
    }

    if (colorScales.length > 0) {
      _theme.removeColor = tempGray;

      colorScales.map((color, i) => {
        let colorName = color.name;
        let keyColors = color.colorKeys;
        let colorSpace = color.colorspace;
        let ratios = color.ratios;
        let smooth = i === 0 ? false : color.smooth;
        if (color.smooth === 'true') {
          if (color.colorspace === 'OKLAB' || color.colorspace === 'OKLCH') setFirstColorSmoothing = true;
        }

        // Create color scale item
        let newColor = new Leo.BackgroundColor({
          name: colorName,
          colorKeys: keyColors,
          colorspace: colorSpace,
          ratios: ratios,
          smooth: smooth
        });

        addColorScale(newColor);

        // If the color scale name matches the base scale
        // in the config, assign it to the theme's backgroundColor
        // via the theme setter
        if (colorName === baseScale) {
          _theme.backgroundColor = newColor;
        }
      });

      RATIOS = Promise.resolve([...colorScales[0].ratios]);
      RATIOCOLORS = Promise.resolve(
        _theme.contrastColors[1].values.map((c) => {
          return c.value;
        })
      );
    } else {
    }

    let slider = document.getElementById('themeBrightnessSlider');
    let sliderVal = document.getElementById('themeBrightnessValue');

    if (lightness === undefined) lightness = 0;
    _theme.lightness = lightness;
    slider.value = lightness;
    sliderVal.innerHTML = lightness;

    let contrastSlider = document.getElementById('themeContrastSlider');
    let contrastSliderVal = document.getElementById('themeContrastValue');
    contrastSlider.value = contrast;
    contrastSliderVal.innerHTML = `${round(contrast * 100)}%`;
    _theme.contrast = contrast;

    // generate the options for the base scale,
    // then select the option defined in parameters
    baseScaleOptions();
    themeBase.value = baseScale;

    Promise.all([RATIOS, RATIOCOLORS])
      .then((values) => {
        addRatioInputs(values[0], values[1]);
      })
      .then(() => {
        setTimeout(() => {
          document.getElementById('themeWCAG').value = formula;
          let label = document.getElementById('ratioInputLabel');
          label.innerHTML = formula === 'wcag2' ? 'WCAG 2 contrast' : formula === 'wcag3' ? 'APCA contrast' : 'Contrast';

          sortRatios();
        }, 500);
      });
  } else if (params.has('colorKeys')) {
    // old way used #, but now it's seen as a hash.
    // Have to replace # with character code and reset URL
    if (window.location.hash) {
      let hash = window.location.hash.toString();
      // let newParam = hash.replaceAll(`#`, `%23`).replaceAll(`,`, `%54`);
      let paramArray = hash.split('&');
      // console.log(paramArray)
      let paramOptions = ['base', 'mode', 'ratios'];
      paramArray.map((p) => {
        for (let i = 0; i < paramOptions.length; i++) {
          if (p.includes(paramOptions[i])) {
            // strip string to reveal parameters
            let value = p.replace(`${paramOptions[i]}=`, '');
            params.set(`${paramOptions[i]}`, value);
          }
        }
      });

      params.set('colorKeys', paramArray[0]);
      window.history.replaceState({}, '', '?' + params); // update the page's URL.
    }

    let colorKeys = Promise.resolve(params.get('colorKeys').split(','));
    let colorspace = Promise.resolve(params.get('mode'));
    let ratios = Promise.resolve(
      params
        .get('ratios')
        .split(',')
        .map((r) => {
          return Number(r);
        })
    );

    Promise.all([colorKeys, colorspace, ratios])
      .then((values) => {
        RATIOS = values[2];
        let newColor = new Leo.BackgroundColor({
          name: getClosestColorName(values[0][0]),
          colorKeys: values[0],
          colorspace: values[1],
          ratios: values[2],
          smooth: false
        });
        let length = _theme.colors.length;
        for (let i = 0; i < length; i++) {
          // Add default color
          addColorScale(_theme.colors[i], false);
        }
        addColorScale(newColor);
        baseScaleOptions();
        themeBase.value = _theme.backgroundColor.name;
      })
      .then(() => {
        // Update default gray to input ratios
        _theme.updateParams = {name: _theme.colors[0].name, ratios: RATIOS};
      })
      .then(() => {
        setTimeout(() => {
          RATIOCOLORS = Promise.resolve(
            _theme.contrastColors[1].values.map((c) => {
              return c.value;
            })
          );
          RATIOCOLORS.then((resolve) => {
            // console.log(resolve)
            addRatioInputs(RATIOS, resolve);
          });
        }, 100);
      })
      .then(() => {
        setTimeout(() => {
          sortRatios();
        }, 500);
      });
  } else if (!params.has('config') || params.get('config') === undefined || !params.has('colorKeys')) {
    addRatioInputs([1.45, 2.05, 3.02, 4.54, 7, 10.86], ['#d6d6d6', '#b5b5b5', '#8a8a8a', '#767676', '#595959', '#3d3d3d']);
    let length = _theme.colors.length;
    for (let i = 0; i < length; i++) {
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
    if (setFirstColorSmoothing) {
      let firstColorName = _theme.colors[0].name;
      _theme.updateColor = {name: firstColorName, smooth: 'true'};
    }
    themeUpdate();
  }, 200);
  clearParams();
}

function clearParams() {
  let uri = window.location.toString();
  let cleanURL = uri.substring(0, uri.indexOf('?'));

  window.history.replaceState({}, document.title, cleanURL);
}

module.exports = {
  paramSetup,
  clearParams
};
