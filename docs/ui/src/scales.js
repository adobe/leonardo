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
import '@spectrum-css/progresscircle/dist/index-vars.css';
import '@spectrum-css/table/dist/index-vars.css';
import '@spectrum-css/progressbar/dist/index-vars.css';

import './scss/style.scss';
import './scss/charts.scss';
import './scss/colorinputs.scss';
import './scss/style.scss';
import './scss/components/articleCard.scss';
import './scss/components/colorPicker.scss';
import './scss/components/colorSlider.scss';
import './scss/components/dialog.scss';
import './scss/components/header.scss';
import './scss/components/highlightCode.scss';
import './scss/components/imageUploader.scss';
import './scss/components/outputSwatches.scss';
import './scss/components/panelAccordion.scss';
import './scss/components/popover.scss';
import './scss/components/sections.scss';
import './scss/components/selectBox.scss';
import './scss/components/statusLabel.scss';
import './scss/components/textfield.scss';
import './scss/components/toast.scss';
import './scss/components/tooltip.scss';

import '@adobe/focus-ring-polyfill';
import {pageLoader} from './js/pageLoader';

import * as Leo from '@adobe/leonardo-contrast-colors';
import loadIcons from 'loadicons';
loadIcons('./spectrum-css-icons.svg');
loadIcons('./spectrum-icons.svg');

// Import local Javascript functions
import {_sequentialScale} from './js/initialSequentialScale';
import {_divergingScale} from './js/initialDivergingScale';
import {_qualitativeScale} from './js/initialQualitativeScale';

import {throttle} from './js/utils';
import {openPanelTab, openTab, openAppTab, openScaleTab, openSideNavItem} from './js/tabs';

import {colorScaleDiverging} from './js/colorScaleDiverging';
import {colorScaleSequential} from './js/colorScaleSequential';
import {colorScaleQualitative} from './js/colorScaleQualitative';

import toggleTooltip from './js/tooltip';
import {create3dModel} from './js/create3dModel';
import {createSVGswatches, downloadSwatches} from './js/createSVGswatches';
import {createXML, downloadXML} from './js/createXML';

const chroma = require('chroma-js');
const {extendChroma} = require('./js/chroma-plus');

extendChroma(chroma);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  if (event.matches) {
    //dark mode
    document.querySelector('body').classList.remove('spectrum--light');
    document.querySelector('body').classList.add('spectrum--darkest');
  } else {
    //light mode
    document.querySelector('body').classList.add('spectrum--light');
    document.querySelector('body').classList.remove('spectrum--darkest');
  }
});
const mq = window.matchMedia('(prefers-color-scheme: dark)');
if (mq.matches) {
  //dark mode
  document.querySelector('body').classList.add('spectrum--darkest');
} else {
  //light mode
  document.querySelector('body').classList.add('spectrum--light');
}

document.getElementById('tabSequential').click();
// Open default tab of "charts" for each color scale tab
document.getElementById('tabsequentialDemo').click();
document.getElementById('tabdivergingDemo').click();
document.getElementById('tabqualitativeDemo').click();

document.getElementById('welcome').click();

colorScaleSequential();
colorScaleDiverging();
colorScaleQualitative();

window.onload = function () {
  // let uri = window.location.toString();
  // let cleanURL = uri.substring(0, uri.indexOf("?"));

  // window.history.replaceState({}, document.title, cleanURL);

  // On window load, transition to remove page loader
  pageLoader();
};
