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
import {round, simulateCvd, getDifference, capitalizeFirstLetter, alphaBlend, colorPickerInput} from './utils';
import {createTable} from './createTable';

const DeltaE = require('delta-e');

const minimumThreshold = 11;

function testCvd(color1, color2, mode) {
  let sim1 = mode === 'normal vision' ? color1 : simulateCvd(color1, mode);
  let sim2 = mode === 'normal vision' ? color2 : simulateCvd(color2, mode);

  let deltaE = getDifference(sim1, sim2);

  let result = deltaE < minimumThreshold ? 'Unsafe' : 'Safe';

  return {
    cvd: mode,
    status: result,
    deltaE: deltaE,
    colors: [sim1, sim2]
  };
}

function colorDifferenceReport(fg, bg) {
  let colorDifferenceReportWrapper = document.getElementById('colorDifferenceReport');
  colorDifferenceReportWrapper.innerHTML = ' ';

  let headers = ['Preview', 'Vision type', 'Status', 'Color difference'];
  let rows = [];

  const modes = ['normal vision', 'deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia'];
  for (let i = 0; i < modes.length; i++) {
    let colorData = testCvd(fg, bg, modes[i]);

    let badgeClass = colorData.deltaE < minimumThreshold ? 'negative' : 'positive';
    let meterClass = colorData.deltaE < minimumThreshold ? 'is-negative' : 'is-positive';

    let modeName = capitalizeFirstLetter(modes[i]);

    let meterPercent = round(colorData.deltaE, 2);

    let rowItem = [
      `<div class="dualSwatch">
        <div class="swatch" style="background-color: ${colorData.colors[0]}"></div>
        <div class="swatch" style="background-color: ${colorData.colors[1]}"></div>
      </div>`,
      `<span class="spectrum-Heading spectrum-Heading--sizeXXS">${modeName}</span>`,
      `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${badgeClass}">${colorData.status}</span>`,
      `<div">
        <div class="spectrum-ProgressBar spectrum-ProgressBar--sizeM deltaE-meter ${meterClass}" value="${meterPercent}" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
          <div class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-ProgressBar-label">Delta E</div>
          <div class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-ProgressBar-percentage">${meterPercent}</div>
          <div class="spectrum-ProgressBar-track">
            <div class="spectrum-ProgressBar-fill" style="width: ${meterPercent}%;"></div>
          </div>
        </div>
      </div>`
    ];
    rows.push(rowItem);
  }

  // Create report table per specified level
  createTable(headers, rows, 'colorDifferenceReport');
}

function contrastReport(fg, bg, level) {
  // Get output targets
  let contrastWrapper = document.getElementById('contrastOutput');
  let contrastReportWrapper = document.getElementById('contrastReport');
  contrastWrapper.innerHTML = ' ';
  contrastReportWrapper.innerHTML = ' ';

  // Calculate contrast and update UI with results
  let fgArray = fg.rgb();
  if (chroma(fg).alpha() < 1) fgArray = alphaBlend(fg, bg);
  let bgArray = bg.rgb();
  let contrast = Leo.contrast(fgArray, bgArray);

  // Create swatches and ratio output
  let outerSwatch = document.createElement('div');
  outerSwatch.className = 'contrastSwatch--outer';
  outerSwatch.style.backgroundColor = bg.hex();

  let innerSwatch = document.createElement('div');
  innerSwatch.className = 'contrastSwatch--inner';
  innerSwatch.style.backgroundColor = fg.hex();

  let ratioText = document.createElement('span');
  ratioText.className = 'spectrum-Heading spectrum-Heading--sizeXXXL';
  ratioText.innerHTML = round(contrast, 2);

  outerSwatch.appendChild(innerSwatch);
  contrastWrapper.appendChild(outerSwatch);
  contrastWrapper.appendChild(ratioText);

  let WCAGmins;
  if (level === 'AA') {
    WCAGmins = [4.5, 3, 3];
  }
  if (level === 'AAA') {
    WCAGmins = [7, 4.5, 3];
  }
  let smallTextClass = contrast < WCAGmins[0] ? 'negative' : 'positive';
  let largeTextClass = contrast < WCAGmins[1] ? 'negative' : 'positive';
  let uiClass = contrast < WCAGmins[2] ? 'negative' : 'positive';

  let smallTextStatus = contrast < WCAGmins[0] ? 'Fail' : 'Pass';
  let largeTextStatus = contrast < WCAGmins[1] ? 'Fail' : 'Pass';
  let uiStatus = contrast < WCAGmins[2] ? 'Fail' : 'Pass';

  // Create report table per specified level
  let WCAG2Headers = ['WCAG Criteria', 'Score', 'Minimum'];
  let WCAG2Rows = [
    ['Regular text (24px / 19px bold and below)', `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${smallTextClass}">${smallTextStatus}</span>`, WCAGmins[0]],
    ['Large text (24px / 19px bold and above)', `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${largeTextClass}">${largeTextStatus}</span>`, WCAGmins[1]],
    ['UI Components & graphics', `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${uiClass}">${uiStatus}</span>`, WCAGmins[2]]
  ];
  createTable(WCAG2Headers, WCAG2Rows, 'contrastReport');
}

function levelSelect(e) {
  let value = e.target.value;
  let fg = chroma(document.getElementById('compareColorOneInput').value);
  let bg = chroma(document.getElementById('compareColorTwoInput').value);

  let blendedValue = alphaBlend(fg.hex(), bg);

  contrastReport(blendedValue, bg, value);
}

function compareColors(e) {
  if (e !== undefined) {
    // Identify which input is triggered
    let id = e.target.id;
    let swatchId = id.replace('Input', '_swatch');
    let pickerId = id.replace('Input', '_picker');
    let value = e.target.value;

    // If it's a valid color input, do this stuff...
    if (chroma.valid(value)) {
      let color = chroma(value);

      // Colorize the big swatch
      let swatch = document.getElementById(swatchId);
      let picker = document.getElementById(pickerId);
      swatch.style.backgroundColor = chroma(color).hex();
      picker.value = chroma(color).hex();

      // Maybe do some stuffs... then,
      let fg = id.includes('One') ? color : chroma(document.getElementById('compareColorOneInput').value);
      let bg = id.includes('Two') ? color : chroma(document.getElementById('compareColorTwoInput').value);

      // Get value for the rating level for the report.
      let ratingSelect = document.getElementById('complianceLevel');
      let level = ratingSelect.value;

      alphaGradient(fg);
      contrastReport(fg, bg, level);
      colorDifferenceReport(fg, bg);
    }
  }
}

function sliderRangeInteraction(value) {
  let handleWrap = document.getElementById('alphaSliderHandleWrap');
  let handle = document.getElementById('alphaSliderHandle');
  let backgroundColor = document.getElementById('compareColorTwoInput').value;
  let pos = value / 100;

  const colorInput = document.getElementById('compareColorOneInput');
  let inputVal = colorInput.value;
  let newVal = chroma(`${inputVal}`).alpha(pos);

  if (inputVal.match(/^rgb/)) {
    newVal = newVal.css('rgb');
  }

  colorInput.value = newVal;
  handleWrap.style.left = `${pos * 100}%`;
  handle.style.backgroundColor = newVal;

  let swatch = document.getElementById('compareColorOne_swatch');
  let blendedValue = alphaBlend(newVal.hex(), backgroundColor);

  let comparisonValue = pos < 1 ? blendedValue : newVal;

  swatch.style.backgroundColor = comparisonValue.hex();

  // Maybe do some stuffs... then,
  let fg = newVal;
  let bg = chroma(backgroundColor);

  // Get value for the rating level for the report.
  let ratingSelect = document.getElementById('complianceLevel');
  let level = ratingSelect.value;

  alphaGradient(fg);
  contrastReport(comparisonValue, bg, level);
  colorDifferenceReport(comparisonValue, bg);
}

function alphaGradient(color) {
  let grad = document.getElementById('alphaSliderGradient');
  let range = document.getElementById('alphaSliderRange');
  let handle = document.getElementById('alphaSliderHandle');
  let handleWrap = document.getElementById('alphaSliderHandleWrap');

  let c = chroma(color).rgb();
  let cAlpha = chroma(color).alpha() * 100;

  let start = `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0)`;
  let end = `rgba(${c[0]}, ${c[1]}, ${c[2]}, 1)`;

  let linearGrad = 'linear-gradient(to right, ' + start + ' 0%, ' + end + ' 100%)';

  handle.style.backgroundColor = chroma(color).css('rgb');

  grad.style.backgroundImage = linearGrad;
  range.value = cAlpha;
  handleWrap.style.left = `${cAlpha}%`;
}

window.sliderRangeInteraction = sliderRangeInteraction;

window.compareColors = compareColors;
window.colorPickerInput = colorPickerInput;
window.levelSelect = levelSelect;

document.getElementById('compareColorOneInput').addEventListener('input', compareColors);
document.getElementById('compareColorTwoInput').addEventListener('input', compareColors);
document.getElementById('compareColorOne_picker').addEventListener('input', colorPickerInput);
document.getElementById('compareColorTwo_picker').addEventListener('input', colorPickerInput);
document.getElementById('complianceLevel').addEventListener('change', levelSelect);

module.exports = {
  compareColors
};
