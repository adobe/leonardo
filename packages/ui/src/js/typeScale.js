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

import {_themeTypography} from './initialTheme';
import {round} from './utils';

// Type scale 
let typeScaleSampleWrapper = document.getElementById('typeScaleSampleWrapper');
let typeScaleBaseInput = document.getElementById('typeScaleBase');
let typeScaleRatioInput = document.getElementById('typeScaleRatio');
let typeScaleDecrementInput = document.getElementById('typeScaleDecrement');
let typeScaleIncrementInput = document.getElementById('typeScaleIncrement');
let typeScaleSampleText = document.getElementById('sampleText');
let fontWeightInput = document.getElementById('fontWeight');

function createTypeScale() {
  typeScaleSampleWrapper.innerHTML = ' ';
  let base = Number(typeScaleBaseInput.value);
  let ratio = Number(typeScaleRatioInput.value);
  let decrement = Number(typeScaleDecrementInput.value);
  let increment = Number(typeScaleIncrementInput.value);
  let weight = fontWeightInput.value;

  let sizes = [];

  for(let i = 0; i < decrement; i ++) {
    let value = base / Math.pow(ratio, i+1);
    sizes.push(value)
  }
  for(let i = 0; i < increment; i ++) {
    let value = base * Math.pow(ratio, i);
    sizes.push(value)
  }

  // Sort them all.
  // sizes = sizes.sort((a,b) => a-b);
  sizes = sizes.sort((a,b) => b-a);

  for(let i = 0; i < sizes.length; i++) {
    let size = Math.round(sizes[i]);
    let sampleText = document.createTextNode(typeScaleSampleText.value);
    let pixelSizeText = document.createTextNode(`${size}px / ${round(size/base, 2)}em`);
    // let emSizeText = document.createTextNode(``);
    let div = document.createElement('div');
    let fontSizePx = document.createElement('span');
    let fontSizeEm = document.createElement('span');
    let span = document.createElement('span');
    div.className = 'typeScale-Item'
    fontSizePx.className = 'typeScaleFontSize'
    // fontSizeEm.className = 'typeScaleFontSize'
    span.style.fontFamily = 'Helvetica, Arial, sans-serif';
    span.style.fontSize = `${size}px`;
    span.style.fontWeight = `${fontWeightInput.value}`
    span.className = 'sampleTextItem';
    span.appendChild(sampleText);
    fontSizePx.appendChild(pixelSizeText)
    // fontSizeEm.appendChild(emSizeText)
    div.appendChild(fontSizePx);
    // div.appendChild(fontSizeEm);
    div.appendChild(span);
    typeScaleSampleWrapper.appendChild(div);
  }

  _themeTypography.sizes = sizes;
  _themeTypography.weights = [Number(weight)];
}
createTypeScale();

typeScaleBaseInput.addEventListener('input', createTypeScale);
typeScaleRatioInput.addEventListener('input', createTypeScale);
typeScaleDecrementInput.addEventListener('input', createTypeScale);
typeScaleIncrementInput.addEventListener('input', createTypeScale);
typeScaleSampleText.addEventListener('input', createTypeScale);
fontWeightInput.addEventListener('input', createTypeScale);

module.exports = {
  createTypeScale
}