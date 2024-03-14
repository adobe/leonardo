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
import * as d3 from './d3';
import {getContrastRatioInputs, getThemeContrastRatios, getLuminosities} from './getThemeData';
import {_theme} from './initialTheme';
import {createOutputColors} from './createOutputColors';
import {createOutputParameters} from './createOutputParameters';
import {createRatioChart, createLuminosityChart} from './createRatioChart';
import {randomId, round, lerp} from './utils';
import {difference} from 'd3';

function addRatio() {
  let wcagFormula = document.getElementById('themeWCAG').value;
  // Gather all existing ratios from _theme
  let themeRatios = getContrastRatioInputs();
  // find highest value
  var hi = Math.max(...themeRatios);
  // Define cap based on wcag formula
  let cap = wcagFormula === 'wcag2' ? 20 : 106;
  // Assign an incremented value for the new ratio
  let value;
  if (hi < cap - 1) value = Number(hi + 1).toFixed(2);
  if (hi == cap) value = Number(hi - 1).toFixed(2);
  // Add new value to array of existing ratios
  themeRatios.push(value);
  themeRatios = themeRatios.map((r) => {
    return Number(r);
  });
  // Pass new array to function that updates all ratio values in the _theme
  ratioUpdateValues(themeRatios);

  // createHtmlElement
  createRatioInput(value);
  // Update the rest of the components dependent upon the ratios
  ratioUpdate(themeRatios);
}

function createRatioInput(v, c) {
  if (!c) {
    const AllRatios = Promise.resolve(getContrastRatioInputs());
    AllRatios.then(function (resolve) {
      let ratioIndex = resolve.length;
      let indexedColor = _theme.contrastColors[1].values[ratioIndex];
      if (!indexedColor) {
        c = '#cacaca';
      } else {
        c = indexedColor.value;
      }
    });
  }

  const luminosityGradient = document.getElementById('luminosityGradient');
  let luminosityValue = d3.hsluv(c).v;
  let swatchColor = d3.hsluv(0, 0, luminosityValue).formatHex();

  // let methodPicker = document.getElementById('contrastMethod');
  // let method = methodPicker.value;
  let themeWCAG = document.getElementById('themeWCAG').value;
  let method = themeWCAG === 'wcag2' ? 'WCAG' : 'APCA';

  var ratios = document.getElementById('ratioInput-wrapper');
  var div = document.createElement('div');

  var randId = randomId();
  div.className = 'ratio-Item ratioGrid';
  div.id = randId + '-item';
  var inputWrapper = document.createElement('span');

  var sw = document.createElement('span');
  sw.className = 'ratio-Swatch';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = swatchColor;
  var ratioInput = document.createElement('input');
  let ratioInputWrapper = document.createElement('div');
  ratioInputWrapper.className = 'spectrum-Textfield ratioGrid--ratio';
  ratioInput.className = 'spectrum-Textfield-input ratio-Field';
  ratioInput.type = 'number';
  ratioInput.min = method === 'APCA' ? '-107' : '-10';
  ratioInput.max = method === 'APCA' ? '106' : '21';
  ratioInput.step = '.01';
  let ratioInputDefaultValue = method === 'WCAG' ? 4.5 : 60;
  ratioInput.placeholder = ratioInputDefaultValue;
  ratioInput.id = randId;
  ratioInput.value = v;
  ratioInput.onkeydown = checkRatioStepModifiers;

  ratioInput.oninput = syncRatioInputs;

  var luminosityInput = document.createElement('input');
  let luminosityInputWrapper = document.createElement('div');
  luminosityInputWrapper.className = 'spectrum-Textfield ratioGrid--luminosity';

  luminosityInput.className = 'spectrum-Textfield-input luminosity-Field';
  luminosityInput.type = 'number';
  luminosityInput.min = '0';
  luminosityInput.max = '100';
  luminosityInput.step = '.01';
  luminosityInput.id = randId + '_luminosity';
  luminosityInput.onkeydown = checkRatioStepModifiers;
  luminosityInput.oninput = syncRatioInputs;

  // Pass fail status
  let statusLabel = document.createElement('div');
  statusLabel.id = randId + '_status';
  let statusIconName = v < 3 ? 'Alert' : 'Checkmak';
  let statusClass = v < 3 ? 'statusLabel--fail' : 'statusLabel--pass';
  let statusLabelText = v < 3 ? 'Fail' : v < 4.5 ? '+18px' : 'Pass';
  statusLabel.title = v < 3 ? 'Contrast fails minimums for text and UI components' : v < 4.5 ? 'Contrast passes minimum for large text and UI components' : 'Contrast passes minimums for all text and UI components';
  let statusLabelSpan = document.createElement('span');
  statusLabel.className = `statusLabel ${statusClass}`;
  statusLabelSpan.className = 'spectrum-Body spectrum-Body--sizeXS statusLabel-text';
  statusLabelSpan.innerHTML = statusLabelText;
  let statusIcon = `<svg class="spectrum-Icon spectrum-Icon--sizeS statusLabel-validationIcon" focusable="false" aria-hidden="true">
  <use xlink:href="#spectrum-icon-18-${statusIconName}"></use>
</svg>`;
  statusLabel.innerHTML = statusIcon;
  statusLabel.appendChild(statusLabelSpan);

  // Customize swatch names input
  // var swatchNameInput = document.createElement('input');
  // let swatchNameInputWrapper = document.createElement('div');
  // swatchNameInputWrapper.className = 'spectrum-Textfield spectrum-Textfield--quiet ratioGrid--swatchName is-readonly';

  // swatchNameInput.className = 'spectrum-Textfield-input swatchName-Field is-readonly';
  // swatchNameInput.type = "text";
  // swatchNameInput.id = randId + "_swatchName";
  // swatchNameInput.readOnly = true;
  // swatchNameInput.value = '-100'
  // swatchNameInput.oninput = syncRatioInputs;

  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet ratioGrid--actions';
  button.title = 'Delete contrast ratio';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  button.onclick = deleteRatio;

  inputWrapper.appendChild(sw);
  ratioInputWrapper.appendChild(ratioInput);
  inputWrapper.appendChild(ratioInputWrapper);

  luminosityInputWrapper.appendChild(luminosityInput);
  // swatchNameInputWrapper.appendChild(swatchNameInput);
  div.appendChild(inputWrapper);
  div.appendChild(luminosityInputWrapper);
  // div.appendChild(swatchNameInputWrapper);
  div.appendChild(button);
  div.appendChild(statusLabel);
  ratios.appendChild(div);

  /**
   * Luminosity input and gradient dot need to be
   * constructed AFTER the ratio input has been
   * added to the DOM, that way we can find the
   * index of the new ratio (from all ratios) and
   * use that index to identify a color sample from
   * the output theme to calculate the luminosity
   * value which will be populated in the luminosity
   * input and used to position the dot.
   */
  // const AllRatios = getContrastRatios();

  // let ratioIndex = AllRatios.indexOf(v);
  // TODO: Remove condition, which currently stops the ui from breaking with paramSetup values...
  // let tempColor = (_theme.contrastColors && ratioIndex > -1) ? _theme.contrastColors[1].values[ratioIndex].value : '#cacaca';
  // let luminosityValue = d3.hsluv(tempColor).v;

  let lDot = document.createElement('div');
  lDot.className = 'luminosityDot';
  lDot.id = randId.concat('_dot');

  let lightnessPerc = 100 - luminosityValue;
  let dotOffset = 0;
  let topPosition = `${Math.round(lightnessPerc)}%`;

  lDot.style.top = topPosition;
  luminosityGradient.appendChild(lDot);

  let lumInput = document.getElementById(randId + '_luminosity');
  lumInput.value = luminosityValue.toFixed(2);

  document.getElementById(randId).dispatchEvent(new Event('input'));
}

function addRatioInputs(ratios, colors) {
  ratios.forEach((ratio, index) => {
    return createRatioInput(ratio, colors[index]);
  });
  let ratioFields = document.getElementsByClassName('ratio-Field');
  for (let i = 0; i < ratioFields.length; i++) {
    ratioFields[i].dispatchEvent(new Event('input'));
  }
}

function distributeRatios() {
  // Temporarily "disable" wrapper
  let inputWrapper = document.getElementById('ratioInput-wrapper');
  setTimeout(() => {
    inputWrapper.classList.add('is-disabled');
  }, 100);

  let ratioFields = document.getElementsByClassName('ratio-Field');
  let ratioInputs = [];
  for (let i = 0; i < ratioFields.length; i++) {
    ratioInputs.push(Number(ratioFields[i].value));
  }

  let minVal = Math.min(...ratioInputs);
  let maxVal = Math.max(...ratioInputs);
  let length = ratioInputs.length - 1;
  let newRatios = [];

  for (let i = 0; i < length + 1; i++) {
    let perc = i / length;
    if (i === 0) perc = 0;
    let newVal = lerp(minVal, maxVal, perc);
    newRatios.push(round(newVal, 2));
  }

  // Update ratio inputs with new values
  for (let i = 0; i < newRatios.length; i++) {
    ratioFields[i].value = newRatios[i];
    ratioFields[i].dispatchEvent(new Event('input'));
  }
  setTimeout(() => {
    ratioUpdate();
    inputWrapper.classList.remove('is-disabled');
  }, 500);
}

function distributeLuminosity() {
  let LumFields = document.getElementsByClassName('luminosity-Field');
  let LumInputs = [];
  for (let i = 0; i < LumFields.length; i++) {
    LumInputs.push(Number(LumFields[i].value));
  }

  let inputWrapper = document.getElementById('ratioInput-wrapper');
  inputWrapper.classList.add('is-disabled');

  let minVal = Math.min(...LumInputs);
  let maxVal = Math.max(...LumInputs);
  let length = LumInputs.length - 1;
  let newLums = [];

  for (let i = 0; i < length + 1; i++) {
    let perc = i / length;
    if (i === 0) perc = 0;
    let newVal = lerp(minVal, maxVal, perc);
    newLums.push(round(newVal, 2));
  }

  if (_theme.lightness > 50) newLums.reverse();

  // newLums.sort(function(a, b){return a-b});
  // Update ratio inputs with new values
  for (let i = 0; i < newLums.length; i++) {
    LumFields[i].value = newLums[i];
  }

  setTimeout(() => {
    for (let i = 0; i < LumFields.length; i++) {
      LumFields[i].dispatchEvent(new Event('input'));
    }
  }, 200);
  setTimeout(() => {
    sortRatios();
  }, 200);
  setTimeout(() => {
    ratioUpdate();
  }, 500);

  setTimeout(() => {
    inputWrapper.classList.remove('is-disabled');
  }, 900);
}

document.getElementById('distribute').addEventListener('input', function (e) {
  let value = e.target.value;
  if (value === 'ratios') distributeRatios();
  if (value === 'luminosity') distributeLuminosity();
  e.target.value = 'none';
});

// Sort swatches in UI
function sort() {
  let ratioFields = document.getElementsByClassName('ratio-Field');
  let ratioInputs = [];
  for (let i = 0; i < ratioFields.length; i++) {
    ratioInputs.push(ratioFields[i].value);
  }
  // console.log(ratioInputs)

  ratioInputs.sort(function (a, b) {
    return a - b;
  });

  // Update ratio inputs with new values
  for (let i = 0; i < ratioInputs.length; i++) {
    ratioFields[i].value = ratioInputs[i];
  }
  setTimeout(() => {
    for (let i = 0; i < ratioInputs.length; i++) {
      ratioFields[i].dispatchEvent(new Event('input'));
    }
  }, 200);
}

function sortRatios() {
  sort();
  // ratioUpdate();
}

function syncRatioInputs(e) {
  let thisId = e.target.id;
  let baseId = thisId.includes('_luminosity') ? thisId.replace('_luminosity', '') : thisId;
  let swatchId = baseId.concat('-sw');
  let wcagFormula = document.getElementById('themeWCAG').value;

  let val = e.target.value;
  let targetContrast, luminosity, swatchColor;
  let swatch = document.getElementById(swatchId);

  if (thisId.includes('_luminosity')) {
    // Luminosity input
    baseId = thisId.replace('_luminosity', '');
    let ratioInput = document.getElementById(baseId);
    luminosity = val;

    let currentSwatchColor = window.getComputedStyle(swatch).getPropertyValue('background-color');
    let tempColorHsluv = d3.lch(currentSwatchColor);
    swatchColor = d3.lch(val, tempColorHsluv.c, tempColorHsluv.h).formatHex();

    let bg = _theme.contrastColors[0].background;
    let fgArray = [d3.rgb(swatchColor).r, d3.rgb(swatchColor).g, d3.rgb(swatchColor).b];
    let bgArray = [d3.rgb(bg).r, d3.rgb(bg).g, d3.rgb(bg).b];
    targetContrast = round(Leo.contrast(fgArray, bgArray, undefined, wcagFormula), 2);

    ratioInput.value = targetContrast;
  } else {
    // Ratio input create status report output only
    targetContrast = val;
    baseId = thisId;

    let largeText = wcagFormula === 'wcag3' ? 60 : 3;
    let smallText = wcagFormula === 'wcag3' ? 75 : 4.5;

    // update status value
    let status = document.getElementById(`${thisId}_status`);
    let statusClass = val < largeText ? 'statusLabel--fail' : 'statusLabel--pass';
    let statusLabelText = val < largeText ? 'Fail' : val < smallText ? '+18px' : 'Pass';
    status.title = val < largeText ? 'Contrast fails minimums for text and UI components' : val < smallText ? 'Contrast passes minimum for large text and UI components' : 'Contrast passes minimums for all text and UI components';
    status.className = `statusLabel ${statusClass}`;
    let statusIconName = val < largeText ? 'Alert' : 'Checkmark';
    let statusContent = `<svg class="spectrum-Icon spectrum-Icon--sizeS statusLabel-validationIcon" focusable="false" aria-hidden="true">
    <use xlink:href="#spectrum-icon-18-${statusIconName}"></use>
  </svg> <span class="spectrum-Body spectrum-Body--sizeXS statusLabel-text">${statusLabelText}</span>`;
    status.innerHTML = statusContent;
  }

  let themeRatios = Promise.resolve(getContrastRatioInputs()); // grab array of all inputs & their values for the ratios
  themeRatios.then(function (resolve) {
    const index = resolve.indexOf(targetContrast);
    if (index > -1) {
      resolve[index] = targetContrast;
    }

    ratioUpdateValues(resolve);
    ratioUpdate();

    if (!thisId.includes('_luminosity')) {
      let luminosityInputId = `${thisId}_luminosity`;
      let luminosityInput = document.getElementById(luminosityInputId);
      // Must calculate luminosity of respective contrast value

      let tempColor = _theme.contrastColors[1].values[index].value;
      luminosity = d3.lch(tempColor).l;
      luminosityInput.value = round(luminosity, 2);

      swatchColor = d3.lch(luminosity, 0, 0).formatHex();
    }

    swatch.style.backgroundColor = swatchColor;
  });

  setTimeout(() => {
    let lDotId = baseId.concat('_dot');
    let lDot = document.getElementById(lDotId);
    let lumReversed = 100 - luminosity;
    let dotPercentOffset = (lumReversed / 100) * 8;
    let dotPosition = `calc(${Math.round(lumReversed)}% - ${Math.round(dotPercentOffset)}px)`;
    lDot.style.top = dotPosition;
  }, 250);
}

function checkRatioStepModifiers(e) {
  if (!e.shiftKey) return;
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  const value = Number(e.target.value);
  let newValue;
  switch (e.key) {
    case 'ArrowDown':
      newValue = value - 1;
      e.target.value = newValue.toFixed(2);
      e.target.oninput(e);
      break;
    case 'ArrowUp':
      newValue = value + 1;
      e.target.value = newValue.toFixed(2);
      e.target.oninput(e);
      break;
    default:
  }
}

// Delete ratio
function deleteRatio(e) {
  let id = e.target.parentNode.id;
  let inputId = id.replace('-item', '');
  let input = document.getElementById(inputId);
  let value = input.value;
  let self = document.getElementById(id);
  // var sliderid = id.replace('-item', '') + '-sl';
  // var slider = document.getElementById(sliderid);
  let dotId = inputId.concat('_dot');
  let dot = document.getElementById(dotId);
  dot.remove();
  self.remove();
  // slider.remove();
  let themeRatios = getContrastRatioInputs();
  const index = themeRatios.indexOf(value);
  if (index > -1) {
    themeRatios.splice(index, 1);
  }

  ratioUpdateValues();
  ratioUpdate();
}

function ratioUpdate(chartRatios = Promise.resolve(getThemeContrastRatios()), chartLuminosities = Promise.resolve(getLuminosities())) {
  Promise.all([chartRatios, chartLuminosities]).then(function (values) {
    createOutputColors();
    createRatioChart(values[0]);
    createLuminosityChart(values[1]);
    createOutputParameters();
  });
}

function ratioUpdateValues(themeRatios = getThemeContrastRatios()) {
  themeRatios = themeRatios.map((r) => {
    return Number(r);
  });
  let argArray = [];

  _theme.colors.forEach((c) => {
    if (c) {
      argArray.push({color: c.name, ratios: themeRatios});
    }
  });
  _theme.updateColor = argArray;
}

function dispatchRatioInputEvents() {
  let inputWrapper = document.getElementById('ratioInput-wrapper');
  inputWrapper.classList.add('is-disabled');

  // Loop every target ratio input and trigger input event to refresh
  // lightness values and position of dot on gradient visual
  let ratioFields = document.getElementsByClassName('ratio-Field');
  for (let i = 0; i < ratioFields.length; i++) {
    ratioFields[i].dispatchEvent(new Event('input'));
  }
  setTimeout(() => {
    inputWrapper.classList.remove('is-disabled');
  }, 900);
}

document.getElementById('themeWCAG').addEventListener('input', function (e) {
  let inputWrapper = document.getElementById('ratioInput-wrapper');
  inputWrapper.classList.add('is-disabled');
  let value = e.target.value;
  _theme.formula = value;

  let label = document.getElementById('ratioInputLabel');
  label.innerHTML = value === 'wcag2' ? 'WCAG 2 contrast' : value === 'wcag3' ? 'APCA contrast' : 'Contrast';

  // Gather all luminosity input values
  // Create temporary color for each with it's L value
  // Calculate new contrast formula value based on the temp color
  // Map that to the new ratio input values
  let LumFields = document.getElementsByClassName('luminosity-Field');
  let LumValues = [];
  for (let i = 0; i < LumFields.length; i++) {
    LumValues.push(LumFields[i].value);
  }

  let newContrasts = LumValues.map((l) => {
    let swatchColor = d3.hsluv(0, 0, l).formatHex();
    let bg = _theme.contrastColors[0].background;
    let fgArray = [d3.rgb(swatchColor).r, d3.rgb(swatchColor).g, d3.rgb(swatchColor).b];
    let bgArray = [d3.rgb(bg).r, d3.rgb(bg).g, d3.rgb(bg).b];
    return round(Leo.contrast(fgArray, bgArray, undefined, value), 2);
  });

  let RatioFields = document.getElementsByClassName('ratio-Field');
  const updateRatioValues = () => {
    for (let i = 0; i < RatioFields.length; i++) {
      RatioFields[i].min = value === 'wcag3' ? '-107' : '-10';
      RatioFields[i].max = value === 'wcag3' ? '106' : '21';
      RatioFields[i].value = newContrasts[i];
    }
  };
  const update = Promise.resolve(updateRatioValues());

  update.then(function () {
    for (let i = 0; i < RatioFields.length; i++) {
      RatioFields[i].dispatchEvent(new Event('input'));
    }
  });

  setTimeout(() => {
    inputWrapper.classList.remove('is-disabled');
  }, 500);
});

window.addRatio = addRatio;
window.sortRatios = sortRatios;
window.distributeRatios = distributeRatios;
window.dispatchRatioInputEvents = dispatchRatioInputEvents;

module.exports = {
  addRatio,
  createRatioInput,
  addRatioInputs,
  sort,
  sortRatios,
  dispatchRatioInputEvents,
  syncRatioInputs,
  distributeRatios,
  checkRatioStepModifiers,
  deleteRatio
};
