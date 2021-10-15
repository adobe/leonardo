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

import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import { createHtmlElement } from './createHtmlElement';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';;
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('css', css);

function createSamples(samples, scaleType) {
  const colorClass = (scaleType === 'sequential') ? _sequentialScale : _divergingScale;
  const originalSwatches = colorClass.swatches;
  const originalOutput = colorClass.output;
  const outputFormatPicker = document.getElementById(`${scaleType}_format`);
  const output = outputFormatPicker.value;
  const quoteSwitch = document.getElementById(`${scaleType}paramStringQuotes`);
  const quotes = quoteSwitch.checked;
  // const colorFunction = colorClass.colorFunction;
  // reassign new swatch value
  colorClass.swatches = samples;
  const panelOutputContent = document.getElementById(`${scaleType}ColorScaleOutput`);
  panelOutputContent.innerHTML = ' ';
  const sampleD3Wrapper = document.getElementById(`${scaleType}ColorScaleD3Output`);
  sampleD3Wrapper.innerHTML = ' ';

  let samplesWrapper = document.getElementById(`${scaleType}SampleSwatches`);
  samplesWrapper.innerHTML = ' ';

  let sampleColors = colorClass.colors;
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


  const d3string = `import { scaleThreshold } from 'd3-scale';

function colors(min, max) {
  const fillRange = (start, end) => {
    return Array(end - start).fill().map((item, index) => start + index);
  };
  let domains = fillRange(0, length);
  domains = domains.map((x) => (x === 0) ? 0 : x/(length - 1));
  return scaleThreshold()
    .range([${sampleColors.map((c)=> {return `'${c}'`})}])
    .domain(domains)
}`

//   const LeoString = `import * as Leo from '@adobe/leonardo-contrast-colors'

// ${colorFunction.toString()}
//   `;

  const pre = Promise.resolve(createHtmlElement({
    element: 'pre',
    className: 'spectrum-Code spectrum-Code--sizeS',
    id: `${scaleType}d3code`,
    appendTo: `${scaleType}ColorScaleD3Output`
  }))
  // const preLeo = Promise.resolve(createHtmlElement({
  //   element: 'pre',
  //   className: 'spectrum-Code spectrum-Code--sizeS',
  //   id: `${scaleType}LeoCode`,
  //   appendTo: `${scaleType}ColorScaleFunctionOutput`
  // }))

  pre.then(() => {
    let highlightedCode = hljs.highlight(d3string, {language: 'javascript'}).value
    document.getElementById(`${scaleType}d3code`).innerHTML = highlightedCode;  
  })
  // preLeo.then(() => {
  //   let highlightedCode = hljs.highlight(LeoString, {language: 'javascript'}).value
  //   document.getElementById(`${scaleType}LeoCode`).innerHTML = highlightedCode;  
  // })

  colorClass.output = output;
  sampleColors = colorClass.colors;

  const sampleColorsReversed = sampleColors.reverse();
  let colorvalueString = 
    (quotes) 
    ? sampleColorsReversed
      .map((c) => {
        return `"${c}"`
      })
      .toString() 
      .replaceAll(',', ', ')
    : sampleColorsReversed.toString().replaceAll(',', ', ');;
  panelOutputContent.innerHTML = colorvalueString;

  // Reset color class to original swatches
  colorClass.swatches = originalSwatches;
  colorClass.output = originalOutput;
}

module.exports = {
  createSamples
}