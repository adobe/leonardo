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
import '@spectrum-css/colorslider/dist/index-vars.css';
import '@spectrum-css/colorhandle/dist/index-vars.css';
import '@spectrum-css/colorloupe/dist/index-vars.css';
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

function alphaBlend(c1, c2) {
  let r1, g1, b1, a1;
  let r2, g2, b2;
  
  r1 = c1[0];
  g1 = c1[1];
  b1 = c1[2];
  a1 = c1[3];
  
  r2 = c2[0];
  g2 = c2[1];
  b2 = c2[2];
  
  let r3 = r2 + (r1-r2)*a1
  let g3 = g2 + (g1-g2)*a1
  let b3 = b2 + (b1-b2)*a1
  
  let c3 = [r3, g3, b3];

  return c3;
}

function inputConvert(val) {
  let valNums, valArr;
  let a = 1;

  if(val.match(/^rgb\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    // convert to proper format (percentages)
    val = d3.rgb(Number(valArr[0]), Number(valArr[1]), Number(valArr[2])).formatRgb();
  }
  // RGBa
  if(val.match(/^rgba\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    // convert to proper format (percentages)
    val = d3.rgb(Number(valArr[0]), Number(valArr[1]), Number(valArr[2]), Number(valArr[3])).formatRgb();
    a = d3.rgb(val).opacity;
  }
  if(val.match(/^hsl\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    // convert to proper format (percentages)
    val = d3.hsl(Number(valArr[0]), Number(valArr[1]/100), Number(valArr[2]/100)).formatHsl();
  }
  // HSLa
  if(val.match(/^hsla\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    // convert to proper format (percentages)
    val = d3.hsl(Number(valArr[0]), Number(valArr[1]/100), Number(valArr[2]/100), Number(valArr[3])).formatHsl();
    a = d3.rgb(val).opacity;
  }
  if(val.match(/^hsv\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    val = d3.hsv(Number(valArr[0]), Number(valArr[1]/100), Number(valArr[2]/100)).formatHsl();
  }
  // HSVa
  if(val.match(/^hsva\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    val = d3.hsv(Number(valArr[0]), Number(valArr[1]/100), Number(valArr[2]/100), Number(valArr[3])).formatHsl();
    a = d3.rgb(val).opacity;
  }
  if(val.match(/^lab\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    val = d3.lab(Number(valArr[0]), Number(valArr[1]), Number(valArr[2])).formatHsl();
  }
  // LABa
  if(val.match(/^laba\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    val = d3.lab(Number(valArr[0]), Number(valArr[1]), Number(valArr[2]), Number(valArr[3])).formatHsl();
    a = d3.rgb(val).opacity;
  }
  if(val.match(/^lch\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    val = d3.hcl(Number(valArr[2]), Number(valArr[1]), Number(valArr[0])).formatHsl();
  }
  // LCHa
  if(val.match(/^lcha\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    val = d3.hcl(Number(valArr[2]), Number(valArr[1]), Number(valArr[0]), Number(valArr[3])).formatHsl();
    a = d3.rgb(val).opacity;
  }
  if(val.match(/^jab\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    val = d3.jab(Number(valArr[0]), Number(valArr[1]), Number(valArr[2])).formatHsl();
  }
  // JABa
  if(val.match(/^jaba\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    val = d3.jab(Number(valArr[0]), Number(valArr[1]), Number(valArr[2]), Number(valArr[3])).formatHsl();
    a = d3.rgb(val).opacity;
  }
  if(val.match(/^hsluv\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    val = d3.hsluv(Number(valArr[0]), Number(valArr[1]), Number(valArr[2])).formatHsl();
  }
  // HSLuva
  if(val.match(/^hsluva\(/)) {
    valNums = val.match(/\(.*?\)/g).toString().replace("(", "").replace(")", "").trim(); // find numbers only
    valArr = valNums.split(','); // split numbers into array
    val = d3.hsluv(Number(valArr[0]), Number(valArr[1]), Number(valArr[2]), Number(valArr[3])).formatHsl();
    a = d3.rgb(val).opacity;
  }
  let r = d3.rgb(val).r;
  let g = d3.rgb(val).g;
  let b = d3.rgb(val).b;


  return [Number(r.toFixed()), Number(g.toFixed()), Number(b.toFixed()), Number(a.toFixed(2))];
}

function colorInputSync() {
  let valFg = inputForeground.value;
  let colorInputForeground = document.getElementById('foregroundColorInput');
  let valFgRgb = inputConvert(valFg);
  let colorInputFgVal = d3.rgb(valFgRgb[0], valFgRgb[1], valFgRgb[2]).formatHex();
  colorInputForeground.value = colorInputFgVal;

  let valBg = inputBackground.value;
  let colorInputBackground = document.getElementById('backgroundColorInput');
  let valBgRgb = inputConvert(valBg);
  let colorInputBgVal = d3.rgb(valBgRgb[0], valBgRgb[1], valBgRgb[2]).formatHex();
  colorInputBackground.value = colorInputBgVal;
}

function colorSlider() {
  let input = document.getElementById('foregroundInput');
  let inputColor = input.value;
  let grad = document.getElementById('alphaSliderGradient');
  let range = document.getElementById('alphaSliderRange');
  let handle = document.getElementById('alphaSliderHandle');
  let handleWrap = document.getElementById('alphaSliderHandleWrap');
  let sliderWidth = 208;

  let c = inputConvert(inputColor);
  let color = 'rgba('+ c[0] + ', ' + c[1] + ', ' + c[2] + ', ' + c[3] + ')';

  let start = 'rgba(' + d3.rgb(color).r + ', ' + d3.rgb(color).g + ', ' + d3.rgb(color).b + ', ' + '0' + ')'; // transform this to rgba fomat 
  let end = 'rgba(' + d3.rgb(color).r + ', ' + d3.rgb(color).g + ', ' + d3.rgb(color).b + ', ' + '1' + ')'; // transform this to rgba fomat 
  let linearGrad = 'linear-gradient(to right, ' + start + ' 0%, ' + end + ' 100%)';

  handle.style.backgroundColor = color;

  grad.style.backgroundImage = linearGrad;
  range.value = c[3] * 100;
  handleWrap.style.left = sliderWidth * c[3];
}

function sliderRangeInteraction(value) {
  let sliderWidth = 208;
  let handleWrap = document.getElementById('alphaSliderHandleWrap');
  let pos = value / 100;
  let posString = ', ' + `${pos}` + ')';

  let colorInput = document.getElementById('foregroundInput');
  let inputVal = colorInput.value;
  let newVal = inputVal;

  if(inputVal.match(/^#/)) {
    let rgb = d3.rgb(inputVal).formatRgb(); // first put in RGB format 
    newVal = rgb.replace('rgb', 'rgba').replace(')', posString);
  }
  if(inputVal.match(/^rgb\(/)) {
    newVal = inputVal.replace('rgb', 'rgba').replace(')', posString);
  }
  if(inputVal.match(/^hsl\(/)) {
    newVal = inputVal.replace('hsl', 'hsla').replace(')', posString);
  }
  if(inputVal.match(/^hsv\(/)) {
    newVal = inputVal.replace('hsv', 'hsva').replace(')', posString);
  }
  if(inputVal.match(/^lab\(/)) {
    newVal = inputVal.replace('lab', 'laba').replace(')', posString);
  }
  if(inputVal.match(/^lch\(/)) {
    newVal = inputVal.replace('lch', 'lcha').replace(')', posString);
  }
  if(inputVal.match(/^jab\(/)) {
    newVal = inputVal.replace('jab', 'jaba').replace(')', posString);
  }
  if(inputVal.match(/^hsluv\(/)) {
    newVal = inputVal.replace('hsluv', 'hsluva').replace(')', posString);
  }
  if(
    inputVal.match(/^rgba\(/)
    || inputVal.match(/^hsla\(/)
    || inputVal.match(/^hsva\(/)
    || inputVal.match(/^laba\(/)
    || inputVal.match(/^lcha\(/)
    || inputVal.match(/^jaba\(/)
    || inputVal.match(/^hsluva\(/)
    ) {
    let alphaString = pos + ')';
    newVal = inputVal.replace(/[^,]+$/, alphaString);
  }

  colorInput.value = newVal;
  handleWrap.style.left = sliderWidth * pos;

  returnContrast();
}


function returnContrast() {
  colorInputSync();
  colorSlider();

  let foregroundInput = inputForeground.value;
  let backgroundInput = inputBackground.value;
  let output = document.getElementById('ratioOutput');
  output.innerHTML = ' ';

  let rat = document.createElement('span');
  rat.className = 'contrastRatio';

  // let fg = [d3.rgb(foreground).r, d3.rgb(foreground).g, d3.rgb(foreground).b];
  // let bg = [d3.rgb(background).r, d3.rgb(background).g, d3.rgb(background).b];

  let fg = inputConvert(foregroundInput);
  let bg = inputConvert(backgroundInput);

  let foreground;
  if (fg.length > 3 ) {
    foreground = 'rgba('+ fg[0] + ', ' + fg[1] + ', ' + fg[2] + ', ' + fg[3] + ')';
  }
  else {
    foreground = 'rgb('+ fg[0] + ', ' + fg[1] + ', ' + fg[2] + ')';
  }
  let background = 'rgb('+ bg[0] + ', ' + bg[1] + ', ' + bg[2] + ')';

  let baseV = (d3.hsluv(backgroundInput).v) / 100;

  // blend alpha foreground over background in case color is transparent
  let fgBlend = alphaBlend(fg, bg);

  let ratio = contrastColors.contrast(fgBlend, bg, baseV);
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
  ratioToOne.appendChild(ratioToOneText);

  let lgTextWrap = document.createElement('div');
  let smTextWrap = document.createElement('div');
  let uiTextWrap = document.createElement('div');
  lgTextWrap.classList.add('passFail');
  smTextWrap.classList.add('passFail');
  uiTextWrap.classList.add('passFail');
  let lgTextHead = document.createTextNode('Large text');
  let smTextHead = document.createTextNode('Small text');
  let uiTextHead = document.createTextNode('Graphics and UI components');
  let lgHeading = document.createElement('span');
  lgHeading.classList.add('heading--passFail', 'spectrum-Detail', 'spectrum-Detail--M');
  let smHeading = document.createElement('span');
  smHeading.classList.add('heading--passFail', 'spectrum-Detail', 'spectrum-Detail--M');
  let uiHeading = document.createElement('span');
  uiHeading.classList.add('heading--passFail', 'spectrum-Detail', 'spectrum-Detail--M');

  lgHeading.appendChild(lgTextHead);
  smHeading.appendChild(smTextHead);
  uiHeading.appendChild(uiTextHead);

  let badgeLg = document.createElement('div');
  badgeLg.className = 'badge';
  let badgeSm = document.createElement('div');
  badgeSm.className = 'badge';
  let badgeUi = document.createElement('div');
  badgeUi.className = 'badge';

  if(ratio < 3) {
    badgeLg.classList.add('badge--error');
    badgeLg.classList.remove('badge--success');
    badgeLg.innerHTML = 'Fail (AA)';
    badgeSm.classList.add('badge--error');
    badgeSm.classList.remove('badge--success');
    badgeSm.innerHTML = 'Fail (AA)';
    badgeUi.classList.add('badge--error');
    badgeUi.classList.remove('badge--success');
    badgeUi.innerHTML = 'Fail (AA)';
  }
  if(ratio > 3 && ratio < 4.5) {
    badgeLg.classList.add('badge--success');
    badgeLg.classList.remove('badge--error');
    badgeLg.innerHTML = 'Pass (AA)';
    badgeSm.classList.add('badge--error');
    badgeSm.classList.remove('badge--success');
    badgeSm.innerHTML = 'Fail (AA)';
    badgeUi.classList.add('badge--success');
    badgeUi.classList.remove('badge--error');
    badgeUi.innerHTML = 'Pass (AA)';
  }
  if(ratio > 4.5) {
    badgeLg.classList.add('badge--success');
    badgeLg.classList.remove('badge--error');
    badgeLg.innerHTML = 'Pass (AA)';
    badgeSm.classList.add('badge--success');
    badgeSm.classList.remove('badge--error');
    badgeSm.innerHTML = 'Pass (AA)';
    badgeUi.classList.add('badge--success');
    badgeUi.classList.remove('badge--error');
    badgeUi.innerHTML = 'Pass (AA)';
  }

  lgTextWrap.appendChild(lgHeading);
  lgTextWrap.appendChild(badgeLg);
  smTextWrap.appendChild(smHeading);
  smTextWrap.appendChild(badgeSm);
  uiTextWrap.appendChild(uiHeading);
  uiTextWrap.appendChild(badgeUi);

  rat.appendChild(ratioText);
  rat.appendChild(ratioToOne);
  output.appendChild(rat);
  output.appendChild(lgTextWrap);
  output.appendChild(smTextWrap);
  output.appendChild(uiTextWrap);

  buildDemo(foreground, background);
}

function buildDemo(text, background) {
  let demo = document.getElementById('demoWrapper');
  let largeTxt = document.getElementById('largeText');
  let smallTxt = document.getElementById('smallText');
  let button = document.getElementById('demoButton');
  // let icon = document.getElementById('demoIcon');
  let buttonText = document.getElementById('demoButtonText');

  demo.style.backgroundColor = background;
  button.style.backgroundColor = background;
  button.style.borderColor = text;
  // icon.style.color = text;
  buttonText.style.color = text;
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

window.sliderRangeInteraction = sliderRangeInteraction;

export {
  sliderRangeInteraction,
  returnContrast
}
