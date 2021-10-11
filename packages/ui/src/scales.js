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
import '@spectrum-css/vars/dist/spectrum-darkest.css';

import '@spectrum-css/page/dist/index-vars.css';
import '@spectrum-css/icon/dist/index-vars.css';
import '@spectrum-css/link/dist/index-vars.css';
import '@spectrum-css/alert/dist/index-vars.css';
import '@spectrum-css/radio/dist/index-vars.css';
import '@spectrum-css/sidenav/dist/index-vars.css';
import '@spectrum-css/dialog/dist/index-vars.css';
import '@spectrum-css/button/dist/index-vars.css';
import '@spectrum-css/badge/dist/index-vars.css';
import '@spectrum-css/actionbutton/dist/index-vars.css';
import '@spectrum-css/actiongroup/dist/index-vars.css';
import '@spectrum-css/divider/dist/index-vars.css';
import '@spectrum-css/fieldgroup/dist/index-vars.css';
import '@spectrum-css/textfield/dist/index-vars.css';
import '@spectrum-css/picker/dist/index-vars.css';
import '@spectrum-css/fieldlabel/dist/index-vars.css';
import '@spectrum-css/checkbox/dist/index-vars.css';
import '@spectrum-css/switch/dist/index-vars.css';
import '@spectrum-css/buttongroup/dist/index-vars.css';
import '@spectrum-css/tooltip/dist/index-vars.css';
import '@spectrum-css/slider/dist/index-vars.css';
import '@spectrum-css/tabs/dist/index-vars.css';
import '@spectrum-css/toast/dist/index-vars.css';
import '@spectrum-css/illustratedmessage/dist/index-vars.css';
import '@spectrum-css/typography/dist/index-vars.css';

import './scss/style.scss';
import './scss/charts.scss';
import './scss/colorinputs.scss';
import './views/*.scss';

import '@adobe/focus-ring-polyfill';

import * as Leo from '@adobe/leonardo-contrast-colors';
import loadIcons from 'loadicons';
loadIcons('./spectrum-css-icons.svg');
loadIcons('./spectrum-icons.svg');

// Import local Javascript functions
import { 
  throttle
} from './js/utils';
import {
  openPanelTab,
  openTab,
  openAppTab,
  openScaleTab,
  openSideNavItem
} from './js/tabs';
import {_sequentialScale} from './js/initialColorScales';
import {dataVisColorScale} from './js/dataVisColorScale';

import toggleTooltip from './js/tooltip';

const chroma = require('chroma-js');
const { extendChroma } = require('./js/chroma-plus');

extendChroma(chroma);

window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', event => {
  if (event.matches) {
    //dark mode
    document.querySelector('body').classList.remove('spectrum--light');
    document.querySelector('body').classList.add('spectrum--darkest');
  } else {
    //light mode
    document.querySelector('body').classList.add('spectrum--light');
    document.querySelector('body').classList.remove('spectrum--darkest');
  }
})
const mq = window.matchMedia('(prefers-color-scheme: dark)');
if (mq.matches) {
  //dark mode
  document.querySelector('body').classList.add('spectrum--darkest');
} else {
  //light mode
  document.querySelector('body').classList.add('spectrum--light');
}

document.getElementById("tabSequential").click();
// Open default tab of "charts" for each color scale tab
document.getElementById("tabsequentialColorWheel").click();
document.getElementById("tabdivergingColorWheel").click();
document.getElementById("tabqualitativeColorWheel").click();

document.getElementById("welcome").click();

dataVisColorScale('sequential');