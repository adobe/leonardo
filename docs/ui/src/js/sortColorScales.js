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
import {_theme} from './initialTheme';
import {addColorScale} from './colorScale';
import {themeUpdate} from './themeUpdate';
import {removeElementsByClass} from './utils';
const chroma = require('chroma-js');
const {extendChroma} = require('./chroma-plus');
extendChroma(chroma);

window.sortColorScales = sortColorScales;
function sortColorScales() {
  // Create an overlay to show progress
  const wrapper = document.getElementById('themeColorWrapper');
  wrapper.style.opacity = 0.4;

  // Artificially pause
  setTimeout(() => {
    // For each color scale, find the average hue of all key colors
    // Create a new array [ { hue: 0, color: Color }, etc]
    // which just nests each color scale in an object containing the hue
    let objArr = [];
    for (let i = 0; i < _theme.colors.length; i++) {
      let currentKeys = _theme.colors[i].colorKeys;
      let hues = currentKeys.map((key) => {
        return chroma(key).jch()[2];
      });
      let chromas = currentKeys.map((key) => {
        return chroma(key).jch()[1];
      });
      let sumChromas = chromas.reduce((a, b) => a + b, 0);
      let avgChromas = sumChromas / chromas.length || 0;
      let sumHues = hues.reduce((a, b) => a + b, 0);
      let avgHues = sumHues / hues.length || 0;

      // Gray or near-gray should be placed at the top of
      // this sort function, so we force it artificially
      if (avgChromas < 10) avgHues = 0;

      // Hack to force placement of color that has hues
      // that cross over the 360deg threshold (ie, [1, 358])
      if (Math.max(...hues) > 340 && Math.min(...hues) < 20) avgHues = 360;

      objArr.push({hue: avgHues, color: _theme.colors[i]});
    }

    // Then, sort the new array by the hue key
    objArr.sort((a, b) => {
      return a.hue - b.hue;
    });
    let sortedColors = objArr.map((item) => {
      return item.color;
    });

    // Remove colors from theme before re-adding
    _theme.colors = [];
    // Then replace all DOM elements for colorscales with new ones so they're
    // presented in the same order as the theme has them.
    removeElementsByClass('themeColor_item');
    for (let i = 0; i < sortedColors.length; i++) {
      addColorScale(sortedColors[i]);
    }

    themeUpdate();
    wrapper.style.opacity = 1;
  }, 50);
}

module.exports = {
  sortColorScales
};
