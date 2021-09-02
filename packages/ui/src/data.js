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

import * as d3 from 'd3';

// Create data based on colorspace
function createData(colors) {
  let CAM_J = [];
  let CAM_A = [];
  let CAM_B = [];
  let JCH_J = [];
  let JCH_C = [];
  let JCH_H = [];
  let LAB_L = [];
  let LAB_A = [];
  let LAB_B = [];
  let LCH_L = [];
  let LCH_C = [];
  let LCH_H = [];
  let HSL_H = [];
  let HSL_S = [];
  let HSL_L = [];
  let HSV_H = [];
  let HSV_S = [];
  let HSV_V = [];
  let HSLuv_L = [];
  let HSLuv_U = [];
  let HSLuv_V = [];
  let RGB_R = [];
  let RGB_G = [];
  let RGB_B = [];

  for(let i=4; i<colors.length; i++) { // Clip array to eliminate NaN values
    CAM_J.push(d3.jab(colors[i]).J);
    CAM_A.push(d3.jab(colors[i]).a);
    CAM_B.push(d3.jab(colors[i]).b);
    JCH_J.push(d3.jch(colors[i]).J);
    JCH_C.push(d3.jch(colors[i]).C);
    JCH_H.push(d3.jch(colors[i]).h);
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
    HSV_H.push(d3.hsv(colors[i]).h);
    HSV_S.push(d3.hsv(colors[i]).s);
    HSV_V.push(d3.hsv(colors[i]).v);
    HSLuv_L.push(d3.hsluv(colors[i]).l);
    HSLuv_U.push(d3.hsluv(colors[i]).u);
    HSLuv_V.push(d3.hsluv(colors[i]).v);
  }

  // Filter out "NaN" values from these arrays
  CAM_J = CAM_J.filter(function(value) {return !Number.isNaN(value);});
  CAM_A = CAM_A.filter(function(value) {return !Number.isNaN(value);});
  CAM_B = CAM_B.filter(function(value) {return !Number.isNaN(value);});
  JCH_J = JCH_J.filter(function(value) {return !Number.isNaN(value);});
  JCH_C = JCH_C.filter(function(value) {return !Number.isNaN(value);});
  JCH_H = JCH_H.filter(function(value) {return !Number.isNaN(value);});
  LAB_L = LAB_L.filter(function(value) {return !Number.isNaN(value);});
  LAB_A = LAB_A.filter(function(value) {return !Number.isNaN(value);});
  LAB_B = LAB_B.filter(function(value) {return !Number.isNaN(value);});
  LCH_L = LCH_L.filter(function(value) {return !Number.isNaN(value);});
  LCH_C = LCH_C.filter(function(value) {return !Number.isNaN(value);});
  LCH_H = LCH_H.filter(function(value) {return !Number.isNaN(value);});
  RGB_R = RGB_R.filter(function(value) {return !Number.isNaN(value);});
  RGB_G = RGB_G.filter(function(value) {return !Number.isNaN(value);});
  RGB_B = RGB_B.filter(function(value) {return !Number.isNaN(value);});
  HSL_H = HSL_H.filter(function(value) {return !Number.isNaN(value);});
  HSL_S = HSL_S.filter(function(value) {return !Number.isNaN(value);});
  HSL_L = HSL_L.filter(function(value) {return !Number.isNaN(value);});
  HSV_H = HSV_H.filter(function(value) {return !Number.isNaN(value);});
  HSV_S = HSV_S.filter(function(value) {return !Number.isNaN(value);});
  HSV_V = HSV_V.filter(function(value) {return !Number.isNaN(value);});
  HSLuv_L = HSLuv_L.filter(function(value) {return !Number.isNaN(value);});
  HSLuv_U = HSLuv_U.filter(function(value) {return !Number.isNaN(value);});
  HSLuv_V = HSLuv_V.filter(function(value) {return !Number.isNaN(value);});

  window.CAMArrayJ = [];
  window.CAMArrayA = [];
  window.CAMArrayB = [];
  window.JCHArrayJ = [];
  window.JCHArrayC = [];
  window.JCHArrayH = [];
  window.LABArrayL = [];
  window.LABArrayA = [];
  window.LABArrayB = [];
  window.LCHArrayL = [];
  window.LCHArrayC = [];
  window.LCHArrayH = [];
  window.RGBArrayR = [];
  window.RGBArrayG = [];
  window.RGBArrayB = [];
  window.HSLArrayH = [];
  window.HSLArrayS = [];
  window.HSLArrayL = [];
  window.HSVArrayH = [];
  window.HSVArrayS = [];
  window.HSVArrayL = [];
  window.HSLuvArrayL = [];
  window.HSLuvArrayU = [];
  window.HSLuvArrayV = [];

  window.CAMArrayJmin = [];
  window.CAMArrayAmin = [];
  window.CAMArrayBmin = [];
  window.JCHArrayJmin = [];
  window.JCHArrayCmin = [];
  window.JCHArrayHmin = [];
  window.LABArrayLmin = [];
  window.LABArrayAmin = [];
  window.LABArrayBmin = [];
  window.LCHArrayLmin = [];
  window.LCHArrayCmin = [];
  window.LCHArrayHmin = [];
  window.RGBArrayRmin = [];
  window.RGBArrayGmin = [];
  window.RGBArrayBmin = [];
  window.HSLArrayHmin = [];
  window.HSLArraySmin = [];
  window.HSLArrayLmin = [];
  window.HSVArrayHmin = [];
  window.HSVArraySmin = [];
  window.HSVArrayLmin = [];
  window.HSLuvArrayLmin = [];
  window.HSLuvArrayUmin = [];
  window.HSLuvArrayVmin = [];

  // Shorten the numbers in the array for chart purposes
  var maxVal = 300;
  var delta = Math.floor( CAM_J.length / maxVal );

  for (let i = 0; i < CAM_J.length; i=i+delta) {
    CAMArrayJ.push(CAM_J[i]);
  }
  for (let i = 0; i < CAM_A.length; i=i+delta) {
    CAMArrayA.push(CAM_A[i]);
  }
  for (let i = 0; i < CAM_B.length; i=i+delta) {
    CAMArrayB.push(CAM_B[i]);
  }
  for (let i = 0; i < JCH_J.length; i=i+delta) {
    JCHArrayJ.push(JCH_J[i]);
  }
  for (let i = 0; i < JCH_C.length; i=i+delta) {
    JCHArrayC.push(JCH_C[i]);
  }
  for (let i = 0; i < JCH_H.length; i=i+delta) {
    JCHArrayH.push(JCH_H[i]);
  }
  for (let i = 0; i < LAB_L.length; i=i+delta) {
    LABArrayL.push(LAB_L[i]);
  }
  for (let i = 0; i < LAB_A.length; i=i+delta) {
    LABArrayA.push(LAB_A[i]);
  }
  for (let i = 0; i < LAB_B.length; i=i+delta) {
    LABArrayB.push(LAB_B[i]);
  }
  for (let i = 0; i < LCH_L.length; i=i+delta) {
    LCHArrayL.push(LCH_L[i]);
  }
  for (let i = 0; i < LCH_C.length; i=i+delta) {
    LCHArrayC.push(LCH_C[i]);
  }
  for (let i = 0; i < LCH_H.length; i=i+delta) {
    LCHArrayH.push(LCH_H[i]);
  }
  for (let i = 0; i < RGB_R.length; i=i+delta) {
    RGBArrayR.push(RGB_R[i]);
  }
  for (let i = 0; i < RGB_G.length; i=i+delta) {
    RGBArrayG.push(RGB_G[i]);
  }
  for (let i = 0; i < RGB_B.length; i=i+delta) {
    RGBArrayB.push(RGB_B[i]);
  }
  for (let i = 0; i < HSL_H.length; i=i+delta) {
    HSLArrayH.push(HSL_H[i]);
  }
  for (let i = 0; i < HSL_S.length; i=i+delta) {
    HSLArrayS.push(HSL_S[i]);
  }
  for (let i = 0; i < HSL_L.length; i=i+delta) {
    HSLArrayL.push(HSL_L[i]);
  }
  for (let i = 0; i < HSV_H.length; i=i+delta) {
    HSVArrayH.push(HSV_H[i]);
  }
  for (let i = 0; i < HSV_S.length; i=i+delta) {
    HSVArrayS.push(HSV_S[i]);
  }
  for (let i = 0; i < HSV_V.length; i=i+delta) {
    HSVArrayL.push(HSV_V[i]);
  }
  for (let i = 0; i < HSLuv_L.length; i=i+delta) {
    HSLuvArrayL.push(HSLuv_L[i]);
  }
  for (let i = 0; i < HSLuv_U.length; i=i+delta) {
    HSLuvArrayU.push(HSLuv_U[i]);
  }
  for (let i = 0; i < HSLuv_V.length; i=i+delta) {
    HSLuvArrayV.push(HSLuv_V[i]);
  }

  // Minimized data set
  var maxValmin = 25;
  var deltamin = Math.floor( CAM_J.length / maxValmin );

  for (let i = 0; i < CAM_J.length; i=i+deltamin) {
    CAMArrayJmin.push(CAM_J[i]);
  }
  for (let i = 0; i < CAM_A.length; i=i+deltamin) {
    CAMArrayAmin.push(CAM_A[i]);
  }
  for (let i = 0; i < CAM_B.length; i=i+deltamin) {
    CAMArrayBmin.push(CAM_B[i]);
  }

  for (let i = 0; i < JCH_J.length; i=i+deltamin) {
    JCHArrayJmin.push(JCH_J[i]);
  }
  for (let i = 0; i < JCH_C.length; i=i+deltamin) {
    JCHArrayCmin.push(JCH_C[i]);
  }
  for (let i = 0; i < JCH_H.length; i=i+deltamin) {
    JCHArrayHmin.push(JCH_H[i]);
  }

  for (let i = 0; i < LAB_L.length; i=i+deltamin) {
    LABArrayLmin.push(LAB_L[i]);
  }
  for (let i = 0; i < LAB_A.length; i=i+deltamin) {
    LABArrayAmin.push(LAB_A[i]);
  }
  for (let i = 0; i < LAB_B.length; i=i+deltamin) {
    LABArrayBmin.push(LAB_B[i]);
  }
  for (let i = 0; i < LCH_L.length; i=i+deltamin) {
    LCHArrayLmin.push(LCH_L[i]);
  }
  for (let i = 0; i < LCH_C.length; i=i+deltamin) {
    LCHArrayCmin.push(LCH_C[i]);
  }
  for (let i = 0; i < LCH_H.length; i=i+deltamin) {
    LCHArrayHmin.push(LCH_H[i]);
  }
  for (let i = 0; i < RGB_R.length; i=i+deltamin) {
    RGBArrayRmin.push(RGB_R[i]);
  }
  for (let i = 0; i < RGB_G.length; i=i+deltamin) {
    RGBArrayGmin.push(RGB_G[i]);
  }
  for (let i = 0; i < RGB_B.length; i=i+deltamin) {
    RGBArrayBmin.push(RGB_B[i]);
  }
  for (let i = 0; i < HSL_H.length; i=i+deltamin) {
    HSLArrayHmin.push(HSL_H[i]);
  }
  for (let i = 0; i < HSL_S.length; i=i+deltamin) {
    HSLArraySmin.push(HSL_S[i]);
  }
  for (let i = 0; i < HSL_L.length; i=i+deltamin) {
    HSLArrayLmin.push(HSL_L[i]);
  }
  for (let i = 0; i < HSV_H.length; i=i+deltamin) {
    HSVArrayHmin.push(HSV_H[i]);
  }
  for (let i = 0; i < HSV_S.length; i=i+deltamin) {
    HSVArraySmin.push(HSV_S[i]);
  }
  for (let i = 0; i < HSV_V.length; i=i+deltamin) {
    HSVArrayLmin.push(HSV_V[i]);
  }
  for (let i = 0; i < HSLuv_L.length; i=i+deltamin) {
    HSLuvArrayLmin.push(HSLuv_L[i]);
  }
  for (let i = 0; i < HSLuv_U.length; i=i+deltamin) {
    HSLuvArrayUmin.push(HSLuv_U[i]);
  }
  for (let i = 0; i < HSLuv_V.length; i=i+deltamin) {
    HSLuvArrayVmin.push(HSLuv_V[i]);
  }

  const fillRange = (start, end) => {
    return Array(end - start + 1).fill().map((item, index) => start + index);
  };

  let dataX = fillRange(0, CAMArrayJ.length - 1);
  let dataXcyl = fillRange(0, LCHArrayL.length - 1);
  let dataXcontrast = fillRange(0, ratioInputs.length-1);

  window.labFullData = [
    {
      x: LABArrayL,
      y: LABArrayA,
      z: LABArrayB
    }
  ];


  window.camDataA = [
    {
      x: CAMArrayJmin,
      y: CAMArrayAmin
    }
  ];
  window.camDataB = [
    {
      x: CAMArrayJmin,
      y: CAMArrayBmin
    }
  ];
  window.camDataAB = [
    {
      x: CAMArrayAmin,
      y: CAMArrayBmin
    }
  ];
  
  window.jchDataC = [
    {
      x: JCHArrayJmin,
      y: JCHArrayCmin
    }
  ];
  window.jchDataH = [
    {
      x: JCHArrayJmin,
      y: JCHArrayHmin
    }
  ];
  window.jchDataCH = [
    {
      x: JCHArrayHmin,
      y: JCHArrayCmin
    }
  ];

  window.labDataA = [
    {
      x: LABArrayLmin,
      y: LABArrayAmin
    }
  ];
  window.labDataB = [
    {
      x: LABArrayLmin,
      y: LABArrayBmin
    }
  ];
  window.labDataAB = [
    {
      x: LABArrayAmin,
      y: LABArrayBmin
    }
  ];

  window.lchDataC = [
    {
      x: LCHArrayLmin,
      y: LCHArrayCmin
    }
  ];
  window.lchDataH = [
    {
      x: LCHArrayLmin,
      y: LCHArrayHmin
    }
  ];
  window.lchDataCH = [
    {
      x: LCHArrayHmin,
      y: LCHArrayCmin
    }
  ];
  window.rgbDataR = [
    {
      x: RGBArrayRmin,
      y: RGBArrayGmin
    }
  ];
  window.rgbDataG = [
    {
      x: RGBArrayGmin,
      y: RGBArrayBmin
    }
  ];
  window.rgbDataB = [
    {
      x: RGBArrayBmin,
      y: RGBArrayRmin
    }
  ];
  window.hslDataH = [
    {
      x: HSLArrayLmin,
      y: HSLArrayHmin
    }
  ];
  window.hslDataS = [
    {
      x: HSLArrayLmin,
      y: HSLArraySmin
    }
  ];
  window.hslDataHS = [
    {
      x: HSLArrayHmin,
      y: HSLArraySmin
    }
  ];

  window.hsvDataH = [
    {
      x: HSVArrayLmin,
      y: HSVArrayHmin
    }
  ];
  window.hsvDataS = [
    {
      x: HSVArrayLmin,
      y: HSVArraySmin
    }
  ];
  window.hsvDataHS = [
    {
      x: HSVArrayHmin,
      y: HSVArraySmin
    }
  ];
  window.hsluvDataL = [
    {
      x: HSLuvArrayVmin,
      y: HSLuvArrayLmin
    }
  ];
  window.hsluvDataU = [
    {
      x: HSLuvArrayVmin,
      y: HSLuvArrayUmin
    }
  ];
  window.hsluvDataLU = [
    {
      x: HSLuvArrayLmin,
      y: HSLuvArrayUmin
    }
  ];
  window.contrastData = [
    {
      x: dataXcontrast,
      y: ratioInputs.map(function(d) {return parseFloat(d);}) // convert to number
    }
  ];
}

exports.createData = createData;
