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

import {APCAcontrast, sRGBtoY} from 'apca-w3';
import {round} from './utils';
import {contrast} from '@adobe/leonardo-contrast-colors';
import {saveAs} from 'file-saver';

const simpleColorConverter = require('simple-color-converter');

const chroma = require('chroma-js');
const {extendChroma} = require('./chroma-plus');
extendChroma(chroma);

function bulkConvert(e) {
  let button = document.getElementById('bulkConvert');
  button.addEventListener('click', bulkItemConvertColorInput);

  let dialog = document.getElementById('bulkConvertDialog');
  dialog.classList.add('is-open');

  document.getElementById('dialogOverlay').style.display = 'block';
}

function cancelBulkConvert() {
  let dialog = document.getElementById('bulkConvertDialog');
  dialog.classList.remove('is-open');
  document.getElementById('dialogOverlay').style.display = 'none';
}

function bulkItemConvertColorInput(e) {
  let background = document.getElementById('bulkConvertBackground').value;
  let bulkInputs = document.getElementById('bulkConvertColors');
  let bulkValues = bulkInputs.value.replace(/\r\n/g, '\n').replace(/[,\/]/g, '\n').replace(' ', '').replace(/['\/]/g, '').replace(/["\/]/g, '').replace(' ', '').split('\n');
  bulkValues = bulkValues.map((value) => {
    return value.replace(' ', '');
  });
  for (let i = 0; i < bulkValues.length; i++) {
    // console.log(bulkValues[i])
    if (!bulkValues[i].startsWith('#')) {
      bulkValues[i] = '#' + bulkValues[i];
    }
  }

  let opts = ['HEX']; // By default, always include hex
  let checkboxes = document.getElementsByClassName('convertBulkColorspace');
  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) opts.push(checkboxes[i].id.replace('checkboxConvert-', ''));
  }

  let colors = [];
  // add key colors for each input
  for (let i = 0; i < bulkValues.length; i++) {
    console.log(bulkValues[i]);
    let colorVal = chroma(bulkValues[i]).hex(); //d3.color(bulkValues[i]).formatHex()
    colors.push(colorVal);
  }

  let data = [];
  colors.map((c) => {
    data.push(createColorJson(c, opts, background));
  });

  const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','), // header row first
    ...data.map((row) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');

  // console.log(csv)

  const csvData = Promise.resolve(csv);

  csvData.then((file) => {
    let filename = `converted_colors.csv`;
    var blob = new Blob([`${file}`], {type: 'text/plain'});

    saveAs(blob, filename);
  });

  cancelBulkConvert();

  bulkInputs.value = ' ';
}

function createColorJson(value, colorSpaces, background) {
  if (!chroma.valid(value)) {
    // Should return an error
  }
  // If it's a valid color input, do this stuff...
  else {
    let color = chroma(value);

    let colorObj = {};

    for (let i = 0; i < colorSpaces.length; i++) {
      let colorChannels, colorChannelLabels;
      if (colorSpaces[i] === 'HEX') colorChannels = color.hex();
      if (colorSpaces[i] === 'RGB') colorChannels = color.rgb();
      if (colorSpaces[i] === 'HSL')
        colorChannels = color.hsl().map((c, i) => {
          if (i > 0) return c * 100;
          else return c;
        }); // all channels except hue are percentages
      if (colorSpaces[i] === 'HSV')
        colorChannels = color.hsv().map((c, i) => {
          if (i > 0) return c * 100;
          else return c;
        }); // all channels except hue are percentages
      if (colorSpaces[i] === 'LAB') colorChannels = color.lab();
      if (colorSpaces[i] === 'LCH') colorChannels = color.lch();
      if (colorSpaces[i] === 'OKLAB') colorChannels = color.oklab();
      if (colorSpaces[i] === 'OKLCH') colorChannels = color.oklch();
      if (colorSpaces[i] === 'HSLuv') colorChannels = color.hsluv();
      if (colorSpaces[i] === 'CAM02') colorChannels = color.jab();
      if (colorSpaces[i] === 'CAM02p') colorChannels = color.jch();
      if (colorSpaces[i] === 'CMYK')
        colorChannels = color.cmyk().map((c) => {
          return c * 100;
        });
      if (colorSpaces[i] === 'XYZ')
        colorChannels = Object.values(
          new simpleColorConverter({
            rgb: {r: color.rgb()[0], g: color.rgb()[1], b: color.rgb()[2]},
            to: 'xyz'
          }).color
        );
      if (colorSpaces[i] === 'Pantone')
        colorChannels = new simpleColorConverter({
          rgb: {r: color.rgb()[0], g: color.rgb()[1], b: color.rgb()[2]},
          to: 'pantone'
        }).color;
      if (colorSpaces[i] === 'wcag2') colorChannels = round(contrast(color.rgb(), chroma(background).rgb(), 'wcag2'), 2);
      if (colorSpaces[i] === 'wcag3') {
        const baseLightness = chroma(background).hsluv()[2];
        const baseV = round(baseLightness / 100, 2);
        let base = chroma(background).rgb();
        colorChannels = round(baseV < 0.5 ? APCAcontrast(sRGBtoY(color.rgb()), sRGBtoY(base)) * -1 : APCAcontrast(sRGBtoY(color.rgb()), sRGBtoY(base)), 2);
      }

      if (colorSpaces[i] === 'HEX') colorChannelLabels = ['Hex'];
      if (colorSpaces[i] === 'RGB') colorChannelLabels = ['rgb (R)', 'rgb (G)', 'rgb (B)'];
      if (colorSpaces[i] === 'HSL') colorChannelLabels = ['hsl (H)', 'hsl (S)', 'hsl (L)'];
      if (colorSpaces[i] === 'HSV') colorChannelLabels = ['hsv (H)', 'hsv (S)', 'hsv (V)'];
      if (colorSpaces[i] === 'LAB') colorChannelLabels = ['LAB (L)', 'LAB (A)', 'LAB (B)'];
      if (colorSpaces[i] === 'LCH') colorChannelLabels = ['LCh (L)', 'LCh (C)', 'LCh (H)'];
      if (colorSpaces[i] === 'OKLAB') colorChannelLabels = ['OKLAB (L)', 'OKLAB (A)', 'OKLAB (B)'];
      if (colorSpaces[i] === 'OKLCH') colorChannelLabels = ['OKLCH (L)', 'OKLCh (C)', 'OKLCh (H)'];
      if (colorSpaces[i] === 'HSLuv') colorChannelLabels = ['HSLuv (L)', 'HSLuv (U)', 'HSLuv (V)'];
      if (colorSpaces[i] === 'CAM02') colorChannelLabels = ['CAM02 (L)', 'CAM02 (A)', 'CAM02 (B)'];
      if (colorSpaces[i] === 'CAM02p') colorChannelLabels = ['CAM02 (L)', 'CAM02 (C)', 'CAM02 (H)'];
      if (colorSpaces[i] === 'CMYK') colorChannelLabels = ['cmyk (C)', 'cmyk (M)', 'cmyk (Y)', 'cmyk (K)'];
      if (colorSpaces[i] === 'XYZ') colorChannelLabels = ['xyz (X)', 'xyz (Y)', 'xyz (Z)'];
      if (colorSpaces[i] === 'Pantone') colorChannelLabels = ['Pantone'];

      if (colorSpaces[i] === 'wcag2') colorChannelLabels = [`Rel Lum vs ${background}`];
      if (colorSpaces[i] === 'wcag3') colorChannelLabels = [`APCA vs ${background}`];

      if (Array.isArray(colorChannels)) {
        colorChannels = colorChannels.map((c) => {
          return round(c, 2);
        });
      } else {
        colorChannels = [colorChannels];
      }

      for (let j = 0; j < colorChannelLabels.length; j++) {
        colorObj[colorChannelLabels[j]] = colorChannels[j];
      }
    }
    return colorObj;
  }
}

window.bulkConvert = bulkConvert;
window.cancelBulkConvert = cancelBulkConvert;
window.bulkItemConvertColorInput = bulkItemConvertColorInput;

module.exports = {
  bulkConvert,
  bulkItemConvertColorInput,
  cancelBulkConvert
};
