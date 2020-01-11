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
import '@spectrum-css/typography/dist/index-vars.css';
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

let input = document.getElementById('input');
let output = document.getElementById('output');
let type = document.getElementById('type');
let typeName = document.getElementById('typeName');

function convert(c) {
  let typeId = type.value;
  let A, B, C;

  if(typeId == 'HSLuv') {
    A = d3.hsluv(c).l;
    B = d3.hsluv(c).u;
    C = d3.hsluv(c).v;
  }
  if(typeId == 'HSL') {
    A = d3.hsl(c).h;
    B = d3.hsl(c).s;
    C = d3.hsl(c).l;
  }
  if(typeId == 'HSV / HSB') {
    A = d3.hsv(c).h;
    B = d3.hsv(c).s;
    C = d3.hsv(c).v;
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

function returnColor() {
  let val = input.value;
  let typeId = type.value;
  let typeArr;

  if(typeId == 'HSV / HSB') { typeArr = ['H', 'S', 'V']; }
  if(typeId == 'HSL') { typeArr = ['H', 'S', 'L']; }
  if(typeId == 'HSLuv') { typeArr = ['H (l)', 'S (u)', 'L (v)']; }
  if(typeId == 'CAM02') { typeArr = ['J', 'a', 'b']; }
  if(typeId == 'Lab') { typeArr = ['L', 'a', 'b']; }
  if(typeId == 'Lch') { typeArr = ['L', 'c', 'h']; }
  if(typeId == 'RGB') { typeArr = ['R', 'G', 'B']; }

  if(val.length > 6) {
    let newVal = convert(val);
    output.innerHTML = ' ';
    typeName.innerHTML = typeId;
    let d = document.createElement('div');
    let a = document.createElement('div');
    let b = document.createElement('div');
    let c = document.createElement('div');
    let str = document.createTextNode((typeId) + '(' + newVal + ')');
    let arr1 = document.createTextNode(typeArr[0] + ': ' + newVal[0]);
    let arr2 = document.createTextNode(typeArr[1] + ': ' + newVal[1]);
    let arr3 = document.createTextNode(typeArr[2] + ': ' + newVal[2]);
    a.appendChild(arr1);
    b.appendChild(arr2);
    c.appendChild(arr3);
    d.appendChild(str);

    output.appendChild(d);
    output.appendChild(a);
    output.appendChild(b);
    output.appendChild(c);
  }
}

input.addEventListener('input', returnColor);
type.addEventListener('input', returnColor);

export {
  convert,
  returnColor
}
