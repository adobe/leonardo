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

import {_sequentialScale} from './initialColorScales';
import { createHtmlElement } from './createHtmlElement';

function createSamples(samples, scaleType) {
  const colorClass = (scaleType === 'sequential') ? _sequentialScale : _divergingScale;
  const originalSwatches = colorClass.swatches;
  // reassign new swatch value
  colorClass.swatches = samples;
  let samplesWrapper = document.getElementById(`${scaleType}SampleSwatches`);
  samplesWrapper.innerHTML = ' ';

  const sampleColors = colorClass.colors;
  for(let i=0; i < samples; i++) {
    createHtmlElement({
      element: 'div',
      className: 'sampleSwatch',
      styles: {
        backgroundColor: sampleColors[i]
      },
      appendTo: `${scaleType}SampleSwatches`
    })
  }

  const panelOutputContent = document.getElementById(`${scaleType}ColorScaleOutput`);
  panelOutputContent.innerHTML = ' ';
  panelOutputContent.innerHTML = sampleColors.reverse().toString().replaceAll(',', ', ');

  // Reset color class to original swatches
  colorClass.swatches = originalSwatches;
}

module.exports = {
  createSamples
}