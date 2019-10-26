import {color, rgb} from "d3-color";
import {xyzToLuv, rgbToXyz, lchToHsluv, luvToLch, xyzToRgb, luvToXyz, lchToLuv, hsluvToLch} from "./space";
import {brighter, darker} from './constant';

function HsluvConvert(o) {
  if (o instanceof Hsluv) return new Hsluv(o.l, o.u, o.v, o.opacity);
  if (!(o instanceof rgb)) o = rgb(o);

  var oRGB = lchToHsluv(luvToLch(xyzToLuv(rgbToXyz([o.r/255,o.g/255,o.b/255]))));
    
  var l = oRGB.l.toPrecision(7),
      u = oRGB.u.toPrecision(7),
      v = oRGB.v.toPrecision(7);

  return new Hsluv(l,u,v, o.opacity);
}

export default function hsluv(l, u, v, opacity) {
  return arguments.length === 1 ? HsluvConvert(l) : new Hsluv(l, u, v, opacity == null ? 1 : opacity);
}

export function Hsluv(l, u, v, opacity) {
  this.l = +l;
  this.u = +u;
  this.v = +v;
  this.opacity = +opacity;
}

var hsluvPrototype = Hsluv.prototype = hsluv.prototype = Object.create(color.prototype);

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
  return rgb(r * 255, g * 255, b * 255, a || 1);
}
