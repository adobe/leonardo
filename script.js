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
var colorOutputField = document.getElementById('colorOutput');

function paramSetup() {
  colorspaceOptions();
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
  if(params.has('ratios')) {
    // transform parameter values into array of numbers
    rat = params.get('ratios');
    ratios = rat.split(',');
    ratios = ratios.map(Number);

    if(ratios[0] == 0) { // if no parameter value, default to [3, 4.5]
      ratios = [3, 4.5];
    } else { }

    for(i=0; i<ratios.length; i++) {
      addRatio(ratios[i]);
      // console.log(ratios[i]);
    }
  }
  if(params.has('mode')) {
    document.querySelector('select[name="mode"]').value = params.get('mode');
  }
  else {
    addRatio(3);
    addRatio(4.5);
  }
}
paramSetup();

function colorblock(c){
  colorBlock.style.backgroundColor = c;
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
function addRatio(v = 1, s = '#cacaca') {
  // Gather values of other inputs so we can
  // increment by default
  // var vals = document.getElementsByClassName('ratioField');
  //
  // if(v == undefined) {
  //   var Array = [];
  //   for(i=0; i<vals.length; i++) {
  //     // place all existing values into array
  //     Array.push(vals[i].value);
  //   }
  //   console.log(Array);
  //   // TODO: find highest & lowest value in array
  //   // TODO: if(highVal < 20) {v = highVal + 1} else (v=highVal)
  // }
  var ratios = document.getElementById('ratios');
  var div = document.createElement('div');
  var randId = randomId();
  div.className = 'ratio-Item';
  div.id = randomId();
  var sw = document.createElement('span');
  sw.className = 'spectrum-Textfield-swatch';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = s;
  var input = document.createElement('input');
  input.className = 'spectrum-Textfield ratioField';
  input.type = "number";
  input.min = '-10';
  input.max = '21';
  input.step = '.01';
  input.placeholder = 4.5;
  input.id = randId;
  input.value = v;
  input.oninput = colorInput;
  // input.onfocus = showSlider;
  // input.addEventListener('blur', hideSlider);
  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  createSlider(randId, v);
  // slider = document.getElementById(randId + "-sl");
  // slider.addEventListener('blur', hideSlider);

  button.onclick = deleteRatio;
  div.appendChild(sw);
  div.appendChild(input);
  div.appendChild(button);
  ratios.appendChild(div);

  // Can I increment these id's? Need a way to assign swatch
  // background color to the output, which is not dependent upon
  // any of these ids.
  // var list = document.getElementsByClassName("something");
  // for (var i = 0; i < list.length; i++) {
  //  list[i].setAttribute("id", "box" + i);
  // }
}


// Delete ratio input
function deleteRatio(e) {
  var id = e.target.parentNode.id;
  var self = document.getElementById(id);
  var sliderid = id + '-slider';
  var slider = document.getElementById(sliderid);

  self.remove();
}

function randomId() {
   return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

function createSlider(x, v) {
  var sliderWrapper = document.getElementById('sliderWrapper');
  var slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = v;
  slider.step = '.01';
  slider.oninput = syncInputVal;
  slider.className = 'slider'
  slider.id = x + "-sl";
  // slider.style.display = 'none';

  sliderWrapper.appendChild(slider);
}


// function showSlider() {
//   var id = this.id;
//   var slider = document.getElementById(id + '-sl');
//   if (this.focus || slider.focus) {
//     slider.style.display = 'block';
//   } else {
//     slider.style.display = 'none';
//   }
// }
// function hideSlider() {
//   // var id = this.id;
//   // var slider = document.getElementById(id + '-sl');
//   if (this.focus) {
//     this.style.display = 'none';
//   } else {
//     this.style.display = 'block';
//   }
// }
function syncVal() {
  id = this.id;
  slider = document.getElementById(id + '-sl');
  c = this.value;
  slider.value = c;
}
function syncInputVal() {
  id = this.id;
  inputId = id.substring(0, id.length - 3);
  input = document.getElementById(inputId);
  // TODO: this should not be done this way.
  // Slider should use previous method of deterimining
  // position relative to color domain of swatches.
  // In this function, then calculate ratio & return ratio as value input?
  input.value = this.value;
}

function createDemo(c, z) {
  wrap = document.getElementById('demoWrapper');
  item = document.createElement('div');
  item.className = 'demoItem';
  demo = document.createElement('div');
  demo.className = 'spectrum-Typography demo';
  h = document.createElement('h4');
  h.className = 'spectrum-Heading2 demoHeading';
  title = document.createTextNode('Large text');
  p = document.createElement('p');
  p.className = 'spectrum-Body3 demoText';
  text = document.createTextNode('Small text demonstration');
  b = document.createElement('button');
  b.className = 'spectrum-Button demoButton';
  label = document.createTextNode('Button');

  h.appendChild(title);
  p.appendChild(text);
  b.appendChild(label);
  demo.appendChild(h);
  demo.appendChild(p);
  demo.appendChild(b);

  demoIn = document.createElement('div');
  demoIn.className = 'spectrum-Typography demoInverted';
  hIn = document.createElement('h4');
  hIn.className = 'spectrum-Heading2 demoHeading';
  pIn = document.createElement('p');
  pIn.className = 'spectrum-Body3 demoText';
  bIn = document.createElement('button');
  bIn.className = 'spectrum-Button demoButton';
  titleIn = document.createTextNode('Large text');
  textIn = document.createTextNode('Small text demonstration');
  labelIn = document.createTextNode('Button');

  hIn.appendChild(titleIn);
  pIn.appendChild(textIn);
  bIn.appendChild(labelIn);
  demoIn.appendChild(hIn);
  demoIn.appendChild(pIn);
  demoIn.appendChild(bIn);

  item.appendChild(demo);
  item.appendChild(demoIn);
  wrap.appendChild(item);

  demoIn.style.backgroundColor = c;
  demoIn.style.color = z;
  demo.style.color = c;
  p.style.color = c;
  h.style.color = c;
  b.style.color = c;
  b.style.borderColor = c;
  pIn.style.color = z;
  hIn.style.color = z;
  bIn.style.color = z;
  bIn.style.borderColor = z;
}

function colorspaceOptions() {
  colorspace = document.getElementById('mode');
  colorspace.options.length = 0;

  opts = {
    'LCH': 'Lch',
    'LAB': 'Lab',
    'CAM02': 'CIECAM02',
    'HSL': 'HSL',
    'HSLuv': 'HSLuv',
    'RGB': 'RGB'
  };

  for(index in opts) {
    colorspace.options[colorspace.options.length] = new Option(opts[index], index);
  }
}
// colorspaceOptions();

// Calculate Color and generate Scales
function colorInput() {
  document.getElementById('colors').innerHTML = '';

  // var slider = document.getElementById('Slider');
  background = document.getElementById('bgField').value;
  var customTintShade = document.getElementById('tintShades');
  var color1 = colorField1.value;
  var colorTint = colorField2.value;
  var colorShade = colorField3.value;
  var mode = document.querySelector('select[name="mode"]').value;
  // Gather input values for each input. Add those into array.
  var ratioFields = document.getElementsByClassName('ratioField');
  var ratioInputs = [];

  // For each ratio input field, push the value into the args array for adaptcolor
  for(i=0; i < ratioFields.length; i++) {
    ratioInputs.push(ratioFields[i].value);
  }

  adaptcolor({color: color1, base: background, ratios: ratioInputs, tint: colorTint, shade: colorShade, colorspace: mode});
  // document.getElementById('sliderWrapper').innerHTML = ' ';

  for(i=0; i<newColors.length; i++) {
    colorblock(newColors[i])
    // Calculate value of color and apply to slider position/value
    var val = d3.hsluv(newColors[i]).v;
    // createSlider(randomId(), val);
  }

  // Generate Gradient
  for (var i = 0; i < colors.length; i++) {
    var container = document.getElementById('colors');
    var div = document.createElement('div');
    div.className = 'block';
    div.style.backgroundColor = colors[i];

    container.appendChild(div);
  }

  var backgroundR = d3.rgb(background).r;
  var backgroundG = d3.rgb(background).g;
  var backgroundB = d3.rgb(background).b;

  backgroundblock(background);

  // Slider updates
  // var sliderPos = document.getElementById('Slider').value;
  // var colorDomainUpdate =  swatches - (swatches * sliderPos /500);
  // var newRgb = colors[colorDomainUpdate];
  // var contrastRatio2 = contrast([backgroundR, backgroundG, backgroundB], [d3.rgb(newRgb).r, d3.rgb(newRgb).g, d3.rgb(newRgb).b]).toFixed(2);

  // newHex = d3.rgb(newRgb).formatHex();
  // colorOutputField.value = newRgb + '\n' + newHex + '\n' + contrastRatio2 + ":1";
  var colorOutputWrapper = document.getElementById('colorOutputs');
  colorOutputWrapper.innerHTML = '';
  wrap = document.getElementById('demoWrapper');
  wrap.innerHTML = '';

  for (i = 0; i < newColors.length; i++) {
    var colorOutput = document.createElement('div');
    var colorOutputVal = newColors[i];
    var colorOutputText = document.createTextNode(d3.rgb(colorOutputVal).hex());
    var bg = d3.color(background).rgb();
    var outputRatio = contrast([d3.rgb(newColors[i]).r, d3.rgb(newColors[i]).g, d3.rgb(newColors[i]).b], [bg.r, bg.g, bg.b]);
    var ratioText = document.createTextNode(outputRatio.toFixed(2));
    var s1 = document.createElement('span');
    var s2 = document.createElement('span');

    colorOutputWrapper.appendChild(colorOutput);
    colorOutput.className = 'colorOutputBlock';
    colorOutput.style.backgroundColor = colorOutputVal;
    s1.appendChild(colorOutputText);
    s2.appendChild(ratioText);
    colorOutput.appendChild(s1);
    colorOutput.appendChild(s2);

    if (luminance(d3.rgb(newColors[i]).r, d3.rgb(newColors[i]).g, d3.rgb(newColors[i]).b) < 0.275) {
      colorOutput.style.color = "#ffffff";
    } else {
      colorOutput.style.color = '#000000';
    }
    createDemo(newColors[i], background);
  }

  // update URL parameters
  updateParams(color1.substr(1), background.substr(1), colorTint.substr(1), colorShade.substr(1), ratioInputs, mode);
}
colorInput(color1);


// Passing variable parameters to URL https://googlechrome.github.io/samples/urlsearchparams/?foo=2
function updateParams(c, b, t, s, r, m) {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));

  params.set('color', c);
  params.set('base', b);
  params.set('tint', t);
  params.set('shade', s);
  params.set('ratios', r);
  params.set('mode', m);

  window.history.replaceState({}, '', '/?' + params); // update the page's URL.

  var p = document.getElementById('params');
  p.innerHTML = " ";
  var call = 'adaptcolor({';
  var pcol = 'color: "#' + c + '",';
  var pbas = 'base: "#'+ b + '",';
  var prat = 'ratios: [' + r + '],';
  var ptin = 'tint: "#' + t + '",';
  var psha = 'shade: "#' + s + '",';
  var pmod = ' colorspace: "' + m + '",';
  text1 = document.createTextNode(call);
  text2 = document.createTextNode(pcol);
  text3 = document.createTextNode(pbas);
  text4 = document.createTextNode(prat);
  text5 = document.createTextNode(ptin);
  text6 = document.createTextNode(psha);
  text7 = document.createTextNode(pmod);
  p.appendChild(text1);
  p.appendChild(text2);
  p.appendChild(text3);
  p.appendChild(text4);
  p.appendChild(text5);
  p.appendChild(text6);
  p.appendChild(text7);
}
