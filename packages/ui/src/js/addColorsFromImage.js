import * as Leo from '@adobe/leonardo-contrast-colors';
import {_theme} from './initialTheme';
import { themeUpdateParams } from './themeUpdate';
import { addColorScale } from './colorScale';
import {getContrastRatios} from './getThemeData';
import {
  getClosestColorName,
  getRandomColorName
} from './predefinedColorNames';
import {
  getColorDifference,
  groupCommonHues
} from './utils';
import { prominent } from 'color.js'

function addColorsFromImage() {
  const input = document.getElementById('image-upload');
  const ratios = getContrastRatios();
  const preview = document.getElementById('image-preview');
  while(preview.firstChild) {
    preview.removeChild(preview.firstChild);
  }
  const curFiles = input.files;
  if(curFiles.length === 0) {
    const para = document.createElement('p');
    // para.textContent = 'No files currently selected for upload';
    // preview.appendChild(para);
  } else {
    // const list = document.createElement('ol');
    // preview.appendChild(list);

    for(const file of curFiles) {
      // const listItem = document.createElement('li');
      const para = document.createElement('p');
      para.className = 'spectrum-Body image-preview_text'

      if(validFileType(file)) {
        para.textContent = `Color scales extracted from ${file.name}.`;
        const image = document.createElement('img');
        const fileUrl = URL.createObjectURL(file)
        image.src = fileUrl;

        preview.appendChild(image);
        prominent(fileUrl, { amount: 25, format: 'hex', group: 100 }).then((colors) => {
          console.log(colors)
          // First we grab a large group of colors from Prominant/color.js
          // then, we need to call our own utility function to group
          // common hues to become key colors of the same color scale.
          // TODO...
          let grouped = groupCommonHues(colors);

          grouped.forEach((color) => {
            let colorName
            for(let i = 0; i < color.length; i++) {
              let closest = getClosestColorName(color[i]);
              if(closest) colorName = closest;
            }

            if(colorName === undefined) colorName = 'Color';

            let newColor = new Leo.BackgroundColor({
              name: colorName,
              colorKeys: color,
              colorspace: 'RGB',
              ratios: ratios,
              smooth: false
            })
            addColorScale(newColor, true);
          })
        }).then(() => {
            preview.appendChild(para);
            themeUpdateParams();
          }
        )
      } else {
        para.textContent = `File name ${file.name}: Not a valid file type. Update your selection.`;
        preview.appendChild(para);
      }
    }
  }
}

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const fileTypes = [
  'image/apng',
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/svg+xml',
  'image/tiff',
  'image/webp',
  `image/x-icon`
];

function validFileType(file) {
return fileTypes.includes(file.type);
}

function returnFileSize(number) {
  if(number < 1024) {
    return number + 'bytes';
  } else if(number > 1024 && number < 1048576) {
    return (number/1024).toFixed(1) + 'KB';
  } else if(number > 1048576) {
    return (number/1048576).toFixed(1) + 'MB';
  }
}

window.addColorsFromImage = addColorsFromImage;

module.exports = {
  addColorsFromImage
}