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
import '@spectrum-css/popover/dist/index-vars.css';
import '@spectrum-css/picker/dist/index-vars.css';
import '@spectrum-css/fieldlabel/dist/index-vars.css';
import '@spectrum-css/checkbox/dist/index-vars.css';
import '@spectrum-css/switch/dist/index-vars.css';
import '@spectrum-css/buttongroup/dist/index-vars.css';
import '@spectrum-css/tooltip/dist/index-vars.css';
import '@spectrum-css/slider/dist/index-vars.css';
import '@spectrum-css/tabs/dist/index-vars.css';
import '@spectrum-css/table/dist/index-vars.css';
import '@spectrum-css/toast/dist/index-vars.css';
import '@spectrum-css/illustratedmessage/dist/index-vars.css';
import '@spectrum-css/typography/dist/index-vars.css';
import '@spectrum-css/progresscircle/dist/index-vars.css';

import './scss/colorinputs.scss';
import './scss/charts.scss';
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

import loadIcons from 'loadicons';
loadIcons('./spectrum-css-icons.svg');
loadIcons('./spectrum-icons.svg');

import ClipboardJS from 'clipboard';

// Import local Javascript functions
import {_theme} from './js/initialTheme';
import {paramSetup} from './js/params';
import {throttle, sanitizeQueryString} from './js/utils';
import {getThemeContrastRatios, getContrastRatioInputs} from './js/getThemeData';
import {addColorScale, addColorScaleUpdate} from './js/colorScale';
import {addColorsFromImage} from './js/addColorsFromImage';
import {themeUpdate, themeUpdateParams} from './js/themeUpdate';
import {sliderValue, sliderInput} from './js/sliderInput';
import {updateColorWheel} from './js/colorWheel';
import {addBulk, bulkItemColorInput, cancelBulk} from './js/addBulkDialog';
import {addLightnessBulk, bulkLightnessInput, cancelLightnessBulk} from './js/addLightnessBulkDialog';
import {clearAllColors} from './js/keyColors';
import {showToast, hideToast, exitPreview, neverShowToast} from './js/toast';
import {addFromURL, addFromURLDialog, cancelURL} from './js/addFromURL';
import updateThemeTitle from './js/themeTitle';
import {addRatio, sortRatios} from './js/ratios';
import {openPanelTab, openTab, openDetailTab, openAppTab, openSideNavItem, openColorTab} from './js/tabs';
import toggleTooltip from './js/tooltip';
import {downloadUiKit, createSVGuiKit} from './js/createSVGuiKit';
import {toggleSwatchAttributes} from './js/toggleSwatchAttributes';
import {pageLoader} from './js/pageLoader';
import {format} from 'path';
import {create3dModel} from './js/create3dModel';
import {sortColorScales} from './js/sortColorScales';
import {togglePopover} from './js/popover';
import {forceSimulation} from 'd3';

const {readFileSync} = require('fs');
const posthtml = require('posthtml');
const options = {
  /* see available options below */
};

posthtml()
  .use(require('posthtml-modules')(options))
  .process(readFileSync('src/theme.html', 'utf8'))
  .then((result) => result);

window.updateParams = updateParams;
function updateParams() {
  let name = document.getElementById('themeNameInput').value;
  let ratios = getContrastRatioInputs();
  let theme = {
    baseScale: _theme.backgroundColor.name,
    colorScales: _theme.colors.map((c) => {
      return {
        name: c.name,
        colorKeys: c.colorKeys,
        colorspace: c.colorspace,
        ratios: ratios,
        smooth: c.smooth
      };
    }),
    lightness: _theme.lightness,
    contrast: _theme.contrast,
    saturation: _theme.saturation,
    formula: _theme.formula
  };
  let url = new URL(window.location);
  let params = new URLSearchParams(sanitizeQueryString(url.search.slice(1)));

  params.set('name', name); // Theme name
  params.set('config', JSON.stringify(theme)); // Configurations

  window.history.replaceState({}, '', '?' + params); // update the page's URL.
}

new ClipboardJS('.copyButton');
new ClipboardJS('.themeOutputSwatch');
new ClipboardJS('.copyThemeURL', {
  text: function () {
    updateParams();
    const params = window.location.href;

    let uri = window.location.toString();
    let cleanURL = uri.substring(0, uri.indexOf('?'));

    window.history.replaceState({}, document.title, cleanURL);

    return params;
  }
});

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

// Build the site based on URL parameters
paramSetup();
// Default to CAM02ch for charts modes
document.getElementById('chartsMode').value = 'CAM02p';

document.getElementById('tabPanelColorScales').click();
document.getElementById('tabJSParameters').click();
document.getElementById('tabPalette').click();
document.getElementById('tabContrastingPairs').click();
document.getElementById('welcome').click();
document.getElementById('tabColorWheel').click();

window.onload = function () {
  pageLoader();
};
