// import * as d3 from 'd3';

// // Import d3 plugins and add them to the d3 namespace
// import * as d3cam02 from 'd3-cam02';
// import * as d3hsluv from 'd3-hsluv';
// import * as d3hsv from 'd3-hsv';
// import * as d33d from 'd3-3d';
// Object.assign(d3, d3cam02, d3hsluv, d3hsv, d33d);

// module.exports = {d3};

/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const d3 = require('d3');
const d3cam02 = require('d3-cam02');
const d3hsluv = require('d3-hsluv');
const d3hsv = require('d3-hsv');

const d3plus = {
  ...d3,
  ...d3cam02,
  ...d3hsluv,
  ...d3hsv
};

d3plus.interpolateJch = (start, end) => {
  // constant, linear, and colorInterpolate are taken from d3-interpolate
  // the colorInterpolate function is `nogamma` in the d3-interpolate's color.js
  const constant = (x) => () => x;
  const linear = (a, d) => (t) => a + t * d;
  const colorInterpolate = (a, b) => {
    const d = b - a;
    return d ? linear(a, d) : constant(isNaN(a) ? b : a);
  };

  start = d3plus.jch(start);
  end = d3plus.jch(end);

  const zero = Math.abs(start.h - end.h);
  const plus = Math.abs(start.h - (end.h + 360));
  const minus = Math.abs(start.h - (end.h - 360));
  if (plus < zero && plus < minus) {
    end.h += 360;
  }
  if (minus < zero && minus < plus) {
    end.h -= 360;
  }

  const startc = d3.hcl(start + '').c;
  const endc = d3.hcl(end + '').c;
  if (!startc) {
    start.h = end.h;
  }
  if (!endc) {
    end.h = start.h;
  }

  const J = colorInterpolate(start.J, end.J),
    C = colorInterpolate(start.C, end.C),
    h = colorInterpolate(start.h, end.h),
    opacity = colorInterpolate(start.opacity, end.opacity);

  return (t) => {
    start.J = J(t);
    start.C = C(t);
    start.h = h(t);
    start.opacity = opacity(t);
    return start + '';
  };
};

module.exports = d3plus;
