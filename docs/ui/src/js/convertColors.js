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

import {round, colorPickerInput} from './utils';
import {createTable} from './createTable';

const simpleColorConverter = require('simple-color-converter');

const chroma = require('chroma-js');
const {extendChroma} = require('./chroma-plus');
extendChroma(chroma);

function convertColor(e) {
  if (e !== undefined) {
    // Identify which input is triggered
    let id = e.target.id;
    let swatchId = id.replace('Input', '_swatch');
    let value = e.target.value;

    // If it's a valid color input, do this stuff...
    if (chroma.valid(value)) {
      let color = chroma(value);

      // Colorize the big swatch
      let swatch = document.getElementById(swatchId);
      swatch.style.backgroundColor = chroma(color).hex();
      let dest = document.getElementById('converterOutput');
      dest.innerHTML = ' ';

      // Create table with all conversions
      let headers = ['Color space', 'Channels', 'String format'];
      let rows = [];
      let colorSpaces = ['HEX', 'RGB', 'HSL', 'HSV', 'LAB', 'LCH', 'OKLAB', 'OKLCH', 'HSLuv', 'CAM02', 'CAM02p', 'CMYK', 'XYZ', 'Pantone'];
      for (let i = 0; i < colorSpaces.length; i++) {
        let colorChannels, colorChannelLabels, colorString;
        if (colorSpaces[i] === 'HEX') colorChannels = '';
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

        if (colorSpaces[i] === 'HEX') colorChannelLabels = '';
        if (colorSpaces[i] === 'RGB') colorChannelLabels = ['R', 'G', 'B'];
        if (colorSpaces[i] === 'HSL') colorChannelLabels = ['H', 'S', 'L'];
        if (colorSpaces[i] === 'HSV') colorChannelLabels = ['H', 'S', 'V'];
        if (colorSpaces[i] === 'LAB') colorChannelLabels = ['L', 'A', 'B'];
        if (colorSpaces[i] === 'LCH') colorChannelLabels = ['L', 'C', 'H'];
        if (colorSpaces[i] === 'OKLAB') colorChannelLabels = ['L', 'A', 'B'];
        if (colorSpaces[i] === 'OKLCH') colorChannelLabels = ['L', 'C', 'H'];
        if (colorSpaces[i] === 'HSLuv') colorChannelLabels = ['H (L)', 'S (U)', 'L (V)'];
        if (colorSpaces[i] === 'CAM02') colorChannelLabels = ['L', 'A', 'B'];
        if (colorSpaces[i] === 'CAM02p') colorChannelLabels = ['L', 'C', 'H'];
        if (colorSpaces[i] === 'CMYK') colorChannelLabels = ['C', 'M', 'Y', 'K'];
        if (colorSpaces[i] === 'XYZ') colorChannelLabels = ['X', 'Y', 'Z'];
        if (colorSpaces[i] === 'Pantone') colorChannelLabels = '';

        if (colorSpaces[i] === 'HEX') colorString = `${color.hex()}`;
        if (colorSpaces[i] === 'RGB') colorString = `rgb(${round(colorChannels[0], 2)}, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)})`;
        if (colorSpaces[i] === 'HSL') colorString = `hsl(${round(colorChannels[0], 2)}, ${round(colorChannels[1], 2)}%, ${round(colorChannels[2], 2)}%)`;
        if (colorSpaces[i] === 'HSV') colorString = `hsv(${round(colorChannels[0], 2)}, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)})`;
        if (colorSpaces[i] === 'LAB') colorString = `lab(${round(colorChannels[0], 2)}%, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)})`;
        if (colorSpaces[i] === 'LCH') colorString = `lch(${round(colorChannels[0], 2)}%, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)})`;
        if (colorSpaces[i] === 'OKLAB') colorString = `oklab(${round(colorChannels[0], 2)}%, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)})`;
        if (colorSpaces[i] === 'OKLCH') colorString = `oklch(${round(colorChannels[0], 2)}%, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)})`;
        if (colorSpaces[i] === 'HSLuv') colorString = `hsluv(${round(colorChannels[0], 2)}, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)})`;
        if (colorSpaces[i] === 'CAM02') colorString = `jab(${round(colorChannels[0], 2)}, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)})`;
        if (colorSpaces[i] === 'CAM02p') colorString = `jch(${round(colorChannels[0], 2)}, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)})`;
        if (colorSpaces[i] === 'CMYK') colorString = `cmyk(${round(colorChannels[0], 2)}, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)}, ${round(colorChannels[3], 2)})`;
        if (colorSpaces[i] === 'XYZ') colorString = `xyz(${round(colorChannels[0], 2)}, ${round(colorChannels[1], 2)}, ${round(colorChannels[2], 2)})`;
        if (colorSpaces[i] === 'Pantone') colorString = `Pantone ${colorChannels}`;

        if (Array.isArray(colorChannels)) {
          colorChannels = colorChannels.map((c) => {
            return round(c, 2);
          });
        } else {
        }

        let channelsOutput;
        if (Array.isArray(colorChannels)) {
          channelsOutput = `<span class="table-cell-item">${colorChannelLabels[0]}:  ${colorChannels[0]},</span>  
<span class="table-cell-item">${colorChannelLabels[1]}:  ${colorChannels[1]},</span>
<span class="table-cell-item">${colorChannelLabels[2]}:  ${colorChannels[2]}</span>`;
        } else {
          channelsOutput = '';
        }

        let rowItem = [
          `${colorSpaces[i]}`, // Name
          `${channelsOutput}`, // Channels
          `${colorString}` // String
        ];

        rows.push(rowItem);
      }

      createTable(headers, rows, 'converterOutput');
    }
  }
}

document.getElementById('convertColorOneInput').addEventListener('input', convertColor);
document.getElementById('convertColorOne_picker').addEventListener('input', colorPickerInput);

window.convertColor = convertColor;
window.colorPickerInput = colorPickerInput;

module.exports = {
  convertColor
};
