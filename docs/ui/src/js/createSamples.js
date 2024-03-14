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

import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import {createHtmlElement} from './createHtmlElement';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import {cssColorToRgb} from './utils';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('css', css);

function createSamples(samples, scaleType) {
  const colorClass = scaleType === 'sequential' ? _sequentialScale : _divergingScale;
  const originalSwatches = colorClass.swatches;
  const originalOutput = colorClass.output;
  const outputFormatPicker = document.getElementById(`${scaleType}_format`);
  const output = outputFormatPicker.value;
  const quoteSwitch = document.getElementById(`${scaleType}paramStringQuotes`);
  const quotes = quoteSwitch.checked;
  // reassign new swatch value
  colorClass.swatches = samples;
  const panelOutputContent = document.getElementById(`${scaleType}ColorScaleOutput`);
  panelOutputContent.innerHTML = ' ';

  let samplesWrapper = document.getElementById(`${scaleType}SampleSwatches`);
  samplesWrapper.innerHTML = ' ';

  let sampleColors = colorClass.colors;
  for (let i = 0; i < samples; i++) {
    createHtmlElement({
      element: 'div',
      className: 'sampleSwatch',
      styles: {
        backgroundColor: sampleColors[i]
      },
      appendTo: `${scaleType}SampleSwatches`
    });
  }

  colorClass.output = output;
  sampleColors = colorClass.colors;

  colorClass.samples =
    colorClass.output === 'HEX' || colorClass.output === 'RGB'
      ? sampleColors
      : sampleColors.map((c) => {
          return cssColorToRgb(c);
        });

  let colorvalueString = quotes
    ? sampleColors
        .map((c) => {
          return `"${c}"`;
        })
        .toString()
        .replaceAll(',', ', ')
    : sampleColors.toString().replaceAll(',', ', ');
  panelOutputContent.innerHTML = colorvalueString;

  // Reset color class to original swatches
  colorClass.swatches = originalSwatches;
  colorClass.output = originalOutput;
}

module.exports = {
  createSamples
};
