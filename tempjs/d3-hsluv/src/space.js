import {m, minv, refU, refV} from './constant';
import {fromLinear, toLinear, dotProduct, lToY, yToL, maxChromaForLH} from './helpers';

export function luvToXyz(tuple) {
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

export function lchToLuv (tuple) {
  var L = tuple[0];
  var C = tuple[1];
  var H = tuple[2];
  var Hrad = H / 360 * 2 * Math.PI;
  var U = Math.cos(Hrad) * C;
  var V = Math.sin(Hrad) * C;
  return [L,U,V];
}

export function hsluvToLch (tuple) {
  var H = tuple[0];
  var S = tuple[1];
  var L = tuple[2];
  if(L > 99.9999999) return [100,0,H];
  if(L < 0.00000001) return [0,0,H];
  var max = maxChromaForLH(L,H);
  var C = max / 100 * S;
  return [L,C,H];
}

export function lchToHsluv(tuple) {
  var L = tuple[0];
  var C = tuple[1];
  var H = tuple[2];
  if(L > 99.9999999) return {l:H,u:0,v:100};
  if(L < 0.00000001) return {l:H,u:0,v:0};
  var max = maxChromaForLH(L,H);
  var S = C / max * 100;
  return {l:H,u:S,v:L};
}

export function luvToLch(tuple) {
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

export function xyzToLuv(tuple) {
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

export function xyzToRgb(tuple) {
  var RGB = [fromLinear(dotProduct(m[0],tuple)),fromLinear(dotProduct(m[1],tuple)),fromLinear(dotProduct(m[2],tuple))];  
  return {r: RGB[0], g: RGB[1], b: RGB[2]};
}

export function rgbToXyz(tuple) {
  var rgbl = [toLinear(tuple[0]),toLinear(tuple[1]),toLinear(tuple[2])];
  return [dotProduct(minv[0],rgbl), dotProduct(minv[1],rgbl),dotProduct(minv[2],rgbl)];
}
