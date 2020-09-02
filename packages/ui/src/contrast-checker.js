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
import '@spectrum-css/vars/dist/spectrum-global.css';
import '@spectrum-css/vars/dist/spectrum-medium.css';
import '@spectrum-css/vars/dist/spectrum-light.css';

import '@spectrum-css/page/dist/index-vars.css';
import '@spectrum-css/icon/dist/index-vars.css';
import '@spectrum-css/link/dist/index-vars.css';
import '@spectrum-css/alert/dist/index-vars.css';
import '@spectrum-css/radio/dist/index-vars.css';
import '@spectrum-css/dialog/dist/index-vars.css';
import '@spectrum-css/button/dist/index-vars.css';
import '@spectrum-css/fieldgroup/dist/index-vars.css';
import '@spectrum-css/textfield/dist/index-vars.css';
import '@spectrum-css/dropdown/dist/index-vars.css';
import '@spectrum-css/fieldlabel/dist/index-vars.css';
import '@spectrum-css/checkbox/dist/index-vars.css';
import '@spectrum-css/buttongroup/dist/index-vars.css';
import '@spectrum-css/tooltip/dist/index-vars.css';
import '@spectrum-css/slider/dist/index-vars.css';
import '@spectrum-css/tabs/dist/index-vars.css';
import '@spectrum-css/typography/dist/index-vars.css';

import './scss/style.scss';
import './scss/colorinputs.scss';
import './scss/converter.scss';

import '@adobe/focus-ring-polyfill';

import loadIcons from 'loadicons';
loadIcons('./spectrum-css-icons.svg');
loadIcons('./spectrum-icons.svg');

import * as d3 from 'd3';

// Import d3 plugins and add them to the d3 namespace
import * as d3cam02 from 'd3-cam02';
import * as d3hsluv from 'd3-hsluv';
import * as d3hsv from 'd3-hsv';
import * as d33d from 'd3-3d';
Object.assign(d3, d3cam02, d3hsluv, d3hsv, d33d);

import * as contrastColors from '@adobe/leonardo-contrast-colors';

// expose functions so they can be ran in the console
window.luminance = contrastColors.luminance;
window.contrast = contrastColors.contrast;
window.contrastColors = contrastColors;

let inputForeground = document.getElementById('foregroundInput');
let inputBackground = document.getElementById('backgroundInput');
let output = document.getElementById('output');
// let type = document.getElementById('type');
let colorInputForeground = document.getElementById('foregroundColorInput');
let colorInputBackground = document.getElementById('backgroundColorInput');

function setup() {
  inputForeground.defaultValue = 'rgb(0, 0, 0)';
  inputBackground.defaultValue = 'rgb(255, 255, 255)';
}

function convert(c, typeId = type.value) {
  let A, B, C;

  if(typeId == 'Hex') {
    return d3.rgb(c).formatHex();
  }

  else {
    if(typeId == 'HSLuv') {
      A = d3.hsluv(c).l;
      B = d3.hsluv(c).u;
      C = d3.hsluv(c).v;
    }
    if(typeId == 'HSL') {
      A = d3.hsl(c).h;
      B = d3.hsl(c).s * 100;
      C = d3.hsl(c).l * 100;
    }
    if(typeId == 'HSV') {
      A = d3.hsv(c).h;
      B = d3.hsv(c).s * 100;
      C = d3.hsv(c).v * 100;
    }
    if(typeId == 'CAM02') {
      A = d3.jab(c).J;
      B = d3.jab(c).a;
      C = d3.jab(c).b;
    }
    if(typeId == 'Lab') {
      A = d3.lab(c).l;
      B = d3.lab(c).a;
      C = d3.lab(c).b;
    }
    if(typeId == 'Lch') {
      A = d3.hcl(c).l;
      B = d3.hcl(c).c;
      C = d3.hcl(c).h;
    }
    if(typeId == 'RGB') {
      A = d3.rgb(c).r;
      B = d3.rgb(c).g;
      C = d3.rgb(c).b;
    }

    return new Array(A.toFixed(), B.toFixed(), C.toFixed());
  }
}

function colorInputSync() {
  let valFg = inputForeground.value;
  let colorInputForeground = document.getElementById('foregroundColorInput');
  let valFgRgb = convert(valFg, 'RGB');
  let colorInputFgVal = d3.rgb(valFgRgb[0], valFgRgb[1], valFgRgb[2]).formatHex();
  colorInputForeground.value = colorInputFgVal;

  let valBg = inputBackground.value;
  let colorInputBackground = document.getElementById('backgroundColorInput');
  let valBgRgb = convert(valBg, 'RGB');
  let colorInputBgVal = d3.rgb(valBgRgb[0], valBgRgb[1], valBgRgb[2]).formatHex();
  colorInputBackground.value = colorInputBgVal;
}

function returnContrast() {
  colorInputSync();

  let foreground = inputForeground.value;
  let background = inputBackground.value;
  let output = document.getElementById('ratioOutput');
  output.innerHTML = ' ';

  let rat = document.createElement('span');
  rat.className = 'contrastRatio';

  let fg = [d3.rgb(foreground).r, d3.rgb(foreground).g, d3.rgb(foreground).b];
  let bg = [d3.rgb(background).r, d3.rgb(background).g, d3.rgb(background).b];

  console.log(fg);
  console.log(bg);

  let baseV = (d3.hsluv(background).v) / 100;
  console.log(baseV);

  let ratio = contrastColors.contrast(fg, bg, baseV);
  // get rid of that negative ratio...
  if (ratio < 0) {
    ratio = ratio * -1;
  }
  if (isNaN(ratio)) {
    ratio = '-';
  }

  let ratioText = document.createTextNode(ratio.toFixed(2));
  let ratioToOneText = document.createTextNode(':1');
  let ratioToOne = document.createElement('span');
  ratioToOne.classList.add('ratioToOne');
  ratioToOne.appendChild(ratioToOneText)
  let lgTextWrap = document.createElement('div');
  let smTextWrap = document.createElement('div');
  lgTextWrap.classList.add('passFail');
  smTextWrap.classList.add('passFail');
  let lgTextHead = document.createTextNode('Large text');
  let smTextHead = document.createTextNode('Small text');
  let lgHeading = document.createElement('span');
  lgHeading.classList.add('heading--passFail', 'spectrum-Detail', 'spectrum-Detail--M');
  let smHeading = document.createElement('span');
  smHeading.classList.add('heading--passFail', 'spectrum-Detail', 'spectrum-Detail--M');

  lgHeading.appendChild(lgTextHead);
  smHeading.appendChild(smTextHead);

  let badgeLg = document.createElement('div');
  badgeLg.className = 'badge';
  let badgeSm = document.createElement('div');
  badgeSm.className = 'badge';
  if(ratio < 3) {
    badgeLg.classList.add('badge--error');
    badgeLg.innerHTML = 'Fail (AA)'
    badgeSm.classList.add('badge--error');
    badgeSm.innerHTML = 'Fail (AA)'
  }
  if(ratio > 3 && ratio < 4.5) {
    badgeLg.classList.add('badge--success');
    badgeLg.innerHTML = 'Pass (AA)'
    badgeSm.classList.add('badge--error');
    badgeSm.innerHTML = 'Fail (AA)'
  }
  if(ratio > 4.5) {
    badgeLg.classList.add('badge--success');
    badgeLg.innerHTML = 'Pass (AA)'
    badgeSm.classList.add('badge--success');
    badgeSm.innerHTML = 'Pass (AA)'
  }

  lgTextWrap.appendChild(lgHeading);
  lgTextWrap.appendChild(badgeLg);
  smTextWrap.appendChild(smHeading);
  smTextWrap.appendChild(badgeSm);

  rat.appendChild(ratioText);
  rat.appendChild(ratioToOne);
  output.appendChild(rat);
  output.appendChild(lgTextWrap);
  output.appendChild(smTextWrap);

  buildDemo(foreground, background);
}

function buildDemo(text, background) {
  let demo = document.getElementById('demoWrapper');
  let largeTxt = document.getElementById('largeText');
  let smallTxt = document.getElementById('smallText');

  demo.style.backgroundColor = background;
  largeTxt.style.color = text;  
  smallTxt.style.color = text;  
}

colorInputForeground.addEventListener('input', function() { inputForeground.value = colorInputForeground.value; returnContrast(); });
colorInputBackground.addEventListener('input', function() { inputBackground.value = colorInputBackground.value; returnContrast(); });
inputForeground.addEventListener('input', returnContrast);
inputBackground.addEventListener('input', returnContrast);
// type.addEventListener('input', returnColor);

setup();
returnContrast();

export {
  returnContrast
}
