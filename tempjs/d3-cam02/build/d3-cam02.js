// https://github.com/connorgr/d3-cam02 Version 0.1.5. Copyright 2017 Connor Gramazio.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-color')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-color'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3));
}(this, (function (exports,d3Color) { 'use strict';

var deg2rad = Math.PI / 180;
var rad2deg = 180 / Math.PI;

// Implementation based on Billy Bigg's CIECAM02 implementation in C
// (http://scanline.ca/ciecam02/)
// and information on Wikipedia (https://en.wikipedia.org/wiki/CIECAM02)
//
// IMPORTANT NOTE : uses XYZ [0,100] not [0,1]
//
// When transforming colors into CIECAM02 space we use Luo et al.'s uniform
// color space transform; however, we also provide commented out transform
// coefficients for the long-distance and short-distance CIECAM02 transforms,
// should others desire to use these alternative perceptually uniform
// approximation spaces instead.
//
// Another important note is that we provide the full range of CIECAM02 color
// values in the JCh constructor, but the d3 color object stores only lightness
// (J), chroma (C), and hue (h).
//

// used for brighter and darker functions
// Kn is completely arbitrary and was picked originally by Mike Bostock to make
// the Lab brighter and darker functions behave similarly to the RGB equivalents
// in d3-color. We copy and paste the value directly and encourage others to
// add a more systematically chosen value.
var Kn = 18;


// Conversion functions
function rgb2xyz(r, g, b) {
  r = r / 255.0;
  g = g / 255.0;
  b = b / 255.0;

  // assume sRGB
  r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

  // Convert to XYZ in [0,100] rather than [0,1]
  return {
    x: ( (r * 0.4124) + (g * 0.3576) + (b * 0.1805) ) * 100.0,
    y: ( (r * 0.2126) + (g * 0.7152) + (b * 0.0722) ) * 100.0,
    z: ( (r * 0.0193) + (g * 0.1192) + (b * 0.9505) ) * 100.0
  };
}

function xyz2rgb(x, y, z) {
  x = x / 100.0;
  y = y / 100.0;
  z = z / 100.0;

  var preR = x *  3.2404542 + y * -1.5371385 - z * 0.4985314,
      preG = x * -0.9692660 + y *  1.8760108 + z * 0.0415560,
      preB = x *  0.0556434 + y * -0.2040259 + z * 1.0572252;

  function toRGB(c) {
    return 255.0 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  }

  return {r: toRGB(preR), g: toRGB(preG), b: toRGB(preB)};
}


function xyz2cat02(x,y,z) {
  var l = ( 0.7328 * x) + (0.4296 * y) - (0.1624 * z),
      m = (-0.7036 * x) + (1.6975 * y) + (0.0061 * z),
      s = ( 0.0030 * x) + (0.0136 * y) + (0.9834 * z);
  return {l: l, m: m, s: s};
}
function cat022xyz(l, m, s) {
  var x = ( 1.096124 * l) - (0.278869 * m) + (0.182745 * s),
      y = ( 0.454369 * l) + (0.473533 * m) + (0.072098 * s),
      z = (-0.009628 * l) - (0.005698 * m) + (1.015326 * s);
  return {x: x, y: y, z:z};
}

function cat022hpe(l,m,s) {
  var lh = ( 0.7409792 * l) + (0.2180250 * m) + (0.0410058 * s),
      mh = ( 0.2853532 * l) + (0.6242014 * m) + (0.0904454 * s),
      sh = (-0.0096280 * l) - (0.0056980 * m) + (1.0153260 * s);

  return {lh: lh, mh: mh, sh: sh};
}

function hpe2xyz(l, m, s) {
  var x = (1.910197 * l) - (1.112124 * m) + (0.201908 * s),
      y = (0.370950 * l) + (0.629054 * m) - (0.000008 * s),
      z = s;
  return {x:x, y:y, z:z};
}

function nonlinearAdaptation(coneResponse, fl) {
  var p = Math.pow( (fl * coneResponse) / 100.0, 0.42 );
  return ((400.0 * p) / (27.13 + p)) + 0.1;
}

function inverseNonlinearAdaptation(coneResponse, fl) {
  return (100.0 / fl) *
          Math.pow((27.13 * Math.abs(coneResponse - 0.1)) /
                      (400.0 - Math.abs(coneResponse - 0.1)),
                   1.0 / 0.42);
}

// CIECAM02_VC viewing conditions; assumes average viewing conditions
var CIECAM02_VC = (function() {
  var vc = {
    D65_X: 95.047, // D65 standard referent
    D65_Y: 100.0,
    D65_Z: 108.883,
    // Viewing conditions
    // Note about L_A:
    // Billy Bigg's implementation just uses a value of 4 cd/m^2, but
    // the colorspacious implementation uses greater precision by calculating
    // it with (64 / numpy.pi) / 5
    // This is based on Moroney (2000), "Usage guidelines for CIECAM97s" where
    // sRGB illuminance is 64 lux. Because of its greater precision we use
    // Moroney's alternative definition.
    la: (64.0 / Math.PI) / 5.0,
    yb: 20.0, // 20% gray
    // Surround
    f: 1.0,  // average;  dim: 0.9;  dark: 0.8
    c: 0.69, // average;  dim: 0.59; dark: 0.525
    nc: 1.0  // average;  dim: 0.95; dark: 0.8
  };

  vc.D65_LMS = xyz2cat02(vc.D65_X, vc.D65_Y, vc.D65_Z),

  vc.n = vc.yb / vc.D65_Y;
  vc.z = 1.48 + Math.sqrt(vc.n);

  var k = 1.0 / ((5.0 * vc.la) + 1.0);
  vc.fl = (0.2 * Math.pow(k, 4.0) * (5.0 * vc.la)) +
          0.1 * Math.pow(1.0 - Math.pow(k, 4.0), 2.0) *
              Math.pow(5.0 * vc.la, 1.0/3.0);

  vc.nbb = 0.725 * Math.pow(1.0 / vc.n, 0.2);
  vc.ncb = vc.nbb;
  vc.d = vc.f * ( 1.0 - (1.0 / 3.6) * Math.exp((-vc.la - 42.0) / 92.0) );
  vc.achromaticResponseToWhite = (function() {
    var l = vc.D65_LMS.l,
        m = vc.D65_LMS.m,
        s = vc.D65_LMS.s;

    var lc = l * (((vc.D65_Y * vc.d) / l) + (1.0 - vc.d)),
        mc = m * (((vc.D65_Y * vc.d) / m) + (1.0 - vc.d)),
        sc = s * (((vc.D65_Y * vc.d) / s) + (1.0 - vc.d));

    var hpeTransforms = cat022hpe(lc, mc, sc),
        lp = hpeTransforms.lh,
        mp = hpeTransforms.mh,
        sp = hpeTransforms.sh;

    var lpa = nonlinearAdaptation(lp, vc.fl),
        mpa = nonlinearAdaptation(mp, vc.fl),
        spa = nonlinearAdaptation(sp, vc.fl);

    return (2.0 * lpa + mpa + 0.05 * spa - 0.305) * vc.nbb;
  })();

  return vc;
})(); // end CIECAM02_VC

function cat022cam02(l,m,s) {
  var theColor = {};

  var D65_CAT02 = xyz2cat02(CIECAM02_VC.D65_X,CIECAM02_VC.D65_Y,CIECAM02_VC.D65_Z);

  function cTransform(cone, D65_cone) {
    var D65_Y = CIECAM02_VC.D65_Y,
        VC_d = CIECAM02_VC.d;

    return cone * (((D65_Y * VC_d) / D65_cone) + (1.0 - VC_d));
  }

  var lc = cTransform(l, D65_CAT02.l),
      mc = cTransform(m, D65_CAT02.m),
      sc = cTransform(s, D65_CAT02.s);

  var hpeTransforms = cat022hpe(lc, mc, sc),
      lp = hpeTransforms.lh,
      mp = hpeTransforms.mh,
      sp = hpeTransforms.sh;

  var lpa = nonlinearAdaptation(lp, CIECAM02_VC.fl),
      mpa = nonlinearAdaptation(mp, CIECAM02_VC.fl),
      spa = nonlinearAdaptation(sp, CIECAM02_VC.fl);

  var ca = lpa - ((12.0*mpa) / 11.0) + (spa / 11.0),
      cb = (1.0/9.0) * (lpa + mpa - 2.0*spa);

  theColor.h = (180.0 / Math.PI) * Math.atan2(cb, ca);
  if(theColor.h < 0.0) theColor.h += 360.0;

  var temp;
  if(theColor.h < 20.14) {
    temp = ((theColor.h + 122.47)/1.2) + ((20.14 - theColor.h)/0.8);
    theColor.H = 300 + (100*((theColor.h + 122.47)/1.2)) / temp;
  } else if(theColor.h < 90.0) {
    temp = ((theColor.h - 20.14)/0.8) + ((90.00 - theColor.h)/0.7);
    theColor.H = (100*((theColor.h - 20.14)/0.8)) / temp;
  } else if(theColor.h < 164.25) {
    temp = ((theColor.h - 90.00)/0.7) + ((164.25 - theColor.h)/1.0);
    theColor.H = 100 + ((100*((theColor.h - 90.00)/0.7)) / temp);
  } else if (theColor.h < 237.53) {
    temp = ((theColor.h - 164.25)/1.0) + ((237.53 - theColor.h)/1.2);
    theColor.H = 200 + ((100*((theColor.h - 164.25)/1.0)) / temp);
  } else {
    temp = ((theColor.h - 237.53)/1.2) + ((360 - theColor.h + 20.14)/0.8);
    theColor.H = 300 + ((100*((theColor.h - 237.53)/1.2)) / temp);
  }

  var a = ( 2.0*lpa + mpa + 0.05*spa - 0.305 ) * CIECAM02_VC.nbb;

  theColor.J = 100.0 * Math.pow(a / CIECAM02_VC.achromaticResponseToWhite,
                                CIECAM02_VC.c * CIECAM02_VC.z);

  var et = 0.25 * (Math.cos((theColor.h * Math.PI) / 180.0 + 2.0) + 3.8),
      t = ((50000.0 / 13.0) * CIECAM02_VC.nc * CIECAM02_VC.ncb * et * Math.sqrt(ca*ca + cb*cb)) /
          (lpa + mpa + (21.0/20.0)*spa);

  theColor.C = Math.pow(t, 0.9) * Math.sqrt(theColor.J / 100.0) *
                Math.pow(1.64 - Math.pow(0.29, CIECAM02_VC.n), 0.73);

  theColor.Q = (4.0 / CIECAM02_VC.c) * Math.sqrt(theColor.J / 100.0) *
                (CIECAM02_VC.achromaticResponseToWhite + 4.0) * Math.pow(CIECAM02_VC.fl, 0.25);

  theColor.M = theColor.C * Math.pow(CIECAM02_VC.fl, 0.25);

  theColor.s = 100.0 * Math.sqrt(theColor.M / theColor.Q);

  return theColor;
}


function Aab2Cat02LMS(A, aa, bb, nbb) {
  var x = (A / nbb) + 0.305;

  var l = (0.32787 * x) + (0.32145 * aa) + (0.20527 * bb),
      m = (0.32787 * x) - (0.63507 * aa) - (0.18603 * bb),
      s = (0.32787 * x) - (0.15681 * aa) - (4.49038 * bb);

  return {l:l, m:m, s:s};
}

function cam022rgb(J, C, h) {
  // NOTE input is small h not big H, the later of which is corrected

  var t = Math.pow(C / (Math.sqrt(J / 100.0) *
                      Math.pow(1.64-Math.pow(0.29, CIECAM02_VC.n), 0.73)),
                  (1.0 / 0.9)),
      et = 1.0 / 4.0 * (Math.cos(((h * Math.PI) / 180.0) + 2.0) + 3.8);

  var a = Math.pow( J / 100.0, 1.0 / (CIECAM02_VC.c * CIECAM02_VC.z) ) *
              CIECAM02_VC.achromaticResponseToWhite;

  var p1 = ((50000.0 / 13.0) * CIECAM02_VC.nc * CIECAM02_VC.ncb) * et / t,
      p2 = (a / CIECAM02_VC.nbb) + 0.305,
      p3 = 21.0 / 20.0,
      p4, p5, ca, cb;

  var hr = (h * Math.PI) / 180.0;

  if (Math.abs(Math.sin(hr)) >= Math.abs(Math.cos(hr))) {
    p4 = p1 / Math.sin(hr);
    cb = (p2 * (2.0 + p3) * (460.0 / 1403.0)) /
          (p4 + (2.0 + p3) * (220.0 / 1403.0) *
          (Math.cos(hr) / Math.sin(hr)) - (27.0 / 1403.0) +
          p3 * (6300.0 / 1403.0));
    ca = cb * (Math.cos(hr) / Math.sin(hr));
  }
  else {
    p5 = p1 / Math.cos(hr);
    ca = (p2 * (2.0 + p3) * (460.0 / 1403.0)) /
         (p5 + (2.0 + p3) * (220.0 / 1403.0) -
         ((27.0 / 1403.0) - p3 * (6300.0 / 1403.0)) *
         (Math.sin(hr) / Math.cos(hr)));
    cb = ca * (Math.sin(hr) / Math.cos(hr));
  }

  var lms_a = Aab2Cat02LMS(a, ca, cb, CIECAM02_VC.nbb),
      lpa = lms_a.l,
      mpa = lms_a.m,
      spa = lms_a.s;

  var lp = inverseNonlinearAdaptation(lpa, CIECAM02_VC.fl),
      mp = inverseNonlinearAdaptation(mpa, CIECAM02_VC.fl),
      sp = inverseNonlinearAdaptation(spa, CIECAM02_VC.fl);

  var txyz = hpe2xyz(lp, mp, sp),
      lms_c =  xyz2cat02(txyz.x, txyz.y, txyz.z);

  var D65_CAT02 = xyz2cat02(CIECAM02_VC.D65_X, CIECAM02_VC.D65_Y,
                            CIECAM02_VC.D65_Z);

  var l = lms_c.l / ( ((CIECAM02_VC.D65_Y * CIECAM02_VC.d) / D65_CAT02.l) +
                      (1.0 - CIECAM02_VC.d) ),
      m = lms_c.m / ( ((CIECAM02_VC.D65_Y * CIECAM02_VC.d) / D65_CAT02.m) +
                      (1.0 - CIECAM02_VC.d) ),
      s = lms_c.s / ( ((CIECAM02_VC.D65_Y * CIECAM02_VC.d) / D65_CAT02.s) +
                      (1.0 - CIECAM02_VC.d) );

  var xyz = cat022xyz(l, m, s),
      rgb = xyz2rgb(xyz.x, xyz.y, xyz.z);

  return rgb;
}


function jchConvert(o) {
  if (o instanceof JCh) return new JCh(o.J, o.C, o.h, o.opacity);
  if (!(o instanceof d3Color.rgb)) o = d3Color.rgb(o);

  var xyz = rgb2xyz(o.r, o.g, o.b),
      lmsConeResponses = xyz2cat02(xyz.x,xyz.y,xyz.z),
      cam02obj = cat022cam02(lmsConeResponses.l,lmsConeResponses.m,
                             lmsConeResponses.s);


  return new JCh(cam02obj.J, cam02obj.C, cam02obj.h, o.opacity);
}

function jch(J, C, h, opacity) {
  return arguments.length === 1 ? jchConvert(J) : new JCh(J, C, h,
      opacity == null ? 1 : opacity);
}

function JCh(J, C, h, opacity) {
  this.J = +J;
  this.C = +C;
  this.h = +h;
  this.opacity = +opacity;
}

var jchPrototype = JCh.prototype = jch.prototype = Object.create(d3Color.color.prototype);
jchPrototype.constructor = JCh;

jchPrototype.brighter = function(k) {
  return new JCh(this.J + Kn * (k === null ? 1 : k), this.C, this.h,
      this.opacity);
};

jchPrototype.darker = function(k) {
  return new JCh(this.J - Kn * (k === null ? 1 : k), this.C, this.h,
      this.opacity);
};

jchPrototype.rgb = function () {
  var converted = cam022rgb(this.J, this.C, this.h);
  return d3Color.rgb(converted.r, converted.g, converted.b, this.opacity);
};


////////////////////////////////////////////////////////////////////////////////
// Updated attempts at perceptually uniform color spaces
// Formulas and constants taken from
// M.R. Luo and C. Li. "CIECAM02 and Its Recent Developments"
var altCam02Coef = {
  lcd: {k_l: 0.77, c1: 0.007, c2:0.0053},
  scd: {k_l: 1.24, c1: 0.007, c2:0.0363},
  ucs: {k_l: 1.00, c1: 0.007, c2:0.0228}
};

function jabConvert(o) {
  if(o instanceof Jab) {
    return new Jab(o.J, o.a, o.b, o.opacity);
  }

  if (!(o instanceof d3Color.rgb)) o = d3Color.rgb(o);

  var xyz = rgb2xyz(o.r, o.g, o.b),
      lmsConeResponses = xyz2cat02(xyz.x,xyz.y,xyz.z),
      cam02 = cat022cam02(lmsConeResponses.l, lmsConeResponses.m, lmsConeResponses.s);

  var coefs = altCam02Coef.ucs;

  var JPrime = ((1.0 + 100.0*coefs.c1) * cam02.J) / (1.0 + coefs.c1 * cam02.J);
  JPrime = JPrime / coefs.k_l;

  var MPrime = (1.0/coefs.c2) * Math.log(1.0 + coefs.c2*cam02.M); // log=ln

  var a = MPrime * Math.cos(deg2rad*cam02.h),
      b = MPrime * Math.sin(deg2rad*cam02.h);

  return new Jab(JPrime, a, b, o.opacity);
}


// DE color distance function generator for the three CAM02 perceptually uniform
// models: lcd, scd, and ucs
function cam02de(coefs) {
  return function(o) {
    if (!(o instanceof Jab)) o = jabConvert(o);

    var k_l = coefs.k_l,
        diffJ = Math.abs(this.J - o.J),
        diffA = Math.abs(this.a - o.a),
        diffB = Math.abs(this.b - o.b);

    var de = Math.sqrt( (diffJ/k_l)*(diffJ/k_l) + diffA*diffA + diffB*diffB );

    return de;
  };
}


function jab(J, a, b, opacity) {
  opacity = opacity == null ? 1 : opacity;
  return arguments.length === 1 ? jabConvert(J) :
      new Jab(J, a, b, opacity);
}

function Jab(J, a, b, opacity) {
  this.J = J;
  this.a = a;
  this.b = b;
  this.opacity = opacity;
}


var jabPrototype = Jab.prototype = jab.prototype = Object.create(d3Color.color.prototype);
jabPrototype.constructor = JCh;

jabPrototype.brighter = function(k) {
  return new Jab(this.J + Kn * (k === null ? 1 : k), this.a, this.b,
      this.opacity);
};

jabPrototype.darker = function(k) {
  return new Jab(this.J - Kn * (k === null ? 1 : k), this.a, this.b,
      this.opacity);
};

jabPrototype.rgb = function() {
  var coefs = altCam02Coef.ucs;

  var J = this.J, a = this.a, b = this.b;
  // Get the new M using trigonomic identities
  // MPrime = (1.0/coefs.c2) * Math.log(1.0 + coefs.c2*cam02.M); // log=ln
  // var a = MPrime * Math.cos(o.h),
  //     b = MPrime * Math.sin(o.h);
  // x*x = (x*cos(y))*(x(cos(y))) + (x*sin(y))*(x(sin(y)))
  var newMPrime = Math.sqrt(a*a + b*b),
      newM = (Math.exp(newMPrime * coefs.c2) - 1.0) / coefs.c2;

  var newh = rad2deg*Math.atan2(b,a);
  if(newh < 0) newh = 360.0 + newh;

  // M = C * Math.pow(CIECAM02_VC.fl, 0.25);
  // C = M / Math.pow(CIECAM02_VC.fl, 0.25);
  var newC = newM / Math.pow(CIECAM02_VC.fl, 0.25);

  // Last, derive the new Cam02J
  // JPrime = ((1.0 + 100.0*coefs.c1) * cam02.J) / (1.0 + coefs.c1 * cam02.J)
  // simplified: var cam02J = JPrime / (1.0 + coefs.c1*(100.0 - JPrime));
  // if v = (d*x) / (b + a*x), x = (b*(v/d)) / (1 - a(v/d))
  var newCam02J = J / (1.0 + coefs.c1*(100.0 - J));

  var converted = cam022rgb(newCam02J, newC, newh);

  return d3Color.rgb(converted.r, converted.g, converted.b, this.opacity);
};

jabPrototype.de = cam02de(altCam02Coef.ucs);


function interpolateJab(start, end) {
  // constant, linear, and colorInterpolate are taken from d3-interpolate
  // the colorInterpolate function is `nogamma` in the d3-interpolate's color.js
  function constant(x) { return function() { return x; } }
  function linear(a, d) { return function(t) { return a + t * d; }; }
  function colorInterpolate(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant(isNaN(a) ? b : a);
  }

  start = jabConvert(start);
  end = jabConvert(end);

  // TODO import color function from d3-interpolate
  var J = colorInterpolate(start.J, end.J),
      a = colorInterpolate(start.a, end.a),
      b = colorInterpolate(start.b, end.b),
      opacity = colorInterpolate(start.opacity, end.opacity);

  return function(t) {
    start.J = J(t);
    start.a = a(t);
    start.b = b(t);
    start.opacity = opacity(t);
    return start + "";
  };
}

exports.jch = jch;
exports.jab = jab;
exports.interpolateJab = interpolateJab;

Object.defineProperty(exports, '__esModule', { value: true });

})));