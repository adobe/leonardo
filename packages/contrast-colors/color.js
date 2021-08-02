const {
  createScale,
  convertColorValue,
  uniq,
  colorSpaces,
} = require('./utils');

class Color {
  constructor({ name, colorKeys, colorspace = 'RGB', ratios, smooth = false, output = 'HEX' }) {
    this._name = name;
    this._colorKeys = colorKeys;
    this._colorspace = colorspace;
    this._ratios = ratios;
    this._smooth = smooth;
    this._output = output;
    if (!this._name) {
      throw new Error('Color missing name');
    }
    if (!this._colorKeys) {
      throw new Error('Color Keys are undefined');
    }
    if (!colorSpaces[this._colorspace]) {
      throw new Error(`Colorspace “${colorspace}” not supported`);
    }
    if (!colorSpaces[this._output]) {
      throw new Error(`Output “${colorspace}” not supported`);
    }
    // validate color keys
    for (let i = 0; i < this._colorKeys.length; i++) {
      if (this._colorKeys[i].length < 6) {
        throw new Error('Color Key must be greater than 6 and include hash # if hex.');
      } else if (this._colorKeys[i].length === 6 && this._colorKeys[i].charAt(0) !== 0) {
        throw new Error('Color Key missing hash #');
      }
    }

    // Run function to generate this array of colors:
    this._generateColorScale();
  }

  // Setting and getting properties of the Color class
  set colorKeys(colorKeys) {
    this._colorKeys = colorKeys;
    this._generateColorScale();
  }

  get colorKeys() {
    return this._colorKeys;
  }

  set colorspace(colorspace) {
    this._colorspace = colorspace;
    this._generateColorScale();
  }

  get colorspace() {
    return this._colorspace;
  }

  set ratios(ratios) {
    this._ratios = ratios;
  }

  get ratios() {
    return this._ratios;
  }

  set name(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set smooth(smooth) {
    this._smooth = smooth;
    this._generateColorScale();
  }

  get smooth() {
    return this._smooth;
  }

  set output(output) {
    this._output = output;
    this._generateColorScale();
  }

  get output() {
    return this._output;
  }

  get colorScale() {
    return this._colorScale;
  }

  _generateColorScale() {
    // This would create 3000 color values based on all parameters
    // and return an array of colors:
    const colorScale = createScale({ swatches: 3000, colorKeys: this._colorKeys, colorspace: this._colorspace, shift: 1, smooth: this._smooth });

    colorScale.map((color) => convertColorValue(color, this._output));

    // Remove duplicate color values
    this._colorScale = uniq(colorScale);

    return this._colorScale;
  }
}
module.exports = { Color };
