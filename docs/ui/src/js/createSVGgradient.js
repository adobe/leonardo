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

import {saveAs} from 'file-saver';
import {_theme} from './initialTheme';
import {createSvgElement} from './createHtmlElement';

function createSVGgradient(colors) {
  let gradientWidth = 800;
  let gradientHeight = 80;

  var svgns = 'http://www.w3.org/2000/svg';

  let svgWrapper = document.createElementNS(svgns, 'svg');
  svgWrapper.setAttribute('xmlns', svgns);
  svgWrapper.setAttribute('version', '1.1');
  svgWrapper.setAttributeNS(null, 'width', gradientWidth + 'px');
  svgWrapper.setAttributeNS(null, 'height', gradientHeight + 'px');
  svgWrapper.setAttribute('aria-hidden', 'true');
  svgWrapper.id = 'gradientSvg';

  let outerElement = document.createElement('div');
  outerElement.id = '_SVGgradient';

  outerElement.appendChild(svgWrapper);
  document.body.appendChild(outerElement);

  createSvgElement({
    element: 'rect',
    id: 'gradientRect',
    attributes: {
      width: gradientWidth,
      height: gradientHeight,
      fill: 'url(#gradientLinearGrad)',
      rx: 8
    },
    appendTo: 'gradientSvg'
  });

  createSvgElement({
    element: 'defs',
    id: 'gradientDefs',
    appendTo: 'gradientSvg'
  });

  createSvgElement({
    element: 'linearGradient',
    id: 'gradientLinearGrad',
    attributes: {
      x1: 0,
      y1: 0,
      x2: gradientWidth,
      y2: 0,
      gradientUnits: 'userSpaceOnUse'
    },
    appendTo: 'gradientDefs'
  });

  for (let i = 0; i < colors.length; i++) {
    let length = colors.length - 1;

    // only take 10 values from scale
    if (Number.isInteger(i / 4)) {
      createSvgElement({
        element: 'stop',
        attributes: {
          offset: i / length,
          'stop-color': colors[i]
        },
        appendTo: 'gradientLinearGrad'
      });
    }
  }
}

function downloadSVGgradient(colors, mode, gradientName) {
  const createGradient = Promise.resolve(createSVGgradient(colors));

  createGradient.then(() => {
    let svg = document.getElementById('_SVGgradient').innerHTML;
    let filename = `${gradientName}_${mode}_gradient.svg`;
    var blob = new Blob([`${svg}`], {type: 'image/svg+xml;charset=utf-8'});

    saveAs(blob, filename);

    document.getElementById('_SVGgradient').remove();
  });
}

window.downloadSVGgradient = downloadSVGgradient;

module.exports = {
  createSVGgradient,
  downloadSVGgradient
};
