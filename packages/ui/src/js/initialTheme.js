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

// class ColorScaleData {
//   constructor({ sequential, diverging, categorical }) {
//     this._sequential = sequential
//     this._diverging = diverging
//     this._categorical = categorical;
//   }
//   /** 
//    * SEQUENTIAL
//    */
//   // add individual new colors
//   get sequential() {
//     return this._sequential;
//   }
//   set addSequentialColor(color) {
//     this._sequential.push(color);
//   }
//   // remove individual colors
//   set removeSequentialColor(color) {
//     const filteredColors = this._sequential.filter(entry => {return entry.name !== color.name});
//     this._sequential = filteredColors;
//   }
//   // modify individual colors
//   set updateSequentialColor(param) {
//     // pass arguments in the format _updateColorParameter(color: 'ColorToChange', [propertyToChange]: 'newValue')
//     // eg, changing the name of a color: _updateColorParameter(color: 'blue', name: 'cerulean')
//     let currentColor = this._sequential.filter(entry => {return entry.name === param.color});
//     currentColor = currentColor[0];
//     const filteredColors = this._sequential.filter(entry => {return entry.name !== param.color});
//     if(param.name) currentColor.name = param.name;
//     if(param.colorKeys) currentColor.colorKeys = param.colorKeys;
//     if(param.ratios) currentColor.ratios = param.ratios;
//     if(param.colorspace) currentColor.colorspace = param.colorspace;
//     if(param.smooth) currentColor.smooth = param.smooth;

//     filteredColors.push(currentColor);
//     this._sequential = filteredColors;
//   }
//   /** 
//    * DIVERGING
//    */
//   get diverging() {
//     return this._diverging;
//   }
//   // add individual new colors
//   set addDivergingColor(color) {
//     this._diverging.push(color);
//   }
//   // remove individual colors
//   set removeDivergingColor(color) {
//     const filteredColors = this._diverging.filter(entry => {return entry.name !== color.name});
//     this._diverging = filteredColors;
//   }
//   // modify individual colors
//   set updateDivergingColor(param) {
//     // pass arguments in the format _updateColorParameter(color: 'ColorToChange', [propertyToChange]: 'newValue')
//     // eg, changing the name of a color: _updateColorParameter(color: 'blue', name: 'cerulean')
//     let currentColor = this._diverging.filter(entry => {return entry.name === param.color});
//     currentColor = currentColor[0];
//     const filteredColors = this._diverging.filter(entry => {return entry.name !== param.color});
//     if(param.name) currentColor.name = param.name;
//     if(param.colorKeys) currentColor.colorKeys = param.colorKeys;
//     if(param.ratios) currentColor.ratios = param.ratios;
//     if(param.colorspace) currentColor.colorspace = param.colorspace;
//     if(param.smooth) currentColor.smooth = param.smooth;

//     filteredColors.push(currentColor);
//     this._diverging = filteredColors;
//   }
//   /**
//    * CATEGORICAL
//    */
//   get categorical() {
//     return this._categorical;
//   }
//   // add individual new colors
//   set addCategoricalColor(color) {
//     this._categorical.push(color);
//   }
//   // remove individual colors
//   set removeCategoricalColor(color) {
//     const filteredColors = this._categorical.filter(entry => {return entry.name !== color.name});
//     this._categorical = filteredColors;
//   }
//   // modify individual colors
//   // set updateCategoricalColor(param) {
//   //   // pass arguments in the format _updateColorParameter(color: 'ColorToChange', [propertyToChange]: 'newValue')
//   //   // eg, changing the name of a color: _updateColorParameter(color: 'blue', name: 'cerulean')
//   //   let currentColor = this._categorical.filter(entry => {return entry.name === param.color});
//   //   currentColor = currentColor[0];
//   //   const filteredColors = this._diverging.filter(entry => {return entry.name !== param.color});
//   //   if(param.name) currentColor.name = param.name;
//   //   if(param.colorKeys) currentColor.colorKeys = param.colorKeys;
//   //   if(param.ratios) currentColor.ratios = param.ratios;
//   //   if(param.colorspace) currentColor.colorspace = param.colorspace;
//   //   if(param.smooth) currentColor.smooth = param.smooth;

//   //   filteredColors.push(currentColor);
//   //   this._categorical = filteredColors;
//   // }
// }

// let _colorScales = new ColorScaleData({
//   sequential: [],
//   diverging: [],
//   categorical: []
// })

const tempGray = new Leo.BackgroundColor({
  name: 'Gray',
  colorKeys: ['#cacaca'],
  colorspace: 'RGB',
  ratios: [3, 4.5]
});

let _theme = new Leo.Theme({
  colors: [ tempGray ],
  backgroundColor: tempGray,
  lightness: 100,
  contrast: 1,
  saturation: 100
});

window._theme = _theme;
// window._colorScales = _colorScales;

module.exports = {
  tempGray,
  _theme,
  // _colorScales
}