import {m, refY, kappa, epsilon} from './constant';

export function lengthOfRayUntilIntersect(theta,line) {
  return line.intercept / (Math.sin(theta) - line.slope * Math.cos(theta));
}

export function yToL(Y) {
  if(Y <= epsilon) return Y / refY * kappa; else return 116 * Math.pow(Y / refY,0.333333333333333315) - 16;
}

export function lToY(L) {
    if(L <= 8) return refY * L / kappa; else return refY * Math.pow((L + 16) / 116,3);
}

export function getBounds(L) {
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

export function maxChromaForLH(L,H) {
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

export function dotProduct(a,b) {
  var sum = 0;
  var _g1 = 0;
  var _g = a.length;
  while(_g1 < _g) {
    var i = _g1++;
    sum += a[i] * b[i];
  }
  return sum;
}

export function toLinear(c) {
  if(c > 0.04045) return Math.pow((c + 0.055) / 1.055,2.4); else return c / 12.92;
}

export function fromLinear(c) {
    if(c <= 0.0031308) return 12.92 * c; else return 1.055 * Math.pow(c,0.416666666666666685) - 0.055;
}