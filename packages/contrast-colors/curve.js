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

const base3 = (t, p1, p2, p3, p4) => {
  const t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4;
  const t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
  return t * t2 - 3 * p1 + 3 * p2;
};

const bezlen = (x1, y1, x2, y2, x3, y3, x4, y4, z) => {
  if (z == null) {
    z = 1;
  }
  z = Math.max(0, Math.min(z, 1));
  const z2 = z / 2;
  const n = 12;
  const Tvalues = [-.1252, .1252, -.3678, .3678, -.5873, .5873, -.7699, .7699, -.9041, .9041, -.9816, .9816];
  const Cvalues = [0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069, 0.1069, 0.0472, 0.0472];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const ct = z2 * Tvalues[i] + z2;
    const xbase = base3(ct, x1, x2, x3, x4);
    const ybase = base3(ct, y1, y2, y3, y4);
    const comb = xbase * xbase + ybase * ybase;
    sum += Cvalues[i] * Math.sqrt(comb);
  }
  return z2 * sum;
};
exports.bezlen = bezlen;

const findDotsAtSegment = (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) => {
  const t1 = 1 - t;
  const t12 = t1 * t1;
  const t13 = t12 * t1;
  const t2 = t * t;
  const t3 = t2 * t;
  const x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x;
  const y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y;
  return { x, y };
};
exports.findDotsAtSegment = findDotsAtSegment;

exports.catmullRom2bezier = (crp, z) => {
  const d = [];
  let end = { x: +crp[0], y: +crp[1] };
  for (let i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
    const p = [
      { x: +crp[i - 2], y: +crp[i - 1] },
      { x: +crp[i], y: +crp[i + 1] },
      { x: +crp[i + 2], y: +crp[i + 3] },
      { x: +crp[i + 4], y: +crp[i + 5] },
    ];
    if (z) {
      if (!i) {
        p[0] = { x: +crp[iLen - 2], y: +crp[iLen - 1] };
      } else if (iLen - 4 === i) {
        p[3] = { x: +crp[0], y: +crp[1] };
      } else if (iLen - 2 === i) {
        p[2] = { x: +crp[0], y: +crp[1] };
        p[3] = { x: +crp[2], y: +crp[3] };
      }
    } else if (iLen - 4 === i) {
      p[3] = p[2];
    } else if (!i) {
      p[0] = { x: +crp[i], y: +crp[i + 1] };
    }
    d.push([
      end.x,
      end.y,
      (-p[0].x + 6 * p[1].x + p[2].x) / 6,
      (-p[0].y + 6 * p[1].y + p[2].y) / 6,
      (p[1].x + 6 * p[2].x - p[3].x) / 6,
      (p[1].y + 6 * p[2].y - p[3].y) / 6,
      p[2].x,
      p[2].y,
    ]);
    end = p[2];
  }

  return d;
};

const bezlen2 = (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) => {
  const n = 5;
  let x0 = p1x;
  let y0 = p1y;
  let len = 0;
  for (let i = 1; i < n; i++) {
    const { x, y } = findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i / n);
    len += Math.hypot(x - x0, y - y0);
    x0 = x;
    y0 = y;
  }
  len += Math.hypot(p2x - x0, p2y - y0);
  return len;
};

exports.prepareCurve = (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) => {
  const len = Math.floor(bezlen2(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) * .75);
  const map = new Map();
  for (let i = 0; i <= len; i++) {
    const t = i / len;
    map.set(t, findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t));
  }
  return (x) => {
    const keys = Array.from(map.keys());
    let p = map.get(keys[0]);
    const last = map.get(keys[keys.length - 1]);
    if (x < p.x || x > last.x) {
      return null;
    }
    for (let i = 0; i < keys.length; i++) {
      const value = map.get(keys[i]);
      if (value.x >= x) {
        const x1 = p.x;
        const x2 = value.x;
        const y1 = p.y;
        const y2 = value.y;
        if (!i) {
          return y2;
        }
        return ((x - x1) * (y2 - y1)) / (x2 - x1) + y1;
      }
      p = value;
    }
  };
};
