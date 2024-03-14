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
import d3 from './d3';
import {_theme} from './initialTheme';
import {round, cssColorToRgb, colorToGrayScale} from './utils';

function createOutputColors(dest) {
  if (dest) dest = document.getElementById(dest);

  let wcagFormula = document.getElementById('themeWCAG').value;
  let swatchesOutputs = document.getElementById('swatchesOutputs');
  let themeOutputs = document.getElementById('themeOutputs');
  swatchesOutputs.classList = 'hideSwatchLuminosity hideSwatchContrast';

  let theme = _theme.contrastColors;
  let themeBackgroundColor;
  if (_theme.output === 'RGB' || _theme.output === 'HEX') {
    themeBackgroundColor = theme[0].background;
  } else {
    // First, make the color an RGB color
    themeBackgroundColor = cssColorToRgb(theme[0].background);
  }

  let themeBackgroundColorArray = [d3.rgb(themeBackgroundColor).r, d3.rgb(themeBackgroundColor).g, d3.rgb(themeBackgroundColor).b];
  const backgroundLum = _theme.lightness;

  let themeColorArray = [];

  themeOutputs.style.backgroundColor = themeBackgroundColor;
  let destinations = dest ? [dest] : [themeOutputs, swatchesOutputs];
  // Iterate each color from theme except 1st object (background)
  destinations.map((dest) => {
    dest.innerHTML = ' ';

    // Ignore first theme item (background color) when making swatches for
    // the Swatch tab. Only create the background color in the Theme preview
    // Only grab one color (i=1, i<2) to show in UI, which will be turned grayscale
    let length = dest === swatchesOutputs ? 2 : theme.length;
    for (let i = dest === swatchesOutputs ? 1 : 0; i < length; i++) {
      let wrapper = document.createElement('div');
      wrapper.className = 'themeOutputItem';

      let swatchWrapper = document.createElement('div');
      swatchWrapper.className = 'themeOutputColor';
      let colorName = theme[i].name;
      let outerTextColor = backgroundLum > 50 ? '#000000' : '#ffffff';
      // Iterate each color value
      if (theme[i].values) {
        let p = document.createElement('p');
        p.className = 'spectrum-Heading spectrum-Heading--sizeXXS themeOutputItem--Heading';
        p.style.color = outerTextColor;
        p.innerHTML = theme[i].name;

        if (dest === themeOutputs) {
          wrapper.appendChild(p);
        }

        for (let j = 0; j < theme[i].values.length; j++) {
          // for each value object
          let originalValue = theme[i].values[j].value; // output value of color
          let formattedName = colorName.replace(/\s+/g, ''); // these names will have had spaces removed already
          let swatchName = theme[i].values[j].name.replace(formattedName, '');

          let colorForTransform;
          if (_theme.output === 'RGB' || _theme.output === 'HEX') {
            colorForTransform = originalValue;
          } else {
            // First, make the color an RGB color
            colorForTransform = cssColorToRgb(originalValue);
          }

          let colorValue = colorForTransform;

          if (dest === swatchesOutputs) colorValue = colorToGrayScale(colorForTransform);

          // get the ratio to print inside the swatch
          let contrast = theme[i].values[j].contrast;
          let colorArray = [d3.rgb(colorForTransform).r, d3.rgb(colorForTransform).g, d3.rgb(colorForTransform).b];
          let actualContrast = Leo.contrast(colorArray, themeBackgroundColorArray, undefined, wcagFormula);

          let innerTextColor = d3.hsluv(colorForTransform).v > 50 ? '#000000' : '#ffffff';
          let contrastRounded = Math.round(actualContrast * 100) / 100;
          let contrastTextNode = wcagFormula === 'wcag2' ? contrastRounded + ' :1' : contrastRounded;
          let contrastText = document.createTextNode(contrastTextNode);
          let contrastTextSpan = document.createElement('span');
          contrastTextSpan.className = 'themeOutputSwatch_contrast';
          contrastTextSpan.appendChild(contrastText);
          contrastTextSpan.style.color = innerTextColor;

          let luminosityValue = round(d3.hsluv(colorForTransform).v, 2);
          let luminosityText = document.createTextNode(luminosityValue + '%');
          let luminosityTextSpan = document.createElement('span');
          luminosityTextSpan.className = 'themeOutputSwatch_luminosity';
          luminosityTextSpan.appendChild(luminosityText);
          luminosityTextSpan.style.color = innerTextColor;

          let swatchIndexText = document.createTextNode(swatchName);
          let swatchIndexTextSpan = document.createElement('span');
          swatchIndexTextSpan.className = 'themeOutputSwatch_index';
          swatchIndexTextSpan.appendChild(swatchIndexText);
          swatchIndexTextSpan.style.color = outerTextColor;

          let div = document.createElement('div');
          div.className = 'themeOutputSwatch';
          if (dest === themeOutputs) {
            div.title = `Click to copy value ${originalValue}`;
            // copy text should be for value of original color, not of preview color.
            div.setAttribute('data-clipboard-text', originalValue);
            div.setAttribute('tabindex', '0');
          }
          if (dest !== themeOutputs) {
            div.style.cursor = 'default';
          }

          div.style.backgroundColor = colorValue;
          div.style.borderColor = backgroundLum > 50 && contrast < 3 ? 'rgba(0, 0, 0, 0.2)' : backgroundLum <= 50 && contrast < 3 ? ' rgba(255, 255, 255, 0.4)' : 'transparent';

          if (dest === themeOutputs) {
            div.appendChild(swatchIndexTextSpan);
          } else {
            div.appendChild(luminosityTextSpan);
          }
          div.appendChild(contrastTextSpan);

          swatchWrapper.appendChild(div);
          themeColorArray.push(originalValue);
        }
        wrapper.appendChild(swatchWrapper);
      } else if (theme[i].background && dest === themeOutputs) {
        let p = document.createElement('p');
        p.className = 'spectrum-Heading spectrum-Heading--sizeXXS  themeOutputItem--Heading';
        p.innerHTML = 'Background color';
        p.style.color = backgroundLum > 50 ? '#000000' : '#ffffff';

        wrapper.appendChild(p);

        let originalValue = theme[i].background; // output value of color
        // set global variable value. Probably shouldn't do it this way.
        let colorForTransform;
        if (_theme.output === 'RGB' || _theme.output === 'HEX') {
          colorForTransform = originalValue;
        } else {
          // First, make the color an RGB color
          colorForTransform = cssColorToRgb(originalValue);
        }

        let colorValue = colorForTransform;

        let div = document.createElement('div');
        div.className = 'themeOutputSwatch';
        div.title = `Click to copy value ${originalValue}`;
        div.setAttribute('tabindex', '0');
        div.setAttribute('data-clipboard-text', originalValue);
        div.style.backgroundColor = colorValue;
        div.style.borderColor = backgroundLum > 50 ? 'rgba(0, 0, 0, 0.2)' : backgroundLum <= 50 ? ' rgba(255, 255, 255, 0.4)' : 'transparent';

        swatchWrapper.appendChild(div);
        wrapper.appendChild(swatchWrapper);

        themeColorArray.push(originalValue);
      }

      dest.appendChild(wrapper);
    }
  });

  // Unique values only
  const colorsForCopy = [...new Set(themeColorArray)];

  let copyThemeColors = document.getElementById('copyThemeColors');
  copyThemeColors.setAttribute('data-clipboard-text', colorsForCopy);
}

function createDetailOutputColors(colorName) {
  let wcagFormula = document.getElementById('themeWCAG').value;
  let swatchesOutputs = document.getElementById('detailSwatchesOutputs');
  if (swatchesOutputs) swatchesOutputs.innerHTML = ' ';

  let dest = swatchesOutputs;
  let theme = _theme.contrastColors;
  let themeBackgroundColor;
  if (_theme.output === 'RGB' || _theme.output === 'HEX') {
    themeBackgroundColor = theme[0].background;
  } else {
    // First, make the color an RGB color
    themeBackgroundColor = cssColorToRgb(theme[0].background);
  }

  let themeBackgroundColorArray = [d3.rgb(themeBackgroundColor).r, d3.rgb(themeBackgroundColor).g, d3.rgb(themeBackgroundColor).b];
  const backgroundLum = _theme.lightness;

  // Rather than looping for each color in the theme, find only the
  // color defined within the panel.
  let colorOutput = theme.filter((obj) => {
    return obj.name === colorName;
  });
  colorOutput = colorOutput[0];

  let wrapper = document.createElement('div');
  wrapper.className = 'themeOutputItem';

  let swatchWrapper = document.createElement('div');
  swatchWrapper.className = 'themeOutputColor';
  let outerTextColor = backgroundLum > 50 ? '#000000' : '#ffffff';
  // Iterate each color value
  // if (colorOutput.values) {
  let p = document.createElement('p');
  p.className = 'spectrum-Heading spectrum-Heading--sizeXXS themeOutputItem--Heading';
  p.style.color = outerTextColor;
  p.innerHTML = colorOutput.name;

  if (dest === themeOutputs) {
    wrapper.appendChild(p);
  }

  for (let j = 0; j < colorOutput.values.length; j++) {
    // for each value object
    let originalValue = colorOutput.values[j].value; // output value of color
    let formattedName = colorName.replace(/\s+/g, ''); // these names will have had spaces removed already
    let swatchName = colorOutput.values[j].name.replace(formattedName, '');

    let colorForTransform;
    if (_theme.output === 'RGB' || _theme.output === 'HEX') {
      colorForTransform = originalValue;
    } else {
      // First, make the color an RGB color
      colorForTransform = cssColorToRgb(originalValue);
    }

    // transform original color based on preview mode
    // let colorValue = cvdColors(colorForTransform);
    let colorValue = colorForTransform;

    // get the ratio to print inside the swatch
    let contrast = colorOutput.values[j].contrast;
    let colorArray = [d3.rgb(colorForTransform).r, d3.rgb(colorForTransform).g, d3.rgb(colorForTransform).b];
    let actualContrast = Leo.contrast(colorArray, themeBackgroundColorArray, undefined, wcagFormula);

    let innerTextColor = d3.hsluv(colorForTransform).v > 50 ? '#000000' : '#ffffff';
    let contrastRounded = Math.round(actualContrast * 100) / 100;
    let contrastTextNode = wcagFormula === 'wcag2' ? contrastRounded + ' :1' : contrastRounded;
    let contrastText = document.createTextNode(contrastTextNode);
    let contrastTextSpan = document.createElement('span');
    contrastTextSpan.className = 'themeOutputSwatch_contrast';
    contrastTextSpan.appendChild(contrastText);
    contrastTextSpan.style.color = innerTextColor;

    let luminosityValue = round(d3.hsluv(colorForTransform).v, 2);
    let luminosityText = document.createTextNode(luminosityValue + '%');
    let luminosityTextSpan = document.createElement('span');
    luminosityTextSpan.className = 'themeOutputSwatch_luminosity';
    luminosityTextSpan.appendChild(luminosityText);
    luminosityTextSpan.style.color = innerTextColor;

    let swatchIndexText = document.createTextNode(swatchName);
    let swatchIndexTextSpan = document.createElement('span');
    swatchIndexTextSpan.className = 'themeOutputSwatch_index';
    swatchIndexTextSpan.appendChild(swatchIndexText);
    swatchIndexTextSpan.style.color = outerTextColor;

    let div = document.createElement('div');
    div.className = 'themeOutputSwatch';
    // copy text should be for value of original color, not of preview color.
    div.setAttribute('data-clipboard-text', originalValue);
    div.setAttribute('tabindex', '0');
    div.style.backgroundColor = colorValue;
    div.style.borderColor = backgroundLum > 50 && contrast < 3 ? 'rgba(0, 0, 0, 0.2)' : backgroundLum <= 50 && contrast < 3 ? ' rgba(255, 255, 255, 0.4)' : 'transparent';

    if (dest === themeOutputs) {
      div.appendChild(swatchIndexTextSpan);
    } else {
      div.appendChild(luminosityTextSpan);
    }
    div.appendChild(contrastTextSpan);

    swatchWrapper.appendChild(div);
  }
  wrapper.appendChild(swatchWrapper);

  dest.appendChild(wrapper);
}

module.exports = {
  createOutputColors,
  createDetailOutputColors
};
