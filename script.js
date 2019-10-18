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
  if(params.has('base')) {
    document.getElementById('bgField').value = "#" + params.get('base');
  }
  if(params.has('tint')) {
    document.getElementById('colorField2').value = "#" + params.get('tint');
  }
  if(params.has('shade')) {
    document.getElementById('colorField3').value = "#" + params.get('shade');
  }
  if(params.has('mode')) {
    document.querySelector('select[name="mode"]').value = params.get('mode');
  }
  // // TODO: Won't work until I have ratioUpdate() function working
  if(params.has('ratio')) {
    var contrastRatio2 = params.get('ratio');
  } else { }
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

// Add ratio inputs
function addRatio() {

}
// Delete ratio input
function deleteRatio() {

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
  var mode = document.querySelector('select[name="mode"]').value;

  colorblock(color1);

  adaptcolor({color: color1, base: background, tint: colorTint, shade: colorShade, colorspace: mode});

  // This is already handled in the adaptcolor function.
  // TODO: remove and pull the array from what's returned ?
  var ColorArray = d3.range(swatches).map(function(d) {
    return scale(d)
  });
  var colors = ColorArray;
  colorsArray = colors.filter(function (el) {
    return el != null;
  });
  // End to remove ^

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

  newHex = d3.rgb(newRgb).formatHex();
  // colorOutputField.value = newRgb + '\n' + newHex + '\n' + contrastRatio2 + ":1";
  var colorOutputWrapper = document.getElementById('colorOutputs');
  var colorOutput = document.createElement('div');
  var colorOutputVal = newHex;
  var colorOutputText = document.createTextNode(colorOutputVal);
  colorOutputWrapper.innerHTML = '';
  colorOutputWrapper.appendChild(colorOutput);
  colorOutput.className = 'colorOutputBlock';
  colorOutput.style.backgroundColor = color1;
  colorOutput.style.backgroundColor = newRgb;
  colorOutput.appendChild(colorOutputText);

  colorblock(newRgb);
  colorBlock.style.bottom = sliderPos / 5 + "%";
  slider.value = sliderPos;
  ratioInput.value = contrastRatio2;
  var colorR = d3.rgb(newRgb).r;
  var colorG = d3.rgb(newRgb).g;
  var colorB = d3.rgb(newRgb).b;
  if (luminance(colorR, colorG, colorB) < 0.275) {
    colorBlock.style.color = "#ffffff";
    colorOutput.style.color = "#ffffff";
  } else {
    colorBlock.style.color = '#000000';
    colorOutput.style.color = '#000000';
  }
  var textUpdate = document.createTextNode(contrastRatio2);

  colorBlock.innerHTML = '';
  colorBlock.appendChild(textUpdate);

  // TODO: This slider default value isn't working. Should default to L2
  // value, unless user moves slider.
  // slider.value = L2;

  // console.log(sliderPos);

  // update URL parameters
  // updateParams(color1.substr(1), background.substr(1), colorTint.substr(1), colorShade.substr(1), contrastRatio2, mode, 'd3');
}
colorInput(color1);


// Contrast Input
// function ratioUpdate() {
//   var ratioInput = document.getElementById('ratio');
//   targetRatio = ratioInput.value;
//
//   for (let i = 0; i < colorsArray.length; i++) {
//     var r = d3.rgb(colorsArray[i]).r;
//     var g = d3.rgb(colorsArray[i]).g;
//     var b = d3.rgb(colorsArray[i]).b;
//
//     var bR = d3.rgb(background).r;
//     var bG = d3.rgb(background).g;
//     var bB = d3.rgb(background).b;
//
//     var ratio = contrast([r, g, b], [bR, bG, bB]).toFixed(2);
//
//     if (targetRatio == ratio) {
//       colorblock(colorsArray[i]);
//       console.log('Match!');
//
//       break;
//     }
//     else {
//       continue;
//       // var nextBest = closest (targetRatio, colorsArray);
//       // console.log("Your next best bet is: " + nextBest);
//     }
//   }
// }

// Passing variable parameters to URL https://googlechrome.github.io/samples/urlsearchparams/?foo=2
function updateParams(c, b, t, s, r, m, l) {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));

  params.set('base', b);
  params.set('color', c);
  params.set('ratio', r);
  params.set('tint', t);
  params.set('shade', s);
  params.set('mode', m);
  // TODO: uncomment when integrated with library options
  // params.set('lib', l);

  window.history.replaceState({}, '', '/?' + params); // update the page's URL.

  var p = document.getElementById('params');
  p.innerHTML = " ";
  var z = 'adaptcolor({color: "#' + c + '", base: "#'+ b + '", ratios: [' + r + '], ' + 'tint: "#' + t + '", shade: "#' + s + '", ' + ' colorspace: "' + m + '", lib: "' + l + '"});';
  text = document.createTextNode(z);
  p.appendChild(text);
}
