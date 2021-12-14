/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import * as Leo from '@adobe/leonardo-contrast-colors';
import {round} from './utils';
import {createTable} from './createTable';

function swapColors() {
  // Swap input values
  // Trigger 'oninput' event on inputs
}

function contrastReport(fg, bg, level) {
  // Get output targets
  let contrastWrapper = document.getElementById('contrastOutput');
  let contrastReportWrapper = document.getElementById('contrastReport');
  contrastWrapper.innerHTML = ' ';
  contrastReportWrapper.innerHTML = ' ';

  // Calculate contrast and update UI with results
  let fgArray = fg.rgb();
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
  if(level === 'AA') {
    WCAGmins = [4.5, 3, 3]
  }
  if(level === 'AAA') {
    WCAGmins = [7, 4.5, 3]
  }
  let smallTextClass = (contrast < WCAGmins[0]) ? 'negative' : 'positive';
  let largeTextClass = (contrast < WCAGmins[1]) ? 'negative' : 'positive';
  let uiClass = (contrast < WCAGmins[2]) ? 'negative' : 'positive';

  let smallTextStatus = (contrast < WCAGmins[0]) ? 'Fail' : 'Pass';
  let largeTextStatus = (contrast < WCAGmins[1]) ? 'Fail' : 'Pass';
  let uiStatus = (contrast < WCAGmins[2]) ? 'Fail' : 'Pass';

  // Create report table per specified level
  let WCAG2Headers = ['WCAG Criteria', 'Score', 'Minimum']
  let WCAG2Rows = [
    ['Regular text (24px / 19px bold and below)', `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${smallTextClass}">${smallTextStatus}</span>`, WCAGmins[0]],
    ['Large text (24px / 19px bold and above)', `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${largeTextClass}">${largeTextStatus}</span>`, WCAGmins[1]],
    ['UI Components & graphics', `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${uiClass}">${uiStatus}</span>`, WCAGmins[2]],
  ]
  createTable(WCAG2Headers, WCAG2Rows, 'contrastReport')
}

function levelSelect(e) {
  let value = e.target.value;
  let fg = chroma(document.getElementById('compareColorOneInput').value);
  let bg = chroma(document.getElementById('compareColorTwoInput').value);

  contrastReport(fg, bg, value);
}

function colorDifferenceReport() {
  // Calculate Delta-E and CVD simulated deltas and update UI with results
}

function compareColors(e) {
  if(e !== undefined) {
    // Identify which input is triggered
    let id = e.target.id;
    let swatchId = id.replace('Input', '_swatch');
    let value = e.target.value;

    // If it's a valid color input, do this stuff...
    if(chroma.valid(value)) {
      let color = chroma(value);
      
      // Colorize the big swatch
      let swatch = document.getElementById(swatchId);
      swatch.style.backgroundColor = chroma(color).hex();

      // Maybe do some stuffs... then,
      let fg = (id.includes('One')) ? color : chroma(document.getElementById('compareColorOneInput').value);
      let bg = (id.includes('Two')) ? color : chroma(document.getElementById('compareColorTwoInput').value);

      // Get value for the rating level for the report.
      let ratingSelect = document.getElementById('complianceLevel');
      let level = ratingSelect.value;
      
      contrastReport(fg, bg, level);
      colorDifferenceReport();
    }
  }
  
}

window.compareColors = compareColors;
window.levelSelect = levelSelect;

document.getElementById('compareColorOneInput').addEventListener('input', compareColors);
document.getElementById('compareColorTwoInput').addEventListener('input', compareColors);
document.getElementById('complianceLevel').addEventListener('change', levelSelect);

module.exports = {
  swapColors,
  compareColors
}