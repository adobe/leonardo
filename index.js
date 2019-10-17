// This file should be where the actual function is authored;
// independant from the web app.

// base = static color value that generated colors are contrasted against
// variable = color that you wish to adapt based on contrast ratio with base
// tint = lighter value of variable for scale
// shade = darker value of variable for scale
// colorspace = interpolation mode to be used
// [ratios] = array of ratio values to generated colors from

function adaptcolor({color = '#0000ff', base = '#ffffff', ratios = [3, 4.5, 7], tint = '#fefefe', shade = '#010101', colorspace = 'LCH', lib = 'd3'} = {}) {
  console.log(tint);

  // Using HSLuv "v" value as a uniform domain in gradients.
  // This should be uniform regardless of library / colorspace.
  // TODO: investigate alternative luminosity/brightness calculations.
  swatches = 500; // should be 2000 if able to render every possible decimal value of contrast.
  domain = swatches - swatches * (d3.hsluv(color).v / 100);
  tintDomain = swatches - swatches * (d3.hsluv(tint).v / 100);
  shadeDomain = swatches - swatches * (d3.hsluv(shade).v / 100);

  if(lib == 'd3') {
    if(colorspace == 'CAM02') {
      scale = d3.scaleLinear()
        .range(['#ffffff', tint, d3.jab(color), shade, '#000000'])
        .domain([0, tintDomain, domain, shadeDomain, swatches])
        .interpolate(d3.interpolateJab);
    }
    if(colorspace == 'LCH') {
      scale = d3.scaleLinear()
        .range([d3.hcl(NaN, 0, 100), tint, d3.hcl(color), shade, d3.hcl(NaN, 0, 0)])
        .domain([0, tintDomain, domain, shadeDomain, swatches])
        .interpolate(d3.interpolateHcl);
    }
    if(colorspace == 'LAB') {
      scale = d3.scaleLinear()
        .range(['#ffffff', tint, d3.lab(color), shade, '#000000'])
        .domain([0, tintDomain, domain, shadeDomain, swatches])
        .interpolate(d3.interpolateLab);
    }
    if(colorspace == 'HSL') {
      scale = d3.scaleLinear()
        .range(['#ffffff', tint, d3.hsl(color), shade, '#000000'])
        .domain([0, tintDomain, domain, shadeDomain, swatches])
        .interpolate(d3.interpolateHsl);
    }
    if(colorspace == 'HSLuv') {
      scale = d3.scaleLinear()
        .range(['#ffffff', tint, d3.hsluv(color), shade, '#000000'])
        .domain([0, tintDomain, domain, shadeDomain, swatches])
        .interpolate(d3.interpolateHsluv);
    }
    if(colorspace == 'RGB') {
      scale = d3.scaleLinear()
        .range([d3.rgb('#ffffff'), tint, d3.rgb(color), shade, d3.rgb('#000000')])
        .domain([0, tintDomain, domain, shadeDomain, swatches])
        .interpolate(d3.interpolateRgb);
    }
    if(colorspace == 'RGBgamma') {
      scale = d3.scaleLinear()
        .range([d3.rgb('#ffffff'), tint, d3.rgb(color), shade, d3.rgb('#000000')])
        .domain([0, tintDomain, domain, shadeDomain, swatches])
        .interpolate(d3.interpolateRgb.gamma(2.2));
    }
  }

  var Colors = d3.range(swatches).map(function(d) {
    return scale(d)
  });

  colors = Colors.filter(function (el) {
    return el != null;
  });

  // contrasts = colors.map(contrastD3);
  var Contrasts = d3.range(swatches).map(function(d) {
    var ca = contrastD3(scale(d), base).toFixed(2);
    return Number(ca);
  });
  contrasts = Contrasts.filter(function (el) {
    return el != null;
  })
  console.log(contrasts);
  // console.log(ratios.length);


  // TODO: Why doesn't this work?
  // Need to add "if does not exist, choose next number of increased value"
  // ie -> if contrasts = [3.05, 3.01, 2.89] and ratio is 3 -> return 3.01
  for(i=0; i < ratios.length; i++){
    var r = binarySearch(contrasts, ratios[i]);
    console.log(ratios[i] + " should equal color: " + colors[r]);
  }
}

// Test script:
// adaptcolor('#f5f5f5', '#2451FF', [3, 4.5], {tint: '#C9FEFE', shade: '#012676', colorspace: 'RGB', lib: 'd3'});

function luminance(r, g, b) {
  var a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928
          ? v / 12.92
          : Math.pow( (v + 0.055) / 1.055, 2.4 );
  });
  return (a[0] * 0.2126) + (a[1] * 0.7152) + (a[2] * 0.0722);
}

function contrast(rgb1, rgb2) {
  var cr1 = (luminance(rgb1[0], rgb1[1], rgb1[2]) + 0.05) / (luminance(rgb2[0], rgb2[1], rgb2[2]) + 0.05);
  var cr2 = (luminance(rgb2[0], rgb2[1], rgb2[2]) + 0.05) / (luminance(rgb1[0], rgb1[1], rgb1[2]) + 0.05);

  if (cr1 < 1) { return cr2; }
  if (cr1 >= 1) { return cr1; }
}

function contrastD3(rgb1, rgb2) {
  var cr1 = (luminance(d3.rgb(rgb1).r, d3.rgb(rgb1).g, d3.rgb(rgb1).b) + 0.05) / (luminance(d3.rgb(rgb2).r, d3.rgb(rgb2).g, d3.rgb(rgb2).b) + 0.05);
  var cr2 = (luminance(d3.rgb(rgb2).r, d3.rgb(rgb2).g, d3.rgb(rgb2).b) + 0.05) / (luminance(d3.rgb(rgb1).r, d3.rgb(rgb1).g, d3.rgb(rgb1).b) + 0.05);

  if (cr1 < 1) { return cr2; }
  if (cr1 >= 1) { return cr1; }
}

// Binary search to find index of contrast ratio that is input
// scraped from here: https://medium.com/hackernoon/programming-with-js-binary-search-aaf86cef9cb3
function binarySearch (list, value) {
  // initial values for start, middle and end
  let start = 0
  let stop = list.length - 1
  let middle = Math.floor((start + stop) / 2)

  // While the middle is not what we're looking for and the list does not have a single item
  while (list[middle] !== value && start < stop) {
    if (value > list[middle]) {
      stop = middle - 1
    } else {
      start = middle + 1
    }

    // recalculate middle on every iteration
    middle = Math.floor((start + stop) / 2)
  }

  // if the current middle item is what we're looking for return it's index, else return -1
  // TODO: Rather than return -1, find nearest greater value.
  return (list[middle] !== value) ? -1 : middle
}
