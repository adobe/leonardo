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

const chromajs = require('chroma-js');
const hsluv = require('hsluv');
const ciebase = require('ciebase');
const ciecam02 = require('ciecam02');

const cam = ciecam02.cam({
  whitePoint: ciebase.illuminant.D65,
  adaptingLuminance: 40,
  backgroundLuminance: 20,
  surroundType: 'average',
  discounting: false,
}, ciecam02.cfs('JCh'));

const xyz = ciebase.xyz(ciebase.workspace.sRGB, ciebase.illuminant.D65);
const jch2rgb = (jch) => xyz.toRgb(cam.toXyz({ J: jch[0], C: jch[1], h: jch[2] }));
const rgb2jch = (rgb) => {
  const jch = cam.fromXyz(xyz.fromRgb(rgb));
  return [jch.J, jch.C, jch.h];
};
const [jch2jab, jab2jch] = (() => {
  const coefs = { k_l: 1, c1: 0.007, c2: 0.0228 };
  const π = Math.PI;
  const CIECAM02_la = (64 / π) / 5;
  const CIECAM02_k = 1 / ((5 * CIECAM02_la) + 1);
  const CIECAM02_fl = (0.2 * (CIECAM02_k ** 4) * (5 * CIECAM02_la)) + 0.1 * ((1 - (CIECAM02_k ** 4)) ** 2) * ((5 * CIECAM02_la) ** (1 / 3));
  return [(jch) => {
    const [J, C, h] = jch;
    const M = C * (CIECAM02_fl ** 0.25);
    let j = ((1 + 100 * coefs.c1) * J) / (1 + coefs.c1 * J);
    j /= coefs.k_l;
    const MPrime = (1 / coefs.c2) * Math.log(1.0 + coefs.c2 * M);
    const a = MPrime * Math.cos(h * (π / 180));
    const b = MPrime * Math.sin(h * (π / 180));
    return [j, a, b];
  }, (jab) => {
    const [j, a, b] = jab;
    const newMPrime = Math.sqrt(a * a + b * b);
    const newM = (Math.exp(newMPrime * coefs.c2) - 1) / coefs.c2;
    const h = ((180 / π) * Math.atan2(b, a) + 360) % 360;
    const C = newM / (CIECAM02_fl ** 0.25);
    const J = j / (1 + coefs.c1 * (100 - j));
    return [J, C, h];
  }];
})();

const jab2rgb = (jab) => jch2rgb(jab2jch(jab));
const rgb2jab = (rgb) => jch2jab(rgb2jch(rgb));

const con = console;

// Usage:
// console.color('rebeccapurple');
con.color = (color, text = '') => {
  const col = chromajs(color);
  const l = col.luminance();
  con.log(`%c${color} ${text}`, `background-color: ${color};padding: 5px; border-radius: 5px; color: ${l > .5 ? '#000' : '#fff'}`);
};

// Usage:
// console.ramp(chroma.scale(['yellow', 'navy']).mode('hsluv'));
// console.ramp(scale, 3000); // if you need to specify the length of the scale
con.ramp = (scale, length = 1) => {
  con.log('%c ', `font-size: 1px;line-height: 16px;background: ${chromajs.getCSSGradient(scale, length)};padding: 0 0 0 200px; border-radius: 2px;`);
};

const online = (x1, y1, x2, y2, x3, y3, ε = .1) => {
  if (x1 === x2 || y1 === y2) {
    return true;
  }
  const m = (y2 - y1) / (x2 - x1);
  const x4 = (y3 + x3 / m - y1 + m * x1) / (m + 1 / m);
  const y4 = y3 + x3 / m - x4 / m;
  return (x3 - x4) ** 2 + (y3 - y4) ** 2 < ε ** 2;
};

const div = (ƒ, dot1, dot2, ε) => {
  const x3 = (dot1[0] + dot2[0]) / 2;
  const y3 = ƒ(x3);
  if (online(...dot1, ...dot2, x3, y3, ε)) {
    return null;
  }
  return [x3, y3];
};

const split = (ƒ, from, to, ε = .1) => {
  const step = (to - from) / 10;
  const points = [];
  for (let i = from; i < to; i += step) {
    points.push([i, ƒ(i)]);
  }
  points.push([to, ƒ(to)]);
  for (let i = 0; i < points.length - 1; i++) {
    const dot = div(ƒ, points[i], points[i + 1], ε);
    if (dot) {
      points.splice(i + 1, 0, dot);
      i--;
    }
  }
  for (let i = 0; i < points.length - 2; i++) {
    if (online(...points[i], ...points[i + 2], ...points[i + 1], ε)) {
      points.splice(i + 1, 1);
      i--;
    }
  }
  return points;
};

const round = (x, r = 4) => Math.round(x * 10 ** r) / 10 ** r;

const getCSSGradient = (scale, length = 1, deg = 90, ε = .005) => {
  const ptsr = split((x) => scale(x).gl()[0], 0, length, ε);
  const ptsg = split((x) => scale(x).gl()[1], 0, length, ε);
  const ptsb = split((x) => scale(x).gl()[2], 0, length, ε);
  const points = Array.from(
    new Set(
      [
        ...ptsr.map((a) => round(a[0])),
        ...ptsg.map((a) => round(a[0])),
        ...ptsb.map((a) => round(a[0])),
      ].sort((a, b) => a - b),
    ),
  );
  return `linear-gradient(${deg}deg, ${points.map((x) => `${scale(x).hex()} ${round(x * 100)}%`).join()});`;
};

exports.extendChroma = (chroma) => {
  // JCH
  chroma.Color.prototype.jch = function () {
    return rgb2jch(this._rgb.slice(0, 3).map((c) => c / 255));
  };

  chroma.jch = (...args) => new chroma.Color(...jch2rgb(args).map((c) => Math.floor(c * 255)), 'rgb');

  // JAB
  chroma.Color.prototype.jab = function () {
    return rgb2jab(this._rgb.slice(0, 3).map((c) => c / 255));
  };

  chroma.jab = (...args) => new chroma.Color(...jab2rgb(args).map((c) => Math.floor(c * 255)), 'rgb');

  // HSLuv
  chroma.Color.prototype.hsluv = function () {
    return hsluv.rgbToHsluv(this._rgb.slice(0, 3).map((c) => c / 255));
  };

  chroma.hsluv = (...args) => new chroma.Color(...hsluv.hsluvToRgb(args).map((c) => Math.floor(c * 255)), 'rgb');

  const oldInterpol = chroma.interpolate;
  const RGB2 = {
    jch: rgb2jch,
    jab: rgb2jab,
    hsluv: hsluv.rgbToHsluv,
  };
  const lerpH = (a, b, t) => {
    const m = 360;
    const d = Math.abs(a - b);
    if (d > m / 2) {
      if (a > b) {
        b += m;
      } else {
        a += m;
      }
    }
    return ((1 - t) * a + t * b) % m;
  };

  chroma.interpolate = (col1, col2, f = 0.5, mode = 'lrgb') => {
    if (RGB2[mode]) {
      if (typeof col1 !== 'object') {
        col1 = new chroma.Color(col1);
      }
      if (typeof col2 !== 'object') {
        col2 = new chroma.Color(col2);
      }
      const xyz1 = RGB2[mode](col1.gl());
      const xyz2 = RGB2[mode](col2.gl());
      const grey1 = Number.isNaN(col1.hsl()[0]);
      const grey2 = Number.isNaN(col2.hsl()[0]);
      let X;
      let Y;
      let Z;
      switch (mode) {
        case 'hsluv':
          if (xyz1[1] < 1e-10) {
            xyz1[0] = xyz2[0];
          }
          if (xyz1[1] === 0) { // black or white
            xyz1[1] = xyz2[1];
          }
          if (xyz2[1] < 1e-10) {
            xyz2[0] = xyz1[0];
          }
          if (xyz2[1] === 0) { // black or white
            xyz2[1] = xyz1[1];
          }
          X = lerpH(xyz1[0], xyz2[0], f);
          Y = xyz1[1] + (xyz2[1] - xyz1[1]) * f;
          Z = xyz1[2] + (xyz2[2] - xyz1[2]) * f;
          break;
        case 'jch':
          if (grey1) {
            xyz1[2] = xyz2[2];
          }
          if (grey2) {
            xyz2[2] = xyz1[2];
          }
          X = xyz1[0] + (xyz2[0] - xyz1[0]) * f;
          Y = xyz1[1] + (xyz2[1] - xyz1[1]) * f;
          Z = lerpH(xyz1[2], xyz2[2], f);
          break;
        default:
          X = xyz1[0] + (xyz2[0] - xyz1[0]) * f;
          Y = xyz1[1] + (xyz2[1] - xyz1[1]) * f;
          Z = xyz1[2] + (xyz2[2] - xyz1[2]) * f;
      }
      return chroma[mode](X, Y, Z).alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
    }
    return oldInterpol(col1, col2, f, mode);
  };

  chroma.getCSSGradient = getCSSGradient;
};
