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
import {createTable} from './createTable';
import {round, getDifference} from './utils';
const chroma = require('chroma-js');

function createPanelReportTable(colors, background, scaleType, level) {
  if (!colors) {
    const colorClass = scaleType === 'sequential' ? _sequentialScale : _divergingScale;
    let scaleColors = colorClass.colors;
    if (scaleType === 'sequential') {
      colors = [scaleColors[0], scaleColors[scaleColors.length - 1]];
    } else {
      colors = [scaleColors[0], colorClass.middleKey, scaleColors[scaleColors.length - 1]];
    }
  }
  if (!background) {
    background = document.getElementById(`scales_bgColor`).value;
  }
  if (scaleType && !level) {
    let compliancePicker = document.getElementById(`scales_complianceLevel`);
    level = compliancePicker.value;
  }

  let bgArray = chroma(background).rgb();
  const minimumThreshold = 11;
  const WCAGmin = level === 'AA' ? 3 : 4.5;

  let reportWrapper = document.getElementById(`${scaleType}_a11yTable`);
  reportWrapper.innerHTML = ' ';

  let headers = ['Compared colors', 'Preview', 'Status', 'Contrast', 'Color difference'];
  let rows = [];

  for (let i = 0; i < colors.length; i++) {
    let fgArray = chroma(colors[i]).rgb();
    let contrast = Leo.contrast(fgArray, bgArray);
    if (contrast < 0) contrast = contrast * -1;

    let deltaE = getDifference(colors[i], background);
    let meterPercent = round(deltaE, 2);

    let uiClass = contrast < WCAGmin || deltaE < minimumThreshold ? 'negative' : 'positive';
    let uiStatus = contrast < WCAGmin || deltaE < minimumThreshold ? 'Fail' : 'Pass';

    let meterClass = deltaE < minimumThreshold ? 'is-negative' : 'is-positive';
    let color1;
    if (scaleType === 'sequential') {
      color1 = i === 0 ? 'Start color' : 'End color';
    } else {
      color1 = i === 0 ? 'Start color' : i === 1 ? 'Middle color' : 'End color';
    }
    let color2 = 'Background';

    let rowItem = [
      `${color1} vs ${color2}`,
      `<div class="dualSwatch">
        <div class="swatch" style="background-color: ${colors[i]}"></div>
        <div class="swatch" style="background-color: ${background}"></div>
      </div>`,
      `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${uiClass}">${uiStatus}</span>`,
      `<span class="spectrum-Body spectrum-Body--sizeM">${round(contrast, 2)}:1</span>`,
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

  // Duplicate same process against the two input colors themselves...
  if (scaleType === 'sequential') {
    let fgArray = chroma(colors[0]).rgb();
    let altArray = chroma(colors[1]).rgb();
    let contrast = Leo.contrast(fgArray, altArray);
    if (contrast < 0) contrast = contrast * -1;

    let deltaE = getDifference(colors[0], colors[1]);
    let meterPercent = round(deltaE, 2);
    let meterClass = deltaE < minimumThreshold ? 'is-negative' : 'is-positive';

    let uiClass = contrast < WCAGmin || deltaE < minimumThreshold ? 'negative' : 'positive';
    let uiStatus = contrast < WCAGmin || deltaE < minimumThreshold ? 'Fail' : 'Pass';
    let color1 = 'Start color';
    let color2 = 'End color';

    let rowItem = [
      `${color1} vs ${color2}`,
      `<div class="dualSwatch">
        <div class="swatch" style="background-color: ${colors[0]}"></div>
        <div class="swatch" style="background-color: ${colors[1]}"></div>
      </div>`,
      `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${uiClass}">${uiStatus}</span>`,
      `<span class="spectrum-Body spectrum-Body--sizeM">${round(contrast, 2)}:1</span>`,
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
  if (scaleType === 'diverging') {
    let color1Array = chroma(colors[0]).rgb();
    let color2Array = chroma(colors[1]).rgb();
    let color3Array = chroma(colors[2]).rgb();
    let contrast1 = Leo.contrast(color1Array, color2Array);
    let contrast2 = Leo.contrast(color2Array, color3Array);
    if (contrast1 < 0) contrast1 = contrast1 * -1;
    if (contrast2 < 0) contrast2 = contrast2 * -1;

    let deltaE1 = getDifference(colors[0], colors[1]);
    let deltaE2 = getDifference(colors[1], colors[2]);
    let meterPercent1 = round(deltaE1, 2);
    let meterPercent2 = round(deltaE2, 2);
    let meterClass1 = deltaE1 < minimumThreshold ? 'is-negative' : 'is-positive';
    let meterClass2 = deltaE1 < minimumThreshold ? 'is-negative' : 'is-positive';

    let uiClass1 = contrast1 < WCAGmin || deltaE1 < minimumThreshold ? 'negative' : 'positive';
    let uiClass2 = contrast2 < WCAGmin || deltaE2 < minimumThreshold ? 'negative' : 'positive';
    let uiStatus1 = contrast1 < WCAGmin || deltaE1 < minimumThreshold ? 'Fail' : 'Pass';
    let uiStatus2 = contrast2 < WCAGmin || deltaE2 < minimumThreshold ? 'Fail' : 'Pass';
    let color1 = 'Start color';
    let color2 = 'Middle color';
    let color3 = 'End color';

    let rowItem1 = [
      `${color1} vs ${color2}`,
      `<div class="dualSwatch">
        <div class="swatch" style="background-color: ${colors[0]}"></div>
        <div class="swatch" style="background-color: ${colors[1]}"></div>
      </div>`,
      `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${uiClass1}">${uiStatus1}</span>`,
      `<span class="spectrum-Body spectrum-Body--sizeM">${round(contrast1, 2)}:1</span>`,
      `<div">
        <div class="spectrum-ProgressBar spectrum-ProgressBar--sizeM deltaE-meter ${meterClass1}" value="${meterPercent1}" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
          <div class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-ProgressBar-label">Delta E</div>
          <div class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-ProgressBar-percentage">${meterPercent1}</div>
          <div class="spectrum-ProgressBar-track">
            <div class="spectrum-ProgressBar-fill" style="width: ${meterPercent1}%;"></div>
          </div>
        </div>
      </div>`
    ];
    let rowItem2 = [
      `${color2} vs ${color3}`,
      `<div class="dualSwatch">
        <div class="swatch" style="background-color: ${colors[1]}"></div>
        <div class="swatch" style="background-color: ${colors[2]}"></div>
      </div>`,
      `<span class="spectrum-Badge spectrum-Badge--sizeS spectrum-Badge--${uiClass2}">${uiStatus2}</span>`,
      `<span class="spectrum-Body spectrum-Body--sizeM">${round(contrast2, 2)}:1</span>`,
      `<div">
        <div class="spectrum-ProgressBar spectrum-ProgressBar--sizeM deltaE-meter ${meterClass2}" value="${meterPercent2}" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
          <div class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-ProgressBar-label">Delta E</div>
          <div class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-ProgressBar-percentage">${meterPercent2}</div>
          <div class="spectrum-ProgressBar-track">
            <div class="spectrum-ProgressBar-fill" style="width: ${meterPercent2}%;"></div>
          </div>
        </div>
      </div>`
    ];
    rows.push(rowItem1);
    rows.push(rowItem2);
  }

  createTable(headers, rows, `${scaleType}_a11yTable`);
}

module.exports = {
  createPanelReportTable
};
