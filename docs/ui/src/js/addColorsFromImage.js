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

import * as Leo from '@adobe/leonardo-contrast-colors';
import {_theme} from './initialTheme';
import {themeUpdateParams} from './themeUpdate';
import {addColorScale} from './colorScale';
import {getContrastRatioInputs, getAllColorNames} from './getThemeData';
import {getClosestColorName, getRandomColorName} from './predefinedColorNames';
import {groupCommonHues, removeElementsByClass} from './utils';
import {prominent, average} from 'color.js';

function addColorsFromImage() {
  const imageColorAmmount = 18; // 25
  const imageColorGrouping = 100; // 30

  const input = document.getElementById('image-upload');
  const ratios = getContrastRatioInputs();
  const preview = document.getElementById('image-preview');
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild);
  }
  const curFiles = input.files;
  if (curFiles.length === 0) {
    const para = document.createElement('p');
  } else {
    for (const file of curFiles) {
      const para = document.createElement('p');
      para.className = 'spectrum-Body image-preview_text';

      if (validFileType(file)) {
        para.textContent = `Color scales extracted from ${file.name}.`;
        const image = document.createElement('img');
        const fileUrl = URL.createObjectURL(file);
        image.src = fileUrl;

        preview.appendChild(image);
        average(fileUrl)
          .then((color) => {
            removeElementsByClass('themeColor_item');

            const existingColorNames = getAllColorNames();
            color = chroma(color[0], color[1], color[2], 'rgb');

            let colorName;
            let closest = getClosestColorName(color);
            let duplicateName = existingColorNames.includes(closest);
            if (closest && !duplicateName) colorName = closest;
            if (!colorName) colorName = 'Gray';

            // Remove gray and replace with new average color as the base
            _theme.removeColor = {name: 'Gray'};

            let newColor = new Leo.BackgroundColor({
              name: colorName,
              colorKeys: [color.hex()],
              colorspace: 'CAM02p',
              ratios: ratios,
              smooth: true
            });
            addColorScale(newColor, true);

            _theme.backgroundColor = newColor;
          })
          .then(() => {
            prominent(fileUrl, {
              amount: imageColorAmmount,
              format: 'hex',
              group: imageColorGrouping
            }).then((colors) => {
              // First we grab a large group of colors from Prominant/color.js
              // then, we need to call our own utility function to group
              // common hues to become key colors of the same color scale.
              let grouped = groupCommonHues(colors);

              grouped.forEach((color) => {
                const existingColorNames = getAllColorNames();

                let colorName;
                for (let i = 0; i < color.length; i++) {
                  let closest = getClosestColorName(color[i]);
                  let duplicateName = existingColorNames.includes(closest);
                  if (closest && !duplicateName) colorName = closest;
                }

                if (!colorName) colorName = getRandomColorName();

                let newColor = new Leo.BackgroundColor({
                  name: colorName,
                  colorKeys: color,
                  colorspace: 'CAM02p',
                  ratios: ratios,
                  smooth: true
                });
                addColorScale(newColor, true);
              });
            });
          })
          .then(() => {
            preview.appendChild(para);
            setTimeout(() => {
              themeUpdateParams();
            }, 100);
          });
      } else {
        para.textContent = `File name ${file.name}: Not a valid file type. Update your selection.`;
        preview.appendChild(para);
      }
    }
  }
}

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const fileTypes = ['image/apng', 'image/bmp', 'image/gif', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/svg+xml', 'image/tiff', 'image/webp', `image/x-icon`];

function validFileType(file) {
  return fileTypes.includes(file.type);
}

window.addColorsFromImage = addColorsFromImage;

module.exports = {
  addColorsFromImage
};
