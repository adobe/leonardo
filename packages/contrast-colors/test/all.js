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
import { createScale, generateContrastColors } from '../index.js';

test('should generate colors', function(t) {
  let args = createScale({swatches: 8, colorKeys: ['#CCFFA9', '#FEFEC5', '#5F0198'], colorspace: 'LAB', shift: 1, fullScale: true});
  let colors = generateContrastColors({args, base: '#ffffff', ratios: [3, 4.5, 7]});

  t.deepEqual(
    colors,
    [
      '#a38ea6',
      '#9067a2',
      '#7a3e9e'
    ]
  );
});

