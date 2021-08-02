const {
  createScale,
  convertColorValue,
  removeDuplicates,
  cArray,
} = require('./utils');

const { Color } = require('./color');

class BackgroundColor extends Color {
  get backgroundColorScale() {
    return this._backgroundColorScale;
  }

  _generateColorScale() {
    // This would create a 100 color value array based on all parameters,
    // which can be used for sliding lightness as a background color

    // Call original generateColorScale method in the context of our background color
    // Then we can run the code for Color, but we've added in more below.
    Color.prototype._generateColorScale.call(this);

    // create massive scale
    const backgroundColorScale = createScale({ swatches: 1000, colorKeys: this._colorKeys, colorspace: this._colorspace, shift: 1, smooth: this._smooth });

    // Inject original keycolors to ensure they are present in the background options
    backgroundColorScale.push(this.colorKeys);

    const colorObj = backgroundColorScale
      // Convert to HSLuv and keep track of original indices
      .map((c, i) => ({ value: Math.round(cArray(c)[2]), index: i }));

    const bgColorArrayFiltered = removeDuplicates(colorObj, 'value')
      .map((data) => backgroundColorScale[data.index]);

    // Manually cap the background array at 100 colors, then add white back to the end
    // since it sometimes gets removed.
    bgColorArrayFiltered.length = 100;
    bgColorArrayFiltered.push('#ffffff');

    this._backgroundColorScale = bgColorArrayFiltered.map((color) => convertColorValue(color, this._output));

    return this._backgroundColorScale;
  }
}
module.exports = { BackgroundColor };
