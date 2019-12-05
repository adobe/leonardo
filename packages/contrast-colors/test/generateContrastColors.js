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

import test from 'ava';
import { generateContrastColors } from '../index.js';
// Test simple generation in all color spaces
test('should generate 2 colors (CAM02 interpolation)', function(t) {
  let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'CAM02'});;

  t.deepEqual(
    colors,
    [ '#5490e0', '#2c66f1' ]
  );

});
test('should generate 2 colors (LAB interpolation)', function(t) {
  let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'LAB'});;

  t.deepEqual(
    colors,
    [ '#7383ff', '#435eff' ]
  );
});
test('should generate 2 colors (LCH interpolation)', function(t) {
  let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'LCH'});;

  t.deepEqual(
    colors,
    [ '#008fff', '#0065ff' ]
  );
});
test('should generate 2 colors (HSL interpolation)', function(t) {
  let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'HSL'});;

  t.deepEqual(
    colors,
    [ '#478cfe', '#2d62ff' ]
  );
});
test('should generate 2 colors (HSLuv interpolation)', function(t) {
  let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'HSLuv'});;

  t.deepEqual(
    colors,
    [ '#1896dc', '#066aea' ]
  );
});
test('should generate 2 colors (HSV interpolation)', function(t) {
  let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'HSV'});;

  t.deepEqual(
    colors,
    [ '#478cff', '#2d62ff' ]
  );
});
test('should generate 2 colors (RGB interpolation)', function(t) {
  let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'RGB'});;

  t.deepEqual(
    colors,
    [ '#5988ff', '#3360ff' ]
  );
});

test('should generate 2 colors on dark background', function(t) {
  let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: "#323232",ratios: [3, 4.5], colorspace: "LCH"}); // positive & negative ratios

  t.deepEqual(
    colors,
    [ '#0074ff', '#009fff' ]
  );
});

// Check bidirectionality of contrast ratios (positive vs negative)
test('should generate 2 colors with bidirectional contrast (light background)', function(t) {
  let colors = generateContrastColors({colorKeys: ["#012676"], base: "#D8D8D8",ratios: [-1.25,4.5], colorspace: "LCH"}); // positive & negative ratios

  t.deepEqual(
    colors,
    [ '#efeff6', '#56599a' ]
  );
});
test('should generate 2 colors with bidirectional contrast (dark background)', function(t) {
  let colors = generateContrastColors({colorKeys: ["#012676"], base: "#323232",ratios: [-1.25,4.5], colorspace: "LCH"}); // positive & negative ratios

  t.deepEqual(
    colors,
    [ '#101c51', '#9695c0' ]
  );
});

test('should generate no colors, missing colorKeys', function(t) {
  t.throws(
    () => {
      let colors = generateContrastColors({base: '#f5f5f5', ratios: [3, 4.5]}) // no key colors
    }
  );
});

test('should generate no colors, missing ratios', function(t) {

  t.throws(
    () => {
      let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5'}) // no ratios
    }
  );
});

test('should generate no colors, missing base', function(t) {
  t.throws(
    () => {
      let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5]}) // no base
    }
  );
});
