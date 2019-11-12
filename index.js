// Copyright 2019 Adobe. All rights reserved.
// This file is licensed to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may obtain a copy
// of the License at http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under
// the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
// OF ANY KIND, either express or implied. See the License for the specific language
// governing permissions and limitations under the License.

function createScale({swatches = 8, colorKeys = ['#CCFFA9', '#FEFEC5', '#5F0198'], colorspace = 'LAB', shift = 1, fullScale = true} = {}) {
  var Domains = [];

  for(i=0; i < colorKeys.length; i++){
    Domains.push(swatches - swatches * (d3.hsluv(colorKeys[i]).v / 100))
  }
  Domains.sort(function(a, b){return a-b});

  var domains = [];
  domains = domains.concat(0, Domains, swatches);

  // Test logarithmic domain (for non-contrast-based scales)
  var sqrtDomains = d3.scalePow()
    .exponent(shift)
    .domain([1, swatches])
    .range([1, swatches]);

  sqrtDomains = domains.map(function(d) {
    if(sqrtDomains(d) < 0) {
      return 0;
    } else {
      return sqrtDomains(d);
    }
  })

  // Transform square root in order to smooth gradient
  domains = sqrtDomains;

  function cArray(c) {
    var L = d3.hsluv(c).l;
    var U = d3.hsluv(c).u;
    var V = d3.hsluv(c).v;

    return new Array( L, U, V);
  }
  var sortedColor = colorKeys.map(function(c, i) {
    // Convert to HSLuv and keep track of original indices
    return {colorKeys: cArray(c), index: i};
  }).sort(function(c1, c2) {
    // Sort by lightness
    return c2.colorKeys[2] - c1.colorKeys[2];
  }).map(function(data) {
    // Retrieve original RGB color
    return colorKeys[data.index];
  });

  var inverseSortedColor = colorKeys.map(function(c, i) {
    // Convert to HSLuv and keep track of original indices
    return {colorKeys: cArray(c), index: i};
  }).sort(function(c1, c2) {
    // Sort by lightness
    return c1.colorKeys[2] - c2.colorKeys[2];
  }).map(function(data) {
    // Retrieve original RGB color
    return colorKeys[data.index];
  });

  ColorsArray = [];

  if(colorspace == 'CAM02') {
    if(fullScale == true) {
      ColorsArray = ColorsArray.concat('#ffffff', sortedColor, '#000000');
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    ColorsArray = ColorsArray.map(function(d) {
      return d3.jab(d);
    });

    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateJab);
  }
  if(colorspace == 'LCH') {
    ColorsArray = ColorsArray.map(function(d) {
      return d3.hcl(d);
    });
    if(fullScale == true) {
      ColorsArray = ColorsArray.concat(d3.hcl(NaN, 0, 100), sortedColor, d3.hcl(NaN, 0, 0));
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateHcl);
  }
  if(colorspace == 'LAB') {
    if(fullScale == true) {
      ColorsArray = ColorsArray.concat('#ffffff', sortedColor, '#000000');
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    ColorsArray = ColorsArray.map(function(d) {
      return d3.lab(d);
    });

    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateLab);
  }
  if(colorspace == 'HSL') {
    if(fullScale == true) {
      ColorsArray = ColorsArray.concat('#ffffff', sortedColor, '#000000');
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    ColorsArray = ColorsArray.map(function(d) {
      return d3.hsl(d);
    });
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateHsl);
  }
  if(colorspace == 'HSLuv') {
    ColorsArray = ColorsArray.map(function(d) {
      return d3.hsluv(d);
    });
    if(fullScale == true) {
      ColorsArray = ColorsArray.concat(d3.hsluv(NaN, NaN, 100), sortedColor, d3.hsluv(NaN, NaN, 0));
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateHsluv);
  }
  if(colorspace == 'RGB') {
    if(fullScale == true) {
      ColorsArray = ColorsArray.concat('#ffffff', sortedColor, '#000000');
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    ColorsArray = ColorsArray.map(function(d) {
      return d3.rgb(d);
    });
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateRgb);
  }
  if(colorspace == 'HSV') {
    if(fullScale == true) {
      ColorsArray = ColorsArray.concat('#ffffff', sortedColor, '#000000');
    } else {
      ColorsArray = ColorsArray.concat(sortedColor);
    }
    ColorsArray = ColorsArray.map(function(d) {
      return d3.hsv(d);
    });
    scale = d3.scaleLinear()
      .range(ColorsArray)
      .domain(domains)
      .interpolate(d3.interpolateHsv);
  }

  var Colors = d3.range(swatches).map(function(d) {
    return scale(d)
  });

  colors = Colors.filter(function (el) {
    return el != null;
  });

  // Return colors as hex values for interpolators.
  colorsHex = [];
  for (i=0; i<colors.length; i++) {
    colorsHex.push(d3.rgb(colors[i]).formatHex());
  }

  return {colorKeys: colorKeys, colorspace: colorspace, shift: shift, colors: colors};
}
// Test script
// createScale({swatches: 8, colorKeys: ['#CCFFA9', '#FEFEC5', '#5F0198'], colorspace: 'LAB', shift: 1, fullScale: true});

function generateContrastColors({colorKeys, base, ratios, colorspace = 'LAB', shift = 1} = {}) {
  swatches = 3000;

  createScale({swatches: swatches, colorKeys: colorKeys, colorspace: colorspace, shift: shift});

  var Contrasts = d3.range(swatches).map(function(d) {
    var rgbArray = [d3.rgb(scale(d)).r, d3.rgb(scale(d)).g, d3.rgb(scale(d)).b];
    var baseRgbArray = [d3.rgb(base).r, d3.rgb(base).g, d3.rgb(base).b];
    var ca = contrast(rgbArray, baseRgbArray).toFixed(2);

    return Number(ca);
  });
  contrasts = Contrasts.filter(function (el) {
    return el != null;
  });

  var baseLum = luminance(d3.rgb(base).r, d3.rgb(base).g, d3.rgb(base).b);

  newColors = [];
  ratios = ratios.map(Number);

  // Return color matching target ratio, or closest number
  for(i=0; i < ratios.length; i++){
    var r = binarySearch(contrasts, ratios[i], baseLum);
    newColors.push(d3.rgb(colors[r]).hex());
  }

  return newColors;
}

// Test scripts:
// generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'RGB'});
// generateContrastColors({colorKeys: ["#0000ff"], base: "#323232",ratios: [-1.25,4.5], colorspace: "LCH"});
// Error Tests:
// generateContrastColors({base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'RGB'}) // no colors
// generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', colorspace: 'RGB'}) // no ratios


// TODO: see if there's a luminance package?
// Separate files in a lib folder as well.
function luminance(r, g, b) {
  var a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928
          ? v / 12.92
          : Math.pow( (v + 0.055) / 1.055, 2.4 );
  });
  return (a[0] * 0.2126) + (a[1] * 0.7152) + (a[2] * 0.0722);
}

// function percievedLum(r, g, b) {
//   return (0.299*r + 0.587*g + 0.114*b);
// }

// Separate files in a lib folder as well.
function contrast(color, base) {
  var colorLum = luminance(color[0], color[1], color[2]);
  var baseLum = luminance(base[0], base[1], base[2]);

  var cr1 = (colorLum + 0.05) / (baseLum + 0.05);
  var cr2 = (baseLum + 0.05) / (colorLum + 0.05);

  if(baseLum < 0.5) {
    if (cr1 >= 1) { return cr1; }
    else { return cr2 * -1; } // Return as whole negative number
  } else {
    if (cr1 < 1) { return cr2; }
    else { return cr1 * -1; } // Return as whole negative number
  }
}
// test scripts:
// contrast([255, 255, 255], [207, 207, 207]); // white is UI color, gray is base. Should return negative whole number


// TODO: Find binary search package to use instead of this. -> use its own file
// Binary search to find index of contrast ratio that is input
// Modified from https://medium.com/hackernoon/programming-with-js-binary-search-aaf86cef9cb3
function binarySearch(list, value, baseLum) {
  // initial values for start, middle and end
  let start = 0
  let stop = list.length - 1
  let middle = Math.floor((start + stop) / 2)

  var minContrast = Math.min(...list);
  var maxContrast = Math.max(...list);

  // While the middle is not what we're looking for and the list does not have a single item
  while (list[middle] !== value && start < stop) {
    // Value greater than since array is ordered descending
    if(baseLum > 0.5) {  // if base is light, ratios ordered ascending
      if (value < list[middle]) {
        stop = middle - 1
      } else {
        start = middle + 1
      }
    } else { // order descending
      if (value > list[middle]) {
        stop = middle - 1
      } else {
        start = middle + 1
      }
    }
    // recalculate middle on every iteration
    middle = Math.floor((start + stop) / 2)
  }

  // If no match, find closest item greater than value
  closest = list.reduce((prev, curr) => curr > value ? curr : prev);

  // if the current middle item is what we're looking for return it's index, else closest
  return (list[middle] == !value) ? closest : middle // how it was originally expressed
}

// TEST
// args = createScale({swatches: 8, colorKeys: ['#CCFFA9', '#FEFEC5', '#5F0198'], colorspace: 'LAB', shift: 1, fullScale: true});
// generateContrastColors({args, base: '#ffffff', ratios: [3, 4.5, 7]});
