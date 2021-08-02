const chroma = require('chroma-js');
const d3 = require('./d3');
const { catmullRom2bezier, prepareCurve } = require('./curve');

const colorSpaces = {
  CAM02: {
    name: 'jab',
    channels: ['J', 'a', 'b'],
    interpolator: d3.interpolateJab,
    function: d3.jab,
  },
  CAM02p: {
    name: 'jch',
    channels: ['J', 'C', 'h'],
    interpolator: d3.interpolateJch,
    function: d3.jch,
  },
  LCH: {
    name: 'lch', // named per correct color definition order
    channels: ['h', 'c', 'l'],
    interpolator: d3.interpolateHcl,
    white: d3.hcl(NaN, 0, 100),
    black: d3.hcl(NaN, 0, 0),
    function: d3.hcl,
  },
  LAB: {
    name: 'lab',
    channels: ['l', 'a', 'b'],
    interpolator: d3.interpolateLab,
    function: d3.lab,
  },
  HSL: {
    name: 'hsl',
    channels: ['h', 's', 'l'],
    interpolator: d3.interpolateHsl,
    function: d3.hsl,
  },
  HSLuv: {
    name: 'hsluv',
    channels: ['l', 'u', 'v'],
    interpolator: d3.interpolateHsluv,
    white: d3.hsluv(NaN, NaN, 100),
    black: d3.hsluv(NaN, NaN, 0),
    function: d3.hsluv,
  },
  RGB: {
    name: 'rgb',
    channels: ['r', 'g', 'b'],
    interpolator: d3.interpolateRgb,
    function: d3.rgb,
  },
  HSV: {
    name: 'hsv',
    channels: ['h', 's', 'v'],
    interpolator: d3.interpolateHsv,
    function: d3.hsv,
  },
  HEX: {
    name: 'hex',
    channels: ['r', 'g', 'b'],
    interpolator: d3.interpolateRgb,
    function: d3.rgb,
  },
};

function multiplyRatios(ratio, multiplier) {
  let r;
  // Normalize contrast ratios before multiplying by this._contrast
  // by making 1 = 0. This ensures consistent application of increase/decrease
  // in contrast ratios. Then add 1 back to number for contextual ratio value.
  if (ratio > 1) {
    r = ((ratio - 1) * multiplier) + 1;
  } else if (ratio < -1) {
    r = ((ratio + 1) * multiplier) - 1;
  } else {
    r = 1;
  }

  return Number(r.toFixed(2));
}

function cArray(c) {
  const color = d3.hsluv(c);
  // console.color(String(c));
  // console.log(color);
  // console.log(chroma(String(c)).luv());
  const L = color.l;
  const U = color.u;
  const V = color.v;

  return [L, U, V];
}

function smoothScale(ColorsArray, domains, space) {
  const points = space.channels.map(() => []);
  ColorsArray.forEach((color, i) => points.forEach((point, j) => point.push(domains[i], color[space.channels[j]])));
  if (space.name === 'hcl') {
    const point = points[1];
    for (let i = 1; i < point.length; i += 2) {
      if (Number.isNaN(point[i])) {
        point[i] = 0;
      }
    }
  }
  points.forEach((point) => {
    const nans = [];
    // leading NaNs
    for (let i = 1; i < point.length; i += 2) {
      if (Number.isNaN(point[i])) {
        nans.push(i);
      } else {
        nans.forEach((j) => { point[j] = point[i]; });
        nans.length = 0;
        break;
      }
    }
    // all are grey case
    if (nans.length) {
      // hue is not important except for JCh
      const safeJChHue = d3.jch('#ccc').h;
      nans.forEach((j) => { point[j] = safeJChHue; });
    }
    nans.length = 0;
    // trailing NaNs
    for (let i = point.length - 1; i > 0; i -= 2) {
      if (Number.isNaN(point[i])) {
        nans.push(i);
      } else {
        nans.forEach((j) => { point[j] = point[i]; });
        break;
      }
    }
    // other NaNs
    for (let i = 1; i < point.length; i += 2) {
      if (Number.isNaN(point[i])) {
        point.splice(i - 1, 2);
        i -= 2;
      }
    }
    // force hue to go on the shortest route
    if (space.name in { hcl: 1, hsl: 1, hsluv: 1, hsv: 1, jch: 1 }) {
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
  });
  const prep = points.map((point) => catmullRom2bezier(point).map((curve) => prepareCurve(...curve)));
  return (d) => {
    const ch = prep.map((p) => {
      for (let i = 0; i < p.length; i++) {
        const res = p[i](d);
        if (res != null) {
          return res;
        }
      }
      return null;
    });

    if (space.name === 'jch' && ch[1] < 0) {
      ch[1] = 0;
    }

    return `${d3[space.name](...ch)}`;
  };
}

function createScale({
  swatches,
  colorKeys,
  colorspace = 'LAB',
  shift = 1,
  fullScale = true,
  smooth = false,
  asFun = false,
} = {}) {
  const space = colorSpaces[colorspace];
  if (!space) {
    throw new Error(`Colorspace “${colorspace}” not supported`);
  }
  if (!colorKeys) {
    throw new Error(`Colorkeys missing: returned “${colorKeys}”`);
  }

  let domains = colorKeys
    .map((key) => swatches - swatches * (d3.hsluv(key).v / 100))
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

  const sortedColor = colorKeys
    // Convert to HSLuv and keep track of original indices
    .map((c, i) => ({ colorKeys: cArray(c), index: i }))
    // Sort by lightness
    .sort((c1, c2) => c2.colorKeys[2] - c1.colorKeys[2])
    // Retrieve original RGB color
    .map((data) => colorKeys[data.index]);

  let ColorsArray = [];

  let scale;
  if (fullScale) {
    ColorsArray = [space.white || '#ffffff', ...sortedColor, space.black || '#000000'];
  } else {
    ColorsArray = sortedColor;
  }
  const stringColors = ColorsArray;
  ColorsArray = ColorsArray.map((d) => d3[space.name](d));
  if (space.name === 'hcl') {
    // special case for HCL if C is NaN we should treat it as 0
    ColorsArray.forEach((c) => { c.c = Number.isNaN(c.c) ? 0 : c.c; });
  }
  if (space.name === 'jch') {
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
  if (asFun) {
    return scale;
  }

  const Colors = d3.range(swatches).map((d) => scale(d));

  const colors = Colors.filter((el) => el != null);

  return colors;
}

function removeDuplicates(originalArray, prop) {
  const newArray = [];
  const lookupObject = {};
  const keys1 = Object.keys(originalArray);

  keys1.forEach((i) => { lookupObject[originalArray[i][prop]] = originalArray[i]; });

  const keys2 = Object.keys(lookupObject);
  keys2.forEach((i) => newArray.push(lookupObject[i]));
  return newArray;
}

function uniq(a) {
  return Array.from(new Set(a));
}

// Helper function to change any NaN to a zero
function filterNaN(x) {
  if (Number.isNaN(x)) {
    return 0;
  }
  return x;
}

// Helper function for rounding color values to whole numbers
function convertColorValue(color, format, object = false) {
  if (!color) {
    throw new Error(`Cannot convert color value of ${color}`);
  }
  if (!format) {
    throw new Error(`Cannot convert to colorspace ${format}`);
  }

  const colorObj = colorSpaces[format].function(color);
  const propArray = colorSpaces[format].channels;

  const newColorObj = {
    [propArray[0]]: filterNaN(colorObj[propArray[0]]),
    [propArray[1]]: filterNaN(colorObj[propArray[1]]),
    [propArray[2]]: filterNaN(colorObj[propArray[2]]),
  };

  // HSLuv
  if (format === 'HSLuv') {
    for (let i = 0; i < propArray.length; i++) {
      const roundedPct = Math.round(newColorObj[propArray[i]]);
      newColorObj[propArray[i]] = roundedPct;
    }
  } else if (format === 'LAB' || format === 'LCH' || format === 'CAM02' || format === 'CAM02p') { // LAB, LCH, JAB, JCH
    for (let i = 0; i < propArray.length; i++) {
      let roundedPct = Math.round(newColorObj[propArray[i]]);

      if (propArray[i] === 'h' && !object) {
        roundedPct += 'deg';
      }
      if ((propArray[i] === 'l' && !object) || (propArray[i] === 'J' && !object)) {
        roundedPct += '%';
      }

      newColorObj[propArray[i]] = roundedPct;
    }
  } else {
    for (let i = 0; i < propArray.length; i++) {
      if (propArray[i] === 's' || propArray[i] === 'l' || propArray[i] === 'v') {
        // leave as decimal format
        const roundedPct = parseFloat(newColorObj[propArray[i]].toFixed(2));
        if (object) {
          newColorObj[propArray[i]] = roundedPct;
        } else {
          newColorObj[propArray[i]] = `${Math.round(roundedPct * 100)}%`;
        }
      } else {
        let roundedPct = parseFloat(newColorObj[propArray[i]].toFixed());
        if (propArray[i] === 'h' && !object) {
          roundedPct += 'deg';
        }
        newColorObj[propArray[i]] = roundedPct;
      }
    }
  }

  const stringName = colorSpaces[format].name;
  let stringValue;

  if (format === 'HEX') {
    stringValue = d3.rgb(color).formatHex();
  } else {
    let str0;
    let str1;
    let str2;
    if (format === 'LCH') {
      // Have to force opposite direction of array index for LCH
      // because d3 defines the channel order as "h, c, l" but we
      // want the output to be in the correct format
      str0 = newColorObj[propArray[2]];
      str1 = newColorObj[propArray[1]];
      str2 = newColorObj[propArray[0]];
    } else {
      str0 = newColorObj[propArray[0]];
      str1 = newColorObj[propArray[1]];
      str2 = newColorObj[propArray[2]];
    }

    stringValue = `${stringName}(${str0}, ${str1}, ${str2})`;
  }

  if (object) {
    // return colorObj;
    return newColorObj;
  }
  return stringValue;
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return (a[0] * 0.2126) + (a[1] * 0.7152) + (a[2] * 0.0722);
}

function getContrast(color, base, baseV) {
  if (baseV === undefined) { // If base is an array and baseV undefined
    const colorString = String(`rgb(${base[0]}, ${base[1]}, ${base[2]})`);

    const baseLightness = Number((d3.hsluv(colorString).v));
    if (baseLightness > 0) {
      baseV = Number((baseLightness / 100).toFixed(2));
    } else if (baseLightness === 0) {
      baseV = 0;
    }
  }

  const colorLum = luminance(color[0], color[1], color[2]);
  const baseLum = luminance(base[0], base[1], base[2]);

  const cr1 = (colorLum + 0.05) / (baseLum + 0.05); // will return value >=1 if color is darker than background
  const cr2 = (baseLum + 0.05) / (colorLum + 0.05); // will return value >=1 if color is lighter than background

  if (baseV <= 0.51) { // Dark themes
    // If color is darker than background, return cr1 which will be whole number
    if (cr1 >= 1) {
      return cr1;
    }
    // If color is lighter than background, return cr2 as negative whole number
    return -cr2;
  }
  // Light themes
  // If color is lighter than background, return cr2 which will be whole number
  if (cr1 < 1) {
    return cr2;
  }
  // If color is darker than background, return cr1 as negative whole number
  if (cr1 === 1) {
    return cr1;
  }
  return -cr1;
}

function minPositive(r) {
  if (!r) { throw new Error('Array undefined'); }
  if (!Array.isArray(r)) { throw new Error('Passed object is not an array'); }
  const arr = [];

  for (let i = 0; i < r.length; i++) {
    if (r[i] >= 1) {
      arr.push(r[i]);
    }
  }
  return Math.min(...arr);
}

function ratioName(r) {
  if (!r) { throw new Error('Ratios undefined'); }
  r = r.sort((a, b) => a - b); // sort ratio array in case unordered

  const min = minPositive(r);
  const minIndex = r.indexOf(min);
  const nArr = []; // names array

  const rNeg = r.slice(0, minIndex);
  const rPos = r.slice(minIndex, r.length);

  // Name the negative values
  for (let i = 0; i < rNeg.length; i++) {
    const d = 1 / (rNeg.length + 1);
    const m = d * 100;
    const nVal = m * (i + 1);
    nArr.push(Number(nVal.toFixed()));
  }
  // Name the positive values
  for (let i = 0; i < rPos.length; i++) {
    nArr.push((i + 1) * 100);
  }
  nArr.sort((a, b) => a - b); // just for safe measure

  return nArr;
}

// Binary search to find index of contrast ratio that is input
// Modified from https://medium.com/hackernoon/programming-with-js-binary-search-aaf86cef9cb3
function getMatchingRatioIndex(list, value) {
  // If a value of -1 is passed, it should be positive since 1 is the zero-point
  if (value === -1) value = 1;
  // initial values for start, middle and end
  let start = 0;
  let stop = list.length - 1;
  let middle = Math.floor((start + stop) / 2);
  const descending = list[0] > list[list.length - 1];
  const positiveValue = Math.sign(value) === 1;

  // While the middle is not what we're looking for and the list does not have a single item
  while (list[middle] !== value && start < stop) {
    if (descending) { // descending list
      if (value > list[middle]) {
        stop = middle - 1;
      } else {
        start = middle + 1;
      }
    } else if (value > list[middle]) { // ascending list
      start = middle + 1;
    } else {
      stop = middle - 1;
    }
    // recalculate middle on every iteration
    middle = Math.floor((start + stop) / 2);
  }

  // Create mini array focusing around the middle value
  // Shift the middle value if it's on either end of the list array
  // and create a new start/stop for the new array based on the new middle
  const mid2 = (middle === list.length - 1) ? middle - 2 : middle;
  const newMiddle = middle === 0 ? middle + 2 : mid2;
  const newArray = list.slice(newMiddle - 1, newMiddle + 2);

  // Then, find the next larger positive number or next smaller negative number from that array
  // let nextClosestValue = ((value >= newMax && positiveValue) || (value <= newMax && positiveValue === false)) ? newMax : (((value <= newMin && positiveValue) || (value >= newMin && positiveValue === false)) ? newMin : (value > 0) ? newArray.find(element => element > value) : newArray.find(element => element < value));
  const nextLargestValue = (list[newMiddle] >= value) ? list[newMiddle] : newArray.find((element) => element > value);
  const nextSmallestValue = (list[newMiddle] <= value) ? list[newMiddle] : newArray.find((element) => element < value);
  const nextClosestValue = (positiveValue === true) ? nextLargestValue : nextSmallestValue;

  const mid3 = ((descending && value <= 1) || (!descending && value > 1)) ? list.lastIndexOf(nextClosestValue) : list.indexOf(nextClosestValue);
  const result = list[middle] !== value && nextClosestValue !== undefined ? mid3 : middle;

  // To be extra safe, cap the possible result index
  // to be no less than 0 and no greater than the list's length:
  if (result < 0) return 0;
  if (result > list.length - 1) return list.length - 1;
  return result;
}

const searchColors = (color, bgRgbArray, baseV, ratioValues) => {
  const colorLen = 3000;
  const colorScale = createScale({
    swatches: colorLen,
    colorKeys: color._colorKeys,
    colorspace: color._colorspace,
    shift: 1,
    smooth: color._smooth,
    asFun: true,
  });
  const ccache = {};
  // let ccounter = 0;
  const getContrast2 = (i) => {
    if (ccache[i]) {
      return ccache[i];
    }
    const rgb = d3.rgb(colorScale(i));
    const rgbArray = [rgb.r, rgb.g, rgb.b];
    const c = getContrast(rgbArray, bgRgbArray, baseV);
    ccache[i] = c;
    // ccounter++;
    return c;
  };
  const colorSearch = (x) => {
    const first = getContrast2(0);
    const last = getContrast2(colorLen - 1);
    const dir = first < last ? 1 : -1;
    const α = 0.01;
    x += 0.005;
    let step = colorLen / 2;
    let dot = step;
    let val = getContrast2(dot);
    let counter = 100;
    while (Math.abs(val - x) > α && counter) {
      counter--;
      step /= 2;
      if (val < x) {
        dot += step * dir;
      } else {
        dot -= step * dir;
      }
      val = getContrast2(dot);
    }
    return dot;
  };
  const outputColors = [];
  ratioValues.forEach((ratio) => outputColors.push(colorScale(colorSearch(+ratio))));
  return outputColors;
};

module.exports = {
  multiplyRatios,
  createScale,
  luminance,
  getContrast,
  getMatchingRatioIndex,
  minPositive,
  ratioName,
  convertColorValue,
  removeDuplicates,
  uniq,
  cArray,
  colorSpaces,
  searchColors,
};
