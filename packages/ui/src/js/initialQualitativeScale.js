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

import * as Leo from '@adobe/leonardo-contrast-colors';
import { colorSpaces } from '@adobe/leonardo-contrast-colors/utils';
import * as d3 from './d3';
import {
   convertColorValue,
   makePowScale,
   removeDuplicates,
   round,
   findMatchingLuminosity,
   orderColorsByLuminosity,
   createEquiLuminantKey
 } from './utils';
const chroma = require('chroma-js');
const { extendChroma } = require('./chroma-plus');
extendChroma(chroma);

class QualitativeScale {
  constructor({ 
    sampleColors,
    keeperColors,
    output,
    cvdSupport
   }) {
    this._sampleColors = sampleColors;
    this._keeperColors = keeperColors;
    this._output = output;
    this._cvdSupport = cvdSupport;
  }

  set sampleColors(colors) {
    this._sampleColors = colors
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
    let formattedColors = this._keeperColors.map((c) => {return convertColorValue(c, output)});
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
  sampleColors: ["#ffebe7", "#ffddd6", "#ffcdc3", "#ffb7a9", "#ff9b88", "#ff7c65", "#f75c46", "#ea3829", "#d31510", "#b40000", "#930000", "#740000", "#590000", "#430000", "#ffeccc", "#ffdfad", "#fdd291", "#ffbb63", "#ffa037", "#f68511", "#e46f00", "#cb5d00", "#b14c00", "#953d00", "#7a2f00", "#612300", "#491901", "#351201", "#fbf198", "#f8e750", "#f8d904", "#e8c600", "#d7b300", "#c49f00", "#b08c00", "#9b7800", "#856600", "#705300", "#5b4300", "#483300", "#362500", "#281a00", "#d8fba4", "#c7f385", "#b5e96d", "#9cda4d", "#84c833", "#70b520", "#5fa114", "#508c0e", "#437709", "#376307", "#2c4f05", "#223d04", "#192d03", "#122002", "#cdfcbf", "#aef69d", "#96ee85", "#72e06a", "#4ecf50", "#27bb36", "#07a721", "#009112", "#007c0f", "#00670f", "#00530d", "#00400a", "#003007", "#002205", "#dcf5e5", "#c1efd4", "#a5e7c4", "#7cdbad", "#55ca96", "#35b881", "#17a46f", "#008f5d", "#007a4d", "#00653f", "#005132", "#093f27", "#0d2e1d", "#0b2015", "#ccf7f6", "#abf1f0", "#8be8e7", "#66d9d9", "#43c8ca", "#1cb4b9", "#00a0a7", "#008a94", "#007680", "#00616c", "#044e58", "#0d3c43", "#0f2c31", "#0d1f23", "#caf6fe", "#a4f0fe", "#81e7fc", "#53d8f8", "#17c5f2", "#05b0e0", "#049cca", "#0386b3", "#02729d", "#015e87", "#004a73", "#00395a", "#002b42", "#001f30", "#e0f2ff", "#cae8ff", "#b5deff", "#96cefd", "#78bbfa", "#59a7f6", "#3892f3", "#147af3", "#0265dc", "#0054b6", "#004491", "#003571", "#002754", "#001c3c", "#edeeff", "#e0e2ff", "#d3d5ff", "#c1c4ff", "#acafff", "#9599ff", "#7e84fc", "#686df4", "#5258e4", "#4046ca", "#3236a8", "#262986", "#1b1e64", "#141648", "#f6ebff", "#eeddff", "#e6d0ff", "#dbbbfe", "#cca4fd", "#bd8bfc", "#ae72f9", "#9d57f4", "#893de7", "#7326d3", "#5d13b7", "#470c94", "#33106a", "#230f49", "#ffe9fc", "#ffdafa", "#fec7f8", "#fbaef6", "#f592f3", "#ed74ed", "#e055e2", "#cd3ace", "#b622b7", "#9d039e", "#800081", "#640664", "#470e46", "#320d31", "#ffeaf1", "#ffdce8", "#ffcadd", "#ffb2ce", "#ff95bd", "#fa77aa", "#ef5a98", "#de3d82", "#c82269", "#ad0955", "#8e0045", "#700037", "#54032a", "#3c061d"],
  keeperColors: [],
  output: 'HEX',
  cvdSupport: ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia']
});

module.exports = {
  _qualitativeScale
}