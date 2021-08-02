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

/* Ported from https://observablehq.com/@mbostock/ciecam02 */
const π = Math.PI;
const CIECAM02_la = (64 / π) / 5;
const CIECAM02_yb = 20;
const CIECAM02_f = 1;
const CIECAM02_c = 0.69;
const CIECAM02_nc = 1;
const D65_XYZ = [95.047, 100, 108.883];
const D65_Y = D65_XYZ[1];
const CIECAM02_n = CIECAM02_yb / D65_Y;
const CIECAM02_z = 1.48 + CIECAM02_n ** .5;
const CIECAM02_k = 1 / ((5 * CIECAM02_la) + 1);
const CIECAM02_d = CIECAM02_f * (1 - (1 / 3.6) * Math.exp((-CIECAM02_la - 42) / 92));
const CIECAM02_fl = (0.2 * (CIECAM02_k ** 4) * (5 * CIECAM02_la)) + 0.1 * ((1 - (CIECAM02_k ** 4)) ** 2) * ((5 * CIECAM02_la) ** 1 / 3);
const CIECAM02_nbb = 0.725 * ((1 / CIECAM02_n) ** 0.2);
const CIECAM02_ncb = CIECAM02_nbb;
const xyz_cat02 = ([x, y, z]) => [
  (0.7328 * x) + (0.4296 * y) - (0.1624 * z),
  (-0.7036 * x) + (1.6975 * y) + (0.0061 * z),
  (0.0030 * x) + (0.0136 * y) + (0.9834 * z),
];
const cat02_xyz = ([l, m, s]) => [
  (1.096124 * l) - (0.278869 * m) + (0.182745 * s),
  (0.454369 * l) + (0.473533 * m) + (0.072098 * s),
  (-0.009628 * l) - (0.005698 * m) + (1.015326 * s),
];
const cat02_hpe = ([l, m, s]) => [
  (0.7409792 * l) + (0.2180250 * m) + (0.0410058 * s),
  (0.2853532 * l) + (0.6242014 * m) + (0.0904454 * s),
  (-0.0096280 * l) - (0.0056980 * m) + (1.0153260 * s),
];
const hpe_xyz = ([l, m, s]) => [
  (1.910197 * l) - (1.112124 * m) + (0.201908 * s),
  (0.370950 * l) + (0.629054 * m) - (0.000008 * s),
  s,
];
const D65_CAT02 = xyz_cat02(D65_XYZ);
const adapt = (lms) => lms.map((c) => {
  const p = ((CIECAM02_fl * c) / 100) ** 0.42;
  return ((400 * p) / (27.13 + p)) + 0.1;
});
const invert_adapt = (lms) => lms.map((c) => (100 / CIECAM02_fl) * (((27.13 * Math.abs(c - 0.1)) / (400 - Math.abs(c - 0.1))) ** (1 / 0.42)));
const transform = (lms) => lms.map((c, i) => c * (((D65_Y * CIECAM02_d) / D65_CAT02[i]) + (1 - CIECAM02_d)));
const invert_transform = (lms) => lms.map((c, i) => c / (((D65_Y * CIECAM02_d) / D65_CAT02[i]) + (1 - CIECAM02_d)));
const CIECAM02_aw = (() => {
  const [l, m, s] = D65_CAT02;
  const lc = l * (((D65_Y * CIECAM02_d) / l) + (1 - CIECAM02_d));
  const mc = m * (((D65_Y * CIECAM02_d) / m) + (1 - CIECAM02_d));
  const sc = s * (((D65_Y * CIECAM02_d) / s) + (1 - CIECAM02_d));
  const [lpa, mpa, spa] = adapt(cat02_hpe([lc, mc, sc]));
  return (2 * lpa + mpa + 0.05 * spa - 0.305) * CIECAM02_nbb;
})();

const rgb_lrgb1 = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const rgb_lrgb = ([r, g, b]) => [rgb_lrgb1(r), rgb_lrgb1(g), rgb_lrgb1(b)];
const lrgb_rgb1 = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * (v ** (1 / 2.4)) - 0.055);
const lrgb_rgb = ([r, g, b]) => [lrgb_rgb1(r), lrgb_rgb1(g), lrgb_rgb1(b)];
const matrix_lrgb_xyzd65 = [
  0.4124564, 0.3575761, 0.1804375,
  0.2126729, 0.7151522, 0.0721750,
  0.0193339, 0.1191920, 0.9503041,
];
const matrix_xyzd65_lrgb = [
  3.2404542, -1.5371385, -0.4985314,
  -0.9692660, 1.8760108, 0.0415560,
  0.0556434, -0.2040259, 1.0572252,
];
const matrix_multiply_vector = ([
  a, b, c,
  d, e, f,
  g, h, i,
], [
  x,
  y,
  z,
]) => [
  a * x + b * y + c * z,
  d * x + e * y + f * z,
  g * x + h * y + i * z,
];

const rgb_xyz = (rgb) => matrix_multiply_vector(matrix_lrgb_xyzd65, rgb_lrgb(rgb));
const xyz_rgb = (xyz) => lrgb_rgb(matrix_multiply_vector(matrix_xyzd65_lrgb, xyz));

const aab_lms = (A, aa, bb, nbb) => {
  const x = (A / nbb) + 0.305;
  return [
    (0.32787 * x) + (0.32145 * aa) + (0.20527 * bb),
    (0.32787 * x) - (0.63507 * aa) - (0.18603 * bb),
    (0.32787 * x) - (0.15681 * aa) - (4.49038 * bb),
  ];
};
const cat02_jch = (lms) => {
  const lms_c = transform(lms);
  const lms_p = cat02_hpe(lms_c);
  const [lpa, mpa, spa] = adapt(lms_p);
  const ca = lpa - ((12 * mpa) / 11) + (spa / 11);
  const cb = (1 / 9) * (lpa + mpa - 2 * spa);
  let h = (180 / π) * Math.atan2(cb, ca);
  if (h < 0) h += 360;
  const a = (2 * lpa + mpa + 0.05 * spa - 0.305) * CIECAM02_nbb;
  const J = 100 * (a / CIECAM02_aw) ** (CIECAM02_c * CIECAM02_z);
  const et = 0.25 * (Math.cos((h * π) / 180 + 2) + 3.8);
  const t = ((50000 / 13) * CIECAM02_nc * CIECAM02_ncb * et * Math.sqrt(ca * ca + cb * cb)) / (lpa + mpa + (21 / 20) * spa);
  const C = (t ** 0.9) * Math.sqrt(J / 100) * ((1.64 - (0.29 ** CIECAM02_n)) ** 0.73);
  return [J, C, h];
};
const jch_cat02 = ([J, C, h]) => {
  const t = (C / (Math.sqrt(J / 100) * ((1.64 - (0.29 ** CIECAM02_n)) ** 0.73))) ** (1 / 0.9);
  const et = (1 / 4) * (Math.cos(((h * π) / 180) + 2) + 3.8);
  const a = (J / 100) ** (1 / (CIECAM02_c * CIECAM02_z)) * CIECAM02_aw;
  const p1 = (((50000 / 13) * CIECAM02_nc * CIECAM02_ncb) * et) / t;
  const p2 = (a / CIECAM02_nbb) + 0.305;
  const p3 = 21 / 20;
  let ca;
  let cb;
  const hr = (h * π) / 180;
  const sr = Math.sin(hr);
  const cr = Math.cos(hr);
  if (Math.abs(sr) >= Math.abs(cr)) {
    cb = (p2 * (2 + p3) * (460 / 1403)) / (p1 / sr + (2 + p3) * (220 / 1403) * (Math.cos(hr) / Math.sin(hr)) - (27 / 1403) + p3 * (6300 / 1403));
    ca = cb * (Math.cos(hr) / Math.sin(hr));
  } else {
    ca = (p2 * (2 + p3) * (460 / 1403)) / (p1 / cr + (2 + p3) * (220 / 1403) - ((27 / 1403) - p3 * (6300 / 1403)) * (Math.sin(hr) / Math.cos(hr)));
    cb = ca * (Math.sin(hr) / Math.cos(hr));
  }
  const lms_a = aab_lms(a, ca, cb, CIECAM02_nbb);
  const lms_p = invert_adapt(lms_a);
  const txyz = hpe_xyz(lms_p);
  const lms_c = xyz_cat02(txyz);
  return invert_transform(lms_c);
};

exports.rgb2jch = (rgb) => cat02_jch(xyz_cat02(rgb_xyz(rgb)));
exports.rgb2cat = (rgb) => xyz_cat02(rgb_xyz(rgb));
exports.jch2rgb = (jch) => xyz_rgb(cat02_xyz(jch_cat02(jch)));
exports.cat2rgb = (cat) => xyz_rgb(cat02_xyz(cat));
