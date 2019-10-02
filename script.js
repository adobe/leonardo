// Copyright 2019 Adobe. All rights reserved.
// This file is licensed to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may obtain a copy
// of the License at http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under
// the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
// OF ANY KIND, either express or implied. See the License for the specific language
// governing permissions and limitations under the License.

var colorField = document.getElementById('colorField1');
var color1 = document.getElementById('colorField1').value;
var colorTint = document.getElementById('colorField2').value;
var colorShade = document.getElementById('colorField3').value;
var background = document.getElementById('bgField').value;
var colorBlock = document.getElementById('color');
var demoHeading = document.getElementById('demoHeading');
var demoWrapper = document.getElementById('demoWrapper');
var demoText = document.getElementById('demoText');
var demoBackgroundText = document.getElementById('demoTextInverted');
var demoBackgroundHeading = document.getElementById('demoHeadingInverted');
var demoBackgroundBlock = document.getElementById('demoInverted');
var demoButton = document.getElementById('demoButton');
var demoButtonInverted = document.getElementById('demoButtonInverted');
var userColorBlock = document.getElementById('userColor');
var userBgBlock = document.getElementById('userBg');
var ratioInput = document.getElementById('ratio');
var targetRatio = ratioInput.value;
// var scaleNumbers = document.querySelector('input[name="scaleNumbers"]:checked').value;
var colorOutputField = document.getElementById('colorOutput');
var fieldColorOutput = document.getElementById('spectrum-Textfield-swatch');
var swatches = 500; // in order to make a gradient, this count needs to be massive

function paramSetup() {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));

  // // If parameters exist, use parameter; else use default html input values
  if(params.has('color')) {
    document.getElementById('colorField1').value = "#" + params.get('color');
  }
  if(params.has('tint')) {
    document.getElementById('colorField2').value = "#" + params.get('tint');
  }
  if(params.has('shade')) {
    document.getElementById('colorField3').value = "#" + params.get('shade');
  }
  if(params.has('mode')) {
    document.querySelector('input[name="mode"]:checked').value = params.get('mode');
  }
  // // TODO: Won't work until I have ratioUpdate() function working
  // if(params.has('ratio')) {
  //   var contrastRatio2 = params.get('ratio');
  // } else { }
}
paramSetup();

function colorblock(c){
  colorBlock.style.backgroundColor = c;
  demoBackgroundBlock.style.backgroundColor = c;
  demoText.style.color = c;
  demoHeading.style.color = c;
  demoButton.style.color = c;
  demoButton.style.borderColor = c;
  fieldColorOutput.style.backgroundColor = c;
}
colorblock(color1);

function backgroundblock(b){
  demoWrapper.style.backgroundColor = b;
  demoBackgroundText.style.color = b;
  demoBackgroundHeading.style.color = b;
  demoBackgroundBlock.style.color = b;
  demoButtonInverted.style.color = b;
  demoButtonInverted.style.borderColor = b;
}
backgroundblock(background);


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

// Simplifying d3 color Functions for reuse
// TODO: update to include white & black whether or not tint and shade defined
function colorScale(color, colorTint, colorShade) {
  var colorspace = document.querySelector('input[name="mode"]:checked').value;
  // Using HSLuv "v" value as a uniform domain in gradients.
  var domain = swatches - swatches * (d3.hsluv(color).v / 100);
  var tintDomain = swatches - swatches * (d3.hsluv(colorTint).v / 100);
  var shadeDomain = swatches - swatches * (d3.hsluv(colorShade).v / 100);

  if(colorspace == 'CAM02') {
    return d3.scaleLinear()
      .range(['#ffffff', colorTint, d3.jab(color), colorShade, '#000000'])
      .domain([0, tintDomain, domain, shadeDomain, swatches])
      .interpolate(d3.interpolateJab);
  }
  if(colorspace == 'LCH') {
    // TODO: if colorTint / colorTint inputs are pure white/black, redefine
    // to D3 hcl hack:
    // if (colorTint == '#FFFFFF' || '#ffffff') {
    //   var colorTint = d3.hcl(NaN, 0, 100);
    // }
    // if (colorShade == '#000000' || 'black') {
    //   var colorShade = d3.hcl(NaN, 0, 0);
    // }
    return d3.scaleLinear()
      .range([d3.hcl(NaN, 0, 100), colorTint, d3.hcl(color), colorShade, d3.hcl(NaN, 0, 0)])
      .domain([0, tintDomain, domain, shadeDomain, swatches])
      .interpolate(d3.interpolateHcl);
  }
  if(colorspace == 'LAB') {
    return d3.scaleLinear()
      .range(['#ffffff', colorTint, d3.lab(color), colorShade, '#000000'])
      .domain([0, tintDomain, domain, shadeDomain, swatches])
      .interpolate(d3.interpolateLab);
  }
  if(colorspace == 'HSL') {
    return d3.scaleLinear()
      .range(['#ffffff', colorTint, d3.hsl(color), colorShade, '#000000'])
      .domain([0, tintDomain, domain, shadeDomain, swatches])
      .interpolate(d3.interpolateHsl);
  }
  if(colorspace == 'HSLuv') {
    return d3.scaleLinear()
      .range(['#ffffff', colorTint, d3.hsluv(color), colorShade, '#000000'])
      .domain([0, tintDomain, domain, shadeDomain, swatches])
      .interpolate(d3.interpolateHsluv);
  }
  if(colorspace == 'RGB') {
    return d3.scaleLinear()
      .range([d3.rgb('#ffffff'), colorTint, d3.rgb(color), colorShade, d3.rgb('#000000')])
      .domain([0, tintDomain, domain, shadeDomain, swatches])
      .interpolate(d3.interpolateRgb);
  }
  if(colorspace == 'RGBgamma') {
    return d3.scaleLinear()
      .range([d3.rgb('#ffffff'), colorTint, d3.rgb(color), colorShade, d3.rgb('#000000')])
      .domain([0, tintDomain, domain, shadeDomain, swatches])
      .interpolate(d3.interpolateRgb.gamma(2.2));
  }
}

// TODO: This isn't working :-/
function toggleTintShade() {
  var customTintShade = document.getElementById('tintShades');

  document.getElementById('colorField2').disabled = !this.checked;
  document.getElementById('colorField3').disabled = !this.checked;
  document.getElementById('colorField2').value = '#eaeaea';
  document.getElementById('colorField3').value = '#eaeaea';

  if (customTintShade.checked == true)  {
    document.getElementById('color2Label').classList.remove = 'is-disabled';
    document.getElementById('color3Label').classList.remove = 'is-disabled';
  }
  if (customTintShade.checked == false) {
    document.getElementById('color2Label').classList.add = 'is-disabled';
    document.getElementById('color3Label').classList.add = 'is-disabled';
  }
}

// Calculate Color and generate Scales
function colorInput() {
  document.getElementById('colors').innerHTML = '';

  var slider = document.getElementById('Slider');
  var background = document.getElementById('bgField').value;
  var customTintShade = document.getElementById('tintShades');
  var color1 = colorField1.value;
  var colorTint = colorField2.value;
  var colorShade = colorField3.value;
  var mode = document.querySelector('input[name="mode"]:checked').value;

  colorblock(color1);

  var clr = colorScale(color1, colorTint, colorShade);

  var ColorArray = d3.range(swatches).map(function(d) {
    return clr(d)
  });

  var colors = ColorArray;

  colorsArray = colors.filter(function (el) {
    return el != null;
  });

  // console.log(colorsArray);

  // slider.defaultValue = L2 * 5;

  // Generate Gradient
  for (var i = 0; i < colors.length; i++) {
    var container = document.getElementById('colors');
    var div = document.createElement('div');
    div.className = 'block';
    div.style.backgroundColor = colors[i];

    container.appendChild(div);
  }

  var colorR = d3.rgb(color1).r;
  var colorG = d3.rgb(color1).g;
  var colorB = d3.rgb(color1).b;

  var backgroundR = d3.rgb(background).r;
  var backgroundG = d3.rgb(background).g;
  var backgroundB = d3.rgb(background).b;

  var contrastRatio = contrast([backgroundR, backgroundG, backgroundB], [colorR, colorG, colorB]).toFixed(2);
  var text = document.createTextNode(contrastRatio);

  colorBlock.innerHTML = '';
  colorBlock.appendChild(text);
  ratioInput.value = contrastRatio;
  colorBlock.style.bottom = slider.value * 5 + "%";

  backgroundblock(background);

  // Slider updates
  var sliderPos = document.getElementById('Slider').value;
  var colorDomainUpdate =  swatches - (swatches * sliderPos /500);
  var newRgb = ColorArray[colorDomainUpdate];
  var contrastRatio2 = contrast([backgroundR, backgroundG, backgroundB], [d3.rgb(newRgb).r, d3.rgb(newRgb).g, d3.rgb(newRgb).b]).toFixed(2);

  colorblock(newRgb);
  colorBlock.style.bottom = sliderPos / 5 + "%";
  slider.value = sliderPos;
  ratioInput.value = contrastRatio2;
  var colorR = d3.rgb(newRgb).r;
  var colorG = d3.rgb(newRgb).g;
  var colorB = d3.rgb(newRgb).b;
  if (luminance(colorR, colorG, colorB) < 0.275) {
    colorBlock.style.color = "#ffffff";
  } else {
    colorBlock.style.color = '#000000';
  }
  var textUpdate = document.createTextNode(contrastRatio2);

  colorBlock.innerHTML = '';
  colorBlock.appendChild(textUpdate);

  newHex = d3.rgb(newRgb).formatHex();
  colorOutputField.value = newRgb + '\n' + newHex + '\n' + contrastRatio2 + ":1";

  // TODO: This slider default value isn't working. Should default to L2
  // value, unless user moves slider.
  // slider.value = L2;

  // update URL parameters
  // updateParams(color1.substr(1), colorTint.substr(1), colorShade.substr(1), contrastRatio2, mode);
}
colorInput(color1);

// Contrast Input
function ratioUpdate() {
  var ratioInput = document.getElementById('ratio');
  targetRatio = ratioInput.value;

  for (let i = 0; i < colorsArray.length; i++) {
    var r = d3.rgb(colorsArray[i]).r;
    var g = d3.rgb(colorsArray[i]).g;
    var b = d3.rgb(colorsArray[i]).b;

    var bR = d3.rgb(background).r;
    var bG = d3.rgb(background).g;
    var bB = d3.rgb(background).b;

    var ratio = contrast([r, g, b], [bR, bG, bB]).toFixed(2);

    if (targetRatio == ratio) {
      colorblock(colorsArray[i]);

      break;
    }
    else {
      continue;
      // var nextBest = closest (targetRatio, colorsArray);
      // console.log("Your next best bet is: " + nextBest);
    }
  }
}

function closest (num, arr) {
    var mid;
    var lo = 0;
    var hi = arr.length - 1;
    while (hi - lo > 1) {
        mid = Math.floor ((lo + hi) / 2);
        if (arr[mid] < num) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    if (num - arr[lo] <= arr[hi] - num) {
        return arr[lo];
    }
    return arr[hi];
}

// Passing variable parameters to URL https://googlechrome.github.io/samples/urlsearchparams/?foo=2
function updateParams(c, t, s, r, m) {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));

  params.set('color', c);
  params.set('tint', t);
  params.set('shade', s);
  // TODO: once fixed, uncomment
  // params.set('ratio', r);
  params.set('mode', m);

  window.history.replaceState({}, '', '/?' + params); // update the page's URL.
}
