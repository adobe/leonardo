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

import {convertColorValue} from './utils';
const chroma = require('chroma-js');
const {extendChroma} = require('./chroma-plus');
extendChroma(chroma);

class QualitativeScale {
  constructor({sampleColors, keeperColors, output, cvdSupport}) {
    this._sampleColors = sampleColors;
    this._keeperColors = keeperColors;
    this._output = output;
    this._cvdSupport = cvdSupport;
  }

  set sampleColors(colors) {
    this._sampleColors = colors;
  }
  get sampleColors() {
    return this._sampleColors;
  }

  set keeperColors(colors) {
    this._keeperColors = colors;
  }
  get keeperColors() {
    return this._keeperColors;
  }

  set output(output) {
    this._output = output;
    // then run all keeper colors through conversion filter
    let formattedColors = this._keeperColors.map((c) => {
      return convertColorValue(c, output);
    });
    this._keeperColors = formattedColors;
  }
  get output() {
    return this._output;
  }

  set cvdSupport(cvds) {
    this._cvdSupport = cvds;
  }
}

let _qualitativeScale = new QualitativeScale({
  sampleColors: [
    '#ff7d67',
    '#e83326',
    '#ac0000',
    '#680000',
    '#f98517',
    '#c85b00',
    '#903900',
    '#561e01',
    '#c6a000',
    '#997600',
    '#6c4f00',
    '#412c00',
    '#72b622',
    '#4f890e',
    '#355e07',
    '#1e3604',
    '#33b983',
    '#008c5c',
    '#00603d',
    '#0e3724',
    '#5ba8f7',
    '#1077f3',
    '#0050ae',
    '#002f64',
    '#bf8cfc',
    '#9b54f3',
    '#7018d3',
    '#3d137d',
    '#ee74ee',
    '#cc34cd',
    '#970098',
    '#551153',
    '#ff7d67',
    '#e83326',
    '#ac0000',
    '#680000',
    '#f98517',
    '#c85b00',
    '#903900',
    '#561e01',
    '#c6a000',
    '#997600',
    '#6c4f00',
    '#412c00',
    '#72b622',
    '#4f890e',
    '#355e07',
    '#1e3604',
    '#33b983',
    '#008c5c',
    '#00603d',
    '#0e3724',
    '#5ba8f7',
    '#1077f3',
    '#0050ae',
    '#002f64',
    '#bf8cfc',
    '#9b54f3',
    '#7018d3',
    '#3d137d',
    '#ee74ee',
    '#cc34cd',
    '#970098',
    '#551153'
  ],
  keeperColors: [],
  output: 'HEX',
  cvdSupport: ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia']
});

module.exports = {
  _qualitativeScale
};
