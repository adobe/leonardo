// https://d3js.org/d3-hsluv/ Version 0.1.2. Copyright 2018 Sam Petulla.
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-color')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3-color'], factory) :
	(factory((global.d3 = global.d3 || {}),global.d3));
}(this, (function (exports,d3Color) { 'use strict';

var m = [[3.240969941904521,-1.537383177570093,-0.498610760293],[-0.96924363628087,1.87596750150772,0.041555057407175],[0.055630079696993,-0.20397695888897,1.056971514242878]];
var minv = [[0.41239079926595,0.35758433938387,0.18048078840183],[0.21263900587151,0.71516867876775,0.072192315360733],[0.019330818715591,0.11919477979462,0.95053215224966]];
var refY = 1.0;
var refU = 0.19783000664283;
var refV = 0.46831999493879;
var kappa = 903.2962962;
var epsilon = 0.0088564516;
var darker = 0.7;
var brighter = 1 / darker;

var constant = function(x) {
  return function() {
    return x;
  };
};

function lengthOfRayUntilIntersect(theta,line) {
  return line.intercept / (Math.sin(theta) - line.slope * Math.cos(theta));
}

function yToL(Y) {
  if(Y <= epsilon) return Y / refY * kappa; else return 116 * Math.pow(Y / refY,0.333333333333333315) - 16;
}

function lToY(L) {
    if(L <= 8) return refY * L / kappa; else return refY * Math.pow((L + 16) / 116,3);
}

function getBounds(L) {
  var result = [];
  var sub1 = Math.pow(L + 16,3) / 1560896;
  var sub2;
  if(sub1 > epsilon) sub2 = sub1; else sub2 = L / kappa;
  var _g = 0;
  while(_g < 3) {
    var c = _g++;
    var m1 = m[c][0];
    var m2 = m[c][1];
    var m3 = m[c][2];
    var _g1 = 0;
    while(_g1 < 2) {
      var t = _g1++;
      var top1 = (284517 * m1 - 94839 * m3) * sub2;
      var top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 769860 * t * L;
      var bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;
      result.push({ slope : top1 / bottom, intercept : top2 / bottom});
    }
  }
  return result;
}

function maxChromaForLH(L,H) {
  var hrad = H / 360 * Math.PI * 2;
  var bounds = getBounds(L);
  var min = 1.7976931348623157e+308;
  var _g = 0;
  while(_g < bounds.length) {
    var bound = bounds[_g];
    ++_g;
    var length = lengthOfRayUntilIntersect(hrad,bound);
    if(length >= 0) min = Math.min(min,length);
  }
  return min;
}

function dotProduct(a,b) {
  var sum = 0;
  var _g1 = 0;
  var _g = a.length;
  while(_g1 < _g) {
    var i = _g1++;
    sum += a[i] * b[i];
  }
  return sum;
}

function toLinear(c) {
  if(c > 0.04045) return Math.pow((c + 0.055) / 1.055,2.4); else return c / 12.92;
}

function fromLinear(c) {
    if(c <= 0.0031308) return 12.92 * c; else return 1.055 * Math.pow(c,0.416666666666666685) - 0.055;
}

function luvToXyz(tuple) {
  var L = tuple[0];
  var U = tuple[1];
  var V = tuple[2];
  if(L == 0) return [0,0,0];
  var varU = U / (13 * L) + refU;
  var varV = V / (13 * L) + refV;
  var Y = lToY(L);
  var X = 0 - 9 * Y * varU / ((varU - 4) * varV - varU * varV);
  var Z = (9 * Y - 15 * varV * Y - varV * X) / (3 * varV);
  return [X,Y,Z];
}

function lchToLuv (tuple) {
  var L = tuple[0];
  var C = tuple[1];
  var H = tuple[2];
  var Hrad = H / 360 * 2 * Math.PI;
  var U = Math.cos(Hrad) * C;
  var V = Math.sin(Hrad) * C;
  return [L,U,V];
}

function hsluvToLch (tuple) {
  var H = tuple[0];
  var S = tuple[1];
  var L = tuple[2];
  if(L > 99.9999999) return [100,0,H];
  if(L < 0.00000001) return [0,0,H];
  var max = maxChromaForLH(L,H);
  var C = max / 100 * S;
  return [L,C,H];
}

function lchToHsluv(tuple) {
  var L = tuple[0];
  var C = tuple[1];
  var H = tuple[2];
  if(L > 99.9999999) return {l:H,u:0,v:100};
  if(L < 0.00000001) return {l:H,u:0,v:0};
  var max = maxChromaForLH(L,H);
  var S = C / max * 100;
  return {l:H,u:S,v:L};
}

function luvToLch(tuple) {
  var L = tuple[0];
  var U = tuple[1];
  var V = tuple[2];
  var C = Math.sqrt(U * U + V * V);
  var H;
  if(C < 0.00000001) H = 0; else {
    var Hrad = Math.atan2(V,U);
    H = Hrad * 180 / Math.PI;
    if(H < 0) H = 360 + H;
  }
  return [L,C,H];
}

function xyzToLuv(tuple) {
  var X = tuple[0];
  var Y = tuple[1];
  var Z = tuple[2];
  var divider = X + 15 * Y + 3 * Z;
  var varU = 4 * X;
  var varV = 9 * Y;
  if(divider != 0) {
    varU /= divider;
    varV /= divider;
  } else {
    varU = NaN;
    varV = NaN;
  }
  var L = yToL(Y);
  if(L == 0) return [0,0,0];
  var U = 13 * L * (varU - refU);
  var V = 13 * L * (varV - refV);
  return [L,U,V];
}

function xyzToRgb(tuple) {
  var RGB = [fromLinear(dotProduct(m[0],tuple)),fromLinear(dotProduct(m[1],tuple)),fromLinear(dotProduct(m[2],tuple))];  
  return {r: RGB[0], g: RGB[1], b: RGB[2]};
}

function rgbToXyz(tuple) {
  var rgbl = [toLinear(tuple[0]),toLinear(tuple[1]),toLinear(tuple[2])];
  return [dotProduct(minv[0],rgbl), dotProduct(minv[1],rgbl),dotProduct(minv[2],rgbl)];
}

function HsluvConvert(o) {
  if (o instanceof Hsluv) return new Hsluv(o.l, o.u, o.v, o.opacity);
  if (!(o instanceof d3Color.rgb)) o = d3Color.rgb(o);

  var oRGB = lchToHsluv(luvToLch(xyzToLuv(rgbToXyz([o.r/255,o.g/255,o.b/255]))));
    
  var l = oRGB.l.toPrecision(7),
      u = oRGB.u.toPrecision(7),
      v = oRGB.v.toPrecision(7);

  return new Hsluv(l,u,v, o.opacity);
}

function hsluv(l, u, v, opacity) {
  return arguments.length === 1 ? HsluvConvert(l) : new Hsluv(l, u, v, opacity == null ? 1 : opacity);
}

function Hsluv(l, u, v, opacity) {
  this.l = +l;
  this.u = +u;
  this.v = +v;
  this.opacity = +opacity;
}

var hsluvPrototype = Hsluv.prototype = hsluv.prototype = Object.create(d3Color.color.prototype);

hsluvPrototype.constructor = Hsluv;

hsluvPrototype.brighter = function(k) {
  k = k == null ? brighter : Math.pow(brighter, k);
  return new Hsluv(this.l, this.u, this.v * k, this.opacity);
};

hsluvPrototype.darker = function(k) {
  k = k == null ? darker : Math.pow(darker, k);
  return new Hsluv(this.l, this.u, this.v * k, this.opacity);
};

hsluvPrototype.rgb = function() {
  var L = isNaN(this.l) ? 0 : this.l,
      U = isNaN(this.u) ? 0 : this.u,
      V = isNaN(this.v) ? 0 : this.v,
      a = this.opacity,
      o = xyzToRgb(luvToXyz(lchToLuv((hsluvToLch([L,U,V]))))),
      r = o.r,
      g = o.g,
      b = o.b;

      return hsluv2rgb(r,g,b,a);
};

hsluvPrototype.displayable = function() {
  return (0 <= this.l && this.l <= 360 || isNaN(this.l))
      && (0 <= this.u && this.u <= 100)
      && (0 <= this.v && this.v <= 100)
      && (0 <= this.opacity && this.opacity <= 1);
};

function hsluv2rgb(r, g, b, a) {
  return d3Color.rgb(r * 255, g * 255, b * 255, a || 1);
}

function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function hue(a, b) {
  var d = b - a;
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a);
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant(isNaN(a) ? b : a);
}

function hsluv$1(hue$$1) {
	return function(start, end) {
		var l = hue$$1((start = hsluv(start)).l, (end = hsluv(end)).l),
				u = nogamma(start.u, end.u),
				v = nogamma(start.v, end.v),
				opacity = nogamma(start.opacity, end.opacity);
		return function(t) {
			start.l = l(t);
			start.u = u(t);
			start.v = v(t);
			start.opacity = opacity(t);
			return start + "";
		};
	}
}

var interpolateHsluv$$1 = hsluv$1(hue);
var hsluvLong = hsluv$1(nogamma);

exports.hsluv = hsluv;
exports.interpolateHsluv = interpolateHsluv$$1;
exports.interpolateHsluvLong = hsluvLong;

Object.defineProperty(exports, '__esModule', { value: true });

})));
