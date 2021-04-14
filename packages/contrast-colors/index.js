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

const d3 = require('./d3.js');

const { catmullRom2bezier, prepareCurve } = require('./curve.js');
// const { color } = require('./d3.js');

class Theme {
  constructor({colors, backgroundColor, lightness, contrast = 1, output = 'HEX'}) {
    this._output = output;
    this._colors = colors;
    this._lightness = lightness;

    this._setBackgroundColor(backgroundColor);
    this._setBackgroundColorValue();
    
    this._contrast = contrast;
    if (!this._colors) {
      throw new Error(`No colors are defined`);
    }
    if (!this._backgroundColor) {
      throw new Error(`Background color is undefined`);
    }
    colors.forEach(color => {
      if(!color.ratios) throw new Error(`Color ${color.name}'s ratios are undefined`);
    });
    if (!colorSpaces[this._output]) {
      throw new Error(`Output “${colorspace}” not supported`);
    }
    
    this._setContrasts(this._contrast);
    this._findContrastColors();
    this._findContrastColorValues();
  }
  
  set contrast(contrast) {
    this._contrast = contrast;
    this._setContrasts(contrast);
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
    this._colors.forEach(element => {
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
    if(typeof backgroundColor === 'string') {
      // If it's a string, convert to Color object and assign lightness.
      const newBackgroundColor = new BackgroundColor({name: 'background', colorKeys: [backgroundColor], output: 'RGB'});
      const calcLightness = Number((d3.hsluv(backgroundColor).v).toFixed());

      return this._backgroundColor = newBackgroundColor, this._lightness = calcLightness, this._backgroundColorValue = newBackgroundColor[this._lightness];
      // console.log(`String background color of ${backgroundColor} converted to ${newBackgroundColor}`)
    } else {
      // console.log(`NOT a string for background, instead it is ${JSON.stringify(backgroundColor)}`)
      backgroundColor.output = 'RGB';
      const calcBackgroundColorValue = backgroundColor.backgroundColorScale[this._lightness];

      // console.log(`Object background \nLightness: ${this._lightness} \nBackground scale: ${backgroundColor.backgroundColorScale}\nCalculated background value of ${calcBackgroundColorValue}`)
      return this._backgroundColor = backgroundColor, this._backgroundColorValue = calcBackgroundColorValue;
    }
  }

  _setBackgroundColorValue() {
    return this._backgroundColorValue = this._backgroundColor.backgroundColorScale[this._lightness];
  }

  _setContrasts(contrastMultiplier) {
    // Only multiply contrast ratios if they are greater than 1:1,
    // otherwise it's just useless math.
    if(contrastMultiplier != 1) {
      // Iterate over each color, remap contrast values after
      // multiplying them by the theme multiplier (this._contrast)
      this._colors.map(color => {
        let ratios = color.ratios;
        let newRatios;
        // assign ratios array whether input is array or object
        if(Array.isArray(ratios)) {
          newRatios = ratios.map(function(d) {
            return multiplyRatios(d, contrastMultiplier)
          });

          return color.ratios = newRatios;

        } else {
          for (let key of Object.keys(ratios)) {
            ratios[key] = multiplyRatios(ratios[key], contrastMultiplier);
          }
        }
      });
    };
  };

  _findContrastColors() {
    const bgRgbArray = [d3.rgb(this._backgroundColorValue).r, d3.rgb(this._backgroundColorValue).g, d3.rgb(this._backgroundColorValue).b];
    const baseV = this._lightness / 100;

    let baseObj = {
      background: convertColorValue(this._backgroundColorValue, this._output),
    };

    let returnColors = []; // Array to be populated with JSON objects for each color, including names & contrast values
    let returnColorValues = []; // Array to be populated with flat list of all color values
    returnColors.push(baseObj);

    this._colors.map(color => {

      if (color.ratios !== undefined) {
        let swatchNames;
        let newArr = [];
        let colorObj = {
          name: color.name,
          values: newArr
        };
        
        // This needs to be looped for each value in the color.colorScale array
        // Keeping the number of contrasts calculated equal to the number of colors
        // available in each color's colorScale array   
        let contrasts = d3.range(color.colorScale.length).map((d) => {
          let rgbArray = [d3.rgb(color.colorScale[d]).r, d3.rgb(color.colorScale[d]).g, d3.rgb(color.colorScale[d]).b];
          let ca = contrast(rgbArray, bgRgbArray, baseV).toFixed(2);
      
          return Number(ca);
        });
      
        contrasts = contrasts.filter(el => el != null);

        let contrastColors = [];
        let ratioLength;
        let ratioValues;

        if(Array.isArray(color.ratios)) {
          ratioLength = color.ratios.length;
          ratioValues = color.ratios;
        } else if (!Array.isArray(color.ratios)){
          ratioLength = Object.keys(color.ratios).length;
          swatchNames = Object.keys(color.ratios);
          ratioValues = Object.values(color.ratios);
        }


        // Return color matching target ratio, or closest number
        for (let i=0; i < ratioLength; i++){
          // Find the index of each target ratio in the array of all possible contrasts
          let r = getMatchingRatioIndex(contrasts, ratioValues[i]);
          let match = color.colorScale[r];

          // Use the index from matching contrasts (r) to index the corresponding
          // color value from the color scale array.
          // use convertColorValue function to convert each color to the specified 
          // output format and push to the new array 'contrastColors'
          contrastColors.push(convertColorValue(match, this._output));
        }

        for (let i=0; i < contrastColors.length; i++) {
          let n;
          if(!swatchNames) {
            let rVal = ratioName(color.ratios)[i];
            n = color.name.concat(rVal);
          }
          else {
            n = swatchNames[i];
          }
  
          let obj = {
            name: n,
            contrast: ratioValues[i],
            value: contrastColors[i]
          };
          newArr.push(obj);
          // Push the same value to the returnColorValues array
          returnColorValues.push(contrastColors[i]);

        }
        returnColors.push(colorObj);
      }
    });
    this._contrastColorValues = returnColorValues;
    this._contrastColors = returnColors;
    return this._contrastColors;
  }

  _findContrastColorValues() {
    return this._contrastColorValues;
  }
}

class Color {
  constructor({name, colorKeys, colorspace = 'RGB', ratios, smooth = false, output = 'HEX'}) { 
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
      throw new Error(`Color Keys are undefined`);
    }
    if (!colorSpaces[this._colorspace]) {
      throw new Error(`Colorspace “${colorspace}” not supported`);
    }
    if (!colorSpaces[this._output]) {
      throw new Error(`Output “${colorspace}” not supported`);
    }
    // validate color keys
    for (let i=0; i<this._colorKeys.length; i++) {
      if (this._colorKeys[i].length < 6) {
        throw new Error('Color Key must be greater than 6 and include hash # if hex.');
      }
      else if (this._colorKeys[i].length == 6 && this._colorKeys[i].charAt(0) != 0) {
        throw new Error('Color Key missing hash #');
      }
    }

    // Run function to generate this array of colors:
    this._generateColorScale();
  }
  
  // Setting and getting properties of the Color class
  set colorKeys(colorKeys) {
    this._colorKeys = colorKeys;
    this._generateColorScale()
  }
  get colorKeys() {
    return this._colorKeys;
  }
  
  set colorspace(colorspace) {
    this._colorspace = colorspace;
    this._generateColorScale()
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
  get name () {
    return this._name;
  }
  
  set smooth(smooth) {
    this._smooth = smooth;
    this._generateColorScale()
  }
  get smooth() {
    return this._smooth;
  }

  set output(output) {
    this._output = output;
    this._generateColorScale()
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
    const colorScale = createScale({swatches: 3000, colorKeys: this._colorKeys, colorspace: this._colorspace, shift: 1, smooth: this._smooth});

    colorScale.map(color => {
      return convertColorValue(color, this._output);
    });

    // Remove duplicate color values
    this._colorScale =  uniq(colorScale);

    return this._colorScale;
  }
}

class BackgroundColor extends Color {
  constructor(options) { 
    super(options)
  }
  
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
    let backgroundColorScale = createScale({swatches: 1000, colorKeys: this._colorKeys, colorspace: this._colorspace, shift: 1, smooth: this._smooth});

    // Inject original keycolors to ensure they are present in the background options
    backgroundColorScale.push(this.colorKeys);

    let colorObj = backgroundColorScale
      // Convert to HSLuv and keep track of original indices
      .map((c, i) => { return { value: Math.round(cArray(c)[2]), index: i } });

    let bgColorArrayFiltered = removeDuplicates(colorObj, "value")
      .map(data => backgroundColorScale[data.index]);

    // Manually cap the background array at 100 colors, then add white back to the end
    // since it sometimes gets removed.
    bgColorArrayFiltered.length = 100;
    bgColorArrayFiltered.push('#ffffff');

    this._backgroundColorScale = bgColorArrayFiltered.map(color => {
      return convertColorValue(color, this._output);
    });

    return this._backgroundColorScale;
  }
}


/** 
 * Utility functions
 */

function multiplyRatios(ratio, multiplier) {
  let r;
  // Normalize contrast ratios before multiplying by this._contrast
  // by making 1 = 0. This ensures consistent application of increase/decrease
  // in contrast ratios. Then add 1 back to number for contextual ratio value.
  if(ratio > 1) {
    r = ((ratio-1) * multiplier) + 1;
  }
  else if(ratio < -1) {
    r = ((ratio+1) * multiplier) - 1;
  }
  else {
    r = 1;
  }

  return Number(r.toFixed(2));
}

function createScale({
  swatches,
  colorKeys,
  colorspace = 'LAB',
  shift = 1,
  fullScale = true,
  smooth = false
} = {}) {
  const space = colorSpaces[colorspace];
  if (!space) {
    throw new Error(`Colorspace “${colorspace}” not supported`);
  }
  if (!colorKeys) {
    throw new Error(`Colorkeys missing: returned “${colorKeys}”`);
  }
  
  let domains = colorKeys
    .map(key => swatches - swatches * (d3.hsluv(key).v / 100))
    .sort((a, b) => a - b)
    .concat(swatches);

  domains.unshift(0);

  // Test logarithmic domain (for non-contrast-based scales)
  let sqrtDomains = d3.scalePow()
    .exponent(shift)
    .domain([1, swatches])
    .range([1, swatches]);

  sqrtDomains = domains.map((d) => {
    if (sqrtDomains(d) < 0) {
      return 0;
    }
    return sqrtDomains(d);
  });

  // Transform square root in order to smooth gradient
  domains = sqrtDomains;

  let sortedColor = colorKeys
    // Convert to HSLuv and keep track of original indices
    .map((c, i) => { return { colorKeys: cArray(c), index: i } })
    // Sort by lightness
    .sort((c1, c2) => c2.colorKeys[2] - c1.colorKeys[2])
    // Retrieve original RGB color
    .map(data => colorKeys[data.index]);

  let inverseSortedColor = colorKeys
    // Convert to HSLuv and keep track of original indices
    .map((c, i) => { return {colorKeys: cArray(c), index: i} })
    // Sort by lightness
    .sort((c1, c2) => c1.colorKeys[2] - c2.colorKeys[2])
    // Retrieve original RGB color
    .map(data => colorKeys[data.index]);

  let ColorsArray = [];

  let scale;
  if (fullScale) {
    ColorsArray = [space.white || '#ffffff', ...sortedColor, space.black || '#000000'];
  } else {
    ColorsArray = sortedColor;
  }
  const stringColors = ColorsArray;
  ColorsArray = ColorsArray.map(d => d3[space.name](d));
  if (space.name == 'hcl') {
    // special case for HCL if C is NaN we should treat it as 0
    ColorsArray.forEach(c => c.c = isNaN(c.c) ? 0 : c.c);
  }
  if (space.name == 'jch') {
    // JCh has some “random” hue for grey colors.
    // Replacing it to NaN, so we can apply the same method of dealing with them.
    for (let i = 0; i < stringColors.length; i++) {
      const color = d3.hcl(stringColors[i]);
      if (!color.c) {
        ColorsArray[i].h = NaN;
      }
    }
  }

  if (smooth) {
    scale = smoothScale(ColorsArray, domains, space);
  } else {
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(space.interpolator);
  }

  let Colors = d3.range(swatches).map(d => scale(d));

  let colors = Colors.filter(el => el != null);

  return colors;
}


function smoothScale(ColorsArray, domains, space) {
  const points = space.channels.map(() => []);
  ColorsArray.forEach((color, i) =>
    points.forEach((point, j) =>
      point.push(domains[i], color[space.channels[j]])
    )
  );
  if (space.name == "hcl") {
    const point = points[1];
    for (let i = 1; i < point.length; i += 2) {
      if (isNaN(point[i])) {
        point[i] = 0;
      }
    }
  }
  points.forEach(point => {
    const nans = [];
    // leading NaNs
    for (let i = 1; i < point.length; i += 2) {
      if (isNaN(point[i])) {
        nans.push(i);
      } else {
        nans.forEach(j => point[j] = point[i]);
        nans.length = 0;
        break;
      }
    }
    // all are grey case
    if (nans.length) {
      // hue is not important except for JCh
      const safeJChHue = d3.jch("#ccc").h;
      nans.forEach(j => point[j] = safeJChHue);
    }
    nans.length = 0;
    // trailing NaNs
    for (let i = point.length - 1; i > 0; i -= 2) {
      if (isNaN(point[i])) {
        nans.push(i);
      } else {
        nans.forEach(j => point[j] = point[i]);
        break;
      }
    }
    // other NaNs
    for (let i = 1; i < point.length; i += 2) {
      if (isNaN(point[i])) {
        point.splice(i - 1, 2);
        i -= 2;
      }
    }
    // force hue to go on the shortest route
    if (space.name in {hcl: 1, hsl: 1, hsluv: 1, hsv: 1, jch: 1}) {
      let prev = point[1];
      let addon = 0;
      for (let i = 3; i < point.length; i += 2) {
        const p = point[i] + addon;
        const zero = Math.abs(prev - p);
        const plus = Math.abs(prev - (p + 360));
        const minus = Math.abs(prev - (p - 360));
        if (plus < zero && plus < minus) {
          addon += 360;
        }
        if (minus < zero && minus < plus) {
          addon -= 360;
        }
        point[i] += addon;
        prev = point[i];
      }
    }
  })
  const prep = points.map(point =>
    catmullRom2bezier(point).map(curve =>
      prepareCurve(...curve)
    )
  );
  return d => {
    const ch = prep.map(p => {
      for (let i = 0; i < p.length; i++) {
        const res = p[i](d);
        if (res != null) {
          return res;
        }
      }
    });

    if (space.name == 'jch' && ch[1] < 0) {
      ch[1] = 0;
    }

    return d3[space.name](...ch) + "";
  };
}

const colorSpaces = {
  CAM02: {
    name: 'jab',
    channels: ['J', 'a', 'b'],
    interpolator: d3.interpolateJab,
    function: d3.jab
  },
  CAM02p: {
    name: 'jch',
    channels: ['J', 'C', 'h'],
    interpolator: d3.interpolateJch,
    function: d3.jch
  },
  LCH: {
    name: 'lch', // named per correct color definition order
    channels: ['h', 'c', 'l'],
    interpolator: d3.interpolateHcl,
    white: d3.hcl(NaN, 0, 100),
    black: d3.hcl(NaN, 0, 0),
    function: d3.hcl
  },
  LAB: {
    name: 'lab',
    channels: ['l', 'a', 'b'],
    interpolator: d3.interpolateLab,
    function: d3.lab
  },
  HSL: {
    name: 'hsl',
    channels: ['h', 's', 'l'],
    interpolator: d3.interpolateHsl,
    function: d3.hsl
  },
  HSLuv: {
    name: 'hsluv',
    channels: ['l', 'u', 'v'],
    interpolator: d3.interpolateHsluv,
    white: d3.hsluv(NaN, NaN, 100),
    black: d3.hsluv(NaN, NaN, 0),
    function: d3.hsluv
  },
  RGB: {
    name: 'rgb',
    channels: ['r', 'g', 'b'],
    interpolator: d3.interpolateRgb,
    function: d3.rgb
  },
  HSV: {
    name: 'hsv',
    channels: ['h', 's', 'v'],
    interpolator: d3.interpolateHsv,
    function: d3.hsv
  },
  HEX: {
    name: 'hex',
    channels: ['r', 'g', 'b'],
    interpolator: d3.interpolateRgb,
    function: d3.rgb
  }
};

function cArray(c) {
  const color = d3.hsluv(c);
  const L = color.l;
  const U = color.u;
  const V = color.v;

  return [L, U, V];
}

function removeDuplicates(originalArray, prop) {
  var newArray = [];
  var lookupObject  = {};

  for(var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for(i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
}

function uniq(a) {
  return Array.from(new Set(a));
}

// Helper function to change any NaN to a zero
function filterNaN(x) {
  if(isNaN(x)) {
    return 0;
  } else {
    return x;
  }
}

// Helper function for rounding color values to whole numbers
function convertColorValue(color, format, object = false) {
  if(!color) {
    throw new Error(`Cannot convert color value of ${color}`)
  }
  if(!format) {
    throw new Error(`Cannot convert to colorspace ${format}`)
  }

  let colorObj = colorSpaces[format].function(color);
  let propArray = colorSpaces[format].channels;

  let newColorObj = {
    [propArray[0]]: filterNaN(colorObj[propArray[0]]),
    [propArray[1]]: filterNaN(colorObj[propArray[1]]),
    [propArray[2]]: filterNaN(colorObj[propArray[2]])
  }

  // HSLuv
  if (format === "HSLuv") {
    for (let i = 0; i < propArray.length; i++) {

      let roundedPct = Math.round(newColorObj[propArray[i]]);
      newColorObj[propArray[i]] = roundedPct;
    }
  }
  // LAB, LCH, JAB, JCH
  else if (format === "LAB" || format === "LCH" || format === "CAM02" || format === "CAM02p") {
    for (let i = 0; i < propArray.length; i++) {
      let roundedPct = Math.round(newColorObj[propArray[i]]);

      if (propArray[i] === "h" && !object) {
        roundedPct = roundedPct + "deg";
      }
      if (propArray[i] === "l" && !object || propArray[i] === "J" && !object) {
        roundedPct = roundedPct + "%";
      }

      newColorObj[propArray[i]] = roundedPct;
      
    }
  }
  else {
    for (let i = 0; i < propArray.length; i++) {
      if (propArray[i] === "s" || propArray[i] === "l" || propArray[i] === "v") {
        // leave as decimal format
        let roundedPct = parseFloat(newColorObj[propArray[i]].toFixed(2));
        if(object) {
          newColorObj[propArray[i]] = roundedPct;
        }
        else {
          newColorObj[propArray[i]] = Math.round(roundedPct * 100) + "%";
        }
      }
      else {
        let roundedPct = parseFloat(newColorObj[propArray[i]].toFixed());
        if (propArray[i] === "h" && !object) {
          roundedPct = roundedPct + "deg";
        } 
        newColorObj[propArray[i]] = roundedPct;
      }
    }
  }

  let stringName = colorSpaces[format].name;
  let stringValue;

  if (format === "HEX") {
    stringValue = d3.rgb(color).formatHex();
  } else {
    let str0, srt1, str2;
    if (format === "LCH") {
      // Have to force opposite direction of array index for LCH
      // because d3 defines the channel order as "h, c, l" but we
      // want the output to be in the correct format
      str0 = newColorObj[propArray[2]] + ", ";
      str1 = newColorObj[propArray[1]] + ", ";
      str2 = newColorObj[propArray[0]];
    }
    else {
      str0 = newColorObj[propArray[0]] + ", ";
      str1 = newColorObj[propArray[1]] + ", ";
      str2 = newColorObj[propArray[2]];
    }

    stringValue = stringName + "(" + str0 + str1 + str2 + ")";
  }

  if (object) { 
    // return colorObj;
    return newColorObj;
  } else {
    return stringValue;
  }
}

function luminance(r, g, b) {
  let a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928
        ? v / 12.92
        : Math.pow( (v + 0.055) / 1.055, 2.4 );
  });
  return (a[0] * 0.2126) + (a[1] * 0.7152) + (a[2] * 0.0722);
}

function contrast(color, base, baseV) {
  if(baseV == undefined) { // If base is an array and baseV undefined
    let colorString = String(`rgb(${base[0]}, ${base[1]}, ${base[2]})`);
    
    baseLightness = Number((d3.hsluv(colorString).v));
    if(baseLightness > 0) {
      baseV = Number((baseLightness / 100).toFixed(2));
    } else if (baseLightness === 0) {
      baseV = 0;
    }
  }

  let colorLum = luminance(color[0], color[1], color[2]);
  let baseLum = luminance(base[0], base[1], base[2]);


  let cr1 = (colorLum + 0.05) / (baseLum + 0.05); // will return value >=1 if color is darker than background
  let cr2 = (baseLum + 0.05) / (colorLum + 0.05); // will return value >=1 if color is lighter than background

  if (baseV <= 0.51) { // Dark themes
    // If color is darker than background, return cr1 which will be whole number
    if (cr1 >= 1) {
      return cr1;
    }
    // If color is lighter than background, return cr2 as negative whole number
    else {
      return cr2 * -1;
    } 
  }
  else { // Light themes
    // If color is lighter than background, return cr2 which will be whole number
    if (cr1 < 1) {
      return cr2;
    }
    // If color is darker than background, return cr1 as negative whole number
    else if (cr1 === 1) {
      return cr1;
    }
    else {
      return cr1 * -1;
    } 
  }
}

function minPositive(r) {
  if (!r) { throw new Error('Array undefined');}
  if (!Array.isArray(r)) { throw new Error('Passed object is not an array');}
  let arr = [];

  for(let i=0; i < r.length; i++) {
    if(r[i] >= 1) {
      arr.push(r[i]);
    }
  }
  return Math.min(...arr);
}

function ratioName(r) {
  if (!r) { throw new Error('Ratios undefined');}
  r = r.sort(function(a, b){return a - b}); // sort ratio array in case unordered

  let min = minPositive(r);
  let minIndex = r.indexOf(min);
  let nArr = []; // names array

  let rNeg = r.slice(0, minIndex);
  let rPos = r.slice(minIndex, r.length);

  // Name the negative values
  for (let i=0; i < rNeg.length; i++) {
    let d = 1/(rNeg.length + 1);
    let m = d * 100;
    let nVal = m * (i + 1);
    nArr.push(Number(nVal.toFixed()));
  }
  // Name the positive values
  for (let i=0; i < rPos.length; i++) {
    nArr.push((i+1)*100);
  }
  nArr.sort(function(a, b){return a - b}); // just for safe measure

  return nArr;
}


// Binary search to find index of contrast ratio that is input
// Modified from https://medium.com/hackernoon/programming-with-js-binary-search-aaf86cef9cb3
function getMatchingRatioIndex(list, value) {
  // If a value of -1 is passed, it should be positive since 1 is the zero-point
  if(value === -1) value = 1;
  // initial values for start, middle and end
  let start = 0
  let stop = list.length - 1
  let middle = Math.floor((start + stop) / 2)
  let descending = list[0] > list[list.length - 1];
  let positiveValue = Math.sign(value) === 1;

  // While the middle is not what we're looking for and the list does not have a single item
  while (list[middle] !== value && start < stop) {
    if (descending) { // descending list
      if (value > list[middle]) {
        stop = middle - 1
      }
      else {
        start = middle + 1
      }
    } 
    else { // ascending list
      if (value > list[middle]) {
        start = middle + 1
      }
      else {
        stop = middle - 1
      }
    }
    // recalculate middle on every iteration
    middle = Math.floor((start + stop) / 2)
  }

  // Create mini array focusing around the middle value
  // Shift the middle value if it's on either end of the list array
  // and create a new start/stop for the new array based on the new middle
  let newMiddle = middle === 0 ? middle + 2 : ((middle === list.length - 1) ? middle - 2 : middle);
  let newArray = list.slice(newMiddle - 1, newMiddle + 2);

  // Then, find the next larger positive number or next smaller negative number from that array
  // let nextClosestValue = ((value >= newMax && positiveValue) || (value <= newMax && positiveValue === false)) ? newMax : (((value <= newMin && positiveValue) || (value >= newMin && positiveValue === false)) ? newMin : (value > 0) ? newArray.find(element => element > value) : newArray.find(element => element < value));
  let nextLargestValue  = (list[newMiddle] >= value) ? list[newMiddle] : newArray.find(element => element > value);
  let nextSmallestValue = (list[newMiddle] <= value) ? list[newMiddle] : newArray.find(element => element < value);
  let nextClosestValue  = (positiveValue === true) ? nextLargestValue : nextSmallestValue;

  let result = list[middle] !== value && nextClosestValue !== undefined ? (((descending && value <= 1) || (!descending && value > 1)) ? list.lastIndexOf(nextClosestValue) : list.indexOf(nextClosestValue)) : middle;

  // To be extra safe, cap the possible result index
  // to be no less than 0 and no greater than the list's length:
  if (result < 0) return 0;
  if (result > list.length - 1) return list.length - 1;

  return result;
}

module.exports = {
  createScale,
  luminance,
  contrast,
  getMatchingRatioIndex,
  minPositive,
  ratioName,
  convertColorValue,
  Color,
  BackgroundColor,
  Theme
};
