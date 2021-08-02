const d3 = require('./d3');

const {
  multiplyRatios,
  getContrast,
  getMatchingRatioIndex,
  ratioName,
  convertColorValue,
  colorSpaces,
} = require('./utils');

const { BackgroundColor } = require('./backgroundcolor');

class Theme {
  constructor({ colors, backgroundColor, lightness, contrast = 1, output = 'HEX' }) {
    this._output = output;
    this._colors = colors;
    this._lightness = lightness;

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

    this._modifiedColors = this._colors;
    // console.log(`${this._colors} \n ----------------- \n ${this._modifiedColors}`)
    // this._setContrasts(this._contrast);

    this._findContrastColors();
    this._findContrastColorValues();
  }

  set contrast(contrast) {
    this._contrast = contrast;
    // this._setContrasts(contrast);
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

  get contrastColorValues() {
    return this._contrastColorValues;
  }

  _setBackgroundColor(backgroundColor) {
    if (typeof backgroundColor === 'string') {
      // If it's a string, convert to Color object and assign lightness.
      const newBackgroundColor = new BackgroundColor({ name: 'background', colorKeys: [backgroundColor], output: 'RGB' });
      const calcLightness = Number((d3.hsluv(backgroundColor).v).toFixed());

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

  _findContrastColors() {
    const bgRgbArray = [d3.rgb(this._backgroundColorValue).r, d3.rgb(this._backgroundColorValue).g, d3.rgb(this._backgroundColorValue).b];
    const baseV = this._lightness / 100;

    const baseObj = { background: convertColorValue(this._backgroundColorValue, this._output) };

    const returnColors = []; // Array to be populated with JSON objects for each color, including names & contrast values
    const returnColorValues = []; // Array to be populated with flat list of all color values
    returnColors.push(baseObj);

    this._modifiedColors.map((color) => {
      if (color.ratios !== undefined) {
        let swatchNames;
        const newArr = [];
        const colorObj = {
          name: color.name,
          values: newArr,
        };
        // This needs to be looped for each value in the color.colorScale array
        // Keeping the number of contrasts calculated equal to the number of colors
        // available in each color's colorScale array
        let contrasts = d3.range(color.colorScale.length).map((d) => {
          const rgbArray = [d3.rgb(color.colorScale[d]).r, d3.rgb(color.colorScale[d]).g, d3.rgb(color.colorScale[d]).b];
          const ca = getContrast(rgbArray, bgRgbArray, baseV).toFixed(2);
          return Number(ca);
        });

        contrasts = contrasts.filter((el) => el != null);

        const contrastColors = [];
        let ratioLength;
        let ratioValues;

        if (Array.isArray(color.ratios)) {
          ratioLength = color.ratios.length;
          ratioValues = color.ratios;
        } else if (!Array.isArray(color.ratios)) {
          ratioLength = Object.keys(color.ratios).length;
          swatchNames = Object.keys(color.ratios);
          ratioValues = Object.values(color.ratios);
        }

        // modify target ratio based on contrast multiplier
        const newRatioValues = ratioValues.map((ratio) => multiplyRatios(ratio, this._contrast));
        if (this._contrast !== 1) ratioValues = newRatioValues;

        // Return color matching target ratio, or closest number
        for (let i = 0; i < ratioLength; i++) {
          // Find the index of each target ratio in the array of all possible contrasts
          const r = getMatchingRatioIndex(contrasts, ratioValues[i]);
          const match = color.colorScale[r];

          // Use the index from matching contrasts (r) to index the corresponding
          // color value from the color scale array.
          // use convertColorValue function to convert each color to the specified
          // output format and push to the new array 'contrastColors'
          contrastColors.push(convertColorValue(match, this._output));
        }

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
          // Push the same value to the returnColorValues array
          returnColorValues.push(contrastColors[i]);
        }
        returnColors.push(colorObj);
      }
      return null;
    });
    this._contrastColorValues = returnColorValues;
    this._contrastColors = returnColors;
    return this._contrastColors;
  }

  _findContrastColorValues() {
    return this._contrastColorValues;
  }
}

module.exports = { Theme };
