var colorField = document.getElementById('colorField1');
var color1 = document.getElementById('colorField1').value;
var color2 = document.getElementById('colorField2').value;
var color3 = document.getElementById('colorField3').value;
var background = document.getElementById('bgField').value;
var colorBlock = document.getElementById('color');
var demoHeading = document.getElementById('demoHeading');
var demoText = document.getElementById('demoText');
var demoBackgroundText = document.getElementById('demoTextInverted');
var demoBackgroundBlock = document.getElementById('demoInverted');
var userColorBlock = document.getElementById('userColor');
var userBgBlock = document.getElementById('userBg');
var ratioInput = document.getElementById('ratio');
var targetRatio = ratioInput.value;
var scaleNumbers = document.querySelector('input[name="scaleNumbers"]:checked').value;

var swatches = 300; // in order to make a gradient, this count needs to be massive

function colorblock(c){
  colorBlock.style.backgroundColor = c;
  demoBackgroundBlock.style.backgroundColor = c;
  demoText.style.color = c;
  demoHeading.style.color = c;
}
colorblock(color1);

function backgroundblock(b){
  document.body.style.backgroundColor = b;
  demoBackgroundText.style.color = b;
  demoBackgroundBlock.style.color = b;
}
backgroundblock(background);

function passFail(a) {
  var x = a;
  var smallText = document.getElementsByClassName('smallTextWrapper');
  var largeText = document.getElementsByClassName('largeTextWrapper');
  var passtext = document.createTextNode("pass AA");
  var fail = document.createElement('div');
  var failtext = document.createTextNode("fail AA");

  if(x >= 4.5) {
    // Small text pass
    for (var i = 0; i < smallText.length; i++) {
      smallText[i].innerHTML = '';
      smallText[i].appendChild(passtext);
    }
    // Large text pass
    for (var i = 0; i < largeText.length; i++) {
      largeText[i].innerHTML = '';
      largeText[i].appendChild(passtext);
    }
    console.log("PASS: Large & Small Text");
  }
  if(x > 4.5 && x <= 3) {
    // Large text pass
    for (var i = 0; i < largeText.length; i++) {
      largeText[i].innerHTML = '';
      largeText[i].appendChild(passtext);
    }
    for (var i = 0; i < smallText.length; i++) {
      smallText[i].innerHTML = '';
      smallText[i].appendChild(failtext);
    }
    console.log("PASS: Large Text only");
  }
  if(x < 3) {
    // all fail
    for (var i = 0; i < largeText.length; i++) {
      largeText[i].innerHTML = '';
      largeText[i].appendChild(failtext);
    }
    for (var i = 0; i < smallText.length; i++) {
      smallText[i].innerHTML = '';
      smallText[i].appendChild(failtext);
    }
    console.log("FAIL: Small and Large Text");
  }
}

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
function colorScale(color, domain, c2, c3) {
  var colorspace = document.querySelector('input[name="mode"]:checked').value;

  if(colorspace == 'JAB') {
    return d3.scaleLinear()
      .range([c2, d3.jab(color), c3])
      .domain([0, domain, swatches])
      .interpolate(d3.interpolateJab);
  }
  if(colorspace == 'LCH') {
    // TODO: if c2 / c2 inputs are pure white/black, redefine
    // to D3 hcl hack:
    // if (c2 == '#FFFFFF' || '#ffffff') {
    //   var c2 = d3.hcl(NaN, 0, 100);
    // }
    // if (c3 == '#000000' || 'black') {
    //   var c3 = d3.hcl(NaN, 0, 0);
    // }
    return d3.scaleLinear()
      .range([c2, d3.hcl(color), c3])
      .domain([0, domain, swatches])
      .interpolate(d3.interpolateHcl);
  }
  if(colorspace == 'LAB') {
    return d3.scaleLinear()
      .range([c2, d3.lab(color), c3])
      .domain([0, domain, swatches])
      .interpolate(d3.interpolateLab);
  }
  if(colorspace == 'HSL') {
    return d3.scaleLinear()
      .range([c2, d3.hsl(color), c3])
      .domain([0, domain, swatches])
      .interpolate(d3.interpolateHsl);
  }
  if(colorspace == 'HSLuv') {
    return d3.scaleLinear()
      .range([c2, d3.hsluv(color), c3])
      .domain([0, domain, swatches])
      .interpolate(d3.interpolateHsluv);
  }
}

// Calculate Color and generate Scales
function colorInput() {
  document.getElementById('colors').innerHTML = '';

  var mode = document.querySelector('input[name="mode"]:checked').value;
  var slider = document.getElementById('Slider');
  var background = document.getElementById('bgField').value;
  var scaleNumbers = document.querySelector('input[name="scaleNumbers"]:checked').value;

  var color1 = colorField1.value;
  var color2 = colorField2.value;
  var color3 = colorField3.value;
  colorblock(color1);

  if (scaleNumbers == "1color") {
    document.getElementById('colorField2').style.display = 'none';
    document.getElementById('colorField3').style.display = 'none';
    // domainInput.disabled = true;
  }
  if (scaleNumbers == "3color")  {
    document.getElementById('colorField2').style.display = 'inline-flex';
    document.getElementById('colorField3').style.display = 'inline-flex';
    // domainInput.disabled = false;
  }

  if(mode == "JAB") {
    var colorDomain =  swatches - ((d3.jab(color1).J / 100) * swatches); // should be calculated.
    var L2 = d3.jab(color1).J;
    if (scaleNumbers == "1color") {
      var clr = colorScale(color1, colorDomain, '#ffffff', '#000000');
    }
    if (scaleNumbers == "3color") {
      var clr = colorScale(color1, colorDomain, color2, color3);
    }

    var ColorArray = d3.range(swatches).map(function(d) {
      return clr(d)
    });
    var array = ColorArray;
  }

  if(mode == "LCH") {
    var colorDomain = swatches - swatches * ((d3.hcl(color1).l / 100)); // should be calculated.
    var L2 = d3.hcl(color1).l;

    if (scaleNumbers == "1color") {
      var clr = colorScale(color1, colorDomain, d3.hcl(NaN, 0, 100), d3.hcl(NaN, 0, 0));
    }
    if (scaleNumbers == "3color") {
      var clr = colorScale(color1, colorDomain, color2, color3);
    }

    var ColorArray = d3.range(swatches).map(function(d) {
      return clr(d)
    });
    var array = ColorArray;
  }

  if(mode == "LAB") {
    var colorDomain = swatches - swatches * ((d3.lab(color1).l / 100)); // should be calculated.
    var L2 = d3.lab(color1).l;
    if (scaleNumbers == "1color") {
      var clr = colorScale(color1, colorDomain, '#ffffff', '#000000');
    }
    if (scaleNumbers == "3color") {
      var clr = colorScale(color1, colorDomain, color2, color3);
    }

    var ColorArray = d3.range(swatches).map(function(d) {
      return clr(d)
    });
    var array = ColorArray;
    // console.log(array);
  }

  if(mode == "HSL") {
    var colorDomain = swatches * d3.hsl(color1).l; // should be calculated.
    console.log("HSL L Value: " + d3.hsl(color1).l);
    console.log("HSL Color Domain: " + colorDomain);

    var L2 = d3.hsl(color1).l * 100;
    if (scaleNumbers == "1color") {
      var clr = colorScale(color1, colorDomain, '#ffffff', '#000000');
    }
    if (scaleNumbers == "3color") {
      var clr = colorScale(color1, colorDomain, color2, color3);
    }

    var ColorArray = d3.range(swatches).map(function(d) {
      return clr(d)
    });
    var array = ColorArray;
  }

  if(mode == "HSLuv") {
    var colorDomain = swatches * d3.hsl(color1).l; // should be calculated.
    var L2 = d3.hsluv(color1).l / 10;
    if (scaleNumbers == "1color") {
      var clr = colorScale(color1, colorDomain, '#ffffff', '#000000');
    }
    if (scaleNumbers == "3color") {
      var clr = colorScale(color1, colorDomain, color2, color3);
    }

    var ColorArray = d3.range(swatches).map(function(d) {
      return clr(d)
    });
    var array = ColorArray;

    console.log("HSLuv Domain: " + colorDomain);
    console.log("HSLuv SliderPos: " + L2);
  }

  // Generate Gradient
  for (var i = 0; i < array.length; i++) {
    var container = document.getElementById('colors');
    var div = document.createElement('div');
    div.className = 'block';
    div.style.backgroundColor = array[i];

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
  colorBlock.style.bottom = slider.value + "%";

  backgroundblock(background);
  // passFail(contrastRatio);

  // Slider updates
  var sliderPos = document.getElementById('Slider').value;
  var colorDomainUpdate =  swatches - (swatches * sliderPos/100);
  var newRgb = ColorArray[colorDomainUpdate];
  var contrastRatio2 = contrast([backgroundR, backgroundG, backgroundB], [d3.rgb(newRgb).r, d3.rgb(newRgb).g, d3.rgb(newRgb).b]).toFixed(2);

  colorblock(newRgb);
  colorBlock.style.bottom = sliderPos + "%";
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
  // TODO: This slider default value isn't working. Should default to L2
  // value, unless user moves slider.
  // slider.value = L2;
}
colorInput(color1);

// Contrast Input
function ratioUpdate() {
  var ratioInput = document.getElementById('ratio');
  var targetRatio = ratioInput.value;
  var color1 = document.getElementById('colorField1').value;
  // var colorDomain =  swatches - (swatches * sliderPos/100);
  // var clr = colorScale(color1, colorDomain);
  // var ColorArray = d3.range(swatches).map(function(d) {
  //   return clr(d)
  // });
  // var colors = ColorArray;

  // console.log(targetRatio);

  // for (var i = 0; colors.length; i++) {
  //   var r = d3.rgb(colors[i]).r;
  //   var g = d3.rgb(colors[i]).g;
  //   var b = d3.rgb(colors[i]).b;
  //
  //   var bR = d3.rgb(background).r;
  //   var bG = d3.rgb(background).g;
  //   var bB = d3.rgb(background).b;
  //
  //   var ratio = contrast([r, g, b], [bR, bG, bB]);
  //
  //   if (targetRatio == ratio) {
  //     console.log('Exact Match! ' + targetRatio + ' = ' + ratio + ', '+ colors[i]);
  //
  //     var lch = d3.hex(colors[i]).lch();
  //     var d = lch[0];
  //     // var text = document.createTextNode(contrast);
  //     // var slider = document.getElementById('Slider');
  //     //
  //     // colorBlock.innerHTML = '';
  //     // colorBlock.appendChild(text);
  //     // colorBlock.style.backgroundColor = colors[i];
  //     colorBlock(colors[i])
  //     slider.value = d;
  //
  //     if (d < 50) {
  //       colorBlock.style.color = "#ffffff";
  //     } else {
  //       colorBlock.style.color = '#000000';
  //     }
  //
  //     break;
  //   } else {
  //     continue;
  //   }
  // }
}
