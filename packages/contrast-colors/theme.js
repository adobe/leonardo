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

const chroma = require('chroma-js');

const {
  colorSpaces,
  convertColorValue,
  multiplyRatios,
  ratioName,
  round,
  searchColors,
} = require('./utils');

const { BackgroundColor } = require('./backgroundcolor');

class Theme {
  constructor({ colors, backgroundColor, lightness, contrast = 1, saturation = 100, output = 'HEX' }) {
    this._output = output;
    this._colors = colors;
    this._lightness = lightness;
    this._saturation = saturation;

    this._setBackgroundColor(backgroundColor);
    this._setBackgroundColorValue();

    this._contrast = contrast;
    if (!this._colors) {
      throw new Error('No colors are defined');
    }
    if (!this._backgroundColor) {
      throw new Error('Background color is undefined');
    }
    colors.forEach((color) => {
      if (!color.ratios) throw new Error(`Color ${color.name}'s ratios are undefined`);
    });
    if (!colorSpaces[this._output]) {
      throw new Error(`Output “${output}” not supported`);
    }

    this._findContrastColors();
    this._findContrastColorPairs();
    this._findContrastColorValues();
  }

  set contrast(contrast) {
    this._contrast = contrast;
    this._findContrastColors();
  }

  get contrast() {
    return this._contrast;
  }

  set lightness(lightness) {
    this._lightness = lightness;
    this._setBackgroundColor(this._backgroundColor);
    this._findContrastColors();
  }

  get lightness() {
    return this._lightness;
  }

  set saturation(saturation) {
    this._saturation = saturation;
    // Update all colors key colors
    this._updateColorSaturation(saturation);
  }

  get saturation() {
    return this._saturation;
  }

  set backgroundColor(backgroundColor) {
    this._setBackgroundColor(backgroundColor);
    this._findContrastColors();
  }

  get backgroundColorValue() {
    return this._backgroundColorValue;
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  // Add a getter and setter for colors
  set colors(colors) {
    this._colors = colors;
    this._findContrastColors();
  }

  get colors() {
    return this._colors;
  }

  // add individual new colors
  set addColor(color) {
    this._colors.push(color);
    this._findContrastColors();
  }
  // remove individual colors
  set removeColor(color) {
    const filteredColors = this._colors.filter(entry => {return entry.name !== color.name});
    this._colors = filteredColors;
    this._findContrastColors();
  }
  // modify individual colors
  set updateColor(param) {
    // pass arguments in the format _updateColorParameter(color: 'ColorToChange', [propertyToChange]: 'newValue')
    // eg, changing the name of a color: _updateColorParameter(color: 'blue', name: 'cerulean')
    let currentColor = this._colors.filter(entry => {return entry.name === param.color});
    currentColor = currentColor[0];
    const filteredColors = this._colors.filter(entry => {return entry.name !== param.color});
    if(param.name) currentColor.name = param.name;
    if(param.colorKeys) currentColor.colorKeys = param.colorKeys;
    if(param.ratios) currentColor.ratios = param.ratios;
    if(param.colorspace) currentColor.colorspace = param.colorspace;
    if(param.smooth) currentColor.smooth = param.smooth;

    filteredColors.push(currentColor);
    this._colors = filteredColors;

    this._findContrastColors();
  }

  set output(output) {
    this._output = output;
    this._colors.forEach((element) => {
      element.output = this._output;
    });
    this._backgroundColor.output = this._output;

    this._findContrastColors();
  }

  get output() {
    return this._output;
  }

  get contrastColors() {
    return this._contrastColors;
  }

  get contrastColorPairs() {
    return this._contrastColorPairs;
  }

  get contrastColorValues() {
    return this._contrastColorValues;
  }

  _setBackgroundColor(backgroundColor) {
    if (typeof backgroundColor === 'string') {
      // If it's a string, convert to Color object and assign lightness.
      const newBackgroundColor = new BackgroundColor({ name: 'background', colorKeys: [backgroundColor], output: 'RGB' });
      const calcLightness = round(chroma(String(backgroundColor)).hsluv()[2]);

      this._backgroundColor = newBackgroundColor;
      this._lightness = calcLightness;
      this._backgroundColorValue = newBackgroundColor[this._lightness];
      // console.log(`String background color of ${backgroundColor} converted to ${newBackgroundColor}`)
    } else {
      // console.log(`NOT a string for background, instead it is ${JSON.stringify(backgroundColor)}`)
      backgroundColor.output = 'RGB';
      const calcBackgroundColorValue = backgroundColor.backgroundColorScale[this._lightness];

      // console.log(`Object background \nLightness: ${this._lightness} \nBackground scale: ${backgroundColor.backgroundColorScale}\nCalculated background value of ${calcBackgroundColorValue}`)
      this._backgroundColor = backgroundColor;
      this._backgroundColorValue = calcBackgroundColorValue;
    }
  }

  _setBackgroundColorValue() {
    this._backgroundColorValue = this._backgroundColor.backgroundColorScale[this._lightness];
  }

  _updateColorSaturation(saturation) {
    let originalColorKeys = [];

    this._colors.map((color) => {
      const colorKeys = color.colorKeys;
      originalColorKeys.push(colorKeys)
      let newColorKeys = [];
      colorKeys.forEach(key => {
        let currentHsluv = chroma(`${key}`).hsluv();
        let currentSaturation = currentHsluv[1];
        let newSaturation = currentSaturation * (saturation / 100);
        let newHsluv = chroma.hsluv(currentHsluv[0], newSaturation, currentHsluv[2]);
        let newColor = chroma.rgb(newHsluv).hex();
        newColorKeys.push(newColor);
      });
      // set each colors color keys with new modified array
      color.colorKeys = newColorKeys;
    })
    // Find contrast colors based on new color keys
    this._findContrastColors();
    // Reset the color keys to original values. This is important
    // to ensure each time saturation is set, the value is a percentage
    // of the original keys, rather than a percentage of the last modified set
    this._colors.map((color, index) => {
      color.colorKeys = originalColorKeys[index];
    });
  }

  _findContrastColors() {
    const bgRgbArray = chroma(String(this._backgroundColorValue)).rgb();
    const baseV = this._lightness / 100;
    const convertedBackgroundColorValue = convertColorValue(this._backgroundColorValue, this._output);
    const baseObj = { background: convertedBackgroundColorValue };

    const returnColors = []; // Array to be populated with JSON objects for each color, including names & contrast values
    const returnColorValues = []; // Array to be populated with flat list of all color values
    const returnColorPairs = {...baseObj}; // Objext to be populated with flat list of all color values as named key-value pairs
    returnColors.push(baseObj);

    this._colors.map((color) => {
      if (color.ratios !== undefined) {
        let swatchNames;
        const newArr = [];
        const colorObj = {
          name: color.name,
          values: newArr,
        };

        let ratioValues;

        if (Array.isArray(color.ratios)) {
          ratioValues = color.ratios;
        } else if (!Array.isArray(color.ratios)) {
          swatchNames = Object.keys(color.ratios);
          ratioValues = Object.values(color.ratios);
        }

        // modify target ratio based on contrast multiplier
        ratioValues = ratioValues.map((ratio) => multiplyRatios(+ratio, this._contrast));

        const contrastColors = searchColors(color, bgRgbArray, baseV, ratioValues).map((clr) => convertColorValue(clr, this._output));
        
        for (let i = 0; i < contrastColors.length; i++) {
          let n;
          if (!swatchNames) {
            const rVal = ratioName(color.ratios)[i];
            n = color.name.concat(rVal);
          } else {
            n = swatchNames[i];
          }

          const obj = {
            name: n,
            contrast: ratioValues[i],
            value: contrastColors[i],
          };
          newArr.push(obj);
          // Push the same values to the returnColorPairs object
          returnColorPairs[n] = contrastColors[i];
          // Push the same value to the returnColorValues array
          returnColorValues.push(contrastColors[i]);
        }
        returnColors.push(colorObj);
      }
      return null;
    });
    this._contrastColorValues = returnColorValues;
    this._contrastColorPairs = returnColorPairs;
    this._contrastColors = returnColors;
    return this._contrastColors;
  }

  _findContrastColorPairs() {
    return this._contrastColorPairs;
  }

  _findContrastColorValues() {
    return this._contrastColorValues;
  }
}

module.exports = { Theme };
