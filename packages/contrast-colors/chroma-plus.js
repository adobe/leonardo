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
// console.ramp(chroma.scale(['yellow', 'navy']).mode('hsluv'))
con.ramp = (scale) => {
  const canvas = document.createElement('canvas');
  const n = 200;
  canvas.setAttribute('width', n);
  canvas.setAttribute('height', 1);
  let context;
  try {
    context = canvas.getContext('2d');
  } catch (e) {
    // Not browser environment
  }
  if (context) {
    canvas.style.width = `${n}px`;
    canvas.style.height = '16px';
    canvas.style.position = 'absolute';
    // canvas.style.imageRendering = "-moz-crisp-edges";
    // canvas.style.imageRendering = "pixelated";
    for (let i = 0; i < n; ++i) {
      context.fillStyle = chromajs(scale(i / (n - 1))).hex();
      context.fillRect(i, 0, 1, 1);
    }
    const url = canvas.toDataURL();
    con.log('%c ', `font-size: 1px;line-height: 16px;background-image: url(${url});padding: 0 0 0 ${n - 1}px; border-radius: 2px;`);
  }
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
    if (mode === 'hsluv') {
      if (typeof col1 !== 'object') col1 = new chroma.Color(col1);
      if (typeof col2 !== 'object') col2 = new chroma.Color(col2);
      const xyz1 = RGB2[mode](col1.gl());
      const xyz2 = RGB2[mode](col2.gl());
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
      const X = lerpH(xyz1[0], xyz2[0], f);
      const Y = xyz1[1] + (xyz2[1] - xyz1[1]) * f;
      const Z = xyz1[2] + (xyz2[2] - xyz1[2]) * f;
      return chroma[mode](X, Y, Z).alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
    }
    if (RGB2[mode]) {
      if (typeof col1 !== 'object') col1 = new chroma.Color(col1);
      if (typeof col2 !== 'object') col2 = new chroma.Color(col2);
      const xyz1 = RGB2[mode](col1.gl());
      const xyz2 = RGB2[mode](col2.gl());
      const X = xyz1[0] + (xyz2[0] - xyz1[0]) * f;
      const Y = xyz1[1] + (xyz2[1] - xyz1[1]) * f;
      const Z = xyz1[2] + (xyz2[2] - xyz1[2]) * f;
      return chroma[mode](X, Y, Z).alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
    }
    return oldInterpol(col1, col2, f, mode);
  };
};
