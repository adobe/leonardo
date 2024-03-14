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

import {getColorClassByName, getColorClassById, getThemeContrastRatios, getLuminosities} from './getThemeData';
import {addKeyColor, addKeyColorInput, clearAllColors} from './keyColors';
import {addBulk} from './addBulkDialog';
import {throttle} from './utils';
import {toggleControls, themeUpdateParams} from './themeUpdate';
import {updateRamps, themeRamp, themeRampKeyColors} from './ramps';
import {createInterpolationCharts} from './createInterpolationCharts';
import {createRGBchannelChart} from './createRGBchannelChart';
import {baseScaleOptions} from './createBaseScaleOptions';
import {openDetailTab} from './tabs';
import {createDetailOutputColors} from './createOutputColors';
import {_theme, _colorScales} from './initialTheme';
import {downloadSVGgradient} from './createSVGgradient';
import {create3dModel} from './create3dModel';
import {createColorWheel, updateColorDots, updateColorWheel} from './colorWheel';
import {createRatioChart, createLuminosityChart} from './createRatioChart';

function showColorDetails(e, colorId) {
  let panelOpen = true;
  let element = e.target.id;
  const chartsModeSelect = document.getElementById('chartsMode');

  const id = colorId ? colorId : element.replace('-toggleConfig', '');
  let triggeredColorNameInputId = id.concat('_colorName');
  let triggeredColorNameInput = document.getElementById(triggeredColorNameInputId);
  let triggeredColorName = triggeredColorNameInput.value;
  const lineTypeSelect = document.getElementById('chartLineType');
  const lineType = lineTypeSelect.value;

  let colorData = getColorClassByName(triggeredColorName);

  // Clear main container
  let contentArea = document.getElementById('colorDetails');
  contentArea.style.display = 'flex';
  // Clear config panel, just to be safe
  let configPanel = document.getElementById('colorConfigPanel');
  configPanel.innerHTML = ' ';
  configPanel.style.display = 'flex';

  let configPanelTopWrapper = document.createElement('div');
  configPanelTopWrapper.className = 'spectrum-Panel-Item spectrum-Panel-Item--noPadding';

  let configPanelItem = document.createElement('div');
  configPanelItem.className = 'spectrum-Panel-Item spectrum-Form--row';

  // create unique ID for color object
  let thisId = id;
  let wrapper = contentArea;

  // Create back button
  let panelHeader = document.createElement('div');
  panelHeader.className = 'spectrum-Panel-Item';

  let backButton = document.createElement('button');
  backButton.className = 'spectrum-Button spectrum-Button--sizeM spectrum-Button--cta spectrum-ButtonGroup-item';
  backButton.title = 'Save and go back';
  backButton.innerHTML = `Save and go back`;
  backButton.onclick = () => {
    contentArea.innerHTML = ' ';
    contentArea.style.display = 'none';
    configPanel.innerHTML = ' ';
    configPanel.style.display = 'none';
    panelOpen = false;

    themeUpdateParams();
  };

  let headerButtonGroup = document.createElement('div');
  headerButtonGroup.className = 'spectrum-ButtonGroup';

  headerButtonGroup.appendChild(backButton);
  panelHeader.appendChild(headerButtonGroup);

  // Create gradient
  let gradient = document.createElement('div');
  gradient.className = 'themeColor_gradient';
  let gradientId = thisId.concat('_gradient');
  gradient.id = gradientId;

  // Create first panel item
  let panelColorName = document.createElement('div');
  panelColorName.className = 'spectrum-Panel-Item';

  // Create form container
  let inputs = document.createElement('div');
  inputs.className = `spectrum-Form spectrum-Form--row themeColor_configs`;
  inputs.id = `${thisId}-themeColor_configs`;

  let interpInputs = document.createElement('div');
  interpInputs.className = `spectrum-Form spectrum-Form--row`;
  interpInputs.id = `${thisId}-themeColor_keyColors`;

  // Field label
  let colorNameLabel = document.createElement('label');
  colorNameLabel.className = 'spectrum-Fieldlabel spectrum-Fieldlabel--sizeM';
  colorNameLabel.innerHTML = 'Color name';
  // Color Name Input
  let colorName = document.createElement('div');
  colorName.className = 'spectrum-Form-item';
  let colorNameInput = document.createElement('input');
  let colorNameWrapper = document.createElement('div');
  colorNameWrapper.className = 'spectrum-Textfield spectrum-Textfield--sizeM';
  colorNameInput.type = 'text';
  colorNameInput.className = 'spectrum-Textfield-input colorNameInput';
  colorNameInput.id = thisId.concat('_colorName2');
  colorNameInput.name = thisId.concat('_colorName2');
  colorNameInput.value = colorData.name;
  let originalName = colorData.name;
  // colorNameInput.oninput = throttle(themeUpdateParams, 10);
  colorNameInput.onchange = (e) => {
    let paletteNameInput = document.getElementById(thisId.concat('_colorName'));
    const newName = `${e.target.value}`;
    paletteNameInput.value = newName;
    _theme.updateColor = {color: originalName, name: newName};

    baseScaleOptions();

    originalName = newName;
  };

  colorNameWrapper.appendChild(colorNameInput);
  colorName.appendChild(colorNameLabel);
  colorName.appendChild(colorNameWrapper);

  // Create second panel item
  let panelKeyColors = document.createElement('div');
  panelKeyColors.className = 'spectrum-Panel-Item';

  // Key Color Input
  let keyColors = document.createElement('div');
  keyColors.className = 'themeColor_subheading';
  let keyColorsLabel = document.createElement('h4');
  keyColorsLabel.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
  keyColorsLabel.for = thisId.concat('_keyColors');

  let keyColorsInput = document.createElement('div');
  keyColorsInput.className = 'keyColorsWrapper';
  let keyColorsId = thisId.concat('_keyColors');
  keyColorsInput.id = keyColorsId;
  keyColorsLabel.innerHTML = 'Key colors';
  keyColors.appendChild(keyColorsLabel);

  // Key Colors Actions
  let addColors = document.createElement('div');
  addColors.className = 'keyColorActions';
  let addButton = document.createElement('button');
  addButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  let buttonId = thisId.concat('_addKeyColor');
  addButton.id = buttonId;
  addButton.title = 'Add key color';
  addButton.addEventListener('click', addKeyColor);
  addButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-Add" />
  </svg>
  `;
  let bulkButton = document.createElement('button');
  bulkButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  let bulkId = thisId.concat('_addBulk');
  bulkButton.title = 'Add bulk key colors';
  bulkButton.id = bulkId;
  bulkButton.addEventListener('click', addBulk);
  bulkButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-BoxAdd" />
  </svg>
  `;
  let clearKeyColorsButton = document.createElement('button');
  clearKeyColorsButton.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  let clearColorsId = thisId.concat('_clearAllColors');
  clearKeyColorsButton.title = 'Clear all key colors';
  clearKeyColorsButton.id = clearColorsId;
  clearKeyColorsButton.addEventListener('click', clearAllColors);
  clearKeyColorsButton.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Add">
    <use xlink:href="#spectrum-icon-18-CloseCircle" />
  </svg>
  `;

  addColors.appendChild(clearKeyColorsButton);

  addColors.appendChild(addButton);
  addColors.appendChild(bulkButton);
  keyColors.appendChild(addColors);

  // Create third panel item
  let panelInterpolationMode = document.createElement('div');
  panelInterpolationMode.className = 'spectrum-Panel-Item';

  let panelInterpTitle = document.createElement('span');
  panelInterpTitle.className = 'spectrum-Heading spectrum-Heading--sizeXXS spectrum-Panel-Item-Title';
  panelInterpTitle.innerHTML = 'Interpolation';
  // Interpolation mode
  let interp = document.createElement('div');
  interp.className = 'spectrum-Form-item spectrum-Form-item--row';
  let interpLabel = document.createElement('label');
  interpLabel.className = 'spectrum-FieldLabel spectrum-Fieldlabel--sizeM spectrum-FieldLabel--left';
  interpLabel.for = thisId.concat('_mode');
  let interpLabelText = 'Color space';
  let interpSelect = document.createElement('select');
  interpSelect.className = 'spectrum-Picker spectrum-Picker--sizeM pickerMode';
  interpSelect.id = thisId.concat('_mode');
  interpSelect.name = thisId.concat('_mode');
  interpSelect.oninput = throttle(themeUpdateParams, 20);
  interpSelect.addEventListener('change', (e) => {
    _theme.updateColor = {color: colorData.name, colorspace: e.target.value};
    updateRamps(colorData, thisId);
    updateColorDots(chartsModeSelect.value, scaleType, colorData.colorKeys, id);
    create3dModel('tabModelContent', colorData, chartsModeSelect.value);
    createDetailOutputColors(colorData.name);
  });

  let interpDropdownIcon = document.createElement('span');
  interpDropdownIcon.className = 'spectrum-Picker-iconWrapper';
  interpDropdownIcon.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Picker-icon spectrum-UIIcon-ChevronDownMedium spectrum-Picker-icon">
    <use xlink:href="#spectrum-css-icon-ChevronDownMedium"></use>
  </svg>`;

  interpLabel.innerHTML = interpLabelText;
  interpSelect.appendChild(interpDropdownIcon);
  interp.appendChild(interpLabel);
  interp.appendChild(interpSelect);

  // Interpolation options
  interpSelect.options.length = 0;

  let opts = {
    CAM02: 'CAM02',
    CAM02p: 'CAM02 (Ch)',
    LCH: 'Lch',
    LAB: 'Lab',
    HSL: 'HSL',
    HSLuv: 'HSLuv',
    HSV: 'HSV',
    RGB: 'RGB',
    OKLAB: 'OKLAB',
    OKLCH: 'OKLCH'
  };

  for (let index in opts) {
    interpSelect.options[interpSelect.options.length] = new Option(opts[index], index);
  }
  interpSelect.value = colorData.colorspace;

  // Smoothing
  let smoothFormItem = document.createElement('div');
  smoothFormItem.className = 'spectrum-Form-item';
  let smoothWrapper = document.createElement('div');
  smoothWrapper.className = 'spectrum-Switch';
  let smoothInput = document.createElement('input');
  smoothInput.type = 'checkbox';
  smoothInput.className = 'spectrum-Switch-input';
  smoothInput.id = thisId.concat('_smooth');
  smoothInput.checked = colorData.smooth;
  smoothInput.oninput = throttle(themeUpdateParams, 20);
  smoothInput.addEventListener('input', (e) => {
    const checked = e.target.checked;
    const boolean = checked ? true : 'false';
    _theme.updateColor = {color: colorData.name, smooth: boolean};

    const colorData2 = getColorClassById(id);

    const chartModeSelect = document.getElementById('chartsMode');
    const chartsMode = chartModeSelect.value;
    const colors = colorData2.backgroundColorScale;

    updateRamps(colorData2, thisId);
    updateColorDots(chartsModeSelect.value, scaleType, colorData.colorKeys, id);
    create3dModel('tabModelContent', colorData2, chartsModeSelect.value);
    createDetailOutputColors(colorData2.name);
  });
  let smoothSwitch = document.createElement('span');
  smoothSwitch.className = 'spectrum-Switch-switch';
  let smoothLabel = document.createElement('label');
  smoothLabel.className = 'spectrum-Switch-label';
  smoothLabel.htmlFor = thisId.concat('_smooth');
  smoothLabel.innerHTML = 'Smooth';
  smoothWrapper.appendChild(smoothInput);
  smoothWrapper.appendChild(smoothSwitch);
  smoothWrapper.appendChild(smoothLabel);
  smoothFormItem.appendChild(smoothWrapper);

  // Add detail description of interpolation
  let interpDetails = document.createElement('p');
  interpDetails.className = 'spectrum-Body spectrum-Body--sizeXS';
  interpDetails.style.marginBottom = '12px';
  interpDetails.innerHTML = 'Color scales intersect each of your key colors by a straight line in color space. Different color spaces will change the appearance of your scale.';

  let downloadGradient = document.createElement('button');
  downloadGradient.className = 'spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet';
  downloadGradient.title = 'Download SVG gradient';
  downloadGradient.id = thisId.concat('_downloadGradient');
  downloadGradient.innerHTML = `<svg class="spectrum-Icon spectrum-Icon--sizeM" focusable="false" aria-hidden="true" aria-label="Download">
  <use xlink:href="#spectrum-icon-18-Download"></use>
</svg>
<span class="spectrum-ActionButton-label">Download SVG gradient</span>`;
  downloadGradient.addEventListener('click', (e) => {
    downloadSVGgradient(colorData.backgroundColorScale, colorData.colorspace, colorData.name);
  });

  let panelExport = document.createElement('div');
  panelExport.className = 'spectrum-Panel-Item';
  let panelExportTitle = document.createElement('span');
  panelExportTitle.className = 'spectrum-Heading spectrum-Heading--sizeXXS spectrum-Panel-Item-Title';
  panelExportTitle.innerHTML = 'Export color scale';

  panelExport.appendChild(panelExportTitle);
  panelExport.appendChild(downloadGradient);

  // Actions
  let actions = document.createElement('div');
  actions.className = 'spectrum-ButtonGroup';

  let deleteColor = document.createElement('button');
  deleteColor.className = 'spectrum-Button spectrum-Button--sizeM spectrum-Button--negative';
  deleteColor.title = 'Delete color';
  deleteColor.id = thisId.concat('_delete');
  deleteColor.innerHTML = 'Delete color';

  let bottomPanel = document.createElement('div');
  bottomPanel.className = 'spectrum-Panel-Item spectrum-Panel-Item--noPadding';

  // Create color wheel for the scale
  const scaleType = 'colorScale';
  let colorWheelPanel = document.createElement('div');
  colorWheelPanel.className = 'spectrum-Panel-Item';
  let colorWheelWrapper = document.createElement('div');
  colorWheelWrapper.id = scaleType.concat('ColorWheelWrapper');
  colorWheelWrapper.className = 'tab-ColorWheel';

  let colorWheel = document.createElement('div');
  colorWheel.id = scaleType.concat('ColorWheel');
  let colorWheelPaths = document.createElement('div');
  colorWheelPaths.id = scaleType.concat('ColorWheelPaths');
  colorWheelPaths.className = 'polarPathsWrapper';

  colorWheel.appendChild(colorWheelPaths);
  colorWheelWrapper.appendChild(colorWheel);
  // colorWheelPanel.appendChild(colorWheelWrapper);

  let deletePanel = document.createElement('div');
  deletePanel.className = 'spectrum-Panel-Item spectrum-ButtonGroup';
  deletePanel.appendChild(deleteColor);
  colorName.appendChild(actions);

  /**
   *
   *  Now we build the main area of the UI
   *
   */

  // Title
  let title = document.createElement('h2');
  title.className = 'spectrum-Typography spectrum-Heading spectrum-Heading--sizeXS';
  title.innerHTML = 'Color scale';

  // Tabs
  let tabsWrapper = document.createElement('div');
  tabsWrapper.className = 'spectrum-Detail-Tabs';

  let tabs = document.createElement('div');
  tabs.className = 'spectrum-Tabs spectrum-Tabs--horizontal spectrum-Tabs--quiet';
  let tabItem1 = document.createElement('div');
  tabItem1.className = 'spectrum-Tabs-item detail-Tabs-item';
  tabItem1.id = 'tabInterpCharts';
  let tabItem1Label = document.createElement('label');
  tabItem1Label.className = 'spectrum-Tabs-itemLabel';
  tabItem1Label.innerHTML = 'Color charts';

  let tabItem2 = document.createElement('div');
  tabItem2.className = 'spectrum-Tabs-item detail-Tabs-item';
  tabItem2.id = 'tabLightness';
  let tabItem2Label = document.createElement('label');
  tabItem2Label.className = 'spectrum-Tabs-itemLabel';
  tabItem2Label.innerHTML = 'Lightness stops';

  let tabItem3 = document.createElement('div');
  tabItem3.className = 'spectrum-Tabs-item detail-Tabs-item';
  tabItem3.id = 'tabModel';
  let tabItem3Label = document.createElement('label');
  tabItem3Label.className = 'spectrum-Tabs-itemLabel';
  tabItem3Label.innerHTML = '3d model';

  let tabContent1 = document.createElement('div');
  tabContent1.id = 'tabInterpChartsContent';
  tabContent1.className = 'tabDetailContent';

  let tabContent2 = document.createElement('div');
  tabContent2.id = 'tabLightnessContent';
  tabContent2.className = 'tabDetailContent';

  let tabContent3 = document.createElement('div');
  tabContent3.id = 'tabModelContent';
  tabContent3.className = 'tabDetailContent';

  // Create charts grid (wrapper)
  let chartsGrid = document.createElement('div');
  chartsGrid.className = 'paletteContrastChartsGrid';
  // Create select for chart line type
  let chartsForm = document.createElement('div');
  chartsForm.className = 'spectrum-Form spectrum-Form--row';
  chartsForm.style.justifyContent = 'space-between';
  // Create title
  let chartsFormTitle = document.createElement('h5');
  chartsFormTitle.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
  chartsFormTitle.style.width = 'auto';
  chartsFormTitle.innerHTML = 'Output color (ordered by contrast ascending)';
  // Create form item
  let chartsFormItem = document.createElement('div');
  chartsFormItem.className = 'spectrum-Form-item spectrum-Form-item--row';
  // Create lebel
  let chartsFormLabel = document.createElement('label');
  chartsFormLabel.for = 'lightnessChartLineType';
  chartsFormLabel.className = 'spectrum-FieldLabel spectrum-Fieldlabel--sizeM spectrum-FieldLabel--left';
  chartsFormLabel.innerHTML = 'Chart line type';
  // Create select
  let chartsSelect = document.createElement('select');
  chartsSelect.className = 'spectrum-Picker spectrum-Picker--sizeM';
  chartsSelect.name = 'lightnessChartLineType';
  chartsSelect.id = 'lightnessChartLineType';
  let chartsSelectIcon = document.createElement('span');
  chartsSelectIcon.className = 'spectrum-Picker-iconWrapper';
  chartsSelectIcon.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Picker-icon spectrum-UIIcon-ChevronDownMedium spectrum-Picker-icon">
    <use xlink:href="#spectrum-css-icon-ChevronDownMedium"></use>
  </svg>`;
  // Populate options
  chartsSelect.options.length = 0;
  let chartsSelectOpts = {
    step: 'Steps',
    curve: 'Curve'
  };
  for (let index in chartsSelectOpts) {
    chartsSelect.options[chartsSelect.options.length] = new Option(chartsSelectOpts[index], index);
  }
  chartsSelect.value = lineType;
  // Create swatch output wrapper
  let swatchWrapper = document.createElement('div');
  swatchWrapper.id = 'detailJustifiedWrapper';
  let swatches = document.createElement('div');
  swatches.className = 'hideSwatchLuminosity hideSwatchContrast';
  swatches.id = 'detailSwatchesOutputs';
  // Create charts wrapper
  let swatchChartsWrapper = document.createElement('div');
  swatchChartsWrapper.id = 'detailContrastChartsWrapper';
  // Create Contrast chart
  let contrastChartWrapper = document.createElement('div');
  let contrastChartTitle = document.createElement('h5');
  contrastChartTitle.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
  contrastChartTitle.innerHTML = 'Contrast';
  let contrastChart = document.createElement('div');
  contrastChart.className = 'panel-SubTab-Content';
  contrastChart.id = 'detailContrastChart';
  let lightnessChartWrapper = document.createElement('div');
  let lightnessChartTitle = document.createElement('h5');
  lightnessChartTitle.className = 'spectrum-Heading spectrum-Heading--sizeXXS';
  lightnessChartTitle.innerHTML = 'Lightness';
  let lightnessChart = document.createElement('div');
  lightnessChart.className = 'panel-SubTab-Content';
  lightnessChart.id = 'detailLightnessChart';
  // Put the charts tab content together
  chartsSelect.appendChild(chartsSelectIcon);
  chartsFormItem.appendChild(chartsFormLabel);
  chartsFormItem.appendChild(chartsSelect);

  chartsForm.appendChild(chartsFormTitle);
  chartsForm.appendChild(chartsFormItem);

  swatchWrapper.appendChild(swatches);

  contrastChartWrapper.appendChild(contrastChartTitle);
  contrastChartWrapper.appendChild(contrastChart);
  lightnessChartWrapper.appendChild(lightnessChartTitle);
  lightnessChartWrapper.appendChild(lightnessChart);
  swatchChartsWrapper.appendChild(contrastChartWrapper);
  swatchChartsWrapper.appendChild(lightnessChartWrapper);

  chartsGrid.appendChild(chartsForm);
  chartsGrid.appendChild(swatchWrapper);
  chartsGrid.appendChild(swatchChartsWrapper);

  tabContent2.appendChild(chartsGrid);

  // Put the tabs together
  tabItem1.appendChild(tabItem1Label);
  tabItem2.appendChild(tabItem2Label);
  tabItem3.appendChild(tabItem3Label);
  tabs.appendChild(tabItem1);
  tabs.appendChild(tabItem2);
  tabs.appendChild(tabItem3);
  tabsWrapper.appendChild(tabs);

  // Put it all together
  inputs.appendChild(keyColors);
  inputs.appendChild(keyColorsInput);

  interpInputs.appendChild(interp);
  interpInputs.appendChild(smoothFormItem);

  configPanelItem.appendChild(colorName);
  panelKeyColors.appendChild(inputs);
  panelInterpolationMode.appendChild(panelInterpTitle);
  panelInterpolationMode.appendChild(interpDetails);
  panelInterpolationMode.appendChild(interpInputs);

  configPanelTopWrapper.appendChild(panelHeader);
  configPanelTopWrapper.appendChild(configPanelItem);
  configPanelTopWrapper.appendChild(panelKeyColors);
  configPanelTopWrapper.appendChild(panelInterpolationMode);
  configPanelTopWrapper.appendChild(panelExport);
  configPanel.appendChild(configPanelTopWrapper);

  bottomPanel.appendChild(deletePanel);
  configPanel.appendChild(bottomPanel);

  // Content area needs to be appended with items
  wrapper.appendChild(title);
  wrapper.appendChild(gradient);

  // Create divs for charts
  let chartsRow = document.createElement('div');
  chartsRow.className = 'chartsRow';

  let chartsColLeft = document.createElement('div');
  chartsColLeft.className = 'chartsColumn--left';

  let chartsColRight = document.createElement('div');
  chartsColRight.className = 'chartsColumn--right';

  let chart1 = document.createElement('div');
  chart1.id = 'interpolationChart';
  let chart2 = document.createElement('div');
  chart2.id = 'interpolationChart2';
  let chart3 = document.createElement('div');
  chart3.id = 'interpolationChart3';
  let chartRgb = document.createElement('div');
  chartRgb.id = 'RGBchart';

  chartsColLeft.appendChild(colorWheelWrapper); // wheel
  chartsColLeft.appendChild(chartRgb);

  chartsColRight.appendChild(chart1);
  chartsColRight.appendChild(chart2);
  chartsColRight.appendChild(chart3);

  chartsRow.appendChild(chartsColLeft);
  chartsRow.appendChild(chartsColRight);

  tabContent1.appendChild(chartsRow);

  wrapper.appendChild(tabsWrapper);
  wrapper.appendChild(tabContent1);
  wrapper.appendChild(tabContent2);
  wrapper.appendChild(tabContent3);

  // Then run functions on the basic placeholder inputs
  let colorKeys = colorData.colorKeys;
  for (let i = 0; i < colorKeys.length; i++) {
    addKeyColorInput(colorKeys[i], buttonId, colorData.name, i);
  }

  let rampData = colorData.backgroundColorScale;

  let colors = rampData;

  let detailLineType = document.getElementById('lightnessChartLineType');

  chartsModeSelect.addEventListener('change', (e) => {
    if (panelOpen) {
      const thisColorId = id;
      let colorData = getColorClassById(thisColorId);
      let lightness = e.target.value === 'HSV' ? 100 : e.target.value === 'HSLuv' ? 60 : 50;

      let colors = colorData.backgroundColorScale;
      createInterpolationCharts(colors, e.target.value);

      create3dModel('tabModelContent', [colorData], e.target.value);
      updateColorWheel(e.target.value, lightness, true, null, scaleType, colorData.colorKeys, thisColorId);
    }
  });

  themeRamp(colors, gradientId);
  themeRampKeyColors(colorKeys, gradientId);
  createRGBchannelChart(colors);
  createInterpolationCharts(colors, chartsModeSelect.value);

  // Create output swatches for lightness tab
  createDetailOutputColors(colorData.name);
  // Get theme data for contrast and lightness stops and populate visualizations
  let chartRatios = Promise.resolve(getThemeContrastRatios());
  chartRatios.then(function (resolve) {
    createRatioChart(resolve);
  });
  let chartLuminosities = Promise.resolve(getLuminosities());
  chartLuminosities.then(function (resolve) {
    createLuminosityChart(resolve);
  });

  create3dModel('tabModelContent', [colorData], chartsModeSelect.value);

  // Make the color wheel
  createColorWheel(chartsModeSelect.value, 50, scaleType);
  updateColorDots(chartsModeSelect.value, scaleType, colorData.colorKeys, id);

  toggleControls();

  document.getElementById(thisId.concat('_colorName')).addEventListener('input', function (e) {});
  document.getElementById('tabInterpCharts').addEventListener('click', (e) => {
    openDetailTab(e, 'tabInterpChartsContent');
  });
  document.getElementById('tabLightness').addEventListener('click', (e) => {
    openDetailTab(e, 'tabLightnessContent');
  });
  document.getElementById('tabModel').addEventListener('click', (e) => {
    openDetailTab(e, 'tabModelContent', colors);
  });
  document.getElementById('tabInterpCharts').click();

  deleteColor.addEventListener('click', function (e) {
    const thisColorId = id;
    // let colorData = getColorClassById(thisColorId);

    // TODO: Figure out a way to remove the other
    // UI element for the color in the palette view...
    // _theme.removeColor = colorData;
    const deleteButton = document.getElementById(`${thisColorId}_delete`);
    deleteButton.click();

    contentArea.innerHTML = ' ';
    contentArea.style.display = 'none';
    configPanel.innerHTML = ' ';
    configPanel.style.display = 'none';
    panelOpen = false;
  });

  detailLineType.addEventListener('change', (e) => {
    let val = e.target.value;
    lineTypeSelect.value = val;

    lineTypeSelect.dispatchEvent(new Event('change'));
  });
}

module.exports = {showColorDetails};
