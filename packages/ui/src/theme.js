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

/*
1. Generate Color Scale object
2. For each color scale object, function for color inputs.
3. AddColor function (per object)
4. Delete object
5. Add object (run generate color)
6. Param setup
7. Param input (read if has params )
8. Function output
9. Colors output (for each object, output colors in panel)
10. Toggle configs visibility
11. Brightness slider value sync
12. Base color input options based on color objects available
13. Add color from Leonardo URL
14. 

*/

function themeInput() {
  document.getElementById('colorScale').innerHTML = '';
  let spaceOpt = document.getElementById('chart3dColorspace').value;

  var inputs = document.getElementsByClassName('keyColor-Item');
  var background = document.getElementById('bgField').value;
  let mode = document.querySelector('select[name="mode"]').value;

  // Clamp ratios convert decimal numbers to whole negatives and disallow
  // inputs less than 1 and greater than -1.
  for(let i=0; i<ratioFields.length; i++) {
    val = ratioFields[i].value;
    if (val < 1 && val > -1) {
      ratioFields[i].value = (10 / (val * 10)).toFixed(2) * -1;
    } else { }
  }

  var rfIds = []
  for (let i=0; i<ratioFields.length; i++) {
    rfIds.push(ratioFields[i].id);
  }
  ratioInputs = [];
  let inputColors = [];

  // For each ratio input field, push the value into the args array for generateContrastColors
  for(let i=0; i < ratioFields.length; i++) {
    ratioInputs.push(ratioFields[i].value);
  }
  for(let i=0; i<inputs.length; i++) {
    inputColors.push(inputs[i].value);
  }

  // Convert input value into a split array of hex values.
  let tempArgs = [];
  // remove any whitespace from inputColors
  tempArgs.push(inputColors);
  colorArgs = tempArgs.join("").split(',').filter(String);

  let shift = 1;
  let clamping = document.getElementById('sequentialClamp').checked;

  // Generate scale data so we have access to all 3000 swatches to draw the gradient on the left
  let scaleData = contrastColors.createScale({swatches: 3000, colorKeys: colorArgs, colorspace: mode, shift: shift});
  let n = window.innerHeight - 282;

  let rampData = contrastColors.createScale({swatches: n, colorKeys: colorArgs, colorspace: mode, shift: shift});

  newColors = contrastColors.generateContrastColors({colorKeys: colorArgs, base: background, ratios: ratioInputs, colorspace: mode, shift: shift});

  // Create values for sliders
  let Values = [];
  let maxVal = 100;

  for(let i=0; i < newColors.length; i++){
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

  for(let i=0; i<newColors.length; i++) {
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

  // Generate Gradient as HTML Canvas element
  let filteredColors = rampData.colors;
  ramp(filteredColors, n);

  var backgroundR = d3.rgb(background).r;
  var backgroundG = d3.rgb(background).g;
  var backgroundB = d3.rgb(background).b;

  var colorOutputWrapper = document.getElementById('colorOutputs');
  colorOutputWrapper.innerHTML = '';
  let wrap = document.getElementById('demoWrapper');
  wrap.innerHTML = '';

  for (let i = 0; i < newColors.length; i++) {
    var colorOutput = document.createElement('div');
    var colorOutputVal = newColors[i];
    var colorOutputText = document.createTextNode(d3.rgb(colorOutputVal).hex());
    var bg = d3.color(background).rgb();
    var outputRatio = contrastColors.contrast([d3.rgb(newColors[i]).r, d3.rgb(newColors[i]).g, d3.rgb(newColors[i]).b], [bg.r, bg.g, bg.b]);
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

    if (contrastColors.luminance(d3.rgb(newColors[i]).r, d3.rgb(newColors[i]).g, d3.rgb(newColors[i]).b) < 0.275) {
      colorOutput.style.color = "#ffffff";
    } else {
      colorOutput.style.color = '#000000';
    }
    createDemo(newColors[i], background);
  }

  var copyColors = document.getElementById('copyAllColors');
  copyColors.setAttribute('data-clipboard-text', newColors);

  // update URL parameters
  updateParams(inputColors, background.substr(1), ratioInputs, mode);

  chartData.createData(scaleData.colors);
  charts.showCharts('CAM02');
  colorSpaceFeedback('CAM02'); // manually enter default of CAM02
}

exports.themeInput = themeInput;
