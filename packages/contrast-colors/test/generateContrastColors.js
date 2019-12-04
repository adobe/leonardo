/*
Copyright 2018 Adobe. All rights reserved.
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

test('should generate 2 colors', function(t) {
  let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'RGB'});;

  t.deepEqual(
    colors,
    [ '#5988ff', '#3360ff' ]
  );
});

test('should generate 2 colors with bidirectional contrast', function(t) {
  let colors = generateContrastColors({colorKeys: ["#0000ff"], base: "#323232",ratios: [-1.25,4.5], colorspace: "LCH"}); // positive & negative ratios

  t.deepEqual(
    colors,
    [ '#201062', '#a983ff' ]
  );
});

test('should generate no colors, missing colorKeys', function(t) {
  t.throws(
    () => {
      let colors = generateContrastColors({base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'RGB'}) // no key colors
    }
  );
});

test('should generate no colors, missing ratios', function(t) {

  t.throws(
    () => {
      let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', colorspace: 'RGB'}) // no ratios
    }
  );
});

test('should generate no colors, missing base', function(t) {
  t.throws(
    () => {
      let colors = generateContrastColors({colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5], colorspace: 'RGB'}) // no base
    }
  );
});
