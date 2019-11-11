// Copyright 2019 Adobe. All rights reserved.
// This file is licensed to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may obtain a copy
// of the License at http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under
// the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
// OF ANY KIND, either express or implied. See the License for the specific language
// governing permissions and limitations under the License.

// var colorField = document.getElementById('colorField1');

var background = document.getElementById('bgField').value;
// var colorBlock = document.getElementById('color');
var demoHeading = document.getElementById('demoHeading');
var demoWrapper = document.getElementById('demoWrapper');
var userColorBlock = document.getElementById('userColor');
var userBgBlock = document.getElementById('userBg');
var ratioInput = document.getElementById('ratio');
var colorOutputField = document.getElementById('colorOutput');

function paramSetup() {
  colorspaceOptions();
  paletteTypeOptions();
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));
  pathName = url.pathname;

  // // If parameters exist, use parameter; else use default html input values
  if(params.has('colorKeys')) {
    // document.getElementById('inputColors').value = "#" + params.get('color');
    // document.getElementById('variableColors').value = params.get('color');
    cr = params.get('colorKeys');
    crs = cr.split(',');

    if(crs[0] == 0) {
      crs = ['#ffff00', '#f26322'];
    } else { }

    for (i=0; i<crs.length; i++) {
      addColor(crs[i]);
    }
  }
  if(params.has('base')) {
    document.getElementById('bgField').value = "#" + params.get('base');
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

// Add ratio inputs
function addRatio(v, s = '#cacaca') {
  // increment by default
  if(v == undefined) {
    // find highest value
    var hi = Math.max(...ratioInputs);
    var lo = Math.min(...ratioInputs);

    if(hi < 20) {
      v = Number(hi + 1).toFixed(2);
    }
    if(hi == 21) {
      v = Number(hi - 1).toFixed(2);
    }
  }

  var ratios = document.getElementById('ratios');
  var div = document.createElement('div');
  var sliderWrapper = document.getElementById('sliderWrapper');
  var slider = document.createElement('input');

  var randId = randomId();
  div.className = 'color-Item';
  div.id = randId + '-item';
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
  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton spectrum-ActionButton--quiet';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = v;
  slider.step = '.01';
  slider.className = 'slider'
  slider.id = randId + "-sl";
  slider.disabled = true;
  sliderWrapper.appendChild(slider);

  button.onclick = deleteRatio;
  div.appendChild(sw);
  div.appendChild(input);
  div.appendChild(button);
  ratios.appendChild(div);
}

function updateVal(e) {
  var parent = e.target.parentNode.id;
  var id = parent.replace('-item', '');
  var sw = parent.replace('-item', '-sw');
  var input = document.getElementById(id);
  v = document.getElementById(sw).value

  input.value = v;
  colorInput();
}

function newColor(e) {
  var parent = e.target.parentNode.id;
  var id = parent.replace('-item', '');
  var self = document.getElementById(id);
  var v = self.value;
  var swId = parent.replace('-item', '-sw');
  var sw = document.getElementById(swId);

  if (v.startsWith("#") !== true && v.length == 6) {
    h = '#';
    v = h.concat(v);
    self.value = v;
  }

  sw.value = v;

  colorInput();
}

function addColor(s = '#cacaca') {
  var colorInputs = document.getElementById('colorInputWrapper');
  var div = document.createElement('div');

  var randId = randomId();
  div.className = 'color-Item';
  div.id = randId + '-item';
  // var sw = document.createElement('span');
  var sw = document.createElement('input');
  sw.type = "color";
  sw.value = s;
  sw.oninput = colorInput;

  sw.className = 'colorInput inputColorField';
  sw.id = randId + '-sw';
  sw.style.backgroundColor = s;

  input = document.createElement('input');
  input.className = 'spectrum-Textfield inputColorField';
  input.type = "text";
  input.placeholder = '#ff00ff';
  input.id = randId;
  input.value = s;
  input.onchange = newColor;
  var button = document.createElement('button');
  button.className = 'spectrum-ActionButton';
  button.innerHTML = `
  <svg class="spectrum-Icon spectrum-Icon--sizeS" focusable="false" aria-hidden="true" aria-label="Delete">
    <use xlink:href="#spectrum-icon-18-Delete" />
  </svg>`;

  button.onclick = deleteColor;
  div.appendChild(sw);
  // div.appendChild(input);
  div.appendChild(button);
  colorInputs.appendChild(div);
}


// When adding new ratios in UI, run colorinput as well
function addNewRatio() {
  addRatio();
  colorInput();
}

function addNewColor() {
  addColor();
  colorInput();
}

// Delete ratio input
function deleteRatio(e) {
  var id = e.target.parentNode.id;
  var self = document.getElementById(id);
  var sliderid = id.replace('-item', '') + '-sl';
  var slider = document.getElementById(sliderid);

  self.remove();
  slider.remove();
  colorInput();
}
function deleteColor(e) {
  var id = e.target.parentNode.id;
  var self = document.getElementById(id);

  self.remove();
  colorInput();
}

// function panelTab(evt, tabName) {
//   // Declare all variables
//   var i, tabcontent, tablinks;
//
//   // Get all elements with class="tabcontent" and hide them
//   tabcontent = document.getElementsByClassName("paneltabcontent");
//   for (i = 0; i < tabcontent.length; i++) {
//     tabcontent[i].style.display = "none";
//   }
//
//   // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
//   tablinks = document.getElementsByClassName("panel-Tab-item");
//   for (i = 0; i < tablinks.length; i++) {
//     tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
//   }
//
//   // Show the current tab, and add an "active" class to the button that opened the tab
//   document.getElementById(tabName).style.display = "flex";
//   evt.currentTarget.className += " is-selected";
// }

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="spectrum-Tabs-item" and remove the class "active"
  tablinks = document.getElementsByClassName("main-Tabs-item");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-selected", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "flex";
  evt.currentTarget.className += " is-selected";
}

// Open default tabs
// document.getElementById("tabColorScale").click();
document.getElementById("tabDemo").click();


function randomId() {
   return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

function createDemo(c, z) {
  var smallText = 'Small text demo';
  var largeText = 'Large text';
  var buttonText = 'Button';

  wrap = document.getElementById('demoWrapper');
  item = document.createElement('div');
  item.className = 'demoItem';
  demo = document.createElement('div');
  demo.className = 'spectrum-Typography demo';
  h = document.createElement('h4');
  h.className = 'spectrum-Heading2 demoHeading';
  title = document.createTextNode(largeText);
  p = document.createElement('p');
  p.className = 'spectrum-Body3 demoText';
  text = document.createTextNode(smallText);
  b = document.createElement('button');
  b.className = 'spectrum-Button demoButton';
  bF = document.createElement('button');
  bF.className = 'spectrum-Button demoButton';
  label = document.createTextNode(buttonText);
  label2 = document.createTextNode(buttonText);

  h.appendChild(title);
  p.appendChild(text);
  b.appendChild(label);
  bF.appendChild(label2);
  demo.appendChild(h);
  demo.appendChild(p);
  demo.appendChild(b);
  demo.appendChild(bF);

  demoIn = document.createElement('div');
  demoIn.className = 'spectrum-Typography demoInverted';
  hIn = document.createElement('h4');
  hIn.className = 'spectrum-Heading2 demoHeading';
  pIn = document.createElement('p');
  pIn.className = 'spectrum-Body3 demoText';
  bIn = document.createElement('button');
  bIn.className = 'spectrum-Button demoButton';
  bFIn = document.createElement('button');
  bFIn.className = 'spectrum-Button demoButton';
  titleIn = document.createTextNode('Large text');
  textIn = document.createTextNode(smallText);
  labelIn = document.createTextNode(buttonText);
  labelIn2 = document.createTextNode(buttonText);

  hIn.appendChild(titleIn);
  pIn.appendChild(textIn);
  bIn.appendChild(labelIn);
  bFIn.appendChild(labelIn2);
  demoIn.appendChild(hIn);
  demoIn.appendChild(pIn);
  demoIn.appendChild(bIn);
  demoIn.appendChild(bFIn);

  item.appendChild(demo);
  item.appendChild(demoIn);
  wrap.appendChild(item);

  demoIn.style.backgroundColor = c;
  demoIn.style.color = z;
  demo.style.color = c;
  p.style.color = c;
  h.style.color = c;
  b.style.color = c;
  bF.style.backgroundColor = c;
  bF.style.borderColor = c;
  bF.style.color = z;
  bFIn.style.color = c;
  bFIn.style.backgroundColor = z;
  bFIn.style.borderColor = z;
  b.style.borderColor = c;
  pIn.style.color = z;
  hIn.style.color = z;
  bIn.style.color = z;
  bIn.style.borderColor = z;

  demoWrapper.style.backgroundColor = z;
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
    'HSV': 'HSV',
    'RGB': 'RGB'
  };

  for(index in opts) {
    colorspace.options[colorspace.options.length] = new Option(opts[index], index);
  }
}

function paletteTypeOptions() {
  paletteType = document.getElementById('paletteType');
  paletteType.options.length = 0;

  opts = {
    'Contrast': 'Contrast Based',
    'Sequential': 'Sequential'
  };

  for(index in opts) {
    paletteType.options[paletteType.options.length] = new Option(opts[index], index);
  }

  paletteType.value = 'Contrast';
}

function changePalette() {
  var paletteType = document.getElementById('paletteType').value;
  var wrapSequence = document.getElementById('sequentialWrapper');
  var wrapRatio = document.getElementById('ratiosWrapper');
  var sliders = document.getElementById('sliderWrapper');

  if (paletteType == 'Contrast') {
    wrapSequence.style.display = 'none';
    wrapRatio.style.display = 'flex';
    sliders.style.display = 'flex';
  }
  if (paletteType == 'Sequential') {
    wrapSequence.style.display = 'flex';
    wrapRatio.style.display = 'none';
    sliders.style.display = 'none';
  }

  colorInput();
}

// Calculate Color and generate Scales
function colorInput() {
  document.getElementById('colors').innerHTML = '';
  document.getElementById('chart1').innerHTML = ' ';
  document.getElementById('chart2').innerHTML = ' ';
  document.getElementById('chart3').innerHTML = ' ';
  document.getElementById('contrastChart').innerHTML = ' ';
  var paletteType = document.getElementById('paletteType').value;
  var swatchAmmount = document.getElementById('swatchAmmount').value;
  var shiftInputValue = document.getElementById('shiftInputValue');
  shiftInputValue.innerHTML = ' ';

  var inputs = document.getElementsByClassName('inputColorField');
  // var inputColors = inputs.split(" ");
  var background = document.getElementById('bgField').value;
  mode = document.querySelector('select[name="mode"]').value;
  ratioFields = document.getElementsByClassName('ratioField');

  // Clamp ratios convert decimal numbers to whole negatives and disallow
  // inputs less than 1 and greater than -1.
  for(i=0; i<ratioFields.length; i++) {
    val = ratioFields[i].value;
    if (val < 1 && val > -1) {
      ratioFields[i].value = (10 / (val * 10)).toFixed(2) * -1;
    } else { }
  }

  var rfIds = []
  for (i=0; i<ratioFields.length; i++) {
    rfIds.push(ratioFields[i].id);
  }
  ratioInputs = [];
  inputColors = [];

  // For each ratio input field, push the value into the args array for generateContrastColors
  for(i=0; i < ratioFields.length; i++) {
    ratioInputs.push(ratioFields[i].value);
  }
  for(i=0; i<inputs.length; i++) {
    inputColors.push(inputs[i].value);
  }

  // Convert input value into a split array of hex values.
  tempArgs = [];
  // remove any whitespace from inputColors
  tempArgs.push(inputColors);
  colorArgs = tempArgs.join("").split(',').filter(String);
  // console.log(colorArgs);
  var shift = document.getElementById('shiftInput').value;
  shiftInputValue.innerHTML = shift;

  if (paletteType == 'Contrast') {
    generateContrastColors({colorKeys: colorArgs, base: background, ratios: ratioInputs, colorspace: mode, shift: shift});
  }
  if (paletteType == 'Sequential') {
    var clamping = document.getElementById('sequentialClamp').checked;
    if (clamping == true) {
      noClamp = false;
    } else {
      noClamp = true;
    }
    newColors = createScale({swatches: swatchAmmount, colorKeys: colorArgs, colorspace: mode, shift: shift, fullScale: noClamp});

  }
  // generateContrastColors({colorKeys: colorArgs, base: background, ratios: ratioInputs, colorspace: mode, shift: shift});

  Values = [];
  maxVal = 100;

  for(i=0; i < newColors.length; i++){
    Values.push(maxVal * (d3.hsluv(newColors[i]).v / 100)) // wrong direction. Needs inversed.
    // Values.push(maxVal * (d3.hsluv(newColors[i]).v / 100))
  }
  // Values.sort(function(a, b){return a-b});
  // Values.sort(function(a, b){return a-b});

  var values = [];
  values = values.concat(0, Values, maxVal);
  values.sort(function(a, b){return a+b});
  var reverseShift = 1 / shift;

  var sqrtValues = d3.scalePow()
    .exponent(reverseShift)
    .domain([1, maxVal])
    .range([1, maxVal]);

  sqrtValues = values.map(function(d) {
    if(sqrtValues(d) < 0) {
      return 0;
    } else {
      return sqrtValues(d);
    }
  })

  // Then, remove first and last value from sqrtValues array to get slider values
  if (paletteType == 'Contrast') {
    for(i=0; i<newColors.length; i++) {
      // Calculate value of color and apply to slider position/value
      var val = d3.hsluv(newColors[i]).v;

      var newVal = sqrtValues[i+1];

      val = newVal;
      // Find corresponding input/slider id
      var slider = document.getElementById(rfIds[i] + '-sl')
      slider.value = val;

      // apply color to subsequent swatch
      var swatch = document.getElementById(rfIds[i] + '-sw')
      swatch.style.backgroundColor = newColors[i];
    }
  }

  // Generate Gradient
  if (paletteType == 'Sequential') {
    var gradientColors = createScale({swatches: 3000, colorKeys: colorArgs, colorspace: mode, shift: shift});

    for (var i = 0; i < gradientColors.length; i++) {
      var container = document.getElementById('colors');
      var div = document.createElement('div');
      div.className = 'block';
      div.style.backgroundColor = gradientColors[i];

      container.appendChild(div);
    }
  } else {
    for (var i = 0; i < colors.length; i++) {
      var container = document.getElementById('colors');
      var div = document.createElement('div');
      div.className = 'block';
      div.style.backgroundColor = colors[i];

      container.appendChild(div);
    }
  }


  var backgroundR = d3.rgb(background).r;
  var backgroundG = d3.rgb(background).g;
  var backgroundB = d3.rgb(background).b;

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
    colorOutput.setAttribute('data-clipboard-text', colorOutputVal);
    s1.appendChild(colorOutputText);
    s1.className = 'colorOutputValue';
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

  var copyColors = document.getElementById('copyAllColors');
  copyColors.setAttribute('data-clipboard-text', newColors);

  colors = colors;
  createData();
  createAllCharts();

  // update URL parameters
  updateParams(inputColors, background.substr(1), ratioInputs, mode);
}
colorInput();

function createAllCharts() {
  var chart3 = document.getElementById('chart3Wrapper');

  if(mode=="LCH") {
    // createChartHeader('Lightness', 'chart1');
    // createChart(lchDataL, "#chart1");
    createChartHeader('Chroma', 'chart1');
    createChart(lchDataC, "#chart1");
    createChartHeader('Hue', 'chart2');
    createChart(lchDataH, "#chart2");
    chart3.style.display = 'none';
  }
  if(mode=="LAB") {
    // createChartHeader('Lightness', 'chart1');
    // createChart(labDataL, "#chart1");
    createChartHeader('Green / Red', 'chart1');
    createChart(labDataA, "#chart1");
    createChartHeader('Blue / Yellow', 'chart2');
    createChart(labDataB, "#chart2");
    chart3.style.display = 'none';
  }
  if(mode=="CAM02") {
    // createChartHeader('Lightness', 'chart1');
    // createChart(camDataJ, "#chart1");
    createChartHeader('Green / Red', 'chart1');
    createChart(camDataA, "#chart1");
    createChartHeader('Blue / Yellow', 'chart2');
    createChart(camDataB, "#chart2");
    chart3.style.display = 'none';
  }
  if(mode=="HSL") {
    createChartHeader('Hue', 'chart1');
    createChart(hslDataH, "#chart1");
    createChartHeader('Saturation', 'chart2');
    createChart(hslDataS, "#chart2");
    // createChartHeader('Lightness', 'chart3');
    // createChart(hslDataL, "#chart3");
    chart3.style.display = 'none';
  }
  if(mode=="HSLuv") {
    createChartHeader('Hue', 'chart1');
    createChart(hsluvDataL, "#chart1");
    createChartHeader('Saturation', 'chart2');
    createChart(hsluvDataU, "#chart2");
    // createChartHeader('Lightness', 'chart3');
    // createChart(hsluvDataV, "#chart3");
    chart3.style.display = 'none';
  }
  if(mode=="HSV") {
    createChartHeader('Hue', 'chart1');
    createChart(hsvDataH, "#chart1");
    createChartHeader('Saturation', 'chart2');
    createChart(hsvDataS, "#chart2");
    // createChartHeader('Lightness', 'chart3');
    // createChart(hsvDataL, "#chart3");
    chart3.style.display = 'none';
  }
  if(mode=="RGB") {
    createChartHeader('Red', 'chart1');
    createChart(rgbDataR, "#chart1");
    createChartHeader('Green', 'chart2');
    createChart(rgbDataG, "#chart2");
    createChartHeader('Blue', 'chart3');
    createChart(rgbDataB, "#chart3");
  }
  createChart(contrastData, "#contrastChart");

  init3dChart();
}
// Passing variable parameters to URL
function updateParams(c, b, r, m) {
  let url = new URL(window.location);
  let params = new URLSearchParams(url.search.slice(1));

  params.set('colorKeys', c);
  params.set('base', b);
  params.set('ratios', r);
  params.set('mode', m);

  // retain pathname if present
  if(pathName == '/') {
    window.history.replaceState({}, '', '/?' + params); // update the page's URL.
  } else {
    window.history.replaceState({}, '', pathName + '/?' + params); // update the page's URL.
  }

  var p = document.getElementById('params');
  p.innerHTML = " ";
  var call = 'generateContrastColors({ ';
  var pcol = 'colorKeys: [' + c + '], ';
  var pbas = 'base: "#'+ b + '", ';
  var prat = 'ratios: [' + r + '], ';
  var pmod = ' colorspace: "' + m + '"});';
  text1 = document.createTextNode(call);
  text2 = document.createTextNode(pcol);
  text3 = document.createTextNode(pbas);
  text4 = document.createTextNode(prat);
  text7 = document.createTextNode(pmod);
  p.appendChild(text1);
  p.appendChild(text2);
  p.appendChild(text3);
  p.appendChild(text4);
  p.appendChild(text7);
}

// Create data based on colorspace
function createData() {
  CAM_J = [];
  CAM_A = [];
  CAM_B = [];
  LAB_L = [];
  LAB_A = [];
  LAB_B = [];
  LCH_L = [];
  LCH_C = [];
  LCH_H = [];
  HSL_H = [];
  HSL_S = [];
  HSL_L = [];
  HSV_H = [];
  HSV_S = [];
  HSV_L = [];
  HSLuv_L = [];
  HSLuv_U = [];
  HSLuv_V = [];
  RGB_R = [];
  RGB_G = [];
  RGB_B = [];

  for(i=4; i<colors.length -8; i++) { // Clip array to eliminate NaN values
    CAM_J.push(d3.jab(colors[i]).J);
    CAM_A.push(d3.jab(colors[i]).a);
    CAM_B.push(d3.jab(colors[i]).b);
    LAB_L.push(d3.lab(colors[i]).l);
    LAB_A.push(d3.lab(colors[i]).a);
    LAB_B.push(d3.lab(colors[i]).b);
    LCH_L.push(d3.hcl(colors[i]).l);
    LCH_C.push(d3.hcl(colors[i]).c);
    LCH_H.push(d3.hcl(colors[i]).h);
    RGB_R.push(d3.rgb(colors[i]).r);
    RGB_G.push(d3.rgb(colors[i]).g);
    RGB_B.push(d3.rgb(colors[i]).b);
    HSL_H.push(d3.hsl(colors[i]).h);
    HSL_S.push(d3.hsl(colors[i]).s);
    HSL_L.push(d3.hsl(colors[i]).l);
    HSV_H.push(d3.hsl(colors[i]).h);
    HSV_S.push(d3.hsl(colors[i]).s);
    HSV_L.push(d3.hsl(colors[i]).l);
    HSLuv_L.push(d3.hsluv(colors[i]).l);
    HSLuv_U.push(d3.hsluv(colors[i]).u);
    HSLuv_V.push(d3.hsluv(colors[i]).v);
  }

  CAMArrayJ = [];
  CAMArrayA = [];
  CAMArrayB = [];
  LABArrayL = [];
  LABArrayA = [];
  LABArrayB = [];
  LCHArrayL = [];
  LCHArrayC = [];
  LCHArrayH = [];
  RGBArrayR = [];
  RGBArrayG = [];
  RGBArrayB = [];
  HSLArrayH = [];
  HSLArrayS = [];
  HSLArrayL = [];
  HSVArrayH = [];
  HSVArrayS = [];
  HSVArrayL = [];
  HSLuvArrayL = [];
  HSLuvArrayU = [];
  HSLuvArrayV = [];

  // Shorten the numbers in the array for chart purposes
  var maxVal = 50;
  var delta = Math.floor( CAM_J.length / maxVal );

  for (i = 0; i < CAM_J.length; i=i+delta) {
    CAMArrayJ.push(CAM_J[i]);
  }
  for (i = 0; i < CAM_A.length; i=i+delta) {
    CAMArrayA.push(CAM_A[i]);
  }
  for (i = 0; i < CAM_B.length; i=i+delta) {
    CAMArrayB.push(CAM_B[i]);
  }
  for (i = 0; i < LAB_L.length; i=i+delta) {
    LABArrayL.push(LAB_L[i]);
  }
  for (i = 0; i < LAB_A.length; i=i+delta) {
    LABArrayA.push(LAB_A[i]);
  }
  for (i = 0; i < LAB_B.length; i=i+delta) {
    LABArrayB.push(LAB_B[i]);
  }
  for (i = 0; i < LCH_L.length; i=i+delta) {
    LCHArrayL.push(LCH_L[i]);
  }
  for (i = 0; i < LCH_C.length; i=i+delta) {
    LCHArrayC.push(LCH_C[i]);
  }
  for (i = 0; i < LCH_H.length; i=i+delta) {
    LCHArrayH.push(LCH_H[i]);
  }
  for (i = 0; i < RGB_R.length; i=i+delta) {
    RGBArrayR.push(RGB_R[i]);
  }
  for (i = 0; i < RGB_G.length; i=i+delta) {
    RGBArrayG.push(RGB_G[i]);
  }
  for (i = 0; i < RGB_B.length; i=i+delta) {
    RGBArrayB.push(RGB_B[i]);
  }
  for (i = 0; i < HSL_H.length; i=i+delta) {
    HSLArrayH.push(HSL_H[i]);
  }
  for (i = 0; i < HSL_S.length; i=i+delta) {
    HSLArrayS.push(HSL_S[i]);
  }
  for (i = 0; i < HSL_L.length; i=i+delta) {
    HSLArrayL.push(HSL_L[i]);
  }
  for (i = 0; i < HSV_H.length; i=i+delta) {
    HSVArrayH.push(HSV_H[i]);
  }
  for (i = 0; i < HSV_S.length; i=i+delta) {
    HSVArrayS.push(HSV_S[i]);
  }
  for (i = 0; i < HSV_L.length; i=i+delta) {
    HSVArrayL.push(HSV_L[i]);
  }
  for (i = 0; i < HSLuv_L.length; i=i+delta) {
    HSLuvArrayL.push(HSLuv_L[i]);
  }
  for (i = 0; i < HSLuv_U.length; i=i+delta) {
    HSLuvArrayU.push(HSLuv_U[i]);
  }
  for (i = 0; i < HSLuv_V.length; i=i+delta) {
    HSLuvArrayV.push(HSLuv_V[i]);
  }

  const fillRange = (start, end) => {
    return Array(end - start + 1).fill().map((item, index) => start + index);
  };

  dataX = fillRange(0, CAMArrayJ.length - 1);
  dataXcyl = fillRange(0, LCHArrayL.length - 1);
  dataXcontrast = fillRange(0, ratioInputs.length - 1);

  labFullData = [
    {
      x: LABArrayL,
      y: LABArrayA,
      z: LABArrayB
    }
  ];

  camDataJ = [
    {
      x: dataX,
      y: CAMArrayJ
    }
  ];
  camDataA = [
    {
      x: dataX,
      y: CAMArrayA
    }
  ];
  camDataB = [
    {
      x: dataX,
      y: CAMArrayB
    }
  ];
  labDataL = [
    {
      x: dataX,
      y: LABArrayL
    }
  ];
  labDataA = [
    {
      x: dataX,
      y: LABArrayA
    }
  ];
  labDataB = [
    {
      x: dataX,
      y: LABArrayB
    }
  ];
  lchDataL = [
    {
      x: dataX,
      y: LCHArrayL
    }
  ];
  lchDataC = [
    {
      x: dataX,
      y: LCHArrayC
    }
  ];
  lchDataH = [
    {
      x: dataXcyl,
      y: LCHArrayH
    }
  ];
  rgbDataR = [
    {
      x: dataX,
      y: RGBArrayR
    }
  ];
  rgbDataG = [
    {
      x: dataX,
      y: RGBArrayG
    }
  ];
  rgbDataB = [
    {
      x: dataX,
      y: RGBArrayB
    }
  ];
  hslDataH = [
    {
      x: dataXcyl,
      y: HSLArrayH
    }
  ];
  hslDataS = [
    {
      x: dataX,
      y: HSLArrayS
    }
  ];
  hslDataL = [
    {
      x: dataX,
      y: HSLArrayL
    }
  ];
  hsvDataH = [
    {
      x: dataXcyl,
      y: HSVArrayH
    }
  ];
  hsvDataS = [
    {
      x: dataX,
      y: HSVArrayS
    }
  ];
  hsvDataL = [
    {
      x: dataX,
      y: HSVArrayL
    }
  ];
  hsluvDataL = [
    {
      x: dataX,
      y: HSLuvArrayL
    }
  ];
  hsluvDataU = [
    {
      x: dataX,
      y: HSLuvArrayU
    }
  ];
  hsluvDataV = [
    {
      x: dataX,
      y: HSLuvArrayV
    }
  ];
  contrastData = [
    {
      x: dataXcontrast,
      y: ratioInputs
    }
  ]
}



function createChartHeader(x, dest) {
  container = document.getElementById(dest);
  subhead = document.createElement('h6');
  subhead.className = 'spectrum-Subheading';
  title = document.createTextNode(x);
  subhead.appendChild(title);
  container.appendChild(subhead);
}

// Make color charts
function createChart(data, dest) {
  var data = data;
  var xy_chart = d3_xy_chart()
      .width(createChartWidth())
      // .height(120)
      .height(createChartHeight())
      .xlabel("X Axis")
      .ylabel("Y Axis") ;
  var svg = d3.select(dest).append("svg")
      .datum(data)
      .call(xy_chart) ;

  function d3_xy_chart() {
      var width = createChartWidth(),
          height = createChartHeight(),
        // height = 100,
          xlabel = "X Axis Label",
          ylabel = "Y Axis Label" ;

      function chart(selection) {
          selection.each(function(datasets) {
              //
              // Create the plot.
              //
              var margin = {top: 8, right: 0, bottom: 20, left: 0},
                  innerwidth = width - margin.left - margin.right,
                  innerheight = height - margin.top - margin.bottom ;

              var x_scale = d3.scaleLinear()
                  .range([0, innerwidth])
                  .domain([ d3.min(datasets, function(d) { return d3.min(d.x); }),
                            d3.max(datasets, function(d) { return d3.max(d.x); }) ]) ;

              var y_scale = d3.scaleLinear()
                  .range([innerheight, 0])
                  .domain([ d3.min(datasets, function(d) { return d3.min(d.y); }),
                            d3.max(datasets, function(d) { return d3.max(d.y); }) ]) ;

              var color_scale = d3.scaleOrdinal(d3.schemeCategory10)
                  .domain(d3.range(datasets.length)) ;

              var x_axis = d3.axisBottom(x_scale);

              var y_axis = d3.axisLeft(y_scale);

              var x_grid = d3.axisBottom(x_scale)
                  .tickSize(-innerheight)
                  .tickFormat("") ;

              var y_grid = d3.axisLeft(y_scale)
                  .tickSize(-innerwidth)
                  .tickFormat("") ;

              var draw_line = d3.line()
                  .curve(d3.curveLinear)
                  .x(function(d) { return x_scale(d[0]); })
                  .y(function(d) { return y_scale(d[1]); }) ;

              var svg = d3.select(this)
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;

              svg.append("g")
                  .attr("class", "x grid")
                  .attr("transform", "translate(0," + innerheight + ")")
                  .call(x_grid) ;

              svg.append("g")
                  .attr("class", "y grid")
                  .call(y_grid) ;

              svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + innerheight + ")")
                  .call(x_axis)
                  .append("text")
                  .attr("dy", "-.71em")
                  .attr("x", innerwidth)
                  .style("text-anchor", "end")
                  .text(xlabel) ;

              svg.append("g")
                  .attr("class", "y axis")
                  .call(y_axis)
                  .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", "0.71em")
                  .style("text-anchor", "end")
                  .text(ylabel) ;

              var data_lines = svg.selectAll(".d3_xy_chart_line")
                  .data(datasets.map(function(d) {return d3.zip(d.x, d.y);}))
                  .enter().append("g")
                  .attr("class", "d3_xy_chart_line") ;

              data_lines.append("path")
                  .attr("class", "line")
                  .attr("d", function(d) {return draw_line(d); })
                  .attr("stroke", function(_, i) {return color_scale(i);}) ;

              data_lines.append("text")
                  .datum(function(d, i) { return {name: datasets[i].label, final: d[d.length-1]}; })
                  .attr("transform", function(d) {
                      return ( "translate(" + x_scale(d.final[0]) + "," +
                               y_scale(d.final[1]) + ")" ) ; })
                  .attr("x", 3)
                  .attr("dy", ".35em")
                  .attr("fill", function(_, i) { return color_scale(i); })
                  .text(function(d) { return d.name; }) ;

          }) ;
      }

      chart.width = function(value) {
          if (!arguments.length) return width;
          width = value;
          return chart;
      };

      chart.height = function(value) {
          if (!arguments.length) return height;
          height = value;
          return chart;
      };

      chart.xlabel = function(value) {
          if(!arguments.length) return xlabel ;
          xlabel = value ;
          return chart ;
      } ;

      chart.ylabel = function(value) {
          if(!arguments.length) return ylabel ;
          ylabel = value ;
          return chart ;
      } ;

      return chart;
  }
}

function toggleGraphs() {
  var panel = document.getElementById('colorMetrics');
  var toggle = document.getElementById('toggleMetrics');
  panel.classList.toggle('visible');
  toggle.classList.toggle('is-selected');
}

// Sort swatches in UI
function sort() {
  ratioInputs.sort(function(a, b){return a-b});

  // Update ratio inputs with new values
  for (i=0; i<ratioInputs.length; i++) {
    ratioFields[i].value = ratioInputs[i];
  }
}

function sortRatios() {
  sort();
  colorInput();
}

// Exponential curve for approximating perceptually balanced swatch distribution
function returnRatioExp(lum) {
  // var a = 22.11002659220650;
  // var b = -0.03236668196111;

  // Test update
  var a = 21.2;
  var b = -0.035;
  var c = 0.25;

  var r = a * Math.exp(b * lum) + c;
  if (r > 1) {
    return r;
  }
  if (r < 1 && r >= 0) {
    return 1;
  }
}

// Inverse tangental curve for approximating perceptually balanced swatch distribution
// with smaller difference between swatches in darker values
function returnRatioTan(lum) {
  // var a = -8.25;
  // var b = 0.0685;
  // var c = 1.65;
  // var d = 12.25;

  // Test tangent curve for general use
  var a = -11;
  var b = 0.0475;
  var c = 0.5;
  var d = 15.45;

  // Test tangent curve for diverging palettes
  // var a = -11;
  // var b = 0.04;
  // var c = 0.65;
  // var d = 14.875;

  var r = a * Math.atan(b * lum - c) + d;

  if (r > 1) {
    return r;
  }
  if (r < 1 && r >= 0) {
    return 1;
  }
}

function interpolateLumArray() {
  Lums = [];

  for(i=0; i<newColors.length; i++) {
    Lums.push(d3.hsluv(newColors[i]).v);
  }
  var startLum = Math.min(...Lums);
  var endLum = Math.max(...Lums);
  var interpolator = d3.interpolateNumber(startLum, endLum);

  for (i=1; i<Lums.length - 1; i++) {
    Lums[i] = interpolator((i)/(Lums.length));
  }
  Lums.sort(function(a, b){return b-a});
  return Lums;
}

// Redistribute contrast swatches
function distributeExp() {
  sort();
  colorInput(); // for some reason without this, dist function needs called 2x to get proper output.

  interpolateLumArray();

  for(i=1; i<Lums.length -1; i++) {
    ratioFields[i].value = returnRatioExp(Lums[i]).toFixed(2);
  }

  colorInput();
}

// Redistribute contrast swatches
// TODO: It's still broken.
function distributeTan() {
  interpolateLumArray();

  for(i=1; i<Lums.length -1; i++) {
    ratioFields[i].value = returnRatioTan(Lums[i]).toFixed(2);
  }

  colorInput();
}

// Function to distribute swatches based on linear interpolation between HSLuv
// lightness values.
function distributeLum() {
  interpolateLumArray();
  var NewContrast = [];

  for(i=1; i<newColors.length -1; i++) {
    // Re-assign V value as Lums[i]
    var L = d3.hsluv(newColors[i]).l;
    var U = d3.hsluv(newColors[i]).u;
    var V = Lums[i];
    var NewRGB = d3.hsluv(L, U, V);

    var rgbArray = [d3.rgb(NewRGB).r, d3.rgb(NewRGB).g, d3.rgb(NewRGB).b];
    var baseRgbArray = [d3.rgb(background).r, d3.rgb(background).g, d3.rgb(background).b];

    NewContrast.push(contrast(rgbArray, baseRgbArray).toFixed(2));
  }

  // Concatenate first and last contrast array with new contrast array (middle)
  newRatios = [];
  newRatios = newRatios.concat(ratioInputs[0], NewContrast, ratioInputs[ratioInputs.length-1]);

  // Delete all ratios
  ratioItems = document.getElementsByClassName('color-Item');
  while(ratioItems.length > 0){
      ratioItems[0].parentNode.removeChild(ratioItems[0]);
  }
  var sliders = document.getElementById('sliderWrapper');
  sliders.innerHTML = ' ';

  // Add all new
  for(i=0; i<newRatios.length; i++) {
    addRatio(newRatios[i]);
  }

  colorInput();
}

new ClipboardJS('.copyButton');
new ClipboardJS('.colorOutputBlock');

function createChartWidth() {
  var leftPanel = 304;
  var rightPanel = 240;
  var paddings = 156;
  var offset = leftPanel + rightPanel + paddings;
  var viewportWidth = getViewport()[0];

  return (viewportWidth - offset) / 2;
}

function createChartHeight() {
  var headerHeight = 58;
  var tabHeight = 48;
  var paddings = 164;
  var offset = headerHeight + tabHeight + paddings;
  var viewportHeight = getViewport()[1];

  // return (viewportHeight - offset) / 2;
  return 180;
}

function getViewport() {
 var viewPortWidth;
 var viewPortHeight;

 // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
 if (typeof window.innerWidth != 'undefined') {
   viewPortWidth = window.innerWidth,
   viewPortHeight = window.innerHeight
 }

// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
 else if (typeof document.documentElement != 'undefined'
 && typeof document.documentElement.clientWidth !=
 'undefined' && document.documentElement.clientWidth != 0) {
    viewPortWidth = document.documentElement.clientWidth,
    viewPortHeight = document.documentElement.clientHeight
 }

 // older versions of IE
 else {
   viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
   viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
 }
 return [viewPortWidth, viewPortHeight];
}
