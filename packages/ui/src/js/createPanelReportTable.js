import * as Leo from '@adobe/leonardo-contrast-colors';
import { createTable } from './createTable';
import {
  round,
  getDifference
} from './utils';
const chroma = require('chroma-js');

function createPanelReportTable(colors, background, scaleType, level) {
  if(!colors) {
    const colorClass = (scaleType==='sequential') ? _sequentialScale : _divergingScale;
    let scaleColors = colorClass.colors;
    colors = [
      scaleColors[0],
      scaleColors[scaleColors.length - 1]
    ]
  }
  if(!background) { 
    background = document.getElementById(`${scaleType}_bgColor`).value
  }
  if(scaleType && !level) {
    let compliancePicker = document.getElementById(`${scaleType}_complianceLevel`);
    level = compliancePicker.value;
  }

  let bgArray = chroma(background).rgb();
  const minimumThreshold = 11;
  const WCAGmin = (level === 'AA') ? 3 : 4.5 ;

  let reportWrapper = document.getElementById('sequential_a11yTable');
  reportWrapper.innerHTML = ' ';

  let headers = ['Analysis colors', 'Preview', 'Status', 'Contrast', 'Difference'];
  let rows = []

  for(let i=0; i < colors.length; i++) {
    let fgArray = chroma(colors[i]).rgb();
    let contrast = Leo.contrast(fgArray, bgArray);

    let deltaE = getDifference(colors[i], background);
    let meterPercent = round(deltaE, 2);

    let uiClass = (contrast < WCAGmin || deltaE < minimumThreshold) ? 'negative' : 'positive';
    let uiStatus = (contrast < WCAGmin || deltaE < minimumThreshold) ? 'Fail' : 'Pass';

    let meterClass = (deltaE < minimumThreshold) ? 'is-negative' : 'is-positive';
    let color1 = (i === 0) ? 'Start color' : 'End color';
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
    rows.push(rowItem)
  }

  // Duplicate same process against the two input colors themselves...
  let fgArray = chroma(colors[0]).rgb();
  let altArray = chroma(colors[1]).rgb();
  let contrast = Leo.contrast(fgArray, altArray);

  let deltaE = getDifference(colors[0], colors[1]);
  let meterPercent = round(deltaE, 2);
  let meterClass = (deltaE < minimumThreshold) ? 'is-negative' : 'is-positive';

  let uiClass = (contrast < WCAGmin || deltaE < minimumThreshold) ? 'negative' : 'positive';
  let uiStatus = (contrast < WCAGmin || deltaE < minimumThreshold) ? 'Fail' : 'Pass';
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
  rows.push(rowItem)
 
  createTable(headers, rows, 'sequential_a11yTable')
}

module.exports = {
  createPanelReportTable
}