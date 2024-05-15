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
import {getAllColorNames, getThemeName} from './getThemeData';
import {camelCase} from './utils';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('css', css);

const outputFormatPicker = document.getElementById('colorOutputFormat');

function createOutputParameters() {
  const outputFormat = outputFormatPicker.value;
  const update = Promise.resolve((_theme.output = outputFormat));

  update.then(() => {
    createJSOutput();
    createCSSOutput();
    createTokensOutput();

    // Reset to hex so all other functions of the UI continue to work.
    // Otherwise CSS Module 4 formatted colors won't be parsed by Chroma.js
    _theme.output = 'HEX';
  });
}

function createJSOutput() {
  let paramsOutput = document.getElementById('themeJSParams');

  let themeName = getThemeName();
  if (!themeName) themeName = 'myTheme';
  let colors = _theme.colors;
  let colorNames = getAllColorNames();
  let colorDeclarations = [];

  for (let i = 0; i < colors.length; i++) {
    let thisColor = colors[i];
    let colorString = `let ${camelCase(thisColor.name)} = new Leo.Color({
  name: "${thisColor.name}",
  colorKeys: [${thisColor.colorKeys.map((c) => `'${c}'`)}],
  ratios: [${thisColor.ratios}],
  colorspace: "${thisColor.colorspace}",
  smooth: ${thisColor.smooth}
});`;
    colorDeclarations.push(colorString);
  }
  const joinedDeclarations = colorDeclarations.join(`\n\n`);

  let paramOutputString = `${joinedDeclarations}

let ${themeName.replace(/[^a-zA-Z0-9_$]/g, '_')} = new Leo.Theme({
  colors: [${colorNames.map((n) => camelCase(n))}],
  backgroundColor: ${camelCase(_theme.backgroundColor.name)},
  lightness: ${_theme.lightness},
  contrast: ${_theme.contrast},
  saturation: ${_theme.saturation},
  output: "${_theme.output}",
  formula: "${_theme.formula}"
});`;

  const highlightedCode = hljs.highlight(paramOutputString, {
    language: 'javascript'
  }).value;
  paramsOutput.innerHTML = highlightedCode;
}

function createCSSOutput() {
  let themeName = getThemeName();
  let themeCssClass = `.${themeName.replace(/\s/g, '')}`;
  if (!themeName) themeCssClass = ':root';

  let paramsOutput = document.getElementById('themeCSSParams');

  let contrastPairs = _theme.contrastColorPairs;
  let declarations = [];
  for (const [key, value] of Object.entries(contrastPairs)) {
    declarations.push(`  --${key}: ${value};`);
  }
  const joinedDeclarations = declarations.join(`\n`);
  let paramOutputString = `${themeCssClass} {
${joinedDeclarations}
}`;

  const highlightedCode = hljs.highlight(paramOutputString, {
    language: 'css'
  }).value;
  paramsOutput.innerHTML = highlightedCode;
}

function createTokensOutput() {
  let paramsOutput = document.getElementById('themeTokensParams');
  let themeName = getThemeName();

  let themeObj = {};
  let contrastText = _theme.contrast != 1 ? `, contrast of ${_theme.contrast * 100}%` : '';
  let saturationText = _theme.saturation != 100 ? `, saturation of ${_theme.saturation}%` : '';
  themeObj['description'] = `Color theme tokens at lightness of ${_theme.lightness}%${contrastText}${saturationText}`;

  const textLowContrast = 'Do not use for UI elements or text.';
  const textLarge = 'Color can be used for UI elements or large text.';
  const textSmall = 'Color can be used for small text.';

  let contrastColors = _theme.contrastColors;
  let backgroundColor = _theme.contrastColors[0].background;

  let backgroundColorObj = {
    $value: backgroundColor,
    $type: 'color',
    $description: `UI background color. All color contrasts evaluated and generated against this color.`
  };
  themeObj['Background'] = backgroundColorObj;

  let formulaString = _theme.formula === 'wcag2' ? 'WCAG 2.x (relative luminance)' : 'WCAG 3 (APCA)';
  let largeText = _theme.formula === 'wcag3' ? 60 : 3;
  let smallText = _theme.formula === 'wcag3' ? 75 : 4.5;

  let formulaString = _theme.formula === 'wcag2' ? 'WCAG 2.x (relative luminance)' : 'WCAG 3 (APCA)';
  let largeText = _theme.formula === 'wcag3' ? 60 : 3;
  let smallText = _theme.formula === 'wcag3' ? 75 : 4.5;

  for (let i = 1; i < contrastColors.length; i++) {
    let thisColor = contrastColors[i];
    for (let j = 0; j < thisColor.values.length; j++) {
      let color = thisColor.values[j];
      let descriptionText = color.contrast < largeText ? textLowContrast : color.contrast >= largeText && color.contrast < smallText ? textLarge : textSmall;

      let colorObj = {
        $value: color.value,
        $type: 'color',
        $description: `${descriptionText} ${formulaString} contrast is ${color.contrast}:1 against background ${backgroundColor}`
      };
      themeObj[color.name] = colorObj;
    }
  }
  let tokenObj = {
    [themeName]: themeObj
  };

  const highlightedCode = hljs.highlight(JSON.stringify(tokenObj, null, 2), {
    language: 'javascript'
  }).value;
  paramsOutput.innerHTML = highlightedCode;
}

outputFormatPicker.addEventListener('change', createOutputParameters);
createOutputParameters();

module.exports = {
  createOutputParameters
};
